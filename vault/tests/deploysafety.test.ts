// # deploysafety.test — the deploy safety contract of the vault, runnable
// with the house vitest suite:
//   bunx vitest run tests/deploysafety.test.ts
// The faun lesson of the deploy wave: the engine keeps its runtime sqlite
// stores beside the working directory (vault-storage.db, uistore.db, the
// wal and shm sidecars), so any deploy lane that publishes the application
// ROOT ships the whole store over https. This battery pins the seal end to
// end: the build emits into dist (never the app root), every publish lane
// (netlify, vercel, workers) mounts that build output only and carries no
// database face inside it, _headers seals the database faces, the container
// copies only the build output into the served tree and runs the engine
// itself (node api.ts, /api/health, the fail-closed token door), and the
// engine's own static lane refuses a database file even inside its static
// root.

import assert from "node:assert/strict";
import { type Dirent, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "vitest";

/* the engine chain opens its sqlite singleton at import (drizzle.ts), so
 * the route-lane boot below routes the storage into the throwaway store of
 * the os tmpdir BEFORE api.ts evaluates (the quotaisolation precedent) —
 * the battery that seals the runtime stores never drops one beside the
 * sources. The token is pinned the same way so the gate assertions below
 * answer deterministically (a wrong bearer refuses, the right one rides).
 * The ui store routes into the same throwaway home. */
const throwaway = join(tmpdir(), `vault-deploysafety-${process.pid}.test.db`);
process.env.VAULT_STORAGE_URL = `file:${throwaway}`;
process.env.VAULT_UISTORE_DB = join(tmpdir(), `vault-deploysafety-${process.pid}.uistore.db`);
process.env.VAULT_TOKEN = "the-deploysafety-operator-token";
for (const file of [throwaway, process.env.VAULT_UISTORE_DB]) {
  for (const suffix of ["", "-wal", "-shm"]) {
    rmSync(`${file}${suffix}`, { force: true });
  }
}

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const VITE = read("../vite.config.ts");
const NETLIFY = read("../netlify.toml");
const VERCEL = read("../vercel.json");
const WRANGLER = read("../wrangler.toml");
const HEADERS = read("../_headers");
const DOCKERFILE = read("../Dockerfile");
const API = read("../api.ts");

/** the app root — the folder the deploy configs resolve against. */
const APPROOT = join(import.meta.dirname, "..");

/**
 * Resolves the publish dirs the deploy lanes declare — the battery reads
 * the configs and walks what the platforms will actually mount, never a
 * hardcoded guess.
 *
 * @returns the declared publish dirs (netlify publish, vercel
 *   outputDirectory, workers assets directory), deduplicated.
 */
function publishDirs(): string[] {
  const dirs: string[] = [];
  const netlify = NETLIFY.match(/^\s*publish\s*=\s*"([^"]*)"/m);
  const vercel = VERCEL.match(/"outputDirectory"\s*:\s*"([^"]*)"/);
  const wrangler = WRANGLER.match(/^directory\s*=\s*"([^"]*)"/m);
  for (const found of [netlify, vercel, wrangler]) {
    if (found !== null && !dirs.includes(found[1])) dirs.push(found[1]);
  }
  return dirs;
}

/** the database faces the seal covers (the engine stores and their sqlite
 * sidecars, wal and shm included). */
const DBFACE = /\.(db|db-shm|db-wal|db-journal)$/;

/**
 * Walks one dir tree and answers every database face it carries.
 *
 * @param dir the dir to walk.
 * @returns the absolute paths of the database faces found.
 */
