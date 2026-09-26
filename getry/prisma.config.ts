import { defineConfig } from "@prisma/config"

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "file:/home/z/my-project/db/custom.db",
  },
})
