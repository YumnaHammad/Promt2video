import { createRenderWorker } from "@/lib/queue";
import { processRenderJob } from "@/lib/render-job";

console.log("Starting render worker...");

const worker = createRenderWorker(async (job) => {
  const { renderJobId, videoId, type } = job.data;
  console.log(`Processing render job ${renderJobId} for video ${videoId}`);

  try {
    await processRenderJob({ renderJobId, videoId, type });
    console.log(`Render job ${renderJobId} completed`);
  } catch (error) {
    console.error(`Render job ${renderJobId} failed:`, error);
    throw error;
  }
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
