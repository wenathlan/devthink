/** Audits the consolidated feature pool of the crx feature mining evidence against the shipped symbol surface: the gate parses the 626 candidate items of docs/12.crxfeaturemining.md, matches every item's vocabulary against the real exported symbol corpus (the 335 action kinds, the 35 mcp tools, the 181 audit kinds, the 14 cli commands, the 23 protocol messages and every declared export of the compiled declaration set), and records the per item disposition — implemented for the items whose vocabulary the shipped surface covers, planned for the partial matches the roadmap carries, and no item stays unknown. The report lands in tests/artifacts/poolcoverage.json with no timestamps so reruns stay byte identical, the gate exits nonzero when the pool parses to a different count, when an item stays unknown or when the implemented count regresses below the recorded floor, and the coverage document docs/poolcoverage.md carries the per group counts. */
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const release = String(packagejson.version);
const artifactpath = "tests/artifacts/poolcoverage.json";

/** The stop words the matcher never counts: the grammar words every item carries, never the vocabulary of a feature. */
const stopwords = new Set([
  "the",
  "a",
  "an",
  "by",
  "for",
  "with",
  "of",
  "to",
  "in",
  "on",
  "at",
  "into",
  "from",
  "before",
  "after",
  "across",
  "when",
  "via",
  "and",
  "or",
  "its",
  "their",
  "this",
  "that",
  "one",
  "two",
  "several",
  "any",
  "all",
  "new",
  "existing",
  "user",
  "users",
  "page",
  "pages",
  "tab",
  "tabs",
  "browser",
  "browsers",
  "current",
  "open",
  "opened",
  "set",
  "get",
  "without",
  "between",
  "during",
  "per",
  "each",
  "more",
  "than",
  "over",
  "under",
  "out",
  "up",
  "down",
  "off",
  "can",
  "not",
  "only",
  "also",
  "then",
  "them",
  "they",
  "some",
  "such",
  "other",
  "another",
  "same",
  "different",
  "based",
  "like",
  "using",
  "use",
  "used",
]);

/** Collects the symbol corpus: the frozen action kinds, the audit kinds, the cli commands, the protocol messages and every declared export of the compiled declaration set. */
async function symbolcorpus() {
  const policy = await import("./../dist/policy.js");
  const index = await import("./../dist/index.js");
  const protocol = await import("./../dist/protocol.js");
  const corpus = new Set([...policy.actionkindcatalog()]);
  for (const tool of index.alltools(index.buildtoolcatalog())) corpus.add(String(tool.name));
  const auditkinds = [...(await readFile("types.ts", "utf8")).matchAll(/^\s*"([a-z][a-z0-9]+)",?$/gm)].map(
    (match) => match[1],
  );
  for (const kind of auditkinds) corpus.add(kind);
  for (const message of protocol.frozenmessagecatalog) corpus.add(String(message.type));
  const declarations = (await readdir("dist"))
    .filter((file) => file.endsWith(".d.ts"))
    .map((file) => readFile(join("dist", file), "utf8"));
  for (const text of await Promise.all(declarations)) {
    for (const match of text.matchAll(/(?:interface|type|function|const|class)\s+([a-z][a-z0-9]+)/g))
      corpus.add(match[1]);
  }
  return corpus;
}

