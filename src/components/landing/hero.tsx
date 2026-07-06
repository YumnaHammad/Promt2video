"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Sparkles,
  Wand2,
  Film,
  CheckCircle2,
} from "lucide-react";
import { HeroCtaButton } from "@/components/demo/auth-buttons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const demoSteps = [
  { icon: Wand2, label: "Writing script", delay: 0 },
  { icon: Sparkles, label: "Generating visuals", delay: 1.2 },
  { icon: Film, label: "Rendering video", delay: 2.4 },
];

const promptText =
  "Create a 60-second product launch video for our AI writing assistant...";

export function Hero() {
  return (
    <section className="aurora-bg relative min-h-[100dvh] overflow-hidden pt-16">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-32 top-1/4 size-[500px] rounded-full bg-violet-600/20 blur-[120px]"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-32 top-1/3 size-[400px] rounded-full bg-fuchsia-600/15 blur-[100px]"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-1.5 text-fluid-xs backdrop-blur-sm"
        >
          <Sparkles className="size-3.5 text-violet-400" />
          <span className="text-muted-foreground">
            AI-powered video creation
          </span>
          <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400">
            New
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl text-center text-fluid-5xl font-bold leading-[1.1] tracking-tight"
        >
          Turn any prompt into a{" "}
          <span className="gradient-text">studio-quality video</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 max-w-2xl text-center text-fluid-lg text-muted-foreground"
        >
          Describe your idea in plain English. Prompt2Video writes the script,
          generates visuals, adds voiceover, and renders a polished video in
          minutes — not days.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex w-full max-w-md flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:justify-center"
        >
          <HeroCtaButton />
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            asChild
          >
            <Link href="#demo">
              <Play className="size-4" />
              Watch demo
            </Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-4 text-fluid-xs text-muted-foreground"
        >
          No credit card required · 5 free videos per month
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="relative mt-16 w-full max-w-5xl"
        >
          <div className="gradient-border rounded-2xl p-[1px] shadow-2xl shadow-violet-500/10">
            <div className="overflow-hidden rounded-2xl border border-border/30 bg-card/80 backdrop-blur-xl">
              <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="size-3 rounded-full bg-red-500/80" />
                  <span className="size-3 rounded-full bg-yellow-500/80" />
                  <span className="size-3 rounded-full bg-green-500/80" />
                </div>
                <span className="ml-2 text-xs text-muted-foreground">
                  Prompt2Video Studio
                </span>
              </div>

              <div className="grid gap-0 lg:grid-cols-[1fr_1.2fr]">
                <div className="border-b border-border/50 p-5 lg:border-b-0 lg:border-r">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Your prompt
                  </p>
                  <div className="rounded-xl border border-border/50 bg-background/50 p-4">
                    <TypingPrompt text={promptText} />
                  </div>

                  <div className="mt-5 space-y-2.5">
                    {demoSteps.map((step, i) => (
                      <motion.div
                        key={step.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.15 }}
                        className="flex items-center gap-3"
                      >
                        <StepIndicator
                          icon={step.icon}
                          label={step.label}
                          delay={step.delay}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="relative aspect-video bg-gradient-to-br from-violet-950/50 via-background to-fuchsia-950/30 p-5">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                    className="relative h-full overflow-hidden rounded-xl border border-border/30 bg-black/40 shadow-inner"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 via-transparent to-fuchsia-600/20" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="flex size-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
                      >
                        <Play className="size-6 fill-white text-white" />
                      </motion.div>
                      <span className="text-sm font-medium text-white/80">
                        Product Launch · 0:58
                      </span>
                    </div>

                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 2, duration: 3, ease: "linear" }}
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3.5 }}
                    className="absolute bottom-8 right-8 flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs text-green-400 backdrop-blur-sm"
                  >
                    <CheckCircle2 className="size-3.5" />
                    Render complete
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-b from-violet-500/5 to-transparent blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
}

function TypingPrompt({ text }: { text: string }) {
  return (
    <motion.p
      className="text-sm leading-relaxed text-foreground/90"
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.05, staggerChildren: 0.03 }}
      >
        {text.split("").map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.025 }}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-violet-400"
      />
    </motion.p>
  );
}

function StepIndicator({
  icon: Icon,
  label,
  delay,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  delay: number;
}) {
  return (
    <>
      <motion.div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background/50"
        )}
        animate={{
          borderColor: [
            "rgba(228, 228, 231, 0.5)",
            "rgba(139, 92, 246, 0.5)",
            "rgba(34, 197, 94, 0.5)",
          ],
        }}
        transition={{ delay, duration: 1.5, times: [0, 0.5, 1] }}
      >
        <Icon className="size-4 text-violet-400" />
      </motion.div>
      <div className="flex-1">
        <p className="text-sm text-foreground/80">{label}</p>
        <motion.div
          className="mt-1 h-1 overflow-hidden rounded-full bg-border/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay, duration: 1.2, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </>
  );
}
