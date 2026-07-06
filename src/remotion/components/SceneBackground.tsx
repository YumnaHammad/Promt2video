import React from "react";
import { AbsoluteFill, Img, Video, useCurrentFrame, interpolate } from "remotion";
import type { SceneData } from "@/types/video";

interface Props {
  scene: SceneData;
}

export const SceneBackground: React.FC<Props> = ({ scene }) => {
  const frame = useCurrentFrame();
  const primaryAsset = scene.assets.find((a) => a.role === "background") ?? scene.assets[0];

  if (!primaryAsset) {
    return (
      <AbsoluteFill
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      />
    );
  }

  const kenBurnsScale = interpolate(frame, [0, 150], [1, 1.1], {
    extrapolateRight: "clamp",
  });

  const kenBurnsX = interpolate(frame, [0, 150], [0, -20], {
    extrapolateRight: "clamp",
  });

  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: `scale(${kenBurnsScale * primaryAsset.scale}) translateX(${kenBurnsX}px)`,
    opacity: primaryAsset.opacity,
  };

  if (primaryAsset.type === "VIDEO") {
    return (
      <AbsoluteFill>
        <Video src={primaryAsset.url} style={style} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <Img src={primaryAsset.url} style={style} />
    </AbsoluteFill>
  );
};
