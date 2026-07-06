export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    features: [
      "5 videos per month",
      "720p export",
      "Free AI models",
      "Royalty-free assets",
      "Basic templates",
      "Watermark on exports",
    ],
  },
  STARTER: {
    name: "Starter",
    price: 19,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: [
      "30 videos per month",
      "1080p export",
      "Premium AI models",
      "No watermark",
      "All free templates",
      "Priority rendering",
    ],
  },
  PRO: {
    name: "Pro",
    price: 49,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    popular: true,
    features: [
      "Unlimited videos",
      "4K export",
      "Bring your own API keys",
      "Premium templates",
      "Brand kits",
      "Team collaboration",
      "Priority support",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 199,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      "Everything in Pro",
      "Custom branding",
      "SSO & SAML",
      "Dedicated support",
      "SLA guarantee",
      "Custom integrations",
      "Admin controls",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
export type Plan = (typeof PLANS)[PlanKey];
