import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const evt = await verifyWebhook(request);

    switch (evt.type) {
      case "user.created": {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        const email = email_addresses[0]?.email_address ?? "";

        await db.user.upsert({
          where: { clerkId: id },
          create: {
            clerkId: id,
            email,
            name: [first_name, last_name].filter(Boolean).join(" ") || null,
            avatarUrl: image_url,
            subscription: { create: {} },
            settings: { create: {} },
          },
          update: {
            email,
            name: [first_name, last_name].filter(Boolean).join(" ") || null,
            avatarUrl: image_url,
          },
        });
        break;
      }

      case "user.updated": {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        const email = email_addresses[0]?.email_address ?? "";

        await db.user.updateMany({
          where: { clerkId: id },
          data: {
            email,
            name: [first_name, last_name].filter(Boolean).join(" ") || null,
            avatarUrl: image_url,
          },
        });
        break;
      }

      case "user.deleted": {
        const clerkId = evt.data.id;
        await db.user.deleteMany({ where: { clerkId } });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Clerk webhook error:", error);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }
}
