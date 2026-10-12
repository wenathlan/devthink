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

import { Archive, FolderLock, Play, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { type BucketRule, type BucketShelf, retentionLabel, seedRules, shelfOf } from "../../buckets.ts";
import { type VaultObject, formatBytes, seedVault } from "../../objects.ts";
import { EmptyState } from "../shell/EmptyState";

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
    <button type="button" className="vb-card" data-active={active ? "true" : undefined} onClick={() => onPick(entry.rule.bucket)}>
      <span className="vb-card__head">
        <FolderLock size={14} aria-hidden="true" />
        {entry.rule.bucket}
      </span>
      <span className="vb-card__policy" data-forever={entry.rule.days === 0 ? "true" : undefined}>
        {retentionLabel(entry.rule.days)}
      </span>
      <span className="vb-card__facts">
        <span>{entry.objects} rows</span>
        <span>{formatBytes(entry.bytes)}</span>
      </span>
      <span className="vb-share" role="img" aria-label={`lfs share ${Math.round(entry.lfsShare * 100)} percent`}>
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
        <p className="pagehead__eyebrow">buckets · the retention shelf</p>
        <h1 className="pagehead__title">Buckets</h1>
        <p className="pagehead__lede">
          {shelf.length} groups hold the rehearsal vault — seed {seed}, {formatBytes(totalBytes)} under seal. Every
          bucket answers with its policy and its rollup; the drawer lists the rows it keeps.
        </p>
        <div className="pagehead__actions">
          <button type="button" className="btn" onClick={reseed}>
            <Play size={14} aria-hidden="true" />
            reseed the shelf
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
            <RotateCcw size={14} aria-hidden="true" />
            restore the policies
          </button>
        </div>
      </header>

      {shelf.every((entry) => entry.objects === 0) ? (
        <EmptyState
          icon={Archive}
          title="the shelf stands empty"
          line="No bucket holds a row of the rehearsal — restore the ledger on /objects to fill the shelf again."
        />
      ) : (
        <section className="vb-shelf" aria-label="the bucket shelf">
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
            icon={FolderLock}
            title={`the ${active} bucket keeps nothing`}
            line="The policy holds, the rows do not — seal a deposit into this bucket on /objects."
          />
        ) : (
          <section className="vb-drawer" aria-label={`the objects of the ${active} bucket`}>
            <p className="vb-drawer__head">
              {active} · {drawer.length} rows · {formatBytes(drawer.reduce((total, object) => total + object.size, 0))}
            </p>
            <ul className="vb-objects">
              {drawer.map((object) => (
                <BucketObjectLine key={object.id} object={object} />
              ))}
            </ul>
          </section>
        )
      ) : (
        <p className="fr-footnote">pick a bucket to open its drawer — the policy and the rollup answer first.</p>
      )}
    </main>
  );
}
