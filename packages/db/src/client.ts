import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function normalizeDatabaseUrl(): void {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith("file:")) return;

  const rawPath = url.slice("file:".length);
  if (path.isAbsolute(rawPath)) return;

  const prismaDir = path.join(packageRoot, "prisma");
  const fileName = path.basename(rawPath);
  process.env.DATABASE_URL = `file:${path.join(prismaDir, fileName)}`;
}

normalizeDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
