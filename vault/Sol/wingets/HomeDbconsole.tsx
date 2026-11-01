/**
 * Dbconsole.tsx — the database console of the product face: the mono
 * console pane the database products answer with — one census line per
 * truth (rows and bytes under seal, the lane split, the biggest row, the
 * sweep plan at its first due tick, the storage contract line), every
 * number from the REAL engines (vaultCensus over the sealed ledger,
 * sweepPlan over the real policies, firstDueTick — objects.ts, buckets.ts,
 * retention.ts). Under the readout the channel ledger keeps its hairline
 * table (the storage contract channels — the home rows the landing pinned,
 * moved here where the console lives). Nothing invented, the rehearsal
 * says so.
 */

import { useMemo } from "react";
import { seedRules } from "../../buckets.ts";
import { formatBytes, seedVault, vaultCensus } from "../../objects.ts";
import { firstDueTick, sweepPlan } from "../../retention.ts";
import { uicopy, uicopyfill } from "../../uistore.ts";
import { useVaultUsage } from "../../vaultclient.ts";
import { FACE_SEED } from "./HomePlanstable.tsx";

/** the storage contract threshold the contract line reads (the real
 * storageModeFor boundary — one constant, zero drift). */
const THRESHOLD = "1,000,000 b";

/** one channel row of the ledger table (the kind, the sealed shape and
 * the state stay data; the prose fills at render through the store). */
interface ChannelRow {
  name: string;
  note: string;
  kind: string;
  size: string;
  state: string;
  featured: boolean;
}

/**
 * The channel ledger rows at render time: the prose rides the store (the
 * live rows re-render the table when they land), the data stays data.
 *
 * @returns the channel rows.
 */
function channels(): ChannelRow[] {
  return [
    {
      name: uicopy("home.channel.lfs.name"),
      note: uicopy("home.channel.lfs.note"),
      kind: "lfs",
      size: "> 1,000,000 b",
      state: "sealed",
      featured: true,
    },
    {
      name: uicopy("home.channel.blobs.name"),
      note: uicopy("home.channel.blobs.note"),
      kind: "blob",
      size: "≤ 1,000,000 b",
      state: "sealed",
      featured: false,
    },
    {
      name: uicopy("home.channel.pointers.name"),
      note: uicopy("home.channel.pointers.note"),
      kind: "catalog",
      size: "3 lines",
      state: "guarded",
      featured: false,
    },
    {
      name: uicopy("home.channel.records.name"),
      note: uicopy("home.channel.records.note"),
      kind: "serve",
      size: "5 checks",
      state: "served",
      featured: false,
    },
  ];
}

/**
 * The database console of the vault.
 *
 * @returns the console element.
 */
export function Dbconsole() {
  /** the engine lane: when the configured origin answers, the live usage
   * census renders its own console line (the engine answered — the
   * rehearsal lines below stay declared, never pretending to be live). */
  const { live } = useVaultUsage();
  const ledger = useMemo(() => seedVault(FACE_SEED), []);
  const rules = useMemo(() => seedRules(FACE_SEED), []);
  const census = useMemo(() => vaultCensus(ledger), [ledger]);
  const dueTick = useMemo(() => firstDueTick(ledger, rules), [ledger, rules]);
  const plan = useMemo(
    () => sweepPlan(ledger, rules, Number.isFinite(dueTick) ? dueTick : 0),
    [dueTick, ledger, rules],
  );

  return (
    <section className="vc-console" aria-label={uicopy("face.console.aria")}>
      <header className="vc-panel__head">
        <h3 className="vc-panel__title">{uicopy("face.console.head")}</h3>
      </header>
      <div className="vc-console__pane" role="log" aria-label={uicopy("face.console.caption")}>
        <p className="vc-console__caption">{uicopy("face.console.caption")}</p>
        {live ? (
          <p className="vc-console__line vc-console__line--live">
            <span className="vc-console__prompt" aria-hidden="true">
              »
            </span>
            {uicopyfill("face.console.line.live", {
              objects: String(live.objects),
              bytes: formatBytes(Number(live.bytes)),
              chunks: String(live.chunks),
            })}
          </p>
        ) : null}
        <p className="vc-console__line">
          <span className="vc-console__prompt" aria-hidden="true">
            »
          </span>
          {uicopyfill("face.console.line.census", { rows: String(census.total), bytes: formatBytes(census.bytes) })}
        </p>
        <p className="vc-console__line">
          <span className="vc-console__prompt" aria-hidden="true">
            »
          </span>
          {uicopyfill("face.console.line.lanes", {
            lfsRows: String(census.lfsRows),
            lfsBytes: formatBytes(census.lfsBytes),
            blobRows: String(census.blobRows),
            blobBytes: formatBytes(census.blobBytes),
          })}
        </p>
        <p className="vc-console__line">
          <span className="vc-console__prompt" aria-hidden="true">
            »
          </span>
          {census.biggest
            ? uicopyfill("face.console.line.biggest", {
                path: census.biggest.path,
                bytes: formatBytes(census.biggest.size),
              })
            : null}
        </p>
        <p className="vc-console__line">
          <span className="vc-console__prompt" aria-hidden="true">
            »
          </span>
          {uicopyfill("face.console.line.sweep", {
            rows: String(plan.due.length),
            bytes: formatBytes(plan.bytes),
            tick: Number.isFinite(dueTick) ? String(dueTick) : uicopy("retention.tick.never"),
          })}
        </p>
        <p className="vc-console__line">
          <span className="vc-console__prompt" aria-hidden="true">
            »
          </span>
          {uicopyfill("face.console.line.contract", { threshold: THRESHOLD })}
        </p>
      </div>
      <div className="vc-tablescroll">
        <table className="vc-table vc-table--channels">
          <thead>
            <tr>
              <th scope="col">{uicopy("home.table.channel")}</th>
              <th scope="col">{uicopy("home.table.kind")}</th>
              <th scope="col">{uicopy("home.table.sealed")}</th>
              <th scope="col">{uicopy("home.table.status")}</th>
            </tr>
          </thead>
          <tbody>
            {channels().map((channel) => (
              <tr key={channel.name} className={channel.featured ? "is-featured" : undefined}>
                <td>
                  <span className="vc-cell__name">{channel.name}</span>
                  <span className="vc-cell__note">{channel.note}</span>
                </td>
                <td>
                  <span className="vc-kind">{channel.kind}</span>
                </td>
                <td className="vc-num">{channel.size}</td>
                <td>
                  <span className="vc-state">
                    <i aria-hidden="true" />
                    {channel.state}
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

export default Dbconsole;
