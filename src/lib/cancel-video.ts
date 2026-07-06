import { db } from "./db";
import {
  assertNotCancelled,
  clearVideoCancellation,
  requestVideoCancellation,
  VideoCancelledError,
} from "./cancellation";
import { cancelRenderJob, setRenderJobProgress } from "./queue";

export async function cancelVideo(videoId: string, userId: string) {
  const video = await db.video.findFirst({
    where: { id: videoId, userId },
    include: {
      scenes: { select: { id: true } },
      renderJobs: {
        where: { status: { in: ["QUEUED", "PROCESSING"] } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!video) throw new Error("Video not found");

  if (!["GENERATING", "RENDERING"].includes(video.status)) {
    throw new Error("Nothing to cancel");
  }

  requestVideoCancellation(videoId);

  if (video.status === "RENDERING") {
    for (const job of video.renderJobs) {
      await cancelRenderJob(job.id).catch(() => {});
      await db.renderJob.update({
        where: { id: job.id },
        data: {
          status: "CANCELED",
          error: "Cancelled by user",
        },
      });
      await setRenderJobProgress({
        renderJobId: job.id,
        progress: 0,
        status: "CANCELED",
        error: "Cancelled by user",
      }).catch(() => {});
    }

    const hasScenes = video.scenes.length > 0;
    await db.video.update({
      where: { id: videoId },
      data: {
        status: hasScenes ? "EDITING" : "ARCHIVED",
        scriptData: {
          _generation: { progress: 0, step: "Export cancelled" },
        },
      },
    });

    clearVideoCancellation(videoId);

    return {
      cancelled: true,
      previousStatus: video.status,
      redirectTo: hasScenes ? `/editor/${videoId}` : "/dashboard",
    };
  }

  await db.video.update({
    where: { id: videoId },
    data: {
      status: "ARCHIVED",
      scriptData: {
        _generation: { progress: 0, step: "Cancelled by user" },
      },
    },
  });

  clearVideoCancellation(videoId);

  return {
    cancelled: true,
    previousStatus: video.status,
    redirectTo: "/dashboard",
  };
}

export { VideoCancelledError };
