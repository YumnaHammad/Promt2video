import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  errorResponse,
  handleApiError,
  jsonResponse,
} from "@/lib/api-utils";
import type { UserRole } from "@/generated/prisma/client";

const updateUserSchema = z.object({
  userId: z.string(),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
});

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const role = searchParams.get("role");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const where = {
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" as const } },
              { name: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(role ? { role: role as UserRole } : {}),
    };

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          onboardingDone: true,
          createdAt: true,
          subscription: {
            select: { plan: true, status: true },
          },
          _count: {
            select: { videos: true, projects: true },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    return jsonResponse({ users, total, limit, offset });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        400
      );
    }

    const { userId, role } = parsed.data;

    if (userId === admin.id && role && role !== admin.role) {
      return errorResponse("Cannot change your own role", 400);
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { ...(role ? { role } : {}) },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    await db.auditLog.create({
      data: {
        userId: admin.id,
        action: "USER_ROLE_UPDATED",
        entity: "User",
        entityId: userId,
        metadata: { newRole: role },
      },
    });

    return jsonResponse({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
