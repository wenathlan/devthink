/** Read-only YAML workflow auditor: extracts execution metadata without running archived workflows. */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(process.argv[2] || "docs");
const output = resolve(process.argv[3] || "../shyz-audit/iteration4/yaml-summary.json");
const files = [];

function visit(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const info = statSync(path);
    if (info.isDirectory()) visit(path);
    else if (/\.ya?ml$/i.test(name)) files.push(path);
  }
}

function matches(source, expression) {
  const global = expression.global ? expression : new RegExp(expression.source, `${expression.flags}g`);
  return [...source.matchAll(global)].map((match) => match[1]).filter(Boolean);
}

visit(root);
const records = files.sort().map((path) => {
  const source = readFileSync(path, "utf8");
  return {
    path: relative(root, path),
    lines: source.split("\n").length,
    workflowName: matches(source, /^name:\s*["']?([^"'\n#]+)/m)[0] || undefined,
    actions: [...new Set(matches(source, /^\s*uses:\s*([^\s#]+)/gm))],
    triggers: [...new Set(matches(source, /^\s{0,2}(push|pull_request|workflow_dispatch|schedule|release|workflow_call):/gm))],
    permissions: [...new Set(matches(source, /^\s{0,2}([a-z-]+):\s*(?:write|read)\s*$/gm))],
    referencesPages: /github\.io|deploy-pages|pages/i.test(source),
    referencesSecrets: /\$\{\{\s*secrets\./.test(source),
    valueStatus: "secrets-redacted",
  };
});
mkdirSync(resolve(output, ".."), { recursive: true });
writeFileSync(output, `${JSON.stringify({ root, fileCount: records.length, records }, null, 2)}\n`);
console.log(JSON.stringify({ fileCount: records.length, output }));
