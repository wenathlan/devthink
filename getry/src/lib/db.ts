/**
 * Gateway DB client — Prisma + libsql adapter
 * V5 canonical pattern with @prisma/adapter-libsql for serverless/edge compat
 *
 * Prisma 7.10 adapter signature: new PrismaLibSql(config: { url, authToken })
 *   — the adapter constructs the libsql client internally from config.
 */

import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL || "file:./db/custom.db"
  const isRemote = url.startsWith("libsql:") || url.startsWith("http:") || url.startsWith("https:")
  // PrismaLibSql accepts the same config object shape as @libsql/client createClient()
  const config = isRemote
    ? { url, authToken: process.env.DATABASE_AUTH_TOKEN }
    : { url }
  const adapter = new PrismaLibSql(config as ConstructorParameters<typeof PrismaLibSql>[0])
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])
}

export const db = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
