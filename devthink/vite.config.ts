/** Style: DevThink Orbital Signal Room — a build straight at the application root (the owner doctrine: no dist, no public, no assets folder — the hashed bundles emit flat beside the entry) with a repository-scoped base path and preview-safe host handling. The config lives at the app root: the vite root is the app root, the theme component folders stay under Sol/ and the alias "@" maps to Sol. */

import { readFileSync } from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

function pagesBasePath(value: string | undefined): string {
  const candidate = value?.trim() || "/";
  if (candidate === "." || candidate === "./") return "./";
  /* a filesystem path can never be a base: a drive letter or a separator
   * poisons the emitted html (the /C:/Git bundles), so the value falls back
   * to the site root */
  if (/^([a-z]:[\\/]|\\\\|file:)/i.test(candidate) || candidate.includes("\\")) return "/";
  return candidate === "/" ? candidate : `/${candidate.replace(/^\/+|\/+$/g, "")}/`;
}

/** the release version the site is built from, read once from the root
 * manifest (one product, one metadata) and baked as the __dtversion__
 * global — the distribution rail of the landing never drifts from the
 * shipped envelope. */
const manifestversion = (
  JSON.parse(readFileSync(path.resolve(import.meta.dirname, "manifest.json"), "utf8")) as {
    version: string;
  }
).version;

/** the deploy slugs of the sibling family apps (the folders beside this
 * one in the shared repository — the same list window.ts carries) */
const FAMILY_SLUGS = [
  "argan",
  "cadria",
  "cobaia",
  "debonair",
  "stealthhead",
  "forge",
  "foundry",
  "vault",
  "getry",
  "saddle",
] as const;

/** resolves one sibling app folder on this machine */
function siblingroot(slug: string): string {
  return path.resolve(import.meta.dirname, "..", slug);
}

/** the family dev bridge: the sibling family apps deploy under the same
 * site in production (each at its repository subpath), and the dev server
 * answers the same surface so the power clip windows and the family
 * routes carry the REAL apps in dev — one server, every sibling root
 * mounted at its deploy slug. The html entries rewrite their relative
 * asset references to the slug path and ride the vite html transform
 * (the react refresh and the dev client inject beside them); every other
 * request walks the vite /@fs lane so the module transform, the hmr and
 * the import analysis serve the sibling sources with their own relative
 * resolution — the alias-free import grammar every sibling carries (the
 * one saddle @/ face walked to relative imports for exactly this law). */
function familydevbridge(): Plugin {
  return {
    name: "devthink-family-dev-bridge",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void (async () => {
          const raw = ((req.url ?? "/").split("?")[0] ?? "/") as string;
          const match = /^\/([a-z][a-z0-9]*)\/(.*)$/.exec(raw) ?? /^\/([a-z][a-z0-9]*)$/.exec(raw);
          const slug = match?.[1];
          if (!slug || !(FAMILY_SLUGS as readonly string[]).includes(slug)) return next();
          const rest = match[2] ?? "";
          // the folder slug itself serves the app's html entry
          if (rest === "" || rest.endsWith(".html")) {
            const entry = path.join(siblingroot(slug), rest === "" ? "index.html" : rest);
            try {
              const html = readFileSync(entry, "utf8");
              // the relative asset references walk the /@fs lane of the
              // sibling root — the exact urls vite's html transform keeps
              // untouched (the module scripts, the stylesheets, the icons
              // and the manifests all serve through the fs allow list)
              const rewritten = html.replace(
                /(src|href)="\.\/([^"]+)"/g,
                (_whole: string, attr: string, ref: string) =>
                  `${attr}="/@fs${siblingroot(slug)}/${ref}"`,
              );
              const transformed = await server.transformIndexHtml(`/${slug}/`, rewritten);
              res.statusCode = 200;
              res.setHeader("content-type", "text/html");
              res.end(transformed);
              return;
            } catch {
              return next();
            }
          }
          // modules and assets: the vite /@fs lane serves the sibling source
          req.url = `/@fs${siblingroot(slug)}/${rest}`;
          next();
        })();
      });
    },
  };
}

