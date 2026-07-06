import { describe, it, expect } from "vitest";
import { formatDuration, formatBytes, slugify } from "@/lib/utils";
import { calculateTotalDuration, durationToFrames } from "@/lib/remotion/builder";
import type { SceneData } from "@/types/video";

describe("utils", () => {
  it("formats duration correctly", () => {
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(0)).toBe("0:00");
  });

  it("formats bytes correctly", () => {
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(0)).toBe("0 B");
  });

  it("slugifies text", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
  });
});

describe("remotion builder", () => {
  const scenes: SceneData[] = [
    {
      id: "1",
      order: 0,
      duration: 5,
      speed: 1,
      volume: 1,
      transition: "fade",
      assets: [],
    },
    {
      id: "2",
      order: 1,
      duration: 3,
      speed: 2,
      volume: 1,
      transition: "slide",
      assets: [],
    },
  ];

  it("calculates total duration accounting for speed", () => {
    expect(calculateTotalDuration(scenes)).toBe(6.5);
  });

  it("converts duration to frames", () => {
    expect(durationToFrames(1)).toBe(30);
    expect(durationToFrames(2, 60)).toBe(120);
  });
});
