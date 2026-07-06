"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_USERS } from "@/lib/demo-users";
import { Sparkles, ArrowRight } from "lucide-react";

export default function DemoSignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const signInAs = async (clerkId: string) => {
    setLoading(clerkId);
    try {
      const res = await fetch("/api/demo/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId }),
      });
      if (res.ok) {
        router.push("/dashboard");
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="aurora-bg flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="glass gradient-border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-fluid-2xl">Demo Mode</CardTitle>
            <p className="text-muted-foreground">
              No account needed. Pick a demo user to explore the platform.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEMO_USERS.map((user) => (
              <button
                key={user.clerkId}
                onClick={() => signInAs(user.clerkId)}
                disabled={loading !== null}
                className="flex w-full items-center gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-primary">
                    {user.plan} plan · {user.role}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
            <p className="pt-2 text-center text-xs text-muted-foreground">
              Switch accounts anytime from the header menu
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
