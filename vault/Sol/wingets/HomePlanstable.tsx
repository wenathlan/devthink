/**
 * Planstable.tsx — the plans surface of the product face: the four bucket
 * plans of the safe as one dense table (the Supabase-grade plan sheet) —
 * plan name in mono, retention window, sealed rows and bytes in tabular
 * numerals, the lfs share as a hairline bar, the policy note riding the
 * featured row. Every number answers from the REAL rehearsal engines
 * (seedRules, shelfOf — buckets.ts over the sealed objects of objects.ts);
 * nothing is invented, the rehearsal says so. The featured plan (the
 * forever policy) carries the raised row the ledger law pins.
 */

import { useMemo } from "react";
import { type BucketShelf, retentionLabel, seedRules, shelfOf } from "../../buckets.ts";
import { formatBytes, seedVault } from "../../objects.ts";
import { uicopy, uicopyfill } from "../../uistore.ts";

/** the rehearsal seed the product face answers (the same seed the objects
 * page pins — one rehearsal, zero drift). */
export const FACE_SEED = 20260314;

/**
 * The bucket plans table of the vault.
 *
 * @returns the plans table element.
 */
export function Planstable() {
  const shelf = useMemo(() => shelfOf(seedVault(FACE_SEED), seedRules(FACE_SEED)), []);

  const rows = shelf;

  return (
    <section className="vc-plans" aria-label={uicopy("face.plans.aria")}>
      <header className="vc-panel__head">
        <h3 className="vc-panel__title">{uicopy("face.plans.head")}</h3>
      </header>
      <div className="vc-tablescroll">
        <table className="vc-table">
          <caption className="vc-table__caption">{uicopy("face.plans.caption")}</caption>
          <thead>
            <tr>
              <th scope="col">{uicopy("face.plans.col.bucket")}</th>
              <th scope="col">{uicopy("face.plans.col.policy")}</th>
              <th scope="col">{uicopy("face.plans.col.rows")}</th>
              <th scope="col">{uicopy("face.plans.col.bytes")}</th>
              <th scope="col">{uicopy("face.plans.col.share")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((entry: BucketShelf) => (
              <tr key={entry.rule.bucket} className={entry.rule.days === 0 ? "is-featured" : undefined}>
                <td>
                  <span className="vc-cell__name">{entry.rule.bucket}</span>
                  {entry.rule.days === 0 ? (
                    <span className="vc-cell__note">{uicopy("face.plans.featuredNote")}</span>
                  ) : null}
                </td>
                <td>
                  <span className="vc-policy" data-forever={entry.rule.days === 0 ? "true" : undefined}>
                    {retentionLabel(entry.rule.days)}
                  </span>
                </td>
                <td className="vc-num">{String(entry.objects)}</td>
                <td className="vc-num">{formatBytes(entry.bytes)}</td>
                <td>
                  <span
                    className="vc-share"
                    role="img"
                    aria-label={uicopyfill("face.plans.shareAria", {
                      bucket: entry.rule.bucket,
                      share: String(Math.round(entry.lfsShare * 100)),
                    })}
                  >
                    <i style={{ width: `${Math.round(entry.lfsShare * 100)}%` }} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Planstable;
