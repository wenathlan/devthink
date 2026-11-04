/** Schemaaudit — the one keyed seat of the read-only schema auditors: the
 * two shyz-audit iterations (the auth schema inventory of iteration3 and
 * the yaml workflow inventory of iteration4) answer one skeleton — the
 * mode word on argv[2] selects the arm (auth or yaml), the root rides
 * argv[3] (default docs) and the output rides argv[4] (the iteration
 * default of the selected arm). Read-only by law: inventories structures
 * and extracts execution metadata without exposing archived credential
 * values or running archived workflows. */

import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const mode = process.argv[2] ?? "";
const root = resolve(process.argv[3] || "docs");
const output = resolve(
  process.argv[4] ||
    (mode === "yaml"
      ? "../shyz-audit/iteration4/yaml-summary.json"
      : "../shyz-audit/iteration3/auth-schema-summary.json"),
);

const files: string[] = [];

function visit(directory: string) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const info = statSync(path);
    if (info.isDirectory()) visit(path);
    else if (mode === "yaml" ? /\.ya?ml$/i.test(name) : /auth.*\.json$/i.test(name) || /eauth.*\.json$/i.test(name)) {
      files.push(path);
    }
  }
}

if (mode !== "auth" && mode !== "yaml") {
  console.error("usage: node schemaaudit.ts <auth|yaml> [root] [output]");
  process.exit(1);
}

visit(root);

/* ===== block: authschemaaudit ===== */
/** Read-only auth schema auditor: inventories structures without exposing archived credential values. */

function kind(path: string) {
  const normalized = path.toLowerCase();
  if (/cookie|fingerprint|browser|captcha|device/.test(normalized)) return "browser-session-material";
  if (/oauth|token|apikey|api-key|bearer|credential/.test(normalized)) return "credential-material";
  return "unknown";
}

function fields(value: unknown, prefix = "", output: Set<string> = new Set()) {
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

const authRecords = files.map((path) => {
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    const paths = [...fields(parsed)].sort();
    const classification = paths.some((field) => /cookie|fingerprint|browser|captcha|device/i.test(field))
      ? "browser-session-material"
      : paths.some((field) => /token|key|oauth|bearer|credential/i.test(field))
        ? "credential-material"
        : kind(path);
    return { path: relative(root, path), classification, fieldPaths: paths, valueStatus: "redacted" };
  } catch (error) {
    return { path: relative(root, path), classification: "invalid-json", fieldPaths: [], valueStatus: "unreadable" };
  }
});

/* ===== block: yamlaudit ===== */
/** Read-only YAML workflow auditor: extracts execution metadata without running archived workflows. */

function matches(source: string, expression: RegExp) {
  const global = expression.global ? expression : new RegExp(expression.source, `${expression.flags}g`);
  return [...source.matchAll(global)].map((match) => match[1]).filter(Boolean);
}

const yamlRecords = files.sort().map((path) => {
  const source = readFileSync(path, "utf8");
  return {
    path: relative(root, path),
    lines: source.split("\n").length,
    workflowName: matches(source, /^name:\s*["']?([^"'\n#]+)/m)[0] || undefined,
    actions: [...new Set(matches(source, /^\s*uses:\s*([^\s#]+)/gm))],
    triggers: [
      ...new Set(matches(source, /^\s{0,2}(push|pull_request|workflow_dispatch|schedule|release|workflow_call):/gm)),
    ],
    permissions: [...new Set(matches(source, /^\s{0,2}([a-z-]+):\s*(?:write|read)\s*$/gm))],
    referencesPages: /github\.io|deploy-pages|pages/i.test(source),
    referencesSecrets: /\$\{\{\s*secrets\./.test(source),
    valueStatus: "secrets-redacted",
  };
});

const records = mode === "yaml" ? yamlRecords : authRecords;
mkdirSync(resolve(output, ".."), { recursive: true });
writeFileSync(output, `${JSON.stringify({ root, fileCount: records.length, records }, null, 2)}\n`);
console.log(JSON.stringify({ fileCount: records.length, output }));
