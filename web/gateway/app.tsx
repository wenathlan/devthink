/**
 * web app — self-contained entry for the gateway web ui
 * all interface is in web per skill flat no nesting
 *
 * this file embeds what main.tsx used to do — mounting plus dynamic routing:
 *   the createroot call the strictmode wrapper and the css import are all here
 *   dynamic routing detects the path and renders the right view
 *   no separate main file needed — app is the single entry
 *
 * views:
 *   /            home — all versions and routes overview
 *   /v/:id       version detail — models rotation auth config
 *   /config      the loaded gateway definition explorer
 */

import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";

// ---------------------------------------------------------------------------
// types — the shapes rendered by the ui
// ---------------------------------------------------------------------------

interface versioninfo {
  v: string;
  provider: string;
  pattern: string;
  badge: string;
  color: string;
  models: string;
  routes: string[];
  note: string;
}

// ---------------------------------------------------------------------------
// data — the version catalog rendered on the home view
// ---------------------------------------------------------------------------

const versions: versioninfo[] = [
  {
    v: "v1",
    provider: "zai sdk",
    pattern: "keyless sdk transport with 2-calls thinking pattern",
    badge: "live",
    color: "#10b981",
    models: "glm-5.3 glm-5.2 devthink meta",
    routes: [
      "chat/completions",
      "completions",
      "embeddings",
      "keys",
      "messages",
      "models",
      "responses",
    ],
    note: "v1 uses the z-ai-web-dev-sdk singleton — 2-calls thinking with fresh response guarantee",
  },
  {
    v: "v2",
    provider: "babel town",
    pattern: "ephemeral ip-bound keys paused with fallback to v1",
    badge: "paused",
    color: "#f59e0b",
    models: "babel-glm-5.3 babel-devthink",
    routes: [
      "chat/completions",
      "completions",
      "embeddings",
      "keys",
      "messages",
      "models",
      "responses",
    ],
    note: "service is paused returns 503 fallback to v1 zai",
  },
  {
    v: "v3",
    provider: "nvidia nim",
    pattern: "4-backend rotation db keys retry backoff model timeout",
    badge: "live",
    color: "#10b981",
    models: "16 models kimi-k3 deepseek-v4 muse-glimmer laguna devthink",
    routes: [
      "chat/completions",
      "completions",
      "embeddings",
      "keys",
      "messages",
      "models",
      "responses",
    ],
    note: "nvidia keys round robin from db plus env — devthink rotates every 6 messages with retry and backoff",
  },
  {
    v: "v4",
    provider: "opencode zen plus kilo",
    pattern: "anonymous free tier cross-provider fallback",
    badge: "live",
    color: "#10b981",
    models: "24 free models 7 opencode 17 kilo fusion 13.8m context",
    routes: [
      "chat/completions",
      "completions",
      "embeddings",
      "keys",
      "messages",
      "models",
      "responses",
    ],
    note: "anonymous free tier no api key required — model masking to devthink — cross-provider fallback",
  },
  {
    v: "v5",
    provider: "openrouter",
    pattern: "per-request round-robin single env key",
    badge: "live",
    color: "#10b981",
    models: "19 free models 3 exclusive glm-5.2 gemma-4",
    routes: [
      "chat/completions",
      "completions",
      "embeddings",
      "keys",
      "messages",
      "models",
      "responses",
    ],
    note: "requires free openrouter api key — per-request round-robin across the free catalog",
  },
];

const thinkinglevels = [
  { level: "none", budget: "0", desc: "no thinking" },
  { level: "minimal", budget: "1400", desc: "quick reasoning" },
  { level: "low", budget: "5500", desc: "light reasoning" },
  { level: "medium", budget: "17000", desc: "balanced" },
  { level: "high", budget: "68000", desc: "deep reasoning default" },
  { level: "xhigh", budget: "68000", desc: "extra deep" },
  { level: "max", budget: "68000", desc: "maximum" },
];

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

// ---------------------------------------------------------------------------
// router — read the path and render the matching view
// ---------------------------------------------------------------------------

/** parse the current path into a route */
function parseroute(): { view: "home" | "version" | "config"; id?: string } {
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path.startsWith("/v/")) {
    return { view: "version", id: path.slice(3) };
  }
  if (path === "/config") {
    return { view: "config" };
  }
  return { view: "home" };
}

