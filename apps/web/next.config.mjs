import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isProd ? { output: "export" } : {}),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@cms/shared"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@cms/shared": path.resolve(__dirname, "../../packages/shared/src"),
    };
    return config;
  },
};

export default nextConfig;
