#!/usr/bin/env bun
/**
 * cli — the intelligent scaffolding cli for the @wenathlan/devthink gateway
 * one file one responsibility — only cli commands live here
 * 0 to 100 correlated logics grouped in this one file
 *
 * spring boot intelligent pattern — everything ready out of the box
 * the user answers questions the cli generates the whole project
 *
 * commands:
 *   init                       scaffold web/config.ts prisma schema and env interactively
 *   add <version>              add a new version to the config
 *   list                       list configured versions
 *   show <version>             show one version config
 *   validate                   validate the config for errors
 *   keys <version>             register api keys for a version
 *   models <version>           list models for a version
 *   serve [--port <n>]         start the gateway server
 *   export [--dir <path>]      export the web folder scaffold for vercel netlify
 *   help                       show this help
 *
 * examples:
 *   npx @wenathlan/devthink gateway init
 *   npx @wenathlan/devthink gateway add v6
 *   npx @wenathlan/devthink gateway keys v6
 *   npx @wenathlan/devthink gateway serve --port 3001
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { stdin, stdout } from "node:process";
import { createInterface, type Interface } from "node:readline/promises";

// ---------------------------------------------------------------------------
// arg parsing — zero dependency
// ---------------------------------------------------------------------------

type parsedargs = { flags: Record<string, string | boolean>; positional: string[] };

function parseargs(args: string[]): parsedargs {
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const value = args[i];
    if (!value.startsWith("-")) {
      positional.push(value);
      continue;
    }
    const key = value.replace(/^-+/, "");
    const next = args[i + 1];
    if (next && !next.startsWith("-")) {
      flags[key] = next;
      i += 1;
    } else flags[key] = true;
  }
  return { flags, positional };
}

function stringflag(parsed: parsedargs, key: string): string | undefined {
  const value = parsed.flags[key];
  return typeof value === "string" ? value : undefined;
}

// ---------------------------------------------------------------------------
// version — from package.json or env override
// ---------------------------------------------------------------------------

function version(): string {
  const embedded = process.env.DEVTHINK_VERSION?.trim();
  if (embedded) return embedded;
  // probe both the module directory (source tree) and its parent (the
  // built dist/ layout) so the bundled cli.js resolves the version too
  for (const candidate of ["./package.json", "../package.json"]) {
    try {
      const file = new URL(candidate, import.meta.url);
      return String(
        (JSON.parse(readFileSync(file, "utf8")) as { version?: string }).version || "0.0.0",
      );
    } catch { /* the guarded best-effort operation falls through: the outer flow owns the failure */ }
  }
  return "0.0.0";
}

// ---------------------------------------------------------------------------
// console colors — ansi escape codes
// ---------------------------------------------------------------------------

const colors = stdout.isTTY
  ? {
      cyan: "\u001b[36m",
      green: "\u001b[32m",
      yellow: "\u001b[33m",
      red: "\u001b[31m",
      bold: "\u001b[1m",
      dim: "\u001b[2m",
      reset: "\u001b[0m",
    }
  : {
      cyan: "",
      green: "",
      yellow: "",
      red: "",
      bold: "",
      dim: "",
      reset: "",
    };

// ---------------------------------------------------------------------------
// readline — interactive question helper
// ---------------------------------------------------------------------------

/** the stdin question stream — ONE readline interface serves every question
 * of a command and buffers lines that arrive while no question is pending
 * (sequential question() calls drop piped input: the 'line' events fire
 * with no listener and the answers are lost). interactive typing resolves
 * the pending question directly; piped answers queue; end-of-input answers
 * every remaining question with its default so piped/automation runs
 * complete. main() closes the interface so the process never hangs. */
let sharedrl: Interface | undefined;
const pendinglines: string[] = [];
let lineresolver: ((line: string) => void) | undefined;
let stdineof = false;

