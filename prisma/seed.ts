import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const url = process.env.DATABASE_URL ?? "file:./prisma/demo.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

const DEMO_USERS = [
  {
    clerkId: "demo_free_user",
    email: "alex@demo.prompt2video.ai",
    name: "Alex Creator",
    role: "USER" as const,
    plan: "FREE" as const,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    onboardingDone: true,
  },
  {
    clerkId: "demo_pro_user",
    email: "jordan@demo.prompt2video.ai",
    name: "Jordan Pro",
    role: "USER" as const,
    plan: "PRO" as const,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
    onboardingDone: true,
  },
  {
    clerkId: "demo_admin_user",
    email: "sam@demo.prompt2video.ai",
    name: "Sam Admin",
    role: "ADMIN" as const,
    plan: "ENTERPRISE" as const,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
    onboardingDone: true,
  },
];

async function main() {
  console.log("Seeding database...");

  const templates = [
    {
      name: "Product Launch",
      slug: "product-launch",
      description: "Bold product announcement with dynamic transitions",
      category: "Marketing",
      tags: ["product", "launch", "marketing"],
      thumbnailUrl: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400",
      isPremium: false,
      price: 0,
      sceneCount: 5,
      duration: 30,
      remotionData: { scenes: [] },
    },
    {
      name: "Social Story",
      slug: "social-story",
      description: "Vertical format perfect for Instagram and TikTok",
      category: "Social Media",
      tags: ["social", "story", "vertical"],
      thumbnailUrl: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400",
      isPremium: false,
      price: 0,
      sceneCount: 4,
      duration: 15,
      aspectRatio: "9:16",
      remotionData: { scenes: [] },
    },
    {
      name: "Explainer Pro",
      slug: "explainer-pro",
      description: "Professional explainer video with animated captions",
      category: "Education",
      tags: ["explainer", "education", "tutorial"],
      thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
      isPremium: true,
      price: 19.99,
      sceneCount: 8,
      duration: 60,
      remotionData: { scenes: [] },
    },
    {
      name: "Cinematic Intro",
      slug: "cinematic-intro",
      description: "Hollywood-style intro with motion blur effects",
      category: "Entertainment",
      tags: ["cinematic", "intro", "premium"],
      thumbnailUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400",
      isPremium: true,
      price: 29.99,
      sceneCount: 3,
      duration: 20,
      remotionData: { scenes: [] },
    },
    {
      name: "News Bulletin",
      slug: "news-bulletin",
      description: "Breaking news style with lower thirds and ticker",
      category: "News",
      tags: ["news", "bulletin", "broadcast"],
      thumbnailUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400",
      isPremium: false,
      price: 0,
      sceneCount: 6,
      duration: 45,
      remotionData: { scenes: [] },
    },
    {
      name: "Testimonial Showcase",
      slug: "testimonial-showcase",
      description: "Customer testimonial layout with quote animations",
      category: "Marketing",
      tags: ["testimonial", "review", "social-proof"],
      thumbnailUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400",
      isPremium: true,
      price: 14.99,
      sceneCount: 4,
      duration: 30,
      remotionData: { scenes: [] },
    },
  ];

  for (const template of templates) {
    await prisma.template.upsert({
      where: { slug: template.slug },
      update: template,
      create: template,
    });
  }

  await prisma.coupon.upsert({
    where: { code: "LAUNCH20" },
    update: {},
    create: {
      code: "LAUNCH20",
      discountType: "percent",
      discountValue: 20,
      maxUses: 1000,
      isActive: true,
    },
  });

  await prisma.systemSettings.upsert({
    where: { key: "platform" },
    update: {},
    create: {
      key: "platform",
      value: {
        maintenanceMode: false,
        maxFreeVideos: 5,
        maxRenderConcurrency: 2,
        defaultFps: 30,
        defaultResolution: "1920x1080",
      },
    },
  });

  console.log(`Seeded ${templates.length} templates`);

  for (const demo of DEMO_USERS) {
    const user = await prisma.user.upsert({
      where: { clerkId: demo.clerkId },
      update: {
        name: demo.name,
        email: demo.email,
        role: demo.role,
        avatarUrl: demo.avatarUrl,
        onboardingDone: demo.onboardingDone,
      },
      create: {
        clerkId: demo.clerkId,
        email: demo.email,
        name: demo.name,
        role: demo.role,
        avatarUrl: demo.avatarUrl,
        onboardingDone: demo.onboardingDone,
        subscription: {
          create: { plan: demo.plan, status: "ACTIVE" },
        },
        settings: { create: {} },
      },
    });

    await prisma.video.upsert({
      where: { id: `demo-video-${demo.clerkId}` },
      update: {},
      create: {
        id: `demo-video-${demo.clerkId}`,
        title: `${demo.name}'s Demo Video`,
        description: "Sample video created in demo mode",
        prompt: "A cinematic intro for an AI video platform",
        status: "COMPLETED",
        duration: 30,
        userId: user.id,
        remotionData: { fps: 30, width: 1920, height: 1080, scenes: [] },
      },
    });
  }

  console.log(`Seeded ${DEMO_USERS.length} demo users with sample videos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
