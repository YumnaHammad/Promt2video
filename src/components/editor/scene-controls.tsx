"use client";

import { useEditorStore } from "@/stores/editor-store";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TRANSITIONS = ["fade", "slide", "none"] as const;

export function SceneControls() {
  const scenes = useEditorStore((s) => s.scenes);
  const selectedSceneId = useEditorStore((s) => s.selectedSceneId);
  const updateScene = useEditorStore((s) => s.updateScene);

  const scene = scenes.find((s) => s.id === selectedSceneId);

  if (!scene) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/30 p-6 text-center backdrop-blur-xl">
        <p className="text-sm text-muted-foreground">
          Select a scene to edit its properties
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-card/30 p-4 backdrop-blur-xl">
      <h3 className="text-sm font-semibold">Scene Controls</h3>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Title</label>
        <Input
          value={scene.title ?? ""}
          onChange={(e) => updateScene(scene.id, { title: e.target.value })}
          placeholder="Scene title"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Narration</label>
        <textarea
          value={scene.narration ?? ""}
          onChange={(e) => updateScene(scene.id, { narration: e.target.value })}
          placeholder="Scene narration text..."
          rows={3}
          className="flex w-full rounded-lg border border-border bg-background/50 px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex justify-between text-xs text-muted-foreground">
            <span>Duration</span>
            <span>{scene.duration.toFixed(1)}s</span>
          </label>
          <input
            type="range"
            min={1}
            max={60}
            step={0.5}
            value={scene.duration}
            onChange={(e) =>
              updateScene(scene.id, { duration: parseFloat(e.target.value) })
            }
            className="w-full accent-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="flex justify-between text-xs text-muted-foreground">
            <span>Speed</span>
            <span>{scene.speed.toFixed(2)}x</span>
          </label>
          <input
            type="range"
            min={0.25}
            max={2}
            step={0.05}
            value={scene.speed}
            onChange={(e) =>
              updateScene(scene.id, { speed: parseFloat(e.target.value) })
            }
            className="w-full accent-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex justify-between text-xs text-muted-foreground">
          <span>Volume</span>
          <span>{Math.round(scene.volume * 100)}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={2}
          step={0.05}
          value={scene.volume}
          onChange={(e) =>
            updateScene(scene.id, { volume: parseFloat(e.target.value) })
          }
          className="w-full accent-primary"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Transition</label>
        <div className="flex gap-2">
          {TRANSITIONS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => updateScene(scene.id, { transition: t })}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs capitalize transition-colors",
                scene.transition === t
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-border hover:bg-accent"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
