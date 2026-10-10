/**
 * getryview.tsx — the AI gateway (getry.devthink.pro) inside the os.
 * Pages: versions (the five provider lanes), routes (the seven
 * OpenAI-compatible kinds), sessions (the session store and key
 * rotation). Content absorbed from the getry family app's real gateway
 * domain: five provider gateways — v1 zai passthrough, v2 babel paused
 * fallback, v3 nvidia nim round-robin, v4 opencode zen+kilo free
 * discovery, v5 openrouter :free discovery — each serving seven route
 * kinds, plus the canonical streaming parser steps.
 *
 * The view rides the family view grammar: one dominant object per page
 * over a support rail, editorial ledgers, the getry identity accent
 * (apps.ts metadata — routing sage) on lane ids, badges and meters, and
 * the one staggered entrance per view switch (reveal.ts, reduced-motion).
 */
import { type CSSProperties, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "./appheader.tsx";
import { appMeta, PERSONAS } from "./apps.ts";
import { AuraChat } from "./aurachat.tsx";
import type { OSHandle } from "./ostypes.ts";
import { PageSection } from "./pagesection.tsx";

function accentVars(accent: string): CSSProperties {
  return {
    "--app-accent": accent,
    "--atmos-accent": accent,
    "--atmos-veil":
      `radial-gradient(1200px 700px at 72% -12%, color-mix(in srgb, ${accent} 8%, transparent), transparent 62%), ` +
      `radial-gradient(900px 620px at 8% 108%, color-mix(in srgb, ${accent} 6%, transparent), transparent 58%)`,
  } as CSSProperties;
}

const DOMINANT_SURFACE = {
  background: "var(--atmos-veil), var(--os-panel)",
  overflow: "hidden",
} as const;

type LaneRow = {
  v: string;
  provider: string;
  badge: "live" | "paused";
  models: string;
  note: string;
};

/** the five provider gateways, verbatim from the getry gateway domain. */
const LANES: LaneRow[] = [
  {
    v: "v1",
    provider: "zai",
    badge: "live",
    models: "glm-5.3 · glm-5.3-flash · glm-5.3-fast · glm-5.3-air · glm-5.2 · devthink",
    note: "passthrough retransmit via the web dev sdk — no token chat id required, individual model calling plus the devthink meta over glm-5.3",
  },
  {
    v: "v2",
    provider: "babel town",
    badge: "paused",
    models: "babel-glm-5.2 · devthink",
    note: "service paused — returns 503 and falls back to v1 zai; glm-5.2 only",
  },
  {
    v: "v3",
    provider: "nvidia nim",
    badge: "live",
    models: "17 chat models — kimi-k3 · deepseek-v4 · nemotron-3 · muse-glimmer · laguna · gpt-oss · gemma-4 · mistral · llama-3.2",
    note: "22 keys round robin — the devthink meta model rotates every 6 messages",
  },
  {
    v: "v4",
    provider: "opencode zen + kilo",
    badge: "live",
    models: "discovered live — free and :free tagged models",
    note: "zero hardcoded model names — universal free-tag filter plus the devthink context-window math",
  },
  {
    v: "v5",
    provider: "openrouter",
    badge: "live",
    models: "discovered live — :free tagged models",
    note: "requires a free openrouter api key — zero hardcoded model names plus the context-window math",
  },
];

/** the seven OpenAI-compatible route kinds every lane answers. */
const ROUTE_KINDS = [
  ["chat/completions", "the streaming conversation lane every persona rides"],
  ["completions", "the raw completion lane for the prompt-first callers"],
  ["embeddings", "the vector lane the family retrieval answers through"],
  ["keys", "the key pool surface — rotation, health and the lane binding"],
  ["messages", "the anthropic-shaped lane normalized onto the same parser"],
  ["models", "the model catalog per lane — discovered or pinned"],
  ["responses", "the responses-shaped lane with reasoning content preserved"],
];

/** the canonical parser pattern of the streaming routes, in order. */
const PARSER_STEPS = [
  "readablestream with safeenqueue, safeclose and the closed flag",
  "setinterval keepalive 200 ms — only when the stream stayed silent over 1 s",
  "upstream call: fetch with the abortsignal timeout pinned for streams",
  "parse sse frames split on the double newline — never a partial frame",
  "discard heartbeat lines starting with a colon or the ping event",
  "mask the model name to devthink via regex — no json parse",
  "re-emit normalized chunks — delta reasoning content before content",
  "finally emit the finish reason, one done, and savemsg",
];

export function GetryApp({ os }: { os: OSHandle }) {
  const meta = appMeta("getry");
  if (!meta) throw new Error("the getry meta is missing from the catalog");
  const [chatOpen, setChatOpen] = useState(true);
  const page = meta.pages.some((p) => p.id === os.view.page) ? os.view.page : "versions";

  return (
    <>
      <AppHeader
        app={meta}
        active={page}
        chatOpen={chatOpen}
        onNavigate={(p) => os.openApp("getry", p)}
        onHome={os.goGateway}
        onToggleChat={() => setChatOpen((v) => !v)}
        theme={os.settings.theme}
        onToggleTheme={os.toggleTheme}
      />

      <main className="shell">
        <div className={`app-layout${chatOpen ? " with-chat" : ""}`}>
          <div>
            {page === "routes" ? (
              <RoutesPage accent={meta.accent} />
            ) : page === "sessions" ? (
              <SessionsPage accent={meta.accent} />
            ) : (
              <VersionsPage accent={meta.accent} />
            )}
          </div>
          {chatOpen ? (
            <div className="chat-panel">
              <AuraChat persona={PERSONAS.getry} storageKey="dt-chat-getry-v1" appLabel="getry" />
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}

/* ------------------------------ VERSIONS ----------------------------- */

function VersionsPage({ accent }: { accent: string }) {
  return (
    <div style={accentVars(accent)}>
      <PageSection
        eyebrow="the five lanes"
        title="Versions"
        description="Five provider gateways under one route map: each lane answers the same seven route kinds, carries its own key pool and falls back down the chain when it pauses."
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch", marginTop: 26 }}>
        <section
          className="glass tac card atmos reveal halftone grain"
          style={{ ...DOMINANT_SURFACE, flex: "3 1 480px", minWidth: 0 }}
          aria-labelledby="lanes-h"
        >
          <div className="row between">
            <h2 id="lanes-h" style={{ margin: 0, fontSize: "1.05rem" }}>
              Provider lanes{" "}
              <span className="mono" style={{ fontSize: ".85rem", color: "var(--app-accent)" }}>
                {LANES.filter((l) => l.badge === "live").length}/5 live
              </span>
            </h2>
            <span className="badge success" role="status">
              <span className="dot" aria-hidden="true" />
              map live
            </span>
          </div>
          <div className="table-scroll" style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Lane</th>
                  <th scope="col">Provider</th>
                  <th scope="col">Status</th>
                  <th scope="col">Models</th>
                </tr>
              </thead>
              <tbody>
                {LANES.map((l) => (
                  <tr key={l.v}>
                    <td className="mono" style={{ color: "var(--app-accent)" }}>
                      {l.v}
                    </td>
                    <td>{l.provider}</td>
                    <td>
                      <span className={`badge ${l.badge === "live" ? "success" : "warning"}`}>
                        <span className="dot" aria-hidden="true" />
                        {l.badge}
                      </span>
                    </td>
                    <td className="small">{l.models}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="row" style={{ marginTop: 18 }}>
            <button type="button" className="btn" onClick={() => toast("v2 is paused — every call falls back to v1 zai")}>
              Fallback order
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => toast("Key rotation rides the lane: 22 keys round robin on v3")}
            >
              Key rotation
            </button>
          </div>
        </section>

        <section className="glass tac card reveal" style={{ flex: "2 1 300px", minWidth: 0, animationDelay: "90ms" }}>
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            lane notes
          </p>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem" }}>What each lane answers</h2>
          <ul className="rules">
            {LANES.map((l) => (
              <li key={l.v}>
                <span className="mono" style={{ color: "var(--app-accent)" }}>
                  {l.v}
                </span>{" "}
                {l.note}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------- ROUTES ----------------------------- */

function RoutesPage({ accent }: { accent: string }) {
  return (
    <div style={accentVars(accent)}>
      <PageSection
        eyebrow="the route map"
        title="Routes"
        description="Seven OpenAI-compatible route kinds per lane — 35 routes in total — all normalized onto the same streaming parser so the family callers never learn a second shape."
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch", marginTop: 26 }}>
        <section
          className="glass tac card atmos reveal halftone grain"
          style={{ ...DOMINANT_SURFACE, flex: "3 1 440px", minWidth: 0 }}
          aria-labelledby="routes-h"
        >
          <div className="row between">
            <h2 id="routes-h" style={{ margin: 0, fontSize: "1.05rem" }}>
              Route kinds <span className="mono" style={{ fontSize: ".85rem", color: "var(--app-accent)" }}>× 5 lanes</span>
            </h2>
            <span className="badge success" role="status">
              <span className="dot" aria-hidden="true" />
              35 routes
            </span>
          </div>
          <div className="table-scroll" style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Route</th>
                  <th scope="col">Answers</th>
                </tr>
              </thead>
              <tbody>
                {ROUTE_KINDS.map(([route, answer]) => (
                  <tr key={route}>
                    <td className="mono" style={{ color: "var(--app-accent)" }}>
                      /{route}
                    </td>
                    <td className="small">{answer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass tac card reveal" style={{ flex: "2 1 320px", minWidth: 0, animationDelay: "90ms" }}>
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            the parser
          </p>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem" }}>One canonical stream</h2>
          <ol className="rules" style={{ paddingLeft: 18 }}>
            {PARSER_STEPS.map((step) => (
              <li key={step} style={{ marginBottom: 6 }}>
                {step}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------- SESSIONS ---------------------------- */

function SessionsPage({ accent }: { accent: string }) {
  return (
    <div style={accentVars(accent)}>
      <PageSection
        eyebrow="the session store"
        title="Sessions"
        description="Contexts live per session with the lane binding recorded beside them: which gateway answered, which key pool rotated and which thinking level the turn rode."
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch", marginTop: 26 }}>
        <section
          className="glass tac card atmos reveal halftone grain"
          style={{ ...DOMINANT_SURFACE, flex: "3 1 420px", minWidth: 0 }}
        >
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            binding
          </p>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem" }}>What a session record keeps</h2>
          <ul className="rules">
            <li>The lane binding — the v that answered the turn and its fallback chain.</li>
            <li>The key pool health at turn time — rotation state is part of the context.</li>
            <li>The thinking level the request rode, from the 7-level system.</li>
            <li>The turn ledger itself — prompt, reasoning content and the masked reply.</li>
          </ul>
        </section>

        <section className="glass tac card reveal" style={{ flex: "2 1 300px", minWidth: 0, animationDelay: "90ms" }}>
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            thinking system
          </p>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem" }}>Seven levels</h2>
          <p className="small" style={{ margin: 0 }}>
            The reasoning budget rides the request: level 0 answers straight, level 6 spends the full reasoning
            window. The session store keeps the level beside the turn so a retry reproduces the same take.
          </p>
        </section>
      </div>
    </div>
  );
}
