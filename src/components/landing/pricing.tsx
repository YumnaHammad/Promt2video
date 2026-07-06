"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { DemoSignUpButton } from "@/components/demo/auth-buttons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLANS, type PlanKey } from "@/lib/plans";
import { cn, formatCurrency } from "@/lib/utils";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const planOrder: PlanKey[] = ["FREE", "STARTER", "PRO", "ENTERPRISE"];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/[0.03] to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-medium uppercase tracking-wider text-violet-400"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-fluid-3xl font-bold tracking-tight"
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-fluid-base text-muted-foreground"
          >
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </motion.p>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {planOrder.map((key, i) => {
            const plan = PLANS[key];
            const isPopular = "popular" in plan && plan.popular;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={cn(isPopular && "sm:col-span-2 xl:col-span-1")}
              >
                <Card
                  className={cn(
                    "relative flex h-full flex-col border-border/50 bg-card/30 transition-all duration-300 hover:border-border hover:shadow-lg",
                    isPopular &&
                      "border-violet-500/50 bg-gradient-to-b from-violet-500/10 to-card/30 shadow-lg shadow-violet-500/10"
                  )}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1 text-xs font-medium text-white shadow-lg">
                        <Sparkles className="size-3" />
                        Most popular
                      </span>
                    </div>
                  )}

                  <CardHeader className={cn(isPopular && "pt-8")}>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-2">
                      <span className="text-fluid-3xl font-bold text-foreground">
                        {plan.price === 0
                          ? "Free"
                          : formatCurrency(plan.price)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-sm text-muted-foreground">
                          /month
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <Check className="mt-0.5 size-4 shrink-0 text-violet-400" />
                          <span className="text-sm text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    {key === "ENTERPRISE" ? (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="mailto:sales@prompt2video.ai">
                          Contact sales
                        </Link>
                      </Button>
                    ) : key === "FREE" ? (
                      <DemoSignUpButton />
                    ) : DEMO_MODE ? (
                      <Button variant="gradient" className="w-full" asChild>
                        <Link href="/billing">View in billing</Link>
                      </Button>
                    ) : (
                      <DemoSignUpButton />
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
