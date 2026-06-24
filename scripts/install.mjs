import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INSTALL_SCRIPT = path.join(ROOT, "scripts", "install.mjs");
const skipNodeCheck = process.argv.includes("--skip-node-check");

process.chdir(ROOT);

const green = (msg) => console.log(`\x1b[32m${msg}\x1b[0m`);
const yellow = (msg) => console.log(`\x1b[33m${msg}\x1b[0m`);
const red = (msg) => console.log(`\x1b[31m${msg}\x1b[0m`);

function commandExists(command) {
  const check =
    process.platform === "win32"
      ? spawnSync("where", [command], { stdio: "ignore", shell: true })
      : spawnSync("command", ["-v", command], { stdio: "ignore", shell: true });
  return check.status === 0;
}

function readRequiredNodeVersion() {
  const nvmrc = path.join(ROOT, ".nvmrc");
  if (existsSync(nvmrc)) {
    return readFileSync(nvmrc, "utf8").trim().replace(/^v/, "");
  }
  return "22";
}

function parseVersionParts(version) {
  const [major = 0, minor = 0, patch = 0] = String(version)
    .replace(/^v/, "")
    .split(".")
    .map((part) => Number(part) || 0);
  return { major, minor, patch };
}

function versionAtLeast(current, required) {
  const c = parseVersionParts(current);
  const r = parseVersionParts(required);
  if (c.major !== r.major) return c.major > r.major;
  if (c.minor !== r.minor) return c.minor > r.minor;
  return c.patch >= r.patch;
}

function nodeVersionOk(required) {
  const minEngine = "20.19.0";
  if (!versionAtLeast(process.version, minEngine)) return false;
  return versionAtLeast(process.version, required);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function reexecInstaller() {
  const result = spawnSync(process.execPath, [INSTALL_SCRIPT, "--skip-node-check"], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });
  process.exit(result.status ?? 1);
}

function printManualNodeInstall(required) {
  red(`Node.js ${required}+ is required (found ${process.version || "none"}).`);
  console.log("");
  console.log("Install Node, then run this again:");
  console.log("");
  console.log("  Option 1 — nvm (macOS/Linux):");
  console.log("    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash");
  console.log(`    nvm install ${required} && nvm use ${required}`);
  console.log("");
  console.log("  Option 2 — fnm (macOS/Linux/Windows):");
  console.log("    https://github.com/Schniz/fnm#installation");
  console.log(`    fnm install ${required} && fnm use ${required}`);
  console.log("");
  console.log("  Option 3 — nvm-windows:");
  console.log("    https://github.com/coreybutler/nvm-windows/releases");
  console.log(`    nvm install ${required} && nvm use ${required}`);
  console.log("");
  console.log("  Option 4 — direct download:");
  console.log(`    https://nodejs.org/ (LTS ${required}.x)`);
  console.log("");
}

function ensureNodeVersion(required) {
  if (skipNodeCheck || nodeVersionOk(required)) {
    green(`Node ${process.version}`);
    return;
  }

  console.log("");
  yellow(`Node ${process.version || "not found"} — installing/using Node ${required}...`);
  console.log("");

  if (commandExists("fnm")) {
    run("fnm", ["install", required]);
    run("fnm", ["use", required]);
    reexecInstaller();
  }

  if (process.platform === "win32" && commandExists("nvm")) {
    run("nvm", ["install", required]);
    run("nvm", ["use", required]);
    reexecInstaller();
  }

  if (process.platform !== "win32") {
    const nvmScript = path.join(process.env.HOME ?? "", ".nvm", "nvm.sh");
    if (existsSync(nvmScript)) {
      run("bash", [
        "-lc",
        `source "${nvmScript}" && nvm install ${required} && nvm use ${required} && node "${INSTALL_SCRIPT}" --skip-node-check`,
      ]);
      process.exit(0);
    }
  }

  printManualNodeInstall(required);
  process.exit(1);
}

function copyIfMissing(example, target) {
  if (existsSync(target)) {
    yellow(`  keep  ${target}`);
    return;
  }
  if (!existsSync(example)) {
    red(`  missing example file: ${example}`);
    process.exit(1);
  }
  copyFileSync(example, target);
  green(`  create ${target}`);
}

console.log("");
green("CMS local installer");
console.log("===================");
console.log("");

const requiredNode = readRequiredNodeVersion();
yellow(`Required Node: ${requiredNode} (see .nvmrc)`);
ensureNodeVersion(requiredNode);
console.log("");

console.log("Creating env files (if missing)...");
copyIfMissing("packages/db/.env.example", "packages/db/.env");
copyIfMissing("apps/admin/.env.example", "apps/admin/.env.local");
copyIfMissing("apps/web/.env.example", "apps/web/.env.local");

const adminEnvPath = "apps/admin/.env.local";
const adminEnv = readFileSync(adminEnvPath, "utf8");
if (adminEnv.includes('AUTH_SECRET="your-secret"')) {
  const secret = randomBytes(24).toString("hex");
  writeFileSync(
    adminEnvPath,
    adminEnv.replace('AUTH_SECRET="your-secret"', `AUTH_SECRET="${secret}"`),
  );
  green("  set random AUTH_SECRET in apps/admin/.env.local");
}

console.log("");
console.log("Installing dependencies...");
run("npm", ["install"]);

console.log("");
console.log("Setting up database...");
run("npm", ["run", "setup"]);

console.log("");
green("Done!");
console.log("");
console.log("Start development:");
console.log("  npm run dev");
console.log("");
console.log("URLs (single server):");
console.log("  Admin         : http://localhost:3000/admin");
console.log("  Live preview  : http://localhost:3000/web");
console.log("");
console.log("Admin login password: admin123");
console.log("(change ADMIN_PASSWORD in apps/admin/.env.local)");
console.log("");
