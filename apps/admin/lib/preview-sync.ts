import { exportPreviewContentToDisk, isSupabaseConfigured } from "@cms/db";
import { getWebContentDir } from "./utils";
import { shouldUseDatabasePreview } from "@preview/preview-content";

/** Push DB content to local content/ for static builds. Skipped when preview reads from Supabase. */
export async function syncPreviewContent() {
  if (process.env.PREVIEW_SYNC === "false") return;
  if (shouldUseDatabasePreview()) {
    if (process.env.PREVIEW_SYNC !== "true") return;
  } else if (!isSupabaseConfigured() && process.env.VERCEL === "1") {
    return;
  }
  try {
    await exportPreviewContentToDisk(getWebContentDir());
  } catch (error) {
    console.warn("[preview-sync]", error instanceof Error ? error.message : error);
  }
}
