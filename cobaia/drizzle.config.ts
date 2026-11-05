// # drizzle config — the raw ORM side of the self-hosted stack, sqlite via DATABASE_URL
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:./local.db",
  },
});
