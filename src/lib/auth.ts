import { cookies } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { isDemoMode, DEMO_USER_COOKIE } from "./demo-mode";
import { DEFAULT_DEMO_USER_ID } from "./demo-users";
import type { UserRole } from "@/generated/prisma/client";

async function getDemoAuthUser() {
  const cookieStore = await cookies();
  const clerkId =
    cookieStore.get(DEMO_USER_COOKIE)?.value ?? DEFAULT_DEMO_USER_ID;

  const user = await db.user.findUnique({ where: { clerkId } });
  return user;
}

export async function getAuthUser() {
  if (isDemoMode()) {
    return getDemoAuthUser();
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  let user = await db.user.findUnique({ where: { clerkId } });

  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    user = await db.user.create({
      data: {
        clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        name: clerkUser.fullName ?? clerkUser.firstName ?? null,
        avatarUrl: clerkUser.imageUrl,
        subscription: { create: {} },
        settings: { create: {} },
      },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_CREATED",
        entity: "User",
        entityId: user.id,
      },
    });
  }

  return user;
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireAdmin() {
  return requireRole(["ADMIN", "SUPER_ADMIN"]);
}

export async function isAdmin(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
}
