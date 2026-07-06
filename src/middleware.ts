import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { DEMO_USER_COOKIE } from "@/lib/demo-mode";

const DEMO_MODE =
  process.env.DEMO_MODE === "true" ||
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/health",
  "/api/demo(.*)",
  "/api/templates/public(.*)",
  "/pricing",
  "/features",
  "/templates",
  "/store",
  "/about",
  "/changelog",
  "/blog",
  "/careers",
  "/privacy",
  "/terms",
  "/security",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

function demoMiddleware(request: NextRequest) {
  const demoUserId =
    request.cookies.get(DEMO_USER_COOKIE)?.value ?? "demo_free_user";

  if (isAdminRoute(request) && demoUserId !== "demo_admin_user") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();

  if (!request.cookies.has(DEMO_USER_COOKIE)) {
    response.cookies.set(DEMO_USER_COOKIE, "demo_free_user", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return applySecurityHeaders(response);
}

const clerkHandler = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  if (isAdminRoute(request)) {
    const { sessionClaims } = await auth();
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;
    if (metadata?.role !== "admin" && metadata?.role !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return applySecurityHeaders(NextResponse.next());
});

export default function middleware(
  request: NextRequest,
  event: Parameters<typeof clerkHandler>[1]
) {
  if (DEMO_MODE) {
    return demoMiddleware(request);
  }
  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
