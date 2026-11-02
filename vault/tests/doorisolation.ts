// # doorisolation — the database isolation of the person's door batteries
// (signup, querylane): this module imports FIRST (before the engine chain)
// so the site store of db.ts and the per-database files of the query lane
// open on the throwaway roots of the suite — a previous run's accounts and
// databases never answer for this one. The throwaway lives in the os tmpdir
// so no subfolder ever appears inside tests, and the *.db gitignore law
// still keeps any stray throwaway out of the tree. The operator token pins
// before the api import so the module-load digest of the api's token gate
// resolves against it (the quotaisolation precedent).
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** the throwaway root of this worker's door battery. */
const root = join(tmpdir(), `vault-door-${process.pid}.test`);

process.env.DATABASE_URL = `file:${join(root, "site.db")}`;
process.env.VAULT_UISTORE_DB = join(root, "uistore.db");
process.env.VAULT_STORAGE_URL = `file:${join(root, "storage.db")}`;
process.env.VAULT_DATABASES_DIR = join(root, "databases");
process.env.VAULT_INTERNAL_ROOT = join(root, "root");
process.env.VAULT_TOKEN = "the door battery operator word";

for (const suffix of ["", "-wal", "-shm"]) {
  rmSync(`${join(root, "site.db")}${suffix}`, { force: true });
  rmSync(`${join(root, "storage.db")}${suffix}`, { force: true });
}