function questionstream(): Interface {
  if (sharedrl) return sharedrl;
  sharedrl = createInterface({ input: stdin, output: stdout });
  sharedrl.on("line", (line: string) => {
    if (lineresolver) {
      const resolve = lineresolver;
      lineresolver = undefined;
      resolve(line);
    } else {
      pendinglines.push(line);
    }
  });
  sharedrl.on("close", () => {
    stdineof = true;
    if (lineresolver) {
      const resolve = lineresolver;
      lineresolver = undefined;
      resolve("");
    }
  });
  return sharedrl;
}

async function ask(question: string, defaultanswer = ""): Promise<string> {
  questionstream();
  const suffix = defaultanswer ? ` (${defaultanswer})` : "";
  stdout.write(`${question}${suffix}: `);
  let answer: string;
  if (pendinglines.length > 0) {
    answer = pendinglines.shift() as string;
  } else if (stdineof) {
    answer = "";
  } else {
    answer = await new Promise<string>((resolve) => {
      lineresolver = resolve;
    });
  }
  return answer.trim() || defaultanswer;
}

async function askyesno(question: string, defaultanswer = false): Promise<boolean> {
  const hint = defaultanswer ? "Y/n" : "y/N";
  const answer = await ask(`${question} [${hint}]`);
  if (!answer) return defaultanswer;
  return answer.toLowerCase().startsWith("y");
}

// ---------------------------------------------------------------------------
// config file management
// ---------------------------------------------------------------------------

/** the config search names — .mjs first: it is the only flavor immune to
 * the nearest package.json type field (a plain `npm init -y` consumer has
 * no "type": "module", so node reads an esm-syntax .ts or .js as commonjs
 * and the import dies — the .mjs extension is module-typed by the file
 * name itself and loads everywhere) */
const confignames = [
  "web/config.mjs",
  "web/config.ts",
  "web/config.js",
  "gateway.config.mjs",
  "gateway.config.ts",
  "gateway.config.js",
];

/** config path — the scaffold target: web/config.mjs in cwd */
function configpath(): string {
  return resolve(process.cwd(), "web", "config.mjs");
}

/** find the config file — returns path plus parsed config or null */
async function findconfig(): Promise<{
  path: string;
  config: Record<string, unknown>;
} | null> {
  for (const name of confignames) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path)) continue;
    try {
      const mod = await import(/* @vite-ignore */ path);
      const config = (mod.default ?? mod.config ?? mod) as Record<string, unknown>;
      if (config && typeof config === "object" && "versions" in config) {
        return { path, config };
      }
    } catch {
      // unreadable config flavor — try the next candidate
    }
  }
  return null;
}

/** read the existing config or return null */
async function readconfig(): Promise<Record<string, unknown> | null> {
  return (await findconfig())?.config ?? null;
}

/** generate the config file content from a definition object */
function generateconfigcontent(def: Record<string, unknown>): string {
  return [
    "/**",
    " * web config — user customization layer for the gateway",
    " * generated by the cli — edit freely",
    " * every value here is what you customize",
    " */",
    "",
    `export const config = ${jsontopretty(def)}`,
    "",
    "export default config",
    "",
  ].join("\n");
}

