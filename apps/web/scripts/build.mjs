import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const buildEnv = {
  PATH: process.env.PATH ?? "",
  HOME: process.env.HOME ?? "",
  LANG: process.env.LANG ?? "en_US.UTF-8",
  NODE_ENV: "production",
};

const result = spawnSync(process.execPath, [nextBin, "build"], {
  cwd: webRoot,
  stdio: "inherit",
  env: buildEnv,
});

process.exit(result.status ?? 1);
