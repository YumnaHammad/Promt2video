"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  FolderKanban,
  Plus,
  Sparkles,
  Play,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/utils";
import { getVideoHref } from "@/lib/video-routes";

interface VideoSummary {
  id: string;
  title: string;
  status: string;
  duration: number | null;
  thumbnailUrl: string | null;
  updatedAt: string;
}

async function fetchVideos(): Promise<VideoSummary[]> {
  const res = await fetch("/api/videos?limit=50");
  if (!res.ok) return [];
  const data = await res.json();
  return data.videos ?? [];
}

function statusColor(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-500/15 text-emerald-400";
    case "GENERATING":
    case "RENDERING":
      return "bg-amber-500/15 text-amber-400";
    case "EDITING":
      return "bg-blue-500/15 text-blue-400";
    case "FAILED":
      return "bg-red-500/15 text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function ProjectsPage() {
  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos", "all"],
    queryFn: fetchVideos,
    refetchInterval: (query) => {
      const list = query.state.data as VideoSummary[] | undefined;
      const hasActive = list?.some((v) =>
        ["GENERATING", "RENDERING"].includes(v.status)
      );
      return hasActive ? 3000 : false;
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl space-y-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-fluid-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Your videos — click any to open or track progress.
          </p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/create">
            <Plus className="h-4 w-4" />
            Create Video
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : videos && videos.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Videos</CardTitle>
            <CardDescription>
              {videos.length} video{videos.length !== 1 ? "s" : ""} total
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={getVideoHref(video)}
                className="flex items-center gap-4 rounded-lg border border-border/50 p-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {video.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={video.thumbnailUrl}
                      alt=""
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : ["GENERATING", "RENDERING"].includes(video.status) ? (
                    <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                  ) : (
                    <Play className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{video.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {video.duration
                      ? formatDuration(video.duration)
                      : "—"}{" "}
                    · Updated{" "}
                    {new Date(video.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(video.status)}`}
                >
                  {video.status.toLowerCase()}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20"
            >
              <FolderKanban className="h-10 w-10 text-primary" />
            </motion.div>
            <CardHeader className="p-0">
              <CardTitle className="text-xl">No videos yet</CardTitle>
              <CardDescription className="mt-2 max-w-md">
                Create your first video and it will appear here with live
                progress tracking.
              </CardDescription>
            </CardHeader>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="gradient" asChild>
                <Link href="/create">
                  <Sparkles className="h-4 w-4" />
                  Create Your First Video
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/templates">Browse Templates</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
