import { getHomePage } from "./load-content";
import type { Page, SiteContent } from "./schemas";
import { hasStructuredHomepage } from "./theme-presets/options";

export type HomepageRenderMode = "builder" | "structured" | "simple";

function hasBuilderHomeContent(homePage: Page): boolean {
  if (homePage.sections?.length) return true;
  return Boolean(homePage.content?.content?.length);
}

export function resolveHomepageRenderMode(content: SiteContent): HomepageRenderMode {
  const homePage = getHomePage(content);
  const source = content.site.homepageSource;
  const canUseStructured =
    Boolean(content.homepage) && hasStructuredHomepage(content.site.theme);

  if (source === "builder" && homePage && hasBuilderHomeContent(homePage)) {
    return "builder";
  }

  if (source === "structured" || canUseStructured) {
    return "structured";
  }

  if (homePage?.sections?.length) {
    return "builder";
  }

  return "simple";
}
