import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError, jsonResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const [
      totalUsers,
      newUsersThisWeek,
      usersByPlan,
      totalRevenue,
      revenueThisMonth,
      purchasesLast30Days,
      renderStats,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { createdAt: { gte: startOfWeek } } }),
      db.subscription.groupBy({
        by: ["plan"],
        _count: { plan: true },
      }),
      db.purchase.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      db.purchase.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      db.purchase.findMany({
        where: {
          status: "COMPLETED",
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      db.renderJob.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const revenueByDay = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      revenueByDay.set(d.toISOString().slice(0, 10), 0);
    }

    for (const purchase of purchasesLast30Days) {
      const key = purchase.createdAt.toISOString().slice(0, 10);
      revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + purchase.amount);
    }

    const revenueChart = Array.from(revenueByDay.entries()).map(
      ([date, revenue]) => ({
        date,
        revenue: Math.round(revenue * 100) / 100,
      })
    );

    const renderQueue = {
      queued: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      canceled: 0,
    };

    for (const row of renderStats) {
      const key = row.status.toLowerCase() as keyof typeof renderQueue;
      if (key in renderQueue) {
        renderQueue[key] = row._count.status;
      }
    }

    return jsonResponse({
      revenue: {
        total: totalRevenue._sum.amount ?? 0,
        thisMonth: revenueThisMonth._sum.amount ?? 0,
        chart: revenueChart,
      },
      users: {
        total: totalUsers,
        newThisWeek: newUsersThisWeek,
        byPlan: usersByPlan.map((row) => ({
          plan: row.plan,
          count: row._count.plan,
        })),
      },
      renderQueue,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
