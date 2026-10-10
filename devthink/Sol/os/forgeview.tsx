/**
 * forgeview.tsx — the sandbox runner surface (forge.devthink.pro) inside
 * the os. Pages: runners (the registered inventory + fleet health), runs
 * (the report feed replaying the recorded ledger), engine (the saddle
 * boundary contract). Content absorbed from the forge family site: the
 * app registers runners, records run logs and reports outcomes over
 * https, running binaries on the saddle engine boundary while storing
 * nothing itself.
 *
 * Task 3-c identity pass: the hero carries the lime-brasa accent with the
 * hammer glyph beating inside its own stroke; the fleet page reads as a
 * forge floor (health ladder, engine pins); the runs page replays the
 * recorded outcomes as a live report feed — honestly labeled as a replay
 * of the seed ledger, paused under reduced motion.
 */

import { Pause, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "./appheader.tsx";
import { appMeta, PERSONAS } from "./apps.ts";
import { AuraChat } from "./aurachat.tsx";
import {
  accentVars,
  FamilyHero,
  type FamilyStat,
  FamilyStyles,
  familyAccentOf,
  useFamilyReducedMotion,
} from "./familyidentity.tsx";
import type { OSHandle } from "./ostypes.ts";
import { PageSection } from "./pagesection.tsx";

type RunnerRow = {
  id: string;
  label: string;
  engine: string;
  arch: string;
  status: "online" | "draining" | "offline";
  lastRun: string;
};

const RUNNERS: RunnerRow[] = [
  {
    id: "frn-01",
    label: "brass-anvil",
    engine: "saddle 1.4",
    arch: "linux/x64",
    status: "online",
    lastRun: "12 s ago",
  },
  {
    id: "frn-02",
    label: "ember-row",
    engine: "saddle 1.4",
    arch: "linux/arm64",
    status: "online",
    lastRun: "48 s ago",
  },
  {
    id: "frn-03",
    label: "quench-pool",
    engine: "saddle 1.3",
    arch: "linux/x64",
    status: "draining",
    lastRun: "3 min ago",
  },
  {
    id: "frn-04",
    label: "cold-hammer",
    engine: "saddle 1.4",
    arch: "darwin/arm64",
    status: "online",
    lastRun: "1 min ago",
  },
  {
    id: "frn-05",
    label: "slag-hearth",
    engine: "saddle 1.2",
    arch: "linux/x64",
    status: "offline",
    lastRun: "2 h ago",
  },
];

type RunRow = {
  id: string;
  runner: string;
  binary: string;
  outcome: "success" | "failed" | "timeout";
  duration: string;
  logged: string;
};

const RUNS: RunRow[] = [
  {
    id: "run-9f21",
    runner: "brass-anvil",
    binary: "zone-signer",
    outcome: "success",
    duration: "1.8 s",
    logged: "12 s ago",
  },
  {
    id: "run-9f20",
    runner: "cold-hammer",
    binary: "bundle-pack",
    outcome: "success",
    duration: "4.2 s",
    logged: "1 min ago",
  },
  {
    id: "run-9f19",
    runner: "ember-row",
    binary: "asset-convert",
    outcome: "failed",
    duration: "0.9 s",
    logged: "2 min ago",
  },
  {
    id: "run-9f18",
    runner: "brass-anvil",
    binary: "dns-probe",
    outcome: "success",
    duration: "0.4 s",
    logged: "5 min ago",
  },
  {
    id: "run-9f17",
    runner: "quench-pool",
    binary: "asset-convert",
    outcome: "timeout",
    duration: "120 s",
    logged: "6 min ago",
  },
  {
    id: "run-9f16",
    runner: "ember-row",
    binary: "bundle-pack",
    outcome: "success",
    duration: "3.9 s",
    logged: "9 min ago",
  },
];

/** the engine contract: what the saddle boundary guarantees a run. */
const ENGINE_CONTRACT = [
  ["Every run executes inside the saddle sandbox boundary — no host escape, no shared filesystem.", "isolation"],
  ["Forge stores nothing: the run log rides the https report and the caller owns the artifacts.", "stateless"],
  ["A runner registers with its engine version and architecture; health is a heartbeat, not a guess.", "registration"],
  ["Outcomes report exactly three ways — success, failed or timeout — and the log carries which.", "outcomes"],
  ["The engine version pins the syscall surface; mixed fleets drain before they upgrade.", "pinning"],
];

/** the honest fleet numbers, computed from the ledger. */
function fleetTotals() {
  const online = RUNNERS.filter((r) => r.status === "online").length;
  const success = RUNS.filter((r) => r.outcome === "success").length;
  const failed = RUNS.filter((r) => r.outcome === "failed").length;
  const timeout = RUNS.filter((r) => r.outcome === "timeout").length;
  return {
    online,
    runners: RUNNERS.length,
    success,
    failed,
    timeout,
    runs: RUNS.length,
    rate: `${Math.round((success / RUNS.length) * 100)}%`,
    health: `${Math.round((online / RUNNERS.length) * 100)}%`,
  };
}

export function ForgeApp({ os }: { os: OSHandle }) {
  const meta = appMeta("forge");
  if (!meta) throw new Error("the forge meta is missing from the catalog");
  const [chatOpen, setChatOpen] = useState(true);
  const page = meta.pages.some((p) => p.id === os.view.page) ? os.view.page : "runners";
  const accent = familyAccentOf(meta.id, meta.accent);
  const totals = fleetTotals();

  const stats: FamilyStat[] = [
    { label: "runners registered", value: String(totals.runners) },
    { label: "online — heartbeat truth", value: `${totals.online}/${totals.runners}`, accent: true },
    { label: "runs in the ledger", value: String(totals.runs) },
    { label: "outcomes reported green", value: totals.rate },
  ];

  return (
    <div className="fam-view" style={accentVars(accent)}>
      <FamilyStyles />
      <AppHeader
        app={meta}
        active={page}
        chatOpen={chatOpen}
        onNavigate={(p) => os.openApp("forge", p)}
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
              tagline="The execution floor of the family — runners registered, binaries lit, outcomes reported while the forge stays stateless."
              stats={stats}
              glyphMotion="strike"
              status="forge floor live"
            />
            {page === "runs" ? (
              <RunsPage totals={totals} />
            ) : page === "engine" ? (
              <EnginePage />
            ) : (
              <RunnersPage totals={totals} />
            )}
          </div>
          {chatOpen ? (
            <div className="chat-panel">
              <AuraChat persona={PERSONAS.forge} storageKey="dt-chat-forge-v1" appLabel="forge" />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

/* ------------------------------- RUNNERS ----------------------------- */

function RunnersPage({ totals }: { totals: ReturnType<typeof fleetTotals> }) {
  const [registering, setRegistering] = useState(false);

  return (
    <>
      <PageSection
        eyebrow="runner inventory"
        title="Runners"
        heading="h2"
        description="Every binary the family executes rides a registered runner: engine version and architecture pinned at registration, health carried by the heartbeat, outcomes reported over https."
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch", marginTop: 26 }}>
        <section
          className="fam-card reveal"
          style={{
            ...{ background: "var(--atmos-veil), var(--fam-s1)", overflow: "hidden" },
            flex: "3 1 460px",
            minWidth: 0,
            padding: 22,
          }}
          aria-labelledby="runner-h"
        >
          <div className="fam-card__head">
            <h2 id="runner-h" className="fam-card__title">
              Registered runners{" "}
              <span className="fam-card__count">
                {totals.online}/{totals.runners} online
              </span>
            </h2>
            <span className="badge success" role="status">
              <span className="dot" aria-hidden="true" />
              inventory live
            </span>
          </div>

          {/* the fleet health ladder — heartbeat truth, not a guess */}
          <div style={{ marginTop: 14, marginBottom: 6 }}>
            <div className="row between" style={{ marginBottom: 6 }}>
              <span className="fam-stat__label">fleet health</span>
              <span className="fam-num mono" style={{ fontSize: ".8rem", color: "var(--app-accent)" }}>
                {totals.health}
              </span>
            </div>
            <div
              className="fam-meter"
              role="img"
              aria-label={`fleet health ${totals.health} — online runners over registered`}
            >
              <i style={{ width: totals.health }} />
            </div>
          </div>

          <div className="table-scroll" style={{ marginTop: 10 }}>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Runner</th>
                  <th scope="col">Engine</th>
                  <th scope="col">Arch</th>
                  <th scope="col">Status</th>
                  <th scope="col">Last run</th>
                </tr>
              </thead>
              <tbody>
                {RUNNERS.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="strong">{r.label}</span>{" "}
                      <span className="mono small" style={{ color: "var(--dt-muted)" }}>
                        {r.id}
                      </span>
                    </td>
                    <td className="mono">{r.engine}</td>
                    <td className="mono">{r.arch}</td>
                    <td>
                      <span
                        className={`badge ${r.status === "online" ? "success" : r.status === "draining" ? "warning" : ""}`}
                      >
                        <span className="dot" aria-hidden="true" />
                        {r.status}
                      </span>
                    </td>
                    <td className="small">{r.lastRun}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="row" style={{ marginTop: 18 }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setRegistering(true);
                window.setTimeout(() => {
                  setRegistering(false);
                  toast.success("Runner registered — the heartbeat starts on the next tick");
                }, 900);
              }}
              disabled={registering}
            >
              {registering ? "Registering…" : "Register a runner"}
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => toast("The health heartbeat answers every 15 s per runner")}
            >
              How health works
            </button>
          </div>
        </section>

        <section
          className="fam-card fam-card--s2 reveal"
          style={{ flex: "2 1 300px", minWidth: 0, padding: 22, animationDelay: "90ms" }}
        >
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            fleet shape
          </p>
          <h2 className="fam-card__title" style={{ marginBottom: 8, fontSize: "1.2rem" }}>
            What the inventory carries
          </h2>
          <ul className="rules">
            <li>One row per registered runner — label, id, engine version, architecture.</li>
            <li>Status is the heartbeat truth: online, draining or offline, never inferred.</li>
            <li>The last-run column answers from the run ledger, refreshed per outcome report.</li>
            <li>Mixed engine versions are visible on purpose — a drain before an upgrade is policy.</li>
          </ul>
          <p className="mono small" style={{ margin: "14px 0 0", color: "var(--fam-faint, var(--dt-faint))" }}>
            queue depth 0 — every reported run carries an outcome
          </p>
        </section>
      </div>
    </>
  );
}

/* -------------------------------- RUNS ------------------------------- */

type FeedLine = {
  t: string;
  tag: "success" | "failed" | "timeout";
  text: string;
};

/** the feed is a REPLAY of the recorded ledger — the honest live feel. */
const FEED: FeedLine[] = [...RUNS].reverse().map((r) => ({
  t: r.logged,
  tag: r.outcome,
  text: `${r.id} · ${r.runner} · ${r.binary} · ${r.duration}`,
}));

function RunsPage({ totals }: { totals: ReturnType<typeof fleetTotals> }) {
  const reduced = useFamilyReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [shown, setShown] = useState(() => (reduced ? FEED.length : 1));

  /* the replay: one line per beat while playing, paused by the toggle,
     stopped at the end of the recorded ledger — never an invented run */
  useEffect(() => {
    if (!playing || reduced) return undefined;
    const id = window.setInterval(() => {
      setShown((prev) => {
        if (prev >= FEED.length) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 950);
    return () => window.clearInterval(id);
  }, [playing, reduced]);

  useEffect(() => {
    if (reduced) setShown(FEED.length);
  }, [reduced]);

  const done = shown >= FEED.length;
  const outcomePct = (n: number) => `${Math.round((n / totals.runs) * 100)}%`;

  const breakdown = useMemo(
    () => [
      { label: "success", n: totals.success, tone: "success" as const },
      { label: "failed", n: totals.failed, tone: "warning" as const },
      { label: "timeout", n: totals.timeout, tone: "" as const },
    ],
    [totals],
  );

  return (
    <>
      <PageSection
        eyebrow="execution ledger"
        title="Runs"
        heading="h2"
        description="The report feed writes every outcome the surface reports: which runner answered, which binary ran, the outcome and the duration — nothing more, because forge stores nothing else. The feed below replays the recorded ledger."
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch", marginTop: 26 }}>
        {/* the report feed — the forge in operation (honest replay) */}
        <section
          className="fam-card reveal"
          style={{
            ...{ background: "var(--atmos-veil), var(--fam-s1)", overflow: "hidden" },
            flex: "3 1 460px",
            minWidth: 0,
            padding: 22,
          }}
          aria-labelledby="feed-h"
        >
          <div className="fam-card__head">
            <h2 id="feed-h" className="fam-card__title">
              Report feed{" "}
              <span className="fam-card__count">
                {done ? `${FEED.length}/${FEED.length}` : `${shown}/${FEED.length} replayed`}
              </span>
            </h2>
            <div className="row" style={{ gap: 8 }}>
              <span className={`badge ${done ? "success" : "warning"}`} role="status">
                <span className="dot" aria-hidden="true" />
                {done ? "ledger current" : "replaying"}
              </span>
              <button
                type="button"
                className="icon-btn"
                style={{ width: 44, height: 44 }}
                onClick={() => setPlaying((v) => !v)}
                aria-pressed={playing}
                aria-label={playing ? "Pause the report feed replay" : "Resume the report feed replay"}
                title={playing ? "Pause the replay" : "Resume the replay"}
              >
                {playing ? <Pause size={16} strokeWidth={1.8} /> : <Play size={16} strokeWidth={1.8} />}
              </button>
            </div>
          </div>
          <ul className="fam-feed" style={{ marginTop: 12 }} aria-live="polite">
            {FEED.slice(0, shown).map((line) => (
              <li key={line.text}>
                <span className="fam-feed__t">{line.t}</span>
                <span className="fam-feed__tag">{line.tag}</span>
                <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{line.text}</span>
              </li>
            ))}
          </ul>
          <p className="small" style={{ margin: "12px 0 0", color: "var(--dt-faint)" }}>
            Replay of the recorded outcomes — in production the https report writes this ledger live; this surface
            stores nothing.
          </p>
        </section>

        {/* the outcomes rail: three ways, exactly — the contract says which */}
        <section
          className="fam-card fam-card--s2 reveal"
          style={{ flex: "2 1 300px", minWidth: 0, padding: 22, animationDelay: "90ms" }}
        >
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            outcomes
          </p>
          <h2 className="fam-card__title" style={{ marginBottom: 12, fontSize: "1.2rem" }}>
            Three ways, exactly
          </h2>
          {breakdown.map((b) => (
            <div key={b.label} style={{ marginBottom: 14 }}>
              <div className="row between" style={{ marginBottom: 6 }}>
                <span className={`badge ${b.tone}`}>
                  <span className="dot" aria-hidden="true" />
                  {b.label}
                </span>
                <span className="fam-num mono" style={{ fontSize: ".8rem" }}>
                  {b.n} · {outcomePct(b.n)}
                </span>
              </div>
              <div className="fam-meter" role="img" aria-label={`${b.label} ${b.n} of ${totals.runs} runs`}>
                <i style={{ width: outcomePct(b.n) }} />
              </div>
            </div>
          ))}
          <p className="small" style={{ margin: "14px 0 0" }}>
            The log carries which of the three ways every run ended — the ledger above is the whole truth forge keeps.
          </p>
        </section>
      </div>
    </>
  );
}

/* ------------------------------- ENGINE ------------------------------ */

function EnginePage() {
  return (
    <>
      <PageSection
        eyebrow="the saddle boundary"
        title="Engine"
        heading="h2"
        description="Forge is the execution-only deployable clone: it runs any binary the family hands it on the saddle engine and keeps none of the state — the caller owns the artifacts, the log rides the https report."
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
        >
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            boundary contract
          </p>
          <h2 className="fam-card__title" style={{ marginBottom: 8, fontSize: "1.2rem" }}>
            What a run guarantees
          </h2>
          <ul className="rules">
            {ENGINE_CONTRACT.map(([rule, tag]) => (
              <li key={tag}>
                {rule} <span className="mono small fam-num">{tag}</span>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="fam-card fam-card--s2 reveal"
          style={{ flex: "2 1 300px", minWidth: 0, padding: 22, animationDelay: "90ms" }}
        >
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            family split
          </p>
          <h2 className="fam-card__title" style={{ marginBottom: 8, fontSize: "1.2rem" }}>
            Who owns what
          </h2>
          <ul className="rules">
            <li>
              <strong className="strong">Forge</strong> registers runners and reports outcomes — the surface.
            </li>
            <li>
              <strong className="strong">Saddle</strong> is the engine the run executes inside — the boundary.
            </li>
            <li>
              <strong className="strong">Foundry</strong> owns the sandbox and image records — the pipeline.
            </li>
            <li>
              <strong className="strong">Vault</strong> keeps every database the family writes — the reserve.
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
