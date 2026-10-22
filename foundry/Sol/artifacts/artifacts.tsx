/**
 * artifacts page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it mounts the page and is consumed only by the theme anchor (Sol/Sol.tsx).
 *
 * Artifacts — the packaging line of the foundry: every artifact is sealed
 * with its fnv-1a checksum over a canonical identity string (name · ext ·
 * bytes · payload), re-verified on the page and rendered as the manifest.
 * The line is a seeded rehearsal (the seed is shown); the seal is the real
 * engine (artifact.ts) — the same bytes in node and in the browser.
 */

import { ArrowSyncRegular, CheckmarkCircleRegular, PlayFilled, ShieldCheckmarkRegular } from "@fluentui/react-icons";
import { useMemo, useState } from "react";
import {
  type Artifact,
  artifactLine,
  fnv1aHex,
  manifest,
  sealArtifact,
  seedArtifacts,
  verifyArtifact,
} from "../../artifact.ts";
import { PIPELINE, planrehearsal, type planstate } from "../../graphplan.ts";
import { EmptyState } from "../componentes/shell/EmptyState.tsx";
import GraphPanel from "../componentes/artifacts/graphpanel.tsx";

/** the seed of the packaging rehearsal (shown on the page, pinned by the tests) */
export const LINE_SEED = 804613;

/** one artifact row of the packaging line. */
function ArtifactRow({ artifact }: { artifact: Artifact }) {
  const intact = verifyArtifact(artifact);
  return (
    <article className="fa-row" data-intact={intact ? "true" : "false"}>
      <div className="fa-row__main">
        <h3 className="fa-row__name">{artifact.name}</h3>
        <p className="fa-row__identity">{artifact.identity}</p>
      </div>
      <span className="fa-row__bytes">{artifact.bytes.toLocaleString("en-US")} b</span>
      <span
        className="fa-row__checksum"
        data-tip={`fnv-1a over: ${artifact.identity}`}
        aria-label={`checksum ${artifact.checksum}, fnv-1a over ${artifact.identity}`}
      >
        {artifact.checksum}
      </span>
      <span className="fa-row__seal">
        <ShieldCheckmarkRegular fontSize={13} aria-hidden="true" />
        {intact ? "sealed" : "mismatch"}
      </span>
    </article>
  );
}

/** The artifacts page: the packaging line. */
export default function Artifacts() {
  const [seed, setSeed] = useState(LINE_SEED);
  const [tick, setTick] = useState(0);
  const [name, setName] = useState("");
  const [payload, setPayload] = useState("");
  const [drafts, setDrafts] = useState<Artifact[]>([]);
  const engine = useMemo(() => seedArtifacts(seed), [seed]);
  const shelf = useMemo(() => [...engine, ...drafts], [engine, drafts]);
  const shelfManifest = useMemo(() => manifest(shelf), [shelf]);
  // the pipeline plan rehearses on the same seed and tick as the line: one
  // advance walks the shelf AND the stage graph together (one run, two
  // views of the same rehearsal)
  const planstates = useMemo<Record<string, planstate>>(() => planrehearsal(PIPELINE, seed, tick), [seed, tick]);
  const draftName = name.trim() || "unnamed-artifact";
  const draftPreview = `${draftName}.tzst · ${4096 + payload.length} b`;

  /** seals a drafted artifact through the real engine (an honest default
   * name when the draft is empty — the line never invents a name) */
  function sealDraft(event: React.FormEvent) {
    event.preventDefault();
    const bytes = 4_096 + payload.length;
    const sealed = sealArtifact(draftName, "tzst", bytes, payload);
    setDrafts((current) => [...current, sealed]);
    setName("");
    setPayload("");
  }

  return (
    <main className="shell fa-page">
      <header className="pagehead">
        <p className="pagehead__eyebrow">artifacts · the packaging line</p>
        <h1 className="pagehead__title">Artifacts</h1>
        <p className="pagehead__lede">
          Every packaged artifact carries its checksum — fnv-1a over the canonical identity (name · ext · bytes ·
          payload), sealed once and re-verified on sight. A seeded rehearsal (seed {seed}) fills the line.
        </p>
        <div className="pagehead__actions">
          <button type="button" className="btn" onClick={() => setTick((value) => value + 1)}>
            <PlayFilled fontSize={14} aria-hidden="true" />
            walk the pipeline
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setSeed((value) => value + 1);
              setTick(0);
            }}
          >
            <ArrowSyncRegular fontSize={14} aria-hidden="true" />
            rerun the line
          </button>
        </div>
      </header>

      <section className="fa-summary" aria-label="the line summary">
        <div className="fa-summary__cell">
          <p className="fa-summary__label">
            <CheckmarkCircleRegular fontSize={13} aria-hidden="true" />
            artifacts
          </p>
          <p className="fa-summary__value">{shelf.length}</p>
        </div>
        <div className="fa-summary__cell">
          <p className="fa-summary__label">all sealed</p>
          <p className="fa-summary__value">{shelf.every((artifact) => verifyArtifact(artifact)) ? "yes" : "no"}</p>
        </div>
        <div className="fa-summary__cell">
          <p className="fa-summary__label">digest</p>
          <p className="fa-summary__value">fnv-1a · 8 hex</p>
        </div>
        <div className="fa-summary__cell">
          <p className="fa-summary__label">identity string</p>
          <p className="fa-summary__value fa-summary__mono">name · ext · bytes · payload</p>
        </div>
      </section>

      <GraphPanel plan={PIPELINE} states={planstates} />

      <form className="fa-form" onSubmit={sealDraft} aria-label="seal a draft artifact">
        <p className="fa-form__head">seal a draft</p>
        <div className="fa-form__grid">
          <label className="fa-form__field">
            <span>name</span>
            <input
              type="text"
              value={name}
              maxLength={40}
              placeholder="my-herd"
              aria-label="name of the artifact"
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="fa-form__field">
            <span>payload digest (any string)</span>
            <input
              type="text"
              value={payload}
              maxLength={40}
              placeholder="rev-2026-02-14"
              aria-label="payload string of the artifact"
              onChange={(event) => setPayload(event.target.value)}
            />
          </label>
          <button type="submit" className="btn">
            seal it
          </button>
        </div>
        <p className="fa-form__hint">
          the draft seals as {draftPreview} · fnv-1a{" "}
          {fnv1aHex(`${draftName} · .tzst · ${4096 + payload.length} · ${payload}`)}
        </p>
      </form>

      {shelf.length === 0 ? (
        <EmptyState
          icon={CheckmarkCircleRegular}
          title="the packaging line is clear"
          line="No artifact is sealed right now — rerun the line or seal a draft above."
          action={
            <button type="button" className="btn secondary" onClick={() => setSeed((value) => value + 1)}>
              rerun the packaging line
            </button>
          }
        />
      ) : (
        <section className="fa-line" aria-label="the packaging line">
          <div className="fa-line__head" aria-hidden="true">
            <span>artifact</span>
            <span>bytes</span>
            <span>checksum</span>
            <span>seal</span>
          </div>
          {shelf.map((artifact) => (
            <ArtifactRow key={`${artifact.id}-${artifact.identity}`} artifact={artifact} />
          ))}
        </section>
      )}

      <figure className="fa-manifestwrap" aria-label="the manifest of the line">
        <pre className="fa-manifest">{shelfManifest}</pre>
      </figure>
      {shelf[0] ? <p className="fr-footnote">{artifactLine(shelf[0])} — the manifest renders the same line.</p> : null}
    </main>
  );
}
