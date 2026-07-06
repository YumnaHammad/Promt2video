"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
type PurchaseStatus = "PENDING" | "COMPLETED" | "REFUNDED" | "FAILED";

interface OrderRow {
  id: string;
  amount: number;
  currency: string;
  status: PurchaseStatus;
  stripePaymentId: string | null;
  createdAt: Date;
  user: { email: string; name: string | null };
  template: { name: string; slug: string } | null;
  coupon: { code: string } | null;
}

const statusStyles: Record<PurchaseStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-400",
  COMPLETED: "bg-emerald-500/15 text-emerald-400",
  REFUNDED: "bg-blue-500/15 text-blue-400",
  FAILED: "bg-red-500/15 text-red-400",
};

interface OrdersClientProps {
  orders: OrderRow[];
}

export function OrdersClient({ orders }: OrdersClientProps) {
  const totalRevenue = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl space-y-6"
    >
      <div>
        <h1 className="text-fluid-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Purchase history and payment records.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Completed Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">
              {orders.filter((o) => o.status === "PENDING").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest 100 transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Template</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Coupon</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border/30 transition-colors hover:bg-accent/30"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{order.user.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{order.user.email}</p>
                      </td>
                      <td className="px-4 py-3">
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
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                            statusStyles[order.status]
                          )}
                        >
                          {order.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
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
