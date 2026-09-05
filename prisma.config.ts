/** prisma config — universal datasource url fallback for the gateway library
 * the schema lives in web/schema.prisma — flat per skill no nesting
 * dev uses local sqlite in the prisma folder
 * production uses the env url — libsql http https postgres or file */

import { existsSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

/** resolve schema path — web/schema.prisma is the standard location */
function resolveschemapath(): string {
  const candidates = [
    path.resolve(process.cwd(), "web", "gateway", "schema.prisma"),
    path.resolve(process.cwd(), "web", "schema.prisma"),
    path.resolve(process.cwd(), "schema.prisma"),
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
      process.env.GATEWAY_DATABASE_URL || process.env.DATABASE_URL || "file:./prisma/devthink.db",
  },
});
