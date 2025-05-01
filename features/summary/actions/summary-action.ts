"use server";

import { extractPDFText } from "@/utils/extractPDFText";
import { currentUser } from "@clerk/nextjs/server";
import { ClientUploadedFileData } from "uploadthing/types";
import { generatePdfSummary } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { clerk } from "@/lib/clerk";
import { countGeminiTokens } from "@/utils/countTokens";

export const generatePDFSummaryAction = async (
  uploadResponse:
    | [
        {
          serverData: {
            userId: string;
            file: {
              url: string;
              name: string;
            };
          };
        }
      ]
    | ClientUploadedFileData<any>[]
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return {
        error: true,
        message: "Unauthorized",
      };
    }

    if (!uploadResponse) {
      return {
        error: true,
        message: "File upload failed",
        data: null,
      };
    }

    const {
      serverData: {
        uploadedBy: userId,
        file: { url, name: fileName },
      },
    } = uploadResponse[0];

    if (!url) {
      return {
        error: true,
        message: "File upload failed",
        data: null,
      };
    }

    const pdftext = await extractPDFText(url);

    const useracc = await getUserAccountByClerkId(userId);
    if (!useracc) {
      throw new Error("failed to egenerate summary");
    }

    const tokenUsage = await prisma.tokenUsage.findFirst({
      where: {
        userId: useracc.user.id,
      },
    });
    if (!tokenUsage) {
      throw new Error("failed to egenerate summary");
    }
    const TOKEN_NEED = await countGeminiTokens(pdftext);
    const { tokens: tokensLeft } = tokenUsage;
    if (tokensLeft < TOKEN_NEED) {
      return {
        error: true,
        message: `Not enough tokens you need  ${TOKEN_NEED + 50}`,
        data: null,
      };
    }

    let summary: string;
    try {
      summary = await generatePdfSummary(
        useracc.user.id,
        pdftext,
        "Sample title"
      );

      // store summary
      const summarySaveResult = await storePdfSummaryAction(
        useracc.user.id,
        summary,
        url,
        "Sample title",
        fileName,
        TOKEN_NEED
      );
      if (summarySaveResult.error || !summarySaveResult.data) {
        return {
          error: true,
          message: "File upload failed",
          data: null,
        };
      }
      return {
        error: false,
        message: "Summary has been successfully generated",
        data: summarySaveResult.data.id,
      };
    } catch (error) {
      return {
        error: true,
        message: "File upload failed",
        data: null,
      };
    }
  } catch (error) {
    return {
      error: true,
      message: "File upload failed",
      data: null,
    };
  }
};

