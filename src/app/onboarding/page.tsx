"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, Video, Wand2, ArrowRight } from "lucide-react";

const steps = [
  {
    title: "Welcome to Prompt2Video AI",
    description: "Create stunning videos from simple text prompts using AI.",
    icon: Sparkles,
  },
  {
    title: "How it works",
    description:
      "Enter a prompt, and our AI generates scripts, scenes, voiceovers, and renders your video.",
    icon: Wand2,
  },
  {
    title: "Create your first video",
    description: "Let's get started with your first AI-generated video.",
    icon: Video,
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const router = useRouter();

  const handleComplete = async () => {
    await fetch("/api/user/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    router.push("/create");
  };

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <div className="aurora-bg flex min-h-screen items-center justify-center p-4">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <Card className="glass gradient-border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-fluid-2xl">{currentStep.title}</CardTitle>
            <p className="text-muted-foreground">{currentStep.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 2 && (
              <Input
                placeholder="What should we call you?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-center"
              />
            )}

            <div className="flex justify-center gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              {step > 0 && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              )}
              <Button
                variant="gradient"
                className="flex-1"
                onClick={() => {
                  if (step < steps.length - 1) {
                    setStep(step + 1);
                  } else {
                    handleComplete();
                  }
                }}
              >
                {step < steps.length - 1 ? "Continue" : "Get Started"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
