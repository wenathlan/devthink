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
import { EmptyState } from "../shell/EmptyState";

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
      <span className="vo-row__digest" data-tip={object.digest} aria-label={`digest ${object.digest}`}>
        {digestShort(object.digest)}
      </span>
      <span className="vo-row__seal" data-intact={intact ? "true" : "false"}>
        <ShieldCheckmarkRegular fontSize={13} aria-hidden="true" />
        {intact ? "sealed" : "broken"}
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
        <p className="pagehead__eyebrow">objects · the sealed inventory</p>
        <h1 className="pagehead__title">Objects</h1>
        <p className="pagehead__lede">
          A seeded rehearsal of the safe — seed {seed}, {census.total} rows sealed under the real storage contract. The
          deposit line rides the same rules the family serves over https; nothing here claims live bytes.
        </p>
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
            reseed the rehearsal
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
            restore the ledger
          </button>
        </div>
      </header>

      <section className="vo-summary" aria-label="the census of the safe">
        <div className="vo-summary__cell">
          <p className="vo-summary__label">
            <BoxMultipleRegular fontSize={13} aria-hidden="true" />
            rows sealed
          </p>
          <p className="vo-summary__value">{census.total}</p>
        </div>
        <div className="vo-summary__cell">
          <p className="vo-summary__label">
            <LockClosedRegular fontSize={13} aria-hidden="true" />
            bytes under seal
          </p>
          <p className="vo-summary__value">{formatBytes(census.bytes)}</p>
        </div>
        <div className="vo-summary__cell vo-summary__cell--wide">
          <p className="vo-summary__label">channels</p>
          <p className="vo-summary__value vo-summary__channels">
            <span className="vo-lanecount" data-channel="lfs">
              <i aria-hidden="true" />
              {census.lfsRows} lfs · {formatBytes(census.lfsBytes)}
            </span>
            <span className="vo-lanecount" data-channel="blob">
              <i aria-hidden="true" />
              {census.blobRows} blob · {formatBytes(census.blobBytes)}
            </span>
          </p>
        </div>
        <div className="vo-summary__cell">
          <p className="vo-summary__label">biggest under seal</p>
          <p className="vo-summary__value vo-summary__big">
            {census.biggest ? census.biggest.path : "—"}
            {census.biggest ? <span className="vo-summary__bigsize">{formatBytes(census.biggest.size)}</span> : null}
          </p>
        </div>
      </section>

      <form className="vo-form" onSubmit={deposit} aria-label="seal a deposit">
        <p className="vo-form__head">
          <LockClosedRegular fontSize={13} aria-hidden="true" />
          seal a deposit — path · mime · size
        </p>
        <div className="vo-form__row">
          <input
            className="vo-form__input"
            type="text"
            value={draft.path}
            onChange={(event) => setDraft({ ...draft, path: event.target.value })}
            placeholder="/sites/state.db"
            aria-label="the absolute path of the deposit"
            spellCheck={false}
          />
          <input
            className="vo-form__input"
            type="text"
            value={draft.mime}
            onChange={(event) => setDraft({ ...draft, mime: event.target.value })}
            placeholder="application/x-sqlite3"
            aria-label="the mime type of the deposit"
            spellCheck={false}
          />
          <input
            className="vo-form__input"
            type="text"
            inputMode="numeric"
            value={draft.size}
            onChange={(event) => setDraft({ ...draft, size: event.target.value })}
            placeholder="48211046"
            aria-label="the byte size of the deposit"
            spellCheck={false}
          />
          <button type="submit" className="btn">
            seal it
          </button>
        </div>
        <fieldset className="vo-form__buckets" aria-label="the bucket the deposit rides">
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
            `rides the ${preview.channel} channel — ${preview.why} · digest ${preview.digestShape} · the row must pass the five checks of storageRecordValid`}
        </p>
      </form>

      {visible.length === 0 ? (
        <EmptyState
          icon={BoxMultipleRegular}
          title="the shelf holds nothing here"
          line={
            bucket === "all"
              ? "The safe stands empty — reseed the rehearsal to seal the ledger again."
              : `No object rides the ${bucket} bucket — seal a deposit into it or pick another bucket.`
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
              reseed the rehearsal vault
            </button>
          }
        />
      ) : (
        <section className="vo-ledger" aria-label="the sealed ledger">
          <div className="vo-ledger__head" aria-hidden="true">
            <span>object</span>
            <span>channel</span>
            <span>size</span>
            <span>digest</span>
            <span>seal</span>
          </div>
          {visible.map((object) => (
            <ObjectRow key={object.id} object={object} />
          ))}
        </section>
      )}

      <p className="fr-footnote">
        the channels split at the 1,000,000-byte threshold — lfs carries the masters with a three-line pointer, the
        small text-like rows ride the in-db git objects.
      </p>
    </main>
  );
}
