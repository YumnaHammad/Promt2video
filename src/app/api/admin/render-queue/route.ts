import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError, jsonResponse } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const where = status ? { status: status as never } : {};

    const [jobs, total, stats] = await Promise.all([
      db.renderJob.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          video: {
            select: {
              id: true,
              title: true,
              userId: true,
              user: { select: { email: true, name: true } },
            },
          },
        },
      }),
      db.renderJob.count({ where }),
      db.renderJob.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const queueStats = {
      queued: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      canceled: 0,
    };

    for (const row of stats) {
      const key = row.status.toLowerCase() as keyof typeof queueStats;
      if (key in queueStats) {
        queueStats[key] = row._count.status;
      }
    }

    return jsonResponse({ jobs, total, limit, offset, stats: queueStats });
  } catch (error) {
    return handleApiError(error);
  }
}
