"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { createCoupon, deleteCoupon, toggleCouponActive } from "./actions";

interface CouponRow {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  _count: { purchases: number };
}

interface CouponsClientProps {
  initialCoupons: CouponRow[];
}

const emptyForm = {
  code: "",
  discountType: "percent" as string,
  discountValue: 10,
  maxUses: "",
  expiresAt: "",
};

export function CouponsClient({ initialCoupons }: CouponsClientProps) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const created = await createCoupon({
        code: form.code,
        discountType: form.discountType,
        discountValue: form.discountValue,
        maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
      });
      setCoupons((prev) => [created, ...prev]);
      setDialogOpen(false);
      setForm(emptyForm);
      toast.success("Coupon created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Coupon deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await toggleCouponActive(id);
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: updated.isActive } : c))
      );
      toast.success(updated.isActive ? "Coupon activated" : "Coupon deactivated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-fluid-2xl font-bold tracking-tight">Coupon Management</h1>
          <p className="text-muted-foreground">Create and manage discount codes.</p>
        </div>
        <Button variant="gradient" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New Coupon
        </Button>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Coupons</CardTitle>
          <CardDescription>{coupons.length} active and inactive codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Code</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Discount</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usage</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Expires</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      No coupons yet
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-border/30 transition-colors hover:bg-accent/30"
                    >
                      <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                      <td className="px-4 py-3">
                        {c.discountType === "percent"
                          ? `${c.discountValue}%`
                          : `$${c.discountValue}`}
                      </td>
                      <td className="px-4 py-3">
                        {c.usedCount}
                        {c.maxUses ? ` / ${c.maxUses}` : ""}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.expiresAt
                          ? new Date(c.expiresAt).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium",
                            c.isActive
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-zinc-500/15 text-zinc-400"
                          )}
                        >
                          {c.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleToggle(c.id)}>
                            {c.isActive ? (
                              <ToggleRight className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Code</label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SAVE20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Type</label>
                <select
                  value={form.discountType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      discountType: e.target.value,
                    })
                  }
                  className="h-10 w-full rounded-lg border border-border bg-background/50 px-3 text-sm"
                >
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Value</label>
                <Input
                  type="number"
                  min={0}
                  value={form.discountValue}
                  onChange={(e) =>
                    setForm({ ...form, discountValue: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Max Uses (optional)</label>
              <Input
                type="number"
                min={1}
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                placeholder="Unlimited"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Expires At (optional)</label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleCreate}
              disabled={loading || !form.code}
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
