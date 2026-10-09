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
 *
 * R2-b data ledger: the console joins the staged editorial grammar — the
 * hero stages the engine .shader-stage with ONE .shader-fallback bloom, the
 * .halftone-edge dissolve and the grain film, the Bricolage display line
 * entering once through the engine .enter kit. The overview body reads
 * asymmetric 1.6fr/1fr: the versions ledger dominant (hairline rows with
 * the signal 10% hover tint and the machined model-count meters on the
 * mono-axis ruler), the thinking levels + auth methods + library usage on
 * the sticky rail; the structure pre and the definition explorer close the
 * page full width. The detail view mirrors the split (models + policy
 * dominant, routes on the rail). Numerals ride tabular mono/display-700;
 * rows rise 240ms at 60ms steps, reduced-motion guarded. No route, data or
 * export changes.
 */
import { ArrowLeft, KeyRound, Network, RefreshCcw, ShieldCheck, TerminalSquare } from "lucide-react";
import type { CSSProperties } from "react";
import { Link, useRoute } from "wouter";
import { ShellChrome } from "@/shell/ShellChrome";
import { config } from "./config";
import type { gatewayconfig } from "./definition";

/** the entrance stagger of the page: one orchestrated rise through the
 * engine .enter kit, the delay reading the --i custom prop (70ms steps). */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

/** the largest shipped model count — the meter scale of the versions
 * ledger, derived from the catalog (never hardcoded). */
const maxmodels = Math.max(...Object.values(config.versions).map((version) => version.models.length), 1);

/** The gateway slice of the R2-b pass: the staged hero, the asymmetric
 * ledger split, the signal-10% hover tints, the machined meters and the
 * detail-view mirror live with the page. The atmosphere guard keeps the C1
 * and engine layers off the pointer path. */
