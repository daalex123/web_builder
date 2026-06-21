import { NextResponse } from "next/server";
import type { SiteSettings } from "@cms/shared";
import { getThemePreset } from "@cms/shared";
import {
  getSiteSettings,
  upsertHomepage,
  upsertMenu,
  upsertSiteSettings,
} from "@cms/db";
import { syncPreviewContent } from "@/lib/preview-sync";

export async function POST(request: Request) {
  const { themeId } = await request.json();

  if (!themeId || typeof themeId !== "string") {
    return NextResponse.json({ error: "themeId is required" }, { status: 400 });
  }

  const preset = getThemePreset(themeId);
  if (!preset) {
    return NextResponse.json(
      { error: "No demo preset available for this theme" },
      { status: 400 },
    );
  }

  const current = await getSiteSettings();
  const settings: SiteSettings = {
    name: preset.site.name ?? current?.name ?? "My Site",
    description: preset.site.description ?? current?.description ?? "",
    url: current?.url ?? "http://localhost:3000",
    theme: themeId,
    logo: current?.logo,
    defaultSeo: preset.site.defaultSeo ?? current?.defaultSeo,
    contact: preset.site.contact ?? current?.contact,
    social: preset.site.social ?? current?.social,
    homepageSource: "structured",
  };

  await upsertSiteSettings(settings);
  await upsertHomepage(preset.homepage);
  await upsertMenu("header", preset.menus.header);
  await upsertMenu("footer", preset.menus.footer);

  await syncPreviewContent();
  return NextResponse.json({ ok: true, settings });
}
