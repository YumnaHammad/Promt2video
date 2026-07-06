import { Composition } from "remotion";
import type { ComponentType } from "react";
import { Prompt2VideoComposition } from "./compositions/Prompt2VideoComposition";
import { VIDEO_FPS, VIDEO_WIDTH, VIDEO_HEIGHT } from "@/lib/remotion/builder";
import type { VideoCompositionData } from "@/types/video";

export const RemotionRoot: React.FC = () => {
  const defaultProps: VideoCompositionData = {
    fps: VIDEO_FPS,
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    scenes: [],
  };

  return (
    <>
      <Composition
        id="Prompt2Video"
        component={
          Prompt2VideoComposition as unknown as ComponentType<Record<string, unknown>>
        }
        durationInFrames={VIDEO_FPS * 30}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultProps as unknown as Record<string, unknown>}
        calculateMetadata={({ props }) => {
          const data = props as unknown as VideoCompositionData;
          const totalDuration = data.scenes.reduce(
            (sum, scene) => sum + scene.duration / scene.speed,
            0
          );
          return {
            durationInFrames:
              Math.ceil(totalDuration * data.fps) || VIDEO_FPS * 5,
            width: data.width || VIDEO_WIDTH,
            height: data.height || VIDEO_HEIGHT,
            fps: data.fps || VIDEO_FPS,
            props,
          };
        }}
      />
    </>
  );
};
