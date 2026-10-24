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
import { labelfill, label } from "../../labels.ts";
import { EmptyState } from "../widgets/shell.emptystate.tsx";
import GraphPanel from "../widgets/artifacts.graphpanel.tsx";

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
      <span className="fa-row__bytes">{labelfill("artifacts.row.bytes", { bytes: artifact.bytes.toLocaleString("en-US") })}</span>
      <span
        className="fa-row__checksum"
        data-tip={labelfill("artifacts.row.checksumTip", { identity: artifact.identity })}
        aria-label={labelfill("artifacts.row.checksumAria", { checksum: artifact.checksum, identity: artifact.identity })}
      >
        {artifact.checksum}
      </span>
      <span className="fa-row__seal">
        <ShieldCheckmarkRegular fontSize={13} aria-hidden="true" />
        {intact ? label("artifacts.row.sealed") : label("artifacts.row.mismatch")}
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
  const draftName = name.trim() || label("artifacts.unnamed");
  const draftPreview = labelfill("artifacts.form.preview", { name: draftName, bytes: String(4096 + payload.length) });

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
        <p className="pagehead__eyebrow">{label("artifacts.eyebrow")}</p>
        <h1 className="pagehead__title">{label("artifacts.title")}</h1>
        <p className="pagehead__lede">{labelfill("artifacts.lede", { seed: String(seed) })}</p>
        <div className="pagehead__actions">
          <button type="button" className="btn" onClick={() => setTick((value) => value + 1)}>
            <PlayFilled fontSize={14} aria-hidden="true" />
            {label("artifacts.walk")}
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
            {label("artifacts.rerun")}
          </button>
        </div>
      </header>

      <section className="fa-summary" aria-label={label("artifacts.summary.aria")}>
        <div className="fa-summary__cell">
          <p className="fa-summary__label">
            <CheckmarkCircleRegular fontSize={13} aria-hidden="true" />
            {label("artifacts.summary.count")}
          </p>
          <p className="fa-summary__value">{shelf.length}</p>
        </div>
        <div className="fa-summary__cell">
          <p className="fa-summary__label">{label("artifacts.summary.allSealed")}</p>
          <p className="fa-summary__value">
            {shelf.every((artifact) => verifyArtifact(artifact))
              ? label("artifacts.summary.yes")
              : label("artifacts.summary.no")}
          </p>
        </div>
        <div className="fa-summary__cell">
          <p className="fa-summary__label">{label("artifacts.summary.digest")}</p>
          <p className="fa-summary__value">{label("artifacts.summary.digestValue")}</p>
        </div>
        <div className="fa-summary__cell">
          <p className="fa-summary__label">{label("artifacts.summary.identity")}</p>
          <p className="fa-summary__value fa-summary__mono">{label("artifacts.summary.identityValue")}</p>
        </div>
      </section>

      <GraphPanel plan={PIPELINE} states={planstates} />

      <form className="fa-form" onSubmit={sealDraft} aria-label={label("artifacts.form.aria")}>
        <p className="fa-form__head">{label("artifacts.form.head")}</p>
        <div className="fa-form__grid">
          <label className="fa-form__field">
            <span>{label("artifacts.form.name")}</span>
            <input
              type="text"
              value={name}
              maxLength={40}
              placeholder={label("artifacts.form.namePlaceholder")}
              aria-label={label("artifacts.form.nameAria")}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="fa-form__field">
            <span>{label("artifacts.form.payload")}</span>
            <input
              type="text"
              value={payload}
              maxLength={40}
              placeholder={label("artifacts.form.payloadPlaceholder")}
              aria-label={label("artifacts.form.payloadAria")}
              onChange={(event) => setPayload(event.target.value)}
            />
          </label>
          <button type="submit" className="btn">
            {label("artifacts.form.submit")}
          </button>
        </div>
        <p className="fa-form__hint">
          {labelfill("artifacts.form.hint", {
            preview: draftPreview,
            digest: fnv1aHex(`${draftName} · .tzst · ${4096 + payload.length} · ${payload}`),
          })}
        </p>
      </form>

      {shelf.length === 0 ? (
        <EmptyState
          icon={CheckmarkCircleRegular}
          title={label("artifacts.empty.title")}
          line={label("artifacts.empty.line")}
          action={
            <button type="button" className="btn secondary" onClick={() => setSeed((value) => value + 1)}>
              {label("artifacts.empty.action")}
            </button>
          }
        />
      ) : (
        <section className="fa-line" aria-label={label("artifacts.line.aria")}>
          <div className="fa-line__head" aria-hidden="true">
            <span>{label("artifacts.head.artifact")}</span>
            <span>{label("artifacts.head.bytes")}</span>
            <span>{label("artifacts.head.checksum")}</span>
            <span>{label("artifacts.head.seal")}</span>
          </div>
          {shelf.map((artifact) => (
            <ArtifactRow key={`${artifact.id}-${artifact.identity}`} artifact={artifact} />
          ))}
        </section>
      )}

      <figure className="fa-manifestwrap" aria-label={label("artifacts.manifest.aria")}>
        <pre className="fa-manifest">{shelfManifest}</pre>
      </figure>
      {shelf[0] ? (
        <p className="fr-footnote">{labelfill("artifacts.footnote", { line: artifactLine(shelf[0]) })}</p>
      ) : null}
    </main>
  );
}
