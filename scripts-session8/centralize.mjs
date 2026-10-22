// centralize.mjs — the wave 2 engine: every application of the family
// centralizes its whole component surface into Sol/componentes/<page>/,
// and every page folder keeps only its anchor file (the file carrying
// the folder's own name). The moves preserve git history (git mv) and the
// import rewrite is resolution based and idempotent: for every relative
// or alias specifier of every source file, the pre-move target is
// reconstructed through the moved map (old path -> new path), compared
// with what the specifier resolves to from the importer's post-move
// location, and rewritten only when they disagree. Extensionless
// specifiers stay extensionless, alias specifiers stay alias shaped.
// usage: node scripts-session8/centralize.mjs <appdir> [--dry]
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const appdir = resolve(process.argv[2] || "");
const dry = process.argv.includes("--dry");
if (!appdir || !existsSync(join(appdir, "Sol"))) {
  console.error("usage: centralize.mjs <appdir> (must carry a Sol theme folder)");
  process.exit(2);
}
const sol = join(appdir, "Sol");
const componentes = join(sol, "componentes");
const EXTS = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".css", ".json", ".svg", ".png"];

// 1. inventory: pending moves (loose files still beside their anchor) and
//    already-moved entries (previous run of the engine) both feed the map;
//    the page set also counts the componentes subfolders whose page folder
//    vanished entirely (every file moved — the shell precedent), so the
//    idempotent rescan still reconstructs their old->new map
const pageNames = new Set(
  readdirSync(sol, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "componentes")
    .map((entry) => entry.name),
);
if (existsSync(componentes)) {
  for (const entry of readdirSync(componentes, { withFileTypes: true })) {
    if (entry.isDirectory()) pageNames.add(entry.name);
  }
}
const pages = [...pageNames];
const movedMap = new Map(); // old absolute -> new absolute
const oldDirOf = new Map(); // new absolute -> old directory
const pending = [];
for (const page of pages) {
  const folder = join(sol, page);
  if (existsSync(folder)) {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (entry.name === `${page}.tsx` || entry.name === `${page}.ts`) continue; // the anchor stays
      pending.push({ from: join(folder, entry.name), to: join(componentes, page, entry.name) });
    }
  }
  const done = join(componentes, page);
  if (existsSync(done)) {
    for (const name of readdirSync(done)) {
      const to = join(done, name);
      movedMap.set(join(folder, name), to);
      oldDirOf.set(to, folder);
    }
  }
}
for (const move of pending) {
  movedMap.set(move.from, move.to);
  oldDirOf.set(move.to, dirname(move.from));
}
console.log(`pages: ${pages.length}, pending moves: ${pending.length}, already centralized: ${movedMap.size - pending.length}`);

// 2. execute the pending moves (git mv keeps the history)
if (!dry && pending.length > 0) {
  for (const move of pending) {
    execSync(`mkdir -p "${dirname(move.to)}"`);
    execSync(`git mv "${move.from}" "${move.to}"`, { cwd: appdir, stdio: "pipe" });
  }
  console.log(`moved ${pending.length} files into Sol/componentes/`);
}

