/** Audits the consolidated feature pool of the crx feature mining evidence against the shipped symbol surface: the gate parses the 626 candidate items of the featurepool corpus that lives inside tests/crxharvest.ts (the harvest generator embedded the consolidated pool when it wrote the removed docs/12.crxfeaturemining.md report, so the generator source carries the corpus now), matches every item's vocabulary against the real exported symbol corpus (the 335 action kinds, the 35 mcp tools, the audit kinds, the cli commands, the 23 protocol messages and every declared export of the compiled declaration set), and records the per item disposition — implemented for the items whose vocabulary the shipped surface covers, planned for the partial matches the roadmap carried, and no item stays unknown. The committed record tests/devthink.poolaudit.ts (the poolcoveragerecord const this module carries, migrated from devthink/artifacts/poolcoverage.json when the flat folder law dissolved the artifacts folder) preserves the report with no timestamps so reruns stay byte identical, and the gate exits nonzero when the pool parses to a different count, when an item stays unknown or when the implemented count regresses below the recorded floor. The sync mode (`node ../tests/devthink.poolaudit.ts sync`, or pnpm records:sync over every gate) rewrites the committed record after the release stamps its version. */
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { summaryproblemsof, syncmode, syncrecord } from "./records.ts";

const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const release = String(packagejson.version);

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
  const policy = await import("./dist/policy.js");
  const index = await import("./dist/index.js");
  const protocol = await import("./dist/protocol.js");
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

/** Parses the consolidated feature pool of the harvest generator: the corpus the removed mining report carried survives as the featurepool constant inside crxharvest.ts, so the pool parses from its surviving source with the same normalization dedupe and the same running numbering the report builder applied when it rendered the numbered pool sections. */
async function parsepool() {
  const text = await readFile("crxharvest.ts", "utf8");
  const poolstart = text.indexOf("const featurepool = [");
  if (poolstart === -1)
    throw new Error("The featurepool corpus of crxharvest.ts is absent; the harvest generator carries the consolidated pool.");
  const pooltext = text.slice(poolstart, text.indexOf("\n];", poolstart));
  const items = [];
  const seen = new Set();
  let counter = 0;
  for (const groupmatch of pooltext.matchAll(/group:\s*"([^"]+)",\s*\n\s*items:\s*\[([\s\S]*?)\]/g)) {
    const group = groupmatch[1].charAt(0).toUpperCase() + groupmatch[1].slice(1);
    for (const itemmatch of groupmatch[2].matchAll(/"([^"]+)"/g)) {
      const key = itemmatch[1]
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
      if (seen.has(key)) continue;
      seen.add(key);
      counter += 1;
      items.push({ id: counter, group, text: itemmatch[1].trim() });
    }
  }
  return items;
}

/** The stem forms one token carries: the plain form, the progressive without its ing, the plural without its s and the past without its ed — the shipped symbols name their concepts in the plain form, so the inflected variants of one pool item still match. */
function stems(token: string) {
  const forms = [token];
  if (token.endsWith("ing") && token.length - 3 >= 4) forms.push(token.slice(0, -3));
  if (token.endsWith("es") && token.length - 2 >= 4) forms.push(token.slice(0, -2));
  if (token.endsWith("s") && !token.endsWith("ss") && token.length - 1 >= 4) forms.push(token.slice(0, -1));
  if (token.endsWith("ed") && token.length - 2 >= 4) forms.push(token.slice(0, -2));
  return forms;
}

/** One parsed pool item: the running number, the context group and the item text the harvest generator numbered. */
interface poolitem {
  id: number;
  group: string;
  text: string;
}

/** The disposition of one pool item against the shipped corpus, with its token and match counts. */
interface disposition {
  status: "implemented" | "planned" | "unknown";
  tokens: number;
  matched: number;
}

