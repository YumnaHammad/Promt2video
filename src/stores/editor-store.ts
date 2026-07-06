"use client";

import { create } from "zustand";
import type { SceneData, VideoEditorState } from "@/types/video";
import { DEFAULT_PLATFORM_ID, getPlatformPreset } from "@/lib/platform-presets";

const defaultPlatform = getPlatformPreset(DEFAULT_PLATFORM_ID);

interface EditorStore extends VideoEditorState {
  scenes: SceneData[];
  videoId: string | null;
  title: string;
  isDirty: boolean;
  setVideoId: (id: string) => void;
  setTitle: (title: string) => void;
  setScenes: (scenes: SceneData[]) => void;
  setExportSettings: (settings: {
    platformId?: string;
    width?: number;
    height?: number;
    aspectRatio?: string;
    outputUrl?: string | null;
  }) => void;
  addScene: (scene: SceneData) => void;
  updateScene: (id: string, updates: Partial<SceneData>) => void;
  deleteScene: (id: string) => void;
  duplicateScene: (id: string) => void;
  reorderScenes: (fromIndex: number, toIndex: number) => void;
  splitScene: (id: string, atFrame: number) => void;
  selectScene: (id: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentFrame: (frame: number) => void;
  setZoom: (zoom: number) => void;
  toggleSafeZones: () => void;
  toggleCaptions: () => void;
  markDirty: () => void;
  markClean: () => void;
  reset: () => void;
}

const initialState: VideoEditorState & {
  scenes: SceneData[];
  videoId: string | null;
  title: string;
  isDirty: boolean;
} = {
  scenes: [],
  videoId: null,
  title: "Untitled Video",
  isDirty: false,
  selectedSceneId: null,
  isPlaying: false,
  currentFrame: 0,
  zoom: 1,
  showSafeZones: false,
  showCaptions: true,
  platformId: DEFAULT_PLATFORM_ID,
  width: defaultPlatform.width,
  height: defaultPlatform.height,
  aspectRatio: defaultPlatform.aspectRatio,
  outputUrl: null,
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  setVideoId: (id) => set({ videoId: id }),
  setTitle: (title) => set({ title, isDirty: true }),
  setScenes: (scenes) => set({ scenes }),

  setExportSettings: (settings) =>
    set((state) => ({
      platformId: settings.platformId ?? state.platformId,
      width: settings.width ?? state.width,
      height: settings.height ?? state.height,
      aspectRatio: settings.aspectRatio ?? state.aspectRatio,
      outputUrl:
        settings.outputUrl !== undefined ? settings.outputUrl : state.outputUrl,
    })),

  addScene: (scene) =>
    set((state) => ({
      scenes: [...state.scenes, { ...scene, order: state.scenes.length }],
      isDirty: true,
    })),

  updateScene: (id, updates) =>
    set((state) => ({
      scenes: state.scenes.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
      isDirty: true,
    })),

  deleteScene: (id) =>
    set((state) => ({
      scenes: state.scenes
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, order: i })),
      selectedSceneId:
        state.selectedSceneId === id ? null : state.selectedSceneId,
      isDirty: true,
    })),

  duplicateScene: (id) => {
    const scene = get().scenes.find((s) => s.id === id);
    if (!scene) return;
    const newScene: SceneData = {
      ...scene,
      id: crypto.randomUUID(),
      title: `${scene.title} (copy)`,
      order: get().scenes.length,
    };
    set((state) => ({
      scenes: [...state.scenes, newScene],
      isDirty: true,
    }));
  },

  reorderScenes: (fromIndex, toIndex) =>
    set((state) => {
      const scenes = [...state.scenes];
      const [removed] = scenes.splice(fromIndex, 1);
      scenes.splice(toIndex, 0, removed);
      return {
        scenes: scenes.map((s, i) => ({ ...s, order: i })),
        isDirty: true,
      };
    }),

  splitScene: (id, atFrame) => {
    const scene = get().scenes.find((s) => s.id === id);
    if (!scene) return;
    const splitDuration = atFrame / 30;
    if (splitDuration <= 0 || splitDuration >= scene.duration) return;

    const firstHalf: SceneData = {
      ...scene,
      duration: splitDuration,
    };
    const secondHalf: SceneData = {
      ...scene,
      id: crypto.randomUUID(),
      duration: scene.duration - splitDuration,
      order: scene.order + 1,
    };

    set((state) => {
      const scenes = state.scenes.map((s) => (s.id === id ? firstHalf : s));
      scenes.splice(scene.order + 1, 0, secondHalf);
      return {
        scenes: scenes.map((s, i) => ({ ...s, order: i })),
        isDirty: true,
      };
    });
  },

  selectScene: (id) => set({ selectedSceneId: id }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentFrame: (frame) => set({ currentFrame: frame }),
  setZoom: (zoom) => set({ zoom }),
  toggleSafeZones: () =>
    set((state) => ({ showSafeZones: !state.showSafeZones })),
  toggleCaptions: () =>
    set((state) => ({ showCaptions: !state.showCaptions })),
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),
  reset: () => set(initialState),
}));
