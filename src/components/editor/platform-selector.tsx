"use client";

import { Monitor, Smartphone, Square } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { PLATFORM_PRESETS } from "@/lib/platform-presets";
import { cn } from "@/lib/utils";

export function PlatformSelector() {
  const platformId = useEditorStore((s) => s.platformId);
  const setExportSettings = useEditorStore((s) => s.setExportSettings);

  return (
    <div className="rounded-xl border border-border/50 bg-card/30 p-4 backdrop-blur-xl">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Monitor className="h-4 w-4 text-primary" />
        Export Format
      </h3>
      <p className="mb-3 text-xs text-muted-foreground">
        Preview and export size for your target platform.
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {PLATFORM_PRESETS.slice(0, 6).map((platform) => {
          const isVertical = platform.height > platform.width;
          const isSquare = platform.width === platform.height;
          const Icon = isSquare ? Square : isVertical ? Smartphone : Monitor;

          return (
            <button
              key={platform.id}
              type="button"
              onClick={() =>
                setExportSettings({
                  platformId: platform.id,
                  width: platform.width,
                  height: platform.height,
                  aspectRatio: platform.aspectRatio,
                })
              }
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-center transition-all",
                platformId === platform.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 hover:bg-accent/30"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px] font-medium leading-tight">
                {platform.label.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
