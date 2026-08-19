/** Read-only auth schema auditor: inventories structures without exposing archived credential values. */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(process.argv[2] || "docs");
const output = resolve(process.argv[3] || "../shyz-audit/iteration3/auth-schema-summary.json");
const files = [];

function visit(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const info = statSync(path);
    if (info.isDirectory()) visit(path);
    else if (/auth.*\.json$/i.test(name) || /eauth.*\.json$/i.test(name)) files.push(path);
  }
}

function kind(path) {
  const normalized = path.toLowerCase();
  if (/cookie|fingerprint|browser|captcha|device/.test(normalized)) return "browser-session-material";
  if (/oauth|token|apikey|api-key|bearer|credential/.test(normalized)) return "credential-material";
  return "unknown";
}

function fields(value, prefix = "", output = new Set()) {
  if (Array.isArray(value)) {
    output.add(`${prefix || "root"}[]`);
    if (value[0] !== undefined) fields(value[0], `${prefix}[]`, output);
    return output;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      const path = prefix ? `${prefix}.${key}` : key;
      output.add(path);
      fields(item, path, output);
    }
  }
  return output;
}

visit(root);
const records = files.map((path) => {
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    const paths = [...fields(parsed)].sort();
    const classification = paths.some((field) => /cookie|fingerprint|browser|captcha|device/i.test(field)) ? "browser-session-material" : paths.some((field) => /token|key|oauth|bearer|credential/i.test(field)) ? "credential-material" : kind(path);
    return { path: relative(root, path), classification, fieldPaths: paths, valueStatus: "redacted" };
  } catch (error) {
    return { path: relative(root, path), classification: "invalid-json", fieldPaths: [], valueStatus: "unreadable" };
  }
});
mkdirSync(resolve(output, ".."), { recursive: true });
writeFileSync(output, `${JSON.stringify({ root, fileCount: records.length, records }, null, 2)}\n`);
console.log(JSON.stringify({ fileCount: records.length, output }));
