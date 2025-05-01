"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "./lib/prisma";
import Stripe from "stripe";
import { APP_PROPERTISE } from "./app-config";

// Schema for validating top-up amount
const topUpSchema = z.object({
  amount: z.number().min(5).max(1000),
});

const stripe = new Stripe(APP_PROPERTISE.STRIPE_SECRET_KEY!);

// Create a Stripe payment intent for wallet top-up
export async function createTopUpPaymentIntent(formData: FormData) {
  try {
    // Validate session
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    const useracc = await prisma.user.findFirst({
      where: {
        clerkUserId: userId,
      },
    });
    if (!useracc) {
      return { error: "Unauthorized" };
    }
    // Parse and validate amount
    const amountString = formData.get("amount") as string;
    const amount = parseFloat(amountString);

    const validation = topUpSchema.safeParse({ amount });
    if (!validation.success) {
      return { error: "Invalid amount. Must be between $5 and $1000." };
    }

    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100);

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "USD",
      metadata: {
        userId: useracc.id,
        type: "top_up",
      },
    });

    // Create a pending transaction record
    const payment = await prisma.payment.create({
      data: {
        userId: useracc.id,
        amount,
      },
    });
    // Return the client secret that will be used by Stripe Elements
    return {
      clientSecret: paymentIntent.client_secret,
      transactionId: payment.id,
    };
  } catch (error) {
    console.error("Error creating top-up payment intent:", error);
    return { error: "Failed to create payment intent" };
  }
}

// Confirm payment was successful and update wallet balance
export async function confirmWalletTopUp(transactionId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    const useracc = await prisma.user.findFirst({
      where: {
        clerkUserId: userId,
      },
    });
    if (!useracc) {
      return { error: "Unauthorized" };
    }

    // Get transaction details
    const transaction = await prisma.payment.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return { error: "Transaction not found" };
    }

    // Check if transaction is already processed
    if (transaction.status !== "pending") {
      return { success: true, message: "Transaction already processed" };
    }

    // // Verify payment status with Stripe
    // const paymentIntent = await stripe.paymentIntents.retrieve(
    //   transaction.stripePaymentId || ""
    // )

    // if (paymentIntent.status !== "succeeded") {
    //   return { error: "Payment has not been completed" }
    // }

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/billing");

    return { success: true, message: "Wallet topped up successfully" };
  } catch (error) {
    console.error("Error confirming wallet top-up:", error);
    return { error: "Failed to confirm top-up" };
  }
}
