"use server";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface CreateCouponInput {
  code: string;
  discountType: string;
  discountValue: number;
  maxUses: number | null;
  expiresAt: Date | null;
}

export async function createCoupon(input: CreateCouponInput) {
  const admin = await requireAdmin();

  const existing = await db.coupon.findUnique({ where: { code: input.code } });
  if (existing) throw new Error("Coupon code already exists");

  const coupon = await db.coupon.create({
    data: {
      code: input.code.toUpperCase(),
      discountType: input.discountType,
      discountValue: input.discountValue,
      maxUses: input.maxUses,
      expiresAt: input.expiresAt,
    },
    include: { _count: { select: { purchases: true } } },
  });

  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: "COUPON_CREATED",
      entity: "Coupon",
      entityId: coupon.id,
      metadata: { code: coupon.code },
    },
  });

  revalidatePath("/admin/coupons");
  return coupon;
}

export async function deleteCoupon(id: string) {
  const admin = await requireAdmin();
  await db.coupon.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: "COUPON_DELETED",
      entity: "Coupon",
      entityId: id,
    },
  });

  revalidatePath("/admin/coupons");
}

export async function toggleCouponActive(id: string) {
  const admin = await requireAdmin();

  const current = await db.coupon.findUnique({
    where: { id },
    select: { isActive: true },
  });
  if (!current) throw new Error("Coupon not found");

  const coupon = await db.coupon.update({
    where: { id },
    data: { isActive: !current.isActive },
    select: { id: true, isActive: true },
  });

  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: coupon.isActive ? "COUPON_ACTIVATED" : "COUPON_DEACTIVATED",
      entity: "Coupon",
      entityId: id,
    },
  });

  revalidatePath("/admin/coupons");
  return coupon;
}
