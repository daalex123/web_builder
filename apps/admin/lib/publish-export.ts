import { ZipArchive } from "archiver";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export function getWebAppDir() {
  return path.resolve(process.cwd(), "../../apps/web");
}

export function getWebOutDir() {
  return path.join(getWebAppDir(), "out");
}

export function getPublishZipPath() {
  return path.join(getWebAppDir(), ".publish", "site.zip");
}

export function publishZipExists() {
  return fs.existsSync(getPublishZipPath());
}

export function getPublishZipStats() {
  const zipPath = getPublishZipPath();
  if (!fs.existsSync(zipPath)) return null;
  return fs.statSync(zipPath);
}

export async function createPublishZip(): Promise<{
  zipPath: string;
  size: number;
}> {
  const outDir = getWebOutDir();
  if (!fs.existsSync(outDir)) {
    throw new Error(
      "Static site output not found. Run Publish & Build Site first.",
    );
  }

  const zipPath = getPublishZipPath();
  fs.mkdirSync(path.dirname(zipPath), { recursive: true });

  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  const output = fs.createWriteStream(zipPath);
  const archive = new ZipArchive({ zlib: { level: 9 } });

  await new Promise<void>((resolve, reject) => {
    output.on("close", () => resolve());
    output.on("error", reject);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(outDir, false);
    void archive.finalize();
  });

  const { size } = fs.statSync(zipPath);
  return { zipPath, size };
}

export function readPublishZip(): Readable {
  const zipPath = getPublishZipPath();
  if (!fs.existsSync(zipPath)) {
    throw new Error("No published site archive found. Build the site first.");
  }
  return fs.createReadStream(zipPath);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
