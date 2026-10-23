/**
 * gatewayview page anchor — layer 3 of the anchor architecture. The file
 * carrying the folder's own name is the path manager of the page; only the
 * theme anchor (Sol/Sol.tsx) and the window binding (Sol/panel/workspace.tsx)
 * consume this file.
 *
 * gatewayview — the embedded gateway console of the devthink workbench: the
 * shipped v1–v5 catalog, the auth methods, the 2-calls thinking budgets, the
 * library usage and the structure of the merged repository, with one detail
 * view per version. every row derives from the single catalog at the repo
 * root (gatewayviewconfig.ts — the user customization layer the engine
 * reads); no view keeps a second copy of the definitions.
 *
 * Embedded contract (the windows law): the desktop window mounts this anchor
 * with embedded — no ShellChrome, no viewport-height page floor, the window
 * frame owns the chrome and the version detail opens inside the window
 * through local state (deep links keep their full page, the window never
 * navigates the desktop away). Standalone keeps today's page behavior: ONE
 * ShellChrome navbar + the .pagehead hero contract inside .page-container.
 *
 * Wave 3-d identity: the gateway bronze #b9963b rides the marks only (the
 * panel header glyphs, the models meter dot, the default-budget indicator
 * edge) while the hover washes stay neutral slate (--dtv3-sig scoped to ink)
 * and the live/paused badge answers the theme status tokens — status never
 * carries the identity tint. C1-04 anti-vibe-code pass: the catalog reads
 * specimen-grade — hairline-ruled rows with quiet hover washes instead of
 * boxed tile grids. R2-b data ledger: the hero stages the engine
 * .shader-stage, the overview body reads asymmetric 1.6fr/1fr and rows rise
 * 240ms at 60ms steps, reduced-motion guarded. No route, data or export
 * changes.
 */
import {ArrowLeftRegular as ArrowLeft, KeyRegular as KeyRound, CommunicationRegular as Network, ArrowCounterclockwiseRegular as RefreshCcw, ShieldRegular as ShieldCheck, WindowConsoleRegular as TerminalSquare} from "@fluentui/react-icons";
import type { CSSProperties } from "react";
import { useState } from "react";
import { Link, useRoute } from "wouter";
import { osAppLabels } from "../../catalog.ts";
import {
  osGatewayAuthMethods,
  osGatewayRoutes,
  osGatewayStructureBlock,
  osGatewayThinking,
  osGatewayUsageBlock,
  osText,
} from "../../oslabels.ts";
import { ShellChrome } from "@/components/shell.shellchrome";
import { config } from "../../gatewayviewconfig.ts";
import type { gatewayconfig } from "../../gatewayviewdefinition.ts";

/** the window title rides the catalog label row, never a hardcoded literal
 * (the bare id keeps the heading honest if the row is missing). */
const GATEWAY_LABEL = osAppLabels().gateway;

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
.atmos::before, .atmos::after, .grain::before, .grain::after { pointer-events: none; }
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

/* ---- wave 3-d — the embedded window contract, the bronze identity and the
        light-body retune. .gv-root rides both surfaces (page and window),
        .gv-embedded only rides the window body; both win by cascade order
        inside this one stylesheet. ---- */

/* the identity scope: the signal resolves to neutral ink so every hover wash
   and code accent stays slate, the bronze lands on the marks only */
