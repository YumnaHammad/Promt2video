import { NextResponse } from "next/server";

// Minimal valid MP3 — used for instant demo voiceovers on serverless.
const SILENT_MP3 = Buffer.from(
  "/+MYxAAAAANIAAAAAExBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",
  "base64"
);

export async function GET() {
  return new NextResponse(SILENT_MP3, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
