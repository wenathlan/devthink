/**
 * objects page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it mounts the page and is consumed only by the theme anchor (Sol/Sol.tsx).
 *
 * Objects — the sealed inventory of the vault, the first real platform
 * page: the rehearsal ledger answers with its paths, channels, digests and
 * the census of the safe, and a deposit seals a new row through the REAL
 * storage contract (storageModeFor, digestValid, storageRecordValid —
 * nothing invented). Every number is tabular; every channel is a dot plus
 * text, never color alone. The ledger is a seeded rehearsal and says so.
 */

import {
  ArrowRotateCounterclockwiseRegular,
  BoxMultipleRegular,
  LockClosedRegular,
  PlayFilled,
  ShieldCheckmarkRegular,
} from "@fluentui/react-icons";
import { type FormEvent, useMemo, useState } from "react";
import {
  channelPreview,
  digestShort,
  formatBytes,
  sealObject,
  seedVault,
  VAULT_BUCKETS,
  type VaultObject,
  vaultCensus,
  verifyObject,
} from "../../objects.ts";
import { label, labelfill } from "../../labels";
import { EmptyState } from "../widgets/shell.emptystate.tsx";

/** the seed of the rehearsal vault (shown on the page, pinned by the tests) */
export const VAULT_SEED = 20260314;

/** one object row of the sealed ledger. */
function ObjectRow({ object }: { object: VaultObject }) {
  const intact = verifyObject(object);
  return (
    <article className="vo-row" data-channel={object.lfs ? "lfs" : "blob"}>
      <div className="vo-row__id">
        <h3 className="vo-row__path">{object.path}</h3>
        <p className="vo-row__meta">
          {object.bucket} · {object.mime}
        </p>
      </div>
      <span className="vo-channel">
        <i aria-hidden="true" />
        {object.lfs ? "lfs" : "blob"}
      </span>
      <span className="vo-row__size">{formatBytes(object.size)}</span>
      <span
        className="vo-row__digest"
        data-tip={object.digest}
        aria-label={labelfill("objects.row.digestAria", { digest: object.digest })}
      >
        {digestShort(object.digest)}
      </span>
      <span className="vo-row__seal" data-intact={intact ? "true" : "false"}>
        <ShieldCheckmarkRegular fontSize={13} aria-hidden="true" />
        {intact ? label("objects.seal.intact") : label("objects.seal.broken")}
      </span>
    </article>
  );
}