/** The multi-mode engine edge, closed for good: the shared core graph
 * (constants, models, fingerprint, core, the provider lineage) is authored
 * once for node, bun AND the browser bundle, and the browser answers the
 * neutral stubs the doctrine always described — vite's default
 * browser-external proxy throws on the first property binding, which killed
 * the whole module graph at import time and blanked the OS. Every builtin
 * the graph speaks resolves here to a small honest browser surface:
 * identifiers answer neutral values, the filesystem answers absent and
 * inert, and the crypto-strong draws ride the platform randomness. Nothing
 * server-only (dns probes, readline, scrypt) is faked: those paths throw
 * the same way they would on a host without them, and every caller in the
 * browser graph already carries its guarded fallback. The prisma client
 * edge rides the same law: the lazy db proxy's import("@prisma/client")
 * resolves onto the neutral prismashim instead of the generated client the
 * browser condition demands, so a fresh checkout bundles the web without
 * running prisma generate first. */
function nodebuiltinshim(): Plugin {
  const shims: Record<string, string> = {
    os: [
      "export const EOL = \"\\n\";",
      "export const arch = () => \"wasm\";",
      "export const platform = () => \"browser\";",
      "export const release = () => \"\";",
      "export const type = () => \"Browser\";",
      "export const hostname = () => \"localhost\";",
      "export const homedir = () => \"/\";",
      "export const tmpdir = () => \"/tmp\";",
      "export const cpus = () => [];",
      "export const totalmem = () => 0;",
      "export const freemem = () => 0;",
      "export const uptime = () => 0;",
      "export const loadavg = () => [0, 0, 0];",
      "export const networkInterfaces = () => [];",
      "export const userInfo = () => ({ username: \"devthink\", uid: -1, gid: -1, homedir: \"/\", shell: null });",
      "export const constants = {};",
      "export default { EOL, arch, platform, release, type, hostname, homedir, tmpdir, cpus, totalmem, freemem, uptime, loadavg, networkInterfaces, userInfo, constants };",
    ].join("\n"),
    path: [
      "const normalizeone = (value) => value.replace(/\\/{2,}/g, \"/\").replace(/\\/$/, \"\") || \"/\";",
      "export const sep = \"/\";",
      "export const delimiter = \":\";",
      "export const isAbsolute = (value) => value.startsWith(\"/\");",
      "export const normalize = (value) => normalizeone(value);",
      "export const join = (...parts) => normalizeone(parts.filter(Boolean).join(\"/\"));",
      "export const resolve = (...parts) => normalizeone(parts.filter(Boolean).join(\"/\"));",
      "export const dirname = (value) => { const cut = normalizeone(value).lastIndexOf(\"/\"); return cut <= 0 ? \"/\" : normalizeone(value).slice(0, cut); };",
      "export const basename = (value, ext) => { const base = normalizeone(value).split(\"/\").pop() || \"\"; return ext && base.endsWith(ext) ? base.slice(0, -ext.length) : base; };",
      "export const extname = (value) => { const base = normalizeone(value).split(\"/\").pop() || \"\"; const dot = base.lastIndexOf(\".\"); return dot > 0 ? base.slice(dot) : \"\"; };",
      "export const relative = (from, to) => normalizeone(to).replace(normalizeone(from), \"\").replace(/^\\//, \"\") || \".\";",
      "export const posix = { sep, delimiter, isAbsolute, normalize, join, resolve, dirname, basename, extname, relative };",
      "export const win32 = { sep: \"\\\\\\\\\", delimiter: \";\", isAbsolute, normalize, join, resolve, dirname, basename, extname, relative };",
      "export default { sep, delimiter, isAbsolute, normalize, join, resolve, dirname, basename, extname, relative, posix, win32 };",
    ].join("\n"),
    fs: [
      "const absent = (name) => { throw new Error(`[devthink browser bundle] node:fs ${name} is absent on this host`); };",
      "export const existsSync = () => false;",
      "export const mkdirSync = () => undefined;",
      "export const writeFileSync = () => undefined;",
      "export const appendFileSync = () => undefined;",
      "export const renameSync = () => undefined;",
      "export const chmodSync = () => undefined;",
      "export const unlinkSync = () => undefined;",
      "export const statSync = () => absent(\"statSync\");",
      "export const readFileSync = () => absent(\"readFileSync\");",
      "export const readdirSync = () => [];",
      "export default { existsSync, mkdirSync, writeFileSync, appendFileSync, renameSync, chmodSync, unlinkSync, statSync, readFileSync, readdirSync };",
    ].join("\n"),
    "fs/promises": [
      "const absent = (name) => Promise.reject(new Error(`[devthink browser bundle] node:fs/promises ${name} is absent on this host`));",
      "export const mkdir = () => Promise.resolve(undefined);",
      "export const writeFile = () => Promise.resolve(undefined);",
      "export const rename = () => Promise.resolve(undefined);",
      "export const readFile = () => absent(\"readFile\");",
      "export const stat = () => absent(\"stat\");",
      "export const readdir = () => Promise.resolve([]);",
      "export default { mkdir, writeFile, rename, readFile, stat, readdir };",
    ].join("\n"),
    crypto: [
      "const absent = (name) => { throw new Error(`[devthink browser bundle] node:crypto ${name} is absent on this host`); };",
      "export const randomUUID = () => globalThis.crypto.randomUUID();",
      "export const randomBytes = (size) => globalThis.crypto.getRandomValues(new Uint8Array(size));",
      "export const randomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;",
      "export const createHash = () => absent(\"createHash\");",
      "export const createHmac = () => absent(\"createHmac\");",
      "export const scryptSync = () => absent(\"scryptSync\");",
      "export const timingSafeEqual = () => absent(\"timingSafeEqual\");",
      "export default { randomUUID, randomBytes, randomInt, createHash, createHmac, scryptSync, timingSafeEqual };",
    ].join("\n"),
    url: [
      "export const pathToFileURL = (value) => new URL(`file://${value}`);",
      "export const fileURLToPath = (value) => String(value).replace(/^file:\\/\\//, \"\");",
      "export default { pathToFileURL, fileURLToPath };",
    ].join("\n"),
    util: [
      "export const inspect = (value) => String(value);",
      "export const format = (...parts) => parts.map((part) => (typeof part === \"string\" ? part : String(part))).join(\" \");",
      "export const promisify = (fn) => fn;",
      "export default { inspect, format, promisify };",
    ].join("\n"),
    process: [
      "export const env = {};",
      "export const platform = \"browser\";",
      "export const arch = \"wasm\";",
      "export const argv = [];",
      "export const pid = 0;",
      "export const versions = {};",
      "export const cwd = () => \"/\";",
      "export const nextTick = (fn) => Promise.resolve().then(fn);",
      "export default { env, platform, arch, argv, pid, versions, cwd, nextTick };",
    ].join("\n"),
    tty: [
      "export const isatty = () => false;",
      "export default { isatty };",
    ].join("\n"),
    "dns/promises": [
      "const absent = (name) => Promise.reject(new Error(`[devthink browser bundle] node:dns ${name} is absent on this host`));",
      "export const lookup = () => absent(\"lookup\");",
      "export const resolve = () => absent(\"resolve\");",
      "export default { lookup, resolve };",
    ].join("\n"),
    readline: [
      "export const createInterface = () => { throw new Error(\"[devthink browser bundle] node:readline is absent on this host\"); };",
      "export default { createInterface };",
    ].join("\n"),
  };
  /* the ownership wave (wave/ownership.getry) moved the shim sources to the
   * getry engine root: the browser stubs (nodeshim.ts) and the neutral
   * prisma shim (prismashim.ts) are gateway-owned modules now, so the
   * browser bundle resolves the same monorepo sources the sibling app
   * carries — the shims are never duplicated inside devthink. */
  const shimpath = path.resolve(import.meta.dirname, "../getry/nodeshim.ts");
  const prismashimpath = path.resolve(import.meta.dirname, "../getry/prismashim.ts");
  const shimmed = new Set(Object.keys(shims));
  return {
    name: "devthink-node-builtin-shim",
    enforce: "pre",
    resolveId(source) {
      if (source.startsWith("node:") && shimmed.has(source.slice("node:".length))) {
        return shimpath;
      }
      /* the prisma client edge: the lazy db proxy of storage.ts
       * speaks a dynamic import("@prisma/client") on the first database
       * touch, and the browser condition of that package lands on
       * index-browser.js — a bare require of the generated .prisma/client
       * that only exists after prisma generate, so a fresh checkout (the
       * runner) refused the whole web bundle at build time. The browser
       * never touches the real client (the os HD is the IndexedDB store):
       * every @prisma/client and .prisma/client specifier answers the
       * neutral prismashim, while the node and cli lanes keep resolving the
       * real package untouched (this hook only serves the vite build). */
      if (source === "@prisma/client" || source === ".prisma/client" || source.startsWith(".prisma/client/")) {
        return prismashimpath;
      }
      return null;
    },
  };
}

