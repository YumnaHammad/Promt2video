"use client";

import { useUser } from "@clerk/nextjs";
import { User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ClerkProfileCard() {
  const { user } = useUser();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Profile
        </CardTitle>
        <CardDescription>Your personal account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <Input defaultValue={user?.fullName ?? ""} placeholder="Your name" readOnly />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              defaultValue={user?.primaryEmailAddress?.emailAddress ?? ""}
              readOnly
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Profile details are managed through your Clerk account.
        </p>
      </CardContent>
    </Card>
  );
}