/** The objects page: the sealed inventory of the safe. */
export default function Objects() {
  const [seed, setSeed] = useState(VAULT_SEED);
  const [objects, setObjects] = useState<VaultObject[]>(() => seedVault(VAULT_SEED));
  const [bucket, setBucket] = useState<string>("all");
  const [draft, setDraft] = useState({ path: "/sites/state.db", mime: "application/x-sqlite3", size: "48211046" });
  const [refusal, setRefusal] = useState<string | undefined>(undefined);

  const census = useMemo(() => vaultCensus(objects), [objects]);
  const visible = useMemo(
    () => (bucket === "all" ? objects : objects.filter((object) => object.bucket === bucket)),
    [objects, bucket],
  );

  const preview = useMemo(
    () => channelPreview(draft.mime, Number(draft.size.replaceAll("_", "")) || 0),
    [draft.mime, draft.size],
  );

  /** seals the draft through the real contract and rides it onto the ledger */
  function deposit(event: FormEvent) {
    event.preventDefault();
    const size = Number(draft.size.replaceAll("_", "")) || 0;
    const sealed = sealObject(bucket === "all" ? VAULT_BUCKETS[0] : bucket, draft.path, draft.mime, size, 0);
    setRefusal(sealed.refusal);
    if (!sealed.refusal) {
      setObjects((current) => [...current, sealed.object]);
      setDraft({ path: "", mime: draft.mime, size: "" });
    }
  }

  return (
    <main className="shell vo-page">
      <header className="pagehead">
        <p className="pagehead__eyebrow">{label("objects.eyebrow")}</p>
        <h1 className="pagehead__title">{label("objects.title")}</h1>
        <p className="pagehead__lede">{labelfill("objects.lede", { seed: String(seed), count: String(census.total) })}</p>
        <div className="pagehead__actions">
          <button
            type="button"
            className="btn"
            onClick={() => {
              const next = seed + 1;
              setSeed(next);
              setObjects(seedVault(next));
              setBucket("all");
              setRefusal(undefined);
            }}
          >
            <PlayFilled fontSize={14} aria-hidden="true" />
            {label("objects.action.reseed")}
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setSeed(VAULT_SEED);
              setObjects(seedVault(VAULT_SEED));
              setBucket("all");
              setRefusal(undefined);
            }}
          >
            <ArrowRotateCounterclockwiseRegular fontSize={14} aria-hidden="true" />
            {label("objects.action.restore")}
          </button>
        </div>
      </header>

      <section className="vo-summary" aria-label={label("objects.census.aria")}>
        <div className="vo-summary__cell">
          <p className="vo-summary__label">
            <BoxMultipleRegular fontSize={13} aria-hidden="true" />
            {label("objects.census.rows")}
          </p>
          <p className="vo-summary__value">{census.total}</p>
        </div>
        <div className="vo-summary__cell">
          <p className="vo-summary__label">
            <LockClosedRegular fontSize={13} aria-hidden="true" />
            {label("objects.census.bytes")}
          </p>
          <p className="vo-summary__value">{formatBytes(census.bytes)}</p>
        </div>
        <div className="vo-summary__cell vo-summary__cell--wide">
          <p className="vo-summary__label">{label("objects.census.channels")}</p>
          <p className="vo-summary__value vo-summary__channels">
            <span className="vo-lanecount" data-channel="lfs">
              <i aria-hidden="true" />
              {labelfill("objects.census.lfs", { rows: String(census.lfsRows), bytes: formatBytes(census.lfsBytes) })}
            </span>
            <span className="vo-lanecount" data-channel="blob">
              <i aria-hidden="true" />
              {labelfill("objects.census.blob", { rows: String(census.blobRows), bytes: formatBytes(census.blobBytes) })}
            </span>
          </p>
        </div>
        <div className="vo-summary__cell">
          <p className="vo-summary__label">{label("objects.census.biggest")}</p>
          <p className="vo-summary__value vo-summary__big">
            {census.biggest ? census.biggest.path : "—"}
            {census.biggest ? <span className="vo-summary__bigsize">{formatBytes(census.biggest.size)}</span> : null}
          </p>
        </div>
      </section>

      <form className="vo-form" onSubmit={deposit} aria-label={label("objects.form.aria")}>
        <p className="vo-form__head">
          <LockClosedRegular fontSize={13} aria-hidden="true" />
          {label("objects.form.head")}
        </p>
        <div className="vo-form__row">
          <input
            className="vo-form__input"
            type="text"
            value={draft.path}
            onChange={(event) => setDraft({ ...draft, path: event.target.value })}
            placeholder={label("objects.form.pathPlaceholder")}
            aria-label={label("objects.form.pathAria")}
            spellCheck={false}
          />
          <input
            className="vo-form__input"
            type="text"
            value={draft.mime}
            onChange={(event) => setDraft({ ...draft, mime: event.target.value })}
            placeholder={label("objects.form.mimePlaceholder")}
            aria-label={label("objects.form.mimeAria")}
            spellCheck={false}
          />
          <input
            className="vo-form__input"
            type="text"
            inputMode="numeric"
            value={draft.size}
            onChange={(event) => setDraft({ ...draft, size: event.target.value })}
            placeholder={label("objects.form.sizePlaceholder")}
            aria-label={label("objects.form.sizeAria")}
            spellCheck={false}
          />
          <button type="submit" className="btn">
            {label("objects.form.seal")}
          </button>
        </div>
        <fieldset className="vo-form__buckets" aria-label={label("objects.form.bucketsAria")}>
          {["all", ...VAULT_BUCKETS].map((name) => (
            <button
              key={name}
              type="button"
              className="vo-bucketchip"
              aria-pressed={bucket === name}
              onClick={() => setBucket(name)}
            >
              {name}
            </button>
          ))}
        </fieldset>
        <p className="vo-form__readout" aria-live="polite">
          {refusal ??
            labelfill("objects.form.readout", {
              channel: preview.channel,
              why: preview.why,
              digest: preview.digestShape,
            })}
        </p>
      </form>

      {visible.length === 0 ? (
        <EmptyState
          icon={BoxMultipleRegular}
          title={label("objects.empty.title")}
          line={
            bucket === "all"
              ? label("objects.empty.all")
              : labelfill("objects.empty.bucket", { bucket })
          }
          action={
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                setObjects(seedVault(seed));
                setBucket("all");
              }}
            >
              {label("objects.empty.action")}
            </button>
          }
        />
      ) : (
        <section className="vo-ledger" aria-label={label("objects.ledger.aria")}>
          <div className="vo-ledger__head" aria-hidden="true">
            <span>{label("objects.ledger.object")}</span>
            <span>{label("objects.ledger.channel")}</span>
            <span>{label("objects.ledger.size")}</span>
            <span>{label("objects.ledger.digest")}</span>
            <span>{label("objects.ledger.seal")}</span>
          </div>
          {visible.map((object) => (
            <ObjectRow key={object.id} object={object} />
          ))}
        </section>
      )}

      <p className="fr-footnote">{label("objects.footnote")}</p>
    </main>
  );
}
