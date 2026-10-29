/**
 * buckets page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it mounts the page and is consumed only by the theme anchor (Sol/Sol.tsx).
 *
 * Buckets — the retention shelf of the vault: every bucket answers with its
 * policy (sealed forever or a day window), its rollup (rows, bytes, lfs
 * share) and its own object list. The shelf reads the REAL rehearsal
 * objects (objects.ts) and the REAL policies (buckets.ts) — every number
 * tabular, every state a dot plus text. A seeded rehearsal, said out loud.
 */

import {
  ArchiveRegular,
  ArrowRotateCounterclockwiseRegular,
  LockClosedRegular,
  PlayFilled,
} from "@fluentui/react-icons";
import { useMemo, useState } from "react";
import { type BucketRule, type BucketShelf, retentionLabel, seedRules, shelfOf } from "../../buckets.ts";
import { formatBytes, seedVault, type VaultObject } from "../../objects.ts";
import { label, labelfill } from "../../labels";
import { EmptyState } from "../wingets";

/** the seed of the rehearsal shelf (shown on the page, pinned by the tests) */
export const SHELF_SEED = 912731;

/** one bucket card of the shelf. */
function BucketCard({
  entry,
  active,
  onPick,
}: {
  entry: BucketShelf;
  active: boolean;
  onPick: (bucket: string) => void;
}) {
  return (
    <button
      type="button"
      className="vb-card"
      data-active={active ? "true" : undefined}
      onClick={() => onPick(entry.rule.bucket)}
    >
      <span className="vb-card__head">
        <LockClosedRegular fontSize={14} aria-hidden="true" />
        {entry.rule.bucket}
      </span>
      <span className="vb-card__policy" data-forever={entry.rule.days === 0 ? "true" : undefined}>
        {retentionLabel(entry.rule.days)}
      </span>
      <span className="vb-card__facts">
        <span>{labelfill("buckets.card.rows", { count: String(entry.objects) })}</span>
        <span>{formatBytes(entry.bytes)}</span>
      </span>
      <span
        className="vb-share"
        role="img"
        aria-label={labelfill("buckets.card.shareAria", { share: String(Math.round(entry.lfsShare * 100)) })}
      >
        <i style={{ width: `${Math.round(entry.lfsShare * 100)}%` }} />
      </span>
      <span className="vb-card__note">{entry.rule.note}</span>
    </button>
  );
}

/** one object line of the bucket drawer. */
function BucketObjectLine({ object }: { object: VaultObject }) {
  return (
    <li className="vb-object">
      <span className="vb-object__path">{object.path}</span>
      <span className="vb-object__mime">{object.mime}</span>
      <span className="vb-object__size">{formatBytes(object.size)}</span>
      <span className="vo-channel" data-channel={object.lfs ? "lfs" : "blob"}>
        <i aria-hidden="true" />
        {object.lfs ? "lfs" : "blob"}
      </span>
    </li>
  );
}

/** The buckets page: the retention shelf of the safe. */
export default function Buckets() {
  const [seed, setSeed] = useState(SHELF_SEED);
  const [rules, setRules] = useState<BucketRule[]>(() => seedRules(SHELF_SEED));
  const [objects] = useState<VaultObject[]>(() => seedVault(SHELF_SEED));
  const [active, setActive] = useState<string | undefined>(undefined);

  const shelf = useMemo(() => shelfOf(objects, rules), [objects, rules]);
  const drawer = useMemo(() => (active ? objects.filter((object) => object.bucket === active) : []), [active, objects]);
  const totalBytes = useMemo(() => shelf.reduce((total, entry) => total + entry.bytes, 0), [shelf]);

  function reseed() {
    const next = seed + 1;
    setSeed(next);
    setRules(seedRules(next));
    setActive(undefined);
  }

  return (
    <main className="shell vb-page">
      <header className="pagehead">
        <p className="pagehead__eyebrow">{label("buckets.eyebrow")}</p>
        <h1 className="pagehead__title">{label("buckets.title")}</h1>
        <p className="pagehead__lede">
          {labelfill("buckets.lede", {
            groups: String(shelf.length),
            seed: String(seed),
            bytes: formatBytes(totalBytes),
          })}
        </p>
        <div className="pagehead__actions">
          <button type="button" className="btn" onClick={reseed}>
            <PlayFilled fontSize={14} aria-hidden="true" />
            {label("buckets.action.reseed")}
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setSeed(SHELF_SEED);
              setRules(seedRules(SHELF_SEED));
              setActive(undefined);
            }}
          >
            <ArrowRotateCounterclockwiseRegular fontSize={14} aria-hidden="true" />
            {label("buckets.action.restore")}
          </button>
        </div>
      </header>

      {shelf.every((entry) => entry.objects === 0) ? (
        <EmptyState
          icon={ArchiveRegular}
          title={label("buckets.empty.shelfTitle")}
          line={label("buckets.empty.shelfLine")}
        />
      ) : (
        <section className="vb-shelf" aria-label={label("buckets.shelf.aria")}>
          {shelf.map((entry) => (
            <BucketCard
              key={entry.rule.bucket}
              entry={entry}
              active={active === entry.rule.bucket}
              onPick={(bucket) => setActive(active === bucket ? undefined : bucket)}
            />
          ))}
        </section>
      )}

      {active ? (
        drawer.length === 0 ? (
          <EmptyState
            icon={LockClosedRegular}
            title={labelfill("buckets.empty.drawerTitle", { bucket: active })}
            line={label("buckets.empty.drawerLine")}
          />
        ) : (
          <section className="vb-drawer" aria-label={labelfill("buckets.drawer.aria", { bucket: active })}>
            <p className="vb-drawer__head">
              {labelfill("buckets.drawer.head", {
                bucket: active,
                rows: String(drawer.length),
                bytes: formatBytes(drawer.reduce((total, object) => total + object.size, 0)),
              })}
            </p>
            <ul className="vb-objects">
              {drawer.map((object) => (
                <BucketObjectLine key={object.id} object={object} />
              ))}
            </ul>
          </section>
        )
      ) : (
        <p className="fr-footnote">{label("buckets.footnote")}</p>
      )}
    </main>
  );
}
