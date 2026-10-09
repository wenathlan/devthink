/**
 * gatewayview page — the embedded gateway console of the devthink workbench.
 *
 * the merged repository embeds the gateway engine at its root (the library
 * the gateway lineage shipped) and this page is its browser face: the shipped
 * v1–v5 catalog, the auth methods, the 2-calls thinking budgets, the library
 * usage and the structure of the merged repository, with one detail view per
 * version. every row derives from the single catalog (config.ts — the user
 * customization layer the engine reads); no view keeps a second copy of the
 * definitions.
 *
 * D-07 navbar/hero standard: both the overview and the detail view mount the
 * ONE ShellChrome navbar directly and open with the .pagehead hero contract
 * inside .page-container. The detail view's own .gateway-toolbar row is
 * retired — the gateway overview link and the live/paused badge now ride the
 * .pagehead__actions slot of the hero. Numeric readouts (model counts,
 * thinking budgets) carry tabular numerals; the not-found state keeps the
 * shared .control-empty card. No route, data or export changes.
 *
 * C1-04 anti-vibe-code pass: the uniform auto-fit card grids are gone — the
 * catalog reads specimen-grade now. Versions, auth methods, thinking levels,
 * routes and policy are hairline-ruled rows with quiet hover washes instead
 * of boxed tile grids; the live/paused badge keeps the one accent per state
 * (green live, amber paused) and the default thinking budget carries the
 * single solar accent; the .pagehead heroes carry the .halftone edge, the
 * versions table carries the .grain film, the console carries the one .atmos
 * light source (C1-01 paints all three); rows reveal in one staggered
 * entrance and hold still; the hero back action rides the 28–36px control
 * ladder.
 */
import { ArrowLeft, KeyRound, Network, RefreshCcw, ShieldCheck, TerminalSquare } from "lucide-react";
import { Link, useRoute } from "wouter";
import { ShellChrome } from "@/shell/ShellChrome";
import { config } from "./config";
import type { gatewayconfig } from "./definition";

/** tabular numerals for the numeric readouts of the console. */
const TABULAR = { fontVariantNumeric: "tabular-nums" } as const;

/** The gateway slice of the C1-04 pass: the specimen rows (hairline rules,
 * wash hovers, one accent per state) live with the page — the theme
 * stylesheet keeps the shared panel/pre skin. The atmosphere guard keeps the
 * C1-01 layers off the pointer path, the sections get editorial breathing
 * room, and the hero back action drops onto the 32px control ladder. */
