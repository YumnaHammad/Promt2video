import { db } from "./db";
import { generateScript } from "./ai/script";
import { fetchAssetsForScene, saveAssetToDb } from "./ai/assets";
import { generateTTS } from "./ai/tts";
import { isDemoMode } from "./demo-mode";
import { buildRemotionData, mapBrandKit } from "./remotion/builder";
import { createVideoRecord } from "./video-records";

export { createVideoRecord };
import { getPlatformPreset, resolveVideoDimensions } from "./platform-presets";
import { DEFAULT_FREE_VOICE } from "./voices";
import {
  assertNotCancelled,
  clearVideoCancellation,
  isVideoCancelled,
  VideoCancelledError,
} from "./cancellation";
import type { SceneData } from "@/types/video";

export interface PipelineOptions {
  prompt: string;
  userId: string;
  projectId?: string;
  templateId?: string;
  brandKitId?: string;
  useOwnKeys?: boolean;
  duration?: number;
  style?: string;
  videoId?: string;
}

async function updateGenerationProgress(
  videoId: string,
  progress: number,
  step: string
) {
  const video = await db.video.findUnique({
    where: { id: videoId },
    select: { scriptData: true },
  });
  const scriptData =
    video?.scriptData && typeof video.scriptData === "object"
      ? (video.scriptData as Record<string, unknown>)
      : {};

  await db.video.update({
    where: { id: videoId },
    data: {
      scriptData: {
        ...scriptData,
        _generation: {
          progress: Math.min(100, Math.max(0, progress)),
          step,
        },
      },
    },
  });
}

export async function runVideoPipeline(options: PipelineOptions) {
  const {
    prompt,
    userId,
    projectId,
    templateId,
    brandKitId,
    useOwnKeys,
    videoId: existingVideoId,
  } = options;

  const video =
    existingVideoId != null
      ? await db.video.findUniqueOrThrow({ where: { id: existingVideoId } })
      : await createVideoRecord(options);

  try {
    assertNotCancelled(video.id);

    await updateGenerationProgress(
      video.id,
      10,
      "Writing your video script..."
    );

    const script = await generateScript(prompt, userId, {
      duration: options.duration,
      style: options.style,
      useOwnKeys,
    });

    await db.video.update({
      where: { id: video.id },
      data: {
        title: script.title,
        description: script.description,
        scriptData: {
          ...(script as object),
          _generation: {
            progress: 25,
            step: "Script ready — building scenes...",
          },
        },
      },
    });

    assertNotCancelled(video.id);

    const scenes: SceneData[] = [];
    const sceneCount = script.scenes.length;
    const sceneProgressSpan = 60;

    for (let i = 0; i < sceneCount; i++) {
      assertNotCancelled(video.id);

      const scriptScene = script.scenes[i];
      const sceneBase =
        25 + Math.floor((sceneProgressSpan * i) / sceneCount);

      await updateGenerationProgress(
        video.id,
        sceneBase,
        `Scene ${i + 1} of ${sceneCount}: finding visuals...`
      );

      const assets = await fetchAssetsForScene(
        scriptScene.visualPrompt,
        "image",
        1
      );

      const assetIds: SceneData["assets"] = [];
      if (assets.length > 0) {
        const assetId = await saveAssetToDb(assets[0], userId);
        assetIds.push({
          id: assetId,
          url: assets[0].url,
          type: assets[0].type as "IMAGE" | "VIDEO" | "AUDIO",
          role: "background",
          startTime: 0,
          opacity: 1,
          scale: 1,
        });
      }

      await updateGenerationProgress(
        video.id,
        sceneBase + Math.floor(sceneProgressSpan / sceneCount / 2),
        `Scene ${i + 1} of ${sceneCount}: generating voiceover...`
      );

      const tts = await generateTTS(scriptScene.narration, undefined, {
        fast: isDemoMode(),
      });

      const sceneRecord = await db.scene.create({
        data: {
          videoId: video.id,
          order: i,
          title: scriptScene.title,
          narration: scriptScene.narration,
          visualPrompt: scriptScene.visualPrompt,
          duration: tts.duration || scriptScene.duration,
          voice: {
            create: {
              provider: "edge-tts",
              voiceId: tts.voiceId,
              audioUrl: tts.audioUrl,
              duration: tts.duration,
              transcript: scriptScene.narration,
              subtitles: tts.subtitles as object,
            },
          },
        },
      });

      if (assetIds.length > 0) {
        await db.sceneAsset.create({
          data: {
            sceneId: sceneRecord.id,
            assetId: assetIds[0].id,
            role: "background",
          },
        });
      }

      scenes.push({
        id: sceneRecord.id,
        order: i,
        title: scriptScene.title,
        narration: scriptScene.narration,
        visualPrompt: scriptScene.visualPrompt,
        duration: tts.duration || scriptScene.duration,
        speed: 1,
        volume: 1,
        transition: i === 0 ? "fade" : "slide",
        assets: assetIds,
        audioUrl: tts.audioUrl,
        subtitles: tts.subtitles,
      });

      await updateGenerationProgress(
        video.id,
        25 + Math.floor((sceneProgressSpan * (i + 1)) / sceneCount),
        `Scene ${i + 1} of ${sceneCount} complete`
      );
    }

    assertNotCancelled(video.id);

    await updateGenerationProgress(
      video.id,
      90,
      "Assembling your video..."
    );

    let brandKit;
    if (brandKitId) {
      brandKit = await db.brandKit.findUnique({ where: { id: brandKitId } });
    }

    const remotionData = buildRemotionData(scenes, mapBrandKit(brandKit));
    const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

    await db.video.update({
      where: { id: video.id },
      data: {
        status: "EDITING",
        duration: totalDuration,
        remotionData: remotionData as object,
        subtitleData: scenes.flatMap((s) => s.subtitles ?? []) as object,
        scriptData: {
          ...(script as object),
          _generation: { progress: 100, step: "Ready to edit!" },
        },
      },
    });

    clearVideoCancellation(video.id);
    return { videoId: video.id, scenes, remotionData };
  } catch (error) {
    if (error instanceof VideoCancelledError || isVideoCancelled(video.id)) {
      clearVideoCancellation(video.id);
      await db.video.update({
        where: { id: video.id },
        data: {
          status: "ARCHIVED",
          scriptData: {
            _generation: { progress: 0, step: "Cancelled by user" },
          },
        },
      });
      return { videoId: video.id, cancelled: true };
    }

    await db.video.update({
      where: { id: video.id },
      data: {
        status: "FAILED",
        scriptData: {
          _generation: { progress: 0, step: "Generation failed" },
        },
      },
    });
    throw error;
  }
}

