// fix-depths.mjs — the wave 5 depth healer: the zombie's rewired components
// were written at the pre-centralization depths (Sol/<page>/) and now live
// under Sol/componentes/<page>/ — every broken relative specifier gains the
// one extra ../ level that resolves it. usage:
//   node scripts-session8/fix-depths.mjs <appdir>
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const appdir = resolve(process.argv[2] || ".");
const root = join(appdir, "Sol", "componentes");
const EXTS = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".css", ".json"];
const isFile = (p) => existsSync(p) && statSync(p).isFile();
const liveProbe = (base) => {
  for (const ext of EXTS) {
    if (isFile(base + ext)) return base + ext;
  }
  return null;
};
const walk = (dir) => {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
};
const SPEC = /((?:\bfrom|\bimport\s*\(|\brequire\s*\()\s*)(["'])(\.\.?\/[^"']+)\2/g;
let rewrites = 0;
const reports = [];
for (const file of walk(root)) {
  const importerDir = dirname(file);
  let changed = false;
  const next = readFileSync(file, "utf8").replace(SPEC, (whole, lead, quote, spec) => {
    const currently = liveProbe(resolve(importerDir, spec));
    if (currently) return whole; // healthy
    // try one level deeper (the componentes depth): ../../x -> ../../../x
    const deeper = spec.replace(/^(\.\.\/)+/, (m) => m + "../");
    const target = liveProbe(resolve(importerDir, deeper));
    if (!target) return whole; // broken for another reason — leave for tsc
    changed = true;
    rewrites += 1;
    reports.push(`${relative(appdir, file)}: ${spec} -> ${deeper}`);
    return `${lead}${quote}${deeper}${quote}`;
  });
  if (changed) writeFileSync(file, next);
}
console.log(`depth rewrites: ${rewrites}`);
for (const report of reports.slice(0, 25)) console.log("  " + report);
if (reports.length > 25) console.log(`  ... and ${reports.length - 25} more`);
console.log("DEPTH_FIX_DONE");
