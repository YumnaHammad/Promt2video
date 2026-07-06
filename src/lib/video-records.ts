import { db } from "./db";

export interface CreateVideoRecordOptions {
  prompt: string;
  userId: string;
  projectId?: string;
  templateId?: string;
  brandKitId?: string;
}

export async function createVideoRecord(options: CreateVideoRecordOptions) {
  const { prompt, userId, projectId, templateId, brandKitId } = options;

  return db.video.create({
    data: {
      title: "Generating...",
      prompt,
      status: "GENERATING",
      scriptData: {
        _generation: { progress: 5, step: "Starting generation..." },
      },
      userId,
      projectId,
      templateId,
      brandKitId,
    },
  });
}
