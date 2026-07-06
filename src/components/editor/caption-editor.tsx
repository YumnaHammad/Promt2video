"use client";

import { useEditorStore } from "@/stores/editor-store";
import { DEFAULT_CAPTION_STYLE } from "@/lib/remotion/builder";
import type { CaptionStyle } from "@/types/video";
import { cn } from "@/lib/utils";

const POSITIONS: CaptionStyle["position"][] = ["top", "center", "bottom"];

export function CaptionEditor() {
  const scenes = useEditorStore((s) => s.scenes);
  const selectedSceneId = useEditorStore((s) => s.selectedSceneId);
  const updateScene = useEditorStore((s) => s.updateScene);
  const showCaptions = useEditorStore((s) => s.showCaptions);
  const toggleCaptions = useEditorStore((s) => s.toggleCaptions);

  const scene = scenes.find((s) => s.id === selectedSceneId);
  const style = scene?.captionStyle ?? DEFAULT_CAPTION_STYLE;

  const updateStyle = (updates: Partial<CaptionStyle>) => {
    if (!scene) return;
    updateScene(scene.id, {
      captionStyle: { ...style, ...updates },
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-card/30 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Captions</h3>
        <button
          type="button"
          onClick={toggleCaptions}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            showCaptions
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {showCaptions ? "Visible" : "Hidden"}
        </button>
      </div>

      {!scene ? (
        <p className="text-sm text-muted-foreground">
          Select a scene to customize captions
        </p>
      ) : (
        <>
          <div
            className="rounded-lg p-4 text-center"
            style={{
              fontFamily: style.fontFamily,
              fontSize: Math.min(style.fontSize, 24),
              fontWeight: style.fontWeight,
              color: style.color,
              backgroundColor: style.backgroundColor,
              borderRadius: style.borderRadius,
              padding: style.padding,
            }}
          >
            Caption preview text
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Font</label>
              <select
                value={style.fontFamily}
                onChange={(e) => updateStyle({ fontFamily: e.target.value })}
                className="h-9 w-full rounded-lg border border-border bg-background/50 px-2 text-sm"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Poppins">Poppins</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Position</label>
              <div className="flex gap-1">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => updateStyle({ position: pos })}
                    className={cn(
                      "flex-1 rounded-lg border py-1.5 text-xs capitalize",
                      style.position === pos
                        ? "border-primary bg-primary/20"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="flex justify-between text-xs text-muted-foreground">
                <span>Size</span>
                <span>{style.fontSize}px</span>
              </label>
              <input
                type="range"
                min={24}
                max={72}
                value={style.fontSize}
                onChange={(e) =>
                  updateStyle({ fontSize: parseInt(e.target.value, 10) })
                }
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="flex justify-between text-xs text-muted-foreground">
                <span>Weight</span>
                <span>{style.fontWeight}</span>
              </label>
              <input
                type="range"
                min={400}
                max={900}
                step={100}
                value={style.fontWeight}
                onChange={(e) =>
                  updateStyle({ fontWeight: parseInt(e.target.value, 10) })
                }
                className="w-full accent-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Text color</label>
              <input
                type="color"
                value={style.color}
                onChange={(e) => updateStyle({ color: e.target.value })}
                className="h-9 w-full cursor-pointer rounded-lg border border-border bg-transparent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Background</label>
              <input
                type="color"
                value={style.backgroundColor.startsWith("rgba") ? "#000000" : style.backgroundColor}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                className="h-9 w-full cursor-pointer rounded-lg border border-border bg-transparent"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
