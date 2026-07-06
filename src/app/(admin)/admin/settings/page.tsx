import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, Database, Zap, Mail } from "lucide-react";

export default async function AdminSettingsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  const settings = await db.systemSettings.findMany({
    orderBy: { key: "asc" },
  });

  const defaults = [
    {
      key: "maintenance_mode",
      label: "Maintenance Mode",
      description: "Disable public access during updates",
      icon: Zap,
      value: false,
    },
    {
      key: "max_render_concurrency",
      label: "Max Render Concurrency",
      description: "Parallel render jobs allowed",
      icon: Database,
      value: 4,
    },
    {
      key: "email_notifications",
      label: "Email Notifications",
      description: "Send system emails to users",
      icon: Mail,
      value: true,
    },
  ];

  const merged = defaults.map((def) => {
    const stored = settings.find((s) => s.key === def.key);
    return {
      ...def,
      value: stored?.value ?? def.value,
      updatedAt: stored?.updatedAt,
    };
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-fluid-2xl font-bold tracking-tight">
          System Settings
        </h1>
        <p className="text-muted-foreground">
          Platform-wide configuration and feature flags.
        </p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </CardTitle>
          <CardDescription>
            Settings stored in SystemSettings table
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {merged.map((setting) => (
            <div
              key={setting.key}
              className="flex items-start justify-between gap-4 rounded-lg border border-border/50 bg-background/30 p-4 backdrop-blur-sm"
            >
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <setting.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{setting.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                  <code className="mt-1 inline-block text-xs text-muted-foreground">
                    {setting.key}
                  </code>
                </div>
              </div>
              <div className="text-right">
                <p className="rounded-md bg-muted px-3 py-1 font-mono text-sm">
                  {JSON.stringify(setting.value)}
                </p>
                {setting.updatedAt && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Updated {new Date(setting.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}

          {settings
            .filter((s) => !defaults.some((d) => d.key === s.key))
            .map((setting) => (
              <div
                key={setting.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-border/50 bg-background/30 p-4 backdrop-blur-sm"
              >
                <div>
                  <p className="font-medium">{setting.key}</p>
                  <code className="text-xs text-muted-foreground">
                    Custom setting
                  </code>
                </div>
                <p className="max-w-[200px] truncate rounded-md bg-muted px-3 py-1 font-mono text-sm">
                  {JSON.stringify(setting.value)}
                </p>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
