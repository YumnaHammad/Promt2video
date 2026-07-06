"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEditorStore } from "@/stores/editor-store";
import { Toolbar } from "@/components/editor/toolbar";
import { PreviewPlayer } from "@/components/editor/preview-player";
import { Timeline } from "@/components/editor/timeline";
import { SceneList } from "@/components/editor/scene-list";
import { SceneControls } from "@/components/editor/scene-controls";
import { VoiceEditor } from "@/components/editor/voice-editor";
import { PlatformSelector } from "@/components/editor/platform-selector";
import { CaptionEditor } from "@/components/editor/caption-editor";
import { DEFAULT_PLATFORM_ID, getPlatformPreset, resolveVideoDimensions, PLATFORM_PRESETS } from "@/lib/platform-presets";
import type { SceneData } from "@/types/video";

interface EditorPageClientProps {
  videoId: string;
}

export function EditorPageClient({ videoId }: EditorPageClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setVideoId = useEditorStore((s) => s.setVideoId);
  const setTitle = useEditorStore((s) => s.setTitle);
  const setScenes = useEditorStore((s) => s.setScenes);
  const selectScene = useEditorStore((s) => s.selectScene);
  const scenes = useEditorStore((s) => s.scenes);
  const title = useEditorStore((s) => s.title);
  const setExportSettings = useEditorStore((s) => s.setExportSettings);
  const width = useEditorStore((s) => s.width);
  const height = useEditorStore((s) => s.height);
  const aspectRatio = useEditorStore((s) => s.aspectRatio);
  const markClean = useEditorStore((s) => s.markClean);
  const reset = useEditorStore((s) => s.reset);

  useEffect(() => {
    setVideoId(videoId);

    async function loadVideo() {
      try {
        const res = await fetch(`/api/videos/${videoId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Video not found");
            return;
          }
          throw new Error("Failed to load video");
        }

        const data = await res.json();

        if (data.status === "GENERATING" || data.status === "RENDERING") {
          router.replace(`/videos/${videoId}`);
          return;
        }

        if (data.status === "FAILED") {
          router.replace(`/videos/${videoId}`);
          return;
        }

        const loadedScenes = (data.scenes as SceneData[]) ?? [];
        setTitle(data.title ?? "Untitled Video");
        setScenes(loadedScenes);

        const dims = resolveVideoDimensions(data);
        const matchedPlatform =
          PLATFORM_PRESETS.find(
            (p) =>
              p.width === dims.width &&
              p.height === dims.height &&
              p.aspectRatio === dims.aspectRatio
          ) ?? getPlatformPreset(DEFAULT_PLATFORM_ID);

        setExportSettings({
          platformId: matchedPlatform.id,
          width: dims.width,
          height: dims.height,
          aspectRatio: dims.aspectRatio,
          outputUrl: data.outputUrl ?? null,
        });

        if (loadedScenes.length > 0) {
          selectScene(loadedScenes[0].id);
        }
        markClean();

        const missingVoice = loadedScenes.filter(
          (s) => s.narration?.trim() && !s.audioUrl
        ).length;
        if (missingVoice > 0) {
          toast.info(`${missingVoice} scene(s) need voice`, {
            description: "Use the Voiceover panel to generate free AI voice.",
          });
        }
      } catch {
        setError("Failed to load video");
      } finally {
        setLoading(false);
      }
    }

    loadVideo();

    return () => reset();
  }, [videoId, setVideoId, setTitle, setScenes, selectScene, setExportSettings, markClean, reset, router]);

  const handleSave = useCallback(async () => {
    const res = await fetch(`/api/videos/${videoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        width,
        height,
        aspectRatio,
        scenes: scenes.map((s) => ({
          id: s.id,
          order: s.order,
          title: s.title,
          narration: s.narration,
          visualPrompt: s.visualPrompt,
          duration: s.duration,
          speed: s.speed,
          volume: s.volume,
          transition: s.transition,
          captionStyle: s.captionStyle,
        })),
      }),
    });

    if (!res.ok) throw new Error("Save failed");
  }, [videoId, title, scenes, width, height, aspectRatio]);

  const handleExport = useCallback(
    async (platformId: string) => {
      const res = await fetch(`/api/videos/${videoId}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "final", platformId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Export failed");
      }

      const data = await res.json();
      return data.jobId as string;
    },
    [videoId]
  );

  if (loading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">{error}</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="text-sm text-primary hover:underline"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <Toolbar
        videoId={videoId}
        onSave={handleSave}
        onExport={handleExport}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="flex h-full w-56 shrink-0 flex-col p-2 lg:w-64">
          <SceneList />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden p-3 lg:p-4">
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <PreviewPlayer className="max-h-full w-full" />
          </div>
          <Timeline />
        </main>

        <aside className="flex w-72 shrink-0 flex-col gap-3 overflow-y-auto border-l border-border/50 p-3 lg:w-80">
          <PlatformSelector />
          <VoiceEditor videoId={videoId} />
          <SceneControls />
          <CaptionEditor />
        </aside>
      </div>
    </div>
  );
}
