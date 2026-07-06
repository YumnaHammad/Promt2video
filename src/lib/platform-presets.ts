export interface PlatformPreset {
  id: string;
  label: string;
  description: string;
  width: number;
  height: number;
  aspectRatio: string;
  maxDuration: number;
  icon: string;
}

export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: "youtube",
    label: "YouTube",
    description: "Landscape 16:9 — standard uploads",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    maxDuration: 600,
    icon: "▶",
  },
  {
    id: "tiktok",
    label: "TikTok",
    description: "Vertical 9:16 — short-form",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    maxDuration: 180,
    icon: "♪",
  },
  {
    id: "instagram_reels",
    label: "Instagram Reels",
    description: "Vertical 9:16 — reels & stories",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    maxDuration: 90,
    icon: "◎",
  },
  {
    id: "instagram_feed",
    label: "Instagram Feed",
    description: "Square 1:1 — feed posts",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    maxDuration: 60,
    icon: "□",
  },
  {
    id: "facebook",
    label: "Facebook",
    description: "Landscape 16:9 — feed & ads",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    maxDuration: 240,
    icon: "f",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    description: "Landscape 16:9 — professional",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    maxDuration: 600,
    icon: "in",
  },
  {
    id: "twitter",
    label: "X / Twitter",
    description: "Landscape 16:9 — posts",
    width: 1280,
    height: 720,
    aspectRatio: "16:9",
    maxDuration: 140,
    icon: "𝕏",
  },
];

export const DEFAULT_PLATFORM_ID = "youtube";

export function getPlatformPreset(id: string): PlatformPreset {
  return (
    PLATFORM_PRESETS.find((p) => p.id === id) ??
    PLATFORM_PRESETS.find((p) => p.id === DEFAULT_PLATFORM_ID)!
  );
}

export function resolveVideoDimensions(video: {
  width?: number;
  height?: number;
  aspectRatio?: string;
}): { width: number; height: number; aspectRatio: string } {
  if (video.width && video.height) {
    return {
      width: video.width,
      height: video.height,
      aspectRatio: video.aspectRatio ?? `${video.width}:${video.height}`,
    };
  }

  const preset = PLATFORM_PRESETS.find((p) => p.aspectRatio === video.aspectRatio);
  if (preset) {
    return {
      width: preset.width,
      height: preset.height,
      aspectRatio: preset.aspectRatio,
    };
  }

  const fallback = getPlatformPreset(DEFAULT_PLATFORM_ID);
  return {
    width: fallback.width,
    height: fallback.height,
    aspectRatio: fallback.aspectRatio,
  };
}
