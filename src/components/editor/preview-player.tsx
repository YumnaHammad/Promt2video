"use client";

import { useEffect, useMemo, useRef, type ComponentType } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { Prompt2VideoComposition } from "@/remotion/compositions/Prompt2VideoComposition";
import { useEditorStore } from "@/stores/editor-store";
import {
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
  calculateTotalDuration,
  durationToFrames,
} from "@/lib/remotion/builder";
import type { VideoCompositionData } from "@/types/video";
import { cn } from "@/lib/utils";

interface PreviewPlayerProps {
  className?: string;
}

export function PreviewPlayer({ className }: PreviewPlayerProps) {
  const scenes = useEditorStore((s) => s.scenes);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const showCaptions = useEditorStore((s) => s.showCaptions);
  const showSafeZones = useEditorStore((s) => s.showSafeZones);
  const width = useEditorStore((s) => s.width);
  const height = useEditorStore((s) => s.height);
  const setIsPlaying = useEditorStore((s) => s.setIsPlaying);
  const setCurrentFrame = useEditorStore((s) => s.setCurrentFrame);

  const playerRef = useRef<PlayerRef>(null);

  const compositionData: VideoCompositionData = useMemo(
    () => ({
      fps: VIDEO_FPS,
      width,
      height,
      scenes: showCaptions
        ? scenes
        : scenes.map((s) => ({ ...s, subtitles: undefined })),
    }),
    [scenes, showCaptions, width, height]
  );

  const durationInFrames = useMemo(() => {
    const total = calculateTotalDuration(scenes);
    return Math.max(durationToFrames(total), VIDEO_FPS * 5);
  }, [scenes]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const frame = player.getCurrentFrame();
    if (Math.abs(frame - currentFrame) > 2) {
      player.seekTo(currentFrame);
    }
  }, [currentFrame]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrameUpdate = (e: { detail: { frame: number } }) => {
      setCurrentFrame(e.detail.frame);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    player.addEventListener("frameupdate", onFrameUpdate);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);

    return () => {
      player.removeEventListener("frameupdate", onFrameUpdate);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
    };
  }, [setCurrentFrame, setIsPlaying]);

  return (
    <div
      className={cn(
        "relative flex w-full min-h-[200px] items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-black shadow-2xl shadow-black/40",
        height > width ? "max-w-sm mx-auto aspect-[9/16]" : "aspect-video",
        className
      )}
    >
      {scenes.length === 0 ? (
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No preview available</p>
          <p className="text-sm">Add scenes to preview your video</p>
        </div>
      ) : (
        <Player
          ref={playerRef}
          component={
            Prompt2VideoComposition as unknown as ComponentType<Record<string, unknown>>
          }
          inputProps={compositionData as unknown as Record<string, unknown>}
          durationInFrames={durationInFrames}
          compositionWidth={width}
          compositionHeight={height}
          fps={VIDEO_FPS}
          style={{ width: "100%", height: "100%" }}
          controls
          loop
        />
      )}

      {showSafeZones && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-[5%] border border-dashed border-yellow-500/40" />
          <div className="absolute inset-x-0 bottom-0 h-[20%] border-t border-dashed border-blue-500/30" />
        </div>
      )}
    </div>
  );
}
