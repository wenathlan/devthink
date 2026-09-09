/**
 * console command catalog — the canonical design source of the devthink cli
 *
 * one file one responsibility: the terminal command registry the cli really
 * registers (lifted from views.ts clicommands — the shared registry the
 * commandpalette and the cli grow together, so no drift between the surfaces)
 * enriched with the flags, examples and documented feedback the cli entry
 * (cli.ts main) reads. the catalog drives every console surface: the
 * terminal completion, the help and commands responses, the reference panel
 * of the page — one source, zero duplicated command lists.
 *
 * the browser console is a design reference: runtime commands answer with
 * the documented feedback of the real cli (the exact banners, the exit code
 * contract, the refusal line of an unknown command), never a silent stub.
 */

/* ── the catalog shape ── */

/** one command flag as the cli parses it (parseflags): a boolean or value flag with its note. */
export type catalogflag = { flag: string; value?: string; note: string };

/** one registered terminal command: the views.ts registry entry plus the cli usage surface. */
export type catalogcommand = {
  id: string;
  label: string;
  keywords: string[];
  usage: string;
  flags: catalogflag[];
  response: string[];
};

/** the version banner line the real help command prints (cli.ts cmdhelp). */
export const versionbanner = (version: string): string =>
  `devthink ${version} — the consent-first browser agent bridge on the terminal.`;

/** the frozen api freeze line the describe command prints (cli.ts cmddescribe). */
export const freezeline = (version: string): string =>
  `devthink ${version} — the protocolv2 api freeze of 1.1.91 pinned on 2026-08-31.`;

/* ── global flags and the exit code contract ── */

/** the global flags every command accepts (cli.ts globalstate and cmdhelp). */
export const globalflags: catalogflag[] = [
  { flag: "--config", value: "<file>", note: "the configuration file the cli reads (default .devthink/config.json)" },
  { flag: "--verbose", note: "the verbose verbosity class prints the reasoning lines" },
  { flag: "--quiet", note: "the quiet verbosity class silences the summaries" },
  { flag: "--json", note: "the structured output class answers json" },
];

/** the documented exit code classes (cli.ts cliexitclasses and exitcodeof). */
export const exitclasses: Array<{ exitclass: string; code: number }> = [
  { exitclass: "ok", code: 0 },
  { exitclass: "consentrefused", code: 1 },
  { exitclass: "stepfailed", code: 2 },
  { exitclass: "schemaerror", code: 3 },
  { exitclass: "unsupported", code: 4 },
  { exitclass: "cancelled", code: 5 },
];

/* ── the terminal registry — the sixteen commands views.ts clicommands registers ── */

