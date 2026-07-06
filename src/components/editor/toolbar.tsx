"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Download,
  Grid3x3,
  Loader2,
  Play,
  Save,
  Share2,
  Subtitles,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useEditorStore } from "@/stores/editor-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ExportDialog } from "@/components/editor/export-dialog";
import { getPlatformPreset } from "@/lib/platform-presets";

interface ToolbarProps {
  videoId: string;
  onSave: () => Promise<void>;
  onExport: (platformId: string) => Promise<string | null>;
}

export function Toolbar({ videoId, onSave, onExport }: ToolbarProps) {
  const title = useEditorStore((s) => s.title);
  const isDirty = useEditorStore((s) => s.isDirty);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const showCaptions = useEditorStore((s) => s.showCaptions);
  const showSafeZones = useEditorStore((s) => s.showSafeZones);
  const platformId = useEditorStore((s) => s.platformId);
  const outputUrl = useEditorStore((s) => s.outputUrl);
  const setTitle = useEditorStore((s) => s.setTitle);
  const setIsPlaying = useEditorStore((s) => s.setIsPlaying);
  const toggleCaptions = useEditorStore((s) => s.toggleCaptions);
  const toggleSafeZones = useEditorStore((s) => s.toggleSafeZones);
  const markClean = useEditorStore((s) => s.markClean);

  const [saving, setSaving] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const platform = getPlatformPreset(platformId);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
      markClean();
      toast.success("Changes saved");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/50 bg-card/30 px-3 backdrop-blur-xl lg:gap-3 lg:px-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-0 flex-1 max-w-lg border-transparent bg-transparent text-sm font-semibold focus-visible:border-border lg:text-base"
        />

        {isDirty && (
          <span className="hidden rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-500 sm:inline">
            Unsaved
          </span>
        )}

        <span className="hidden rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground md:inline">
          {platform.label} · {platform.aspectRatio}
        </span>

        <div className="flex-1" />

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            <Play className={cn("size-4", isPlaying && "fill-current")} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={toggleCaptions}
          >
            <Subtitles
              className={cn("size-4", showCaptions && "text-primary")}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={toggleSafeZones}
          >
            <Grid3x3
              className={cn("size-4", showSafeZones && "text-primary")}
            />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="hidden sm:flex"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save
        </Button>

        {outputUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={outputUrl} download target="_blank" rel="noopener noreferrer">
              <Download className="size-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
          </Button>
        )}

        <Button
          variant="gradient"
          size="sm"
          onClick={() => setExportOpen(true)}
        >
          <Share2 className="size-4" />
          Export
        </Button>
      </header>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        videoId={videoId}
        onSave={onSave}
        onExport={onExport}
      />
    </>
  );
}
