export interface GenerationMeta {
  progress: number;
  step: string;
}

export function readGenerationMeta(scriptData: unknown): GenerationMeta | null {
  if (!scriptData || typeof scriptData !== "object") return null;
  const meta = (scriptData as Record<string, unknown>)._generation;
  if (!meta || typeof meta !== "object") return null;
  const { progress, step } = meta as GenerationMeta;
  if (typeof progress !== "number" || typeof step !== "string") return null;
  return { progress, step };
}

export function inferGenerationProgress(
  status: string,
  sceneCount: number,
  meta: GenerationMeta | null
): { progress: number; step: string } {
  if (meta) return meta;

  if (status === "EDITING" || status === "COMPLETED") {
    return { progress: 100, step: "Ready to edit!" };
  }
  if (status === "FAILED") {
    return { progress: 0, step: "Generation failed" };
  }
  if (status === "RENDERING") {
    return { progress: 50, step: "Rendering video..." };
  }
  if (sceneCount > 0) {
    return {
      progress: Math.min(85, 25 + sceneCount * 10),
      step: `Building scenes (${sceneCount} done)...`,
    };
  }
  return { progress: 10, step: "Writing your video script..." };
}
