/**
 * build.ts — the node-face builder of the vault envelope (the node face
 * law): the runtime faces the family's node lanes import (the saddle
 * webserver's db.ts reads ./onboardingstore, its labels.ts reads
 * ./labelstore) ship beside their sources as self-contained build bundles,
 * because plain node refuses to type-strip any .ts that resolves inside
 * node_modules — the published envelope's source-only faces crash the node
 * lanes at boot (ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING), while bun,
 * vite and the monorepo bridges keep reading the .ts sources the
 * source-is-library doctrine ships.
 *
 * THE EXPORTS LAW: the faces' exports entries carry the node condition
 * first (./build/<face>.js), the import and default conditions keep the
 * .ts source — node (and every engine honoring the node condition, bun
 * included) answers the build bundle, the browser bundlers answer the
 * source, and the types stay the .ts the declaration readers parse.
 *
 * Both faces are pure zero-import modules (the browser-safe construction
 * the storage law owns), so the bundles carry no externals and no
 * platform — a neutral es2022 esm product, byte-stable across engines.
 *
 * Usage: node --experimental-strip-types build.ts [vaultroot] — the root
 * defaults to this file's own folder, so the in-repo walk stays
 * `node --experimental-strip-types vault/build.ts` while the container's
 * solbuild stage runs the copied script against the staged /vault tree.
 */
import { build } from "esbuild";
import { mkdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.argv[2] ?? dirname(fileURLToPath(import.meta.url));

/** the runtime faces the node lanes import — the only seats the node-face
 * law builds (every other face stays source-only: no node lane reads it,
 * the bundlers answer the .ts the exports map points at). */
const NODEFACES = ["onboardingstore", "labelstore"] as const;

for (const face of NODEFACES) {
  const source = join(root, `${face}.ts`);
  await stat(source);
  await mkdir(join(root, "build"), { recursive: true });
  await build({
    entryPoints: [source],
    outfile: join(root, "build", `${face}.js`),
    bundle: true,
    format: "esm",
    platform: "neutral",
    target: "es2022",
    sourcemap: true,
    logLevel: "warning",
  });
  console.log(`the ${face} node face ships at build/${face}.js`);
}
