export interface CaptionStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  backgroundColor: string;
  position: "top" | "center" | "bottom";
  padding: number;
  borderRadius: number;
}

export interface SubtitleWord {
  text: string;
  startMs: number;
  endMs: number;
}

export interface SceneAsset {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO" | "AUDIO";
  role: string;
  startTime: number;
  endTime?: number;
  opacity: number;
  scale: number;
}

export interface SceneData {
  id: string;
  order: number;
  title?: string;
  narration?: string;
  duration: number;
  speed: number;
  volume: number;
  transition: string;
  assets: SceneAsset[];
  audioUrl?: string;
  voiceId?: string;
  subtitles?: {
    text: string;
    startMs: number;
    endMs: number;
    words: SubtitleWord[];
  }[];
  captionStyle?: CaptionStyle;
  visualPrompt?: string;
}

export interface BrandKitData {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string | null;
  watermarkUrl?: string | null;
  watermarkOpacity: number;
}

export interface VideoCompositionData {
  fps: number;
  width: number;
  height: number;
  scenes: SceneData[];
  brandKit?: BrandKitData;
  musicUrl?: string;
  musicVolume?: number;
}

export interface VideoEditorState {
  selectedSceneId: string | null;
  isPlaying: boolean;
  currentFrame: number;
  zoom: number;
  showSafeZones: boolean;
  showCaptions: boolean;
  platformId: string;
  width: number;
  height: number;
  aspectRatio: string;
  outputUrl: string | null;
}

export interface TemplatePreview {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  isPremium: boolean;
  price: number;
  sceneCount: number;
  duration: number;
  rating: number;
}

export interface ApiKeyInfo {
  provider: string;
  label: string;
  isValid: boolean;
  lastValidated: Date | null;
  usageCount: number;
  pricingUrl: string;
  docsUrl: string;
  estimatedCostPerVideo: number;
}

export interface RenderProgressUpdate {
  renderJobId: string;
  progress: number;
  status: string;
  outputUrl?: string;
  error?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  stripePriceId?: string;
  popular?: boolean;
}