/** navigate pushstate for spa routing without reload */
function navigate(to: string): void {
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

// ---------------------------------------------------------------------------
// home view — versions overview
// ---------------------------------------------------------------------------

function homeview(): React.ReactNode {
  return (
    <>
      <header style={{ padding: "48px 24px 24px", borderBottom: "1px solid #262626" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, margin: 0, color: "#fafafa" }}>
            @wenathlan/gateway
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#a3a3a3", marginTop: "8px" }}>
            the universal ai gateway library — any llm any baseurl any api key — 35 routes — vite
            vitest hono — vercel netlify ready
          </p>
          <p style={{ fontSize: "0.875rem", color: "#525252", marginTop: "8px" }}>
            library at root — user customization in web/config.ts — cli scaffolds everything — 12
            auth methods — 7 routes per version
          </p>
        </div>
      </header>

      <section style={{ padding: "24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2
            style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fafafa", marginBottom: "16px" }}
          >
            Versions — {versions.length} configured
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "16px",
            }}
          >
            {versions.map((version) => (
              // biome-ignore lint/a11y/useSemanticElements: version cards nest block level content that a native button element cannot legally wrap
              <div
                key={version.v}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/v/${version.v}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") navigate(`/v/${version.v}`);
                }}
                style={{
                  background: "#0f0f0f",
                  border: "1px solid #262626",
                  borderRadius: "8px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#404040";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#262626";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fafafa" }}>
                    {version.v}
                  </span>
                  <span
                    style={{
                      fontSize: "0.625rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      background: `${version.color}22`,
                      color: version.color,
                      border: `1px solid ${version.color}44`,
                    }}
                  >
                    {version.badge}
                  </span>
                </div>
                <div style={{ fontSize: "0.875rem", color: "#d4d4d4", marginBottom: "4px" }}>
                  {version.provider}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#737373", marginBottom: "8px" }}>
                  {version.pattern}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#525252" }}>{version.models}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2
            style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fafafa", marginBottom: "16px" }}
          >
            Auth methods — 12 supported
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "12px",
            }}
          >
            {authmethods.map((auth) => (
              <div
                key={auth.method}
                style={{
                  background: "#0f0f0f",
                  border: "1px solid #262626",
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#fafafa",
                    marginBottom: "4px",
                  }}
                >
                  {auth.method}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#737373" }}>{auth.examples}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2
            style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fafafa", marginBottom: "16px" }}
          >
            Thinking levels — 2-calls pattern
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
            }}
          >
            {thinkinglevels.map((t) => (
              <div
                key={t.level}
                style={{
                  background: "#0f0f0f",
                  border: "1px solid #262626",
                  borderRadius: "8px",
                  padding: "16px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fafafa" }}>
                  {t.level}
                </div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#10b981",
                    margin: "4px 0",
                  }}
                >
                  {t.budget}
                </div>
                <div style={{ fontSize: "0.6875rem", color: "#525252" }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2
            style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fafafa", marginBottom: "16px" }}
          >
            Library usage
          </h2>
          <pre
            style={{
              background: "#0f0f0f",
              border: "1px solid #262626",
              borderRadius: "8px",
              padding: "16px",
              overflow: "auto",
              fontSize: "0.75rem",
              color: "#d4d4d4",
              fontFamily: "monospace",
            }}
          >{`# scaffold a new gateway
npx @wenathlan/gateway init

# add a version with any baseurl any models any auth
npx @wenathlan/gateway add v6

# register keys for rotation
npx @wenathlan/gateway keys v6

# start the server
npx @wenathlan/gateway serve --port 3001

# or embed the library
import { createversion, loadconfig } from "@wenathlan/gateway"
const def = await loadconfig()
const handlers = createversion(def.versions.v1)
const response = await handlers.handlechatcompletions(request)`}</pre>
        </div>
      </section>

      <section style={{ padding: "24px", borderTop: "1px solid #262626" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2
            style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fafafa", marginBottom: "16px" }}
          >
            Structure — library at root customization in web
          </h2>
          <pre
            style={{
              background: "#0f0f0f",
              border: "1px solid #262626",
              borderRadius: "8px",
              padding: "16px",
              overflow: "auto",
              fontSize: "0.75rem",
              color: "#d4d4d4",
              fontFamily: "monospace",
            }}
          >{`gateway/
  index.ts                # library entry — exports everything
  types.ts                # gatewayconfig authconfig modeldef rotation retry types
  engine.ts               # universal engine — createversion produces 7 handlers
  configloader.ts         # loads web/config.ts or gateway.config.ts
  http.ts                 # universal hono server + sse stream — one transport file
  cli.ts                  # the intelligent scaffolding cli — init add keys serve
  authentication.ts       # universal 12 auth methods key resolution
  database.ts             # prisma client with libsql adapter
  utils.ts                # shared helpers cors ids tokens truncation
  web/                    # design layer — one interface deploy-ready
    app.tsx               # this ui — self-contained entry no main.tsx
    config.ts             # the v1 v5 definitions — hardcoded user values
    schema.prisma         # the database schema
    globals.css           # styles
    index.html            # vite entry
    vite.config.ts        # builds to ../dist
    capacitor.config.ts   # android wrapper — same interface
    vercel.json netlify.toml # platform manifests — deploy from here
  Dockerfile              # the one container file — builder deps runtime
                          # (compose merged INTO it)
  .github/workflows/      # ci release publish npm maven nuget ghcr security maintenance
  tests/                  # vitest tests flat *.test.ts
  package.json            # @wenathlan/gateway 1.1.13 public`}</pre>
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// version detail view
// ---------------------------------------------------------------------------

function versionview(id: string): React.ReactNode {
  const version = versions.find((v) => v.v === id);
  if (!version) {
    return (
      <section style={{ padding: "48px 24px", textAlign: "center" }}>
        <h1 style={{ color: "#fafafa" }}>version {id} not found</h1>
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            marginTop: "16px",
            padding: "8px 16px",
            background: "#171717",
            color: "#fafafa",
            border: "1px solid #404040",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          back home
        </button>
      </section>
    );
  }
  return (
    <>
      <header style={{ padding: "48px 24px 24px", borderBottom: "1px solid #262626" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              marginBottom: "16px",
              padding: "6px 12px",
              background: "#171717",
              color: "#a3a3a3",
              border: "1px solid #262626",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.75rem",
            }}
          >
            ← back
          </button>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              margin: 0,
              color: "#fafafa",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {version.v}
            <span
              style={{
                fontSize: "0.625rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                padding: "2px 8px",
                borderRadius: "999px",
                background: `${version.color}22`,
                color: version.color,
                border: `1px solid ${version.color}44`,
              }}
            >
              {version.badge}
            </span>
          </h1>
          <p style={{ fontSize: "1rem", color: "#a3a3a3", marginTop: "8px" }}>
            {version.provider} — {version.pattern}
          </p>
          <p style={{ fontSize: "0.875rem", color: "#737373", marginTop: "8px" }}>{version.note}</p>
        </div>
      </header>

      <section style={{ padding: "24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2
            style={{ fontSize: "1.25rem", fontWeight: 600, color: "#fafafa", marginBottom: "16px" }}
          >
            Routes — 7 per version
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
            }}
          >
            {version.routes.map((route) => (
              <div
                key={route}
                style={{
                  background: "#0f0f0f",
                  border: "1px solid #262626",
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                <div style={{ fontSize: "0.75rem", color: "#525252", marginBottom: "4px" }}>
                  POST /api/{version.v}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#fafafa",
                    fontFamily: "monospace",
                  }}
                >
                  /{route}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "16px", fontSize: "0.75rem", color: "#525252" }}>
            GET /api/{version.v}/&#123;route&#125; returns the version info descriptor
          </div>
        </div>
      </section>

      <section style={{ padding: "24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2
            style={{ fontSize: "1.25rem", fontWeight: 600, color: "#fafafa", marginBottom: "16px" }}
          >
            Models
          </h2>
          <pre
            style={{
              background: "#0f0f0f",
              border: "1px solid #262626",
              borderRadius: "8px",
              padding: "16px",
              overflow: "auto",
              fontSize: "0.75rem",
              color: "#d4d4d4",
              fontFamily: "monospace",
            }}
          >
            {version.models}
          </pre>
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// config view — fetches /api/config and shows the loaded definition
// ---------------------------------------------------------------------------

function ConfigView(): React.ReactNode {
  const [config, setconfig] = useState<Record<string, unknown> | null>(null);
  const [error, seterror] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(setconfig)
      .catch((e) => seterror(String(e)));
  }, []);

  return (
    <>
      <header style={{ padding: "48px 24px 24px", borderBottom: "1px solid #262626" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              marginBottom: "16px",
              padding: "6px 12px",
              background: "#171717",
              color: "#a3a3a3",
              border: "1px solid #262626",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.75rem",
            }}
          >
            ← back
          </button>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0, color: "#fafafa" }}>
            Loaded configuration
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#737373", marginTop: "8px" }}>
            fetched live from GET /api/config — reflects web/config.ts
          </p>
        </div>
      </header>
      <section style={{ padding: "24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {error && <div style={{ color: "#ef4444" }}>error: {error}</div>}
          {!config && !error && <div style={{ color: "#737373" }}>loading…</div>}
          {config && (
            <pre
              style={{
                background: "#0f0f0f",
                border: "1px solid #262626",
                borderRadius: "8px",
                padding: "16px",
                overflow: "auto",
                fontSize: "0.75rem",
                color: "#d4d4d4",
                fontFamily: "monospace",
              }}
            >
              {JSON.stringify(config, null, 2)}
            </pre>
          )}
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// app — the root component with embedded routing
// ---------------------------------------------------------------------------

export function App() {
  const [route, setroute] = useState(parseroute());

  useEffect(() => {
    const onpop = () => setroute(parseroute());
    window.addEventListener("popstate", onpop);
    return () => window.removeEventListener("popstate", onpop);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0a0a0a",
        color: "#e5e5e5",
      }}
    >
      {route.view === "home" && homeview()}
      {route.view === "version" && versionview(route.id ?? "")}
      {route.view === "config" && <ConfigView />}

      <footer
        style={{
          marginTop: "auto",
          padding: "24px",
          borderTop: "1px solid #262626",
          background: "#0a0a0a",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#525252", fontSize: "0.75rem", margin: 0 }}>
            @wenathlan/gateway — the universal ai gateway library — any llm any baseurl any api key
            — 12 auth methods — 7 routes per version — cli plus library
          </p>
        </div>
      </footer>
    </main>
  );
}

// ---------------------------------------------------------------------------
// embedded mounting — what main.tsx used to do now lives here
// no separate main file — app is the single self-contained entry
// ---------------------------------------------------------------------------

const rootelement = document.getElementById("root");
if (!rootelement) throw new Error("root element not found");

createRoot(rootelement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
