"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Settings2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveSystemSettings } from "./actions";

interface SystemSettings {
  maintenanceMode: boolean;
  maxRenderConcurrency: number;
  defaultFreeVideos: number;
  enableRegistration: boolean;
  supportEmail: string;
  announcementBanner: string;
}

interface SettingsClientProps {
  initialSettings: SystemSettings;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveSystemSettings(settings);
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div>
        <h1 className="text-fluid-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Configure platform-wide settings and limits.
        </p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            General
          </CardTitle>
          <CardDescription>Core platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <label className="flex items-center justify-between gap-4 rounded-lg border border-border/50 p-4">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">
                Disable public access during maintenance
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) =>
                setSettings({ ...settings, maintenanceMode: e.target.checked })
              }
              className="h-5 w-5 rounded border-border"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-lg border border-border/50 p-4">
            <div>
              <p className="font-medium">Enable Registration</p>
              <p className="text-sm text-muted-foreground">
                Allow new users to sign up
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableRegistration}
              onChange={(e) =>
                setSettings({ ...settings, enableRegistration: e.target.checked })
              }
              className="h-5 w-5 rounded border-border"
            />
          </label>

          <div>
            <label className="mb-1 block text-sm font-medium">Support Email</label>
            <Input
              type="email"
              value={settings.supportEmail}
              onChange={(e) =>
                setSettings({ ...settings, supportEmail: e.target.value })
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Announcement Banner</label>
            <Input
              value={settings.announcementBanner}
              onChange={(e) =>
                setSettings({ ...settings, announcementBanner: e.target.value })
              }
              placeholder="Optional banner message shown to all users"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Render & Limits</CardTitle>
          <CardDescription>Processing and quota settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Max Render Concurrency
            </label>
            <Input
              type="number"
              min={1}
              max={10}
              value={settings.maxRenderConcurrency}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxRenderConcurrency: parseInt(e.target.value, 10) || 1,
                })
              }
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Number of simultaneous render jobs
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Default Free Videos
            </label>
            <Input
              type="number"
              min={0}
              value={settings.defaultFreeVideos}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultFreeVideos: parseInt(e.target.value, 10) || 0,
                })
              }
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Free tier video limit for new users
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="gradient" onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </motion.div>
  );
}
