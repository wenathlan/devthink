/**
 * Builds the public research catalog from GitHub search result exports.
 * The script records source metadata only; it never downloads or executes repository code.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const sourcedirectory = join(process.cwd(), "tests", "code");
const sourcefiles = (await readdir(sourcedirectory)).filter(name => /^repos.*\.json$/i.test(name));
const entries = [];

for (const file of sourcefiles) {
  const content = await readFile(join(sourcedirectory, file), "utf8");
  const values = JSON.parse(content.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, ""));
  if (Array.isArray(values)) entries.push(...values);
}

const unique = new Map();
for (const item of entries) {
  if (!item?.fullName || unique.has(item.fullName)) continue;
  unique.set(item.fullName, item);
}

const ordered = [...unique.values()].sort((left, right) => (right.stargazersCount ?? 0) - (left.stargazersCount ?? 0));
const licensed = ordered.filter(item => item.license?.key && item.license.key !== "other");
const selected = licensed.slice(0, 50);

function classifyfeature(item) {
  const text = `${item.fullName} ${item.description ?? ""}`.toLowerCase();
  const signals = [];
  if (/(browser|web)/.test(text)) signals.push("browser context");
  if (/(automation|automate|workflow)/.test(text)) signals.push("workflow automation");
  if (/(agent|ai|llm)/.test(text)) signals.push("agent coordination");
  if (/(extension|webextension|chrome|firefox)/.test(text)) signals.push("extension bridge");
  if (/(mcp|claude)/.test(text)) signals.push("tool protocol bridge");
  if (/(playwright|puppeteer|selenium|test)/.test(text)) signals.push("test driver");
  if (/(vision|screen|screenshot|ocr)/.test(text)) signals.push("visual observation");
  if (/(scrap|extract|crawl)/.test(text)) signals.push("data extraction");
  return signals.length ? signals.join(", ") : "generic browser-agent reference";
}

function classifyflow(item) {
  const text = `${item.fullName} ${item.description ?? ""}`.toLowerCase();
  if (/(mcp|claude)/.test(text)) return "hypothesis: agent protocol → extension or local bridge → browser action";
  if (/(playwright|puppeteer|selenium|test)/.test(text)) return "hypothesis: declared task → browser driver → structured result";
  if (/(extension|webextension|chrome|firefox)/.test(text)) return "hypothesis: extension UI → background runtime → scoped tab interaction";
  return "hypothesis: task request → browser agent → reported outcome";
}

/** Encodes externally supplied repository metadata before it enters generated Markdown. */
function markdownvalue(value) {
  return encodeURIComponent(String(value ?? ""));
}

/** Accepts only the canonical GitHub repository URL obtained from the public metadata feed. */
function repositoryurl(value) {
  try {
    const parsed = new URL(String(value));
    if (parsed.protocol !== "https:" || parsed.hostname !== "github.com") throw new Error("Non-canonical repository URL.");
    return encodeURI(parsed.toString());
  } catch {
    return "https://github.com/";
  }
}

const rows = selected.map((item, index) => {
  const description = markdownvalue(item.description ?? "No public description supplied by the GitHub search index.");
  return `| ${index + 1} | [${markdownvalue(item.fullName)}](${repositoryurl(item.url)}) | ${markdownvalue(item.license.name)} | ${Number.isSafeInteger(item.stargazersCount) ? item.stargazersCount : 0} | ${description} |`;
});

const matrixrows = selected.map((item, index) => {
  const description = markdownvalue(item.description ?? "No public description supplied by the GitHub search index.");
  return `| ${index + 1} | [${markdownvalue(item.fullName)}](${repositoryurl(item.url)}) | ${markdownvalue(classifyfeature(item))} | ${markdownvalue(classifyflow(item))} | public repository metadata only | ${markdownvalue(item.license.name)}; description: ${description} |`;
});

const markdown = `# Public Open Source Project Catalog\n\nThis catalog is derived from GitHub public-search metadata collected on 2026-08-27. It is an intake list, not an endorsement and not proof that every repository is safe, maintained, or legally reusable. The implementation review phase must confirm the license and inspect only the files needed for interoperability, security and behavior mapping.\n\n## Licensed project sample\n\n| No. | Repository | Declared license | Stars at collection | Public description |\n| --- | --- | --- | ---: | --- |\n${rows.join("\n")}\n\nThe collection contained ${ordered.length} distinct repositories. ${licensed.length} declared a recognized license in GitHub metadata. The first ${selected.length} licensed repositories are retained as the comparative sample; unlicensed or ambiguous repositories are not a code-reuse source.\n\n## Method and limitations\n\nThe catalog combines public GitHub searches for browser automation extensions, browser agents, Firefox automation, Playwright extensions, browser MCP connectors and browser-use agents. Search metadata is useful to establish a public landscape, but it cannot establish implementation quality, exact functionality, browser-store availability or security posture. Those questions are handled in the separate artifact and source review.\n\n## References\n\n[1]: https://github.com/topics/browser-automation \"GitHub Topic — browser automation\"\n[2]: https://github.com/topics/ai-browser-agent \"GitHub Topic — AI browser agent\"\n`;

await writeFile(join(sourcedirectory, "04.publicprojectcatalog.md"), markdown);
const matrix = `# Comparative Feature and Flow Matrix\n\nThis matrix is intentionally evidence-scoped. Each row represents a public GitHub repository result with a declared license. Feature labels are extracted from public names and descriptions; they are discovery signals, not verified implementation claims. Flow entries are explicit hypotheses to validate in a source or artifact review. No third-party code, branding or private behavior is copied into Devthink.\n\n| No. | Source | Public feature signals | Flow to validate | Evidence class | License and confidence note |\n| --- | --- | --- | --- | --- |\n${matrixrows.join("\n")}\n\n## Reading the matrix\n\nA public listing or repository description can establish only a public claim. A later row in the artifact review will be marked manifest verified only after the downloaded package's manifest is read, and source verified only after an openly licensed source file is inspected. The matrix will retain unverified where neither form of evidence is available.\n\n## References\n\n[1]: https://github.com/topics/browser-automation \"GitHub Topic — browser automation\"\n[2]: https://github.com/topics/ai-browser-agent \"GitHub Topic — AI browser agent\"\n`;
await writeFile(join(sourcedirectory, "07.featureflowmatrix.md"), matrix);
console.log(JSON.stringify({ total: ordered.length, licensed: licensed.length, selected: selected.length }, null, 2));
