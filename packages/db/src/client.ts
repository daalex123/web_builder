import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function isPostgresUrl(value: string | undefined): value is string {
  if (!value?.trim()) return false;
  return (
    value.startsWith("postgresql://") || value.startsWith("postgres://")
  );
}

function envVar(name: string): string | undefined {
  const value = process.env[name];
  if (!value?.trim()) return undefined;
  return isPostgresUrl(value) ? value : undefined;
}

function loadDatabaseEnvFiles(): void {
  const hasPostgresUrl = [
    "DATABASE_URL",
    "POSTGRES_PRISMA_URL",
    "PRISMA_DATABASE_URL",
    "new_DATABASE_URL",
    "new_PRISMA_DATABASE_URL",
    "POSTGRES_URL",
    "new_POSTGRES_URL",
  ].some((name) => isPostgresUrl(envVar(name)));

  if (hasPostgresUrl) return;

  loadEnv({ path: path.join(packageRoot, ".env") });
}

function pickDatabaseUrl(): string | undefined {
  const candidates = [
    envVar("POSTGRES_PRISMA_URL"),
    envVar("PRISMA_DATABASE_URL"),
    envVar("new_PRISMA_DATABASE_URL"),
    envVar("DATABASE_URL"),
    envVar("new_DATABASE_URL"),
    envVar("POSTGRES_URL"),
    envVar("new_POSTGRES_URL"),
    envVar("DIRECT_URL"),
    envVar("POSTGRES_URL_NON_POOLING"),
  ].filter(isPostgresUrl);

  const pooled = candidates.find(
    (url) =>
      url.includes("pooled.db.prisma.io") ||
      url.includes("-pooler.") ||
      url.includes("pgbouncer=true"),
  );

  return pooled ?? candidates[0];
}

function pickDirectUrl(fallback?: string): string | undefined {
  const candidates = [
    envVar("DIRECT_URL"),
    envVar("POSTGRES_URL_NON_POOLING"),
    envVar("POSTGRES_URL"),
    envVar("new_POSTGRES_URL"),
    fallback,
  ].filter(isPostgresUrl);

  const direct = candidates.find((url) => url.includes("db.prisma.io"));
  return direct ?? candidates[0];
}

function normalizePgConnectionString(url: string): string {
  try {
    const parsed = new URL(url);
    const sslmode = parsed.searchParams.get("sslmode");
    if (
      !sslmode ||
      sslmode === "require" ||
      sslmode === "prefer" ||
      sslmode === "verify-ca"
    ) {
      parsed.searchParams.set("sslmode", "verify-full");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function ensureDatabaseEnv(): void {
  const databaseUrl = pickDatabaseUrl();
  const directUrl = pickDirectUrl(databaseUrl);

  if (databaseUrl) {
    process.env.DATABASE_URL = normalizePgConnectionString(databaseUrl);
  }
  if (directUrl) {
    process.env.DIRECT_URL = normalizePgConnectionString(directUrl);
  }
}

loadDatabaseEnvFiles();
ensureDatabaseEnv();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const databaseUrl = pickDatabaseUrl();
  if (!databaseUrl) {
    throw new Error(
      "No PostgreSQL connection string found. Set DATABASE_URL in Vercel " +
        "(or connect Prisma Postgres via Storage). Expected a postgres:// or " +
        "postgresql:// URL — not file:./dev.db or localhost.",
    );
  }

  const adapter = new PrismaPg({
    connectionString: normalizePgConnectionString(databaseUrl),
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
