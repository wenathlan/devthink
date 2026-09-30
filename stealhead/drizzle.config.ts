/**
 * drizzle.config.ts — the drizzle-kit configuration of the stealhead
 * database layer.
 *
 * the sqlite dialect points at the DATABASE_URL environment (the same
 * location db.ts boots from); nothing is hardcodado and no sql file is
 * committed. the config imports nothing at runtime beyond drizzle-kit
 * itself so typecheck never depends on the kit being installed.
 */
import { defineConfig } from "drizzle-kit";
import process from "node:process";

/** the database location from the environment (required, never default). */
const url = process.env.DATABASE_URL ?? "";
if (url.trim() === "") {
  throw new Error("DATABASE_URL is required for the drizzle kit (see .dev.vars.example)");
}

export default defineConfig({
  dialect: "sqlite",
  dbCredentials: { url },
  out: "./drizzleout",
});
