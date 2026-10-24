#!/usr/bin/env node
// pinnpm.cjs — the last mile of the pinned dependencies closure: the six
// family container files install the package manager through a runtime
// node -p read of the manifest (dynamic to the scanner, and outright broken
// for cobaia whose manifest carries no packageManager at all), so the
// install answers the exact pnpm rung every family manifest pins.
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const apps = ["cobaia", "forge", "foundry", "getry", "stealthhead", "vault"];
const dynamic = 'npm install -g --no-fund --no-audit "$(node -p \'require("./package.json").packageManager\')"';
const pinned = "npm install -g --no-fund --no-audit pnpm@12.3.4";

for (const app of apps) {
  const file = path.join(root, app, "Dockerfile");
  const text = fs.readFileSync(file, "utf8");
  if (!text.includes(dynamic)) {
    console.log(`${app}/Dockerfile: dynamic install not found (already pinned?)`);
    continue;
  }
  fs.writeFileSync(file, text.replace(dynamic, pinned), "utf8");
  console.log(`${app}/Dockerfile: package manager install pinned to pnpm@12.3.4`);
}
console.log("dockerfile npm pin complete");
