/**
 * getryview.tsx — the AI gateway (getry.devthink.pro) inside the os.
 * Pages: versions (the five provider lanes + the fallback chain), routes
 * (the seven OpenAI-compatible kinds + the canonical parser), sessions
 * (the session store, the key rotation and the 7-level thinking ladder).
 * Content absorbed from the getry family app's real gateway domain: five
 * provider gateways — v1 zai passthrough, v2 babel paused fallback, v3
 * nvidia nim round-robin, v4 opencode zen+kilo free discovery, v5
 * openrouter :free discovery — each serving seven route kinds, plus the
 * canonical streaming parser steps.
 *
 * Task 3-c identity pass: the hero carries the violeta accent with the
 * key glyph under a route sweep inside its own stroke; versions read as a
 * routing map (fallback chain drawn), sessions carry the thinking ladder
 * with the budget bars the family site documents (topping at 68 k).
 */
import { useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "./appheader.tsx";
import { appMeta, PERSONAS } from "./apps.ts";
import { AuraChat } from "./aurachat.tsx";
import { accentVars, FamilyHero, type FamilyStat, FamilyStyles, familyAccentOf } from "./familyidentity.tsx";
import type { OSHandle } from "./ostypes.ts";
import { PageSection } from "./pagesection.tsx";

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
    models:
      "17 chat models — kimi-k3 · deepseek-v4 · nemotron-3 · muse-glimmer · laguna · gpt-oss · gemma-4 · mistral · llama-3.2",
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

/** the thinking ladder of the family site: 7 levels, budget topping 68 k. */
const THINKING_LEVELS = [
  "straight answer — no reasoning window",
  "minimal — one planning beat",
  "low — short deliberation",
  "medium — structured reasoning",
  "high — deep deliberation",
  "deep — long reasoning chain",
  "max — the full reasoning window",
];

export function GetryApp({ os }: { os: OSHandle }) {
  const meta = appMeta("getry");
  if (!meta) throw new Error("the getry meta is missing from the catalog");
  const [chatOpen, setChatOpen] = useState(true);
  const page = meta.pages.some((p) => p.id === os.view.page) ? os.view.page : "versions";
  const accent = familyAccentOf(meta.id, meta.accent);
  const live = LANES.filter((l) => l.badge === "live").length;

  const stats: FamilyStat[] = [
    { label: "provider lanes", value: String(LANES.length) },
    { label: "live — paused fall back", value: `${live}/${LANES.length}`, accent: true },
    { label: "routes across lanes", value: "35" },
    { label: "thinking levels", value: "7" },
  ];

  return (
    <div className="fam-view" style={accentVars(accent)}>
      <FamilyStyles />
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
            <FamilyHero
              app={meta}
              tagline="The routing exchange of the family — five provider lanes behind one OpenAI-compatible map, key rotation and the thinking ladder riding every turn."
              stats={stats}
              glyphMotion="route"
              status="route map live"
            />
            {page === "routes" ? <RoutesPage /> : page === "sessions" ? <SessionsPage /> : <VersionsPage live={live} />}
          </div>
          {chatOpen ? (
            <div className="chat-panel">
              <AuraChat persona={PERSONAS.getry} storageKey="dt-chat-getry-v1" appLabel="getry" />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

/* ------------------------------ VERSIONS ----------------------------- */

function VersionsPage({ live }: { live: number }) {
  return (
    <>
      <PageSection
        eyebrow="the five lanes"
        title="Versions"
        heading="h2"
        description="Five provider gateways under one route map: each lane answers the same seven route kinds, carries its own key pool and falls back down the chain when it pauses."
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch", marginTop: 26 }}>
        <section
          className="fam-card reveal"
          style={{
            ...{ background: "var(--atmos-veil), var(--fam-s1)", overflow: "hidden" },
            flex: "3 1 480px",
            minWidth: 0,
            padding: 22,
          }}
          aria-labelledby="lanes-h"
        >
          <div className="fam-card__head">
            <h2 id="lanes-h" className="fam-card__title">
              Provider lanes <span className="fam-card__count">{live}/5 live</span>
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
            <button
              type="button"
              className="btn"
              onClick={() => toast("v2 is paused — every call falls back to v1 zai")}
            >
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

        <div style={{ flex: "2 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}>
          {/* the fallback chain, drawn — v2 paused answers 503 down to v1 */}
          <section
            className="fam-card fam-card--s2 reveal"
            style={{ padding: 22, animationDelay: "90ms" }}
            aria-labelledby="fb-h"
          >
            <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
              fallback chain
            </p>
            <h2 id="fb-h" className="fam-card__title" style={{ marginBottom: 10, fontSize: "1.2rem" }}>
              A pause never drops a turn
            </h2>
            <div
              className="fam-microrow"
              style={{ gridTemplateColumns: "auto auto minmax(0, 1fr)", alignItems: "center" }}
            >
              <span className="mono" style={{ color: "var(--app-accent)", fontWeight: 600 }}>
                v2
              </span>
              <span className="badge warning">
                <span className="dot" aria-hidden="true" />
                paused
              </span>
              <span className="small" style={{ color: "var(--sol-muted)" }}>
                returns 503 — the call re-routes instead of failing
              </span>
            </div>
            <div
              className="fam-microrow"
              style={{ gridTemplateColumns: "auto auto minmax(0, 1fr)", alignItems: "center" }}
            >
              <span className="mono" style={{ color: "var(--app-accent)", fontWeight: 600 }}>
                v1
              </span>
              <span className="badge success">
                <span className="dot" aria-hidden="true" />
                live
              </span>
              <span className="small" style={{ color: "var(--sol-muted)" }}>
                zai passthrough picks the turn up — same route kinds, same parser
              </span>
            </div>
          </section>

          <section
            className="fam-card fam-card--s2 reveal"
            style={{ padding: 22, animationDelay: "180ms" }}
            aria-labelledby="notes-h"
          >
            <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
              lane notes
            </p>
            <h2 id="notes-h" className="fam-card__title" style={{ marginBottom: 8, fontSize: "1.2rem" }}>
              What each lane answers
            </h2>
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
    </>
  );
}

/* -------------------------------- ROUTES ----------------------------- */

function RoutesPage() {
  return (
    <>
      <PageSection
        eyebrow="the route map"
        title="Routes"
        heading="h2"
        description="Seven OpenAI-compatible route kinds per lane — 35 routes in total — all normalized onto the same streaming parser so the family callers never learn a second shape."
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch", marginTop: 26 }}>
        <section
          className="fam-card reveal"
          style={{
            ...{ background: "var(--atmos-veil), var(--fam-s1)", overflow: "hidden" },
            flex: "3 1 440px",
            minWidth: 0,
            padding: 22,
          }}
          aria-labelledby="routes-h"
        >
          <div className="fam-card__head">
            <h2 id="routes-h" className="fam-card__title">
              Route kinds <span className="fam-card__count">× 5 lanes · 35 routes</span>
            </h2>
            <span className="badge success" role="status">
              <span className="dot" aria-hidden="true" />
              one shape
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

        <section
          className="fam-card fam-card--s2 reveal"
          style={{ flex: "2 1 320px", minWidth: 0, padding: 22, animationDelay: "90ms" }}
        >
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            the parser
          </p>
          <h2 className="fam-card__title" style={{ marginBottom: 8, fontSize: "1.2rem" }}>
            One canonical stream
          </h2>
          <ol className="rules" style={{ paddingLeft: 18 }}>
            {PARSER_STEPS.map((step) => (
              <li key={step} style={{ marginBottom: 6 }}>
                {step}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}

/* ------------------------------- SESSIONS ---------------------------- */

function SessionsPage() {
  return (
    <>
      <PageSection
        eyebrow="the session store"
        title="Sessions"
        heading="h2"
        description="Contexts live per session with the lane binding recorded beside them: which gateway answered, which key pool rotated and which thinking level the turn rode."
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch", marginTop: 26 }}>
        <section
          className="fam-card reveal"
          style={{
            ...{ background: "var(--atmos-veil), var(--fam-s1)", overflow: "hidden" },
            flex: "3 1 420px",
            minWidth: 0,
            padding: 22,
          }}
        >
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            binding
          </p>
          <h2 className="fam-card__title" style={{ marginBottom: 8, fontSize: "1.2rem" }}>
            What a session record keeps
          </h2>
          <ul className="rules">
            <li>The lane binding — the v that answered the turn and its fallback chain.</li>
            <li>The key pool health at turn time — rotation state is part of the context.</li>
            <li>The thinking level the request rode, from the 7-level system.</li>
            <li>The turn ledger itself — prompt, reasoning content and the masked reply.</li>
          </ul>
        </section>

        {/* the thinking ladder: 7 levels, the budget bars the site documents */}
        <section
          className="fam-card fam-card--s2 reveal"
          style={{ flex: "2 1 320px", minWidth: 0, padding: 22, animationDelay: "90ms" }}
          aria-labelledby="think-h"
        >
          <div className="fam-card__head">
            <p className="eyebrow" style={{ margin: 0, color: "var(--app-accent)" }}>
              thinking system
            </p>
            <span className="mono small fam-num" style={{ color: "var(--fam-faint)" }}>
              0 → 68 k tokens
            </span>
          </div>
          <h2 id="think-h" className="fam-card__title" style={{ margin: "8px 0 12px", fontSize: "1.2rem" }}>
            Seven levels, one ladder
          </h2>
          {THINKING_LEVELS.map((label, i) => {
            const pct = `${Math.round((i / (THINKING_LEVELS.length - 1)) * 100)}%`;
            return (
              <div key={label} style={{ marginBottom: 10 }}>
                <div className="row between" style={{ marginBottom: 4 }}>
                  <span
                    className="mono"
                    style={{
                      fontSize: ".78rem",
                      color: i === THINKING_LEVELS.length - 1 ? "var(--app-accent)" : "var(--sol-muted)",
                    }}
                  >
                    L{i}
                  </span>
                  <span className="small" style={{ color: "var(--dt-faint)" }}>
                    {label}
                  </span>
                </div>
                <div className="fam-meter" role="img" aria-label={`thinking level ${i} of 6 — ${label}`}>
                  <i style={{ width: pct, opacity: i === 0 ? 0.25 : 1 }} />
                </div>
              </div>
            );
          })}
          <p className="small" style={{ margin: "12px 0 0" }}>
            The budget rides the request; the session store keeps the level beside the turn so a retry reproduces the
            same take.
          </p>
        </section>
      </div>
    </>
  );
}
