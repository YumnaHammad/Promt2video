"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Download,
  ExternalLink,
  Loader2,
  Share2,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PLATFORM_PRESETS,
  type PlatformPreset,
} from "@/lib/platform-presets";
import { useEditorStore } from "@/stores/editor-store";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
  onSave: () => Promise<void>;
  onExport: (platformId: string) => Promise<string | null>;
}

type ExportPhase = "select" | "rendering" | "complete" | "failed";

export function ExportDialog({
  open,
  onOpenChange,
  videoId,
  onSave,
  onExport,
}: ExportDialogProps) {
  const platformId = useEditorStore((s) => s.platformId);
  const outputUrl = useEditorStore((s) => s.outputUrl);
  const setExportSettings = useEditorStore((s) => s.setExportSettings);

  const [selectedPlatform, setSelectedPlatform] = useState(platformId);
  const [phase, setPhase] = useState<ExportPhase>("select");
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(outputUrl);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedPlatform(platformId);
      setPhase(outputUrl ? "complete" : "select");
      setDownloadUrl(outputUrl);
      setProgress(0);
      setJobId(null);
      setError(null);
    }
  }, [open, platformId, outputUrl]);

  const pollJob = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/render/${id}`);
      if (!res.ok) throw new Error("Failed to check render status");
      return res.json() as Promise<{
        status: string;
        progress: number;
        outputUrl?: string;
        error?: string;
      }>;
    },
    []
  );

  useEffect(() => {
    if (phase !== "rendering" || !jobId) return;

    let active = true;
    const interval = setInterval(async () => {
      try {
        const data = await pollJob(jobId);
        if (!active) return;

        setProgress(Math.round(data.progress ?? 0));

        if (data.status === "COMPLETED" && data.outputUrl) {
          setPhase("complete");
          setDownloadUrl(data.outputUrl);
          setExportSettings({ outputUrl: data.outputUrl });
          toast.success("Export complete!", {
            description: "Your video is ready to download.",
          });
          clearInterval(interval);
        } else if (data.status === "FAILED") {
          setPhase("failed");
          setError(data.error ?? "Render failed");
          clearInterval(interval);
        } else if (data.status === "CANCELED") {
          setPhase("select");
          setJobId(null);
          setProgress(0);
          toast.info("Export cancelled");
          clearInterval(interval);
        }
      } catch {
        if (active) {
          setPhase("failed");
          setError("Lost connection to render job");
          clearInterval(interval);
        }
      }
    }, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [phase, jobId, pollJob, setExportSettings]);

  const handleStopExport = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to stop export");

      setPhase("select");
      setJobId(null);
      setProgress(0);
      toast.success("Export stopped");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to stop");
    } finally {
      setCancelling(false);
    }
  };

  const handleExport = async () => {
    const preset = PLATFORM_PRESETS.find((p) => p.id === selectedPlatform);
    if (!preset) return;

    setPhase("rendering");
    setProgress(0);
    setError(null);

    try {
      await onSave();
      setExportSettings({
        platformId: preset.id,
        width: preset.width,
        height: preset.height,
        aspectRatio: preset.aspectRatio,
      });

      const id = await onExport(selectedPlatform);
      if (!id) throw new Error("Failed to start export");

      setJobId(id);

      const data = await pollJob(id);
      setProgress(Math.round(data.progress ?? 0));

      if (data.status === "COMPLETED" && data.outputUrl) {
        setPhase("complete");
        setDownloadUrl(data.outputUrl);
        setExportSettings({ outputUrl: data.outputUrl });
      } else if (data.status === "FAILED") {
        setPhase("failed");
        setError(data.error ?? "Render failed");
      }
    } catch (err) {
      setPhase("failed");
      setError(err instanceof Error ? err.message : "Export failed");
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `prompt2video-${videoId.slice(0, 8)}.mp4`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selected = PLATFORM_PRESETS.find((p) => p.id === selectedPlatform);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Export for Any Platform
          </DialogTitle>
          <DialogDescription>
            Choose a platform, export as MP4, and download ready-to-upload video.
          </DialogDescription>
        </DialogHeader>

        {phase === "select" && (
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {PLATFORM_PRESETS.map((platform) => (
                <PlatformCard
                  key={platform.id}
                  platform={platform}
                  selected={selectedPlatform === platform.id}
                  onSelect={() => setSelectedPlatform(platform.id)}
                />
              ))}
            </div>

            {selected && (
              <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-sm text-muted-foreground">
                Export at <strong>{selected.width}×{selected.height}</strong>{" "}
                ({selected.aspectRatio}) — optimized for {selected.label}.
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="gradient" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export MP4
              </Button>
            </div>
          </div>
        )}

        {phase === "rendering" && (
          <div className="space-y-6 py-6 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <div>
              <p className="font-medium">Rendering your video...</p>
              <p className="text-sm text-muted-foreground">
                Exporting for {selected?.label ?? "platform"} — this may take 1–3 minutes.
              </p>
            </div>
            <div className="mx-auto max-w-sm space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium text-primary">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleStopExport}
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
                  Stop Export
                </>
              )}
            </Button>
          </div>
        )}

        {phase === "complete" && downloadUrl && (
          <div className="space-y-6 py-4 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
            <div>
              <p className="text-lg font-semibold">Export Ready!</p>
              <p className="text-sm text-muted-foreground">
                Your {selected?.label ?? "video"} MP4 is ready to upload.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button variant="gradient" size="lg" onClick={handleDownload}>
                <Download className="h-4 w-4" />
                Download MP4
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open in Browser
                </a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload directly to {selected?.label ?? "your platform"} — no conversion needed.
            </p>
          </div>
        )}

        {phase === "failed" && (
          <div className="space-y-4 py-4 text-center">
            <p className="text-destructive">{error ?? "Export failed"}</p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => setPhase("select")}>
                Try Again
              </Button>
              <Button variant="gradient" onClick={handleExport}>
                Retry Export
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PlatformCard({
  platform,
  selected,
  onSelect,
}: {
  platform: PlatformPreset;
  selected: boolean;
  onSelect: () => void;
}) {
  const isVertical = platform.height > platform.width;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
        selected
          ? "border-primary bg-primary/10 ring-1 ring-primary"
          : "border-border/50 hover:border-primary/40 hover:bg-accent/30"
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold",
          isVertical ? "h-10 w-6" : "h-6 w-10"
        )}
      >
        {platform.icon}
      </div>
      <div className="min-w-0">
        <p className="font-medium">{platform.label}</p>
        <p className="text-xs text-muted-foreground">{platform.description}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {platform.width}×{platform.height}
        </p>
      </div>
    </button>
  );
}
