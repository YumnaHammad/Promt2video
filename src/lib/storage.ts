import fs from "fs/promises";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import { isDemoMode } from "./demo-mode";

const hasR2 =
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_ACCOUNT_ID;

const s3Client = hasR2
  ? new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
      },
    })
  : null;

const BUCKET = process.env.R2_BUCKET_NAME ?? "prompt2video";
const PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "";

async function uploadLocal(
  file: Buffer,
  key: string
): Promise<string> {
  const isVercel = Boolean(process.env.VERCEL);
  const dir = isVercel
    ? path.join("/tmp", "demo-assets")
    : path.join(process.cwd(), "public", "demo-assets");
  await fs.mkdir(dir, { recursive: true });
  const filename = key.replace(/\//g, "_");
  await fs.writeFile(path.join(dir, filename), file);

  if (isVercel) {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
    return `${base.replace(/\/$/, "")}/api/demo/assets/${encodeURIComponent(filename)}`;
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/demo-assets/${filename}`;
}

export async function uploadFile(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  if (isDemoMode() || !hasR2 || !s3Client) {
    return uploadLocal(file, key);
  }

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );
  return `${PUBLIC_URL}/${key}`;
}

export async function uploadFromUrl(
  url: string,
  folder: string
): Promise<string> {
  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());
  const ext = url.split(".").pop()?.split("?")[0] ?? "bin";
  const key = `${folder}/${nanoid()}.${ext}`;
  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  return uploadFile(buffer, key, contentType);
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  if (!s3Client) return `${PUBLIC_URL}/${key}`;
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteFile(key: string): Promise<void> {
  if (!s3Client) return;
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: BUCKET, Key: key })
  );
}

export async function getFileSize(key: string): Promise<number> {
  if (!s3Client) return 0;
  const result = await s3Client.send(
    new HeadObjectCommand({ Bucket: BUCKET, Key: key })
  );
  return result.ContentLength ?? 0;
}

export function generateUploadKey(
  userId: string,
  filename: string,
  folder = "uploads"
): string {
  const ext = filename.split(".").pop() ?? "bin";
  return `${folder}/${userId}/${nanoid()}.${ext}`;
}
