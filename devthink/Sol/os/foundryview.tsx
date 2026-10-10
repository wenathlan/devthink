/**
 * foundryview.tsx — the pipeline interface (foundry.devthink.pro) inside
 * the os. Pages: sandboxes (the lifecycle records), images (the layer
 * ledgers), pipelines (the view over both). Content absorbed from the
 * foundry family site: the e2b and docker clone interface whose engine
 * lives in saddle, while foundry owns the surface records — sandboxes and
 * images — over the same sqlite contract every family app shares.
 *
 * The view rides the family view grammar: one dominant object per page
 * over a support rail, editorial ledgers, the foundry identity accent
 * (apps.ts metadata — cast steel) on ids, states and meters, and the one
 * staggered entrance per view switch (reveal.ts, reduced-motion guarded).
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

type SandboxRow = {
  id: string;
  image: string;
  state: "running" | "paused" | "exited";
  uptime: string;
  region: string;
};

const SANDBOXES: SandboxRow[] = [
  { id: "sbx-7c01", image: "family/base-node", state: "running", uptime: "3 h 12 m", region: "gru-1" },
  { id: "sbx-7c02", image: "family/build-rust", state: "running", uptime: "41 m", region: "gru-1" },
  { id: "sbx-7c03", image: "family/site-render", state: "paused", uptime: "—", region: "sae-1" },
  { id: "sbx-7c04", image: "family/gateway-lane", state: "running", uptime: "8 h 04 m", region: "gru-1" },
  { id: "sbx-7c05", image: "family/base-node", state: "exited", uptime: "—", region: "sae-1" },
];

type ImageRow = {
  name: string;
  layers: string;
  size: string;
  base: string;
  fresh: string;
};

const IMAGES: ImageRow[] = [
  { name: "family/base-node", layers: "6", size: "148 MB", base: "node 26 alpine", fresh: "2 h ago" },
  { name: "family/build-rust", layers: "9", size: "612 MB", base: "rust 1.88", fresh: "5 h ago" },
  { name: "family/site-render", layers: "7", size: "233 MB", base: "base-node", fresh: "1 d ago" },
  { name: "family/gateway-lane", layers: "8", size: "201 MB", base: "base-node", fresh: "3 h ago" },
];

const PIPELINE_STAGES = [
  ["The image ledger resolves the base and its layer manifest before any sandbox boots.", "resolve"],
  ["A sandbox record is created from the image, pinned to a region and an engine lane.", "create"],
  ["The workload runs inside the saddle boundary; the record carries the state machine.", "run"],
  ["Pause keeps the record and frees the compute; exit retires the sandbox but keeps the log.", "retire"],
];

export function FoundryApp({ os }: { os: OSHandle }) {
  const meta = appMeta("foundry");
  if (!meta) throw new Error("the foundry meta is missing from the catalog");
  const [chatOpen, setChatOpen] = useState(true);
  const page = meta.pages.some((p) => p.id === os.view.page) ? os.view.page : "sandboxes";

  return (
    <>
      <AppHeader
        app={meta}
        active={page}
        chatOpen={chatOpen}
        onNavigate={(p) => os.openApp("foundry", p)}
        onHome={os.goGateway}
        onToggleChat={() => setChatOpen((v) => !v)}
        theme={os.settings.theme}
        onToggleTheme={os.toggleTheme}
      />

      <main className="shell">
        <div className={`app-layout${chatOpen ? " with-chat" : ""}`}>
          <div>
            {page === "images" ? (
              <ImagesPage accent={meta.accent} />
            ) : page === "pipelines" ? (
              <PipelinesPage accent={meta.accent} />
            ) : (
              <SandboxesPage accent={meta.accent} />
            )}
          </div>
          {chatOpen ? (
            <div className="chat-panel">
              <AuraChat persona={PERSONAS.foundry} storageKey="dt-chat-foundry-v1" appLabel="foundry" />
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}

/* ------------------------------ SANDBOXES ---------------------------- */