.gv-root { --dtv3-sig: var(--dtv3-ink-1); }
.gv-root .gateway-panel > h2 svg { color: #b9963b; }
.gv-root .r2b-meter > i { background: #b9963b; box-shadow: 0 0 0 3px color-mix(in srgb, #b9963b 18%, transparent); }
.gv-root .gv-thinking article[data-default="true"] { background: color-mix(in srgb, #b9963b 8%, transparent); box-shadow: inset 2px 0 0 #b9963b; }
.gv-root .gv-thinking article[data-default="true"] .gv-thinking__budget { color: var(--dtv3-ink-1); }

/* the status badge answers the theme tokens — live/paused is status, never
   the identity tint */
.gv-root .gateway-badge[data-state="live"] { color: var(--color-ok); border-color: color-mix(in srgb, var(--color-ok) 45%, transparent); background: color-mix(in srgb, var(--color-ok) 10%, transparent); }
.gv-root .gateway-badge[data-state="paused"] { color: var(--color-warn); border-color: color-mix(in srgb, var(--color-warn) 45%, transparent); background: color-mix(in srgb, var(--color-warn) 10%, transparent); }

/* the touch and focus law: 44px targets, visible slate rings, press scale */
.gv-root .gateway-back { min-height: 44px; }
.gv-root .gateway-back:focus-visible,
.gv-root .gateway-explorer summary:focus-visible,
.gv-root .gv-version:focus-visible { outline: 2px solid var(--dtv3-ink-1); outline-offset: 2px; }
.gv-root .gv-version { text-align: left; }
.gv-root .gv-version:active { transform: scale(0.98); }

/* the code ledger reads as the Windows Terminal pane inside the light body:
   #1e1e1e with the console ok ink (the family dark-pane contract) */
.gv-root .gateway-pre { color: #c9c0b8; background: #1e1e1e; border-color: color-mix(in srgb, #1e1e1e 55%, var(--dtv3-hairline)); font: 500 11px / 1.7 var(--dt-mono); }
.gv-root .gateway-explorer { background: color-mix(in srgb, var(--dtv3-ink-1) 3%, transparent); }
[data-theme="light"] .gv-root .gateway-back { color: var(--dtv3-ink-2); background: rgb(15 23 42 / 4%); border-color: var(--dtv3-hairline); }
[data-theme="light"] .gv-root .gateway-back:hover { color: var(--dtv3-ink-1); background: rgb(15 23 42 / 8%); }

/* the embedded window body: the frame owns the chrome, this body fills the
   canvas, scrolls on its own and compacts the pagehead hero */
.control-page.gv-embedded { min-height: 0; height: 100%; overflow-y: auto; }
.gv-embedded .page-container { padding: 18px 22px 28px; }
.gv-embedded .pagehead { margin-bottom: 18px; }
.gv-embedded .pagehead.r2b-head { gap: 8px; }
.gv-embedded .r2a-display { font-size: clamp(24px, 3vw, 34px); }
.gv-embedded .r2a-lede { font-size: 13px; }
.gv-embedded .gv-body { gap: 22px; }
.gv-embedded .gateway-panel + .gateway-panel { margin-top: 22px; }
.gv-embedded .gateway-explorer { margin-top: 22px; }
@media (prefers-reduced-motion: reduce) { .gv-root .gv-version:active { transform: none; } }
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

/** the page floor shared by both views. Standalone: ONE navbar +
 * .page-container body + footer. Embedded (the windows law): the window
 * frame owns the chrome — no navbar, no viewport-height floor, no footer; the
 * body fills the window canvas and scrolls on its own. */
function ConsoleFrame({ embedded, children }: { embedded?: boolean; children: React.ReactNode }) {
  if (embedded) {
    return (
      <main className="control-page atmos gv-root gv-embedded">
        <div className="page-container">{children}</div>
      </main>
    );
  }
  return (
    <main className="control-page atmos gv-root">
      <ShellChrome />
      <div className="page-container">
        {children}
        <footer className="control-page__footer">
          <TerminalSquare fontSize={14} aria-hidden="true" />
          {osText("gateway.footer")}
        </footer>
      </div>
    </main>
  );
}

/** the seven routes every version generates — the label table owns the
 * engine contract rows (the oslabels gateway seed). */
const versionroutes = osGatewayRoutes();

/** the auth method families of the 12 supported methods (the examples name
 * the providers each covers) — the oslabels gateway seed. */
const authmethods = osGatewayAuthMethods();

/** the live/paused badge of one version: the state rides the data-state
 * attribute and the theme tokens paint it (status never carries the identity
 * tint — the ok/warn pair answers both themes). */
function statusbadge(version: gatewayconfig) {
  return (
    <span className="gateway-badge" data-state={version.paused ? "paused" : "live"}>
      {version.paused ? osText("gateway.badge.paused") : osText("gateway.badge.live")}
    </span>
  );
}

/** the rotation pattern of one version: its metamodel pattern or its note. */
function versionpattern(version: gatewayconfig): string {
  return version.metamodel.pattern ?? version.note ?? "";
}

/** the model line of one version card: the catalog count and the masked meta face. */
function versionmodelsline(version: gatewayconfig): string {
  return osText("gateway.modelsLine")
    .replace("{count}", String(version.models.length))
    .replace("{meta}", version.metamodel.id);
}

/** the thinking levels derived from the v1 budgets — the single catalog is the source, never a copied list. */
const thinkinglevels = Object.entries(config.versions.v1?.thinking?.budgets ?? {}).map(([level, budget]) => ({
  level,
  budget: String(budget),
  desc: osGatewayThinking(level) }));

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
        paused: version.paused === true },
    ]),
  ) };

