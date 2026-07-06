"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { DemoProfileCard } from "@/components/demo/demo-profile-card";
import { ClerkProfileCard } from "@/components/demo/clerk-profile-card";
import {
  User,
  Bell,
  Palette,
  Shield,
  KeyRound,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const themeOptions = [
  { value: "light" as const, label: "Light" },
  { value: "dark" as const, label: "Dark" },
  { value: "system" as const, label: "System" },
];

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { theme: uiTheme, setTheme: setUITheme } = useUIStore();

  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setTheme(value);
    setUITheme(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl space-y-8"
    >
      <div>
        <h1 className="text-fluid-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and workspace settings.
        </p>
      </div>

      {DEMO_MODE ? <DemoProfileCard /> : <ClerkProfileCard />}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how Prompt2Video looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleThemeChange(option.value)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                  (theme ?? uiTheme) === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-accent"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>Choose what you want to be notified about</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Video generation complete", default: true },
            { label: "Render failures", default: true },
            { label: "Product updates", default: false },
            { label: "Weekly usage summary", default: true },
          ].map((notif) => (
            <div
              key={notif.label}
              className="flex items-center justify-between rounded-lg border border-border/50 p-4"
            >
              <span className="text-sm">{notif.label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={notif.default}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  notif.default ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                    notif.default && "translate-x-5"
                  )}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security & Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-between" asChild>
            <Link href="/settings/api-keys">
              <span className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Manage API Keys
              </span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
