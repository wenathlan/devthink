/**
 * forgeview.tsx — the sandbox runner surface (forge.devthink.pro) inside
 * the os. Pages: runners (the registered inventory + health), runs (the
 * run logs and outcomes), engine (the saddle boundary contract). Content
 * absorbed from the forge family site: the app registers runners, records
 * run logs and reports outcomes over https, running binaries on the saddle
 * engine boundary while storing nothing itself.
 *
 * The view rides the same grammar as the other family views: one dominant
 * object per page over a support rail, editorial ledgers instead of
 * repeated identical cards, the forge identity accent (apps.ts metadata —
 * aged brass) on ids, statuses and the meter bars, and the one staggered
 * entrance per view switch (reveal.ts, reduced-motion guarded).
 */
import { type CSSProperties, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "./appheader.tsx";
import { appMeta, PERSONAS } from "./apps.ts";
import { AuraChat } from "./aurachat.tsx";
import type { OSHandle } from "./ostypes.ts";
import { PageSection } from "./pagesection.tsx";

/**
 * the family accent as local css vars: the atmosphere recipes ride the app
 * identity — the veil and every key-number tint resolve through
 * --app-accent inside this subtree.
 */
function accentVars(accent: string): CSSProperties {
  return {
    "--app-accent": accent,
    "--atmos-accent": accent,
    "--atmos-veil":
      `radial-gradient(1200px 700px at 72% -12%, color-mix(in srgb, ${accent} 8%, transparent), transparent 62%), ` +
      `radial-gradient(900px 620px at 8% 108%, color-mix(in srgb, ${accent} 6%, transparent), transparent 58%)`,
  } as CSSProperties;
}

/** the dominant-object surface: the named light source over the os panel. */
const DOMINANT_SURFACE = {
  background: "var(--atmos-veil), var(--os-panel)",
  overflow: "hidden",
} as const;

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
  { id: "run-9f21", runner: "brass-anvil", binary: "zone-signer", outcome: "success", duration: "1.8 s", logged: "12 s ago" },
  { id: "run-9f20", runner: "cold-hammer", binary: "bundle-pack", outcome: "success", duration: "4.2 s", logged: "1 min ago" },
  { id: "run-9f19", runner: "ember-row", binary: "asset-convert", outcome: "failed", duration: "0.9 s", logged: "2 min ago" },
  { id: "run-9f18", runner: "brass-anvil", binary: "dns-probe", outcome: "success", duration: "0.4 s", logged: "5 min ago" },
  { id: "run-9f17", runner: "quench-pool", binary: "asset-convert", outcome: "timeout", duration: "120 s", logged: "6 min ago" },
  { id: "run-9f16", runner: "ember-row", binary: "bundle-pack", outcome: "success", duration: "3.9 s", logged: "9 min ago" },
];

/** the engine contract: what the saddle boundary guarantees a run. */
const ENGINE_CONTRACT = [
  ["Every run executes inside the saddle sandbox boundary — no host escape, no shared filesystem.", "isolation"],
  ["Forge stores nothing: the run log rides the https report and the caller owns the artifacts.", "stateless"],
  ["A runner registers with its engine version and architecture; health is a heartbeat, not a guess.", "registration"],
  ["Outcomes report exactly three ways — success, failed or timeout — and the log carries which.", "outcomes"],
  ["The engine version pins the syscall surface; mixed fleets drain before they upgrade.", "pinning"],
];

