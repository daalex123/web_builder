import { PrismaClient } from "@prisma/client";

function firstPostgresUrl(values: (string | undefined)[]): string | undefined {
  for (const value of values) {
    if (!value?.trim()) continue;
    if (
      value.startsWith("postgresql://") ||
      value.startsWith("postgres://")
    ) {
      return value;
    }
  }
  return undefined;
}

function ensureDatabaseEnv(): void {
  const pooled = firstPostgresUrl([
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.PRISMA_DATABASE_URL,
  ]);

  const direct = firstPostgresUrl([
    process.env.DIRECT_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.POSTGRES_URL,
    pooled,
  ]);

  if (pooled) process.env.DATABASE_URL = pooled;
  if (direct) process.env.DIRECT_URL = direct;
}

ensureDatabaseEnv();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const databaseUrl = process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(databaseUrl
      ? { datasources: { db: { url: databaseUrl } } }
      : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;