/** the command catalog: the real cli registry with the usage surface of each entry. */
export const catalogcommands: catalogcommand[] = [
  {
    id: "manifest",
    label: "Validate the extension manifest with the deep manifest checks",
    keywords: ["manifest", "permissions", "identity", "validate", "csp", "icons"],
    usage: "devthink manifest",
    flags: [],
    response: [
      "the deep manifest validation reads web/extension/manifest.json against the package version,",
      "the identity key digest, the forbidden permission classes, the sandbox pages, the offscreen",
      "declaration and the frozen capmanifests — the report answers as json:",
      '{ "valid": true, "version": "…", "identitykeybytes": 294, "permissions": [...],',
      '  "optionalpermissions": [...], "capmanifests": [...], "deepchecks": { rules, findings } }',
    ],
  },
  {
    id: "describe",
    label: "Print the frozen capability manifest of every surface with the protocolv2 negotiation line",
    keywords: [
      "describe",
      "capmanifest",
      "surface",
      "freeze",
      "protocol",
      "capabilities",
      "messages",
      "kinds",
      "permissions",
    ],
    usage: "devthink describe [--format json]",
    flags: [
      { flag: "--format", value: "json", note: "the full manifests of every surface instead of the summary lines" },
    ],
    response: [
      "devthink — the protocolv2 api freeze of 1.1.91 pinned on 2026-08-31.",
      "supported protocol versions 2 through 2; the deprecation window closes at 2.0.0.",
      "  background    … message types, … action kinds, … permissions, pinned to release …",
      "  pagebridge    … message types, … action kinds, … permissions, pinned to release …",
      "  sidepanel     … message types, … action kinds, … permissions, pinned to release …",
      "  popup         … message types, … action kinds, … permissions, pinned to release …",
      "  cli           … message types, … action kinds, … permissions, pinned to release …",
      "  library       … message types, … action kinds, … permissions, pinned to release …",
      "  mcp           … message types, … action kinds, … permissions, pinned to release …",
    ],
  },
  {
    id: "commands",
    label: "Print the shared command registry of the palette and the cli",
    keywords: ["commands", "registry", "palette", "cli", "surface"],
    usage: "devthink commands [--format json]",
    flags: [{ flag: "--format", value: "json", note: "the registry as json instead of the aligned lines" }],
    response: [
      "the shared registry prints one line per entry (cli marks the terminal surface, ui the palette surface) —",
      "type help for the full banner or commands --format json for the machine list.",
    ],
  },
  {
    id: "planlint",
    label: "Lint plan files",
    keywords: ["planlint", "lint", "plan", "diagnostics", "rules"],
    usage: "devthink planlint <plan.json|directory> [flags]",
    flags: [
      { flag: "--format", value: "human|lines|json", note: "the report format (human default)" },
      { flag: "--cache", value: "<dir>", note: "the portable ruleset cache (default .devthink)" },
      { flag: "--capabilities", value: "<file>", note: "the declared capability list the lint reads" },
      { flag: "--allowlist", value: "<origins>", note: "the consent allowlist of https origins" },
      { flag: "--domless", value: "true", note: "probe the domless capability set" },
    ],
    response: [
      "== plan.json",
      "the planlint ran the portable rules over the plan file with the declared capabilities;",
      "risk: the plan risk summary names the classes of the steps it read.",
      "every diagnostic prints file:severity:code:path: message in the lines format.",
    ],
  },
  {
    id: "migrateplan",
    label: "Convert a foreign plan source into the reviewed plan grammar",
    keywords: [
      "migrateplan",
      "convert",
      "import",
      "v1",
      "automa",
      "selenium",
      "uivision",
      "tabular",
      "migration",
      "plan",
    ],
    usage: "devthink migrateplan <source> --format <dialect> [--out <file>]",
    flags: [
      { flag: "--format", value: "v1|automa|selenium|uivision|tabular", note: "the dialect of the source file" },
      { flag: "--out", value: "<file>", note: "the converted plan file to write" },
      { flag: "--cache", value: "<dir>", note: "the portable ruleset cache" },
      { flag: "--capabilities", value: "<file>", note: "the declared capability list" },
    ],
    response: [
      "the migration bridge reads the source in its dialect, refuses every entry the importer",
      "cannot map with the source entry named, verifies the converted plan against the same frozen",
      "grammar and the same lint engine planlint runs, prints the conversion report with its",
      "provenance on stderr and writes the out file — no imported plan ever inherits a consent grant.",
    ],
  },
  {
    id: "recipes",
    label: "List the example gallery and validate one recipe entry",
    keywords: ["recipes", "gallery", "examples", "scraping", "forms", "testing", "monitoring", "agents", "dryrun"],
    usage: "devthink recipes [id] [--dryrun]",
    flags: [
      { flag: "--dryrun", note: "walk the recipe flow through the dry flow driver" },
      { flag: "--format", value: "json", note: "the gallery or the entry as json" },
    ],
    response: [
      "the gallery carries the recipes over the fixture pages in the aligned columns:",
      "id  category  difficulty  fixture  description",
      "run devthink recipes <id> for one entry, with --dryrun to walk its flow.",
    ],
  },
  {
    id: "flowrun",
    label: "Run a plan file",
    keywords: ["flowrun", "run", "plan", "terminal", "consent"],
    usage: "devthink flowrun <plan.json> (--endpoint <url> | --dryrun) [flags]",
    flags: [
      { flag: "--endpoint", value: "<url>", note: "the remote driver the run attaches to" },
      { flag: "--dryrun", note: "the dry flow driver walks the plan without a browser" },
      { flag: "--grants", value: "<file>", note: "the grants file the gate reads" },
      { flag: "--profile", value: "<dir>", note: "the session store profile (default .devthink/profile)" },
      { flag: "--outputdir", value: "<dir>", note: "where the sealed chain and report land" },
    ],
    response: [
      "the flowrun needs a remote endpoint (--endpoint) or the dry run flag (--dryrun);",
      "the cli drives no local browser itself. the run walks the consent gate, streams the",
      "flow events as they happen, seals the log chain beside the report in the output dir",
      "and maps the outcome onto the documented exit code.",
    ],
  },
  {
    id: "runworkflow",
    label: "Run a saved workflow with checkpoints and an audit trail file",
    keywords: ["runworkflow", "workflow", "replay", "checkpoint", "resume", "dryrun"],
    usage: "devthink runworkflow <workflow.json> [--resume <runid>] [--dryrun]",
    flags: [
      { flag: "--resume", value: "<runid>", note: "continue the run from its checkpoint id" },
      { flag: "--dryrun", note: "walk the workflow without executing steps" },
      { flag: "--format", value: "human|json", note: "the outcome summary format" },
    ],
    response: [
      "the workflow run streams one line per completed step (done stepid label (duration ms): summary)",
      "and ends with the run id, the checkpoint cursor, the exit class and the documented exit code;",
      "the audit trail file writes beside the workflow after each run.",
    ],
  },
  {
    id: "exportdata",
    label: "Export session, audit or extraction data",
    keywords: ["exportdata", "export", "session", "audit", "extraction", "csv", "jsonl", "markdown"],
    usage: "devthink exportdata <session|audit|extraction> [flags]",
    flags: [
      { flag: "--input", value: "<dir>", note: "the store the export reads" },
      { flag: "--format", value: "csv|json|jsonl|markdown", note: "the export format (scope defaults)" },
      { flag: "--shapes", value: "<list>", note: "the mask shapes the export applies" },
      { flag: "--out", value: "<file>", note: "the output file (stdout when absent)" },
    ],
    response: [
      "the exportdata writes the masked records of the requested scope in the requested format;",
      "the default mask shapes apply unless --shapes narrows them; the verbose class prints the byte count.",
    ],
  },
  {
    id: "headless",
    label: "Replay a plan against recorded page state fixtures",
    keywords: ["headless", "fixture", "replay", "recorded", "library"],
    usage: "devthink headless <plan.json> [flags]",
    flags: [
      { flag: "--fixtures", value: "<dir>", note: "the recorded fixture directory" },
      { flag: "--grants", value: "<list>", note: "the grants the replay rides" },
      { flag: "--format", value: "json", note: "the outcomes as json" },
    ],
    response: [
      "the headless replay of the plan against the fixture of its origin completed the steps",
      "with the exit class of the outcomes (done, refused or unsupported) and the documented",
      "exit code — no browser was touched.",
    ],
  },
  {
    id: "serve",
    label: "Serve the mcp server mode over stdio and a localhost http listener",
    keywords: ["serve", "mcp", "model", "context", "protocol", "stdio", "http", "jsonrpc"],
    usage: "devthink serve [--transport stdio|http] [--port 7436] [--bind 127.0.0.1]",
    flags: [
      { flag: "--transport", value: "stdio|http", note: "the transports to start (both when absent)" },
      { flag: "--port", value: "<n>", note: "the http listener port (default 7436)" },
      { flag: "--bind", value: "<addr>", note: "the bind address (default 127.0.0.1)" },
      { flag: "--pair-client", value: "true", note: "the client stays paired through the launch flag" },
      { flag: "--mocks", value: "<tools>", note: "the tool mocks the serve registers" },
    ],
    response: [
      "the mcp serve started stdio and http on 127.0.0.1:7436; the client waits for the",
      "pairing approval. every log rides stderr so the stdio wire stays clean.",
      "the shutdown drains every in flight call before the exit.",
    ],
  },
  {
    id: "native",
    label: "Install, remove or diagnose the optional native host of the native bridge",
    keywords: ["native", "host", "bridge", "companion", "install", "uninstall", "diagnostics", "messaging"],
    usage: "devthink native <install|uninstall|diagnostics> [flags]",
    flags: [
      { flag: "--consent", value: "true", note: "the reviewed install scope consent the gate requires" },
      { flag: "--profile", value: "<dir>", note: "the profile directory the manifest writes into" },
      { flag: "--host", value: "<name>", note: "the hostname the manifest declares" },
      { flag: "--extension-id", value: "<id>", note: "the extension origins the manifest allows" },
      { flag: "--companion", value: "<path>", note: "the companion process the manifest launches" },
      { flag: "--platform", value: "linux|macos|windows", note: "the platform of the manifest destination" },
      { flag: "--systemwide", value: "true", note: "the system wide install scope" },
    ],
    response: [
      "the install scope: the companion process the manifest launches, the profile directory",
      "the manifest writes into and the extension origins the manifest allows. pass --consent true",
      "once you reviewed the scope — the consent gate refuses otherwise.",
    ],
  },
  {
    id: "export",
    label: "Export runs, extractions and notes",
    keywords: ["export", "csv", "json", "log", "runs", "extractions", "notes"],
    usage: "devthink export [flags]",
    flags: [
      { flag: "--input", value: "<file>", note: "the input the export reads" },
      { flag: "--shapes", value: "<list>", note: "the mask shapes the export applies" },
      { flag: "--out", value: "<file>", note: "the output file (stdout when absent)" },
    ],
    response: [
      "the export writes the runs, extractions and notes in the requested masked format;",
      "the sealed chain and the secret field shapes stay masked through the default shapes.",
    ],
  },
  {
    id: "init",
    label: "Scaffold a plan file",
    keywords: ["init", "scaffold", "plan", "template"],
    usage: "devthink init <plan.json>",
    flags: [],
    response: [
      "scaffolded the plan file; edit the goal, the origin and the steps,",
      "then run devthink planlint on it.",
    ],
  },
  {
    id: "doctor",
    label: "Probe runtime capabilities",
    keywords: ["doctor", "capabilities", "runtime", "probe", "matrix"],
    usage: "devthink doctor",
    flags: [],
    response: [
      "the doctor answers the capability matrix as json: the version, the runtime, the probes,",
      "the adapter declarations, the platform targets and the capability count.",
    ],
  },
  {
    id: "help",
    label: "List every command with the version banner and the exit codes",
    keywords: ["help", "usage", "commands", "version"],
    usage: "devthink help | devthink --help",
    flags: [],
    response: [],
  },
];

