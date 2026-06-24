import { exportPreviewContentToDisk } from "@cms/db";
import { getWebContentDir } from "./utils";

/** Push DB content to local content/ for the /web live preview. */
export async function syncPreviewContent() {
  if (process.env.PREVIEW_SYNC === "false") return;
  try {
    await exportPreviewContentToDisk(getWebContentDir());
  } catch (error) {
    console.warn("[preview-sync]", error instanceof Error ? error.message : error);
  }
}
