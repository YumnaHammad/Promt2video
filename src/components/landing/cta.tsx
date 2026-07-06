"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroCtaButton } from "@/components/demo/auth-buttons";

export function CTA() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-border/50"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-blue-600/20" />
          <div className="pointer-events-none absolute -left-20 -top-20 size-60 rounded-full bg-violet-600/30 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 size-60 rounded-full bg-fuchsia-600/20 blur-[80px]" />

          <div className="relative px-6 py-16 text-center sm:px-12 sm:py-20 md:px-16 md:py-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25"
            >
              <Sparkles className="size-7 text-white" />
            </motion.div>

            <h2 className="text-fluid-3xl font-bold tracking-tight">
              Ready to create your first video?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-fluid-base text-muted-foreground">
              Join thousands of creators who ship professional videos in
              minutes. Start free — no credit card required.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <HeroCtaButton />
              <Button
                variant="outline"
                size="lg"
                className="w-full border-border/50 bg-background/50 backdrop-blur-sm sm:w-auto"
                asChild
              >
                <Link href="#pricing">View pricing</Link>
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              5 free videos per month · Cancel anytime · Export in minutes
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
