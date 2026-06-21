import { getHomePage } from "./load-content";
import type { SiteContent } from "./schemas";
import { hasStructuredHomepage } from "./theme-presets/options";

export type HomepageRenderMode = "builder" | "structured" | "simple";

export function resolveHomepageRenderMode(content: SiteContent): HomepageRenderMode {
  const homePage = getHomePage(content);
  const source = content.site.homepageSource;

  if (source === "builder" && homePage) {
    return "builder";
  }

  if (
    source === "structured" ||
    (!source && hasStructuredHomepage(content.site.theme) && content.homepage)
  ) {
    return "structured";
  }

  if (homePage?.sections?.length) {
    return "builder";
  }

  return "simple";
}
