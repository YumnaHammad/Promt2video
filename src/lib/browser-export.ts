"use client";

import type { FC } from "react";
import {
  canRenderMediaOnWeb,
  renderMediaOnWeb,
} from "@remotion/web-renderer";
import { Prompt2VideoComposition } from "@/remotion/compositions/Prompt2VideoComposition";
import {
  VIDEO_FPS,
  calculateTotalDuration,
  durationToFrames,
} from "@/lib/remotion/builder";
import type { SceneData, VideoCompositionData } from "@/types/video";

export interface BrowserExportOptions {
  scenes: SceneData[];
  width: number;
  height: number;
  onProgress?: (progress: number) => void;
}

export async function exportVideoInBrowser(
  options: BrowserExportOptions
): Promise<Blob> {
  const totalDuration = calculateTotalDuration(options.scenes);
  const durationInFrames = Math.max(
    durationToFrames(totalDuration),
    VIDEO_FPS * 3
  );

  const support = await canRenderMediaOnWeb({
    width: options.width,
    height: options.height,
    container: "mp4",
  });

  if (!support.canRender) {
    const message =
      support.issues.map((issue) => issue.message).join("; ") ||
      "Browser export is not supported in this browser. Try Chrome 94+.";
    throw new Error(message);
  }

  const inputProps: VideoCompositionData = {
    fps: VIDEO_FPS,
    width: options.width,
    height: options.height,
    scenes: options.scenes,
  };

  const { getBlob } = await renderMediaOnWeb({
    composition: {
      id: "Prompt2Video",
      component:
        Prompt2VideoComposition as unknown as FC<Record<string, unknown>>,
      durationInFrames,
      fps: VIDEO_FPS,
      width: options.width,
      height: options.height,
    },
    inputProps: inputProps as unknown as Record<string, unknown>,
    container: "mp4",
    onProgress: ({ progress }) => {
      options.onProgress?.(Math.round(progress * 100));
    },
  });

  return getBlob();
}
