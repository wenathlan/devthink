/**
 * build-lib — npm library bundle of the @wenathlan/devthink server family
 * one file one responsibility — only the lib build orchestration lives here
 *
 * produces inside build/ (beside the extension bundles tests/build.ts emits):
 *   server.js          esm library entry of the server surface (the embedded
 *                      gateway console, transport, auth and library barrel
 *                      beside the maene provider family barrel — one entry)
 *   engine.js          esm engine entry
 *   *.d.ts             declarations of the server family modules
 *
 * the grand merge consolidation interned the server lineage entries
 * (the console, the transport, the request auth and the library
 * barrel in server.ts): the library entries ride the server module the
 * consolidated repository owns, and the engine entry keeps its own name —
 * the server family entries never collide with the extension dist targets
 * (the root build owns server.js itself, this script re-proves the lib pair
 * with the bun compiler and keeps the engine entry alive).
 *
 * run order: tests/build.ts FIRST (the root build), then this script.
 * the package is esm only — node engine floor, no cjs output.
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const root = process.cwd();

function run(cmd: string) {
  execSync(cmd, { stdio: "inherit", cwd: root });
}

// --- esm entries -----------------------------------------------------------

// the ownership wave (wave/ownership.getry) moved the universal gateway engine
// to the getry root: the engine entry bundles the owner's source — the
// @wenathlan/devthink build never carries a second engine copy.
run("bun build ../getry/engine.ts --target=node --format=esm --packages=external --outfile build/engine.js");
console.log("[build-lib] esm engine entry bundled");

// --- declarations ----------------------------------------------------------
// the declaration pass of the root build (tsconfig.build.json includes
// server.ts, and the engine rides the server import graph) already emitted
// the server family declarations beside the extension declarations, so this
// script only proves the pair exists below.

// --- sanity ----------------------------------------------------------------

const required = ["build/server.js", "build/engine.js", "build/server.d.ts", "build/engine.d.ts"];
const missing = required.filter((p) => !existsSync(`${root}/${p}`));
if (missing.length > 0) {
  console.error(`[build-lib] missing bundle artifacts: ${missing.join(", ")}`);
  process.exit(1);
}
console.log("[build-lib] library bundle complete");
