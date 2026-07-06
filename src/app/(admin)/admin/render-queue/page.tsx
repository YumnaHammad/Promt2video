"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Server,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
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

interface RenderJob {
  id: string;
  status: string;
  progress: number;
  type: string;
  error: string | null;
  retryCount: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  video: {
    id: string;
    title: string;
    user: { email: string; name: string | null };
  };
}

interface RenderQueueResponse {
  jobs: RenderJob[];
  total: number;
  stats: {
    queued: number;
    processing: number;
    completed: number;
    failed: number;
    canceled: number;
  };
}

async function fetchRenderQueue(status?: string): Promise<RenderQueueResponse> {
  const params = new URLSearchParams({ limit: "50" });
  if (status) params.set("status", status);
  const res = await fetch(`/api/admin/render-queue?${params}`);
  if (!res.ok) throw new Error("Failed to load render queue");
  return res.json();
}

function statusIcon(status: string) {
  switch (status) {
    case "QUEUED":
      return <Clock className="h-4 w-4 text-blue-400" />;
    case "PROCESSING":
      return <Loader2 className="h-4 w-4 animate-spin text-amber-400" />;
    case "COMPLETED":
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    case "FAILED":
      return <XCircle className="h-4 w-4 text-red-400" />;
    default:
      return <Server className="h-4 w-4 text-muted-foreground" />;
  }
}

function statusClass(status: string) {
  switch (status) {
    case "QUEUED":
      return "bg-blue-500/15 text-blue-400";
    case "PROCESSING":
      return "bg-amber-500/15 text-amber-400";
    case "COMPLETED":
      return "bg-emerald-500/15 text-emerald-400";
    case "FAILED":
      return "bg-red-500/15 text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

const filters = [
  { value: "", label: "All" },
  { value: "QUEUED", label: "Queued" },
  { value: "PROCESSING", label: "Processing" },
  { value: "FAILED", label: "Failed" },
  { value: "COMPLETED", label: "Completed" },
];

export default function AdminRenderQueuePage() {
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "render-queue", statusFilter],
    queryFn: () => fetchRenderQueue(statusFilter || undefined),
    refetchInterval: 15_000,
  });

  const failedJobs = data?.jobs.filter((j) => j.status === "FAILED") ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-fluid-2xl font-bold tracking-tight">
            Render Queue
          </h1>
          <p className="text-muted-foreground">
            Monitor active jobs and investigate failures.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))
          : (
              [
                ["Queued", data?.stats.queued, "text-blue-400"],
                ["Processing", data?.stats.processing, "text-amber-400"],
                ["Completed", data?.stats.completed, "text-emerald-400"],
                ["Failed", data?.stats.failed, "text-red-400"],
                ["Canceled", data?.stats.canceled, "text-muted-foreground"],
              ] as const
            ).map(([label, count, color]) => (
              <Card key={label} className="glass">
                <CardContent className="p-4 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{count ?? 0}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {(data?.stats.failed ?? 0) > 0 && (
        <Card className="glass border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              Failed Jobs ({failedJobs.length})
            </CardTitle>
            <CardDescription>
              Jobs that require attention or retry
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {failedJobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="rounded-lg border border-red-500/20 bg-red-500/5 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{job.video.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.video.user.email} · Retries: {job.retryCount}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(job.createdAt).toLocaleString()}
                  </span>
                </div>
                {job.error && (
                  <pre className="mt-2 overflow-x-auto rounded bg-background/50 p-2 text-xs text-red-300">
                    {job.error}
                  </pre>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="glass">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                All Jobs
              </CardTitle>
              <CardDescription>{data?.total ?? 0} total jobs</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <Button
                  key={f.value}
                  variant={statusFilter === f.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(f.value)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Video</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Progress</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-3">
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ))
                ) : data?.jobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No render jobs found
                    </td>
                  </tr>
                ) : (
                  data?.jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-border/30 transition-colors hover:bg-accent/30"
                    >
                      <td className="px-4 py-3 font-medium">
                        {job.video.title}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {job.video.user.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(job.status)}`}
                        >
                          {statusIcon(job.status)}
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(job.progress)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {job.type}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(job.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
