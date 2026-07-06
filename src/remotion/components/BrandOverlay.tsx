import React from "react";
import { AbsoluteFill, Img } from "remotion";
import type { BrandKitData } from "@/types/video";

interface Props {
  brandKit: BrandKitData;
}

export const BrandOverlay: React.FC<Props> = ({ brandKit }) => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {brandKit.logoUrl && (
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            width: 120,
            height: 60,
          }}
        >
          <Img
            src={brandKit.logoUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      )}

      {brandKit.watermarkUrl && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 40,
            width: 80,
            height: 40,
            opacity: brandKit.watermarkOpacity,
          }}
        >
          <Img
            src={brandKit.watermarkUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
