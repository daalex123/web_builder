import "dotenv/config";
import { defineConfig, env } from "prisma/config";

function firstEnv(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (
      value &&
      (value.startsWith("postgresql://") || value.startsWith("postgres://"))
    ) {
      return value;
    }
  }
  throw new Error(
    `Missing PostgreSQL URL. Set DATABASE_URL or new_DATABASE_URL in the environment.`,
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: firstEnv(
      "DIRECT_URL",
      "POSTGRES_URL_NON_POOLING",
      "new_POSTGRES_URL",
      "DATABASE_URL",
      "new_DATABASE_URL",
    ),
    directUrl: firstEnv(
      "DIRECT_URL",
      "POSTGRES_URL_NON_POOLING",
      "new_POSTGRES_URL",
      "DATABASE_URL",
      "new_DATABASE_URL",
    ),
  },
});
