export const DEMO_SILENT_AUDIO_PATH = "/api/demo/silent-audio";

export function isDemoPlaceholderAudio(audioUrl?: string | null): boolean {
  return Boolean(audioUrl?.includes(DEMO_SILENT_AUDIO_PATH));
}
