import { validatePayment } from "@/features/stripe/actions/stripe-action";
import { auth } from "@clerk/nextjs/server";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { notFound } from "next/navigation";
import React from "react";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ paymentId: string }>;
}) {
  const user = await auth();

  if (!user) {
    return notFound();
  }
  const { paymentId } = await searchParams;
  if (!paymentId) {
    return notFound();
  }

  const success = await validatePayment(paymentId);
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-6">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-500" />
          </div>
          <h1 className="text-2xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">Thank you for your purchase.</p>
        </div>
      </div>
    );
  } else if (success === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-6">
          <div className="flex justify-center">
            <CircleAlert className="h-16 w-16 text-red-600 dark:text-red-500" />
          </div>
          <h1 className="text-2xl font-bold">Payment Failed!</h1>
          <p className="text-muted-foreground">Please try again.</p>
        </div>
      </div>
    );
  } else {
    return notFound();
  }
}