/* ── derived console surfaces — every one computed from the catalog above ── */

/** the aligned help lines of the help command: the banner, the usage, the padded command lines, the global flags and the exit codes. */
export function helplines(version: string): string[] {
  const lines = [versionbanner(version), "usage: devthink <command> [options]"];
  for (const command of catalogcommands) lines.push(`  ${command.id.padEnd(12)} ${command.label}`);
  lines.push(
    `global flags: ${globalflags.map((flag) => `${flag.flag}${flag.value ? ` ${flag.value}` : ""}`).join(", ")} (default .devthink/config.json).`,
  );
  lines.push(`exit codes: ${exitclasses.map((entry) => `${entry.exitclass}=${entry.code}`).join(", ")}.`);
  return lines;
}

/** the registry lines of the commands command: one aligned line per entry exactly like cli.ts cmdcommands prints. */
export function registrylines(): string[] {
  const lines: string[] = [];
  for (const command of catalogcommands) lines.push(`cli  ${command.id}: ${command.label} [terminal]`);
  return lines;
}

/** the response rows of one command: help answers the full banner, every runtime command its documented feedback. */
export function responseof(id: string, version: string): string[] {
  if (id === "help") return helplines(version);
  if (id === "version")
    return [
      versionbanner(version),
      "the package version answers package.json through version.ts — one version, one metadata.",
    ];
  if (id === "commands") return registrylines();
  const command = catalogcommands.find((entry) => entry.id === id);
  if (command === undefined) {
    return [`the command ${id} stays outside the reviewed command surface; run devthink help for the command list.`];
  }
  return command.response;
}

/** the completion list of the terminal: the command ids plus the console built-ins. */
export function completions(prefix: string): string[] {
  const words = ["help", "version", "commands", "clear", ...catalogcommands.map((command) => command.id)];
  const trimmed = prefix.trim().toLowerCase();
  if (trimmed === "") return [];
  return words.filter((word) => word.startsWith(trimmed));
}
