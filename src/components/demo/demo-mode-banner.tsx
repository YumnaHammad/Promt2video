"use client";

import { DemoUserMenu } from "./demo-user-menu";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function DemoModeBanner() {
  if (!DEMO_MODE) return null;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-primary/20 bg-primary/10 px-4 py-2 text-sm">
      <span>
        <strong>Demo mode</strong> — no real accounts needed. Use built-in test users.
      </span>
      <DemoUserMenu />
    </div>
  );
}
