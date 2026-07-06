"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
  AlertCircle,
  Film,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatDuration } from "@/lib/utils";

interface VideoStatus {
  id: string;
  title: string;
  prompt: string | null;
  status: string;
  duration: number;
  generationProgress: number;
  generationStep: string | null;
  _count?: { scenes: number };
  scenes?: unknown[];
  renderJobs?: Array<{ progress: number; status: string }>;
}

interface VideoProgressClientProps {
  videoId: string;
}

const GENERATION_STEPS = [
  { key: "script", label: "Writing script", threshold: 25 },
  { key: "scenes", label: "Building scenes", threshold: 85 },
  { key: "assemble", label: "Assembling video", threshold: 95 },
  { key: "done", label: "Ready to edit", threshold: 100 },
];

function estimateRemainingSeconds(progress: number): number {
  if (progress >= 100) return 0;
  const totalEstimate = 150;
  return Math.max(5, Math.round(totalEstimate * (1 - progress / 100)));
}

export function VideoProgressClient({ videoId }: VideoProgressClientProps) {
  const router = useRouter();
  const [video, setVideo] = useState<VideoStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const res = await fetch(`/api/videos/${videoId}`);
        if (!res.ok) {
          if (active) setError("Video not found");
          return;
        }

        const data = (await res.json()) as VideoStatus;
        if (!active) return;

        setVideo(data);

        if (data.status === "EDITING" || data.status === "COMPLETED") {
          router.replace(`/editor/${videoId}`);
          return;
        }

        if (data.status === "ARCHIVED") {
          setCancelled(true);
          return;
        }

        if (data.status === "FAILED") {
          setError("Video generation failed. Please try again.");
        }
      } catch {
        if (active) setError("Failed to load video status");
      }
    }

    poll();
    const interval = setInterval(poll, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [videoId, router]);

  const handleStop = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to stop");
      }

      toast.success("Stopped", {
        description:
          data.previousStatus === "RENDERING"
            ? "Export cancelled. You can continue editing."
            : "Video generation cancelled.",
      });

      router.push(data.redirectTo ?? "/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to stop");
    } finally {
      setCancelling(false);
    }
  };

  if (cancelled) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-4 py-24 text-center">
        <Square className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">Cancelled</p>
        <p className="text-sm text-muted-foreground">
          This video generation was stopped.
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (error && !video) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-4 py-24 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const progress =
    video?.status === "RENDERING"
      ? (video.renderJobs?.[0]?.progress ?? video.generationProgress ?? 0)
      : (video?.generationProgress ?? 5);

  const step = video?.generationStep ?? "Starting generation...";
  const remaining = estimateRemainingSeconds(progress);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeLabel =
    remaining > 0
      ? mins > 0
        ? `~${mins}m ${secs}s remaining`
        : `~${secs}s remaining`
      : "Almost done...";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl space-y-8 py-8"
    >
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-purple-500/25">
          {video?.status === "FAILED" ? (
            <AlertCircle className="h-8 w-8 text-white" />
          ) : (
            <Sparkles className="h-8 w-8 text-white" />
          )}
        </div>
        <h1 className="text-fluid-2xl font-bold tracking-tight">
          {video?.status === "FAILED"
            ? "Generation Failed"
            : video?.title ?? "Creating Your Video"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {video?.status === "FAILED"
            ? error
            : "AI is building your video — this usually takes 2–3 minutes."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {video?.status !== "FAILED" && (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            )}
            {video?.status === "RENDERING" ? "Rendering Video" : "Generating Video"}
          </CardTitle>
          <CardDescription>{step}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-primary">{Math.round(progress)}%</span>
              {video?.status !== "FAILED" && (
                <span className="text-muted-foreground">{timeLabel}</span>
              )}
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {video?.status !== "FAILED" && (
            <ul className="space-y-3">
              {GENERATION_STEPS.map((s) => {
                const done = progress >= s.threshold;
                const active =
                  !done &&
                  progress >= (GENERATION_STEPS[GENERATION_STEPS.indexOf(s) - 1]?.threshold ?? 0);

                return (
                  <li
                    key={s.key}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
                      done && "border-emerald-500/30 bg-emerald-500/5",
                      active && "border-primary/50 bg-primary/5",
                      !done && !active && "border-border/50 opacity-50"
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                    ) : active ? (
                      <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">{s.label}</span>
                  </li>
                );
              })}
            </ul>
          )}

          {video && (
            <div className="flex flex-wrap gap-4 rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">
              {video.prompt && (
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <Film className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="line-clamp-2">{video.prompt}</p>
                </div>
              )}
              {(video._count?.scenes ?? video.scenes?.length ?? 0) > 0 && (
                <span>{video._count?.scenes ?? video.scenes?.length} scenes</span>
              )}
              {video.duration > 0 && (
                <span>{formatDuration(video.duration)}</span>
              )}
              <span>{Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")} elapsed</span>
            </div>
          )}

          {video?.status !== "FAILED" && !cancelled && (
            <div className="flex justify-center gap-3 border-t border-border/50 pt-4">
              <Button
                variant="outline"
                onClick={handleStop}
                disabled={cancelling}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Stopping...
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4" />
                    Stop
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          )}

          {video?.status === "FAILED" && (
            <div className="flex gap-3">
              <Button variant="gradient" onClick={() => router.push("/create")}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
