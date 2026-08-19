/**
 * DevThink documentation audit.
 * Reads every file under docs without executing archived code or credentials.
 */
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

const root = resolve(process.argv[2] ?? process.cwd());
const docsroot = resolve(root, "docs");
const outputroot = resolve(root, "..", "shyz-audit", "iteration2");
const binaryextensions = new Set([".bmp", ".gif", ".ico", ".jpeg", ".jpg", ".pdf", ".png", ".rar", ".webp", ".zip"]);
const decoder = new TextDecoder("utf-8", { fatal: true });
const termrules = {
  captcha: /captcha/gi,
  cookies: /cookies?/gi,
  credential: /credentials?|api[ _-]?key|token|auth(?:entication)?/gi,
  gateway: /gateway/gi,
  stream: /stream(?:ing)?|sse/gi,
  session: /sessions?/gi,
  provider: /providers?/gi,
  storage: /drizzle|prisma|sqlite|mysql|database|storage/gi,
};

/** Recursively lists regular files in stable lexical order. */
async function listfiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const results = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const filepath = resolve(directory, entry.name);
    if (entry.isDirectory()) results.push(...await listfiles(filepath));
    if (entry.isFile()) results.push(filepath);
  }
  return results;
}

/** Identifies text safely without relying on file extensions alone. */
function readtext(bytes, filepath) {
  const extension = filepath.slice(filepath.lastIndexOf(".")).toLowerCase();
  if (binaryextensions.has(extension) || bytes.includes(0)) return null;
  try {
    return decoder.decode(bytes);
  } catch {
    return null;
  }
}

/** Counts audit terms without retaining credential values. */
function countterms(text) {
  return Object.fromEntries(Object.entries(termrules).map(([name, rule]) => [name, [...text.matchAll(rule)].length]));
}

/** Extracts documented HTTP origins and paths from read-only content. */
function endpoints(text) {
  const matches = [...text.matchAll(/https?:\/\/[^\s"'`<>)}\]]+/g)].map(([url]) => url.replace(/[.,;:]+$/, ""));
  return [...new Set(matches)].sort();
}

const files = await listfiles(docsroot);
const records = [];
const endpointmap = new Map();
const extensioncounts = new Map();
const directorycounts = new Map();
let textfiles = 0;
let binaryfiles = 0;
let textlines = 0;

for (const filepath of files) {
  const bytes = await readFile(filepath);
  const content = readtext(bytes, filepath);
  const path = relative(root, filepath).split(sep).join("/");
  const extension = filepath.includes(".") ? filepath.slice(filepath.lastIndexOf(".")).toLowerCase() : "[none]";
  const directory = relative(docsroot, resolve(filepath, "..")).split(sep).join("/") || ".";
  const record = {
    path,
    extension,
    bytes: bytes.byteLength,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    kind: content === null ? "binary" : "text",
  };

  extensioncounts.set(extension, (extensioncounts.get(extension) ?? 0) + 1);
  directorycounts.set(directory, (directorycounts.get(directory) ?? 0) + 1);

  if (content === null) {
    binaryfiles += 1;
  } else {
    const lines = content.length === 0 ? 0 : content.split(/\r?\n/).length;
    const foundendpoints = endpoints(content);
    textfiles += 1;
    textlines += lines;
    record.lines = lines;
    record.terms = countterms(content);
    record.endpoints = foundendpoints;
    for (const endpoint of foundendpoints) {
      endpointmap.set(endpoint, [...(endpointmap.get(endpoint) ?? []), path]);
    }
  }
  records.push(record);
}

const summary = {
  root,
  scannedAt: new Date().toISOString(),
  totals: { files: files.length, textfiles, binaryfiles, textlines },
  extensions: Object.fromEntries([...extensioncounts.entries()].sort()),
  directories: Object.fromEntries([...directorycounts.entries()].sort()),
  endpoints: Object.fromEntries([...endpointmap.entries()].sort()),
};

await rm(outputroot, { recursive: true, force: true });
await mkdir(outputroot, { recursive: true });
await writeFile(resolve(outputroot, "inventory.json"), JSON.stringify(records, null, 2));
await writeFile(resolve(outputroot, "summary.json"), JSON.stringify(summary, null, 2));
await writeFile(resolve(outputroot, "summary.md"), [
  "# DevThink documentation audit",
  "",
  `- Files read: ${summary.totals.files}`,
  `- UTF-8 text files: ${summary.totals.textfiles}`,
  `- Binary files read for metadata and hash: ${summary.totals.binaryfiles}`,
  `- Text lines read: ${summary.totals.textlines}`,
  `- Documented HTTP references: ${endpointmap.size}`,
].join("\n"));

console.log(JSON.stringify(summary.totals));
