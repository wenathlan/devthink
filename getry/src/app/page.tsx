/**
 * home page — devthink gateway v1 v5 multi provider
 * shows all 35 routes across 5 versions
 */

export const dynamic = "force-static"

export default function Home() {
  const versions = [
    {
      v: "v1",
      provider: "zai",
      pattern: "passthrough retransmit via z ai web dev sdk",
      badge: "live",
      color: "#10b981",
      models: "glm-5.3 glm-5.3-flash glm-5.3-fast glm-5.3-air glm-5.2 glm-5.1 glm-5 glm-5v glm-5-turbo glm-4-plus glm-4-flash devthink",
      routes: ["chat/completions", "completions", "embeddings", "keys", "messages", "models", "responses"],
      note: "no token chat id required — sdk has internal config — individual model calling plus devthink meta over glm-5.3",
    },
    {
      v: "v2",
      provider: "babel town",
      pattern: "rebuild plus byte tee passthrough paused fallback v1",
      badge: "paused",
      color: "#f59e0b",
      models: "babel-glm-5.2 devthink",
      routes: ["chat/completions", "completions", "embeddings", "keys", "messages", "models", "responses"],
      note: "service is paused returns 503 fallback to v1 zai — glm-5.2 only",
    },
    {
      v: "v3",
      provider: "nvidia nim",
      pattern: "rebuild per family reasoning control pure byte passthrough",
      badge: "live",
      color: "#10b981",
      models: "17 chat models kimi-k3 deepseek-v4 nemotron-3 muse-glimmer laguna gpt-oss gemma-4 mistral llama-3.2",
      routes: ["chat/completions", "completions", "embeddings", "keys", "messages", "models", "responses"],
      note: "22 keys round robin devthink meta model rotates every 6 messages",
    },
    {
      v: "v4",
      provider: "opencode zen plus kilo",
      pattern: "dynamic free discovery anonymous no key",
      badge: "live",
      color: "#10b981",
      models: "discovered live -free and :free tagged models from opencode zen plus kilo",
      routes: ["chat/completions", "completions", "embeddings", "keys", "messages", "models", "responses"],
      note: "zero hardcoded model names — universal free-tag filter plus devthink context-window math",
    },
    {
      v: "v5",
      provider: "openrouter",
      pattern: "dynamic free discovery openrouter :free tagged",
      badge: "live",
      color: "#10b981",
      models: "discovered live :free tagged models from openrouter",
      routes: ["chat/completions", "completions", "embeddings", "keys", "messages", "models", "responses"],
      note: "requires free openrouter api key — zero hardcoded model names plus devthink context-window math",
    },
  ]

  const thinkinglevels = [
    { level: "none", budget: "0", desc: "no thinking" },
    { level: "minimal", budget: "1400", desc: "quick reasoning" },
    { level: "low", budget: "5500", desc: "light reasoning" },
    { level: "medium", budget: "17000", desc: "balanced" },
    { level: "high", budget: "68000", desc: "deep reasoning default" },
    { level: "xhigh", budget: "68000", desc: "extra deep" },
    { level: "max", budget: "68000", desc: "maximum" },
  ]

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0a0a0a", color: "#e5e5e5" }}>
      <header style={{ padding: "48px 24px 24px", borderBottom: "1px solid #262626" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, margin: 0, color: "#fafafa" }}>
            DevThink Gateway
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#a3a3a3", marginTop: "8px" }}>
            v1 v5 multi provider ai gateway — 35 routes — pure byte passthrough — 7 level thinking
          </p>
          <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
            {["v1 zai", "v2 babel", "v3 nvidia", "v4 opencode kilo", "v5 openrouter"].map((tag) => (
              <span key={tag} style={{ padding: "4px 12px", background: "#171717", border: "1px solid #262626", borderRadius: "9999px", fontSize: "0.75rem", color: "#a3a3a3" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section style={{ padding: "24px", flex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fafafa", marginBottom: "16px" }}>
            Gateway Versions — 5 gateways 35 routes
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "16px" }}>
            {versions.map((ver) => (
              <article key={ver.v} style={{ background: "#0f0f0f", border: "1px solid #262626", borderRadius: "12px", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#fafafa", margin: 0 }}>
                    {ver.v.toUpperCase()}
                  </h3>
                  <span style={{ padding: "2px 10px", background: ver.color, color: "#000", borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase" }}>
                    {ver.badge}
                  </span>
                </div>
                <p style={{ color: "#a3a3a3", fontSize: "0.875rem", margin: "0 0 8px" }}>
                  <strong style={{ color: "#d4d4d4" }}>provider:</strong> {ver.provider}
                </p>
                <p style={{ color: "#a3a3a3", fontSize: "0.875rem", margin: "0 0 8px" }}>
                  <strong style={{ color: "#d4d4d4" }}>pattern:</strong> {ver.pattern}
                </p>
                <p style={{ color: "#a3a3a3", fontSize: "0.875rem", margin: "0 0 12px" }}>
                  <strong style={{ color: "#d4d4d4" }}>models:</strong> {ver.models}
                </p>
                <p style={{ color: "#737373", fontSize: "0.75rem", margin: "0 0 12px", fontStyle: "italic" }}>
                  {ver.note}
                </p>
                <div>
                  <p style={{ color: "#525252", fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 600, margin: "0 0 8px" }}>
                    7 routes
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {ver.routes.map((r) => (
                      <a
                        key={r}
                        href={`/${ver.v}/${r}`}
                        style={{
                          padding: "4px 10px",
                          background: "#171717",
                          border: "1px solid #262626",
                          borderRadius: "6px",
                          fontSize: "0.6875rem",
                          color: "#a3a3a3",
                          textDecoration: "none",
                          fontFamily: "monospace",
                        }}
                      >
                        /{ver.v}/{r}
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "24px", borderTop: "1px solid #262626" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fafafa", marginBottom: "16px" }}>
            7 Level Thinking System
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px" }}>
            {thinkinglevels.map((t) => (
              <div key={t.level} style={{ background: "#0f0f0f", border: "1px solid #262626", borderRadius: "8px", padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ color: "#fafafa", fontWeight: 600, fontSize: "0.875rem" }}>{t.level}</span>
                  <span style={{ color: "#525252", fontSize: "0.75rem", fontFamily: "monospace" }}>{t.budget}</span>
                </div>
                <p style={{ color: "#737373", fontSize: "0.6875rem", margin: 0 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "24px", borderTop: "1px solid #262626" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fafafa", marginBottom: "16px" }}>
            Quick Start
          </h2>
          <pre style={{ background: "#0f0f0f", border: "1px solid #262626", borderRadius: "8px", padding: "16px", overflow: "auto", fontSize: "0.75rem", color: "#d4d4d4", fontFamily: "monospace" }}>{`# v1 — zai passthrough no key required
curl -x post http://localhost:3000/v1/chat/completions \\
  -h "content-type: application/json" \\
  -d '{"messages":[{"role":"user","content":"hi"}],"stream":true}'

# v3 — nvidia nim free models
curl -x post http://localhost:3000/v3/chat/completions \\
  -h "content-type: application/json" \\
  -d '{"model":"devthink","messages":[{"role":"user","content":"hi"}]}'

# v4 — opencode kilo anonymous free tier
curl -x post http://localhost:3000/v4/chat/completions \\
  -h "content-type: application/json" \\
  -d '{"model":"devthink","messages":[{"role":"user","content":"hi"}]}'

# v5 — openrouter free models requires key
curl -x post http://localhost:3000/v5/chat/completions \\
  -h "content-type: application/json" \\
  -h "authorization: bearer $openrouter_api_key" \\
  -d '{"model":"devthink","messages":[{"role":"user","content":"hi"}]}'

# model discovery — v4 and v5 catalogs are dynamic (free-tag filter)
curl http://localhost:3000/v4/models
curl http://localhost:3000/v5/models`}</pre>
        </div>
      </section>

      <section style={{ padding: "24px", borderTop: "1px solid #262626" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fafafa", marginBottom: "16px" }}>
            Canonical Parser Pattern
          </h2>
          <ol style={{ color: "#a3a3a3", fontSize: "0.875rem", lineHeight: 1.8, paddingLeft: "20px" }}>
            <li>readablestream with safeenqueue safeclose plus closed flag</li>
            <li>setinterval keepalive 200ms only when silent greater than 1 second</li>
            <li>upstream call fetch with abortsignal timeout 2147483647 for stream</li>
            <li>parse sse parsesseframes split on double newline never partial frame</li>
            <li>discard heartbeat lines starting with colon or event ping</li>
            <li>mask model name to devthink via regex no json parse</li>
            <li>re-emit normalized chunks delta reasoning content before content</li>
            <li>finally emit finish reason stop plus single done plus savemsg</li>
          </ol>
        </div>
      </section>

      <footer style={{ marginTop: "auto", padding: "24px", borderTop: "1px solid #262626", background: "#0a0a0a" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#525252", fontSize: "0.75rem", margin: 0 }}>
            devthink gateway v1 v5 — 35 routes — pure byte passthrough — maxduration 2147483647 — 40 http methods per route
          </p>
        </div>
      </footer>
    </main>
  )
}
