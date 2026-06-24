import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { NextResponse } from "next/server";
import {
  buildPublishedContent,
  createPublishLog,
  exportContentToDisk,
  listPublishLogs,
} from "@cms/db";
import {
  createPublishZip,
  formatBytes,
  getPublishZipStats,
  getWebAppDir,
} from "@/lib/publish-export";
import { canRunStaticBuild, isVercel } from "@/lib/vercel";
import { getStaticBuildContentDir } from "@/lib/utils";

const execAsync = promisify(exec);

function getBuildEnv(): NodeJS.ProcessEnv {
  return {
    PATH: process.env.PATH ?? "",
    HOME: process.env.HOME ?? "",
    LANG: process.env.LANG ?? "en_US.UTF-8",
    NODE_ENV: "production",
  };
}

export async function POST(request: Request) {
  const { build = true } = await request.json().catch(() => ({ build: true }));

  try {
    const content = await buildPublishedContent();
    if (!content) {
      throw new Error("Site settings not configured");
    }

    if (isVercel()) {
      const message = build
        ? `Published ${content.pages.length} pages. Live preview is at /web on this deployment.`
        : `Validated ${content.pages.length} published pages.`;

      await createPublishLog({ status: "success", message });

      return NextResponse.json({
        ok: true,
        pages: content.pages.length,
        vercel: true,
        buildSkipped: build,
        message,
      });
    }

    const contentDir = getStaticBuildContentDir();
    await exportContentToDisk(contentDir);

    let buildOutput = "";
    let zipSize: number | undefined;

    if (build && canRunStaticBuild()) {
      const webDir = getWebAppDir();
      const nextDir = path.join(webDir, ".next");

      if (fs.existsSync(nextDir)) {
        fs.rmSync(nextDir, { recursive: true, force: true });
      }

      const { stdout, stderr } = await execAsync("node scripts/build.mjs", {
        cwd: webDir,
        timeout: 120000,
        env: getBuildEnv(),
      });
      buildOutput = stdout + stderr;

      const zip = await createPublishZip();
      zipSize = zip.size;
    }

    const zipStats = getPublishZipStats();
    const message = build
      ? `Published ${content.pages.length} pages (${zipStats ? formatBytes(zipStats.size) : "zip ready"})`
      : `Exported ${content.pages.length} pages`;

    await createPublishLog({
      status: "success",
      message,
    });

    return NextResponse.json({
      ok: true,
      pages: content.pages.length,
      buildOutput: build ? buildOutput.slice(-500) : undefined,
      downloadUrl: build && zipStats ? "/api/publish/download" : undefined,
      zipSize,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publish failed";
    await createPublishLog({ status: "error", message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const logs = await listPublishLogs(10);
  return NextResponse.json(logs);
}