export async function startRender(
  videoId: string,
  userId: string,
  type: "preview" | "final" | "thumbnail" = "final",
  options?: { platformId?: string }
) {
  const video = await db.video.findFirst({
    where: { id: videoId, userId },
    include: {
      scenes: {
        include: {
          assets: { include: { asset: true } },
          voice: true,
        },
        orderBy: { order: "asc" },
      },
      brandKit: true,
    },
  });

  if (!video) throw new Error("Video not found");

  const preset = options?.platformId
    ? getPlatformPreset(options.platformId)
    : null;
  const dimensions = preset
    ? {
        width: preset.width,
        height: preset.height,
        aspectRatio: preset.aspectRatio,
      }
    : resolveVideoDimensions(video);

  const scenes: SceneData[] = video.scenes.map((scene) => ({
    id: scene.id,
    order: scene.order,
    title: scene.title ?? undefined,
    narration: scene.narration ?? undefined,
    visualPrompt: scene.visualPrompt ?? undefined,
    duration: scene.duration,
    speed: scene.speed,
    volume: scene.volume,
    transition: scene.transition,
    assets: scene.assets.map((sa) => ({
      id: sa.asset.id,
      url: sa.asset.url,
      type: sa.asset.type as "IMAGE" | "VIDEO" | "AUDIO",
      role: sa.role,
      startTime: sa.startTime,
      endTime: sa.endTime ?? undefined,
      opacity: sa.opacity,
      scale: sa.scale,
    })),
    audioUrl: scene.voice?.audioUrl ?? undefined,
    subtitles: (scene.voice?.subtitles as SceneData["subtitles"]) ?? undefined,
    captionStyle: (scene.captionStyle as unknown as SceneData["captionStyle"]) ?? undefined,
  }));

  const remotionData = buildRemotionData(
    scenes,
    mapBrandKit(video.brandKit),
    { width: dimensions.width, height: dimensions.height }
  );

  const renderJob = await db.renderJob.create({
    data: {
      videoId,
      type,
      status: "QUEUED",
      metadata: preset ? { platformId: preset.id } : undefined,
    },
  });

  await db.video.update({
    where: { id: videoId },
    data: {
      status: "RENDERING",
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: dimensions.aspectRatio,
      remotionData: remotionData as object,
      scriptData: {
        _generation: {
          progress: 0,
          step: `Exporting for ${preset?.label ?? "video"}...`,
        },
      },
    },
  });

  const { enqueueRenderJob } = await import("./queue");
  const mode = await enqueueRenderJob({
    renderJobId: renderJob.id,
    videoId,
    type,
    userId,
  });

  if (mode === "inline") {
    const { runRenderJobInBackground } = await import("./render-job");
    runRenderJobInBackground({
      renderJobId: renderJob.id,
      videoId,
      type,
    });
  }

  return renderJob;
}
