// # quotaisolation — the database isolation of the quota suite: this module
// imports FIRST (before the engine chain) so the storage singleton of
// drizzle.ts opens on the throwaway file of the suite — a previous run's
// owner word never answers for this one. the throwaway lives in the os
// tmpdir so no subfolder ever appears inside tests, and the *.db gitignore
// law still keeps any stray throwaway out of the tree.
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const throwaway = join(tmpdir(), `vault-quota-${process.pid}.test.db`);
process.env.VAULT_STORAGE_URL = `file:${throwaway}`;
for (const suffix of ["", "-wal", "-shm"]) {
  rmSync(`${throwaway}${suffix}`, { force: true });
}
