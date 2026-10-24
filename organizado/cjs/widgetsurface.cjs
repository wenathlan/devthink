#!/usr/bin/env node
// widgetsurface.cjs — the universal widget surface wave (the owner law: the
// components live in the widgets folder and every page imports them from ONE
// place, so the dotted file name is written a single time — inside the
// surface module — never again across the pages). per app this writes
// Sol/widgets/index.ts (export * for the named widgets, a canonical default
// alias for the default widgets) and rewrites every widget import in the app
// sources onto the surface.
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const apps = ["devthink", "saddle", "cadria", "debonair", "vault", "forge", "foundry", "argan", "getry", "stealthhead", "cobaia"];

function camelize(dotted) {
  return dotted
    .split(".")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function walkSources(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "dist" || entry.name === "distpackage" || entry.name === "build") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkSources(full, out);
    else if (/\.(tsx?|ts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

for (const app of apps) {
  const widgetDir = path.join(root, app, "Sol", "widgets");
  if (!fs.existsSync(widgetDir)) continue;
  const widgetFiles = fs.readdirSync(widgetDir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));
  if (widgetFiles.includes("index.ts")) {
    console.log(`${app}: surface already present, skipped`);
    continue;
  }

  // classify widgets and build the canonical alias table for defaults
  const aliases = new Map(); // file stem (area.name) -> canonical alias
  const namedOnly = [];
  const withDefault = [];
  for (const file of widgetFiles) {
    const stem = file.replace(/\.tsx?$/, "");
    const text = fs.readFileSync(path.join(widgetDir, file), "utf8");
    const hasDefault = /(^|\n)export default\b/.test(text);
    if (!hasDefault) {
      namedOnly.push(stem);
      continue;
    }
    const dm = text.match(/export default (?:async )?(?:function|class)\s+([A-Za-z0-9_]+)/);
    let alias = dm ? dm[1] : camelize(stem);
    if (aliases.size && [...aliases.values()].includes(alias)) alias = `${camelize(stem)}`;
    aliases.set(stem, alias);
    withDefault.push(stem);
  }
  // unique aliases (append the area when two widgets answer the same name)
  const seen = new Map();
  for (const [stem, alias] of aliases) {
    if (seen.has(alias)) {
      const fixed = camelize(stem);
      aliases.set(stem, fixed);
      seen.set(fixed, stem);
    } else {
      seen.set(alias, stem);
    }
  }

  // the surface module: the dotted name is written exactly once per widget
  const lines = [
    "/**",
    ` * index.ts — the universal widget surface of ${app}: every widget of the`,
    " * Sol/widgets folder answers from this one module, so the pages import",
    " * their components from a single place and the dotted widget file name",
    " * lives exactly once (here) instead of repeating across every page —",
    " * the components stay complete independent files beside this surface.",
    " */",
  ];
  for (const stem of [...withDefault, ...namedOnly].sort()) {
    if (aliases.has(stem)) {
      lines.push(`export { default as ${aliases.get(stem)} } from "./${stem}.tsx";`);
      const text = fs.readFileSync(path.join(widgetDir, `${stem}.tsx`), "utf8");
      if (/^export (?:async )?(?:function|const|class|type|interface|enum)\s+[A-Za-z0-9_]+/m.test(text) || /^export \{/m.test(text)) {
        lines.push(`export * from "./${stem}.tsx";`);
      }
    } else {
      lines.push(`export * from "./${stem}.tsx";`);
    }
  }
  const eol = "\n";
  fs.writeFileSync(path.join(widgetDir, "index.ts"), lines.join(eol) + eol, "utf8");

  // rewrite every widget import onto the surface
  const sources = walkSources(path.join(root, app), []);
  let rewrites = 0;
  const manual = [];
  const surfaceAbs = path.join(widgetDir, "index.ts");
  for (const file of sources) {
    if (file === surfaceAbs) continue;
    let text = fs.readFileSync(file, "utf8");
    const before = text;
    // dynamic imports report for manual follow-up (lazy widgets need the alias form)
    for (const m of text.matchAll(/import\((['"])([^'"]*\/widgets\/[a-z0-9.-]+)\.tsx?\1\)/g)) {
      manual.push(`${path.relative(root, file)}: dynamic ${m[2]}`);
    }
    // import Local from ".../widgets/stem(.tsx)"
    text = text.replace(
      /import\s+([A-Za-z0-9_$]+)\s*,?\s*(\{[^}]*\})?\s*from\s+(["'])([^"']*\/widgets\/)([a-z0-9.-]+)\.tsx?\3/g,
      (whole, local, named, quote, prefix, stem) => {
        const alias = aliases.get(stem);
        if (!alias) return whole; // named-only widgets never take this shape
        const namedPart = named ? `, ${named.slice(1, -1).trim()}` : "";
        return `import { ${alias} as ${local}${namedPart} } from ${quote}${prefix.slice(0, -"widgets/".length)}widgets${quote}`;
      }
    );
    // import { X } from ".../widgets/stem(.tsx)" and the plain side-effectless forms
    text = text.replace(
      /(\bfrom\s+)(["'])([^"']*\/widgets\/)([a-z0-9.-]+)\.tsx?\2/g,
      (whole, fromKw, quote, prefix) => `${fromKw}${quote}${prefix.slice(0, -"widgets/".length)}widgets${quote}`
    );
    if (text !== before) {
      fs.writeFileSync(file, text, "utf8");
      rewrites += 1;
    }
  }
  console.log(
    `${app}: surface over ${widgetFiles.length} widgets (${withDefault.length} default aliases), ${rewrites} files rewired${
      manual.length ? `, ${manual.length} dynamic imports left for manual pass` : ""
    }`
  );
  for (const m of manual.slice(0, 8)) console.log(`  manual: ${m}`);
}
console.log("widget surface wave complete");
