"use client";

import { User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDemoUser } from "@/hooks/use-demo-user";

export function DemoProfileCard() {
  const { profile } = useDemoUser();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Profile
        </CardTitle>
        <CardDescription>Demo account — switch users from the header menu</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <Input defaultValue={profile?.name ?? ""} readOnly />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input defaultValue={profile?.email ?? ""} readOnly />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Demo mode — no real account required. Use the avatar menu to switch between Free, Pro, and Admin users.
        </p>
      </CardContent>
    </Card>
  );
}
