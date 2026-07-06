import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  Video,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import type { VideoCompositionData, SceneData } from "@/types/video";
import { CaptionOverlay } from "../components/CaptionOverlay";
import { BrandOverlay } from "../components/BrandOverlay";
import { SceneBackground } from "../components/SceneBackground";

interface Props extends VideoCompositionData {}

const getTransition = (type: string) => {
  switch (type) {
    case "slide":
      return slide();
    case "fade":
    default:
      return fade();
  }
};

const SceneRenderer: React.FC<{ scene: SceneData }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDurationFrames = Math.ceil((scene.duration / scene.speed) * fps);

  const entrance = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const scale = interpolate(entrance, [0, 1], [1.05, 1]);

  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      <SceneBackground scene={scene} />
      {scene.audioUrl && (
        <Audio src={scene.audioUrl} volume={scene.volume} />
      )}
      {scene.subtitles && scene.subtitles.length > 0 && (
        <CaptionOverlay
          subtitles={scene.subtitles}
          style={scene.captionStyle}
          sceneDurationFrames={sceneDurationFrames}
        />
      )}
    </AbsoluteFill>
  );
};

export const Prompt2VideoComposition: React.FC<Props> = ({
  scenes,
  brandKit,
  musicUrl,
  musicVolume = 0.3,
}) => {
  const { fps } = useVideoConfig();

  if (!scenes || scenes.length === 0) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#0a0a0a",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            color: "#fff",
            fontSize: 48,
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
          }}
        >
          Prompt2Video AI
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {musicUrl && <Audio src={musicUrl} volume={musicVolume} />}

      <TransitionSeries>
        {scenes.map((scene, index) => {
          const durationFrames = Math.ceil(
            (scene.duration / scene.speed) * fps
          );
          const transition = getTransition(scene.transition);

          return (
            <React.Fragment key={scene.id}>
              {index > 0 && (
                <TransitionSeries.Transition
                  presentation={transition}
                  timing={linearTiming({ durationInFrames: 15 })}
                />
              )}
              <TransitionSeries.Sequence durationInFrames={durationFrames}>
                <SceneRenderer scene={scene} />
              </TransitionSeries.Sequence>
            </React.Fragment>
          );
        })}
      </TransitionSeries>

      {brandKit && <BrandOverlay brandKit={brandKit} />}
    </AbsoluteFill>
  );
};
