/**
 * Extracts unique Chrome Web Store URLs from the user-provided requirement export.
 * The script creates a source index only and does not fetch, execute or unpack extensions.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const sourcedirectory = join(process.cwd(), "tests", "code");
const input = await readFile(join(sourcedirectory, "inputrequirements.txt"), "utf8");
const urls = [...input.matchAll(/https:\/\/chromewebstore\.google\.com\/detail\/[^\s*]+/g)].map(match => match[0]);
const unique = [...new Set(urls)];
const rows = unique.map((url, index) => {
  const parts = url.split("/");
  const identifier = parts.at(-1) ?? "unknown";
  const slug = decodeURIComponent(parts.at(-2) ?? "unknown").replace(/-/g, " ");
  return `| ${index + 1} | ${slug} | ${identifier} | [Listing](${url}) | manifest inventory retained separately |`;
});

const output = `# User Provided Chrome Web Store Catalog\n\nThis source index extracts the Chrome Web Store URLs supplied by the user. A listing proves that a product page was referenced; it does not prove open-source availability or grant permission to copy code, branding or data.\n\n| No. | Listing label | Chrome extension ID | Source | Review state |\n| --- | --- | --- | --- | --- |\n${rows.join("\n")}\n\nThe companion [artifact inventory](08.artifactinventory.md) records the evidence-only manifest and file-list review performed where a public CRX payload was available. Third-party package code is never added to this repository.\n`;
await writeFile(join(sourcedirectory, "06.userstorecatalog.md"), output);
console.log(JSON.stringify({ unique: unique.length }, null, 2));
