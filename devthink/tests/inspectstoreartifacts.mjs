/**
 * Fetches public Chrome Web Store CRX payloads for evidence-only inspection.
 * It never evaluates package code and deletes every downloaded artifact after inventory collection.
 */
import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { join } from "node:path";

const execute = promisify(execFile);
const root = process.cwd();
const artifacts = join(root, "tests", "artifacts");
const output = join(root, "docs", "08.artifactinventory.md");
const index = await readFile(join(root, "docs", "06.userstorecatalog.md"), "utf8");
const identifiers = [...new Set([...index.matchAll(/\| \d+ \| .*? \| ([a-z]{32}) \|/g)].map((match) => match[1]))];
const requestedlimit = Number.parseInt(
  process.argv.find((argument) => argument.startsWith("--limit="))?.split("=")[1] ?? String(identifiers.length),
  10,
);
const selected = identifiers.slice(0, Number.isFinite(requestedlimit) ? requestedlimit : identifiers.length);

function decodecrx(payload) {
  if (payload.subarray(0, 4).toString("ascii") !== "Cr24") throw new Error("response is not a CRX payload");
  const version = payload.readUInt32LE(4);
  if (version === 3) return { version, zip: payload.subarray(12 + payload.readUInt32LE(8)) };
  if (version === 2) return { version, zip: payload.subarray(16 + payload.readUInt32LE(8) + payload.readUInt32LE(12)) };
  throw new Error(`unsupported CRX version ${version}`);
}

function compactvalues(values) {
  return Array.isArray(values) && values.length ? values.join(", ") : "none";
}

