#!/usr/bin/env node
// pincanonical.cjs — the canonical bodies the maintenance sync renders (the
// familylanes lane templates) carry the same immutable pins the live
// workflow files now carry, so a future sync regenerates the pinned forms
// instead of undoing the security closure. the map rides the live files:
// every `repo@sha # tag` line answers for its `repo@tag` occurrence.
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const wfDir = path.join(root, ".github", "workflows");

const pinOf = new Map();
for (const file of fs.readdirSync(wfDir).filter((f) => f.endsWith(".yml"))) {
  const text = fs.readFileSync(path.join(wfDir, file), "utf8");
  for (const m of text.matchAll(/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)@([0-9a-f]{40}) # (v?[A-Za-z0-9_.-]+)/g)) {
    pinOf.set(`${m[1]}@${m[3]}`, m[2]);
  }
}
console.log(`live pin map: ${pinOf.size} refs`);

const targets = [
  path.join(root, "devthink", "tests", "familylanes.mjs"),
  path.join(root, "devthink", "tests", "maintain.mjs"),
];

for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  let text = fs.readFileSync(target, "utf8");
  let swaps = 0;
  const missing = new Set();
  for (const [ref, sha] of pinOf) {
    const moving = new RegExp(`${ref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![0-9A-Za-z_.-])`, "g");
    text = text.replace(moving, () => {
      swaps += 1;
      return `${ref.slice(0, ref.indexOf("@"))}@${sha} # ${ref.slice(ref.indexOf("@") + 1)}`;
    });
  }
  // leftover moving refs the live battery no longer answers for
  for (const m of text.matchAll(/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)@(v?[0-9][A-Za-z0-9_.-]*)/g)) {
    if (!pinOf.has(`${m[1]}@${m[2]}`)) missing.add(`${m[1]}@${m[2]}`);
  }
  fs.writeFileSync(target, text, "utf8");
  console.log(`${path.relative(root, target)}: ${swaps} refs pinned in the canonical body`);
  if (missing.size) {
    console.log(`  refs with no live pin (left untouched): ${[...missing].join(", ")}`);
  }
}
console.log("canonical pin wave complete");
