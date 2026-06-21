import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;
if (
  process.env.VERCEL &&
  (!databaseUrl ||
    databaseUrl.startsWith("file:") ||
    (!databaseUrl.startsWith("postgresql://") &&
      !databaseUrl.startsWith("postgres://")))
) {
  throw new Error(
    "DATABASE_URL must be a PostgreSQL connection string on Vercel. " +
      "Remove any file:./dev.db value and set the pooled Prisma Postgres URL " +
      "in Project Settings → Environment Variables.",
  );
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;