function SandboxesPage({ accent }: { accent: string }) {
  const [creating, setCreating] = useState(false);

  return (
    <div style={accentVars(accent)}>
      <PageSection
        eyebrow="lifecycle records"
        title="Sandboxes"
        description="One record per sandbox: the image it booted from, the state machine it answers (running, paused, exited), the region it lives in — the engine stays in saddle, the record stays here."
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch", marginTop: 26 }}>
        <section
          className="glass tac card atmos reveal halftone grain"
          style={{ ...DOMINANT_SURFACE, flex: "3 1 460px", minWidth: 0 }}
          aria-labelledby="sbx-h"
        >
          <div className="row between">
            <h2 id="sbx-h" style={{ margin: 0, fontSize: "1.05rem" }}>
              Sandbox records{" "}
              <span className="mono" style={{ fontSize: ".85rem", color: "var(--app-accent)" }}>
                {SANDBOXES.filter((s) => s.state === "running").length} running
              </span>
            </h2>
            <span className="badge success" role="status">
              <span className="dot" aria-hidden="true" />
              records live
            </span>
          </div>
          <div className="table-scroll" style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Sandbox</th>
                  <th scope="col">Image</th>
                  <th scope="col">State</th>
                  <th scope="col">Uptime</th>
                  <th scope="col">Region</th>
                </tr>
              </thead>
              <tbody>
                {SANDBOXES.map((s) => (
                  <tr key={s.id}>
                    <td className="mono">{s.id}</td>
                    <td className="mono">{s.image}</td>
                    <td>
                      <span className={`badge ${s.state === "running" ? "success" : s.state === "paused" ? "warning" : ""}`}>
                        <span className="dot" aria-hidden="true" />
                        {s.state}
                      </span>
                    </td>
                    <td className="mono small">{s.uptime}</td>
                    <td className="mono small">{s.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="row" style={{ marginTop: 18 }}>
            <button
              type="button"
              className="btn"
              disabled={creating}
              onClick={() => {
                setCreating(true);
                window.setTimeout(() => {
                  setCreating(false);
                  toast.success("Sandbox record created — the engine lane boots it next");
                }, 900);
              }}
            >
              {creating ? "Creating…" : "Create sandbox"}
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => toast("Pause keeps the record and frees the compute — exit retires it")}
            >
              Lifecycle rules
            </button>
          </div>
        </section>

        <section className="glass tac card reveal" style={{ flex: "2 1 300px", minWidth: 0, animationDelay: "90ms" }}>
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            record shape
          </p>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem" }}>What a record carries</h2>
          <ul className="rules">
            <li>The image reference it booted from — resolved through the image ledger.</li>
            <li>The state machine: running, paused or exited — never an inferred state.</li>
            <li>The region pin and the engine lane the saddle boundary answers on.</li>
            <li>The sqlite contract every family app shares — the same schema.prisma.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------- IMAGES ----------------------------- */

function ImagesPage({ accent }: { accent: string }) {
  return (
    <div style={accentVars(accent)}>
      <PageSection
        eyebrow="layer ledgers"
        title="Images"
        description="The image ledger resolves every base the family boots: the layer manifest, the sealed size and the freshness stamp — the same rows the sandbox creation flow reads."
        reveal
      />

      <section
        className="glass tac card atmos reveal halftone grain"
        style={{ ...DOMINANT_SURFACE, marginTop: 26 }}
        aria-labelledby="img-h"
      >
        <div className="row between">
          <h2 id="img-h" style={{ margin: 0, fontSize: "1.05rem" }}>
            Family images
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
                <th scope="col">Image</th>
                <th scope="col">Layers</th>
                <th scope="col">Size</th>
                <th scope="col">Base</th>
                <th scope="col">Fresh</th>
              </tr>
            </thead>
            <tbody>
              {IMAGES.map((i) => (
                <tr key={i.name}>
                  <td className="mono">{i.name}</td>
                  <td className="mono">{i.layers}</td>
                  <td className="mono">{i.size}</td>
                  <td className="mono small">{i.base}</td>
                  <td className="small">{i.fresh}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------ PIPELINES ---------------------------- */

function PipelinesPage({ accent }: { accent: string }) {
  return (
    <div style={accentVars(accent)}>
      <PageSection
        eyebrow="the view over both"
        title="Pipelines"
        description="A pipeline is the resolved path from an image ledger row to a retired sandbox record — the four stages every workload in the family walks, in order, with the records to prove it."
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch", marginTop: 26 }}>
        <section
          className="glass tac card atmos reveal halftone grain"
          style={{ ...DOMINANT_SURFACE, flex: "3 1 440px", minWidth: 0 }}
        >
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            stages
          </p>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem" }}>The four resolved stages</h2>
          <ul className="rules">
            {PIPELINE_STAGES.map(([stage, tag]) => (
              <li key={tag}>
                {stage} <span className="mono small" style={{ color: "var(--app-accent)" }}>{tag}</span>
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
              <strong className="strong">Foundry</strong> owns the sandbox and image records — the pipeline surface.
            </li>
            <li>
              <strong className="strong">Saddle</strong> is the engine the workload executes inside — the boundary.
            </li>
            <li>
              <strong className="strong">Forge</strong> runs the binaries and reports the outcomes — the runners.
            </li>
            <li>
              <strong className="strong">Vault</strong> keeps the network databases the records write to — the reserve.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