export function ForgeApp({ os }: { os: OSHandle }) {
  const meta = appMeta("forge");
  if (!meta) throw new Error("the forge meta is missing from the catalog");
  const [chatOpen, setChatOpen] = useState(true);
  const page = meta.pages.some((p) => p.id === os.view.page) ? os.view.page : "runners";

  return (
    <>
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
            {page === "runs" ? (
              <RunsPage accent={meta.accent} />
            ) : page === "engine" ? (
              <EnginePage accent={meta.accent} />
            ) : (
              <RunnersPage accent={meta.accent} />
            )}
          </div>
          {chatOpen ? (
            <div className="chat-panel">
              <AuraChat persona={PERSONAS.forge} storageKey="dt-chat-forge-v1" appLabel="forge" />
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}

/* ------------------------------- RUNNERS ----------------------------- */

function RunnersPage({ accent }: { accent: string }) {
  const [registering, setRegistering] = useState(false);

  return (
    <div style={accentVars(accent)}>
      <PageSection
        eyebrow="runner inventory"
        title="Runners"
        description="Every binary the family executes rides a registered runner: engine version and architecture pinned at registration, health carried by the heartbeat, outcomes reported over https."
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch", marginTop: 26 }}>
        <section
          className="glass tac card atmos reveal halftone grain"
          style={{ ...DOMINANT_SURFACE, flex: "3 1 460px", minWidth: 0 }}
          aria-labelledby="runner-h"
        >
          <div className="row between">
            <h2 id="runner-h" style={{ margin: 0, fontSize: "1.05rem" }}>
              Registered runners{" "}
              <span className="mono" style={{ fontSize: ".85rem", color: "var(--app-accent)" }}>
                {RUNNERS.filter((r) => r.status === "online").length}/{RUNNERS.length} online
              </span>
            </h2>
            <span className="badge success" role="status">
              <span className="dot" aria-hidden="true" />
              inventory live
            </span>
          </div>
          <div className="table-scroll" style={{ marginTop: 12 }}>
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

        <section className="glass tac card reveal" style={{ flex: "2 1 300px", minWidth: 0, animationDelay: "90ms" }}>
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            fleet shape
          </p>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem" }}>What the inventory carries</h2>
          <ul className="rules">
            <li>One row per registered runner — label, id, engine version, architecture.</li>
            <li>Status is the heartbeat truth: online, draining or offline, never inferred.</li>
            <li>The last-run column answers from the run ledger, refreshed per outcome report.</li>
            <li>Mixed engine versions are visible on purpose — a drain before an upgrade is policy.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------- RUNS ------------------------------- */

function RunsPage({ accent }: { accent: string }) {
  return (
    <div style={accentVars(accent)}>
      <PageSection
        eyebrow="execution ledger"
        title="Runs"
        description="The run log records every execution the surface reports: which runner answered, which binary ran, the outcome and the duration — nothing more, because forge stores nothing else."
        reveal
      />

      <section
        className="glass tac card atmos reveal halftone grain"
        style={{ ...DOMINANT_SURFACE, marginTop: 26 }}
        aria-labelledby="runs-h"
      >
        <div className="row between">
          <h2 id="runs-h" style={{ margin: 0, fontSize: "1.05rem" }}>
            Recent runs
          </h2>
          <span className="badge success" role="status">
            <span className="dot" aria-hidden="true" />
            ledger live
          </span>
        </div>
        <div className="table-scroll" style={{ marginTop: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Run</th>
                <th scope="col">Runner</th>
                <th scope="col">Binary</th>
                <th scope="col">Outcome</th>
                <th scope="col">Duration</th>
                <th scope="col">Logged</th>
              </tr>
            </thead>
            <tbody>
              {RUNS.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.id}</td>
                  <td>{r.runner}</td>
                  <td className="mono">{r.binary}</td>
                  <td>
                    <span className={`badge ${r.outcome === "success" ? "success" : r.outcome === "failed" ? "warning" : ""}`}>
                      <span className="dot" aria-hidden="true" />
                      {r.outcome}
                    </span>
                  </td>
                  <td className="mono">{r.duration}</td>
                  <td className="small">{r.logged}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------- ENGINE ------------------------------ */

function EnginePage({ accent }: { accent: string }) {
  return (
    <div style={accentVars(accent)}>
      <PageSection
        eyebrow="the saddle boundary"
        title="Engine"
        description="Forge is the execution-only deployable clone: it runs any binary the family hands it on the saddle engine and keeps none of the state — the caller owns the artifacts, the log rides the https report."
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch", marginTop: 26 }}>
        <section
          className="glass tac card atmos reveal halftone grain"
          style={{ ...DOMINANT_SURFACE, flex: "3 1 440px", minWidth: 0 }}
        >
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            boundary contract
          </p>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem" }}>What a run guarantees</h2>
          <ul className="rules">
            {ENGINE_CONTRACT.map(([rule, tag]) => (
              <li key={tag}>
                {rule} <span className="mono small" style={{ color: "var(--app-accent)" }}>{tag}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass tac card reveal" style={{ flex: "2 1 300px", minWidth: 0, animationDelay: "90ms" }}>
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            family split
          </p>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem" }}>Who owns what</h2>
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
    </div>
  );
}
