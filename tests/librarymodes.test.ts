import { afterAll, describe, expect, it } from "vitest";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { access, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import { promisify } from "node:util";
import { build } from "esbuild";
import { stripstrings, underscorednames } from "./bundlescan.mjs";
import { umdwrap } from "./umdwrap.mjs";
import { matrixverify, matrixtargetof, platformtargets, targetoutput } from "../runtime.js";
import { clicommands, surfacepalette } from "../views.js";
import { browserplatformadapter, defaultclock, denoplatformadapter, detectadapterruntime, loggeradapterof, nodeplatformadapter, platformadapterof, setsharedadapter, sharedadapter } from "../runtime.js";
import { denoconfigread } from "../deno.js";
import { memorystorageadapter } from "../runtime.js";
import { sessionmemory } from "../memory.js";
import { progressnow, recordoutcomewithclock } from "../progress.js";
import { parseheadlessfixture, resolvefixture } from "../cli.js";
import * as policymodule from "../policy.js";
import * as protocolmodule from "../protocol.js";
import * as memorymodule from "../memory.js";
import * as progressmodule from "../progress.js";
import type { stepoutcome } from "../types.js";

const execute = promisify(execFile);
const require = createRequire(import.meta.url);
const outbase = await mkdtemp(join(tmpdir(), "devthink-library-"));

/** Resolves the repo-local tsc binary the declaration pass rides: the merged repo carries typescript as its own devdependency, so the emission needs no package-manager exec indirection (pnpm exec retired with the merge — the same resolution tests/build.mjs uses). */
function resolvetsc(): string {
  const self = require.resolve("typescript/package.json");
  return join(dirname(self), "bin", "tsc");
}

/** Builds one entry of the matrix into the temp directory with the format and platform its target declares; the umd format wraps its cjs core in the umd envelope the build ships. */
async function buildtarget(entry: string, format: "esm" | "cjs" | "umd", platform: "browser" | "node" | "neutral", output: string): Promise<string> {
  if (format === "umd") {
    const core = output.replace(/\.js$/, ".core.cjs");
    await build({ entryPoints: [entry], outfile: core, bundle: true, format: "cjs", platform, target: platform === "browser" ? "chrome120" : "es2022", sourcemap: false });
    const body = await readFile(core, "utf8");
    await writeFile(output, umdwrap(body, "devthink"), "utf8");
    await rm(core, { force: true });
    return output;
  }
  await build({ entryPoints: [entry], outfile: output, bundle: true, format, platform, target: platform === "browser" ? "chrome120" : platform === "node" ? "node22" : "es2022", sourcemap: true });
  return output;
}

describe("the library on every runtime", () => {
  /* the bundle builds answer the slowest runners and the emulated container legs with the env-scaled ceiling the vitest config reads, because one esbuild pass over the whole matrix legitimately runs past the five second default on a two vcpu runner (the 2.0.10 container leg proved a sixteen millisecond overrun fails a green test) */
  it("builds and loads the esm core in node with tree shakable exports", { timeout: Number(process.env.DEVTHINK_TEST_TIMEOUT_MS ?? 60000) }, async () => {
    const output = await buildtarget("index.ts", "esm", "neutral", join(outbase, "index.mjs"));
    const loaded = await import(output);
    expect(typeof loaded.surfacepalette).toBe("function");
    expect(typeof loaded.portablerulesetof).toBe("function");
    expect(loaded.platformtargets()).toHaveLength(4);
    const content = await readFile(output, "utf8");
    expect(content).toContain("export");
  });

  it("builds and loads the cjs core in node for require based consumers", async () => {
    const output = await buildtarget("index.ts", "cjs", "node", join(outbase, "index.cjs"));
    const loaded = require(output) as Record<string, unknown>;
    expect(typeof loaded.surfacepalette).toBe("function");
    expect(typeof loaded.runflow).toBe("function");
    expect(typeof loaded.exportrecords).toBe("function");
  });

  it("builds every platform target of the matrix in one run and loads each bundle", { timeout: Number(process.env.DEVTHINK_TEST_TIMEOUT_MS ?? 120000) }, async () => {
    const present: string[] = [];
    for (const target of platformtargets()) {
      const output = await buildtarget(target.entry, target.format, target.platform, join(outbase, targetoutput(target)));
      present.push(target.entry);
      const content = await readFile(output, "utf8");
      expect(content.length).toBeGreaterThan(0);
      if (target.format === "esm") {
        const loaded = await import(output);
        expect(typeof loaded.surfacepalette).toBe("function");
      } else {
        const loaded = require(output) as Record<string, unknown>;
        const expected = matrixtargetof(platformtargets(), target.runtime).runtime === "node" ? "nodeadapter" : "surfacepalette";
        expect(typeof loaded[expected]).toBe("function");
      }
    }
    expect(matrixverify({ targets: platformtargets(), present }).complete).toBe(true);
  });

  it("keeps the deno entry free of node shims and loads it as neutral esm", async () => {
    const output = await buildtarget("deno.ts", "esm", "neutral", join(outbase, "deno-check.mjs"));
    const content = await readFile(output, "utf8");
    expect(content).not.toMatch(/from\s*["']node:/);
    expect(content).not.toMatch(/require\(\s*["']node:/);
    const loaded = await import(output);
    expect(typeof loaded.denoadapter).toBe("function");
    const deno = await execute("deno", ["--version"]).catch(() => undefined);
    if (deno === undefined) return; /* the deno binary stays optional in the local matrix; the neutral bundle above still proves the entry */
    await writeFile(join(outbase, "deno-entry.test.ts"), 'import { surfacepalette } from "./deno-check.mjs";\nDeno.test("loads the deno entry", () => { if (surfacepalette().length === 0) throw new Error("The deno entry loaded an empty palette."); });\n', "utf8");
    await execute("deno", ["test", "--allow-read", "deno-entry.test.ts"], { cwd: outbase });
  });

  it("runs the bun entry under bun test", async () => {
    const bunversion = await execute("bun", ["--version"]).catch(() => undefined);
    if (bunversion === undefined) return; /* the bun binary stays optional in the local matrix */
    const output = await buildtarget("bun.ts", "esm", "node", join(outbase, "bun-entry.mjs"));
    await writeFile(join(outbase, "bun-entry.test.ts"), `import { expect, test } from "bun:test";\nimport * as library from "${output}";\ntest("loads the bun entry", () => { expect(typeof library.bunadapter).toBe("function"); expect(typeof library.surfacepalette).toBe("function"); });\n`, "utf8");
    const result = await execute("bun", ["test", join(outbase, "bun-entry.test.ts")]);
    expect(`${result.stdout}${result.stderr}`).toContain("1 pass");
  });

  it("emits declaration files for every entry point of the matrix", async () => {
    const outdir = await mkdtemp(join(tmpdir(), "devthink-types-"));
    await execute(resolvetsc(), ["-p", "tsconfig.build.json", "--outDir", outdir]);
    for (const entry of ["index", "umd", "node", "bun", "deno", "plan", "flow", "export", "headless", "cli", "agent", "auth", "http", "gateway", "page", "memory", "mcp", "runtime"]) {
      const declaration = await readFile(join(outdir, `${entry}.d.ts`), "utf8");
      expect(declaration.length).toBeGreaterThan(0);
    }
    await rm(outdir, { recursive: true, force: true });
  }, 120_000);

  it("shares the command registry between the cli and the commandpalette definitions", () => {
    const palette = surfacepalette();
    const registry = clicommands(palette);
    const terminal = registry.filter(command => command.terminal);
    const shared = registry.filter(command => !command.terminal);
    expect(terminal.map(command => command.id)).toEqual(["manifest", "describe", "commands", "planlint", "migrateplan", "recipes", "flowrun", "runworkflow", "exportdata", "headless", "serve", "native", "export", "init", "doctor", "help"]);
    expect(shared).toHaveLength(palette.length);
    for (const entry of palette) {
      const command = shared.find(item => item.id === entry.id);
      expect(command?.label).toBe(entry.label);
      expect(command?.keywords).toEqual(entry.keywords);
    }
  });
});

/** Builds one consumption mode bundle once for the whole mode suite: the cached build lets every mode test read one bundle instead of rebuilding per assertion. */
const modecache = new Map<string, Promise<string>>();
async function modebundle(key: string, buildit: () => Promise<string>): Promise<string> {
  const cached = modecache.get(key);
  if (cached !== undefined) return cached;
  const built = buildit();
  modecache.set(key, built);
  return built;
}

/** Reads the sorted export names of one mode bundle: an esm or neutral bundle answers through import and a cjs bundle answers through require. */
async function modekeys(output: string): Promise<string[]> {
  if (output.endsWith(".cjs")) return Object.keys(require(output) as Record<string, unknown>).sort();
  return Object.keys(await import(output)).sort();
}

/** Runs one umd bundle source against a sandbox global and answers the sandbox, so the global surface and the deprecation shim verify without a browser. */
function umdglobal(source: string): Record<string, unknown> {
  const sandbox: Record<string, unknown> = {};
  sandbox.self = sandbox;
  new Function("self", source)(sandbox);
  return sandbox;
}

describe("the library modes of 1.1.81", () => {
  it("freezes the public api surface across the esm, cjs and umd modes", async () => {
    const esm = await modekeys(await modebundle("esm", () => buildtarget("index.ts", "esm", "neutral", join(outbase, "mode-index.mjs"))));
    const cjs = await modekeys(await modebundle("cjs", () => buildtarget("cjs.ts", "cjs", "node", join(outbase, "mode-index.cjs"))));
    expect(cjs).toEqual(esm);
    const umdsource = await readFile(await modebundle("umd", () => buildtarget("umd.ts", "umd", "browser", join(outbase, "mode-devthink.umd.js"))), "utf8");
    const globalkeys = Object.keys(umdglobal(umdsource).devthink as Record<string, unknown>).sort();
    expect(globalkeys).toEqual(esm);
    expect(esm.length).toBeGreaterThan(1000);
    const probes: Array<[string, string, Record<string, unknown>]> = [["policy", "canexecute", policymodule], ["protocol", "parseproposal", protocolmodule], ["memory", "sessionmemory", memorymodule], ["progress", "recordstep", progressmodule]];
    for (const [modulename, probe, source] of probes) {
      const output = await modebundle(`module-${modulename}`, () => buildtarget(`${modulename}.ts`, "esm", "neutral", join(outbase, `mode-${modulename}.mjs`)));
      const loaded = await import(output);
      expect(typeof loaded[probe]).toBe("function");
      expect(Object.keys(loaded).sort()).toEqual(Object.keys(source).sort());
      expect(Object.keys(loaded).length).toBeGreaterThan(1);
    }
  });

  it("keeps the shared adapter registry consistent across the esm and cjs modes of one process", async () => {
    const esm = await import(await modebundle("esm", () => buildtarget("index.ts", "esm", "neutral", join(outbase, "mode-index.mjs"))));
    const cjs = require(await modebundle("cjs", () => buildtarget("cjs.ts", "cjs", "node", join(outbase, "mode-index.cjs")))) as typeof esm;
    expect(esm.bundlestamp().mode).toBe("esm");
    expect(cjs.bundlestamp().mode).toBe("cjs");
    expect(cjs.bundlestamp().version).toBe(esm.bundlestamp().version);
    expect(cjs.bundlestamp().target).toBe("index.cjs");
    esm.setsharedadapter(esm.platformadapterof({ runtime: "node", storage: esm.memorystorageadapter() }));
    const throughcjs = cjs.sharedadapter();
    expect(throughcjs?.runtime).toBe("node");
    expect(throughcjs?.mode).toBe("cjs");
    await throughcjs?.storage.set("sharedstate", { written: "esm" });
    expect(await esm.sharedadapter()?.storage.get("sharedstate")).toEqual({ written: "esm" });
    expect(await cjs.sharedadapter()?.storage.get("sharedstate")).toEqual({ written: "esm" });
  });

  it("exposes the window.devthink global with the consent gates intact and the sunset removed the deprecated uppercase shim", async () => {
    const umdsource = await readFile(await modebundle("umd", () => buildtarget("umd.ts", "umd", "browser", join(outbase, "mode-devthink.umd.js"))), "utf8");
    const notices: string[] = [];
    const originalwarn = console.warn;
    console.warn = ((line: string) => { notices.push(line); }) as typeof console.warn;
    try {
      const sandbox = umdglobal(umdsource);
      const globalobject = sandbox.devthink as Record<string, unknown>;
      expect(typeof globalobject.surfacepalette).toBe("function");
      expect(typeof globalobject.canexecute).toBe("function");
      expect(typeof globalobject.planlint).toBe("function");
      expect(typeof globalobject.cookiegate).toBe("function");
      expect(typeof globalobject.openheadlesssession).toBe("function");
      expect((globalobject.bundlestamp as () => { mode: string })().mode).toBe("umd");
      expect(sandbox.devthink).toBe(globalobject);
      /* the 2.0.0 sunset removed the deprecated uppercase global the deprecation window carried: the envelope declares the lowercase surface only and no deprecation notice fires anywhere */
      expect((sandbox as Record<string, unknown>).Devthink).toBeUndefined();
      expect(notices).toHaveLength(0);
    } finally {
      console.warn = originalwarn;
    }
  });

  it("covers the node, browser and deno default adapters behind the platform seam", async () => {
    const files = new Map<string, string>();
    const node = nodeplatformadapter({
      profiledir: "profiles",
      fs: {
        readfile: async path => { if (!files.has(path)) throw new Error(`No file at ${path}.`); return files.get(path) as string; },
        writefile: async (path, data) => { files.set(path, data); },
        mkdir: async () => undefined,
        join: (...parts) => parts.join("/")
      }
    });
    expect(node.mode).toBe("cjs");
    expect(node.declaration.storage).toBe("filesystem");
    expect(node.probes.dom).toBe(false);
    await node.storage.set("plan", { goal: "read" });
    expect(await node.storage.get<{ goal: string }>("plan")).toEqual({ goal: "read" });

    const area = new Map<string, unknown>();
    const browser = browserplatformadapter({ area: { get: async key => area.get(key), set: async (key, value) => { area.set(key, value); } } });
    expect(browser.mode).toBe("umd");
    expect(browser.declaration.storage).toBe("chrome");
    expect(browser.probes.dom).toBe(true);
    await browser.storage.set("session", { state: "active" });
    expect(area.get("session")).toEqual({ state: "active" });
    const fallback = browserplatformadapter();
    await fallback.storage.set("key", "value");
    expect(await fallback.storage.get("key")).toBe("value");

    const kv = new Map<string, unknown>();
    const deno = denoplatformadapter({ kv: { get: async (key: string) => kv.get(key), set: async (key: string, value: unknown) => { kv.set(key, value); } } as never });
    expect(deno.declaration.storage).toBe("denokv");
    await deno.storage.set("kv", 1);
    expect(kv.get("kv")).toBe(1);

    expect(typeof defaultclock().now()).toBe("number");
    const lines: string[] = [];
    const sink = loggeradapterof({ log: line => lines.push(`log:${line}`), warn: line => lines.push(`warn:${line}`), error: line => lines.push(`error:${line}`) });
    sink.log("a");
    sink.warn("b");
    sink.error("c");
    expect(lines).toEqual(["log:a", "warn:b", "error:c"]);
    expect(detectadapterruntime()).toBe("node");

    const memory = new sessionmemory(memorystorageadapter());
    await memory.setplan({} as never);
    expect(await memory.getplan()).toEqual({});
    const clock = { now: () => 1_000, schedule: () => 0 };
    expect(progressnow(clock)).toBe(1_000);
    const outcome: stepoutcome = { stepid: "observe", ok: true, summary: "observed", at: 1_000 } as stepoutcome;
    const stepped = recordoutcomewithclock(undefined, "plan", outcome, clock);
    expect(stepped.updatedat).toBe(1_000);
    expect(stepped.outcomes).toHaveLength(1);

    const fixturefile = JSON.parse(await readFile("tests/code/example-org-pagestate.json", "utf8")) as unknown;
    const fixture = parseheadlessfixture(fixturefile);
    expect(resolvefixture([fixture], fixture.origin)).toBe(fixture);
    if (!existsSync("deno.json")) return; /* the deno runtime config rides the deno lane of the matrix: the adapter seam above proves the deno platform adapter without it, and the exports pass below carries the config contract once the deno.json restoration lands */
    const config = await denoconfigread(async () => await readFile("deno.json", "utf8"));
    expect(config.imports).toBeDefined();
    expect(config.tasks).toBeDefined();
  });

  it("resolves every exports condition, selects the neutral target under the browser condition and keeps the engines in sync", async () => {
    const packagejson = JSON.parse(await readFile("package.json", "utf8")) as { version: string; sideEffects?: boolean; publishConfig?: { registry?: string }; engines: Record<string, string>; exports: Record<string, Record<string, string>> };
    const root = packagejson.exports["."];
    if (root === undefined) throw new Error("The package exports map carries no root entry.");
    expect(Object.keys(root)).toEqual(["types", "browser", "import", "require", "default"]);
    expect(root.browser).toBe("./dist/index.neutral.js");
    expect(root.import).toBe("./dist/index.js");
    expect(root.require).toBe("./dist/index.cjs");
    for (const entry of ["./policy", "./protocol", "./memory", "./progress", "./cli", "./umd", "./node", "./bun", "./deno", "./headless"]) {
      if (packagejson.exports[entry] === undefined) throw new Error(`The package exports map lacks the ${entry} entry.`);
    }
    expect(packagejson.exports["./umd"]?.default).toBe("./dist/devthink.umd.js");
    expect(packagejson.exports["./policy"]?.import).toBe("./dist/policy.js");
    expect(packagejson.exports["./progress"]?.import).toBe("./dist/progress.js");
    expect(packagejson.exports["./cli"]?.import).toBe("./dist/cli.js");
    expect(packagejson.sideEffects).toBe(false);
    expect(packagejson.publishConfig?.registry).toBe("https://registry.npmjs.org/");
    const nvmversion = (await readFile(".nvmrc", "utf8")).trim();
    expect(packagejson.engines.node).toContain(nvmversion);
    const verifyworkflow = await readFile(".github/workflows/verify.yml", "utf8");
    const bunminimum = (packagejson.engines.bun ?? "").match(/>=([\d.]+)/)?.[1];
    expect(verifyworkflow).toContain(`bun-version: ${bunminimum}`);
    expect(verifyworkflow).toContain("denoland/setup-deno");
    const denojson = JSON.parse(await readFile("deno.json", "utf8")) as { imports: Record<string, string>; tasks: Record<string, string> };
    expect(denojson.imports["@wenathlan/devthink"]).toBe(`npm:@wenathlan/devthink@${packagejson.version}`);
    expect(denojson.tasks.check).toContain("dist/deno.js");
    if (!existsSync("dist/checksums.txt")) return; /* the validate chain runs the tests before the build; the file existence pass runs on the next pass and in the ci lanes that build first */
    const referenced = new Set<string>();
    for (const entry of Object.values(packagejson.exports)) for (const target of Object.values(entry)) referenced.add(target.replace(/^\.\//, ""));
    for (const file of referenced) await access(join(process.cwd(), file));
  });

  it("stamps the version, the mode and the license banner into every built bundle", async () => {
    if (!existsSync("dist/checksums.txt")) return; /* the validate chain runs the tests before the build; the stamp pass runs on the next pass and in the ci lanes that build first */
    const packagejson = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    const checksums = (await readFile("dist/checksums.txt", "utf8")).trim().split("\n");
    expect(checksums.length).toBeGreaterThan(20);
    for (const line of checksums) {
      const file = line.slice(66);
      if (file === "manifest.json key") continue; /* the identity record of the published key pins the manifest identity digest beside the bundle checksums, so the pin rides the generated artifact and no license banner applies */
      if (file === "gallery.json") continue; /* the example gallery index ships as data the recipes runner reads: the checksum and the artifact manifest cover it, no license banner rides a data file */
      if (file.startsWith("site/")) continue; /* the static site assets carry their own manifest, not the library banner */
      if (file.endsWith(".zip")) continue; /* the zipped declaration bundle of the publishing pipeline is an assembled binary artifact: its checksum and manifest entry carry it, no text banner rides a zip */
      if (file.startsWith("caps/") || file.startsWith("schemas/") || file.startsWith("fixtures/")) continue; /* the contract data artifacts the 1.1.98 consolidation emits for the packages carry the frozen lists and the example set: the checksum, the artifact manifest and the freeze gate cover them, no license banner rides a data file */
      const content = await readFile(join("dist", file), "utf8");
      expect(content).toContain(`devthink ${packagejson.version}`);
      expect(content).toContain("GPL-3.0-only");
    }
    const esm = await import(resolve("dist/index.js"));
    const cjs = require(resolve("dist/index.cjs")) as Record<string, () => { version: string; mode: string }>;
    const neutral = await import(resolve("dist/index.neutral.js"));
    expect(esm.bundlestamp().version).toBe(packagejson.version);
    expect(esm.bundlestamp().mode).toBe("esm");
    expect(cjs.bundlestamp!().version).toBe(packagejson.version);
    expect(cjs.bundlestamp!().mode).toBe("cjs");
    expect(neutral.bundlestamp().mode).toBe("neutral");
    expect(neutral.bundlestamp().version).toBe(packagejson.version);
    const umdsource = await readFile("dist/devthink.umd.js", "utf8");
    const sandbox = umdglobal(umdsource);
    expect((sandbox.devthink as Record<string, () => { version: string }>).bundlestamp!().version).toBe(packagejson.version);
  });

  it("verifies the checksums, the sourcemaps and the minified parity of every dist target", async () => {
    if (!existsSync("dist/checksums.txt")) return; /* the validate chain runs the tests before the build; the artifact pass runs on the next pass and in the ci lanes that build first */
    const packagejson = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    const checksums = (await readFile("dist/checksums.txt", "utf8")).trim().split("\n");
    for (const line of checksums) {
      const digest = line.slice(0, 64);
      const file = line.slice(66);
      if (file === "manifest.json key") {
        /* the identity record of the published key: the build writes the manifest key digest beside the bundle checksums so the pin rides the generated artifact, never a hard coded source constant */
        const manifestsource = JSON.parse(await readFile("web/extension/manifest.json", "utf8")) as { key: string };
        expect(createHash("sha256").update(Buffer.from(manifestsource.key, "base64")).digest("hex")).toBe(digest);
        continue;
      }
      expect(createHash("sha256").update(await readFile(join("dist", file))).digest("hex")).toBe(digest);
      if (file.startsWith("site/")) continue; /* the static site assets carry no sourcemaps or minified pairs */
      if (file.startsWith("caps/") || file.startsWith("schemas/") || file.startsWith("fixtures/")) continue; /* the contract data artifacts ship as data for the packages, not as built bundles: no sourcemap and no minified pair */
      if (!file.endsWith(".js") && !file.endsWith(".cjs")) continue; /* the json template of the native bridge carries the banner and the checksum without a minified pair, because a manifest template is data the installer stamps, not a runnable bundle */
      const map = JSON.parse(await readFile(join("dist", `${file}.map`), "utf8")) as { version: number; sources: string[] };
      expect(map.version).toBe(3);
      expect(map.sources.length).toBeGreaterThan(0);
      if (file.includes(".min.")) continue; /* the minified variant is itself the pair of its unminified bundle */
      const minified = file.replace(/\.js$/, ".min.js").replace(/\.cjs$/, ".min.cjs");
      await access(join("dist", minified));
      expect((await stat(join("dist", minified))).size).toBeLessThan((await stat(join("dist", file))).size);
    }
    const minifiedesm = await import(resolve("dist/index.min.js"));
    expect(typeof minifiedesm.surfacepalette).toBe("function");
    expect(minifiedesm.bundlestamp().version).toBe(packagejson.version);
    const minifiedcjs = require(resolve("dist/index.min.cjs")) as Record<string, unknown>;
    expect(typeof minifiedcjs.surfacepalette).toBe("function");
    const headless = await import(resolve("dist/headless.js"));
    expect(headless.bundlestamp().mode).toBe("headless");
  });

  it("keeps the policy and protocol modules free of platform imports and the browser bundles free of node imports", async () => {
    for (const module of ["policy.ts", "protocol.ts", "progress.ts", "runtime.ts", "memory.ts"]) {
      const source = await readFile(module, "utf8");
      expect(source).not.toMatch(/from\s*["']node:/);
      expect(source).not.toMatch(/require\(/);
      expect(source).not.toMatch(/import\(\s*["']node:/);
    }
    if (!existsSync("dist/checksums.txt")) return; /* the source purity holds on every pass; the bundle purity pass runs on the built dist */
    for (const file of ["index.neutral.js", "index.neutral.min.js", "devthink.umd.js", "devthink.umd.min.js", "policy.js", "protocol.js", "progress.js", "memory.js"]) {
      const content = await readFile(join("dist", file), "utf8");
      expect(content).not.toMatch(/(?:from\s*|require\(\s*)["']node:/);
    }
    for (const file of ["index.js", "index.cjs", "index.neutral.js", "devthink.umd.js", "policy.js", "protocol.js", "memory.js", "progress.js", "headless.js", "cli.js"]) {
      const stripped = stripstrings(await readFile(join("dist", file), "utf8"));
      expect(underscorednames(stripped)).toHaveLength(0);
    }
  }, 480_000);


  it("loads the headless entry under the esm and cjs modes without browser globals", async () => {
    const esm = await import(await modebundle("headless-esm", () => buildtarget("headless.ts", "esm", "node", join(outbase, "mode-headless.mjs"))));
    expect(typeof esm.openlibraryrun).toBe("function");
    expect(typeof esm.openheadlesssession).toBe("function");
    expect(esm.bundlestamp().mode).toBe("headless");
    const cjs = require(await modebundle("headless-cjs", () => buildtarget("headless.ts", "cjs", "node", join(outbase, "mode-headless.cjs")))) as Record<string, unknown>;
    expect(typeof cjs.openlibraryrun).toBe("function");
    expect(typeof cjs.openheadlesssession).toBe("function");
 }, 120_000);

});

afterAll(async () => {
  await rm(outbase, { recursive: true, force: true });
}, 120_000);
