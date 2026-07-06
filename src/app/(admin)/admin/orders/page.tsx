import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function statusStyle(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-500/15 text-emerald-400";
    case "PENDING":
      return "bg-amber-500/15 text-amber-400";
    case "REFUNDED":
      return "bg-blue-500/15 text-blue-400";
    case "FAILED":
      return "bg-red-500/15 text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default async function AdminOrdersPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  const [orders, stats] = await Promise.all([
    db.purchase.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { email: true, name: true } },
        template: { select: { name: true } },
        coupon: { select: { code: true } },
      },
    }),
    db.purchase.groupBy({
      by: ["status"],
      _count: { status: true },
      _sum: { amount: true },
    }),
  ]);

  const totalCompleted =
    stats.find((s) => s.status === "COMPLETED")?._sum.amount ?? 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-fluid-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Purchase history and payment status.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((row) => (
          <Card key={row.status} className="glass">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{row.status}</p>
              <p className="text-xl font-bold">{row._count.status}</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(row._sum.amount ?? 0)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Recent Orders
          </CardTitle>
          <CardDescription>
            {formatCurrency(totalCompleted)} completed revenue · {orders.length}{" "}
            shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Template</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Coupon</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/30 transition-colors hover:bg-accent/30"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {order.user.name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.user.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {order.template?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(order.amount, order.currency.toUpperCase())}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {order.coupon?.code ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
