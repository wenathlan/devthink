// repair-anchors.mjs — the healing pass after the anchor restoration:
// consumers whose specifiers still point at the componentes copy of an
// anchor (or at a sibling path the restoration invalidated) get rewritten
// to the anchor's home in the page folder, and every restored anchor's own
// app-root imports lose the extra ../ level the componentes depth had
// added. usage: node scripts-session8/repair-anchors.mjs <appdir>...
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const EXTS = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs"];
const candidatesOf = (base) => [base, ...EXTS.slice(1).map((ext) => base + ext)];
const isFile = (p) => existsSync(p) && statSync(p).isFile();
const liveProbe = (base) => {
  for (const candidate of candidatesOf(base)) {
    if (isFile(candidate)) return candidate;
  }
  return null;
};
const walk = (dir) => {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === "build") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) out.push(full);
  }
  return out;
};

let totalRewrites = 0;
for (const arg of process.argv.slice(2)) {
  const appdir = resolve(arg);
  const sol = join(appdir, "Sol");
  if (!existsSync(sol)) continue;
  // the anchor table: page folder -> its anchor file (name == page, any case)
  const anchors = new Map(); // lowercase page -> { page, file }
  for (const page of readdirSync(sol, { withFileTypes: true })) {
    if (!page.isDirectory() || page.name === "componentes") continue;
    for (const name of readdirSync(join(sol, page.name))) {
      if (name.replace(/\.(ts|tsx)$/, "").toLowerCase() === page.name.toLowerCase()) {
        anchors.set(page.name.toLowerCase(), { page: page.name, file: join(sol, page.name, name) });
      }
    }
  }
  const SPEC = /((?:\bfrom|\bimport\s*\(|\brequire\s*\()\s*)(["'])([^"']+)\2/g;
  let rewrites = 0;
  for (const file of walk(appdir)) {
    const importerDir = dirname(file);
    // a restored anchor heals its own root imports through its pre-restore
    // location (the componentes depth)
    let preDir = null;
    for (const [, anchor] of anchors) {
      if (anchor.file === file) {
        preDir = join(sol, "componentes", anchor.page);
        break;
      }
    }
    let changed = false;
    const next = readFileSync(file, "utf8").replace(SPEC, (whole, lead, quote, spec) => {
      if (!spec.startsWith(".")) return whole;
      const currently = liveProbe(resolve(importerDir, spec));
      if (currently) return whole; // the specifier is healthy
      // inference: a broken specifier ending <page>/<file> where the file
      // stem equals the page names the anchor — point it home
      const match = spec.match(/([^/"']+)[/\\]([^/"']+)\.(tsx?|jsx?|mjs)$/);
      if (match) {
        const anchor = anchors.get(match[1].toLowerCase());
        const wanted = join(sol, match[1], `${match[2]}.${match[3]}`);
        if (anchor && isFile(wanted)) {
          let nextSpec = relative(importerDir, wanted).split("\\").join("/");
          if (!nextSpec.startsWith(".")) nextSpec = "./" + nextSpec;
          changed = true;
          rewrites += 1;
          return `${lead}${quote}${nextSpec}${quote}`;
        }
      }
      // the restored anchor's own root imports: resolve from the depth the
      // componentes location had given them
      if (preDir) {
        const target = liveProbe(resolve(preDir, spec));
        if (target) {
          let nextSpec = relative(importerDir, target).split("\\").join("/");
          if (!/\.[a-z]+$/.test(spec.replace(/\/$/, ""))) nextSpec = nextSpec.replace(/\.(ts|tsx)$/, "");
          if (!nextSpec.startsWith(".")) nextSpec = "./" + nextSpec;
          changed = true;
          rewrites += 1;
          return `${lead}${quote}${nextSpec}${quote}`;
        }
      }
      return whole;
    });
    if (changed) writeFileSync(file, next);
  }
  console.log(`${relative(process.cwd(), appdir) || appdir}: ${rewrites} specifiers healed`);
  totalRewrites += rewrites;
}
console.log(`REPAIR_DONE total rewrites: ${totalRewrites}`);
