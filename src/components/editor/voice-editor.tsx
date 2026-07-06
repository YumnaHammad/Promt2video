"use client";

import { useState } from "react";
import { Loader2, Mic, MicOff, RefreshCw, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { useEditorStore } from "@/stores/editor-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEFAULT_FREE_VOICE, FREE_VOICES } from "@/lib/voices";

interface VoiceEditorProps {
  videoId: string;
}

export function VoiceEditor({ videoId }: VoiceEditorProps) {
  const scenes = useEditorStore((s) => s.scenes);
  const selectedSceneId = useEditorStore((s) => s.selectedSceneId);
  const updateScene = useEditorStore((s) => s.updateScene);
  const setScenes = useEditorStore((s) => s.setScenes);

  const [voiceId, setVoiceId] = useState(DEFAULT_FREE_VOICE);
  const [generating, setGenerating] = useState(false);
  const [regeneratingAll, setRegeneratingAll] = useState(false);

  const scene = scenes.find((s) => s.id === selectedSceneId);
  const activeVoiceId = scene?.voiceId ?? voiceId;
  const scenesWithoutVoice = scenes.filter(
    (s) => s.narration?.trim() && !s.audioUrl
  ).length;

  const handleGenerateVoice = async () => {
    if (!scene) return;
    const narration = scene.narration?.trim();
    if (!narration) {
      toast.error("Add narration text first");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch(
        `/api/videos/${videoId}/scenes/${scene.id}/voice`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voiceId: activeVoiceId, narration }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Voice generation failed");
      }

      updateScene(scene.id, {
        audioUrl: data.scene.audioUrl,
        voiceId: data.scene.voiceId,
        duration: data.scene.duration,
        subtitles: data.scene.subtitles,
      });

      toast.success("Voice generated", {
        description: `Using ${FREE_VOICES.find((v) => v.id === activeVoiceId)?.label ?? "free voice"}`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate voice"
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateAll = async () => {
    setRegeneratingAll(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/voice`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to regenerate voices");
      }

      setScenes(data.scenes);
      toast.success("All voices regenerated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to regenerate voices"
      );
    } finally {
      setRegeneratingAll(false);
    }
  };

  if (!scene) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/30 p-6 text-center backdrop-blur-xl">
        <Mic className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Select a scene to manage voiceover
        </p>
      </div>
    );
  }

  const hasVoice = Boolean(scene.audioUrl);

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-card/30 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Volume2 className="h-4 w-4 text-primary" />
          Voiceover
        </h3>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium",
            hasVoice
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-amber-500/15 text-amber-400"
          )}
        >
          {hasVoice ? "Ready" : "Missing"}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Free Microsoft Edge neural voices — no API key required.
      </p>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Voice</label>
        <select
          value={activeVoiceId}
          onChange={(e) => setVoiceId(e.target.value)}
          className="flex h-9 w-full rounded-lg border border-border bg-background/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {FREE_VOICES.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.label} ({voice.gender}, {voice.locale})
            </option>
          ))}
        </select>
      </div>

      {hasVoice && scene.audioUrl && (
        <div className="rounded-lg border border-border/50 bg-background/30 p-3">
          <p className="mb-2 text-xs text-muted-foreground">Preview</p>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio
            key={scene.audioUrl}
            src={scene.audioUrl}
            controls
            className="h-9 w-full"
          />
        </div>
      )}

      <Button
        variant="gradient"
        size="sm"
        className="w-full"
        onClick={handleGenerateVoice}
        disabled={generating || !scene.narration?.trim()}
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating voice...
          </>
        ) : hasVoice ? (
          <>
            <RefreshCw className="h-4 w-4" />
            Regenerate Voice
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            Generate Free Voice
          </>
        )}
      </Button>

      {scenesWithoutVoice > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleRegenerateAll}
          disabled={regeneratingAll}
        >
          {regeneratingAll ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating all voices...
            </>
          ) : (
            <>
              <MicOff className="h-4 w-4" />
              Generate All Missing ({scenesWithoutVoice})
            </>
          )}
        </Button>
      )}
    </div>
  );
}
