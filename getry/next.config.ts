import type { NextConfig } from "next";

/* The pages export gate: the family Pages lane builds getry with
 * PAGES_EXPORT=1 (static export under the /getry base path), while every
 * other target keeps the standalone server output the gateway ships with. */
const pagesexport = process.env.PAGES_EXPORT === "1";

const nextConfig: NextConfig = {
  output: pagesexport ? "export" : "standalone",
  ...(pagesexport
    ? { basePath: process.env.NEXT_BASE_PATH || "/getry", trailingSlash: true, images: { unoptimized: true } }
    : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
