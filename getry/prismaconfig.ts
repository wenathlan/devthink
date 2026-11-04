/** prisma config — universal datasource url fallback for the gateway app
 * the schema lives in schema.prisma at the getry app root — the gateway
 * owns its own sqlite datasource since the wave/ownership.getry split
 * (the os kinds stayed in devthink/schema.prisma)
 * dev uses local sqlite at the root
 * production uses the env url — libsql http https postgres or file */

import { existsSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

/** resolve schema path — schema.prisma at the getry root is the canonical
 * location; the resolver anchors on this module's own directory first so
 * the config points at the gateway schema from any cwd, with the historical
 * cwd-based candidates kept as honored fallbacks */
function resolveschemapath(): string {
  const candidates = [
    path.resolve(import.meta.dirname, "schema.prisma"),
    path.resolve(process.cwd(), "schema.prisma"),
    path.resolve(process.cwd(), "prisma", "schema.prisma"),
    path.resolve(process.cwd(), "sol", "schema.prisma"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return candidates[0];
}

export default defineConfig({
  schema: resolveschemapath(),
  datasource: {
    url:
      process.env.GETRY_DATABASE_URL ||
      process.env.DEVTHINK_DATABASE_URL ||
      process.env.DATABASE_URL ||
      "file:./getry.db",
  },
});
