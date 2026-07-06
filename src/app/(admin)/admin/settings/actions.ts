"use server";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface SystemSettings {
  maintenanceMode: boolean;
  maxRenderConcurrency: number;
  defaultFreeVideos: number;
  enableRegistration: boolean;
  supportEmail: string;
  announcementBanner: string;
}

export async function saveSystemSettings(settings: SystemSettings) {
  const admin = await requireAdmin();

  const entries = Object.entries(settings) as [keyof SystemSettings, unknown][];

  await Promise.all(
    entries.map(([key, value]) =>
      db.systemSettings.upsert({
        where: { key },
        create: { key, value: value as never },
        update: { value: value as never },
      })
    )
  );

  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: "SYSTEM_SETTINGS_UPDATED",
      entity: "SystemSettings",
      metadata: settings as object,
    },
  });

  revalidatePath("/admin/settings");
}