const GATEWAY_CSS = `
.atmos::before, .atmos::after, .grain::before, .grain::after,
.halftone::before, .halftone::after { pointer-events: none; }
.control-page.atmos { position: relative; }
.pagehead.halftone { position: relative; }
.page-container .gateway-panel + .gateway-panel { margin-top: 24px; }
.page-container .gateway-explorer { margin-top: 24px; }
.gateway-back { min-height: 32px; }
.gv-versions { display: grid; margin: 0; padding: 0; list-style: none; }
.gv-version { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 16px; padding: 13px 10px; border-top: 1px solid var(--dt-edge); border-radius: 6px; text-decoration: none; transition: background 160ms var(--dt-ease); animation: gvRise 240ms cubic-bezier(.22, 1, .36, 1) backwards; }
.gv-version:first-child { border-top: 0; }
.gv-version:hover { background: rgb(255 255 255 / 4%); }
.gv-version__main { display: grid; gap: 2px; min-width: 0; }
.gv-version__id { color: var(--dt-text); font: 600 14px var(--dt-mono); font-variant-numeric: tabular-nums; }
.gv-version__provider { color: var(--dt-muted); font: 400 12px/1.6 var(--dt-sans); }
.gv-version__side { display: grid; gap: 4px; align-content: center; justify-items: end; }
.gv-version__models { color: var(--dt-faint); font: 500 10px var(--dt-mono); font-variant-numeric: tabular-nums; }
.gv-version__pattern { grid-column: 1 / -1; overflow: hidden; color: var(--dt-faint); font: 400 11px/1.6 var(--dt-mono); text-overflow: ellipsis; white-space: nowrap; }
.gv-auth { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 0 32px; align-content: start; }
.gv-auth article { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; padding: 9px 2px; border-top: 1px solid var(--dt-edge); transition: background 160ms var(--dt-ease); }
.gv-auth article:hover { background: rgb(255 255 255 / 3%); }
.gv-auth article strong { color: var(--dt-text); font: 600 11px var(--dt-mono); }
.gv-auth article span { overflow-wrap: anywhere; color: var(--dt-faint); font: 400 10px/1.6 var(--dt-mono); text-align: right; }
.gv-thinking { display: grid; margin: 0; padding: 0; list-style: none; }
.gv-thinking article { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 16px; padding: 10px 2px; border-top: 1px solid var(--dt-edge); transition: background 160ms var(--dt-ease); }
.gv-thinking article:hover { background: rgb(255 255 255 / 3%); }
.gv-thinking article strong { color: var(--dt-text); font: 600 11px var(--dt-mono); }
.gv-thinking article small { color: var(--dt-faint); font: 400 10px var(--dt-mono); }
.gv-thinking__budget { grid-row: 1 / 3; grid-column: 2; align-self: center; color: var(--dt-text); font: 600 16px var(--dt-mono); font-variant-numeric: tabular-nums; }
.gv-thinking article[data-default="true"] .gv-thinking__budget { color: var(--dt-orange); }
.gv-routes { display: grid; margin: 0; padding: 0; list-style: none; }
.gv-routes article { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; padding: 9px 2px; border-top: 1px solid var(--dt-edge); transition: background 160ms var(--dt-ease); }
.gv-routes article:first-child { border-top: 0; padding-top: 2px; }
.gv-routes article:hover { background: rgb(255 255 255 / 3%); }
.gv-routes span { color: var(--dt-faint); font: 500 10px var(--dt-mono); letter-spacing: .06em; }
.gv-routes code { color: var(--dt-blue); font: 600 11px var(--dt-mono); }
.gv-policy { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 0 32px; align-content: start; }
.gv-policy article { display: grid; grid-template-columns: 72px minmax(0, 1fr); gap: 2px 12px; padding: 10px 2px; border-top: 1px solid var(--dt-edge); transition: background 160ms var(--dt-ease); }
.gv-policy article:hover { background: rgb(255 255 255 / 3%); }
.gv-policy article > span { color: var(--dt-faint); font: 500 10px/1.9 var(--dt-mono); letter-spacing: .06em; }
.gv-policy article strong { color: var(--dt-text); font: 600 12px/1.5 var(--dt-sans); overflow-wrap: anywhere; }
.gv-policy article small { grid-column: 2; overflow-wrap: anywhere; color: var(--dt-faint); font: 400 10px/1.6 var(--dt-mono); }
@keyframes gvRise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .gv-version { animation: none; } .gv-version:hover, .gv-auth article:hover, .gv-thinking article:hover, .gv-routes article:hover, .gv-policy article:hover { transition: none; } }
`;

let gatewayCssReady = false;

/** Injects the gateway stylesheet exactly once per document. */
function ensureGatewayCss(): void {
  if (gatewayCssReady || typeof document === "undefined") return;
  gatewayCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-gateway", "");
  tag.textContent = GATEWAY_CSS;
  document.head.appendChild(tag);
}

/** the page floor shared by both views: ONE navbar + .page-container body + footer. */
function ConsoleFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="control-page atmos">
      <ShellChrome />
      <div className="page-container">
        {children}
        <footer className="control-page__footer">
          <TerminalSquare size={14} aria-hidden="true" />
          provider credentials stay in <code>~/.config/devthink/auth.json</code>
        </footer>
      </div>
    </main>
  );
}

/** the seven routes every version generates (the engine contract — one handler per route). */
const versionroutes = ["chat/completions", "completions", "embeddings", "keys", "messages", "models", "responses"];

