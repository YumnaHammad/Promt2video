"use client";

import { UserButton } from "@clerk/nextjs";
import { DemoUserMenu } from "./demo-user-menu";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function UserMenu() {
  if (DEMO_MODE) {
    return <DemoUserMenu />;
  }

  return (
    <UserButton
      appearance={{
        elements: { avatarBox: "h-9 w-9" },
      }}
    />
  );
}
