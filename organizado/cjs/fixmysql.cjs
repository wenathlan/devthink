#!/usr/bin/env node
// fixmysql.cjs — the mobile icon lanes of argan forge getry and foundry
// install with npm, and npm refuses a package.json override that lags the
// direct dependency (EOVERRIDE): the family wave moved the direct mysql2 to
// ^3.24.6 while the four apps kept the ^3.23.1 override in both the manifest
// and the pnpm workspace. this aligns both override sites with the direct
// dependency, exactly the elevation saddle already carries.
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const apps = ["argan", "forge", "getry", "foundry"];

for (const app of apps) {
  const pkgPath = path.join(root, app, "package.json");
  const raw = fs.readFileSync(pkgPath, "utf8");
  const pkg = JSON.parse(raw);
  if (pkg.overrides && pkg.overrides.mysql2 && pkg.overrides.mysql2 !== "^3.24.6") {
    const from = pkg.overrides.mysql2;
    pkg.overrides.mysql2 = "^3.24.6";
    const eol = raw.endsWith("\r\n") ? "\r\n" : "\n";
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + (raw.endsWith("\n") ? eol : ""), "utf8");
    console.log(`${app}/package.json: overrides.mysql2 ${from} -> ^3.24.6`);
  } else {
    console.log(`${app}/package.json: already aligned`);
  }
  const wsPath = path.join(root, app, "pnpm-workspace.yaml");
  if (fs.existsSync(wsPath)) {
    const text = fs.readFileSync(wsPath, "utf8");
    const next = text.replace(/^(\s*mysql2:\s*)\^3\.23\.1\s*$/m, "$1^3.24.6");
    if (next !== text) {
      fs.writeFileSync(wsPath, next, "utf8");
      console.log(`${app}/pnpm-workspace.yaml: mysql2 ^3.23.1 -> ^3.24.6`);
    } else {
      console.log(`${app}/pnpm-workspace.yaml: nothing to align`);
    }
  }
}
console.log("mysql override alignment complete");
