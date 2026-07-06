"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DemoUser {
  clerkId: string;
  name: string | null;
  email: string;
  role: string;
  plan: string;
  avatarUrl: string | null;
}

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function DemoUserMenu() {
  const router = useRouter();
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [current, setCurrent] = useState<DemoUser | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!DEMO_MODE) return;
    fetch("/api/demo/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users ?? []);
        const current = data.users?.find(
          (u: DemoUser & { isCurrent?: boolean }) => u.isCurrent
        );
        if (current) setCurrent(current);
        else if (data.users?.length) setCurrent(data.users[0]);
      })
      .catch(() => {});
  }, []);

  if (!DEMO_MODE) return null;

  const switchUser = async (clerkId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/demo/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId }),
      });
      const data = await res.json();
      if (data.success) {
        const user = users.find((u) => u.clerkId === clerkId);
        if (user) setCurrent(user);
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex h-9 items-center gap-2 px-2"
        onClick={() => setOpen(!open)}
      >
        {current?.avatarUrl ? (
          <Image
            src={current.avatarUrl}
            alt={current.name ?? "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <UserCircle className="h-8 w-8" />
        )}
        <span className="hidden text-sm md:inline">{current?.name ?? "Demo"}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border/50 bg-card/95 p-2 shadow-xl backdrop-blur-xl">
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
              Switch demo account
            </p>
            {users.map((user) => (
              <button
                key={user.clerkId}
                onClick={() => switchUser(user.clerkId)}
                disabled={loading}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
                  current?.clerkId === user.clerkId && "bg-primary/10"
                )}
              >
                {user.avatarUrl && (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name ?? ""}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs text-primary">
                    {user.plan} · {user.role}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
