import { Queue, Worker, Job } from "bullmq";
import { redis, redisConnectionOptions } from "./redis";
import { db } from "./db";
import type { RenderJobStatus } from "@/generated/prisma/client";

export const RENDER_QUEUE_NAME = "render-queue";

export interface RenderJobData {
  renderJobId: string;
  videoId: string;
  type: "preview" | "final" | "thumbnail";
  userId: string;
}

export interface RenderProgress {
  renderJobId: string;
  progress: number;
  status: RenderJobStatus;
  outputUrl?: string;
  error?: string;
}

export const renderQueue = new Queue<RenderJobData>(RENDER_QUEUE_NAME, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export async function isRedisAvailable(): Promise<boolean> {
  try {
    const result = await redis.ping();
    return result === "PONG";
  } catch {
    return false;
  }
}

export async function enqueueRenderJob(
  data: RenderJobData,
  priority = 0
): Promise<"queued" | "inline"> {
  if (!(await isRedisAvailable())) {
    return "inline";
  }

  try {
    await renderQueue.add(`render-${data.type}`, data, {
      priority,
      jobId: data.renderJobId,
    });
    return "queued";
  } catch {
    return "inline";
  }
}

export async function cancelRenderJob(jobId: string): Promise<boolean> {
  const job = await renderQueue.getJob(jobId);
  if (!job) return false;
  const state = await job.getState();
  if (state === "active") {
    await job.moveToFailed(new Error("Canceled by user"), "cancel");
  } else {
    await job.remove();
  }
  return true;
}

export async function getRenderJobProgress(
  jobId: string
): Promise<RenderProgress | null> {
  const data = await redis.get(`render:progress:${jobId}`);
  if (!data) return null;
  return JSON.parse(data) as RenderProgress;
}

export async function setRenderJobProgress(
  progress: RenderProgress
): Promise<void> {
  try {
    await redis.set(
      `render:progress:${progress.renderJobId}`,
      JSON.stringify(progress),
      "EX",
      86400
    );
  } catch {
    // Redis optional — progress still stored on RenderJob row
  }

  await db.renderJob.update({
    where: { id: progress.renderJobId },
    data: {
      progress: progress.progress,
      status: progress.status,
      ...(progress.outputUrl ? { outputUrl: progress.outputUrl } : {}),
      ...(progress.error ? { error: progress.error } : {}),
    },
  }).catch(() => {});
}

export function createRenderWorker(
  processor: (job: Job<RenderJobData>) => Promise<void>
): Worker<RenderJobData> {
  return new Worker<RenderJobData>(RENDER_QUEUE_NAME, processor, {
    connection: redisConnectionOptions,
    concurrency: 2,
    limiter: { max: 5, duration: 60000 },
  });
}