/** the auth method families of the 12 supported methods (the examples name the providers each covers). */
const authmethods = [
  { method: "bearer", examples: "openai nvidia groq mistral deepseek kimi openrouter" },
  { method: "apikeyheader", examples: "anthropic x-api-key gemini x-goog-api-key azure api-key" },
  { method: "queryparam", examples: "legacy google key api_key params" },
  { method: "basic", examples: "generic rest base64 user pass" },
  { method: "oauth2clientcredentials", examples: "ibm watsonx azure entra auth0" },
  { method: "jwtsign", examples: "zhipu bigmodel hs256 keyid secret" },
  { method: "sigv4", examples: "aws bedrock aws4-hmac-sha256" },
  { method: "anonymous", examples: "opencode zen kilo ollama keyless" },
];

/** the display copy of each thinking level (the budgets derive from the catalog). */
const thinkingcopy: Record<string, string> = {
  none: "no thinking",
  minimal: "quick reasoning",
  low: "light reasoning",
  medium: "balanced",
  high: "deep reasoning default",
  xhigh: "extra deep",
  max: "maximum",
};

/** the live/paused badge of one version derived from its paused kill-switch. */
function versionstatus(version: gatewayconfig): { badge: string; color: string } {
  return version.paused ? { badge: "paused", color: "#f59e0b" } : { badge: "live", color: "#10b981" };
}

/** the status badge element of one version: the color derives from the kill-switch. */
function statusbadge(version: gatewayconfig) {
  const status = versionstatus(version);
  return (
    <span
      className="gateway-badge"
      style={{
        color: status.color,
        borderColor: `${status.color}44`,
        background: `${status.color}22`,
      }}
    >
      {status.badge}
    </span>
  );
}

/** the rotation pattern of one version: its metamodel pattern or its note. */
function versionpattern(version: gatewayconfig): string {
  return version.metamodel.pattern ?? version.note ?? "";
}

/** the model line of one version card: the catalog count and the masked meta face. */
function versionmodelsline(version: gatewayconfig): string {
  return `${version.models.length} models · ${version.metamodel.id} meta`;
}

/** the thinking levels derived from the v1 budgets — the single catalog is the source, never a copied list. */
const thinkinglevels = Object.entries(config.versions.v1?.thinking?.budgets ?? {}).map(([level, budget]) => ({
  level,
  budget: String(budget),
  desc: thinkingcopy[level] ?? "",
}));

/** the compact definition summary the explorer renders: what the engine would load, one line per version. */
const definitionsummary = {
  name: config.name,
  description: config.description,
  versions: Object.fromEntries(
    Object.entries(config.versions).map(([id, version]) => [
      id,
      {
        provider: version.providername,
        upstreams: version.upstreams.map((upstream) => upstream.name),
        auth: version.auth.mode,
        models: version.models.length,
        defaultmodel: version.defaultmodel,
        rotation: version.rotation?.mode ?? "fixed",
        metamodel: version.metamodel.id,
        paused: version.paused === true,
      },
    ]),
  ),
};

/** the library usage block the page renders beside the catalog. */
const usageblock = [
  "# scaffold a new gateway",
  "npx @wenathlan/devthink gateway init",
  "",
  "# add a version with any baseurl any models any auth",
  "npx @wenathlan/devthink gateway add v6",
  "",
  "# register keys for rotation",
  "npx @wenathlan/devthink gateway keys v6",
  "",
  "# start the server",
  "npx @wenathlan/devthink gateway serve --port 3001",
  "",
  "# or embed the library",
  'import { createversion, loadconfig } from "@wenathlan/devthink"',
  "const def = await loadconfig()",
  "const handlers = createversion(def.versions.v1)",
  "const response = await handlers.handlechatcompletions(request)",
].join("\n");

