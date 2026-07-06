"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

interface DemoAuthButtonsProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function DemoAuthButtons({ size = "sm", className }: DemoAuthButtonsProps) {
  if (!DEMO_MODE) return null;

  return (
    <div className={className}>
      <Button variant="ghost" size={size} asChild>
        <Link href="/dashboard">Enter demo</Link>
      </Button>
      <Button variant="gradient" size={size} asChild>
        <Link href="/create">Try free</Link>
      </Button>
    </div>
  );
}

export function DemoSignInButton({ size = "sm" }: { size?: "sm" | "default" }) {
  if (!DEMO_MODE) return null;
  return (
    <Button variant="ghost" size={size} asChild>
      <Link href="/dashboard">Sign in as demo user</Link>
    </Button>
  );
}

export function DemoSignUpButton({ size = "sm" }: { size?: "sm" | "default" | "lg" }) {
  if (!DEMO_MODE) return null;
  return (
    <Button variant="gradient" size={size} asChild>
      <Link href="/dashboard">Get started free</Link>
    </Button>
  );
}