export default defineConfig({
  define: {
    __dtversion__: JSON.stringify(manifestversion),
    /** the intro target of the build: the entry doctrine resolves the ONE
     * face per distribution (web SaaS landing vs owned system boot) through
     * introtarget.ts; an unset variable answers "web", the safe public
     * default. */
    "import.meta.env.VITE_DT_TARGET": JSON.stringify(process.env.VITE_DT_TARGET?.trim() || "web"),
    /** the multi-mode engine edge: the shared core graph (constants, models,
     * the provider lineage) reads process.env at module scope the way node
     * and bun answer it, and the browser bundle would throw ReferenceError
     * at import time before any guard could run — the neutral empty object
     * keeps the module link safe while every env-overridable constant falls
     * back to its compiled default. */
    "process.env": "({})",
  },
  base: pagesBasePath(process.env.VITE_BASE_PATH),
  plugins: [nodebuiltinshim(), react(), tailwindcss(), familydevbridge()],
  resolve: {
    alias: {
      // the transcode engine bridge of the ownership law (retires when the
      // published cadria envelope carries the transcodeengine export entry)
      "@wenathlan/cadria/transcodeengine": path.resolve(import.meta.dirname, "../cadria/transcodeengine.ts"),
      /** the exact-subpath bridge to the sibling saddle engine: the chat
       * sandbox lane imports the browser-pure engine through the published
       * library specifier ("@wenathlan/saddle/sandbox"), but the installed
       * 2.1.6 envelope lacks that export surface — this longer key (checked
       * before the "@" prefix alias) resolves the specifier to the monorepo
       * source the family app carries, so the engine logic is never
       * duplicated inside devthink. the entry retires when saddle 2.1.7
       * publishes: its package.json exports map gained exactly the missing
       * "./sandbox": "./build/sandbox.js" manifest piece. */
      /** the modality registry bridge of the ownership law (the saddle
       * container law sibling): the sandbox lane reads the ninety-modality
       * catalog through the published library specifier
       * ("@wenathlan/saddle/modalityregistry"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the vendored mirror the lane used to keep (the byte-identical
       * modalities.ts copy) retires, the catalog is never duplicated
       * inside devthink. the entry retires when the registry pin resolves
       * the published envelope that carries the built registry. */
      "@wenathlan/saddle/modalityregistry": path.resolve(import.meta.dirname, "../saddle/modalityregistry.ts"),
      /** the workload law bridge of the family (wave WL1): the os surface
       * reads the family lane catalog through the published library
       * specifier ("@wenathlan/saddle/workloadlaw"), and this bridge
       * resolves the specifier to the monorepo source the sibling engine
       * carries — the catalog is never duplicated inside devthink. the
       * entry retires when the published envelope carries the built
       * workload law. */
      "@wenathlan/saddle/workloadlaw": path.resolve(import.meta.dirname, "../saddle/workloadlaw.ts"),
      "@wenathlan/saddle/sandbox": path.resolve(import.meta.dirname, "../saddle/sandbox.ts"),
      /** the bare saddle face bridge of the source-is-library doctrine: the
       * 2.1.7 envelope ships the .ts sources as the engine (the dist tree
       * the 2.1.6 envelope carried never emits again), so the bundler
       * resolves the bare specifier and the memory face to the monorepo
       * source the sibling engine carries — the example job and every
       * future consumer answer the same seat. */
      "@wenathlan/saddle/security": path.resolve(import.meta.dirname, "../saddle/security.ts"),
      "@wenathlan/saddle": path.resolve(import.meta.dirname, "../saddle/index.ts"),
      "@wenathlan/saddle/memory": path.resolve(import.meta.dirname, "../saddle/virtual.ts"),
      /** the getry engine bridge of the ownership law (pr16): the os gateway
       * imports the 7-level reasoning ladder through the published library
       * specifier ("@wenathlan/getry/thinking"), and this bridge resolves the
       * specifier to the monorepo source the sibling app carries — the ladder
       * is never duplicated inside devthink, the engine answers from its one
       * owner (see engines.ts, the ownership manifest). */
      "@wenathlan/getry/thinking": path.resolve(import.meta.dirname, "../getry/thinking.ts"),
      /** the queue self-bridge (mirrored from vitest.config.ts): the getry
       * llm module walks the retry.backoff parser through the published
       * specifier and the build resolves it to this app's own source — the
       * installed envelope carries no ./queue export yet. */
      "@wenathlan/devthink/queue": path.resolve(import.meta.dirname, "queue.ts"),
      /** the getry engine module bridges of the ownership wave
       * (wave/ownership.getry): the gateway pipeline sources (engine, llm,
       * streaming, models, request, providers, antigravity, oauth, accounts,
       * project, quota, recovery, fingerprint, search, utils,
       * versionregistry, intelligence, the json family, the gateway config
       * family, the smoke and probe lanes, the node shim and the shared
       * types/constants surfaces) moved from the devthink root to the getry
       * owner root, and the consumers speak them through the published
       * library specifiers ("@wenathlan/getry/engine" and siblings) — these
       * bridges resolve every specifier to the monorepo source the sibling
       * app carries, so the gateway logic is never duplicated inside
       * devthink and every module answers from its one owner (see
       * engines.ts, the ownership manifest). the installed 2.0.154 envelope
       * carries none of these export surfaces yet, so the bridge is the
       * resolution of record until the published envelope catches up. */
      "@wenathlan/getry/engine": path.resolve(import.meta.dirname, "../getry/engine.ts"),
      "@wenathlan/getry/llm": path.resolve(import.meta.dirname, "../getry/llm.ts"),
      "@wenathlan/getry/streaming": path.resolve(import.meta.dirname, "../getry/streaming.ts"),
      "@wenathlan/getry/models": path.resolve(import.meta.dirname, "../getry/models.ts"),
      "@wenathlan/getry/request": path.resolve(import.meta.dirname, "../getry/request.ts"),
      "@wenathlan/getry/providers": path.resolve(import.meta.dirname, "../getry/providers.ts"),
      "@wenathlan/getry/antigravity": path.resolve(import.meta.dirname, "../getry/antigravity.ts"),
      "@wenathlan/getry/oauth": path.resolve(import.meta.dirname, "../getry/oauth.ts"),
      "@wenathlan/getry/accounts": path.resolve(import.meta.dirname, "../getry/accounts.ts"),
      "@wenathlan/getry/project": path.resolve(import.meta.dirname, "../getry/project.ts"),
      "@wenathlan/getry/quota": path.resolve(import.meta.dirname, "../getry/quota.ts"),
      "@wenathlan/getry/recovery": path.resolve(import.meta.dirname, "../getry/recovery.ts"),
      "@wenathlan/getry/fingerprint": path.resolve(import.meta.dirname, "../getry/fingerprint.ts"),
      "@wenathlan/getry/search": path.resolve(import.meta.dirname, "../getry/search.ts"),
      "@wenathlan/getry/utils": path.resolve(import.meta.dirname, "../getry/utils.ts"),
      "@wenathlan/getry/versionregistry": path.resolve(import.meta.dirname, "../getry/versionregistry.ts"),
      "@wenathlan/getry/intelligence": path.resolve(import.meta.dirname, "../getry/intelligence.ts"),
      "@wenathlan/getry/json": path.resolve(import.meta.dirname, "../getry/json.ts"),
      "@wenathlan/getry/jsonpolicy": path.resolve(import.meta.dirname, "../getry/jsonpolicy.ts"),
      "@wenathlan/getry/jsonschema": path.resolve(import.meta.dirname, "../getry/jsonschema.ts"),
      "@wenathlan/getry/gatewayconfig": path.resolve(import.meta.dirname, "../getry/gatewayconfig.ts"),
      "@wenathlan/getry/gatewayviewconfig": path.resolve(import.meta.dirname, "../getry/gatewayviewconfig.ts"),
      "@wenathlan/getry/gatewayprobe": path.resolve(import.meta.dirname, "../getry/gatewayprobe.ts"),
      "@wenathlan/getry/gatewaysmoke": path.resolve(import.meta.dirname, "../getry/gatewaysmoke.ts"),
      "@wenathlan/getry/nodeshim": path.resolve(import.meta.dirname, "../getry/nodeshim.ts"),
      "@wenathlan/getry/types": path.resolve(import.meta.dirname, "../getry/types.ts"),
      "@wenathlan/getry/constants": path.resolve(import.meta.dirname, "../getry/constants.ts"),
      /** the hono seat bridges of the ownership wave (the mirror of the
       * tsconfig pass): the gateway transport the getry seat owns imports
       * the hono family, and this build walks the moved sources through
       * the owner aliases above — the bundler resolution that walks up
       * from the getry folder never sees this app's install (the
       * workbench lane installs the devthink tree alone), so every hono
       * specifier resolves onto this install's runtime entries the same
       * way every bridge does. the exact-subpath keys ride first: the
       * node adapter the build inlines speaks "hono/ws" and
       * "hono/utils/mime" beside the family the transport imports
       * (hono/cors, serve-static), and the bare prefix entries answer
       * the last (the longer keys above must stay ahead of the two bare
       * roots the prefix matching would otherwise shadow — a hono
       * version bump that adds a new spoken subpath adds its entry
       * here). */
      "@hono/node-server/serve-static": path.resolve(
        import.meta.dirname,
        "node_modules/@hono/node-server/dist/serve-static.mjs",
      ),
      "@hono/node-server": path.resolve(
        import.meta.dirname,
        "node_modules/@hono/node-server/dist/index.mjs",
      ),
      "hono/cors": path.resolve(
        import.meta.dirname,
        "node_modules/hono/dist/middleware/cors/index.js",
      ),
      "hono/utils/mime": path.resolve(import.meta.dirname, "node_modules/hono/dist/utils/mime.js"),
      "hono/ws": path.resolve(
        import.meta.dirname,
        "node_modules/hono/dist/helper/websocket/index.js",
      ),
      "hono": path.resolve(import.meta.dirname, "node_modules/hono/dist/index.js"),
      /** the sdk seat bridge of the ownership wave (the mirror of the
       * hono seats above): the zai transport lane the getry engine owns
       * speaks the published sdk specifier through a lazy dynamic import
       * (the keyless seat the browser graph inlines when the gateway
       * engine family rides the owner aliases), and the bundler
       * resolution that walks up from the getry folder never sees this
       * app's install — the specifier resolves onto this install's
       * runtime entry the same way every bridge does (the lane answers
       * the neutral refusal the nodeshim family carries when no sdk seat
       * exists, so the browser bundle never speaks the network). */
      "z-ai-web-dev-sdk": path.resolve(
        import.meta.dirname,
        "node_modules/z-ai-web-dev-sdk/dist/index.js",
      ),
      /** the getry owner faces of the gateway ownership wave
       * (wave/ownership.gateway): the embedded gateway surfaces the grand
       * merge interned in server.ts (the http transport server, the
       * request auth family, the console cli and the provider cli) move
       * to the getry owner root one face per step, and the consumers
       * speak them through the published library specifiers
       * ("@wenathlan/getry/server" and siblings) — these bridges resolve
       * every specifier to the monorepo source the sibling app carries,
       * so the gateway logic keeps one owner (the auth family landed with
       * step 2; the server, cli and providercli faces land with the steps
       * that follow, their targets answer the day they land). the
       * installed 2.0.154 envelope carries none of these export surfaces
       * yet, so the bridge is the resolution of record until the
       * published envelope catches up. */
      "@wenathlan/getry/server": path.resolve(import.meta.dirname, "../getry/server.ts"),
      "@wenathlan/getry/auth": path.resolve(import.meta.dirname, "../getry/auth.ts"),
      "@wenathlan/getry/cli": path.resolve(import.meta.dirname, "../getry/cli.ts"),
      "@wenathlan/getry/providercli": path.resolve(import.meta.dirname, "../getry/providercli.ts"),
      /** the devthink self bridges of the ownership wave
       * (wave/ownership.getry), mirrored from vitest.config.ts: the moved
       * gateway graph leans on the os-owned seams it grew beside (config,
       * constants, core, the http/memory/policy/security lane, server,
       * storage and the shared types surface) through the published library
       * specifiers, and this app is the package those specifiers name — no
       * node_modules copy exists to answer them — so every self specifier
       * resolves to this app's own source on the dev server and the web
       * build. the entries retire when the published devthink envelope
       * carries the export surfaces the moved graph consumes. */
      "@wenathlan/devthink/config": path.resolve(import.meta.dirname, "config.ts"),
      "@wenathlan/devthink/constants": path.resolve(import.meta.dirname, "constants.ts"),
      "@wenathlan/devthink/core": path.resolve(import.meta.dirname, "core.ts"),
      "@wenathlan/devthink/http": path.resolve(import.meta.dirname, "http.ts"),
      "@wenathlan/devthink/memory": path.resolve(import.meta.dirname, "memory.ts"),
      "@wenathlan/devthink/policy": path.resolve(import.meta.dirname, "policy.ts"),
      "@wenathlan/devthink/security": path.resolve(import.meta.dirname, "security.ts"),
      "@wenathlan/devthink/server": path.resolve(import.meta.dirname, "server.ts"),
      /* the oslabels self bridge of the provider console move (the gateway
       * ownership wave, step 5): the moved console's barrel reads the
       * paired label catalog through the published os specifier, and this
       * server resolves it to this app's own source on the dev server and
       * the web build the same way the other self specifiers above ride. */
      "@wenathlan/devthink/oslabels": path.resolve(import.meta.dirname, "oslabels.ts"),
      "@wenathlan/devthink/storage": path.resolve(import.meta.dirname, "storage.ts"),
      "@wenathlan/devthink/types": path.resolve(import.meta.dirname, "types.ts"),
      /** the sibling engine's own self-alias, armed for the family dev
       * bridge: the saddle pages import their isolation lane through the
       * "@saddle/isolation" specifier their own config declares, and the
       * bridge serves those pages through THIS server — the specifier
       * resolves to the same sibling source file here (only saddle's own
       * files ever speak this specifier, so the alias never leaks into the
       * devthink tree) */
      "@saddle/isolation": path.resolve(import.meta.dirname, "../saddle/isolation.ts"),
      /** the label store bridge of the ownership law: the os copy mechanism
       * rides the vault factory through the published library specifier
       * ("@wenathlan/vault/labelstore"), and this bridge resolves the
       * specifier to the monorepo source the sibling engine carries — the
       * mechanism is never duplicated inside devthink. the entry retires
       * when the published envelope carries the built label store. */
      "@wenathlan/vault/labelstore": path.resolve(import.meta.dirname, "../vault/labelstore.ts"),
      "@": path.resolve(import.meta.dirname, "Sol"),
    },
    /** the family dev bridge dedupe wall: the sibling apps carry their own
     * node_modules folders (or symlinks to this one), and a react resolved
     * from a sibling folder would mount a SECOND react instance beside the
     * devthink tree — the hooks die with "cannot read properties of null"
     * exactly the way two react copies always die. The dedupe forces every
     * react/react-dom import of every /@fs-served sibling to the one
     * instance this server root holds, so the power clip windows ride the
     * same fiber tree the desktop rides */
    dedupe: ["react", "react-dom", "react-dom/client"],
  },
  root: import.meta.dirname,
  build: {
    /** the build answers at the application root: assetsDir empty keeps every
     * hashed bundle flat beside the entry html, emptyOutDir false never wipes
     * the source tree, and no dist or public folder ever exists. */
    outDir: path.resolve(import.meta.dirname, "."),
    emptyOutDir: false,
    assetsDir: "",
    rollupOptions: {
      output: {
        /** the flat-build churn guard: css and js bundles keep the hashed flat
         * name, every other emitted asset (icons, manifest, fonts) re-emits
         * under its stable source name so a rebuild never re-hashes an
         * already-hashed artifact and the entry html stays idempotent. */
        chunkFileNames: "index-[hash].js",
        assetFileNames: (asset) =>
          asset.names?.some((name) => name.endsWith(".css")) ? "index-[hash].css" : "[name][extname]",
      },
    },
  },
  /** the theme sources live in the Sol folder of this app root: the design room imports
   * the root logic modules (gateway.ts and the workspace families) across the theme
   * boundary from the same project root, and the saddle engine bridge above pulls the
   * sibling family source — the dev server allows this root plus the saddle folder. */
  server: {
    fs: {
      allow: [import.meta.dirname, ...FAMILY_SLUGS.map((slug) => siblingroot(slug))],
    },
    host: true,
    strictPort: false,
    allowedHosts: true,
    /** the gateway proxy: the embedded hono gateway serves the
     * OpenAI-compatible contract (POST /v1/chat/completions, GET /v1/models)
     * plus the /api surface on its own port, and the dev web speaks strictly
     * same-origin — the chat client never points at another origin in dev */
    proxy: {
      "/v1": {
        target: `http://127.0.0.1:${process.env.GATEWAY_PORT || 3001}`,
        changeOrigin: false,
      },
      "/api": {
        target: `http://127.0.0.1:${process.env.GATEWAY_PORT || 3001}`,
        changeOrigin: false,
      },
    },
  },
});
