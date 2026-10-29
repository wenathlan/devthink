/**
 * Builds the public research catalog from the GitHub search result exports the
 * researchfixtures module carries. The script records source metadata only; it
 * never downloads or executes repository code, and the two derived markdown
 * documents (the public project catalog and the comparative feature and flow
 * matrix) land back inside the researchfixtures module the corpus ships.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { reposources } from "./tests/researchfixtures.ts";

const modulepath = join(process.cwd(), "tests", "researchfixtures.ts");
const sourcefiles = Object.keys(reposources)
  .filter((name) => /^repos.*\.json$/i.test(name))
  .sort();
const entries = [];

/** One repository record of the public GitHub search exports the catalog reads. */
interface repositoryentry {
  fullName: string;
  description?: string;
  stargazersCount?: number;
  url: string;
  license?: { key?: string; name?: string };
}

for (const file of sourcefiles) {
  const content = (reposources as Record<string, string>)[file];
  const values = JSON.parse(content.replace(new RegExp(String.fromCharCode(27) + "\\[?[0-?]*[ -/]*[@-~]", "g"), ""));
  if (Array.isArray(values)) entries.push(...values);
}

const unique = new Map();
for (const item of entries) {
  if (!item?.fullName || unique.has(item.fullName)) continue;
  unique.set(item.fullName, item);
}

const ordered = [...unique.values()].sort((left, right) => (right.stargazersCount ?? 0) - (left.stargazersCount ?? 0));
const licensed = ordered.filter((item) => item.license?.key && item.license.key !== "other");
const selected = licensed.slice(0, 50);

function classifyfeature(item: repositoryentry) {
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

function classifyflow(item: repositoryentry) {
  const text = `${item.fullName} ${item.description ?? ""}`.toLowerCase();
  if (/(mcp|claude)/.test(text)) return "hypothesis: agent protocol → extension or local bridge → browser action";
  if (/(playwright|puppeteer|selenium|test)/.test(text))
    return "hypothesis: declared task → browser driver → structured result";
  if (/(extension|webextension|chrome|firefox)/.test(text))
    return "hypothesis: extension UI → background runtime → scoped tab interaction";
  return "hypothesis: task request → browser agent → reported outcome";
}

/** Encodes externally supplied repository metadata before it enters generated Markdown. */
function markdownvalue(value: unknown) {
  return encodeURIComponent(String(value ?? ""));
}

/** Accepts only the canonical GitHub repository URL obtained from the public metadata feed. */
function repositoryurl(value: unknown) {
  try {
    const parsed = new URL(String(value));
    if (parsed.protocol !== "https:" || parsed.hostname !== "github.com")
      throw new Error("Non-canonical repository URL.");
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

const markdown = `# Public Open Source Project Catalog\n\nThis catalog is derived from GitHub public-search metadata collected on 2026-08-27. It is an intake list, not an endorsement and not proof that every repository is safe, maintained, or legally reusable. The implementation review phase must confirm the license and inspect only the files needed for interoperability, security and behavior mapping.\n\n## Licensed project sample\n\n| No. | Repository | Declared license | Stars at collection | Public description |\n| --- | --- | --- | ---: | --- |\n${rows.join("\n")}\n\nThe collection contained ${ordered.length} distinct repositories. ${licensed.length} declared a recognized license in GitHub metadata. The first ${selected.length} licensed repositories are retained as the comparative sample; unlicensed or ambiguous repositories are not a code-reuse source.\n\n## Method and limitations\n\nThe catalog combines public GitHub searches for browser automation extensions, browser agents, Firefox automation, Playwright extensions, browser MCP connectors and browser-use agents. Search metadata is useful to establish a public landscape, but it cannot establish implementation quality, exact functionality, browser-store availability or security posture. Those questions are handled in the separate artifact and source review.\n\n## References\n\n[1]: https://github.com/topics/browser-automation "GitHub Topic — browser automation"\n[2]: https://github.com/topics/ai-browser-agent "GitHub Topic — AI browser agent"\n`;

const matrix = `# Comparative Feature and Flow Matrix\n\nThis matrix is intentionally evidence-scoped. Each row represents a public GitHub repository result with a declared license. Feature labels are extracted from public names and descriptions; they are discovery signals, not verified implementation claims. Flow entries are explicit hypotheses to validate in a source or artifact review. No third-party code, branding or private behavior is copied into Devthink.\n\n| No. | Source | Public feature signals | Flow to validate | Evidence class | License and confidence note |\n| --- | --- | --- | --- | --- |\n${matrixrows.join("\n")}\n\n## Reading the matrix\n\nA public listing or repository description can establish only a public claim. A later row in the artifact review will be marked manifest verified only after the downloaded package's manifest is read, and source verified only after an openly licensed source file is inspected. The matrix will retain unverified where neither form of evidence is available.\n\n## References\n\n[1]: https://github.com/topics/browser-automation "GitHub Topic — browser automation"\n[2]: https://github.com/topics/ai-browser-agent "GitHub Topic — AI browser agent"\n`;

/** Escapes one derived markdown document into the template literal body the researchfixtures module carries, so a repository description can never break the module the corpus ships. */
function templatetext(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

const moduletext = await readFile(modulepath, "utf8");
let rewrites = 0;
const rewritten = moduletext
  .replace(/export const publicprojectcatalog = `[\s\S]*?`;/, () => {
    rewrites += 1;
    return `export const publicprojectcatalog = \`${templatetext(markdown)}\`;`;
  })
  .replace(/export const featureflowmatrix = `[\s\S]*?`;/, () => {
    rewrites += 1;
    return `export const featureflowmatrix = \`${templatetext(matrix)}\`;`;
  });
if (rewrites !== 2)
  throw new Error(
    `The researchfixtures module carries ${rewrites} of the two catalog template literals the research catalog build rewrites; the module lost a derived document export.`,
  );
await writeFile(modulepath, rewritten, "utf8");
console.log(JSON.stringify({ total: ordered.length, licensed: licensed.length, selected: selected.length }, null, 2));
