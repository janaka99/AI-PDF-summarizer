import type { SubscriptionPlan } from "@/lib/types";

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Essential features for individuals",
    price: 9.99,
    features: ["Basic feature access", "Email support", "1 project"],
    stripePriceId: "price_basic", // Replace with actual Stripe price ID
  },
  {
    id: "pro",
    name: "Professional",
    description: "Advanced features for professionals",
    price: 19.99,
    features: [
      "All Basic features",
      "Priority support",
      "5 projects",
      "Advanced analytics",
    ],
    stripePriceId: "price_pro", // Replace with actual Stripe price ID
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Complete solution for teams",
    price: 49.99,
    features: [
      "All Professional features",
      "Dedicated support",
      "Unlimited projects",
      "Custom integrations",
      "Team management",
    ],
    stripePriceId: "price_enterprise", // Replace with actual Stripe price ID
  },
];