const GATEWAY_CSS = `
.atmos::before, .atmos::after, .grain::before, .grain::after,
.halftone::before, .halftone::after { pointer-events: none; }
.control-page.atmos { position: relative; }
.page-container .gateway-panel + .gateway-panel { margin-top: 30px; }
.page-container .gateway-explorer { margin-top: 30px; }
.gv-body { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(280px, 1fr); gap: 34px; align-items: start; margin-top: 4px; }
.gv-main { display: grid; gap: 30px; min-width: 0; }
.gv-rail { display: grid; gap: 30px; align-content: start; min-width: 0; }
.gateway-panel { display: grid; gap: 12px; min-width: 0; }
.gateway-panel > h2 { display: flex; align-items: center; gap: 8px; margin: 0; padding-bottom: 10px; border-bottom: 1px solid var(--dt-edge-strong); color: var(--dtv3-ink-1); font: 600 11px var(--dt-mono); letter-spacing: .08em; text-transform: lowercase; }
.gateway-panel > h2 svg { color: var(--dtv3-sig); flex-shrink: 0; }
.gv-versions { display: grid; margin: 0; padding: 0; list-style: none; }
.gv-version { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px 20px; align-items: center; padding: 15px 12px; border-bottom: 1px solid var(--dtv3-hairline); border-radius: 10px; text-decoration: none; transition: background 160ms var(--dtv3-ease); animation: gvRise 240ms var(--dtv3-ease) backwards; animation-delay: calc(var(--i, 0) * 60ms); }
.gv-version:hover { background: color-mix(in srgb, var(--dtv3-sig) 10%, transparent); }
.gv-version:focus-visible { outline: 2px solid color-mix(in srgb, var(--dtv3-sig) 45%, transparent); outline-offset: -2px; }
.gv-version__main { display: grid; gap: 3px; min-width: 0; }
.gv-version__id { color: var(--dtv3-ink-1); font: 700 15px/1.2 var(--dt-mono); font-variant-numeric: tabular-nums; }
.gv-version__provider { color: var(--dtv3-ink-2); font: 400 12px/1.5 var(--dt-sans); }
.gv-version__pattern { overflow: hidden; color: var(--dtv3-ink-3); font: 400 10px/1.6 var(--dt-mono); text-overflow: ellipsis; white-space: nowrap; }
.gv-version__side { display: grid; gap: 7px; align-content: center; justify-items: end; min-width: 150px; }
.gv-version__models { color: var(--dtv3-ink-3); font: 500 10px var(--dt-mono); letter-spacing: .06em; font-variant-numeric: tabular-nums; }
.gv-spark { display: block; width: 132px; }
.gv-thinking { display: grid; margin: 0; }
.gv-thinking article { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 14px; padding: 11px 12px 11px 2px; border-bottom: 1px solid var(--dtv3-hairline); border-radius: 10px; transition: background 160ms var(--dtv3-ease); }
.gv-thinking article:hover { background: color-mix(in srgb, var(--dtv3-sig) 10%, transparent); }
.gv-thinking article strong { color: var(--dtv3-ink-1); font: 500 11px var(--dt-mono); letter-spacing: .04em; }
.gv-thinking article small { color: var(--dtv3-ink-3); font: 400 10px var(--dt-mono); }
.gv-thinking__budget { grid-row: 1 / 3; grid-column: 2; align-self: center; color: var(--dtv3-ink-1); font: 700 20px/1 var(--dt-sans); font-variant-numeric: tabular-nums; }
.gv-thinking article[data-default="true"] .gv-thinking__budget { color: var(--dtv3-sig); }
.gv-auth { display: grid; margin: 0; }
.gv-auth article { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; padding: 10px 12px 10px 2px; border-bottom: 1px solid var(--dtv3-hairline); border-radius: 10px; transition: background 160ms var(--dtv3-ease); }
.gv-auth article:hover { background: color-mix(in srgb, var(--dtv3-sig) 10%, transparent); }
.gv-auth article strong { color: var(--dtv3-ink-1); font: 500 11px var(--dt-mono); }
.gv-auth article span { overflow-wrap: anywhere; color: var(--dtv3-ink-3); font: 400 10px/1.6 var(--dt-mono); text-align: right; }
.gv-routes { display: grid; margin: 0; }
.gv-routes article { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; padding: 10px 12px 10px 2px; border-bottom: 1px solid var(--dtv3-hairline); border-radius: 10px; transition: background 160ms var(--dtv3-ease); }
.gv-routes article:hover { background: color-mix(in srgb, var(--dtv3-sig) 10%, transparent); }
.gv-routes span { color: var(--dtv3-ink-3); font: 500 10px var(--dt-mono); letter-spacing: .06em; }
.gv-routes code { color: var(--dtv3-ink-1); font: 600 11px var(--dt-mono); }
.gv-policy { display: grid; margin: 0; }
.gv-policy article { display: grid; grid-template-columns: 76px minmax(0, 1fr); gap: 2px 12px; padding: 12px 12px 12px 2px; border-bottom: 1px solid var(--dtv3-hairline); border-radius: 10px; transition: background 160ms var(--dtv3-ease); }
.gv-policy article:hover { background: color-mix(in srgb, var(--dtv3-sig) 10%, transparent); }
.gv-policy article > span { color: var(--dtv3-ink-3); font: 500 10px/1.9 var(--dt-mono); letter-spacing: .06em; }
.gv-policy article strong { color: var(--dtv3-ink-1); font: 600 12.5px/1.5 var(--dt-sans); overflow-wrap: anywhere; }
.gv-policy article small { grid-column: 2; overflow-wrap: anywhere; color: var(--dtv3-ink-3); font: 400 10px/1.6 var(--dt-mono); }
.gateway-pre { margin: 0; padding: 16px; overflow: auto; color: var(--dtv3-ink-2); background: rgb(0 0 0 / 26%); border: 1px solid var(--dtv3-hairline); border-radius: var(--dtv3-r-2); font: 500 10.5px/1.8 var(--dt-mono); font-variant-numeric: tabular-nums; }
.gateway-note { margin: 0; color: var(--dtv3-ink-3); font: 500 10px var(--dt-mono); letter-spacing: .04em; }
.gateway-explorer { padding: 13px 15px; background: rgb(255 255 255 / 2%); border: 1px solid var(--dtv3-hairline); border-radius: var(--dtv3-r-2); font: 500 10px var(--dt-mono); }
.gateway-explorer summary { display: flex; align-items: center; min-height: 44px; color: var(--dtv3-sig); cursor: pointer; }
.gateway-explorer .gateway-pre { margin-top: 9px; }
.gateway-back { display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 0 12px; color: var(--dtv3-ink-2); background: rgb(255 255 255 / 3%); border: 1px solid var(--dtv3-hairline); border-radius: 10px; font: 500 10px var(--dt-mono); letter-spacing: .06em; text-decoration: none; transition: color 160ms var(--dtv3-ease), background 160ms var(--dtv3-ease), transform 120ms var(--dtv3-ease); }
.gateway-back:hover { color: var(--dtv3-ink-1); background: rgb(255 255 255 / 6%); }
.gateway-back:active { transform: scale(0.96); }
@keyframes gvRise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@media (max-width: 980px) { .gv-body { grid-template-columns: minmax(0, 1fr); } .gv-rail { position: static; } }
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
        <header className="pagehead r2b-head shader-stage halftone-edge enter" style={step(0)}>
          <div className="shader-fallback" aria-hidden="true" />
          <div className="grain-overlay" aria-hidden="true" />
          <p className="pagehead__eyebrow r2a-eyebrow">devthink · gateway</p>
          <h1 className="pagehead__title r2a-display">
            {version ? `${version.id} — ${version.providername}` : "version not found"}
          </h1>
          <p className="pagehead__lede r2a-lede">
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
          <div className="gv-body">
            <div className="gv-main">
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
            </div>
            <div className="gv-rail">
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
            </div>
          </div>
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
      <header className="pagehead r2b-head shader-stage halftone-edge enter" style={step(0)}>
        <div className="shader-fallback" aria-hidden="true" />
        <div className="grain-overlay" aria-hidden="true" />
        <p className="pagehead__eyebrow r2a-eyebrow">devthink · gateway</p>
        <h1 className="pagehead__title r2a-display">One local door</h1>
        <p className="pagehead__lede r2a-lede">Every provider behind one local door — any llm, any baseurl, any key.</p>
      </header>
      <div className="gv-body">
        <div className="gv-main">
          <section className="gateway-panel" aria-labelledby="gatewayversionstitle">
            <h2 id="gatewayversionstitle">
              <Network size={16} />
              versions — {Object.keys(config.versions).length} configured
            </h2>
            <div className="gv-versions">
              {Object.values(config.versions).map((version, index) => (
                <Link
                  key={version.id}
                  href={`/gateway/v/${version.id}`}
                  className="gv-version"
                  aria-label={`open the ${version.id} detail`}
                  style={step(index)}
                >
                  <span className="gv-version__main">
                    <span className="gv-version__id">{version.id}</span>
                    <span className="gv-version__provider">{version.providername}</span>
                    <span className="gv-version__pattern">{versionpattern(version)}</span>
                  </span>
                  <span className="gv-version__side">
                    {statusbadge(version)}
                    <span className="gv-version__models">{versionmodelsline(version)}</span>
                    <span className="gv-spark">
                      <span
                        className="r2b-meter"
                        aria-hidden="true"
                        style={{ "--r2b-meter-pos": `${(version.models.length / maxmodels) * 100}%` } as CSSProperties}
                      >
                        <i />
                      </span>
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
        <div className="gv-rail">
          <section className="gateway-panel" aria-labelledby="gatewaythinkingtitle">
            <h2 id="gatewaythinkingtitle">
              <RefreshCcw size={16} />
              thinking levels — the 2-calls pattern
            </h2>
            <div className="gv-thinking">
              {thinkinglevels.map((level) => (
                <article key={level.level} data-default={level.desc.includes("default") ? "true" : "false"}>
                  <strong>{level.level}</strong>
                  <span className="gv-thinking__budget">{level.budget}</span>
                  <small>{level.desc}</small>
                </article>
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
          <section className="gateway-panel" aria-labelledby="gatewayusagetitle">
            <h2 id="gatewayusagetitle">
              <KeyRound size={16} />
              library usage
            </h2>
            <pre className="gateway-pre">{usageblock}</pre>
          </section>
        </div>
      </div>
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
