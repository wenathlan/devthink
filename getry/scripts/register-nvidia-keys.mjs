/**
 * register-nvidia-keys.mjs
 *
 * Cadastra as 22 chaves NVIDIA no banco de dados (Prisma ApiKey table).
 * Fonte: extraidas dos commits do git wormhole-extract (.git/• iotherv5/scripts/nvidia-keys.json)
 *
 * Schema usado: prisma/schema.prisma model ApiKey
 *   - provider: "nvidia"
 *   - key: <nvapi-...>
 *   - label: "nvidia-1".."nvidia-22"
 *   - active: true
 *   - status: "active"
 *
 * Usage:
 *   bun run scripts/register-nvidia-keys.mjs
 *   node scripts/register-nvidia-keys.mjs
 */

import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const filename = fileURLToPath(import.meta.url)
const __dirname = dirname(filename)
const cwd = process.cwd()

// Prisma 7.10 + libsql adapter — adapter takes config object directly (NOT a pre-built client)
const url = process.env.DATABASE_URL || "file:./db/custom.db"
const isRemote = url.startsWith("libsql:") || url.startsWith("http:") || url.startsWith("https:")
const config = isRemote
  ? { url, authToken: process.env.DATABASE_AUTH_TOKEN }
  : { url }
const adapter = new PrismaLibSql(config)
const prisma = new PrismaClient({ adapter })

// Prefer the in-project scripts/nvidia-keys.json (sibling file) — copy it there if missing.
const candidates = [
  join(cwd, "scripts", "nvidia-keys.json"),
  join(__dirname, "nvidia-keys.json"),
  "/home/z/my-project/scripts/nvidia-keys.json",
  "/home/z/my-project/tmp/wormhole-extract/.git/• iotherv5/scripts/nvidia-keys.json",
]

let keysFile = null
for (const p of candidates) {
  try {
    readFileSync(p, "utf8")
    keysFile = p
    break
  } catch {}
}

if (!keysFile) {
  console.error("[register-nvidia-keys] FATAL — nvidia-keys.json not found in any of:")
  candidates.forEach((p) => console.error("  " + p))
  process.exit(1)
}

console.log("[register-nvidia-keys] starting...")
console.log("[register-nvidia-keys] loading keys from:", keysFile)

const keysRaw = readFileSync(keysFile, "utf8")
const keys = JSON.parse(keysRaw)
console.log("[register-nvidia-keys] loaded", keys.length, "keys")


try {
  // Limpar chaves NVIDIA existentes (preserva outras)
  console.log("[register-nvidia-keys] clearing existing nvidia keys...")
  const deleted = await prisma.apiKey.deleteMany({ where: { provider: "nvidia" } })
  console.log("[register-nvidia-keys] deleted", deleted.count, "old nvidia keys")

  // Cadastrar as 22 chaves
  console.log("[register-nvidia-keys] registering", keys.length, "keys...")
  let n = 0
  for (const k of keys) {
    await prisma.apiKey.create({
      data: {
        provider: "nvidia",
        key: k.key,
        label: k.label,
        active: true,
        status: "active",
        useCount: 0,
        rotationCount: 0,
        errorCount: 0,
      },
    })
    n++
    console.log("[register-nvidia-keys] registered:", k.label, "(" + n + "/" + keys.length + ")")
  }

  // Verificar
  const count = await prisma.apiKey.count({ where: { provider: "nvidia", active: true } })
  console.log("[register-nvidia-keys] SUCCESS — total active nvidia keys:", count)
} catch (err) {
  console.error("[register-nvidia-keys] ERROR:", err.message)
  console.error(err.stack)
  process.exit(1)
} finally {
  await prisma.$disconnect()
}
