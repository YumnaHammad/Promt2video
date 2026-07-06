"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Volume2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoVideo() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section id="demo" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-medium uppercase tracking-wider text-violet-400"
          >
            Demo
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-fluid-3xl font-bold tracking-tight"
          >
            See Prompt2Video in action
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-fluid-base text-muted-foreground"
          >
            Watch how a simple prompt transforms into a polished product launch
            video in under three minutes.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <div className="gradient-border rounded-2xl p-[1px] shadow-2xl shadow-violet-500/10">
            <div className="overflow-hidden rounded-2xl border border-border/30 bg-card/80 backdrop-blur-xl">
              <div className="relative aspect-video bg-gradient-to-br from-violet-950/60 via-background to-fuchsia-950/40">
                {!isPlaying ? (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_70%)]" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <motion.button
                        type="button"
                        onClick={() => setIsPlaying(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="group flex size-20 items-center justify-center rounded-full bg-white/10 shadow-lg backdrop-blur-md transition-colors hover:bg-white/20 sm:size-24"
                        aria-label="Play demo video"
                      >
                        <Play className="size-8 fill-white text-white transition-transform group-hover:scale-110 sm:size-10" />
                      </motion.button>
                      <span className="text-sm font-medium text-white/70">
                        Watch the 2:47 demo
                      </span>
                    </div>

                    <DemoTimeline />
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-8 text-center">
                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-violet-600/20">
                      <Play className="size-8 text-violet-400" />
                    </div>
                    <p className="text-lg font-medium">Demo video placeholder</p>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                      Replace with your product demo video URL. Supports
                      YouTube, Vimeo, or self-hosted MP4.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsPlaying(false)}
                      className="mt-6 text-sm text-violet-400 hover:underline"
                    >
                      Close preview
                    </button>
                  </div>
                )}

                <VideoControls isPlaying={isPlaying} />
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-b from-violet-500/5 to-transparent blur-2xl" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-4 text-center sm:gap-8"
        >
          {[
            { value: "2:47", label: "Demo length" },
            { value: "3 min", label: "Creation time" },
            { value: "4K", label: "Max export" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-fluid-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function DemoTimeline() {
  const scenes = [
    { label: "Intro", width: "15%" },
    { label: "Problem", width: "25%" },
    { label: "Solution", width: "30%" },
    { label: "Features", width: "20%" },
    { label: "CTA", width: "10%" },
  ];

  return (
    <div className="absolute inset-x-0 bottom-16 hidden px-8 sm:block">
      <div className="flex gap-1">
        {scenes.map((scene, i) => (
          <motion.div
            key={scene.label}
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
            style={{ width: scene.width }}
            className="group relative"
          >
            <div className="h-1 rounded-full bg-white/20">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ delay: 1 + i * 0.3, duration: 0.8 }}
              />
            </div>
            <span className="absolute -bottom-5 left-0 text-[10px] text-white/40 opacity-0 transition-opacity group-hover:opacity-100">
              {scene.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function VideoControls({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 transition-opacity sm:px-6",
        isPlaying ? "opacity-100" : "opacity-0 hover:opacity-100"
      )}
    >
      <button
        type="button"
        className="text-white/70 transition-colors hover:text-white"
        aria-label="Volume"
      >
        <Volume2 className="size-4" />
      </button>

      <div className="flex-1">
        <div className="h-1 overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-1/3 rounded-full bg-white/80" />
        </div>
      </div>

      <span className="text-xs tabular-nums text-white/70">0:52 / 2:47</span>

      <button
        type="button"
        className="text-white/70 transition-colors hover:text-white"
        aria-label="Fullscreen"
      >
        <Maximize2 className="size-4" />
      </button>
    </div>
  );
}
