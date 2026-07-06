import { db } from "./db";

export interface CreateVideoRecordOptions {
  prompt: string;
  userId: string;
  projectId?: string;
  templateId?: string;
  brandKitId?: string;
  duration?: number;
  style?: string;
}

export async function createVideoRecord(options: CreateVideoRecordOptions) {
  const { prompt, userId, projectId, templateId, brandKitId, duration, style } =
    options;

  return db.video.create({
    data: {
      title: "Generating...",
      prompt,
      status: "GENERATING",
      scriptData: {
        _generation: { progress: 5, step: "Starting generation..." },
        _options: { duration, style },
      },
      userId,
      projectId,
      templateId,
      brandKitId,
    },
  });
}
