/**
 * register-nvidia-keys.ts
 * registers 22 nvidia api keys into the db nvidiaKey table
 * source: extracted from git blobs in the original gateway repo
 * run with: bun run scripts/register-nvidia-keys.ts
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "../database";

async function main() {
  console.log("[register-nvidia-keys] starting...");

  const keysFile = join(process.cwd(), "scripts", "nvidia-keys.json");
  const keysRaw = readFileSync(keysFile, "utf8");
  const keys = JSON.parse(keysRaw) as Array<{ label: string; key: string }>;

  console.log("[register-nvidia-keys] loaded", keys.length, "keys from", keysFile);

  /** clear existing keys */
  console.log("[register-nvidia-keys] clearing existing keys...");
  await db.nvidiaKey.deleteMany({});

  /** register the 22 keys */
  console.log("[register-nvidia-keys] registering", keys.length, "keys...");
  for (const k of keys) {
    await db.nvidiaKey.create({
      data: {
        keyValue: k.key,
        label: k.label,
        active: true,
        status: "active",
        errorCount: 0,
        successCount: 0,
      },
    });
    console.log("[register-nvidia-keys] registered:", k.label);
  }

  /** verify */
  const count = await db.nvidiaKey.count({ where: { active: true, status: "active" } });
  console.log("[register-nvidia-keys] SUCCESS - total active keys:", count);

  await db.$disconnect();
}

main().catch((err) => {
  console.error("[register-nvidia-keys] ERROR:", err.message);
  process.exit(1);
});
