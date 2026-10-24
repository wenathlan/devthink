#!/usr/bin/env node
// bump136.cjs — the 2.0.136 rung stamp: every package.json that carries the
// 2.0.135 version moves one rung up (the owner rule: every error bumps the
// family to the next version). the envelopes ride sync:metadata afterwards.
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const from = "2.0.135";
const to = "2.0.136";

function walk(dir, found) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "dist" || entry.name === "distpackage") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, found);
    else if (entry.name === "package.json") found.push(full);
  }
}

const files = [];
walk(root, files);
let bumped = 0;
for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const pkg = JSON.parse(raw);
  if (pkg.version !== from) {
    console.log(`skip ${path.relative(root, file)} (version ${pkg.version || "none"})`);
    continue;
  }
  pkg.version = to;
  // preserve the trailing newline shape of each manifest
  const eol = raw.endsWith("\r\n") ? "\r\n" : "\n";
  const body = JSON.stringify(pkg, null, 2) + (raw.endsWith("\n") ? eol : "");
  fs.writeFileSync(file, body, "utf8");
  bumped += 1;
  console.log(`bump ${path.relative(root, file)} -> ${to}`);
}
console.log(`${bumped} manifests stamped ${to}`);
if (!bumped) process.exit(1);
