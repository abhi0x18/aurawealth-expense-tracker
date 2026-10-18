import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Ensure BigInt can be safely serialized to JSON throughout all API endpoints and server actions
if (typeof BigInt !== "undefined" && !(BigInt.prototype as any).toJSON) {
  (BigInt.prototype as any).toJSON = function () {
    return Number(this);
  };
}

// On Vercel serverless functions, the root filesystem is read-only.
// We dynamically copy the template SQLite database to /tmp which is writable.
function getDatabaseUrl(): string | undefined {
  if (process.env.VERCEL) {
    const tmpDbPath = "/tmp/dev.db";
    const sourceDbPath = path.join(process.cwd(), "prisma", "dev.db");

    if (!fs.existsSync(tmpDbPath)) {
      if (fs.existsSync(sourceDbPath)) {
        try {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
        } catch (e) {
          console.error("Vercel DB copy error:", e);
        }
      }
    }
    return `file:${tmpDbPath}`;
  }
  return process.env.DATABASE_URL;
}

const dbUrl = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
