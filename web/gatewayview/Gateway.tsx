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
 */
import { ArrowLeft, KeyRound, Network, RefreshCcw, ShieldCheck } from "lucide-react";
import { Link, useRoute } from "wouter";
import { ControlShell } from "@/control.shell";
import { config } from "./config";
import type { gatewayconfig } from "./definition";

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
  gateway-configloader.ts   # config validation + the standard web/config.* probe
  gateway-auth.ts           # the 12 auth methods + key resolution
  database.ts               # prisma + libsql client
  types.ts                  # the public types of every family (gateway section)
  web/                      # the design room of the whole project
    App.tsx                 # the workbench entry — one router, one mount
    gatewayview/            # this console — the embedded gateway face
      Gateway.tsx           # this page (self-contained, no main.tsx)
      config.ts             # the shipped v1–v5 definitions (data only)
      definition.ts         # the view-side structural contract
    schema.prisma           # the database schema
    prisma/                 # the local sqlite home — web/prisma/devthink.db
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
  const [detail, params] = useRoute("/gateway/v/:versionId");
  const version = detail ? config.versions[params?.versionId ?? ""] : undefined;

  if (detail) {
    return (
      <ControlShell
        eyebrow="embedded gateway console"
        title={version ? `${version.id} — ${version.providername}` : "version not found"}
        summary={
          version
            ? `${versionpattern(version)} — ${version.note ?? ""}`
            : "The requested version stays outside the shipped catalog; open the gateway overview for the configured versions."
        }
      >
        {version ? (
          <>
            <div className="gateway-toolbar">
              <Link href="/gateway" className="gateway-back">
                <ArrowLeft size={14} />
                gateway overview
              </Link>
              <span
                className="gateway-badge"
                style={{
                  color: versionstatus(version).color,
                  borderColor: `${versionstatus(version).color}44`,
                  background: `${versionstatus(version).color}22`,
                }}
              >
                {versionstatus(version).badge}
              </span>
            </div>
            <section className="gateway-panel" aria-labelledby="gatewayroutestitle">
              <h2 id="gatewayroutestitle">
                <Network size={16} />
                routes — 7 per version
              </h2>
              <div className="gateway-routes">
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
              <div className="gateway-policy">
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
      </ControlShell>
    );
  }

  return (
    <ControlShell
      eyebrow="embedded gateway console"
      title="Every provider behind one local door."
      summary="The gateway engine the merged devthink embeds: the shipped v1–v5 catalog — any llm, any baseurl, any api key — with the 12 auth methods, the 2-calls thinking pattern and the rotation, retry and fallback policies. The library lives at the repository root; this console renders the shipped definition."
    >
      <section className="gateway-panel" aria-labelledby="gatewayversionstitle">
        <h2 id="gatewayversionstitle">
          <Network size={16} />
          versions — {Object.keys(config.versions).length} configured
        </h2>
        <div className="gateway-versions">
          {Object.values(config.versions).map((version) => (
            <Link
              key={version.id}
              href={`/gateway/v/${version.id}`}
              className="gateway-version"
              aria-label={`open the ${version.id} detail`}
            >
              <span className="gateway-version__id">{version.id}</span>
              <span
                className="gateway-badge"
                style={{
                  color: versionstatus(version).color,
                  borderColor: `${versionstatus(version).color}44`,
                  background: `${versionstatus(version).color}22`,
                }}
              >
                {versionstatus(version).badge}
              </span>
              <span className="gateway-version__provider">{version.providername}</span>
              <span className="gateway-version__pattern">{versionpattern(version)}</span>
              <span className="gateway-version__models">{versionmodelsline(version)}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="gateway-panel" aria-labelledby="gatewayauthtitle">
        <h2 id="gatewayauthtitle">
          <ShieldCheck size={16} />
          auth methods — 12 supported
        </h2>
        <div className="gateway-auth">
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
        <div className="gateway-thinking">
          {thinkinglevels.map((level) => (
            <article key={level.level}>
              <strong>{level.level}</strong>
              <span className="gateway-thinking__budget">{level.budget}</span>
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
    </ControlShell>
  );
}
