import { NextResponse } from "next/server";
import { FREE_VOICES } from "@/lib/voices";

export async function GET() {
  return NextResponse.json({ voices: FREE_VOICES });
}
