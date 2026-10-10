/**
 * foundryview.tsx — the pipeline interface (foundry.devthink.pro) inside
 * the os. Pages: sandboxes (the lifecycle records), images (the layer
 * ledgers + the packaged artifact line), pipelines (the view over both).
 * Content absorbed from the foundry family site: the e2b and docker clone
 * interface whose engine lives in saddle, while foundry owns the surface
 * records — sandboxes and images — over the same sqlite contract every
 * family app shares.
 *
 * Task 3-c identity pass: the hero carries the têmpera accent with the
 * factory glyph under a quench sweep inside its own stroke; sandboxes
 * read as a state machine (created → running → paused/exited), images as
 * the packaged artifact line (.tzst/.tar.gz/.tar.xz lanes of the family
 * site), and the pipeline page keeps the four resolved stages.
 */
import { useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "./appheader.tsx";
import { appMeta, PERSONAS } from "./apps.ts";
import { AuraChat } from "./aurachat.tsx";
import { accentVars, FamilyHero, type FamilyStat, FamilyStyles, familyAccentOf } from "./familyidentity.tsx";
import type { OSHandle } from "./ostypes.ts";
import { PageSection } from "./pagesection.tsx";

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

/** the packaging lanes of the family site — the formats a clone ships in. */
const ARTIFACT_FORMATS = [".tzst", ".tar.gz", ".tar.xz"];

/** the honest totals, computed from the records. */
function foundryTotals() {
  const running = SANDBOXES.filter((s) => s.state === "running").length;
  const paused = SANDBOXES.filter((s) => s.state === "paused").length;
  const exited = SANDBOXES.filter((s) => s.state === "exited").length;
  const mb = IMAGES.reduce((acc, i) => acc + Number.parseFloat(i.size), 0);
  const layers = IMAGES.reduce((acc, i) => acc + Number.parseInt(i.layers, 10), 0);
  return { running, paused, exited, sandboxes: SANDBOXES.length, images: IMAGES.length, mb, layers };
}

export function FoundryApp({ os }: { os: OSHandle }) {
  const meta = appMeta("foundry");
  if (!meta) throw new Error("the foundry meta is missing from the catalog");
  const [chatOpen, setChatOpen] = useState(true);
  const page = meta.pages.some((p) => p.id === os.view.page) ? os.view.page : "sandboxes";
  const accent = familyAccentOf(meta.id, meta.accent);
  const totals = foundryTotals();

  const stats: FamilyStat[] = [
    { label: "sandbox records", value: String(totals.sandboxes) },
    { label: "running now", value: String(totals.running), accent: true },
    { label: "images in the ledger", value: String(totals.images) },
    { label: "packaged across images", value: `${(totals.mb / 1000).toFixed(2)} GB` },
  ];

  return (
    <div className="fam-view" style={accentVars(accent)}>
      <FamilyStyles />
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
            <FamilyHero
              app={meta}
              tagline="The build hall of the family — sandboxes booted from the image ledger, workloads run on the saddle boundary, artifacts packaged and retired with their records."
              stats={stats}
              glyphMotion="temper"
              status="build hall live"
            />
            {page === "images" ? (
              <ImagesPage totals={totals} />
            ) : page === "pipelines" ? (
              <PipelinesPage />
            ) : (
              <SandboxesPage totals={totals} />
            )}
          </div>
          {chatOpen ? (
            <div className="chat-panel">
              <AuraChat persona={PERSONAS.foundry} storageKey="dt-chat-foundry-v1" appLabel="foundry" />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

/* ------------------------------ SANDBOXES ---------------------------- */

function SandboxesPage({ totals }: { totals: ReturnType<typeof foundryTotals> }) {
  const [creating, setCreating] = useState(false);
  const statePct = (n: number) => `${Math.round((n / totals.sandboxes) * 100)}%`;

  const ladder = [
    { label: "running — engine lane live", n: totals.running, tone: "success" as const },
    { label: "paused — record kept, compute freed", n: totals.paused, tone: "warning" as const },
    { label: "exited — log kept, record retired", n: totals.exited, tone: "" as const },
  ];

  return (
    <>
      <PageSection
        eyebrow="lifecycle records"
        title="Sandboxes"
        heading="h2"
        description="One record per sandbox: the image it booted from, the state machine it answers (running, paused, exited), the region it lives in — the engine stays in saddle, the record stays here."
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
          aria-labelledby="sbx-h"
        >
          <div className="fam-card__head">
            <h2 id="sbx-h" className="fam-card__title">
              Sandbox records <span className="fam-card__count">{totals.running} running</span>
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
                      <span
                        className={`badge ${s.state === "running" ? "success" : s.state === "paused" ? "warning" : ""}`}
                      >
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

        <section
          className="fam-card fam-card--s2 reveal"
          style={{ flex: "2 1 300px", minWidth: 0, padding: 22, animationDelay: "90ms" }}
        >
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            state machine
          </p>
          <h2 className="fam-card__title" style={{ marginBottom: 12, fontSize: "1.2rem" }}>
            The record, at each state
          </h2>
          {ladder.map((l) => (
            <div key={l.label} style={{ marginBottom: 14 }}>
              <div className="row between" style={{ marginBottom: 6 }}>
                <span className={`badge ${l.tone}`}>
                  <span className="dot" aria-hidden="true" />
                  {l.n} {l.label.split(" — ")[0]}
                </span>
                <span className="fam-num mono" style={{ fontSize: ".8rem" }}>
                  {statePct(l.n)}
                </span>
              </div>
              <div className="fam-meter" role="img" aria-label={`${l.n} sandboxes ${l.label}`}>
                <i style={{ width: statePct(l.n) }} />
              </div>
              <p className="small" style={{ margin: "6px 0 0", color: "var(--dt-faint)" }}>
                {l.label}
              </p>
            </div>
          ))}
          <p className="small" style={{ margin: "14px 0 0" }}>
            Never an inferred state — the record carries the machine, the region pin and the engine lane.
          </p>
        </section>
      </div>
    </>
  );
}

/* -------------------------------- IMAGES ----------------------------- */

function ImagesPage({ totals }: { totals: ReturnType<typeof foundryTotals> }) {
  return (
    <>
      <PageSection
        eyebrow="layer ledgers"
        title="Images"
        heading="h2"
        description="The image ledger resolves every base the family boots: the layer manifest, the sealed size and the freshness stamp — the same rows the sandbox creation flow reads."
        reveal
      />

      <section
        className="fam-card reveal"
        style={{
          ...{ background: "var(--atmos-veil), var(--fam-s1)", overflow: "hidden" },
          marginTop: 26,
          padding: 22,
        }}
        aria-labelledby="img-h"
      >
        <div className="fam-card__head">
          <h2 id="img-h" className="fam-card__title">
            Family images{" "}
            <span className="fam-card__count">
              {totals.layers} layers across {totals.images} images
            </span>
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

      {/* the artifact line: the packaging lanes of the family site */}
      <section className="fam-card fam-card--s2 reveal" style={{ marginTop: 18, padding: 22 }} aria-labelledby="art-h">
        <div className="fam-card__head">
          <h2 id="art-h" className="fam-card__title">
            The artifact line <span className="fam-card__count">{(totals.mb / 1000).toFixed(2)} GB packaged</span>
          </h2>
          <span className="badge" role="status">
            <span className="dot" aria-hidden="true" />
            {totals.images} images · {totals.layers} layers
          </span>
        </div>
        <p className="small" style={{ margin: "10px 0 12px" }}>
          Every image resolves into the packaging lanes the family clone ships in — builds and conversions leave the
          foundry as packaged artifacts, the record stays here.
        </p>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          {ARTIFACT_FORMATS.map((f) => (
            <span key={f} className="badge mono">
              {f}
            </span>
          ))}
          <span className="mono small" style={{ color: "var(--app-accent)" }}>
            layer manifests ride beside each lane
          </span>
        </div>
      </section>
    </>
  );
}

/* ------------------------------ PIPELINES ---------------------------- */

function PipelinesPage() {
  return (
    <>
      <PageSection
        eyebrow="the view over both"
        title="Pipelines"
        heading="h2"
        description="A pipeline is the resolved path from an image ledger row to a retired sandbox record — the four stages every workload in the family walks, in order, with the records to prove it."
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
            stages
          </p>
          <h2 className="fam-card__title" style={{ marginBottom: 8, fontSize: "1.2rem" }}>
            The four resolved stages
          </h2>
          <ul className="rules">
            {PIPELINE_STAGES.map(([stage, tag]) => (
              <li key={tag}>
                {stage} <span className="mono small fam-num">{tag}</span>
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
    </>
  );
}
