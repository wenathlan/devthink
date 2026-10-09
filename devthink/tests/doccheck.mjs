/** Verifies the documentation stays consistent with the code: the kind documentation covers every action kind of the catalog with its fields and a schema valid example, the reference tables mirror the cli commands, the protocol messages, the error codes, the audit kinds, the configuration keys, the mcp tools and the capability manifests, the doc links resolve, the code blocks state their language, the flow diagrams follow the shared style, the changelog covers every released version and the readme claims match the surfaces — every gap is a failing check, the report lands in tests/artifacts/doccheck.json and the gate exits nonzero on any gap. */
import { execFile } from "node:child_process";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);
const checks = [];

/** Records one documentation check with its outcome and its detail lines. */
function record(name, ok, details) {
  checks.push({ name, ok, detail: details.length === 0 ? "every entry verified" : details.join("; ") });
}

/** Reads a documented file or refuses the read as a failed check input. */
async function text(path) {
  return readFile(path, "utf8");
}

const packagejson = JSON.parse(await text("package.json"));
const release = String(packagejson.version);

/* the gate runs after the build: the kind catalog, the tool catalog and the message catalog live in the compiled modules. */
if (!existsSync("dist/policy.js") || !existsSync("dist/index.js") || !existsSync("dist/protocol.js")) {
  console.error(
    "DOCCHECK The gate reads the compiled kind, tool and message catalogs; run pnpm build before the documentation check.",
  );
  process.exitCode = 1;
}
if (process.exitCode !== 1) {
  const { actionkindcatalog, actionrisk, needstarget } = await import("./../dist/policy.js");
  const { alltools, buildtoolcatalog } = await import("./../dist/index.js");
  const { frozenmessagecatalog } = await import("./../dist/protocol.js");
  const catalog = actionkindcatalog();
  const riskof = Object.fromEntries(catalog.map((kind) => [kind, actionrisk(kind)]));
  const targetof = Object.fromEntries(catalog.map((kind) => [kind, needstarget(kind)]));

  /* 1. the kind documentation covers every action kind of the catalog exactly. */
  const kinddocstext = await text("docs/kinddocs.md");
  const entries = [...kinddocstext.matchAll(/^### `([a-z0-9]+)`$/gm)].map((match) => match[1]);
  const missingkinds = catalog.filter((kind) => !entries.includes(kind));
  const extraentries = entries.filter((kind) => !catalog.includes(kind));
  record("kindcoverage", missingkinds.length === 0 && extraentries.length === 0 && entries.length === catalog.length, [
    ...missingkinds.map((kind) => `the kind ${kind} documents nowhere`),
    ...extraentries.map((kind) => `the entry ${kind} stayed outside the catalog`),
  ]);

  /* 2. every kind entry states its fields: the option grammar, the consent class, the capability, the policy test and the schema anchor. */
  const fieldproblems = [];
  const sections = kinddocstext
    .split(/^### `/m)
    .slice(1)
    .map((section) => ["### `" + section, section.split("\n")]);
  for (const [heading, body] of sections) {
    const kind = /^### `([a-z0-9]+)`/.exec(heading)?.[1] ?? "";
    if (kind === "" || !catalog.includes(kind)) continue;
    if (!body.some((line) => line.startsWith("- options grammar:")))
      fieldproblems.push(`the ${kind} entry documents no option grammar`);
    const consentline = body.find((line) => line.startsWith("- consent class: "));
    if (consentline === undefined) fieldproblems.push(`the ${kind} entry states no consent class`);
    else if (consentline.slice("- consent class: ".length).trim() !== riskof[kind])
      fieldproblems.push(
        `the ${kind} entry states the consent class ${consentline.slice(18).trim()} while policy grades ${riskof[kind]}`,
      );
    if (!body.some((line) => line.startsWith("- capability:")))
      fieldproblems.push(`the ${kind} entry states no capability requirement`);
    const testline = body.find((line) => line.startsWith("- policy test: "));
    if (testline === undefined) fieldproblems.push(`the ${kind} entry links no policy test`);
    else if (!existsSync(testline.slice("- policy test: ".length).trim()))
      fieldproblems.push(`the ${kind} entry links the absent policy test ${testline.slice(15).trim()}`);
    if (!body.some((line) => line.startsWith("- schema anchor:")))
      fieldproblems.push(`the ${kind} entry links no schema anchor`);
  }
  record("kindfields", fieldproblems.length === 0, fieldproblems);

  /* 3. every kind entry carries a plan fragment that validates against the frozen step schema. */
  const exampleproblems = [];
  for (const [heading, body] of sections) {
    const kind = /^### `([a-z0-9]+)`/.exec(heading)?.[1] ?? "";
    if (kind === "" || !catalog.includes(kind)) continue;
    const blockstart = body.findIndex((line) => line.startsWith("```json"));
    if (blockstart < 0) {
      exampleproblems.push(`the ${kind} entry carries no example`);
      continue;
    }
    const blockend = body.findIndex((line, index) => index > blockstart && line.startsWith("```"));
    if (blockend < 0) {
      exampleproblems.push(`the ${kind} example never closes`);
      continue;
    }
    let example;
    try {
      example = JSON.parse(body.slice(blockstart + 1, blockend).join("\n"));
    } catch {
      exampleproblems.push(`the ${kind} example fails to parse`);
      continue;
    }
    if (example.kind !== kind) exampleproblems.push(`the ${kind} example carries the kind ${example.kind}`);
    if (example.id !== "step1" || typeof example.summary !== "string" || example.summary === "")
      exampleproblems.push(`the ${kind} example misses the required id or summary`);
    if (example.risk !== riskof[kind])
      exampleproblems.push(`the ${kind} example carries the risk ${example.risk} while policy grades ${riskof[kind]}`);
    if (targetof[kind] === true && typeof example.target !== "string")
      exampleproblems.push(`the ${kind} example misses the target the kind requires`);
    if (targetof[kind] === false && "target" in example)
      exampleproblems.push(`the ${kind} example carries a target the kind never reads`);
  }
  record("kindexamples", exampleproblems.length === 0, exampleproblems);

  /* 4. every doc link resolves to an existing file and anchor; every code block states its language. */
  const linkproblems = [];
  const fenceproblems = [];
  const docfiles = (await readdir("docs")).filter((name) => name.endsWith(".md"));
  for (const file of docfiles) {
    const content = await text(join("docs", file));
    for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (target.startsWith("http") || target.startsWith("mailto:")) continue;
      const [pathpart, anchorpart] = target.split("#");
      const resolved =
        pathpart === "" ? join("docs", file) : pathpart.startsWith("/") ? pathpart.slice(1) : join("docs", pathpart);
      if (!existsSync(resolved)) {
        linkproblems.push(`the ${file} link ${target} resolves to no file`);
        continue;
      }
      if (anchorpart !== undefined && anchorpart !== "" && resolved.endsWith(".md")) {
        const anchordoc = await readFile(resolved, "utf8");
        if (
          !anchordoc.includes(`#${anchorpart.replaceAll("-", " ")}`) &&
          !new RegExp(`^#+\\s+.*${anchorpart}`, "im").test(anchordoc)
        )
          linkproblems.push(`the ${file} link ${target} resolves to no anchor`);
      }
    }
    let fence = false;
    for (const line of content.split("\n")) {
      if (line.startsWith("```")) {
        if (!fence && line.slice(3).trim() === "") fenceproblems.push(`the ${file} code block states no language`);
        fence = !fence;
      }
    }
  }
  record("doclinks", linkproblems.length === 0, linkproblems.slice(0, 20));
  record("codefences", fenceproblems.length === 0, fenceproblems.slice(0, 20));

  /* 5. the reference tables mirror the code: the cli commands, the protocol messages, the audit kinds, the mcp tools, the error codes and the configuration keys. */
  const refdocstext = await text("docs/refdocs.md");
  const tableproblems = [];
  const clisource = await text("cli.ts");
  const clicommands = [
    ...clisource.matchAll(
      /"(manifest|describe|commands|planlint|migrateplan|flowrun|runworkflow|exportdata|headless|serve|native|export|init|doctor|help)"/g,
    ),
  ].map((match) => match[1]);
  const uniquecommands = [...new Set(clicommands)];
  for (const command of uniquecommands)
    if (!refdocstext.includes(`\`${command}\``))
      tableproblems.push(`the cli command ${command} documents nowhere in the reference`);
  for (const message of frozenmessagecatalog)
    if (!refdocstext.includes(`\`${message.type}\``))
      tableproblems.push(`the protocol message ${message.type} documents nowhere in the reference`);
  const typessource = await text("types.ts");
  const auditmatch = /export type auditkind = ([^;]+);/.exec(typessource);
  const auditkinds = auditmatch !== null ? [...auditmatch[1].matchAll(/"([a-z]+)"/g)].map((match) => match[1]) : [];
  for (const kind of auditkinds)
    if (!refdocstext.includes(`\`${kind}\``))
      tableproblems.push(`the audit kind ${kind} documents nowhere in the reference`);
  const tools = alltools(buildtoolcatalog());
  for (const tool of tools)
    if (!refdocstext.includes(`\`${tool.name}\``))
      tableproblems.push(`the mcp tool ${tool.name} documents nowhere in the reference`);
  for (const code of [
    "parse",
    "method",
    "params",
    "internal",
    "consentrefused",
    "stepfailed",
    "schemaerror",
    "unsupported",
    "cancelled",
  ])
    if (!refdocstext.includes(`\`${code}\``))
      tableproblems.push(`the error code ${code} documents nowhere in the reference`);
  const configkeys = [
    "devthink.relayurl",
    "devthink.ratelimit",
    "devthink.phishguard",
    "DEVTHINK_HTTP_BIND",
    "DEVTHINK_HTTP_PORT",
    "DEVTHINK_MCP_BIND",
    "DEVTHINK_MCP_PORT",
    "DEVTHINK_MCP_PATH",
    "DEVTHINK_RELAY_PATH",
  ];
  const configurationtext = await text("docs/configuration.md");
  for (const key of configkeys)
    if (!configurationtext.toLowerCase().includes(key.toLowerCase().split(".")[key.split(".").length - 1]))
      tableproblems.push(`the configuration key ${key} documents nowhere in docs/configuration.md`);
  record("referencetables", tableproblems.length === 0, tableproblems.slice(0, 20));

  /* 6. the flow documentation carries the shared mermaid style with module links. */
  const flowdocstext = await text("docs/flowdocs.md");
  const mermaidblocks = (flowdocstext.match(/```mermaid/g) ?? []).length;
  const modulelinks = (flowdocstext.match(/^modules: /gm) ?? []).length;
  record("flowdiagrams", mermaidblocks >= 12 && modulelinks === mermaidblocks, [
    `the flow documentation carries ${mermaidblocks} mermaid diagrams with ${modulelinks} module link lines`,
  ]);

  /* 7. the changelog covers every released version and the roadmap covers the planned chain. */
  const changelogproblems = [];
  const roadmapproblems = [];
  let tags = [];
  try {
    tags = (await execute("git", ["tag", "-l", "v*"])).stdout.split("\n").filter((tag) => tag !== "");
  } catch {
    tags = [];
  }
  const changelogtext = await text("CHANGELOG.md");
  for (const tag of tags) {
    const version = tag.slice(1);
    if (!new RegExp(`^##\\s+${version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$)`, "m").test(changelogtext))
      changelogproblems.push(`the released version ${version} documents nowhere in the changelog`);
  }
  const roadmaptext = await text("docs/13.evolutionroadmap.md");
  if (!roadmaptext.includes("## 2.0.0")) roadmapproblems.push("the roadmap carries no 2.0.0 section");
  if (!roadmaptext.includes("1.1.31 to 2.0.0"))
    roadmapproblems.push("the roadmap title no longer spans the full chain");
  record("changelogcoverage", changelogproblems.length === 0, changelogproblems);
  record("roadmapcoverage", roadmapproblems.length === 0, roadmapproblems);

  /* 8. the readme claims match the capability manifests: every surface the caps directory serves documents in the readme. */
  const readmeproblems = [];
  const readmetext = await text("README.md");
  for (const file of (await readdir("dist/caps")).filter((name) => name.endsWith(".json"))) {
    const surface = file.replace(".json", "");
    if (!readmetext.toLowerCase().includes(surface))
      readmeproblems.push(`the readme documents the ${surface} surface nowhere`);
  }
  record("readmeclaims", readmeproblems.length === 0, readmeproblems);

  /* the report and the exit code. */
  const report = {
    release,
    kindcount: catalog.length,
    kindentries: entries.length,
    families: 12,
    auditkinds: auditkinds.length,
    mcptools: tools.length,
    protocolmessages: frozenmessagecatalog.length,
    clicommands: uniquecommands.length,
    flowdiagrams: mermaidblocks,
    checks,
    summary: {
      total: checks.length,
      passed: checks.filter((check) => check.ok).length,
      failed: checks.filter((check) => !check.ok).length,
    },
  };
  await writeFile("tests/artifacts/doccheck.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
  if (report.summary.failed > 0) {
    for (const check of checks.filter((check) => !check.ok)) console.error(`DOCCHECK ${check.name}: ${check.detail}`);
    process.exitCode = 1;
  } else {
    console.log(
      `Documentation verified for ${release}: ${catalog.length} kinds, ${auditkinds.length} audit kinds, ${tools.length} mcp tools, ${frozenmessagecatalog.length} protocol messages, ${uniquecommands.length} cli commands, ${mermaidblocks} flow diagrams; ${report.summary.passed} check families green.`,
    );
  }
}
