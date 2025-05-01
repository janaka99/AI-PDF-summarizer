"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import puppeteer from "puppeteer";
import { JSDOM } from "jsdom";

/**
 * Convert HTML summary to plain text while preserving structure
 */
function htmlToText(html: string): string {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Process headings
  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  headings.forEach((heading) => {
    // Add extra newlines before headings for better spacing
    const level = Number.parseInt(heading.tagName.substring(1));
    const prefix = "\n" + "#".repeat(level) + " ";
    heading.textContent = prefix + heading.textContent;
  });

  // Process paragraphs
  const paragraphs = document.querySelectorAll("p");
  paragraphs.forEach((p) => {
    p.textContent = p.textContent + "\n\n";
  });

  // Process lists
  const listItems = document.querySelectorAll("li");
  listItems.forEach((li) => {
    li.textContent = "• " + li.textContent + "\n";
  });

  // Process blockquotes
  const blockquotes = document.querySelectorAll("blockquote");
  blockquotes.forEach((quote) => {
    const lines = quote.textContent?.split("\n") || [];
    const quotedLines = lines.map((line) => "> " + line).join("\n");
    quote.textContent = "\n" + quotedLines + "\n\n";
  });

  // Get the text content and clean up extra whitespace
  let text = document.body.textContent || "";

  // Clean up extra whitespace while preserving intentional line breaks
  text = text.replace(/\n{3,}/g, "\n\n"); // Replace 3+ newlines with 2

  return text.trim();
}

/**
 * Server action to download the summary as a PDF file
 */
export async function downloadSummaryAsPdf(pdfId: string, title: string) {
  const { userId } = await auth();

  if (!userId) {
    return notFound();
  }

  try {
    // Fetch the PDF summary from the database
    const pdf = await prisma.pdfSummary.findFirst({
      where: {
        id: pdfId,
        user: {
          clerkUserId: userId,
        },
      },
    });

    if (!pdf) {
      return notFound();
    }

    // Create a simple HTML template for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title} - Summary</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 {
              color: #000;
              font-weight: bold;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 10px;
            }
            h2, h3, h4 {
             color: #000;
              font-weight: bold;
              margin-top: 24px;
            }
            p {
              margin-bottom: 16px;
            }
            ul, ol {
              margin-bottom: 16px;
              padding-left: 24px;
            }
            blockquote {
              border-left: 4px solid #e5e7eb;
              padding-left: 16px;
              margin-left: 0;
              color: #6b7280;
              font-style: italic;
            }
            .metadata {
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 24px;
            }
          </style>
        </head>
        <body>
          <h1>${title} - Summary</h1>
          <div class="metadata">
            Generated on ${new Date().toLocaleDateString()}
          </div>
          ${pdf.summary}
        </body>
      </html>
    `;

    // Launch a headless browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set the HTML content
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    // Close the browser
    await browser.close();

    // Set response headers
    const filename = `${title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_summary.pdf`;

    // Return the PDF as a downloadable file
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return null;
  }
}

/**
 * Server action to download the summary as a text file
 */
export async function downloadSummaryAsText(pdfId: string, title: string) {
  const { userId } = await auth();

  if (!userId) {
    return notFound();
  }

  try {
    // Fetch the PDF summary from the database
    const pdf = await prisma.pdfSummary.findFirst({
      where: {
        id: pdfId,
        user: {
          clerkUserId: userId,
        },
      },
    });

    if (!pdf) {
      return notFound();
    }

    // Convert HTML to plain text
    const textContent = htmlToText(pdf.summary);

    // Add a title and metadata to the text file
    const fullTextContent = `${title.toUpperCase()} - SUMMARY
Generated on ${new Date().toLocaleDateString()}
--------------------------------------------------------------------------------

${textContent}
`;

    // Set response headers
    const filename = `${title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_summary.txt`;

    // Return the text as a downloadable file
    return fullTextContent;
  } catch (error) {
    return null;
  }
}
