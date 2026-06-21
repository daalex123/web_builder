import type { MenuItem, SiteSettings } from "@cms/shared";
import { isFurnitureTheme } from "@cms/shared";
import { resolveNavConfig, SiteHeader } from "@cms/shared/navigation";
import * as defaultTheme from "@/themes/default/layout";
import * as defaultTemplates from "@/themes/default/templates";
import * as finezLayout from "@/themes/finez/layout";
import * as finezTemplates from "@/themes/finez/templates";
import * as furnitureLayout from "@/themes/furniture/layout";
import * as furnitureTemplates from "@/themes/furniture/templates";
import { FurnitureThemeProvider } from "@/themes/furniture/context";
import { getFurnitureVariant } from "@/themes/furniture/variants";
import { AssistantWidget } from "@/components/assistant/assistant-widget";

export function getThemeComponents(theme: string) {
  if (theme === "finez") {
    return {
      SiteFooter: finezLayout.SiteFooter,
      PageTemplate: finezTemplates.PageTemplate,
      JsonLd: finezTemplates.JsonLd,
    };
  }

  if (isFurnitureTheme(theme)) {
    return {
      SiteFooter: furnitureLayout.SiteFooter,
      PageTemplate: furnitureTemplates.PageTemplate,
      JsonLd: furnitureTemplates.JsonLd,
    };
  }

  return {
    SiteFooter: defaultTheme.SiteFooter,
    PageTemplate: defaultTemplates.PageTemplate,
    JsonLd: defaultTemplates.JsonLd,
  };
}

function resolveThemeNavHints(site: SiteSettings) {
  if (isFurnitureTheme(site.theme)) {
    const variant = getFurnitureVariant(site.theme);
    if (!variant) return null;
    return {
      headerStyle: variant.headerStyle,
      logoTracking: variant.logoTracking,
      navTracking: variant.navTracking,
      accentBg: variant.accentBg,
      promoBar: variant.promoBar,
      showTopBar: variant.showTopBar,
    };
  }

  if (site.theme === "finez") {
    return {
      logoTracking: "tracking-[0.15em]",
      navTracking: "tracking-[0.15em]",
    };
  }

  return null;
}

export function ThemeShell({
  site,
  menu,
  footerMenu,
  children,
}: {
  site: SiteSettings;
  menu: MenuItem[];
  footerMenu: MenuItem[];
  children: React.ReactNode;
}) {
  const { SiteFooter } = getThemeComponents(site.theme);
  const navConfig = resolveNavConfig(site, resolveThemeNavHints(site));
  const assistant = <AssistantWidget site={site} />;

  const header = <SiteHeader site={site} menu={menu} config={navConfig} />;

  if (site.theme === "finez") {
    const FinezFooter = SiteFooter as typeof finezLayout.SiteFooter;
    return (
      <>
        {header}
        <main>{children}</main>
        <FinezFooter site={site} menu={footerMenu} />
        {assistant}
      </>
    );
  }

  if (isFurnitureTheme(site.theme)) {
    const variant = getFurnitureVariant(site.theme);
    if (!variant) {
      return (
        <>
          {header}
          <main>{children}</main>
          {assistant}
        </>
      );
    }
    const FurnitureFooter = SiteFooter as typeof furnitureLayout.SiteFooter;
    return (
      <FurnitureThemeProvider variant={variant}>
        {header}
        <main>{children}</main>
        <FurnitureFooter site={site} menu={footerMenu} />
        {assistant}
      </FurnitureThemeProvider>
    );
  }

  const DefaultFooter = SiteFooter as typeof defaultTheme.SiteFooter;
  return (
    <>
      {header}
      <main>{children}</main>
      <DefaultFooter siteName={site.name} menu={footerMenu} />
      {assistant}
    </>
  );
}