/** Matches one pool item against the corpus: an item is implemented when at least half its vocabulary tokens appear inside a shipped symbol or contain a shipped symbol themselves (in any of their stem forms), planned when the match is partial, unknown when no token matches. */
function dispositionof(item: poolitem, corpus: Set<string>): disposition {
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
  const checks: Array<{ name: string; ok: boolean; detail: string }> = [];
  function record(name: string, ok: boolean, detail: string) {
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
  const groups: Record<string, groupcounts> = {};
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

/* ── the committed record (the sync pass rewrites this block) ── */

/** The per group disposition counts of the pool audit: the total items of
 * the group beside its implemented, planned and unknown shares. */
export interface groupcounts {
  total: number;
  implemented: number;
  planned: number;
  unknown: number;
}

/** The pool coverage report the committed record carries: the release it
 * stamps, the shipped symbol corpus size, the pool disposition, the per
 * group counts, the recorded checks and the summary the gate exits on. */
export interface poolcoveragereport {
  release: string;
  corpus: number;
  pool: { total: number; implemented: number; planned: number; unknown: number };
  groups: Record<string, groupcounts>;
  checks: Array<{ name: string; ok: boolean; detail: string }>;
  summary: { total: number; passed: number; failed: number };
}

/** The committed pool coverage record of the 2.0.151 release — the evidence
 * the readiness review and the matrix cells read, migrated from
 * devthink/artifacts/poolcoverage.json when the flat folder law dissolved
 * the artifacts folder of the application first layer: the full disposition
 * of the 626 item pool, no timestamps, so the record replays byte
 * identical. */
export const poolcoveragerecord: poolcoveragereport = {
  "release": "2.1.7",
  "corpus": 4473,
  "pool": {
    "total": 626,
    "implemented": 623,
    "planned": 3,
    "unknown": 0
  },
  "groups": {
    "Interaction": {
      "total": 46,
      "implemented": 45,
      "planned": 1,
      "unknown": 0
    },
    "Observation": {
      "total": 46,
      "implemented": 46,
      "planned": 0,
      "unknown": 0
    },
    "Navigation": {
      "total": 38,
      "implemented": 38,
      "planned": 0,
      "unknown": 0
    },
    "Tabs and windows": {
      "total": 46,
      "implemented": 46,
      "planned": 0,
      "unknown": 0
    },
    "Forms and data": {
      "total": 46,
      "implemented": 46,
      "planned": 0,
      "unknown": 0
    },
    "Media capture": {
      "total": 40,
      "implemented": 40,
      "planned": 0,
      "unknown": 0
    },
    "Network and transport": {
      "total": 38,
      "implemented": 38,
      "planned": 0,
      "unknown": 0
    },
    "Debugging": {
      "total": 38,
      "implemented": 38,
      "planned": 0,
      "unknown": 0
    },
    "Memory and sessions": {
      "total": 38,
      "implemented": 37,
      "planned": 1,
      "unknown": 0
    },
    "Workflow and automation": {
      "total": 48,
      "implemented": 48,
      "planned": 0,
      "unknown": 0
    },
    "Agent protocol": {
      "total": 44,
      "implemented": 44,
      "planned": 0,
      "unknown": 0
    },
    "Multi agent coordination": {
      "total": 34,
      "implemented": 34,
      "planned": 0,
      "unknown": 0
    },
    "Ui surfaces": {
      "total": 42,
      "implemented": 42,
      "planned": 0,
      "unknown": 0
    },
    "Security and consent": {
      "total": 44,
      "implemented": 43,
      "planned": 1,
      "unknown": 0
    },
    "Performance": {
      "total": 38,
      "implemented": 38,
      "planned": 0,
      "unknown": 0
    }
  },
  "checks": [
    {
      "name": "the consolidated pool parses to the 626 items",
      "ok": true,
      "detail": "the pool parsed 626 items of 626 expected under the context sections"
    },
    {
      "name": "every pool item carries its disposition",
      "ok": true,
      "detail": "every item matched the shipped symbol corpus of 4473 symbols: 623 implemented, 3 planned"
    },
    {
      "name": "the implemented count holds the recorded floor",
      "ok": true,
      "detail": "623 implemented of the floor 590; a regression below the floor fails the release"
    }
  ],
  "summary": {
    "total": 3,
    "passed": 3,
    "failed": 0
  }
};

const invokeddirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokeddirectly) {
  const report = await runpoolauditsuite();
  for (const check of report.checks) {
    const line = `[${check.ok ? "ok" : "FAIL"}] ${check.name} — ${check.detail}`;
    if (check.ok) console.log(line);
    else console.error(line);
  }
  if (syncmode()) {
    /* the sync rewrites the committed record this run produced, so the release refresh rides one reviewable commit */
    console.log(await syncrecord({ moduleurl: import.meta.url, recordname: "poolcoveragerecord", recordtype: "poolcoveragereport", record: report }));
  } else {
    /* the record verification: the committed evidence stays internally consistent (the summary math, the ok counts and the disposition sums), so a hand-edited record never passes as a recorded run */
    const okchecks = poolcoveragerecord.checks.filter((check) => check.ok).length;
    const groupsums = Object.values(poolcoveragerecord.groups).reduce(
      (sums, group) => ({ total: sums.total + group.total, implemented: sums.implemented + group.implemented, planned: sums.planned + group.planned, unknown: sums.unknown + group.unknown }),
      { total: 0, implemented: 0, planned: 0, unknown: 0 },
    );
    const problems = [
      ...summaryproblemsof(poolcoveragerecord.summary),
      ...(okchecks !== poolcoveragerecord.summary.passed ? ["the recorded ok checks disagree with the recorded passed count"] : []),
      ...(groupsums.total !== poolcoveragerecord.pool.total || groupsums.implemented !== poolcoveragerecord.pool.implemented || groupsums.planned !== poolcoveragerecord.pool.planned || groupsums.unknown !== poolcoveragerecord.pool.unknown
        ? ["the recorded group counts disagree with the recorded pool disposition"]
        : []),
    ];
    for (const problem of problems) console.error(`POOLAUDIT record: ${problem}`);
    console.log(
      `Pool audit of ${report.pool.total} items against ${report.corpus} shipped symbols: ${report.pool.implemented} implemented, ${report.pool.planned} planned, ${report.pool.unknown} unknown, the record in tests/devthink.poolaudit.ts.`,
    );
    if (problems.length > 0) process.exitCode = 1;
  }
  if (report.summary.failed > 0) process.exitCode = 1;
}
