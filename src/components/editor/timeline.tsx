"use client";

import { useCallback, useRef, useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { cn, formatDuration } from "@/lib/utils";
import { VIDEO_FPS } from "@/lib/remotion/builder";

const PIXELS_PER_SECOND = 40;

export function Timeline() {
  const scenes = useEditorStore((s) => s.scenes);
  const selectedSceneId = useEditorStore((s) => s.selectedSceneId);
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const zoom = useEditorStore((s) => s.zoom);
  const selectScene = useEditorStore((s) => s.selectScene);
  const reorderScenes = useEditorStore((s) => s.reorderScenes);
  const setCurrentFrame = useEditorStore((s) => s.setCurrentFrame);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration / s.speed, 0);
  const playheadPosition = (currentFrame / VIDEO_FPS) * PIXELS_PER_SECOND * zoom;

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const seconds = x / (PIXELS_PER_SECOND * zoom);
      setCurrentFrame(Math.max(0, Math.floor(seconds * VIDEO_FPS)));
    },
    [zoom, setCurrentFrame]
  );

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDropIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex !== null && dragIndex !== index) {
      reorderScenes(dragIndex, index);
    }
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-card/30 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Timeline</span>
        <span>{formatDuration(totalDuration)}</span>
      </div>

      <div
        ref={timelineRef}
        className="relative h-20 cursor-crosshair overflow-x-auto rounded-lg bg-background/50"
        onClick={handleTimelineClick}
      >
        <div
          className="relative flex h-full min-w-full"
          style={{ width: Math.max(totalDuration * PIXELS_PER_SECOND * zoom, 400) }}
        >
          {scenes.map((scene, index) => {
            const width = (scene.duration / scene.speed) * PIXELS_PER_SECOND * zoom;
            const isSelected = scene.id === selectedSceneId;
            const isDragging = dragIndex === index;
            const isDropTarget = dropIndex === index;

            return (
              <div
                key={scene.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                onClick={(e) => {
                  e.stopPropagation();
                  selectScene(scene.id);
                }}
                className={cn(
                  "group relative flex h-full shrink-0 cursor-grab flex-col justify-between border-r border-border/30 px-2 py-1.5 transition-all active:cursor-grabbing",
                  "bg-gradient-to-b from-violet-600/30 to-purple-800/20 hover:from-violet-600/40",
                  isSelected && "ring-2 ring-primary ring-inset",
                  isDragging && "opacity-50",
                  isDropTarget && "border-l-2 border-l-primary"
                )}
                style={{ width: Math.max(width, 48) }}
              >
                <span className="truncate text-[10px] font-medium text-foreground/90">
                  {scene.title ?? `Scene ${index + 1}`}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {formatDuration(scene.duration)}
                </span>
              </div>
            );
          })}

          <div
            className="pointer-events-none absolute top-0 bottom-0 z-10 w-0.5 bg-primary shadow-[0_0_8px_var(--primary)]"
            style={{ left: playheadPosition }}
          />
        </div>
      </div>

      <div className="flex gap-1">
        {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, i) => (
          <div
            key={i}
            className="text-[9px] text-muted-foreground"
            style={{ width: PIXELS_PER_SECOND * zoom, flexShrink: 0 }}
          >
            {formatDuration(i)}
          </div>
        ))}
      </div>
    </div>
  );
}
