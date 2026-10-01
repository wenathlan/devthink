import type { NextConfig } from "next";

/* The pages export gate: the family Pages lane builds getry with
 * PAGES_EXPORT=1 (static export under the /getry base path), while every
 * other target keeps the standalone server output the gateway ships with. */
const pagesexport = process.env.PAGES_EXPORT === "1";

const nextConfig: NextConfig = {
  output: pagesexport ? "export" : "standalone",
  /* the pages and layouts carry the .page. suffix in both modes; the export
   * mode narrows the extension list so the live gateway route handlers
   * (route.ts, force-dynamic by design) stay out of the static mirror — the
   * real api answers on the standalone deploy target, never on the mirror. */
  pageExtensions: pagesexport ? ["page.tsx", "page.ts"] : ["page.tsx", "page.ts", "route.ts", "route.js"],
  ...(pagesexport
    ? { basePath: process.env.NEXT_BASE_PATH || "/getry", trailingSlash: true, images: { unoptimized: true } }
    : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
