import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sharedSrc = path.join(__dirname, "../../packages/shared/src");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@cms/db", "@cms/shared"],
  experimental: {
    optimizePackageImports: ["antd", "@ant-design/icons"],
  },
  serverExternalPackages: ["pg", "@prisma/adapter-pg", "@vercel/blob"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@cms/shared": path.resolve(sharedSrc),
      "@cms/shared/layouts": path.resolve(sharedSrc, "layouts.ts"),
      "@cms/shared/sample-templates": path.resolve(sharedSrc, "sample-templates.ts"),
      "@cms/shared/schemas": path.resolve(sharedSrc, "schemas.ts"),
      "@cms/shared/theme-presets/options": path.resolve(
        sharedSrc,
        "theme-presets/options.ts",
      ),
      "@cms/shared/page-layouts": path.resolve(sharedSrc, "page-layouts/index.tsx"),
      "@cms/shared/section-styles": path.resolve(sharedSrc, "section-styles.ts"),
      "@cms/shared/section-layout": path.resolve(sharedSrc, "section-layout.ts"),
      "@cms/shared/render-sections": path.resolve(sharedSrc, "render-sections.tsx"),
      "@cms/shared/nested-sections": path.resolve(sharedSrc, "nested-sections.ts"),
      "@cms/shared/widget-schemas": path.resolve(sharedSrc, "widget-schemas.ts"),
      "@cms/shared/widgets/slider": path.resolve(sharedSrc, "widgets/slider.tsx"),
      "@cms/shared/widgets/slider-types": path.resolve(sharedSrc, "widgets/slider-types.ts"),
      "@cms/shared/widgets/video": path.resolve(sharedSrc, "widgets/video.tsx"),
      "@cms/shared/navigation": path.resolve(sharedSrc, "navigation/index.ts"),
      "@cms/db": path.resolve(__dirname, "../../packages/db/src"),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      "@cms/shared/layouts": "../../packages/shared/src/layouts.ts",
      "@cms/shared/sample-templates": "../../packages/shared/src/sample-templates.ts",
      "@cms/shared/schemas": "../../packages/shared/src/schemas.ts",
      "@cms/shared/theme-presets/options": "../../packages/shared/src/theme-presets/options.ts",
      "@cms/shared/page-layouts": "../../packages/shared/src/page-layouts/index.tsx",
      "@cms/shared/section-styles": "../../packages/shared/src/section-styles.ts",
      "@cms/shared/section-layout": "../../packages/shared/src/section-layout.ts",
      "@cms/shared/render-sections": "../../packages/shared/src/render-sections.tsx",
      "@cms/shared/nested-sections": "../../packages/shared/src/nested-sections.ts",
      "@cms/shared/widget-schemas": "../../packages/shared/src/widget-schemas.ts",
      "@cms/shared/widgets/slider": "../../packages/shared/src/widgets/slider.tsx",
      "@cms/shared/widgets/slider-types": "../../packages/shared/src/widgets/slider-types.ts",
      "@cms/shared/widgets/video": "../../packages/shared/src/widgets/video.tsx",
      "@cms/shared/navigation": "../../packages/shared/src/navigation/index.ts",
    },
  },
};

export default nextConfig;
