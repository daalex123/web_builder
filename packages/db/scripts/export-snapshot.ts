import path from "path";
import { fileURLToPath } from "url";
import {
  exportPublishedSnapshotToDisk,
  getPublishedSnapshot,
} from "../src/queries";

const targetDir =
  process.argv[2] ??
  path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../apps/web/content",
  );

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[content:export] DATABASE_URL not set — using committed content/");
    return;
  }

  const snapshot = await getPublishedSnapshot();
  if (!snapshot) {
    console.log("[content:export] No publish snapshot — using committed content/");
    return;
  }

  await exportPublishedSnapshotToDisk(targetDir);
  console.log(
    `[content:export] Wrote ${snapshot.pages.length} page(s) to ${targetDir}`,
  );
}

main().catch((error) => {
  console.error("[content:export]", error);
  process.exit(1);
});