export const storePdfSummaryAction = async (
  userId: string,
  summary: string,
  file_url: string,
  fileName: string,
  title: string,
  tokenUsage: number
) => {
  try {
    const pdfSummary = await prisma.pdfSummary.create({
      data: {
        userId: userId,
        summary: summary,
        original_file_url: file_url,
        status: "summarized",
        title: title,
        file_name: fileName,
      },
    });

    if (!pdfSummary) {
      return {
        error: false,
        message: "Server error occured please try again",
        data: null,
      };
    } else {
      await reduceTokens(userId, tokenUsage);
      return {
        error: false,
        message: "Summary has been stored",
        data: pdfSummary,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      error: true,
      message: "Error saving Summary Tray gain later",
      data: null,
    };
  }
};

export const getUserAccountByClerkId = async (clerkUserId: string) => {
  try {
    console.log("reached cler");
    if (!clerkUserId) return null;
    //  get all the emails associated with clerk account
    const user = await clerk.users.getUser(clerkUserId);

    console.log("reached 1");
    const emailAddresses = user.emailAddresses.map(
      (email) => email.emailAddress
    );

    console.log("reached 2");
    if (!emailAddresses || emailAddresses.length <= 0) {
      throw new Error("Something Went wrong");
    }

    console.log("reached 3");
    // Normalize all emails
    const normalizedEmails = emailAddresses.map((email) =>
      email.trim().toLowerCase()
    );
    console.log("reached 4");
    let userAccount;
    userAccount = await prisma.user.findFirst({
      where: { clerkUserId: clerkUserId },
      include: { UserEmail: true },
    });

    console.log("reached 5");
    const isNewUser = userAccount ? false : true;

    // Create user if doesn't exist
    if (isNewUser) {
      userAccount = await prisma.user.create({
        data: { clerkUserId: clerkUserId },
      });
    }

    console.log("reached 6");
    // Check which emails already exist in our system
    const existingUserEmails = await prisma.userEmail.findMany({
      where: {
        email: { in: normalizedEmails },
      },
    });
    console.log("reached 7");

    const existingEmailsSet = new Set(existingUserEmails.map((e) => e.email));
    const newEmails = normalizedEmails.filter(
      (email) => !existingEmailsSet.has(email)
    );

    console.log("reached 8");
    // Handle token allocation for new users
    if (isNewUser) {
      const initialTokens = existingUserEmails.length > 0 ? 0 : 5000;

      await prisma.tokenUsage.create({
        data: {
          userId: userAccount!.id,
          tokens: initialTokens,
          model: "summarizer_tokens",
        },
      });
    }

    console.log("reached 9");
    // Process all emails - create new ones and update existing
    await Promise.all(
      normalizedEmails.map(async (email) => {
        await prisma.userEmail.upsert({
          where: { email },
          create: {
            email,
            userId: userAccount!.id,
          },
          update: {
            userId: userAccount!.id, // Update ownership if email existed but wasn't linked
          },
        });
      })
    );
    return {
      success: true,
      isNewUser,
      user: userAccount!,
      newEmailsAdded: newEmails.length,
      primaryEmail: user.primaryEmailAddress?.emailAddress,
    };
  } catch (error) {
    console.log("reached 10 ", error);
    return null;
  }
};

export const testFUnction = async () => {
  await countGeminiTokens("Hola eskimo dfsdf fsdfsd sdf");
};

const reduceTokens = async (userId: string, tokenUsed: number) => {
  try {
    const tokens = await prisma.tokenUsage.findFirst({
      where: {
        userId: userId,
      },
    });

    let tokensLEft = tokens?.tokens ? tokens.tokens - tokenUsed : 0;
    tokensLEft = tokensLEft < 0 ? 0 : tokensLEft;
    const updated = await prisma.tokenUsage.update({
      where: {
        userId: userId,
      },
      data: {
        tokens: tokensLEft,
      },
    });
    return updated;
  } catch (error) {
    return null;
  }
};

// export const generateSummaryAction = async (
//   userId: string,
//   file_url: string,
//   fileName: string
// ) => {
//   try {
//     const pdftext = await extractPDFText(file_url);

//     const useracc = await getUserAccountByClerkId(userId);
//     if (!useracc) {
//       // TODO - Delete Uploaded File
//       throw new Error("failed to egenerate summary");
//     }

//     const tokenUsage = await prisma.tokenUsage.findFirst({
//       where: {
//         userId: useracc.user.id,
//       },
//     });
//     if (!tokenUsage) {
//       throw new Error("failed to egenerate summary");
//     }
//     const TOKEN_NEED = await countGeminiTokens(pdftext);
//     const { tokens: tokensLeft } = tokenUsage;
//     if (tokensLeft < TOKEN_NEED) {
//       return {
//         error: true,
//         message: `Not enough tokens you need  ${TOKEN_NEED + 50}`,
//         data: null,
//       };
//     }
//     const pdfSummary = await prisma.pdfSummary.create({
//       data: {
//         userId: userId,
//         summary: summary,
//         original_file_url: file_url,
//         status: "summarized",
//         title: title,
//         file_name: fileName,
//       },
//     });

//     if (!pdfSummary) {
//       return {
//         error: false,
//         message: "Server error occured please try again",
//       };
//     } else {
//       await reduceTokens(userId, tokenUsage);
//       return {
//         error: false,
//         message: "Summary has been stored",
//       };
//     }
//   } catch (error) {
//     return {
//       error: true,
//       message: "Error saving Summary Tray gain later",
//     };
//   }
// };
