import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { NextResponse } from "next/server";
import { exportContentToDisk, prisma } from "@cms/db";
import { getWebContentDir } from "@/lib/utils";

const execAsync = promisify(exec);

function getWebAppDir() {
  return path.resolve(process.cwd(), "../../apps/web");
}

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
    const contentDir = getWebContentDir();
    const content = await exportContentToDisk(contentDir);

    let buildOutput = "";
    if (build) {
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
    }

    await prisma.publishLog.create({
      data: {
        status: "success",
        message: `Published ${content.pages.length} pages`,
      },
    });

    return NextResponse.json({
      ok: true,
      pages: content.pages.length,
      buildOutput: build ? buildOutput.slice(-500) : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publish failed";
    await prisma.publishLog.create({ data: { status: "error", message } });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const logs = await prisma.publishLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return NextResponse.json(logs);
}
