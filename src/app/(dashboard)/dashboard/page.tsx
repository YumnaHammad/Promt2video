"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Video,
  Sparkles,
  Clock,
  TrendingUp,
  Plus,
  FolderKanban,
  LayoutTemplate,
  Play,
  ArrowRight,
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

const stats = [
  {
    label: "Total Videos",
    key: "total" as const,
    icon: Video,
    color: "from-violet-500 to-purple-600",
  },
  {
    label: "In Progress",
    key: "generating" as const,
    icon: Clock,
    color: "from-amber-500 to-orange-600",
  },
  {
    label: "Completed",
    key: "completed" as const,
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600",
  },
];

const quickActions = [
  {
    href: "/create",
    label: "Create Video",
    description: "Turn a prompt into video",
    icon: Sparkles,
    variant: "gradient" as const,
  },
  {
    href: "/projects",
    label: "New Project",
    description: "Organize your videos",
    icon: FolderKanban,
    variant: "outline" as const,
  },
  {
    href: "/templates",
    label: "Browse Templates",
    description: "Start from a preset",
    icon: LayoutTemplate,
    variant: "outline" as const,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

async function fetchVideos(): Promise<VideoSummary[]> {
  const res = await fetch("/api/videos?limit=5");
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

export default function DashboardPage() {
  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos", "recent"],
    queryFn: fetchVideos,
    refetchInterval: (query) => {
      const list = query.state.data as VideoSummary[] | undefined;
      const hasActive = list?.some((v) =>
        ["GENERATING", "RENDERING"].includes(v.status)
      );
      return hasActive ? 3000 : false;
    },
  });

  const statValues = {
    total: videos?.length ?? 0,
    generating: videos?.filter((v) =>
      ["GENERATING", "RENDERING"].includes(v.status)
    ).length ?? 0,
    completed: videos?.filter((v) => v.status === "COMPLETED").length ?? 0,
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-7xl space-y-8"
    >
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-fluid-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back. Here&apos;s what&apos;s happening with your videos.
          </p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/create">
            <Plus className="h-4 w-4" />
            Create Video
          </Link>
        </Button>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="flex items-center gap-4 p-6">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{statValues[stat.key]}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={item} className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Videos</CardTitle>
              <CardDescription>Your latest video generations</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : videos && videos.length > 0 ? (
              <div className="space-y-2">
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
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium">No videos yet</p>
                <p className="mb-4 text-sm text-muted-foreground">
                  Create your first AI-generated video from a prompt.
                </p>
                <Button variant="gradient" asChild>
                  <Link href="/create">
                    <Sparkles className="h-4 w-4" />
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into your workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Button
                key={action.href}
                variant={action.variant}
                className="h-auto w-full justify-start gap-3 py-3"
                asChild
              >
                <Link href={action.href}>
                  <action.icon className="h-5 w-5 shrink-0" />
                  <div className="text-left">
                    <p className="font-medium">{action.label}</p>
                    <p className="text-xs opacity-80">{action.description}</p>
                  </div>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
