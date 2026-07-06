"use client";

import { motion } from "framer-motion";
import { Check, Zap, Crown, Building2, CreditCard } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    description: "Get started with AI video generation",
    icon: Zap,
    features: [
      "3 videos per month",
      "720p export",
      "Basic templates",
      "Community support",
    ],
    cta: "Current Plan",
    popular: false,
    current: true,
  },
  {
    id: "STARTER",
    name: "Starter",
    price: 19,
    description: "For creators getting serious",
    icon: Zap,
    features: [
      "20 videos per month",
      "1080p export",
      "All templates",
      "Priority rendering",
      "Email support",
    ],
    cta: "Upgrade to Starter",
    popular: false,
    current: false,
  },
  {
    id: "PRO",
    name: "Pro",
    price: 49,
    description: "For professionals and teams",
    icon: Crown,
    features: [
      "Unlimited videos",
      "4K export",
      "Custom brand kits",
      "API access",
      "Bring your own keys",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    popular: true,
    current: false,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: null,
    description: "For organizations at scale",
    icon: Building2,
    features: [
      "Unlimited everything",
      "SSO & SAML",
      "Dedicated infrastructure",
      "Custom integrations",
      "SLA guarantee",
      "Account manager",
    ],
    cta: "Contact Sales",
    popular: false,
    current: false,
  },
];

export default function BillingPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-6xl space-y-8"
    >
      <div className="text-center">
        <h1 className="text-fluid-2xl font-bold tracking-tight">
          Billing & Subscription
        </h1>
        <p className="mt-2 text-muted-foreground">
          Choose the plan that fits your video creation needs.
        </p>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-medium">Current Plan: Free</p>
              <p className="text-sm text-muted-foreground">
                3 of 3 videos remaining this month
              </p>
            </div>
          </div>
          <Button variant="outline" disabled>
            Manage Payment Method
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card
              className={cn(
                "relative flex h-full flex-col",
                plan.popular && "border-primary shadow-lg shadow-primary/10",
                plan.current && "ring-1 ring-primary/30"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-0.5 text-xs font-medium text-white">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      plan.popular ? "bg-primary/20" : "bg-muted"
                    )}
                  >
                    <plan.icon
                      className={cn(
                        "h-5 w-5",
                        plan.popular ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                </div>
                <div className="mt-4">
                  {plan.price !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold">Custom</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={plan.popular ? "gradient" : plan.current ? "secondary" : "outline"}
                  className="w-full"
                  disabled={plan.current}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        All plans include secure storage and automatic backups. Cancel anytime.
      </p>
    </motion.div>
  );
}
