// fix-workflows.mjs — wave 1: heal the 9 broken push triggers the family
// workflows carry (`branches: ain]` — the corrupted remnant of the
// `[main]` list a bad rewrite left behind) and validate every workflow
// file still parses as yaml after the heal.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { parse } from "/home/z/my-project/devthink/node_modules/yaml/dist/index.js";

const wfdir = "/home/z/my-project/.github/workflows";
let fixed = 0;
for (const name of readdirSync(wfdir)) {
  if (!name.endsWith(".yml") && !name.endsWith(".yaml")) continue;
  const path = `${wfdir}/${name}`;
  const before = readFileSync(path, "utf8");
  const after = before.replace(/branches: ain\]/g, "branches: [main]");
  if (after !== before) {
    writeFileSync(path, after);
    const count = (before.match(/branches: ain\]/g) || []).length;
    console.log(`FIXED ${name}: ${count} trigger(s) healed`);
    fixed += count;
  }
}
let failures = 0;
for (const name of readdirSync(wfdir)) {
  if (!name.endsWith(".yml") && !name.endsWith(".yaml")) continue;
  const path = `${wfdir}/${name}`;
  try {
    parse(readFileSync(path, "utf8"));
  } catch (error) {
    failures += 1;
    console.log(`YAML FAIL ${name}: ${error.message}`);
  }
}
console.log(`healed triggers: ${fixed}, yaml failures: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
