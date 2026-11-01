/**
 * Objectbrowse.tsx — the object browser of the product face: the dense
 * browse table the storage products answer with — bucket filter chips, a
 * path filter, and hairline rows of the sealed ledger (path in mono,
 * channel dot plus kind, tabular size, digest under the tip, the seal
 * state pill). Every row answers from the REAL rehearsal ledger
 * (seedVault — objects.ts, the storage contract of storage.ts deciding the
 * channel); the boot shows the shimmer skeleton while the ledger lands
 * (the doctrine loading face) and the honest empty state answers an empty
 * filter. Nothing invented, the rehearsal says so.
 */

import { useEffect, useMemo, useState } from "react";
import { digestShort, formatBytes, seedVault, VAULT_BUCKETS, type VaultObject, verifyObject } from "../../objects.ts";
import { uicopy, uicopyfill } from "../../uistore.ts";
import { FACE_SEED } from "./HomePlanstable.tsx";
import { Skeleton } from "./HomeSkeleton.tsx";

/** the boot window the ledger skeleton rides (one settle, honest — the
 * readout says the rehearsal is opening, never that bytes are moving). */
const BOOT_MS = 480;

/**
 * The object browser of the vault.
 *
 * @returns the browse element.
 */
export function Objectbrowse() {
  const ledger = useMemo(() => seedVault(FACE_SEED), []);
  const [bucket, setBucket] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [booting, setBooting] = useState(true);

  /* the boot settle: the skeleton rides once, then the ledger answers */
  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), BOOT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const visible = useMemo(() => {
    const byBucket = bucket === "all" ? ledger : ledger.filter((object: VaultObject) => object.bucket === bucket);
    const needle = query.trim().toLowerCase();
    const byPath = needle ? byBucket.filter((object) => object.path.toLowerCase().includes(needle)) : byBucket;
    return byPath;
  }, [bucket, ledger, query]);

  const bytes = useMemo(() => visible.reduce((total, object) => total + object.size, 0), [visible]);

  return (
    <section className="vc-browse" aria-label={uicopy("face.browse.aria")} aria-busy={booting ? "true" : undefined}>
      <header className="vc-panel__head">
        <h3 className="vc-panel__title">{uicopy("face.browse.head")}</h3>
        <p className="vc-panel__count">
          {uicopyfill("face.browse.count", { count: String(visible.length), bytes: formatBytes(bytes) })}
        </p>
      </header>
      <div className="vc-browse__tools">
        <fieldset className="vc-buckets" aria-label={uicopy("face.browse.aria")}>
          {["all", ...VAULT_BUCKETS].map((name) => (
            <button
              key={name}
              type="button"
              className="vc-bucketchip"
              aria-pressed={bucket === name}
              onClick={() => setBucket(name)}
            >
              {name === "all" ? uicopy("face.browse.all") : name}
            </button>
          ))}
        </fieldset>
        <input
          className="vc-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={uicopy("face.browse.searchPlaceholder")}
          aria-label={uicopy("face.browse.searchAria")}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      {booting ? (
        <Skeleton rows={6} />
      ) : visible.length === 0 ? (
        <div className="vc-empty" role="status">
          <p className="vc-empty__title">{uicopy("face.browse.empty")}</p>
          <p className="vc-empty__line">{uicopy("face.browse.emptyHint")}</p>
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setQuery("");
              setBucket("all");
            }}
          >
            {uicopy("face.browse.clear")}
          </button>
        </div>
      ) : (
        <div className="vc-tablescroll">
          <table className="vc-table">
            <thead>
              <tr>
                <th scope="col">{uicopy("face.browse.col.path")}</th>
                <th scope="col">{uicopy("face.browse.col.bucket")}</th>
                <th scope="col">{uicopy("face.browse.col.channel")}</th>
                <th scope="col">{uicopy("face.browse.col.size")}</th>
                <th scope="col">{uicopy("face.browse.col.digest")}</th>
                <th scope="col">{uicopy("face.browse.col.seal")}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((object) => {
                const intact = verifyObject(object);
                return (
                  <tr key={object.id}>
                    <td>
                      <span className="vc-cell__path">{object.path}</span>
                    </td>
                    <td>
                      <span className="vc-cell__bucket">{object.bucket}</span>
                    </td>
                    <td>
                      <span className="vc-channel" data-channel={object.lfs ? "lfs" : "blob"}>
                        <i aria-hidden="true" />
                        {object.lfs ? "lfs" : "blob"}
                      </span>
                    </td>
                    <td className="vc-num">{formatBytes(object.size)}</td>
                    <td>
                      <span className="vc-digest" data-tip={object.digest} title={object.digest}>
                        {digestShort(object.digest)}
                      </span>
                    </td>
                    <td>
                      <span className="vc-seal" data-intact={intact ? "true" : "false"}>
                        {intact ? uicopy("objects.seal.intact") : uicopy("objects.seal.broken")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Objectbrowse;
