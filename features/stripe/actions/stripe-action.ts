"use server";

import { APP_PROPERTISE } from "@/app-config";
import { getUserAccountByClerkId } from "@/features/summary/actions/summary-action";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { prisma } from "@/lib/prisma";
import { getTokenCount } from "@/utils/calculateTokenCount";
import { auth, currentUser, EmailAddress } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { z } from "zod";

const stripe = new Stripe(APP_PROPERTISE.STRIPE_SECRET_KEY!);

const amountSchema = z.object({
  amount: z.number().min(5, { message: "Amount must be at least 5" }),
});

export async function createCheckoutSessionDisabled(
  amountToBePaid: string | number
) {
  return {
    error: true,
    message: "Currently payment is disabled",
  };
}

export async function createCheckoutSession(amountToBePaid: string | number) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        error: true,
        message: "Not Authorized",
      };
    }

    const { success, data } = amountSchema.safeParse({
      amount: Number(amountToBePaid),
    });

    if (!success) {
      throw new Error("Invalid plan or price ID not configured");
    }

    const user = await getUserAccountByClerkId(userId);

    if (!user) {
      return {
        error: true,
        message: "Something Went Wrong",
      };
    }

    const tks = getTokenCount(data.amount);

    if (!tks) {
      return {
        error: true,
        message: "Something Went Wrong",
      };
    }

    const newPayment = await prisma.payment.create({
      data: {
        amount: convertToSubcurrency(data.amount),
        status: "pending",
        userId: user.user.id,
        tokens: tks,
      },
    });

    if (!newPayment) {
      return {
        error: true,
        message: "Something Went Wrong",
      };
    }

    try {
      let session = await stripe.checkout.sessions.create({
        //@ts-ignore
        mode: "payment",
        customer_email: user.primaryEmail ?? null,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Consise AI - Top up",
              },
              unit_amount: convertToSubcurrency(data.amount), // amount in cents
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?success=true&paymentId=${newPayment.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?canceled=true&paymentId=${newPayment.id}`,
        metadata: {
          userId: user.user.id,
          emailAddress: user.primaryEmail,
          paymentId: newPayment.id,
        },
      });

      return session;
    } catch (error) {
      await prisma.payment.delete({
        where: {
          id: newPayment.id,
        },
      });

      return {
        error: true,
        message: "Something Went Wrong",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      error: true,
      message: "Something Went Wrong",
    };
  }
}

export async function validatePayment(paymentId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      return null;
    }
    const payment = await prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
    });
    if (!payment) {
      return null;
    }
    if (payment.status === "completed") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
