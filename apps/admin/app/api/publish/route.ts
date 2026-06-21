import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { NextResponse } from "next/server";
import { buildPublishedContent, prisma, publishContent } from "@cms/db";
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

async function triggerWebDeploy(): Promise<boolean> {
  const hook = process.env.VERCEL_WEB_DEPLOY_HOOK_URL?.trim();
  if (!hook) return false;
  const response = await fetch(hook, { method: "POST" });
  return response.ok;
}

export async function POST(request: Request) {
  const { build = true } = await request.json().catch(() => ({ build: true }));

  try {
    const content = await buildPublishedContent();
    if (!content) {
      throw new Error("Site settings not configured");
    }

    if (process.env.VERCEL) {
      await publishContent(content);
      const deployTriggered = build ? await triggerWebDeploy() : false;

      await prisma.publishLog.create({
        data: {
          status: "success",
          message: `Published ${content.pages.length} pages to database${
            deployTriggered ? " and triggered web deploy" : ""
          }`,
        },
      });

      return NextResponse.json({
        ok: true,
        pages: content.pages.length,
        mode: "vercel",
        deployTriggered,
      });
    }

    const contentDir = getWebContentDir();
    await publishContent(content, contentDir);

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
      mode: "local",
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
