import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { setRenderJobProgress } from "../queue";
import { db } from "../db";
import { uploadFile } from "../storage";
import { nanoid } from "nanoid";
import type { VideoCompositionData } from "@/types/video";

let bundled: string | null = null;

async function getBundled(): Promise<string> {
  if (!bundled) {
    bundled = await bundle({
      entryPoint: path.resolve(process.cwd(), "src/remotion/index.ts"),
      webpackOverride: (config) => config,
    });
  }
  return bundled;
}

export interface RenderOptions {
  renderJobId: string;
  videoId: string;
  compositionData: VideoCompositionData;
  type: "preview" | "final" | "thumbnail";
  onProgress?: (progress: number) => void;
}

export async function renderVideo(options: RenderOptions): Promise<string> {
  const { renderJobId, videoId, compositionData, type, onProgress } = options;

  await setRenderJobProgress({
    renderJobId,
    progress: 0,
    status: "PROCESSING",
  });

  const bundleLocation = await getBundled();

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "Prompt2Video",
    inputProps: compositionData as unknown as Record<string, unknown>,
  });

  const outputDir = path.join(process.cwd(), "tmp", "renders");
  const fs = await import("fs/promises");
  await fs.mkdir(outputDir, { recursive: true });
  const outputFilename = `${videoId}-${type}-${nanoid()}.mp4`;
  const outputPath = path.join(outputDir, outputFilename);

  const scale = type === "preview" ? 0.5 : type === "thumbnail" ? 0.25 : 1;

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: compositionData as unknown as Record<string, unknown>,
    scale,
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      onProgress?.(pct);
      setRenderJobProgress({
        renderJobId,
        progress: pct,
        status: "PROCESSING",
      });
    },
  });

  const fileBuffer = await fs.readFile(outputPath);
  const key = `renders/${videoId}/${outputFilename}`;
  const outputUrl = await uploadFile(fileBuffer, key, "video/mp4");

  await fs.unlink(outputPath).catch(() => {});

  await db.renderJob.update({
    where: { id: renderJobId },
    data: {
      status: "COMPLETED",
      progress: 100,
      outputUrl,
      completedAt: new Date(),
    },
  });

  if (type === "final") {
    await db.video.update({
      where: { id: videoId },
      data: { outputUrl, status: "COMPLETED" },
    });
  } else if (type === "thumbnail") {
    await db.video.update({
      where: { id: videoId },
      data: { thumbnailUrl: outputUrl },
    });
  } else if (type === "preview") {
    await db.video.update({
      where: { id: videoId },
      data: { status: "EDITING" },
    });
  }

  await setRenderJobProgress({
    renderJobId,
    progress: 100,
    status: "COMPLETED",
    outputUrl,
  });

  return outputUrl;
}
