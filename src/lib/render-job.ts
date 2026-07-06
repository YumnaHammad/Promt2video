import { renderVideo } from "./remotion/renderer";
import { db } from "./db";

export interface ProcessRenderJobOptions {
  renderJobId: string;
  videoId: string;
  type: "preview" | "final" | "thumbnail";
}

export async function processRenderJob(
  options: ProcessRenderJobOptions
): Promise<void> {
  const { renderJobId, videoId, type } = options;

  await db.renderJob.update({
    where: { id: renderJobId },
    data: { status: "PROCESSING", startedAt: new Date() },
  });

  const video = await db.video.findUnique({
    where: { id: videoId },
    include: {
      scenes: {
        include: {
          assets: { include: { asset: true } },
          voice: true,
        },
        orderBy: { order: "asc" },
      },
      brandKit: true,
    },
  });

  if (!video?.remotionData) {
    throw new Error("Video composition data not found");
  }

  try {
    await renderVideo({
      renderJobId,
      videoId,
      compositionData: video.remotionData as never,
      type,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Render failed";
    await db.renderJob.update({
      where: { id: renderJobId },
      data: {
        status: "FAILED",
        error: message,
        retryCount: { increment: 1 },
      },
    });

    if (type === "final") {
      await db.video.update({
        where: { id: videoId },
        data: { status: "EDITING" },
      });
    } else if (type === "preview") {
      await db.video.update({
        where: { id: videoId },
        data: { status: "EDITING" },
      });
    }

    throw error;
  }
}

export function runRenderJobInBackground(
  options: ProcessRenderJobOptions
): void {
  void processRenderJob(options).catch((error) => {
    console.error(`Inline render failed for ${options.renderJobId}:`, error);
  });
}
