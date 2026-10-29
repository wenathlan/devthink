// # quotaisolation — the database isolation of the quota suite: this module
// imports FIRST (before the engine chain) so the storage singleton of
// drizzle.ts opens on the throwaway file of the suite — a previous run's
// owner word never answers for this one. the *.db gitignore law keeps the
// throwaway out of the tree.
import { rmSync } from "node:fs";

process.env.VAULT_STORAGE_URL = "file:./tests/tmp/quota.test.db";
for (const suffix of ["", "-wal", "-shm"]) {
  rmSync(`tests/tmp/quota.test.db${suffix}`, { force: true });
}