/** the library usage block the page renders beside the catalog — the
 * oslabels gateway seed owns the lines. */
const usageblock = osGatewayUsageBlock();

/** the merged repository structure the page documents — the oslabels
 * gateway seed owns the block. */
const structureblock = osGatewayStructureBlock();

/** one version row of the ledger: a route link on the page, an in-place
 * button inside the embedded window (the windows law — the detail opens in
 * the same frame, the window never navigates the desktop away). */
function VersionRow({
  version,
  index,
  embedded,
  onOpen }: {
  version: gatewayconfig;
  index: number;
  embedded: boolean;
  onOpen: (id: string) => void;
}) {
  const content = (
    <>
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
    </>
  );
  if (embedded) {
    return (
      <button
        key={version.id}
        type="button"
        className="gv-version"
        aria-label={osText("gateway.openDetail").replace("{id}", version.id)}
        style={step(index)}
        onClick={() => onOpen(version.id)}
      >
        {content}
      </button>
    );
  }
  return (
    <Link
      key={version.id}
      href={`/gateway/v/${version.id}`}
      className="gv-version"
      aria-label={osText("gateway.openDetail").replace("{id}", version.id)}
      style={step(index)}
    >
      {content}
    </Link>
  );
}

/** the gateway console: the overview or the detail view of one version —
 * the full page on the route, the window body when the desktop mounts it
 * with the embedded contract. */
