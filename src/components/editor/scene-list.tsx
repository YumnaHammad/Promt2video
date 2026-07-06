"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  Mic,
  MicOff,
  Plus,
  Trash2,
} from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { Button } from "@/components/ui/button";
import { cn, formatDuration } from "@/lib/utils";

export function SceneList() {
  const scenes = useEditorStore((s) => s.scenes);
  const selectedSceneId = useEditorStore((s) => s.selectedSceneId);
  const selectScene = useEditorStore((s) => s.selectScene);
  const deleteScene = useEditorStore((s) => s.deleteScene);
  const duplicateScene = useEditorStore((s) => s.duplicateScene);
  const reorderScenes = useEditorStore((s) => s.reorderScenes);
  const addScene = useEditorStore((s) => s.addScene);

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleAddScene = () => {
    addScene({
      id: crypto.randomUUID(),
      order: scenes.length,
      title: `Scene ${scenes.length + 1}`,
      duration: 5,
      speed: 1,
      volume: 1,
      transition: "fade",
      assets: [],
    });
  };

  const moveScene = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= scenes.length) return;
    reorderScenes(index, target);
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-border/50 bg-card/30 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <h3 className="text-sm font-semibold">Scenes</h3>
        <Button variant="ghost" size="sm" onClick={handleAddScene}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {scenes.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            No scenes yet. Add one to get started.
          </p>
        ) : (
          scenes.map((scene, index) => (
            <div
              key={scene.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null && dragIndex !== index) {
                  reorderScenes(dragIndex, index);
                }
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              onClick={() => selectScene(scene.id)}
              className={cn(
                "group flex cursor-pointer items-center gap-2 rounded-lg border border-transparent px-2 py-2 transition-colors hover:bg-accent/50",
                selectedSceneId === scene.id && "border-primary/50 bg-primary/10"
              )}
            >
              <GripVertical className="size-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-medium">
                    {scene.title ?? `Scene ${index + 1}`}
                  </p>
                  {scene.audioUrl ? (
                    <Mic className="h-3 w-3 shrink-0 text-emerald-400" />
                  ) : scene.narration?.trim() ? (
                    <MicOff className="h-3 w-3 shrink-0 text-amber-400" />
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDuration(scene.duration)} · {scene.transition}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveScene(index, "up");
                  }}
                  disabled={index === 0}
                >
                  <ChevronUp className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveScene(index, "down");
                  }}
                  disabled={index === scenes.length - 1}
                >
                  <ChevronDown className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateScene(scene.id);
                  }}
                >
                  <Copy className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteScene(scene.id);
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
