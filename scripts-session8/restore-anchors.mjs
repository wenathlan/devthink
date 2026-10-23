// restore-anchors.mjs — the doctrine ruling pass: the anchor of a page
// folder is the file carrying the folder's own name, case-insensitively.
// Seven family apps saw their PascalCase anchors (Shell.tsx, Toast.tsx)
// centralized by the engine's exact-case rule; this pass moves every
// misplaced anchor back into its page folder and rewrites specifiers with
// the same pre/post resolution machinery the centralize engine uses (the
// restored anchor's own root imports lose one ../ level again).
// usage: node scripts-session8/restore-anchors.mjs <appdir>...
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const EXTS = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs"];
const candidatesOf = (base) => [base, ...EXTS.slice(1).map((ext) => base + ext)];
const isFile = (p) => existsSync(p) && statSync(p).isFile();
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

let totalMoves = 0;
for (const arg of process.argv.slice(2)) {
  const appdir = resolve(arg);
  const sol = join(appdir, "Sol");
  const componentes = join(sol, "componentes");
  if (!existsSync(componentes)) continue;
  const backMap = new Map(); // componentes location -> page folder location
  for (const page of readdirSync(componentes, { withFileTypes: true })) {
    if (!page.isDirectory()) continue;
    const pageFolder = join(sol, page.name);
    for (const name of readdirSync(join(componentes, page.name))) {
      const stem = name.replace(/\.(ts|tsx)$/, "").toLowerCase();
      if (stem !== page.name.toLowerCase()) continue; // a genuine component, stays
      if (candidatesOf(join(pageFolder, page.name)).some(isFile)) continue; // anchor already home
      backMap.set(join(componentes, page.name, name), join(pageFolder, name));
    }
  }
  if (backMap.size === 0) {
    console.log(`${relative(process.cwd(), appdir) || appdir}: no misplaced anchors`);
    continue;
  }
  const oldDirOf = new Map([...backMap].map(([to, from]) => [from, dirname(to)]));
  for (const [from, to] of backMap) {
    if (!existsSync(from)) continue; // already restored by an earlier pass
    execSync(`git mv "${from}" "${to}"`, { cwd: appdir, stdio: "pipe" });
    totalMoves += 1;
    console.log(`restored ${relative(appdir, from)} -> ${relative(appdir, to)}`);
  }
  // resolution machinery: pre-move aware through the back map
  const preResolve = (base) => {
    for (const candidate of candidatesOf(base)) {
      if (backMap.has(candidate)) return backMap.get(candidate);
      if (isFile(candidate)) return candidate;
    }
    return null;
  };
  const liveProbe = (base) => {
    for (const candidate of candidatesOf(base)) {
      if (isFile(candidate)) return candidate;
    }
    return null;
  };
  // the alias table of the app
  const aliases = [];
  for (const configName of ["tsconfig.json", "tsconfig.node.json"]) {
    const configPath = join(appdir, configName);
    if (!existsSync(configPath)) continue;
    try {
      const config = JSON.parse(readFileSync(configPath, "utf8").replace(/\/\*.*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1"));
      for (const [prefix, targets] of Object.entries(config?.compilerOptions?.paths || {})) {
        if (!prefix.includes("*")) continue;
        aliases.push({
          matchPrefix: prefix.slice(0, prefix.indexOf("*")),
          bases: targets.map((target) => resolve(appdir, target.replace(/\*[^/]*$/, "").replace(/\/*$/, "")) || appdir),
        });
      }
    } catch {}
  }
  const SPEC = /((?:\bfrom|\bimport\s*\(|\brequire\s*\()\s*)(["'])([^"']+)\2/g;
  let rewrites = 0;
  for (const file of walk(appdir)) {
    const importerDir = dirname(file);
    const preDir = oldDirOf.get(file) || importerDir;
    let changed = false;
    const next = readFileSync(file, "utf8").replace(SPEC, (whole, lead, quote, spec) => {
      const rewrite = (target) => {
        let nextSpec = relative(importerDir, target).split("\\").join("/");
        if (!/\.[a-z]+$/.test(spec.replace(/\/$/, ""))) nextSpec = nextSpec.replace(/\.(ts|tsx)$/, "");
        if (!nextSpec.startsWith(".")) nextSpec = "./" + nextSpec;
        changed = true;
        rewrites += 1;
        return `${lead}${quote}${nextSpec}${quote}`;
      };
      if (spec.startsWith(".")) {
        const target = preResolve(resolve(preDir, spec));
        if (!target) return whole;
        const currently = liveProbe(resolve(importerDir, spec));
        if (target === currently) return whole;
        return rewrite(target);
      }
      for (const alias of aliases) {
        if (!spec.startsWith(alias.matchPrefix)) continue;
        for (const base of alias.bases) {
          const target = preResolve(resolve(base, spec.slice(alias.matchPrefix.length)));
          if (!target) continue;
          let current = null;
          for (const probeBase of alias.bases) {
            current = liveProbe(resolve(probeBase, spec.slice(alias.matchPrefix.length)));
            if (current) break;
          }
          if (target === current) return whole;
          let nextSpec = relative(base, target).split("\\").join("/");
          if (!/\.[a-z]+$/.test(spec.replace(/\/$/, ""))) nextSpec = nextSpec.replace(/\.(ts|tsx)$/, "");
          changed = true;
          rewrites += 1;
          return `${lead}${quote}${alias.matchPrefix}${nextSpec}${quote}`;
        }
      }
      return whole;
    });
    if (changed) writeFileSync(file, next);
  }
  console.log(`${relative(process.cwd(), appdir) || appdir}: ${backMap.size} anchors restored, ${rewrites} specifiers rewritten`);
}
console.log(`RESTORE_DONE total moves: ${totalMoves}`);