export default function GatewayView({ embedded }: { embedded?: boolean }) {
  ensureGatewayCss();
  const [detail, params] = useRoute("/gateway/v/:versionId");
  /** the in-window detail: the embedded surface keeps its own open version
   * (deep links keep their full page — the window never navigates away) */
  const [windowDetail, setWindowDetail] = useState<string | null>(null);
  const detailId = embedded ? windowDetail : detail ? (params?.versionId ?? "") : "";
  const version = detailId ? config.versions[detailId] : undefined;

  if (detailId) {
    return (
      <ConsoleFrame embedded={embedded}>
        <header className="pagehead r2b-head shader-stage enter" style={step(0)}>
          <div className="radial-light" aria-hidden="true" />
          <div className="grain-overlay" aria-hidden="true" />
          <p className="pagehead__eyebrow r2a-eyebrow">{osText("gateway.eyebrow")}</p>
          <h1 className="pagehead__title r2a-display">
            {version ? `${version.id} ${version.providername}` : osText("gateway.versionNotFound")}
          </h1>
          <p className="pagehead__lede r2a-lede">
            {version
              ? `${versionpattern(version)} ${version.note ?? ""}`
              : osText("gateway.versionNotFoundLede")}
          </p>
          {/* the retired .gateway-toolbar row rides the hero actions slot —
              inside the window the back action resets the in-window detail */}
          <div className="pagehead__actions">
            {embedded ? (
              <button type="button" className="gateway-back" onClick={() => setWindowDetail(null)}>
                <ArrowLeft fontSize={14} aria-hidden="true" />
                {osText("gateway.overview")}
              </button>
            ) : (
              <Link href="/gateway" className="gateway-back">
                <ArrowLeft fontSize={14} aria-hidden="true" />
                {osText("gateway.overview")}
              </Link>
            )}
            {version ? statusbadge(version) : null}
          </div>
        </header>
        {version ? (
          <div className="gv-body">
            <div className="gv-main">
              <section className="gateway-panel" aria-labelledby="gatewaymodelstitle">
                <h2 id="gatewaymodelstitle">
                  <KeyRound fontSize={16} />
                  {osText("gateway.modelsConfigured").replace("{count}", String(version.models.length))}
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
                  <RefreshCcw fontSize={16} />
                  {osText("gateway.policyTitle")}
                </h2>
                <div className="gv-policy">
                  <article>
                    <span>{osText("gateway.authLabel")}</span>
                    <strong>
                      {version.auth.mode}
                      {version.auth.required ? osText("gateway.auth.required") : osText("gateway.auth.optional")}
                    </strong>
                    <small>{version.auth.keysources?.join(" ") ?? osText("gateway.keyless")}</small>
                  </article>
                  <article>
                    <span>{osText("gateway.rotationLabel")}</span>
                    <strong>{version.rotation?.mode ?? osText("gateway.fixed")}</strong>
                    <small>
                      {version.rotation
                        ? (version.rotation.everynmessages ?? 1) === 1
                          ? osText("gateway.rotationLine")
                              .replace("{models}", String(version.rotation.models.length))
                              .replace("{messages}", String(version.rotation.everynmessages ?? 1))
                          : osText("gateway.rotationLinePlural")
                              .replace("{models}", String(version.rotation.models.length))
                              .replace("{messages}", String(version.rotation.everynmessages ?? 1))
                        : osText("gateway.defaultModel")}
                    </small>
                  </article>
                  <article>
                    <span>{osText("gateway.retryLabel")}</span>
                    <strong>
                      {version.retry?.fallback === "crossprovider"
                        ? osText("gateway.crossProvider")
                        : osText("gateway.maxRetries").replace("{count}", String(version.retry?.maxretries ?? 0))}
                    </strong>
                    <small>
                      {version.retry?.statuses?.length
                        ? osText("gateway.retryOn").replace("{statuses}", version.retry.statuses.join(" "))
                        : osText("gateway.noStatusRetries")}
                    </small>
                  </article>
                  <article>
                    <span>{osText("gateway.metaLabel")}</span>
                    <strong>{version.metamodel.id}</strong>
                    <small>
                      {version.metamodel.maskupstreammodel ? osText("gateway.masked") : osText("gateway.shown")}
                    </small>
                  </article>
                </div>
              </section>
            </div>
            <div className="gv-rail">
              <section className="gateway-panel" aria-labelledby="gatewayroutestitle">
                <h2 id="gatewayroutestitle">
                  <Network fontSize={16} />
                  {osText("gateway.routesTitle")}
                </h2>
                <div className="gv-routes">
                  {versionroutes.map((route) => (
                    <article key={route}>
                      <span>{osText("gateway.routePost").replace("{version}", version.id)}</span>
                      <code>/{route}</code>
                    </article>
                  ))}
                </div>
                <p className="gateway-note">
                  {osText("gateway.routeInfo").replace("{version}", version.id)}
                </p>
              </section>
            </div>
          </div>
        ) : (
          <div className="control-empty">
            <h2>{osText("gateway.versionMissing").replace("{id}", detailId)}</h2>
            <p>
              {osText("gateway.shippedCount").replace("{count}", String(Object.keys(config.versions).length))}
            </p>
          </div>
        )}
      </ConsoleFrame>
    );
  }

  return (
    <ConsoleFrame embedded={embedded}>
      <header className="pagehead r2b-head shader-stage enter" style={step(0)}>
        <div className="radial-light" aria-hidden="true" />
        <div className="grain-overlay" aria-hidden="true" />
        <p className="pagehead__eyebrow r2a-eyebrow">{osText("gateway.eyebrow")}</p>
        <h1 className="pagehead__title r2a-display">{GATEWAY_LABEL?.name ?? "Gateway"}</h1>
        <p className="pagehead__lede r2a-lede">{osText("gateway.lede")}</p>
      </header>
      <div className="gv-body">
        <div className="gv-main">
          <section className="gateway-panel" aria-labelledby="gatewayversionstitle">
            <h2 id="gatewayversionstitle">
              <Network fontSize={16} />
              {osText("gateway.versionsTitle").replace("{count}", String(Object.keys(config.versions).length))}
            </h2>
            <div className="gv-versions">
              {Object.values(config.versions).map((version, index) => (
                <VersionRow
                  key={version.id}
                  version={version}
                  index={index}
                  embedded={embedded ?? false}
                  onOpen={setWindowDetail}
                />
              ))}
            </div>
          </section>
        </div>
        <div className="gv-rail">
          <section className="gateway-panel" aria-labelledby="gatewaythinkingtitle">
            <h2 id="gatewaythinkingtitle">
              <RefreshCcw fontSize={16} />
              {osText("gateway.thinkingTitle")}
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
              <ShieldCheck fontSize={16} />
              {osText("gateway.authTitle")}
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
              <KeyRound fontSize={16} />
              {osText("gateway.usageTitle")}
            </h2>
            <pre className="gateway-pre">{usageblock}</pre>
          </section>
        </div>
      </div>
      <section className="gateway-panel" aria-labelledby="gatewaystructuretitle">
        <h2 id="gatewaystructuretitle">
          <Network fontSize={16} />
          {osText("gateway.structureTitle")}
        </h2>
        <pre className="gateway-pre">{structureblock}</pre>
      </section>
      <details className="gateway-explorer">
        <summary>{osText("gateway.explorerSummary")}</summary>
        <pre className="gateway-pre">{JSON.stringify(definitionsummary, null, 2)}</pre>
      </details>
    </ConsoleFrame>
  );
}