/** json to pretty typescript literal */
function jsontopretty(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  const padinner = "  ".repeat(indent + 1);
  if (value === null || value === undefined) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((v) => `${padinner}${jsontopretty(v, indent + 1)}`);
    return `[\n${items.join(",\n")},\n${pad}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    const lines = entries.map(([k, v]) => `${padinner}${k}: ${jsontopretty(v, indent + 1)}`);
    return `{\n${lines.join(",\n")},\n${pad}}`;
  }
  return JSON.stringify(value);
}

// ---------------------------------------------------------------------------
// schema template — the prisma schema scaffolded for new users
// (prisma 7 style: no url in the schema — the datasource url lives in
// prisma.config.ts, scaffolded below)
// ---------------------------------------------------------------------------

const schematemplate = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
}

model ChatMessage {
  id                String   @id @default(cuid())
  requestid         String?
  sessionid         String?
  route             String?
  provider          String?
  version           String?
  model             String?
  modelvariant      String?
  content           String?
  reasoningcontent  String?
  completion        String?
  prompttokens      Int?
  completiontokens  Int?
  totaltokens       Int?
  stream            Boolean?
  streammode        String?
  endpoint          String?
  twocalls          Boolean?
  thinkingbudget    Int?
  status            String?
  httpstatus        Int?
  error             String?
  rotationindex     Int?
  messagenumber     Int?
  contextshared     Boolean?
  startedat         DateTime? @default(now())
  createdat         DateTime @default(now())

  @@index([sessionid])
  @@index([route])
  @@index([model])
  @@index([provider])
  @@index([status])
  @@index([createdat])
}

model ApiKey {
  id            String    @id @default(cuid())
  keyValue      String    @unique
  label         String?
  active        Boolean   @default(true)
  status        String    @default("active")
  useCount      Int       @default(0)
  errorCount    Int       @default(0)
  lastUsedAt    DateTime?
  lastError     String?
  lastErrorAt   DateTime?
  createdat     DateTime  @default(now())

  @@index([active, status])
}

model NvidiaKey {
  id            String    @id @default(cuid())
  keyValue      String    @unique
  label         String?
  active        Boolean   @default(true)
  status        String    @default("active")
  useCount      Int       @default(0)
  errorCount    Int       @default(0)
  lastUsedAt    DateTime?
  lastError     String?
  lastErrorAt   DateTime?
  createdat     DateTime  @default(now())

  @@index([active, status])
}
`;

// ---------------------------------------------------------------------------
// prisma config template — scaffolded for new users (prisma 7: the
// datasource url lives here, not in the schema; the default matches the
// library runtime fallback so db push and serve share one sqlite)
// ---------------------------------------------------------------------------

const prismaconfigtemplate = `/** prisma config — the datasource url lives here (prisma 7 moved it
 * out of the schema file). the schema is web/schema.prisma; the url comes
 * from GATEWAY_DATABASE_URL or DATABASE_URL, defaulting to the local
 * sqlite at prisma/devthink.db — the same default the gateway library
 * runtime uses, so the pushed database and the serving process agree on
 * one file with zero configuration */

import { existsSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

/** resolve schema path — web/schema.prisma is the standard location */
function resolveschemapath(): string {
  const candidates = [
    path.resolve(process.cwd(), "web", "schema.prisma"),
    path.resolve(process.cwd(), "schema.prisma"),
    path.resolve(process.cwd(), "prisma", "schema.prisma"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return candidates[0];
}

export default defineConfig({
  schema: resolveschemapath(),
  datasource: {
    url:
      process.env.GATEWAY_DATABASE_URL ||
      process.env.DATABASE_URL ||
      "file:./prisma/devthink.db",
  },
});
`;

// ---------------------------------------------------------------------------
// init — scaffold the whole project
// ---------------------------------------------------------------------------

async function cmdinit(): Promise<void> {
  console.log(
    `\n${colors.cyan}${colors.bold}@wenathlan/devthink gateway${colors.reset} v${version()} — init\n`,
  );

  const targetdir = process.cwd();
  const webdir = join(targetdir, "web");

  // create web folder
  if (!existsSync(webdir)) {
    mkdirSync(webdir, { recursive: true });
    console.log(`${colors.green}created${colors.reset} web/`);
  }

  // check existing config — any flavor counts, the scaffold writes .mjs
  const existing = await findconfig();
  if (existing || existsSync(configpath())) {
    const overwrite = await askyesno(
      `config already exists${existing ? ` (${relative(process.cwd(), existing.path)})` : ""} — overwrite?`,
      false,
    );
    if (!overwrite) {
      console.log("keeping existing config");
      return;
    }
  }

  // interactive scaffold — how many versions
  console.log("\nthis scaffolds your gateway configuration");
  console.log(
    "each version gets all 7 routes: chat/completions completions messages responses embeddings keys models\n",
  );

  const versioncountanswer = await ask("how many versions (route groups) do you want", "1");
  const versioncount = Math.max(1, Math.min(20, Number(versioncountanswer) || 1));

  const versions: Record<string, unknown> = {};

  for (let i = 0; i < versioncount; i++) {
    console.log(`\n${colors.bold}--- version ${i + 1} of ${versioncount} ---${colors.reset}`);
    const vconfig = await askversiondetails(i + 1);
    versions[vconfig.id as string] = vconfig;
  }

  const definition = {
    name: await ask("gateway name", "My Gateway"),
    description: await ask("gateway description", "multi provider ai gateway"),
    versions,
  };

  // write config — .mjs loads under every package.json type (a plain
  // npm init -y consumer has no type module: an esm .ts or .js dies there)
  writeFileSync(configpath(), generateconfigcontent(definition));
  console.log(`\n${colors.green}created${colors.reset} web/config.mjs`);

  // write schema
  const schemapath = join(webdir, "schema.prisma");
  writeFileSync(schemapath, schematemplate);
  console.log(`${colors.green}created${colors.reset} web/schema.prisma`);

  // write prisma config — prisma 7 carries the datasource url here (out of
  // the schema file), and the default matches the library runtime fallback
  // so db push and serve agree on one sqlite with zero configuration
  writeFileSync(join(targetdir, "prisma.config.ts"), prismaconfigtemplate);
  console.log(`${colors.green}created${colors.reset} prisma.config.ts`);

  // write env example
  const envpath = join(targetdir, ".env.example");
  const envlines: string[] = [
    "# gateway environment",
    "# database url — libsql http postgres or file",
    "# GATEWAY_DATABASE_URL=file:./prisma/devthink.db",
    "",
  ];
  for (const [id, v] of Object.entries(versions)) {
    const auth = (v as Record<string, unknown>).auth as Record<string, unknown> | undefined;
    if (auth?.envvar) {
      envlines.push(`# ${id} api key`);
      envlines.push(`${auth.envvar}=`);
      envlines.push("");
    }
  }
  writeFileSync(envpath, envlines.join("\n"));
  console.log(`${colors.green}created${colors.reset} .env.example`);

  console.log(`\n${colors.green}${colors.bold}done${colors.reset} — next steps:`);
  console.log("  1. edit web/config.mjs to tune your configuration");
  console.log("  2. register keys:      npx @wenathlan/devthink gateway keys <version>");
  console.log("  3. install prisma:     npm i -D prisma");
  console.log("  4. push + generate:    npx prisma db push && npx prisma generate");
  console.log("  5. start the server:   npx @wenathlan/devthink gateway serve");
  console.log("");
}

// ---------------------------------------------------------------------------
// askversiondetails — interactive version builder
// ---------------------------------------------------------------------------

async function askversiondetails(index: number): Promise<Record<string, unknown>> {
  const id = await ask(`version id (path prefix)`, `v${index}`);
  const providername = await ask("provider name (zai nvidia openai openrouter custom)", "custom");
  const baseurl = await ask("upstream base url", "https://gateway.example/v1");

  // auth
  console.log(
    "\nauth methods: bearer apikeyheader queryparam basic oauth2clientcredentials jwtsign sigv4 anonymous keylesssdk none",
  );
  const authmode = await ask("auth method", "bearer");
  const needskey = ["bearer", "apikeyheader", "queryparam", "basic"].includes(authmode);
  const auth: Record<string, unknown> = { mode: authmode };
  if (needskey) {
    auth.required = await askyesno("is the api key required?", true);
    const envvar = await ask(
      "env var name for the key",
      `${providername.toUpperCase().replace(/[^A-Z]/g, "_")}_API_KEY`,
    );
    auth.envvar = envvar;
    const usedb = await askyesno("store keys in the database (rotation)?", false);
    auth.keysources = usedb ? ["db", "env"] : ["env"];
    if (usedb) auth.dbmodel = await ask("prisma key model name", "apiKey");
  }

  // models
  const modelcountanswer = await ask("how many models", "2");
  const modelcount = Math.max(1, Number(modelcountanswer) || 2);
  const models: Array<Record<string, unknown>> = [];
  for (let m = 0; m < modelcount; m++) {
    console.log(`\nmodel ${m + 1} of ${modelcount}`);
    const mid = await ask("model id", m === 0 ? "default-model" : `model-${m + 1}`);
    const context = Number(await ask("context window", "131072"));
    const maxoutput = Number(await ask("max output tokens", "32768"));
    models.push({ id: mid, context, maxoutput, free: true });
  }

  // rotation
  const userotation = await askyesno("\nrotate models (meta model pattern)?", modelcount > 1);
  let rotation: Record<string, unknown> | undefined;
  if (userotation) {
    rotation = {
      mode: await ask("rotation mode (persession perrequest)", "persession"),
      models: models.map((m) => m.id),
      everynmessages: Number(await ask("rotate every n messages", "6")),
      maxmodelrotations: Number(await ask("max model rotations per request", "4")),
      rotateonstatus: [529, 404, 410],
      rotateontimeout: true,
    };
  }

  // retry
  const useretry = await askyesno("\nenable retry with backoff?", true);
  let retry: Record<string, unknown> | undefined;
  if (useretry) {
    retry = {
      maxretries: Number(await ask("max retries", "3")),
      backoffbasems: Number(await ask("backoff base ms", "400")),
      backoffcapms: Number(await ask("backoff cap ms", "8000")),
      jitter: 0.2,
      statuses: [429, 502, 503, 504],
      nonretryable: [400],
    };
  }

  // context
  const usecontext = await askyesno("\nshare context across sessions (db history)?", false);
  const context: Record<string, unknown> | undefined = usecontext
    ? {
        restoresessionhistory: true,
        historylimit: 1000,
        truncatemargin: 4096,
        percallfallback: 1048576,
      }
    : undefined;

  // meta model
  const metaid = await ask("\nmeta model id (the rotation facade)", "devthink");

  return {
    id,
    providername,
    upstreams: [{ name: providername, baseurl }],
    auth,
    models,
    defaultmodel: rotation ? metaid : models[0].id,
    ...(rotation ? { rotation } : {}),
    ...(retry ? { retry } : {}),
    ...(context ? { context } : {}),
    timeout: { requestms: 300000, streamms: 2147483647 },
    thinking: { defaultlevel: "high" },
    bodybuild: { optionalparamspolicy: "omit-unspecified", clampmaxtokens: true },
    metamodel: {
      id: metaid,
      fallbackcontext: 1048576,
      maxoutput: 32768,
      maskupstreammodel: true,
      alwaysdisplay: true,
    },
    headers: { useragent: `Gateway/${id}` },
  };
}

// ---------------------------------------------------------------------------
// add — add a new version to the existing config
// ---------------------------------------------------------------------------

async function cmdadd(_versionarg: string | undefined): Promise<void> {
  const existing = await findconfig();
  if (!existing) {
    console.log(`${colors.red}no config found${colors.reset} — run init first`);
    process.exit(1);
  }
  const nextindex =
    Object.keys((existing.config.versions as Record<string, unknown>) ?? {}).length + 1;
  console.log(`\n${colors.cyan}${colors.bold}add version${colors.reset}\n`);
  const vconfig = await askversiondetails(nextindex);
  const versions = (existing.config.versions as Record<string, unknown>) ?? {};
  versions[vconfig.id as string] = vconfig;
  existing.config.versions = versions;
  writeFileSync(existing.path, generateconfigcontent(existing.config));
  console.log(
    `\n${colors.green}added${colors.reset} version ${vconfig.id} to ${relative(process.cwd(), existing.path)}`,
  );
}

// ---------------------------------------------------------------------------
// list — show configured versions
// ---------------------------------------------------------------------------

async function cmdlist(): Promise<void> {
  const config = await readconfig();
  if (!config) {
    console.log(`${colors.red}no config found${colors.reset} — run init first`);
    process.exit(1);
  }
  const versions = (config.versions as Record<string, Record<string, unknown>>) ?? {};
  console.log(
    `\n${colors.bold}${config.name ?? "gateway"}${colors.reset} — ${Object.keys(versions).length} versions\n`,
  );
  for (const [id, v] of Object.entries(versions)) {
    const models = (v.models as unknown[])?.length ?? 0;
    const auth = v.auth as Record<string, unknown> | undefined;
    const rotation = v.rotation as Record<string, unknown> | undefined;
    console.log(`  ${colors.cyan}${id}${colors.reset}`);
    console.log(
      `    provider: ${v.providername ?? "?"}  upstream: ${(v.upstreams as Array<Record<string, unknown>>)?.[0]?.baseurl ?? "?"}`,
    );
    console.log(
      `    models: ${models}  auth: ${auth?.mode ?? "?"}  rotation: ${rotation?.mode ?? "none"}`,
    );
  }
  console.log("");
}

// ---------------------------------------------------------------------------
// show — show one version detail
// ---------------------------------------------------------------------------

async function cmdshow(versionarg: string | undefined): Promise<void> {
  if (!versionarg) {
    console.log("usage: gateway show <version>");
    process.exit(1);
  }
  const config = await readconfig();
  const versions = (config?.versions as Record<string, unknown>) ?? {};
  const v = versions[versionarg];
  if (!v) {
    console.log(`${colors.red}version ${versionarg} not found${colors.reset}`);
    process.exit(1);
  }
  console.log(jsontopretty(v));
}

// ---------------------------------------------------------------------------
// validate — check the config
// ---------------------------------------------------------------------------

async function cmdvalidate(): Promise<void> {
  const config = await readconfig();
  if (!config) {
    console.log(`${colors.red}no config found${colors.reset} — run init first`);
    process.exit(1);
  }
  const versions = (config.versions as Record<string, Record<string, unknown>>) ?? {};
  const problems: string[] = [];
  if (Object.keys(versions).length === 0) problems.push("no versions defined");
  for (const [id, v] of Object.entries(versions)) {
    if (!v.providername) problems.push(`version ${id}: missing providername`);
    if (!v.upstreams) problems.push(`version ${id}: missing upstreams`);
    if (!v.auth) problems.push(`version ${id}: missing auth`);
    if (!v.models || (v.models as unknown[]).length === 0)
      problems.push(`version ${id}: no models`);
    if (!v.metamodel) problems.push(`version ${id}: missing metamodel`);
  }
  if (problems.length === 0) {
    console.log(
      `${colors.green}config is valid${colors.reset} — ${Object.keys(versions).length} versions`,
    );
  } else {
    console.log(`${colors.yellow}problems found${colors.reset}:`);
    for (const p of problems) console.log(`  - ${p}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// keys — register api keys
// ---------------------------------------------------------------------------

async function cmdkeys(versionarg: string | undefined): Promise<void> {
  if (!versionarg) {
    console.log("usage: gateway keys <version>");
    process.exit(1);
  }
  const config = await readconfig();
  const versions = (config?.versions as Record<string, Record<string, unknown>>) ?? {};
  const v = versions[versionarg];
  if (!v) {
    console.log(`${colors.red}version ${versionarg} not found${colors.reset}`);
    process.exit(1);
  }
  const auth = v.auth as Record<string, unknown>;
  const envvar = auth?.envvar as string | undefined;
  const dbmodel = auth?.dbmodel as string | undefined;

  console.log(`\n${colors.bold}register keys for ${versionarg}${colors.reset}`);
  console.log(`auth mode: ${auth?.mode ?? "?"}`);

  if (envvar) {
    console.log(`\nset keys via environment variable:`);
    console.log(`  export ${envvar}=key1,key2,key3  (comma separated for rotation)`);
  }

  if (dbmodel) {
    console.log(`\nregister keys in the database (rotation with round robin):`);
    const keycountanswer = await ask("how many keys to register now", "0");
    const keycount = Number(keycountanswer) || 0;
    if (keycount > 0) {
      const keys: string[] = [];
      for (let i = 0; i < keycount; i++) {
        const key = await ask(`key ${i + 1}`);
        if (key) keys.push(key);
      }
      // write to a seed script the user can run
      const seedpath = resolve(process.cwd(), "tests", "seedkeys.mjs");
      const seedcontent = [
        "/** seed keys — generated by gateway cli */",
        'import { PrismaClient } from "@prisma/client"',
        "",
        `const keys = ${JSON.stringify(keys, null, 2)}`,
        "",
        "const db = new PrismaClient()",
        "",
        `for (const [idx, key] of keys.entries()) {`,
        `  await db.${dbmodel}.upsert({`,
        "    where: { keyValue: key },",
        '    update: { active: true, status: "active" },',
        `    create: { keyValue: key, label: \`key-\${idx}\`, active: true, status: "active" },`,
        "  })",
        "}",
        "",
        "await db.$disconnect()",
        `console.log(\`registered \${keys.length} keys\`)`,
        "",
      ].join("\n");
      mkdirSync(resolve(process.cwd(), "tests"), { recursive: true });
      writeFileSync(seedpath, seedcontent);
      console.log(
        `\n${colors.green}created${colors.reset} tests/seedkeys.mjs — run: node tests/seedkeys.mjs`,
      );
    }
  }
  console.log("");
}

// ---------------------------------------------------------------------------
// models — list models for a version
// ---------------------------------------------------------------------------

async function cmdmodels(versionarg: string | undefined): Promise<void> {
  if (!versionarg) {
    console.log("usage: gateway models <version>");
    process.exit(1);
  }
  const config = await readconfig();
  const versions = (config?.versions as Record<string, Record<string, unknown>>) ?? {};
  const v = versions[versionarg];
  if (!v) {
    console.log(`${colors.red}version ${versionarg} not found${colors.reset}`);
    process.exit(1);
  }
  const models = (v.models as Array<Record<string, unknown>>) ?? [];
  console.log(`\n${colors.bold}models for ${versionarg}${colors.reset}\n`);
  for (const m of models) {
    console.log(
      `  ${colors.cyan}${m.id}${colors.reset}  ctx=${m.context}  out=${m.maxoutput}${m.vision ? "  vision" : ""}${m.reasoning ? "  reasoning" : ""}`,
    );
  }
  const rotation = v.rotation as Record<string, unknown> | undefined;
  if (rotation?.models) {
    console.log(`\n${colors.bold}rotation pool${colors.reset}: ${JSON.stringify(rotation.models)}`);
  }
  console.log("");
}

// ---------------------------------------------------------------------------
// serve — start the server
// ---------------------------------------------------------------------------

async function cmdserve(portarg: string | undefined): Promise<void> {
  const port = Number(portarg) || Number(process.env.PORT) || 3001;
  process.env.PORT = String(port);
  console.log(`${colors.cyan}starting gateway on port ${port}${colors.reset}`);
  const httpmod = await import("./gateway-http.js");
  const runserver = httpmod.runserver;
  await runserver();
}

// ---------------------------------------------------------------------------
// export — export the web scaffold
// ---------------------------------------------------------------------------

async function cmdexport(dirarg: string | undefined): Promise<void> {
  const target = resolve(process.cwd(), dirarg ?? "export");
  mkdirSync(target, { recursive: true });
  const found = await findconfig();
  if (found) {
    const name = basename(found.path);
    writeFileSync(join(target, name), readFileSync(found.path, "utf8"));
    console.log(`${colors.green}exported${colors.reset} ${name}`);
  }
  const schemapath = resolve(process.cwd(), "web", "schema.prisma");
  if (existsSync(schemapath)) {
    writeFileSync(join(target, "schema.prisma"), readFileSync(schemapath, "utf8"));
    console.log(`${colors.green}exported${colors.reset} schema.prisma`);
  }
  console.log(`\nexported to ${target} — deploy this folder to vercel or netlify`);
}

// ---------------------------------------------------------------------------
// help
// ---------------------------------------------------------------------------

function printhelp(): void {
  console.log(
    [
      `${colors.cyan}${colors.bold}@wenathlan/devthink gateway${colors.reset} v${version()}`,
      "",
      "the universal ai gateway library — any llm any baseurl any api key",
      "",
      "Usage: devthink gateway <command> [options]",
      "",
      "Commands:",
      "  init                       scaffold web/config.mjs schema and env interactively",
      "  add                        add a new version to the config",
      "  list                       list configured versions",
      "  show <version>             show one version config",
      "  validate                   validate the config for errors",
      "  keys <version>             register api keys for a version",
      "  models <version>           list models for a version",
      "  serve [--port <n>]         start the gateway server",
      "  export [--dir <path>]      export the web folder scaffold",
      "  help                       show this help",
      "",
      "Library usage:",
      '  import { createversion, loadconfig } from "@wenathlan/devthink"',
      "",
      "Documentation: https://github.com/wenathlan/devthink",
      "",
    ].join("\n"),
  );
}

// ---------------------------------------------------------------------------
// main — dispatch commands
// ---------------------------------------------------------------------------

/**
 * Family entry of the grand merge: the single devthink binary routes the
 * extension command family here (`devthink ext <command>`); the argv is
 * spliced into the process position the original entry reading expects,
 * the family main runs untouched and the caller argv is restored.
 *
 * @param argv the family arguments (without the family prefix).
 */
export async function runclifamily(argv: string[]): Promise<void> {
  const saved = process.argv.slice();
  process.argv = [saved[0], saved[1], ...argv];
  try {
    await main();
  } finally {
    process.argv = saved;
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const parsed = parseargs(args);
  const command = parsed.positional[0];

  try {
    switch (command) {
      case "init":
        await cmdinit();
        break;
      case "add":
        await cmdadd(parsed.positional[1]);
        break;
      case "list":
        await cmdlist();
        break;
      case "show":
        await cmdshow(parsed.positional[1]);
        break;
      case "validate":
        await cmdvalidate();
        break;
      case "keys":
        await cmdkeys(parsed.positional[1]);
        break;
      case "models":
        await cmdmodels(parsed.positional[1]);
        break;
      case "serve":
        await cmdserve(stringflag(parsed, "port"));
        break;
      case "export":
        await cmdexport(stringflag(parsed, "dir"));
        break;
      case "help":
      case "--help":
      case "-h":
      case undefined:
        printhelp();
        break;
      default:
        console.log(`${colors.red}unknown command${colors.reset}: ${command}`);
        printhelp();
        process.exit(1);
    }
  } catch (err) {
    console.error(
      `${colors.red}error${colors.reset}: ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exit(1);
  } finally {
    /** release the shared stdin handle so the process exits cleanly */
    sharedrl?.close();
  }
}

/* the grand-merge guard: when this module is imported as a family surface by
   the devthink router (dynamic import), the module-load main must not fire —
   only a direct `bun gateway-cli.ts` (or bun entry) run executes it. */
const cliDirectEntry = process.argv[1]?.endsWith("gateway-cli.ts") || process.argv[1]?.endsWith("gateway-cli");
const cliBunEntry = (import.meta as ImportMeta & { main?: boolean }).main === true;
if (cliDirectEntry || cliBunEntry) void main();
