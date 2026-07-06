export class VideoCancelledError extends Error {
  constructor() {
    super("Video cancelled by user");
    this.name = "VideoCancelledError";
  }
}

const cancelledVideos = new Set<string>();

export function requestVideoCancellation(videoId: string): void {
  cancelledVideos.add(videoId);
}

export function isVideoCancelled(videoId: string): boolean {
  return cancelledVideos.has(videoId);
}

export function clearVideoCancellation(videoId: string): void {
  cancelledVideos.delete(videoId);
}

export function assertNotCancelled(videoId: string): void {
  if (isVideoCancelled(videoId)) {
    throw new VideoCancelledError();
  }
}
