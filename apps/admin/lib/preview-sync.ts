import { exportPreviewContentToDisk } from "@cms/db";
import { getWebContentDir } from "./utils";

/** Push DB content to apps/web/content for the dev preview server. */
export async function syncPreviewContent() {
  if (process.env.PREVIEW_SYNC === "false") return;
  try {
    await exportPreviewContentToDisk(getWebContentDir());
  } catch (error) {
    console.warn("[preview-sync]", error instanceof Error ? error.message : error);
  }
}