/** the merged repository structure the page documents. */
const structureblock = `devthink/
  gateway-index.ts          # the library barrel — the ./gateway-lib surface
  engine.ts                 # universal engine — routes, rotation, retry, fallback
  gateway-http.ts           # the http transport — hono server + sse pipeline
  gateway-cli.ts            # the scaffolding cli (init add keys serve export)
  gateway-configloader.ts   # config validation + the standard Sol/config.* probe
  gateway-auth.ts           # the 12 auth methods + key resolution
  database.ts               # prisma + libsql client
  types.ts                  # the public types of every family (gateway section)
  Sol/                      # the design room of the whole project
    App.tsx                 # the workbench entry — one router, one mount
    gatewayview/            # this console — the embedded gateway face
      Gateway.tsx           # this page (self-contained, no main.tsx)
      config.ts             # the shipped v1–v5 definitions (data only)
      definition.ts         # the view-side structural contract
    schema.prisma           # the database schema
    prisma/                 # the local sqlite home — Sol/prisma/devthink.db
    console/                # the cli design page
    capacitor.config.ts     # the android wrapper — same interface
    vercel.json netlify.toml # platform manifests — deploy from here
  prisma.config.ts          # prisma 7 config (datasource url, client output)
  Dockerfile                # the one container file
  .github/workflows/        # ci release publish npm maven nuget ghcr security maintenance
  tests/                    # vitest tests flat *.test.ts
  package.json              # @wenathlan/devthink public`;

