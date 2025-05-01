"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CreditCard, Coins } from "lucide-react";
import getStripe from "@/utils/get-stripejs";
import { useRouter } from "next/navigation";
import {
  createCheckoutSession,
  createCheckoutSessionDisabled,
} from "@/features/stripe/actions/stripe-action";
import { getTokenCount } from "@/utils/calculateTokenCount";
import { toast } from "sonner";

// Minimum payment amount
const MIN_PAYMENT = 5;
// Maximum payment amount for the slider
const MAX_PAYMENT = 100;
// Predefined payment amounts
const PAYMENT_PRESETS = [5, 10, 20, 50, 100];

// Main token purchase component
export default function TokenTopUp() {
  const [amount, setAmount] = useState(MIN_PAYMENT);
  const [customAmount, setCustomAmount] = useState(MIN_PAYMENT.toString());
  const [error, setError] = useState("");
  const [intentGenerating, setIntentGenerating] = useState(false);

  // Handle amount change from input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow only numbers and up to 2 decimal places
    if (!/^\d*\.?\d{0,2}$/.test(value) && value !== "") {
      return;
    }

    setCustomAmount(value);

    const numValue = Number.parseFloat(value);
    if (!isNaN(numValue)) {
      if (numValue < MIN_PAYMENT) {
        setError(`Minimum payment is $${MIN_PAYMENT}`);
      } else {
        setError("");
        setAmount(numValue);
      }
    } else if (value === "") {
      setError(`Minimum payment is $${MIN_PAYMENT}`);
    }
  };

  // Handle amount change from slider
  const handleSliderChange = (value: number[]) => {
    const newAmount = value[0];
    setAmount(newAmount);
    setCustomAmount(newAmount.toString());

    if (newAmount < MIN_PAYMENT) {
      setError(`Minimum payment is $${MIN_PAYMENT}`);
    } else {
      setError("");
    }
  };

  // Handle preset amount selection
  const handlePresetClick = (preset: number) => {
    setAmount(preset);
    setCustomAmount(preset.toString());
    setError("");
  };

  // Calculate token count
  const tokenCount = getTokenCount(amount);

  const manageChekcout = async () => {
    if (amount < MIN_PAYMENT || amount > MAX_PAYMENT) {
      return;
    }
    setIntentGenerating(true);
    const checkoutSession = await createCheckoutSessionDisabled(amount);
    if (checkoutSession.error) {
      toast("Error", {
        description: checkoutSession.message,
      });
    }
    if ("url" in checkoutSession) {
      const stripe = await getStripe();
      if (!stripe) return;
      //@ts-ignore
      await stripe.redirectToCheckout({ sessionId: checkoutSession.id });
    } else {
      toast("Error", {
        description: "Faild to make payment. Please try again later",
      });
    }
    setIntentGenerating(false);
  };

  return (
    <Card className="border-border/40 shadow-sm overflow-hidden">
      <CardHeader className="py-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
        <CardTitle className="flex items-center text-xl">
          <Coins className="h-5 w-5 mr-2 text-primary" />
          Purchase Tokens
        </CardTitle>
        <CardDescription>
          Top up your account with more tokens for PDF summarization
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">$</span>
              <Input
                id="amount"
                type="text"
                value={customAmount}
                onChange={handleAmountChange}
                className="flex-1"
                placeholder={`Minimum $${MIN_PAYMENT}`}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                ${MIN_PAYMENT}
              </span>
              <span className="text-sm text-muted-foreground">
                ${MAX_PAYMENT}
              </span>
            </div>
            <Slider
              value={[amount]}
              min={1}
              max={MAX_PAYMENT}
              step={1}
              onValueChange={handleSliderChange}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {PAYMENT_PRESETS.map((preset) => (
              <Button
                key={preset}
                variant={amount === preset ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className="flex-1"
              >
                ${preset}
              </Button>
            ))}
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">You'll receive:</span>
              <span className="text-xl font-bold text-primary">
                {tokenCount?.toLocaleString() ?? 0} tokens
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Rate: 6,000 tokens per $1
            </p>
          </div>
        </div>

        <Button
          onClick={manageChekcout}
          disabled={amount < MIN_PAYMENT || intentGenerating}
          className="w-full cursor-pointer"
        >
          Pay Now
        </Button>
      </CardContent>

      <CardFooter className="bg-muted/20 py-2 border-t text-muted-foreground  flex flex-row justify-center items-center">
        <CreditCard className="h-4 w-4 mr-2" />
        Secure payment powered by Stripe
      </CardFooter>
    </Card>
  );
}