// 3. resolution machinery — pre-move aware: a candidate path either still
//    exists, or is recorded in the moved map (its old location). the .js
//    specifiers of the typescript esm convention probe their .ts/.tsx
//    siblings, and the rewrite keeps the specifier's own suffix shape.
import { statSync } from "node:fs";
const variants = (base) => {
  const list = [base, ...EXTS.slice(1).map((ext) => base + ext)];
  if (base.endsWith(".js")) list.push(base.slice(0, -3) + ".ts", base.slice(0, -3) + ".tsx");
  return list;
};
const preResolve = (base) => {
  for (const candidate of variants(base)) {
    if (movedMap.has(candidate)) return movedMap.get(candidate);
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
};
const liveProbe = (base) => {
  for (const candidate of variants(base)) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
};

// 4. the alias table of the app (tsconfig paths), when the app carries one
const aliases = [];
for (const configName of ["tsconfig.json", "tsconfig.node.json"]) {
  const configPath = join(appdir, configName);
  if (!existsSync(configPath)) continue;
  let config;
  try {
    config = JSON.parse(readFileSync(configPath, "utf8").replace(/\/\*.*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1"));
  } catch {
    continue;
  }
  const paths = config?.compilerOptions?.paths || {};
  for (const [prefix, targets] of Object.entries(paths)) {
    if (!prefix.includes("*")) continue; // exact aliases never move with Sol
    aliases.push({
      prefix,
      matchPrefix: prefix.slice(0, prefix.indexOf("*")),
      targets: targets.map((target) => ({
        template: target,
        base: resolve(appdir, target.replace(/\*[^/]*$/, "").replace(/\/\*$/, "")),
      })),
    });
  }
}

// 5. the rewrite pass over every source file of the application
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
const stripExtension = (spec, target, importerDir) => {
  if (/\.[a-z]+$/.test(spec.replace(/\/$/, ""))) return null; // the spec already carries one
  const stripped = target.replace(/\.(ts|tsx|js|jsx|mjs)$/, "");
  if (stripped === target) return null;
  return stripped;
};
const sources = walk(appdir);
const SPEC = /((?:\bfrom|\bimport\s*\(|\brequire\s*\()\s*)(["'])([^"']+)\2/g;
let rewrites = 0;
const reports = [];
for (const file of sources) {
  const importerDir = dirname(file);
  const preDir = oldDirOf.get(file) || importerDir;
  let changed = false;
  const next = readFileSync(file, "utf8").replace(SPEC, (whole, lead, quote, spec) => {
    if (spec.startsWith(".")) {
      // relative specifier: what it meant pre-move vs what it means now
      const target = preResolve(resolve(preDir, spec));
      if (!target) return whole;
      const currently = liveProbe(resolve(importerDir, spec));
      if (target === currently) return whole;
      let nextSpec = relative(importerDir, target).split("\\").join("/");
      if (spec.endsWith(".js") && /\.(ts|tsx)$/.test(nextSpec)) nextSpec = nextSpec.replace(/\.(ts|tsx)$/, ".js");
      const stripped = stripExtension(spec, nextSpec, importerDir);
      if (stripped !== null && preResolve(resolve(importerDir, relative(importerDir, stripped))) === target) nextSpec = stripped;
      if (!nextSpec.startsWith(".")) nextSpec = "./" + nextSpec;
      changed = true;
      rewrites += 1;
      reports.push(`${relative(appdir, file)}: ${spec} -> ${nextSpec}`);
      return `${lead}${quote}${nextSpec}${quote}`;
    }
    // alias specifier: resolve through the app's own path table
    const alias = aliases.find((entry) => spec.startsWith(entry.matchPrefix));
    if (!alias) return whole;
    const rest = spec.slice(alias.prefix.indexOf("*"));
    let resolved = null;
    let base = null;
    for (const target of alias.targets) {
      const candidate = preResolve(resolve(target.base, rest));
      if (candidate) {
        resolved = candidate;
        base = target.base;
        break;
      }
    }
    if (!resolved) return whole;
    // what the alias answers today, post-move
    const current = (() => {
      for (const target of alias.targets) {
        const live = liveProbe(resolve(target.base, rest));
        if (live) return live;
      }
      return null;
    })();
    if (resolved === current) return whole;
    let nextRest = relative(base, resolved).split("\\").join("/");
    if (rest.endsWith(".js") && /\.(ts|tsx)$/.test(nextRest)) nextRest = nextRest.replace(/\.(ts|tsx)$/, ".js");
    const stripped = stripExtension(rest, nextRest, importerDir);
    if (stripped !== null) nextRest = stripped;
    const nextSpec = alias.prefix.slice(0, alias.prefix.indexOf("*")) + nextRest;
    changed = true;
    rewrites += 1;
    reports.push(`${relative(appdir, file)}: ${spec} -> ${nextSpec}`);
    return `${lead}${quote}${nextSpec}${quote}`;
  });
  if (changed && !dry) writeFileSync(file, next);
}
console.log(`import rewrites: ${rewrites}`);
for (const report of reports.slice(0, 25)) console.log("  " + report);
if (reports.length > 25) console.log(`  ... and ${reports.length - 25} more`);
console.log(dry ? "DRY_RUN_DONE" : "CENTRALIZE_DONE");
