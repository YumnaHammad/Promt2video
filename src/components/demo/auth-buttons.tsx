"use client";

import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoAuthButtons, DemoSignInButton, DemoSignUpButton } from "./demo-auth-buttons";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function LandingAuthButtons({ layout = "row" }: { layout?: "row" | "column" }) {
  if (DEMO_MODE) {
    return (
      <DemoAuthButtons
        className={layout === "column" ? "flex flex-col gap-2" : "flex items-center gap-2"}
      />
    );
  }

  if (layout === "column") {
    return (
      <div className="flex flex-col gap-2">
        <SignInButton mode="modal">
          <Button variant="outline" className="w-full">Sign in</Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button variant="gradient" className="w-full">Get started</Button>
        </SignUpButton>
      </div>
    );
  }

  return (
    <>
      <SignInButton mode="modal">
        <Button variant="ghost" size="sm">Sign in</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button variant="gradient" size="sm">Get started</Button>
      </SignUpButton>
    </>
  );
}

export function HeroCtaButton() {
  if (DEMO_MODE) {
    return (
      <Button variant="gradient" size="lg" className="w-full sm:w-auto" asChild>
        <Link href="/dashboard">
          Start creating free
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    );
  }

  return (
    <SignUpButton mode="modal">
      <Button variant="gradient" size="lg" className="w-full sm:w-auto">
        Start creating free
        <ArrowRight className="size-4" />
      </Button>
    </SignUpButton>
  );
}

export { DemoSignInButton, DemoSignUpButton };
