import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import type { CaptionStyle } from "@/types/video";

interface Subtitle {
  text: string;
  startMs: number;
  endMs: number;
  words: { text: string; startMs: number; endMs: number }[];
}

interface Props {
  subtitles: Subtitle[];
  style?: CaptionStyle;
  sceneDurationFrames: number;
}

const DEFAULT_STYLE: CaptionStyle = {
  fontFamily: "Inter, sans-serif",
  fontSize: 48,
  fontWeight: 700,
  color: "#ffffff",
  backgroundColor: "rgba(0,0,0,0.7)",
  position: "bottom",
  padding: 16,
  borderRadius: 12,
};

export const CaptionOverlay: React.FC<Props> = ({
  subtitles,
  style: customStyle,
  sceneDurationFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;
  const style = { ...DEFAULT_STYLE, ...customStyle };

  const activeSubtitle = subtitles.find(
    (s) => currentMs >= s.startMs && currentMs < s.endMs
  );

  if (!activeSubtitle) return null;

  const subtitleStartFrame = (activeSubtitle.startMs / 1000) * fps;
  const subtitleEndFrame = (activeSubtitle.endMs / 1000) * fps;
  const subtitleDuration = subtitleEndFrame - subtitleStartFrame;

  const opacity = interpolate(
    frame,
    [
      subtitleStartFrame,
      subtitleStartFrame + 5,
      subtitleEndFrame - 5,
      subtitleEndFrame,
    ],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const translateY = interpolate(
    frame,
    [subtitleStartFrame, subtitleStartFrame + 8],
    [20, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const positionStyle: React.CSSProperties = {
    top: style.position === "top" ? "10%" : undefined,
    bottom: style.position === "bottom" ? "10%" : undefined,
    ...(style.position === "center" && { top: "50%", transform: `translateY(calc(-50% + ${translateY}px))` }),
  };

  return (
    <AbsoluteFill
      style={{
        justifyContent: style.position === "center" ? "center" : "flex-end",
        alignItems: "center",
        padding: 60,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          ...positionStyle,
          opacity,
          transform:
            style.position !== "center"
              ? `translateY(${translateY}px)`
              : positionStyle.transform,
          backgroundColor: style.backgroundColor,
          padding: `${style.padding}px ${style.padding * 1.5}px`,
          borderRadius: style.borderRadius,
          maxWidth: "80%",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            color: style.color,
            lineHeight: 1.4,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          {activeSubtitle.words.map((word, i) => {
            const isActive =
              currentMs >= word.startMs && currentMs < word.endMs;
            return (
              <span
                key={i}
                style={{
                  color: isActive ? "#fbbf24" : style.color,
                  transition: "color 0.1s",
                  marginRight: "0.3em",
                }}
              >
                {word.text}
              </span>
            );
          })}
        </span>
      </div>
    </AbsoluteFill>
  );
};