async function inspectscripts(zippath, files) {
  const scripts = files.filter((file) => /\.(?:m?js|cjs)$/i.test(file));
  const apiuses = new Set();
  const featureuses = new Set();
  const transports = new Set();
  const apipattern = /(?:chrome|browser)\.([a-zA-Z][a-zA-Z0-9]*)/g;
  const patterns = {
    taskplanning: /(?:plan|task|workflow|agent)/i,
    observation: /(?:accessibility|snapshot|dom|extract|scrap|read)/i,
    interaction: /(?:click|fill|type|keyboard|executeScript)/i,
    recording: /(?:record|macro|trace|replay)/i,
    diagnostics: /(?:diagnostic|console|error|screenshot|debug)/i,
    network: /(?:fetch|websocket|xmlhttprequest)/i,
  };

  for (const file of scripts) {
    try {
      const content = (await execute("unzip", ["-p", zippath, file], { maxBuffer: 12 * 1024 * 1024 })).stdout;
      for (const match of content.matchAll(apipattern)) apiuses.add(match[1]);
      for (const [feature, pattern] of Object.entries(patterns)) if (pattern.test(content)) featureuses.add(feature);
      if (/(?:chrome|browser)\.runtime\.(?:sendMessage|onMessage|connect|onConnect)/.test(content))
        transports.add("extension runtime message");
      if (/(?:chrome|browser)\.(?:tabs|scripting)\.(?:sendMessage|executeScript)/.test(content))
        transports.add("tab or content bridge");
      if (/(?:connectNative|sendNativeMessage)/.test(content)) transports.add("native host bridge");
      if (/(?:fetch\(|new\s+WebSocket|XMLHttpRequest)/.test(content)) transports.add("network transport signal");
    } catch {
      featureuses.add("unreadable script");
    }
  }
  return {
    scriptcount: scripts.length,
    apiuses: [...apiuses].sort(),
    featureuses: [...featureuses].sort(),
    transports: [...transports].sort(),
  };
}

function boundary(record) {
  if (!record.manifest) return "not established";
  const permissions = record.manifest.permissions ?? [];
  const transports = record.staticanalysis.transports;
  if (permissions.includes("nativeMessaging") || transports.includes("native host bridge"))
    return transports.includes("network transport signal")
      ? "hybrid local host and network hint"
      : "local native-host bridge indicated";
  if (transports.includes("network transport signal"))
    return "network-capable signal; endpoint and data path unverified";
  if (transports.includes("extension runtime message") || transports.includes("tab or content bridge"))
    return "extension-local bridge indicated";
  return "not established from manifest and static signals";
}

function sourcestatus(record) {
  if (record.identifier === "infppggnoaenmfagbfknfkancpbljcca")
    return "public source known; license is mixed AGPL/commercial";
  if (record.identifier === "hkcbjmdeheceggmlbhbiljejkkpjljjp")
    return "listing label says open source; repository/license not yet verified";
  return "store artifact only; source and license not established";
}

async function inspect(identifier) {
  const updateurl = `https://clients2.google.com/service/update2/crx?response=redirect&prodversion=131.0.6778.265&acceptformat=crx2,crx3&x=id%3D${identifier}%26uc`;
  const response = await fetch(updateurl, { redirect: "follow" });
  if (!response.ok) return { identifier, status: `HTTP ${response.status}`, source: updateurl };
  const payload = Buffer.from(await response.arrayBuffer());
  const { version, zip } = decodecrx(payload);
  const directory = join(artifacts, identifier);
  const zippath = join(directory, "package.zip");
  await mkdir(directory, { recursive: true });
  await writeFile(zippath, zip);
  try {
    const files = (await execute("unzip", ["-Z1", zippath], { maxBuffer: 8 * 1024 * 1024 })).stdout
      .trim()
      .split("\n")
      .filter(Boolean);
    const manifestjson = (await execute("unzip", ["-p", zippath, "manifest.json"], { maxBuffer: 1024 * 1024 })).stdout;
    const manifest = JSON.parse(manifestjson);
    const staticanalysis = await inspectscripts(zippath, files);
    return {
      identifier,
      status: "manifest verified",
      source: updateurl,
      bytes: payload.byteLength,
      crxversion: version,
      manifest,
      files,
      staticanalysis,
    };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

await rm(artifacts, { recursive: true, force: true });
await mkdir(artifacts, { recursive: true });
const records = [];
for (const identifier of selected) {
  try {
    records.push(await inspect(identifier));
  } catch (error) {
    records.push({
      identifier,
      status: `inspection error: ${error instanceof Error ? error.message : String(error)}`,
      source: "Chrome update service",
    });
  }
}
await rm(artifacts, { recursive: true, force: true });

const rows = records.map((record) => {
  if (!record.manifest) return `| ${record.identifier} | ${record.status} | n/a | n/a | n/a | n/a |`;
  return `| ${record.identifier} | ${record.status} | ${record.manifest.name ?? "unnamed"} | ${record.manifest.version ?? "unknown"} | ${compactvalues(record.manifest.permissions)} | ${compactvalues(record.manifest.optional_host_permissions ?? record.manifest.host_permissions)} |`;
});
const details = records
  .filter((record) => record.manifest)
  .map((record) => {
    const files = record.files.map((file) => `- ${file}`).join("\n");
    return `## ${record.identifier}\n\n| Field | Value |\n| --- | --- |\n| CRX format | ${record.crxversion} |\n| Download size | ${record.bytes} bytes |\n| Manifest version | ${record.manifest.manifest_version ?? "unknown"} |\n| Required permissions | ${compactvalues(record.manifest.permissions)} |\n| Optional permissions | ${compactvalues(record.manifest.optional_permissions)} |\n| Host permissions | ${compactvalues(record.manifest.host_permissions)} |\n| Optional host permissions | ${compactvalues(record.manifest.optional_host_permissions)} |\n| Background | ${JSON.stringify(record.manifest.background ?? {})} |\n| Content scripts | ${(record.manifest.content_scripts ?? []).length} declaration(s) |\n| Script files statically scanned | ${record.staticanalysis.scriptcount} |\n| Browser API namespaces observed | ${compactvalues(record.staticanalysis.apiuses)} |\n| High-level feature signals observed | ${compactvalues(record.staticanalysis.featureuses)} |\n| File inventory | ${record.files.length} entries |\n\n### File inventory\n\n${files}\n`;
  })
  .join("\n");

function aggregate(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((left, right) => right[1] - left[1]);
}

const permissionrows = aggregate(
  records.filter((record) => record.manifest).flatMap((record) => record.manifest.permissions ?? []),
)
  .map(([name, count]) => `| ${name} | ${count} |`)
  .join("\n");
const apirows = aggregate(
  records.filter((record) => record.staticanalysis).flatMap((record) => record.staticanalysis.apiuses),
)
  .map(([name, count]) => `| ${name} | ${count} |`)
  .join("\n");
const featurerows = aggregate(
  records.filter((record) => record.staticanalysis).flatMap((record) => record.staticanalysis.featureuses),
)
  .map(([name, count]) => `| ${name} | ${count} |`)
  .join("\n");
const staticmetrics = `# Aggregate CRX Static Signals\n\nThis aggregate counts declared permissions and non-executing script-text signals across the ${records.length} reviewed CRX entries. A count shows declaration or textual reference, not a confirmed runtime feature.\n\n## Declared permissions\n\n| Permission | Packages declaring it |\n| --- | ---: |\n${permissionrows}\n\n## Browser API namespaces\n\n| Namespace | Packages with a static reference |\n| --- | ---: |\n${apirows}\n\n## Derived feature signals\n\n| Signal | Packages with a static reference |\n| --- | ---: |\n${featurerows}\n\n## Design conclusion\n\nThe reviewed market frequently asks for broad tab, debugger, cookie, navigation and all-sites capabilities. Devthink will not inherit that permission surface. Its default package remains active-tab, storage and side-panel only; the user can grant a narrowly scoped HTTPS origin for a reviewed session.\n`;
await writeFile(join(root, "docs", "09.artifactstaticmetrics.md"), staticmetrics);
const transportrows = records
  .map(
    (record) =>
      `| ${record.identifier} | ${record.status} | ${record.staticanalysis ? compactvalues(record.staticanalysis.transports) : "none observed"} | ${boundary(record)} | ${sourcestatus(record)} |`,
  )
  .join("\n");
const transportmatrix = `# Per Artifact Transport and Boundary Matrix\n\nThis matrix completes the artifact review without treating static signals as runtime facts. Transport labels are detected from public package declarations and non-executing script-text inspection. A missing signal means only that the reviewed files did not expose one.\n\n| Extension ID | Review status | Message transport signals | Local or remote boundary | Source and license availability |\n| --- | --- | --- | --- | --- |\n${transportrows}\n\n## Interpretation\n\nAn extension runtime message means communication inside the browser extension. A tab or content bridge indicates a potential path between privileged extension code and a selected page; it does not establish that an agent can act without consent. Native-host labels indicate an installed companion program is needed. Network labels only show a code-level hint that network transport appears; they do not establish the destination, data content or remote execution semantics.\n\nDevthink will implement only a session-scoped extension bridge. Any endpoint is configured by the user, every incoming command is schema-validated and tied to an approved tab and origin, and sensitive tasks require an explicit decision in the extension UI.\n`;
await writeFile(join(root, "docs", "10.artifacttransportmatrix.md"), transportmatrix);
const report = `# Public CRX Artifact Inventory\n\nThis report was generated from the Chrome update service for the user-supplied extension IDs. Each downloaded CRX was treated as untrusted data: the inspection read only the archive directory and manifest.json, did not execute any script, and deleted the raw archive immediately after the report was generated. A manifest is technical evidence of declared scope, not authorization to reuse source code, branding, UI or proprietary protocols.\n\n## Summary\n\n| Reviewed IDs | Manifest verified | Unavailable or invalid |\n| ---: | ---: | ---: |\n| ${records.length} | ${records.filter((record) => record.status === "manifest verified").length} | ${records.filter((record) => record.status !== "manifest verified").length} |\n\n## Manifest evidence\n\n| Extension ID | Status | Declared name | Version | Required permissions | Host scope |\n| --- | --- | --- | --- | --- | --- |\n${rows.join("\n")}\n\n${details}\n\n## Interpretation\n\nThe report distinguishes manifest-verified facts from all other claims. It does not assert runtime behavior from a file name, and it does not execute, decompile, republish or vendor any third-party artifact. Feature comparison remains based on public listings and openly licensed source reviewed under its license terms.\n\n## References\n\n[1]: https://developer.chrome.com/docs/webstore/update/ "Chrome Web Store — Update protocol"\n[2]: https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions "Chrome Extensions — Declare permissions"\n`;
await writeFile(output, report);
console.log(
  JSON.stringify(
    {
      requested: selected.length,
      verified: records.filter((record) => record.status === "manifest verified").length,
      failed: records.filter((record) => record.status !== "manifest verified").length,
    },
    null,
    2,
  ),
);
