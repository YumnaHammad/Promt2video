import path from "path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function getSqliteUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  let filePath = "prisma/demo.db";

  if (envUrl?.startsWith("file:")) {
    filePath = envUrl.replace("file:", "").replace(/^\.\//, "");
  }

  const absolute = path.resolve(process.cwd(), filePath);
  return `file:${absolute.replace(/\\/g, "/")}`;
}

export function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "file:./prisma/demo.db";

  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }

  const adapter = new PrismaBetterSqlite3({ url: getSqliteUrl() });
  return new PrismaClient({ adapter });
}
