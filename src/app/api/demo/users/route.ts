import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { isDemoMode, DEMO_USER_COOKIE } from "@/lib/demo-mode";
import { DEFAULT_DEMO_USER_ID, DEMO_USERS } from "@/lib/demo-users";

export async function GET() {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Not in demo mode" }, { status: 404 });
  }

  const cookieStore = await cookies();
  const currentClerkId =
    cookieStore.get(DEMO_USER_COOKIE)?.value ?? DEFAULT_DEMO_USER_ID;

  const users = await db.user.findMany({
    where: { clerkId: { in: DEMO_USERS.map((u) => u.clerkId) } },
    include: { subscription: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    demoMode: true,
    currentClerkId,
    users: users.map((u) => ({
      id: u.id,
      clerkId: u.clerkId,
      email: u.email,
      name: u.name,
      role: u.role,
      avatarUrl: u.avatarUrl,
      plan: u.subscription?.plan ?? "FREE",
      isCurrent: u.clerkId === currentClerkId,
    })),
  });
}

const switchSchema = z.object({
  clerkId: z.string(),
});

export async function POST(req: Request) {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Not in demo mode" }, { status: 404 });
  }

  const body = switchSchema.parse(await req.json());
  const demoUser = DEMO_USERS.find((u) => u.clerkId === body.clerkId);

  if (!demoUser) {
    return NextResponse.json({ error: "Invalid demo user" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { clerkId: body.clerkId } });
  if (!user) {
    return NextResponse.json({ error: "Demo user not seeded" }, { status: 404 });
  }

  const response = NextResponse.json({
    success: true,
    user: {
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  response.cookies.set(DEMO_USER_COOKIE, body.clerkId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
