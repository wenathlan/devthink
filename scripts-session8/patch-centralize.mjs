// patch-centralize.mjs — applies the three fixes to centralize.mjs
import { readFileSync, writeFileSync } from "node:fs";
const path = "/home/z/my-project/scripts-session8/centralize.mjs";
let text = readFileSync(path, "utf8");
const before = text;

// 1. the alias entry learns its literal match prefix (the pattern prefix
//    "@/*" never literally prefixes a specifier — "@/" does)
text = text.replace(
  "    aliases.push({\n      prefix,\n",
  "    aliases.push({\n      prefix,\n      matchPrefix: prefix.slice(0, prefix.indexOf(\"*\")),\n",
);
// 2. the find predicate uses the literal match prefix
text = text.replace(
  "aliases.find((entry) => spec.startsWith(entry.prefix))",
  "aliases.find((entry) => spec.startsWith(entry.matchPrefix))",
);
// 3. the .js suffix preservation replaces the whole suffix (no double dot)
text = text.split('nextSpec = nextSpec.slice(0, -3) + ".js";').join('nextSpec = nextSpec.replace(/\\.(ts|tsx)$/, ".js");');
text = text.split('nextRest = nextRest.slice(0, -3) + ".js";').join('nextRest = nextRest.replace(/\\.(ts|tsx)$/, ".js");');

if (text === before) {
  console.error("NO CHANGE — patterns not found");
  process.exit(1);
}
writeFileSync(path, text);
console.log("patched:", before.length, "->", text.length);
