import type { CaptionStyle, SceneData, VideoCompositionData } from "@/types/video";

export const VIDEO_FPS = 30;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;

export const DEFAULT_CAPTION_STYLE: CaptionStyle = {
  fontFamily: "Inter",
  fontSize: 48,
  fontWeight: 700,
  color: "#ffffff",
  backgroundColor: "rgba(0,0,0,0.6)",
  position: "bottom",
  padding: 16,
  borderRadius: 8,
};

type BrandKitInput = {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string | null;
  watermarkUrl?: string | null;
  captionStyle?: unknown;
};

export function mapBrandKit(brandKit?: BrandKitInput | null) {
  if (!brandKit) return undefined;
  return {
    primaryColor: brandKit.primaryColor,
    secondaryColor: brandKit.secondaryColor,
    logoUrl: brandKit.logoUrl,
    watermarkUrl: brandKit.watermarkUrl,
    captionStyle: brandKit.captionStyle as CaptionStyle | null,
  };
}

export function buildRemotionData(
  scenes: SceneData[],
  brandKit?: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string | null;
    watermarkUrl?: string | null;
    captionStyle?: CaptionStyle | null;
  },
  dimensions?: { width?: number; height?: number; fps?: number }
): VideoCompositionData {
  const captionStyle = brandKit?.captionStyle ?? DEFAULT_CAPTION_STYLE;
  const width = dimensions?.width ?? VIDEO_WIDTH;
  const height = dimensions?.height ?? VIDEO_HEIGHT;
  const fps = dimensions?.fps ?? VIDEO_FPS;

  return {
    fps,
    width,
    height,
    scenes: scenes.map((scene, index) => ({
      ...scene,
      order: index,
      captionStyle: scene.captionStyle ?? captionStyle,
    })),
    brandKit: brandKit
      ? {
          primaryColor: brandKit.primaryColor,
          secondaryColor: brandKit.secondaryColor,
          logoUrl: brandKit.logoUrl,
          watermarkUrl: brandKit.watermarkUrl,
          watermarkOpacity: 0.3,
        }
      : undefined,
  };
}

export function calculateTotalDuration(scenes: SceneData[]): number {
  return scenes.reduce((sum, scene) => sum + scene.duration / scene.speed, 0);
}

export function durationToFrames(durationSeconds: number, fps = VIDEO_FPS): number {
  return Math.ceil(durationSeconds * fps);
}

export function framesToDuration(frames: number, fps = VIDEO_FPS): number {
  return frames / fps;
}
