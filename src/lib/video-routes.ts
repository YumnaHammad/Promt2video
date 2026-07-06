export function getVideoHref(video: { id: string; status: string }): string {
  if (["GENERATING", "RENDERING", "FAILED"].includes(video.status)) {
    return `/videos/${video.id}`;
  }
  return `/editor/${video.id}`;
}
