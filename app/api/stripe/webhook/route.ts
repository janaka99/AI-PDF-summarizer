import { APP_PROPERTISE } from "@/app-config";
import { prisma } from "@/lib/prisma";
import { getTokenCount } from "@/utils/calculateTokenCount";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(APP_PROPERTISE.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      APP_PROPERTISE.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const checkoutSession = event.data.object.id;
        const session = await stripe.checkout.sessions.retrieve(
          checkoutSession,
          {
            expand: ["line_items"],
          }
        );
        const product = await prisma.payment.update({
          where: {
            id: session.metadata?.paymentId,
          },
          data: {
            stripe_payment_id: session.id,
            status: "completed",
          },
        });
        console.log("user_id", session.metadata);
        await prisma.tokenUsage.update({
          where: {
            userId: session.metadata?.userId,
          },
          data: {
            tokens: {
              increment: product.tokens,
            },
          },
        });
        revalidatePath("/dashboard");
        break;
      case "charge.succeeded":
        const checkoutSessions = event.data.object.id;
        const sessions = await stripe.checkout.sessions.retrieve(
          checkoutSessions,
          {
            expand: ["line_items"],
          }
        );
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed", err }, { status: 500 });
  }
}
