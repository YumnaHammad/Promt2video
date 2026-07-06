"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Film, Loader2, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const styles = [
  { id: "cinematic", label: "Cinematic", description: "Dramatic, film-like visuals" },
  { id: "educational", label: "Educational", description: "Clear, informative tone" },
  { id: "social", label: "Social Media", description: "Fast-paced, engaging hooks" },
  { id: "corporate", label: "Corporate", description: "Professional, polished look" },
  { id: "documentary", label: "Documentary", description: "Narrative-driven storytelling" },
  { id: "animated", label: "Animated", description: "Motion graphics style" },
];

const durations = [
  { value: 30, label: "30s" },
  { value: 60, label: "1 min" },
  { value: 90, label: "1.5 min" },
  { value: 120, label: "2 min" },
  { value: 180, label: "3 min" },
];

const EXAMPLE_PROMPTS = [
  "Create a 60-second product launch video for an AI writing app called WriteFlow. Highlight speed, quality, and ease of use.",
  "Write a 40-second cinematic video script about a robot discovering music for the first time in a neon city.",
  "Generate a 50-second video pitch for a coffee subscription startup named BeanBox. Emphasize premium beans and free delivery.",
  "Make a 30-second educational explainer about how solar panels work for homeowners. Friendly, clear tone.",
];

export default function CreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [duration, setDuration] = useState(60);
  const [useOwnKeys, setUseOwnKeys] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templateName, setTemplateName] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;

    fetch(`/api/templates?limit=100`)
      .then((res) => res.json())
      .then((data) => {
        const template = data.templates?.find(
          (item: { id: string }) => item.id === templateId
        );
        if (template) {
          setTemplateName(template.name);
          setPrompt((current) =>
            current ||
            `Create a video using the "${template.name}" template style. ${template.description}`
          );
        }
      })
      .catch(() => {
        // Non-blocking if template metadata fails to load
      });
  }, [templateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (prompt.trim().length < 10) {
      toast.error("Prompt must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          duration,
          useOwnKeys,
          ...(templateId ? { templateId } : {}),
        }),
      });

      const contentType = res.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json")
        ? await res.json().catch(() => ({}))
        : {};

      if (!res.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : res.status >= 500
              ? "Server error — try again in a moment"
              : "Failed to start pipeline";
        throw new Error(message);
      }

      toast.success("Video generation started!", {
        description:
          data.video?.status === "EDITING"
            ? "Opening editor..."
            : "Redirecting to progress view...",
      });

      if (data.video?.status === "EDITING") {
        router.push(`/editor/${data.videoId ?? data.video?.id}`);
        return;
      }

      router.push(`/videos/${data.videoId ?? data.video?.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl space-y-8"
    >
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-purple-500/25">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-fluid-2xl font-bold tracking-tight">Create Video</h1>
        <p className="mt-2 text-muted-foreground">
          Describe your video idea and let AI handle the rest.
        </p>
      </div>

      {templateName && (
        <div className="flex items-center gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3">
          <LayoutTemplate className="size-5 text-violet-400" />
          <div>
            <p className="text-sm font-medium">Using template</p>
            <p className="text-sm text-muted-foreground">{templateName}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Your Prompt
            </CardTitle>
            <CardDescription>
              Be specific about topic, tone, and key points you want covered.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Create a 60-second explainer video about how solar panels work, targeting homeowners. Use a friendly, educational tone with clear visuals..."
              rows={6}
              className="flex w-full resize-none rounded-lg border border-border bg-background/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 backdrop-blur-sm"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {prompt.length} / 5000 characters (min. 10)
            </p>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Try an example
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setPrompt(example)}
                    disabled={isSubmitting}
                    className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                  >
                    {example.slice(0, 42)}...
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" />
              Style & Duration
            </CardTitle>
            <CardDescription>
              Choose the visual style and target length for your video.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-medium">Visual Style</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyle(s.id)}
                    disabled={isSubmitting}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-all",
                      style === s.id
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border hover:border-primary/50 hover:bg-accent/50"
                    )}
                  >
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium">Duration</label>
              <div className="flex flex-wrap gap-2">
                {durations.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDuration(d.value)}
                    disabled={isSubmitting}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                      duration === d.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 p-4">
              <div>
                <p className="text-sm font-medium">Use my API keys</p>
                <p className="text-xs text-muted-foreground">
                  Route generation through your configured providers
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={useOwnKeys}
                onClick={() => setUseOwnKeys(!useOwnKeys)}
                disabled={isSubmitting}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  useOwnKeys ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                    useOwnKeys && "translate-x-5"
                  )}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            disabled={isSubmitting || prompt.trim().length < 10}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Starting Pipeline...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Video
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