function dbFacesUnder(dir: string): string[] {
  const found: string[] = [];
  const entries: Dirent[] = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...dbFacesUnder(full));
    } else if (DBFACE.test(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

describe("the build emits into dist, never the app root", () => {
  it("declares the dedicated outDir and resets it on every build", () => {
    assert.match(VITE, /outDir: path\.resolve\(import\.meta\.dirname, "dist"\)/, "the outDir is the dist tree");
    assert.doesNotMatch(
      VITE,
      /outDir: path\.resolve\(import\.meta\.dirname, "\."\)/,
      "the app root is never the outDir",
    );
    assert.match(VITE, /emptyOutDir: true/, "the dedicated outDir resets on every build");
  });

  it("carries the deploy faces into the build output (the publish lanes read them there)", () => {
    for (const face of ["_headers", "_redirects", "favicon.svg", "icon.svg", "robots.txt", "sitemap.xml"]) {
      assert.ok(VITE.includes(`"${face}"`), `the build must carry ${face} into dist`);
    }
  });
});

describe("every publish lane mounts the build output only", () => {
  it("netlify, vercel and workers publish dist, never the application root", () => {
    assert.match(NETLIFY, /publish\s*=\s*"dist"/, "netlify publishes dist");
    assert.doesNotMatch(NETLIFY, /publish\s*=\s*"\."/);
    assert.match(VERCEL, /"outputDirectory"\s*:\s*"dist"/, "vercel mounts dist");
    assert.doesNotMatch(VERCEL, /"outputDirectory"\s*:\s*"\."/);
    assert.match(WRANGLER, /directory\s*=\s*"dist"/, "workers mount dist");
    assert.doesNotMatch(WRANGLER, /directory\s*=\s*"\."/);
  });

  it("no database file answers from any publish dir the configs declare", () => {
    const dirs = publishDirs();
    assert.ok(dirs.length >= 1, "the deploy configs declare their publish dirs");
    for (const dir of dirs) {
      assert.notEqual(dir, ".", "a publish dir never resolves to the application root");
      assert.notEqual(dir, "./", "a publish dir never resolves to the application root");
      const publish = join(APPROOT, dir);
      if (!readdirSyncSafe(publish)) continue; // the lane never built here: nothing to seal
      const faces = dbFacesUnder(publish);
      assert.deepEqual(faces, [], `${dir} carries database faces — the faun vector: ${faces.join(", ")}`);
    }
  });
});

/** answers whether one dir exists (the publish lane may never have built on
 * this host — an absent dir carries nothing to seal). */
function readdirSyncSafe(dir: string): boolean {
  try {
    readdirSync(dir);
    return true;
  } catch {
    return false;
  }
}

describe("the _headers seal", () => {
  it("seals the database faces — never cached, never indexed, never rendered inline", () => {
    for (const rule of [/^\/\*\.db$/m, /^\/\*\.db-shm$/m, /^\/\*\.db-wal$/m, /^\/\*\.db-journal$/m]) {
      assert.match(HEADERS, rule, `the db seal rule ${rule.source} must stand`);
    }
    assert.match(HEADERS, /Cache-Control: no-store/, "the sealed faces never ride a cache");
    assert.match(HEADERS, /X-Robots-Tag: noindex/, "the sealed faces never ride an index");
  });
});

describe("the container builds the engine, never a source tree mirror", () => {
  it("copies only the build output into the served tree", () => {
    assert.match(DOCKERFILE, /COPY --from=solbuild \/src\/dist\/ \/app\/dist\//, "the served tree carries dist only");
    assert.doesNotMatch(DOCKERFILE, /COPY --from=\S+ \/src\/\s/, "no stage mirrors the source root into the image");
  });

  it("runs the engine behind the token door with the open health probe", () => {
    assert.match(DOCKERFILE, /node api\.ts/, "the container process is the engine");
    assert.match(DOCKERFILE, /VAULT_TOKEN/, "the boot refuses to start without the vault token");
    assert.match(DOCKERFILE, /\/api\/health/, "the healthcheck rides the open health route");
    assert.match(DOCKERFILE, /USER node/, "the runtime stays unprivileged");
  });
});

describe("the engine static lane (the container doctrine)", () => {
  it("serves the built faces and the spa fallback, keeps /api precedence, and refuses a database file outright", async () => {
    /* a minimal dist tree: the entry, a hashed face, and the sealed store
     * the faun vector would publish */
    const staging = mkdtempSync(join(tmpdir(), "vault-deploysafety-static-"));
    writeFileSync(join(staging, "index.html"), "<!doctype html><title>vault</title>");
    writeFileSync(join(staging, "index-a1b2c3d4.js"), "console.log('vault');");
    writeFileSync(join(staging, "vault-storage.db"), "the faun bytes");
    process.env.VAULT_STATIC_DIR = staging;
    try {
      const { createVaultServer, listenVault } = await import("../api.ts");
      const server = createVaultServer();
      const port = await listenVault(server, { port: 0 });
      const base = `http://127.0.0.1:${port}`;
      try {
        // the entry answers with the html content type and the security headers
        const entry = await fetch(`${base}/`);
        assert.equal(entry.status, 200);
        assert.equal(entry.headers.get("content-type"), "text/html; charset=utf-8");
        assert.equal(entry.headers.get("x-content-type-options"), "nosniff");
        assert.match(await entry.text(), /<title>vault<\/title>/);
        // the hashed face answers with its real content type
        const face = await fetch(`${base}/index-a1b2c3d4.js`);
        assert.equal(face.status, 200);
        assert.equal(face.headers.get("content-type"), "text/javascript; charset=utf-8");
        // the extensionless route falls back to the spa entry (the platform rewrite)
        const route = await fetch(`${base}/objects`);
        assert.equal(route.status, 200);
        assert.match(await route.text(), /<title>vault<\/title>/);
        // the api surface keeps precedence over the static lane: the copy
        // route answers open, and an unknown /api/* path answers the route
        // 404 (with the bearer past the gate) instead of any static face
        const copy = await fetch(`${base}/api/v1/ui/copy`);
        assert.equal(copy.status, 200);
        const unknown = await fetch(`${base}/api/nobody`, {
          headers: { authorization: "Bearer the-deploysafety-operator-token" },
        });
        assert.equal(unknown.status, 404);
        assert.equal(((await unknown.json()) as { error: { code: string } }).error.code, "VAULT_ROUTE");
        // the faun seal: the database file refuses, plain or encoded, even
        // though it sits inside the static root
        for (const sealed of ["vault-storage.db", "vault-storage%2Edb", "VAULT-STORAGE.DB"]) {
          const refusal = await fetch(`${base}/${sealed}`);
          assert.equal(refusal.status, 404, `${sealed} must never answer bytes`);
          assert.equal(((await refusal.json()) as { error: { code: string } }).error.code, "VAULT_STATIC");
        }
        // the file-like miss stays an honest 404 (never the spa entry)
        const miss = await fetch(`${base}/missing-a1b2c3d4.js`);
        assert.equal(miss.status, 404);
        // the token gate stays armed beside the static lane: a data route
        // demands the bearer even while the site face answers open
        const refused = await fetch(`${base}/api/v1/storage/usage?project=p1`);
        assert.equal(refused.status, 401);
        const ridden = await fetch(`${base}/api/v1/storage/usage?project=p1`, {
          headers: { authorization: "Bearer the-deploysafety-operator-token" },
        });
        assert.equal(ridden.status, 200);
      } finally {
        server.close();
      }
    } finally {
      delete process.env.VAULT_STATIC_DIR;
      rmSync(staging, { recursive: true, force: true });
    }
  });

  it("declares the static root door the container pins", () => {
    assert.match(API, /VAULT_STATIC_DIR/, "the static root is env-pinned");
  });
});
