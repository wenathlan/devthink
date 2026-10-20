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

export default defineConfig({
  define: {
    __dtversion__: JSON.stringify(manifestversion),
    /** the intro target of the build: the entry doctrine resolves the ONE
     * face per distribution (web SaaS landing vs owned system boot) through
     * introtarget.ts; an unset variable answers "web", the safe public
     * default. */
    "import.meta.env.VITE_DT_TARGET": JSON.stringify(process.env.VITE_DT_TARGET?.trim() || "web"),
  },
  base: pagesBasePath(process.env.VITE_BASE_PATH),
  plugins: [react(), tailwindcss(), familydevbridge()],
  resolve: {
    alias: {
      /** the exact-subpath bridge to the sibling saddle engine: the chat
       * sandbox lane imports the browser-pure engine through the published
       * library specifier ("@wenathlan/saddle/sandbox"), but the installed
       * 2.1.6 envelope lacks that export surface — this longer key (checked
       * before the "@" prefix alias) resolves the specifier to the monorepo
       * source the family app carries, so the engine logic is never
       * duplicated inside devthink. the entry retires when saddle 2.1.7
       * publishes: its package.json exports map gained exactly the missing
       * "./sandbox": "./dist/sandbox.js" manifest piece. */
      "@wenathlan/saddle/sandbox": path.resolve(import.meta.dirname, "../saddle/sandbox.ts"),
      /** the sibling engine's own self-alias, armed for the family dev
       * bridge: the saddle pages import their isolation lane through the
       * "@saddle/isolation" specifier their own config declares, and the
       * bridge serves those pages through THIS server — the specifier
       * resolves to the same sibling source file here (only saddle's own
       * files ever speak this specifier, so the alias never leaks into the
       * devthink tree) */
      "@saddle/isolation": path.resolve(import.meta.dirname, "../saddle/isolation.ts"),
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