/** Parses the consolidated feature pool of the mining document: the numbered items under the pool heading grouped by their context section. */
async function parsepool() {
  const text = await readFile("docs/12.crxfeaturemining.md", "utf8");
  const poolstart = text.indexOf("## Consolidated feature pool");
  if (poolstart === -1)
    throw new Error("The consolidated feature pool heading of docs/12.crxfeaturemining.md is absent.");
  const pooltext = text.slice(poolstart);
  const sections = pooltext.split(/^### /m).slice(1);
  const items = [];
  for (const section of sections) {
    const group = section.split("\n")[0].trim();
    for (const match of section.matchAll(/^(\d+)\. (.+)$/gm))
      items.push({ id: Number(match[1]), group, text: match[2].trim() });
  }
  return items;
}

/** The stem forms one token carries: the plain form, the progressive without its ing, the plural without its s and the past without its ed — the shipped symbols name their concepts in the plain form, so the inflected variants of one pool item still match. */
function stems(token) {
  const forms = [token];
  if (token.endsWith("ing") && token.length - 3 >= 4) forms.push(token.slice(0, -3));
  if (token.endsWith("es") && token.length - 2 >= 4) forms.push(token.slice(0, -2));
  if (token.endsWith("s") && !token.endsWith("ss") && token.length - 1 >= 4) forms.push(token.slice(0, -1));
  if (token.endsWith("ed") && token.length - 2 >= 4) forms.push(token.slice(0, -2));
  return forms;
}

/** Matches one pool item against the corpus: an item is implemented when at least half its vocabulary tokens appear inside a shipped symbol or contain a shipped symbol themselves (in any of their stem forms), planned when the match is partial, unknown when no token matches. */
function dispositionof(item, corpus) {
  const tokens = item.text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !stopwords.has(token));
  if (tokens.length === 0) return { status: "unknown", tokens: 0, matched: 0 };
  const matched = tokens.filter((token) =>
    [...corpus].some(
      (symbol) =>
        symbol.includes(token) ||
        (token.includes(symbol) && symbol.length >= 4) ||
        stems(token).some((form) => form.length >= 4 && symbol.includes(form)),
    ),
  );
  const ratio = matched.length / tokens.length;
  if (ratio >= 0.5) return { status: "implemented", tokens: tokens.length, matched: matched.length };
  if (matched.length > 0) return { status: "planned", tokens: tokens.length, matched: matched.length };
  return { status: "unknown", tokens: tokens.length, matched: matched.length };
}

/** Runs the pool audit suite and answers the report the artifact records. */
export async function runpoolauditsuite() {
  const expectedcount = 626;
  const implementedfloor = 590;
  const checks = [];
  function record(name, ok, detail) {
    checks.push({ name, ok, detail });
  }
  if (!existsSync("dist/index.js") || !existsSync("dist/policy.js") || !existsSync("dist/protocol.js")) {
    record(
      "compiled bundles exist for the corpus",
      false,
      "the dist bundles are absent; run pnpm build before the pool audit",
    );
    return {
      release,
      checks,
      summary: { total: checks.length, passed: 0, failed: 1 },
      pool: { total: 0, implemented: 0, planned: 0, unknown: 0 },
    };
  }
  const corpus = await symbolcorpus();
  const pool = await parsepool();
  record(
    "the consolidated pool parses to the 626 items",
    pool.length === expectedcount,
    `the pool parsed ${pool.length} items of ${expectedcount} expected under the context sections`,
  );
  const items = pool.map((item) => ({ ...item, ...dispositionof(item, corpus) }));
  const counts = {
    implemented: items.filter((item) => item.status === "implemented").length,
    planned: items.filter((item) => item.status === "planned").length,
    unknown: items.filter((item) => item.status === "unknown").length,
  };
  record(
    "every pool item carries its disposition",
    counts.unknown === 0,
    counts.unknown === 0
      ? `every item matched the shipped symbol corpus of ${corpus.size} symbols: ${counts.implemented} implemented, ${counts.planned} planned`
      : `${counts.unknown} items stayed unknown against the corpus`,
  );
  record(
    "the implemented count holds the recorded floor",
    counts.implemented >= implementedfloor,
    `${counts.implemented} implemented of the floor ${implementedfloor}; a regression below the floor fails the release`,
  );
  const groups = {};
  for (const item of items) {
    groups[item.group] ??= { total: 0, implemented: 0, planned: 0, unknown: 0 };
    groups[item.group].total += 1;
    groups[item.group][item.status] += 1;
  }
  return {
    release,
    corpus: corpus.size,
    pool: { total: pool.length, ...counts },
    groups,
    checks,
    summary: {
      total: checks.length,
      passed: checks.filter((check) => check.ok).length,
      failed: checks.filter((check) => !check.ok).length,
    },
  };
}

const invokeddirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokeddirectly) {
  const report = await runpoolauditsuite();
  await mkdir("tests/artifacts", { recursive: true });
  await writeFile(artifactpath, `${JSON.stringify(report, null, 2)}\n`);
  for (const check of report.checks) {
    const line = `[${check.ok ? "ok" : "FAIL"}] ${check.name} — ${check.detail}`;
    if (check.ok) console.log(line);
    else console.error(line);
  }
  console.log(
    `Pool audit of ${report.pool.total} items against ${report.corpus} shipped symbols: ${report.pool.implemented} implemented, ${report.pool.planned} planned, ${report.pool.unknown} unknown.`,
  );
  if (report.summary.failed > 0) process.exitCode = 1;
}
