import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

type RouteContext = { params: Promise<{ filename: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { filename } = await context.params;
  const safeName = path.basename(filename);

  if (!safeName || safeName !== filename) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filePath = path.join("/tmp", "demo-assets", safeName);

  try {
    const file = await fs.readFile(filePath);
    const ext = safeName.split(".").pop()?.toLowerCase();
    const contentType =
      ext === "mp3"
        ? "audio/mpeg"
        : ext === "png"
          ? "image/png"
          : ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : "application/octet-stream";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
