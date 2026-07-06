import type { SubscriptionPlan, UserRole } from "@/generated/prisma/client";

export interface DemoUserDefinition {
  clerkId: string;
  email: string;
  name: string;
  role: UserRole;
  plan: SubscriptionPlan;
  avatarUrl: string;
  description: string;
}

export const DEMO_USERS: DemoUserDefinition[] = [
  {
    clerkId: "demo_free_user",
    email: "alex@demo.prompt2video.ai",
    name: "Alex Creator",
    role: "USER",
    plan: "FREE",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    description: "Free plan — 5 videos/month, watermarked exports",
  },
  {
    clerkId: "demo_pro_user",
    email: "jordan@demo.prompt2video.ai",
    name: "Jordan Pro",
    role: "USER",
    plan: "PRO",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
    description: "Pro plan — unlimited videos, 4K, BYOK, no watermark",
  },
  {
    clerkId: "demo_admin_user",
    email: "sam@demo.prompt2video.ai",
    name: "Sam Admin",
    role: "ADMIN",
    plan: "ENTERPRISE",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
    description: "Admin — full platform access and admin portal",
  },
];

export const DEFAULT_DEMO_USER_ID = "demo_free_user";

export function getDemoUserById(clerkId: string) {
  return DEMO_USERS.find((u) => u.clerkId === clerkId);
}
