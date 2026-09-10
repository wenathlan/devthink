/** prisma config — universal datasource url fallback for the embedded gateway library
 * the schema lives in web/schema.prisma — the web workbench root, flat per skill no nesting
 * dev uses local sqlite in the prisma folder
 * production uses the env url — libsql http https postgres or file */

import { existsSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

/** resolve schema path — web/schema.prisma is the canonical location of the merged repository */
function resolveschemapath(): string {
  const candidates = [
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
    url: process.env.DEVTHINK_DATABASE_URL || process.env.DATABASE_URL || "file:./web/prisma/devthink.db",
  },
});