/** the gateway console page: the overview or the detail view of one version. */
export default function Gateway() {
  ensureGatewayCss();
  const [detail, params] = useRoute("/gateway/v/:versionId");
  const version = detail ? config.versions[params?.versionId ?? ""] : undefined;

  if (detail) {
    return (
      <ConsoleFrame>
        <header className="pagehead halftone">
          <p className="pagehead__eyebrow">devthink · gateway</p>
          <h1 className="pagehead__title">
            {version ? `${version.id} — ${version.providername}` : "version not found"}
          </h1>
          <p className="pagehead__lede">
            {version
              ? `${versionpattern(version)} — ${version.note ?? ""}`
              : "The requested version stays outside the shipped catalog; open the gateway overview for the configured versions."}
          </p>
          {/* the retired .gateway-toolbar row rides the hero actions slot */}
          <div className="pagehead__actions">
            <Link href="/gateway" className="gateway-back">
              <ArrowLeft size={14} aria-hidden="true" />
              gateway overview
            </Link>
            {version ? statusbadge(version) : null}
          </div>
        </header>
        {version ? (
          <>
            <section className="gateway-panel" aria-labelledby="gatewayroutestitle">
              <h2 id="gatewayroutestitle">
                <Network size={16} />
                routes — 7 per version
              </h2>
              <div className="gv-routes">
                {versionroutes.map((route) => (
                  <article key={route}>
                    <span>post /api/{version.id}</span>
                    <code>/{route}</code>
                  </article>
                ))}
              </div>
              <p className="gateway-note">
                get /api/{version.id}/{"{route}"} returns the version info descriptor.
              </p>
            </section>
            <section className="gateway-panel" aria-labelledby="gatewaymodelstitle">
              <h2 id="gatewaymodelstitle">
                <KeyRound size={16} />
                models — {version.models.length} configured
              </h2>
              <pre className="gateway-pre">
                {version.models
                  .map(
                    (model) =>
                      `${model.id.padEnd(52)} ${Math.round(model.context / 1024)}k ctx  ${Math.round(model.maxoutput / 1024) || 1}k out${model.free ? "  free" : ""}${model.vision ? "  vision" : ""}${model.reasoning ? "" : "  no-reasoning"}`,
                  )
                  .join("\n")}
              </pre>
            </section>
            <section className="gateway-panel" aria-labelledby="gatewaypolicytitle">
              <h2 id="gatewaypolicytitle">
                <RefreshCcw size={16} />
                policy — auth, rotation and retry
              </h2>
              <div className="gv-policy">
                <article>
                  <span>auth</span>
                  <strong>
                    {version.auth.mode}
                    {version.auth.required ? " · required" : " · optional"}
                  </strong>
                  <small>{version.auth.keysources?.join(" ") ?? "keyless"}</small>
                </article>
                <article>
                  <span>rotation</span>
                  <strong>{version.rotation?.mode ?? "fixed"}</strong>
                  <small>
                    {version.rotation
                      ? `${version.rotation.models.length} models every ${version.rotation.everynmessages ?? 1} message${(version.rotation.everynmessages ?? 1) === 1 ? "" : "s"}`
                      : "the default model answers every call"}
                  </small>
                </article>
                <article>
                  <span>retry</span>
                  <strong>
                    {version.retry?.fallback === "crossprovider"
                      ? "cross-provider fallback"
                      : `max ${version.retry?.maxretries ?? 0}`}
                  </strong>
                  <small>
                    {version.retry?.statuses?.length
                      ? `retry on ${version.retry.statuses.join(" ")}`
                      : "no status retries"}
                  </small>
                </article>
                <article>
                  <span>meta</span>
                  <strong>{version.metamodel.id}</strong>
                  <small>
                    {version.metamodel.maskupstreammodel ? "upstream models masked" : "upstream models shown"}
                  </small>
                </article>
              </div>
            </section>
          </>
        ) : (
          <div className="control-empty">
            <h2>version {params?.versionId} not found</h2>
            <p>
              The shipped catalog carries {Object.keys(config.versions).length} versions; the requested id stays outside
              it.
            </p>
          </div>
        )}
      </ConsoleFrame>
    );
  }

  return (
    <ConsoleFrame>
      <header className="pagehead halftone">
        <p className="pagehead__eyebrow">devthink · gateway</p>
        <h1 className="pagehead__title">Gateway</h1>
        <p className="pagehead__lede">
          Every provider behind one local door — the shipped v1–v5 catalog, any llm, any baseurl, any api key, with the
          12 auth methods, the 2-calls thinking pattern and the rotation, retry and fallback policies. This console
          renders the shipped definition of the embedded engine.
        </p>
      </header>
      <section className="gateway-panel" aria-labelledby="gatewayversionstitle">
        <h2 id="gatewayversionstitle">
          <Network size={16} />
          versions — {Object.keys(config.versions).length} configured
        </h2>
        <div className="gv-versions grain">
          {Object.values(config.versions).map((version, index) => (
            <Link
              key={version.id}
              href={`/gateway/v/${version.id}`}
              className="gv-version"
              aria-label={`open the ${version.id} detail`}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <span className="gv-version__main">
                <span className="gv-version__id">{version.id}</span>
                <span className="gv-version__provider">{version.providername}</span>
              </span>
              <span className="gv-version__side">
                {statusbadge(version)}
                <span className="gv-version__models" style={TABULAR}>
                  {versionmodelsline(version)}
                </span>
              </span>
              <span className="gv-version__pattern">{versionpattern(version)}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="gateway-panel" aria-labelledby="gatewayauthtitle">
        <h2 id="gatewayauthtitle">
          <ShieldCheck size={16} />
          auth methods — 12 supported
        </h2>
        <div className="gv-auth">
          {authmethods.map((auth) => (
            <article key={auth.method}>
              <strong>{auth.method}</strong>
              <span>{auth.examples}</span>
            </article>
          ))}
        </div>
      </section>
      <section className="gateway-panel" aria-labelledby="gatewaythinkingtitle">
        <h2 id="gatewaythinkingtitle">
          <RefreshCcw size={16} />
          thinking levels — the 2-calls pattern
        </h2>
        <div className="gv-thinking">
          {thinkinglevels.map((level) => (
            <article key={level.level} data-default={level.desc.includes("default") ? "true" : "false"}>
              <strong>{level.level}</strong>
              <span className="gv-thinking__budget" style={TABULAR}>
                {level.budget}
              </span>
              <small>{level.desc}</small>
            </article>
          ))}
        </div>
      </section>
      <section className="gateway-panel" aria-labelledby="gatewayusagetitle">
        <h2 id="gatewayusagetitle">
          <KeyRound size={16} />
          library usage
        </h2>
        <pre className="gateway-pre">{usageblock}</pre>
      </section>
      <section className="gateway-panel" aria-labelledby="gatewaystructuretitle">
        <h2 id="gatewaystructuretitle">
          <Network size={16} />
          structure — the library at root, the design in web
        </h2>
        <pre className="gateway-pre">{structureblock}</pre>
      </section>
      <details className="gateway-explorer">
        <summary>the loaded definition — the compact summary of the shipped catalog</summary>
        <pre className="gateway-pre">{JSON.stringify(definitionsummary, null, 2)}</pre>
      </details>
    </ConsoleFrame>
  );
}
