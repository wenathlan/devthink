#!/usr/bin/env node
// bump140.cjs — the 2.0.140 rung stamp (the owner rule answers every error
// with the next version): every package.json carrying 2.0.139 moves up.
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const from = "2.0.139";
const to = "2.0.140";

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
  if (pkg.version !== from) continue;
  pkg.version = to;
  const eol = raw.endsWith("\r\n") ? "\r\n" : "\n";
  fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + (raw.endsWith("\n") ? eol : ""), "utf8");
  bumped += 1;
  console.log(`bump ${path.relative(root, file)} -> ${to}`);
}
console.log(`${bumped} manifests stamped ${to}`);
if (!bumped) process.exit(1);
