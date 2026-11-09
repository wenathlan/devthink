/**
 * Myfiles.tsx — the my files surface of the product face, rebuilt to the
 * family design standard: the person's own drive, live only. The drive
 * zone answers the quota verdict the engine wrote — the capacity meter
 * (the real usage against the owner-set limit, the honest unlimited line
 * when no cap rides the row), the four stat cells (usage, limit,
 * remaining, state — every label from the ui store, every number the
 * engine answered) and the chunk census. The unlock form writes the limit
 * at the owner's word (megabytes at any scale or unlimited — the
 * configurable floor only seeds the row at creation), and the file table
 * lists the pinned project's own objects with their verified digests.
 * Every number rides the live lanes (useVaultQuota, useVaultUsage,
 * useVaultObjects) and the glyphs ride the fluent set — zero fixed data
 * and zero literals in this file: the copy rides the ui store, the data
 * rides the internal api doors (quota, usage, objects), and the away lane
 * says so honestly (my files never renders a rehearsal of the person's
 * bytes). Loading answers the shimmer skeleton, absence answers the
 * shared empty state, and a refusal answers the toast — the sonner voice
 * of the product face.
 */

import {
  ArrowClockwiseRegular,
  BoxMultipleRegular,
  CheckmarkCircleRegular,
  DataUsageRegular,
  DismissCircleRegular,
  FolderOpenRegular,
  HardDriveRegular,
  LockClosedRegular,
  LockOpenRegular,
} from "@fluentui/react-icons";
import { type FormEvent, useState } from "react";
import { digestShort, formatBytes } from "../../objectface.ts";
import { uicopy, uicopyfill } from "../../uistore.ts";
import { useVaultObjects, useVaultQuota, useVaultUsage, vaultclient, vaultproject } from "../../vaultclient.ts";
import { Skeleton } from "./HomeSkeleton.tsx";
import { toast } from "./HomeToaster.tsx";
import { EmptyState } from "./ShellEmptystate.tsx";

/** the megabytes floor the unlock form accepts (whole megabytes, one or
 * more — the parse refuses anything else before the lane ever rides). */
const MB_FLOOR = 1;

/** the percent of the drive where the meter fill tints critical (the
 * honest flag, never a fake full). */
const METER_CRITICAL_PCT = 90;

/**
 * Parses the megabytes draft into the byte limit the engine writes —
 * whole megabytes only (the same whole-number law the quota floor rides).
 *
 * @param text the raw input text.
 * @returns the limit in bytes (bigint), or undefined when the draft is
 *   not whole megabytes.
 */
function megabytesToBytes(text: string): bigint | undefined {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return undefined;
  const megabytes = Number(trimmed);
  if (!Number.isSafeInteger(megabytes) || megabytes < MB_FLOOR) return undefined;
  return BigInt(megabytes) * 1024n * 1024n;
}

/**
 * The my files surface of the vault — the person's drive.
 *
 * @returns the my files element.
 */
export function Myfiles() {
  /** the reload token: a fresh unlock (or a reread press) re-reads the
   * quota verdict and the ledger the same mount. */
  const [reload, setReload] = useState(0);
  const { live: quota } = useVaultQuota(reload);
  const { live: usage } = useVaultUsage();
  const { live: objects, lane: objectLane } = useVaultObjects(reload);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const project = vaultproject();
  // the honest states: the drive is live once the quota verdict landed;
  // booted means the engine answered at least one lane (the verdict is
  // still opening — the skeleton answers, never an invented figure);
  // otherwise the away lane owns the surface.
  const live = project !== "" && quota !== null;
  const booted = live || objectLane === "live";
  const rows = objects ?? [];
  const bytes = rows.reduce((total, row) => total + Number(row.size), 0);

  /** the capacity percent the meter rides (clamped — the fill never
   * overshoots the track, the label says the honest number). */
  const pct =
    quota !== null && quota.limitBytes !== null && quota.limitBytes > 0n
      ? Math.min(100, Math.round((Number(quota.usage) * 100) / Number(quota.limitBytes)))
      : 0;

  /** writes the drafted limit (or unlimited) through the real quota door —
   * the engine answers the row it wrote and the readout re-reads; the
   * refusal answers the toast honestly. */
  async function unlock(event: FormEvent) {
    event.preventDefault();
    if (project === "") return;
    const limitBytes = megabytesToBytes(draft);
    if (limitBytes === undefined) {
      toast(uicopy("face.myfiles.unlock.refusedTitle"), uicopy("face.myfiles.unlock.invalid"), "err");
      return;
    }
    setBusy(true);
    const client = vaultclient();
    const answer = await client.setQuota(project, limitBytes);
    setBusy(false);
    if (answer.ok) {
      toast(
        uicopy("face.myfiles.unlock.setTitle"),
        uicopyfill("face.myfiles.unlock.set", {
          limit: answer.limitBytes === null ? uicopy("face.myfiles.unlimited") : formatBytes(Number(answer.limitBytes)),
        }),
        "ok",
      );
      setDraft("");
      setReload((token) => token + 1);
    } else {
      toast(
        uicopy("face.myfiles.unlock.refusedTitle"),
        uicopyfill("face.myfiles.unlock.refused", { message: answer.message }),
        "err",
      );
    }
  }

  /** drops the cap entirely — the unlimited row the owner's word writes. */
  async function unlockUnlimited() {
    if (project === "") return;
    setBusy(true);
    const client = vaultclient();
    const answer = await client.setQuota(project, null);
    setBusy(false);
    if (answer.ok) {
      toast(uicopy("face.myfiles.unlock.setTitle"), uicopy("face.myfiles.unlock.setUnlimited"), "ok");
      setReload((token) => token + 1);
    } else {
      toast(
        uicopy("face.myfiles.unlock.refusedTitle"),
        uicopyfill("face.myfiles.unlock.refused", { message: answer.message }),
        "err",
      );
    }
  }

  /** the drive zone: the capacity meter (or the honest unlimited line),
   * the stat cells and the census — live only. */
  function drive() {
    if (quota === null) return <Skeleton rows={3} />;
    const limited = quota.limitBytes !== null;
    return (
      <>
        {limited ? (
          <div className="vc-meter">
            {/* biome-ignore lint/a11y/useSemanticElements: the meter rides the family track/fill grammar — the native meter element cannot style its track and fill across the engines */}
            <div
              className="vc-meter__track"
              role="meter"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-label={uicopy("face.myfiles.meterAria")}
            >
              <span
                className="vc-meter__fill"
                style={{ width: `${pct}%` }}
                data-critical={pct >= METER_CRITICAL_PCT ? "true" : undefined}
              />
            </div>
            <p className="vc-meter__label">
              {uicopyfill("face.myfiles.meter.label", {
                usage: formatBytes(Number(quota.usage)),
                limit: formatBytes(Number(quota.limitBytes)),
                pct: String(pct),
              })}
            </p>
          </div>
        ) : (
          <p className="vc-myfiles__unlimited">
            <LockOpenRegular fontSize={13} aria-hidden="true" />
            {uicopy("face.myfiles.meter.unlimited")}
          </p>
        )}
        <div className="vc-stats">
          <div className="vc-stat">
            <p className="vc-stat__label">
              <HardDriveRegular fontSize={13} aria-hidden="true" />
              {uicopy("face.myfiles.quota.usageLabel")}
            </p>
            <p className="vc-stat__value">{formatBytes(Number(quota.usage))}</p>
          </div>
          <div className="vc-stat">
            <p className="vc-stat__label">
              {limited ? (
                <LockClosedRegular fontSize={13} aria-hidden="true" />
              ) : (
                <LockOpenRegular fontSize={13} aria-hidden="true" />
              )}
              {uicopy("face.myfiles.quota.limitLabel")}
            </p>
            <p className="vc-stat__value">
              {limited ? formatBytes(Number(quota.limitBytes)) : uicopy("face.myfiles.unlimited")}
            </p>
          </div>
          <div className="vc-stat">
            <p className="vc-stat__label">
              <DataUsageRegular fontSize={13} aria-hidden="true" />
              {uicopy("face.myfiles.quota.remainingLabel")}
            </p>
            <p className="vc-stat__value">
              {quota.remaining === null ? uicopy("face.myfiles.unlimited") : formatBytes(Number(quota.remaining))}
            </p>
          </div>
          <div className="vc-stat" data-state={quota.state}>
            <p className="vc-stat__label">
              {quota.state === "ok" ? (
                <CheckmarkCircleRegular fontSize={13} aria-hidden="true" />
              ) : (
                <DismissCircleRegular fontSize={13} aria-hidden="true" />
              )}
              {uicopy("face.myfiles.quota.stateLabel")}
            </p>
            <p className="vc-stat__value">{uicopyfill("face.myfiles.quota.stateValue", { state: quota.state })}</p>
          </div>
        </div>
        {usage ? (
          <p className="vc-myfiles__census">
            {uicopyfill("face.myfiles.quota.census", {
              chunks: String(usage.chunks),
              bytes: formatBytes(Number(usage.bytes)),
            })}
          </p>
        ) : null}
      </>
    );
  }

  return (
    <section className="vc-myfiles" aria-label={uicopy("face.myfiles.aria")}>
      <header className="vc-panel__head">
        <span className="vc-panel__glyph" aria-hidden="true">
          <FolderOpenRegular fontSize={15} />
        </span>
        <h3 className="vc-panel__title">{uicopy("face.myfiles.head")}</h3>
        <p className="vc-panel__count">
          {uicopyfill("face.myfiles.count", { count: String(rows.length), bytes: formatBytes(bytes) })}
        </p>
        <button
          type="button"
          className="vc-myfiles__refresh"
          aria-label={uicopy("face.myfiles.refresh.aria")}
          disabled={busy || project === ""}
          onClick={() => setReload((token) => token + 1)}
        >
          <ArrowClockwiseRegular fontSize={13} aria-hidden="true" />
          {uicopy("face.myfiles.refresh")}
        </button>
      </header>
      {booted ? (
        <>
          {live ? drive() : null}
          <form className="vc-browse__tools" onSubmit={unlock} aria-label={uicopy("face.myfiles.unlock.aria")}>
            <input
              className="vc-search"
              type="text"
              inputMode="numeric"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={uicopy("face.myfiles.unlock.mbPlaceholder")}
              aria-label={uicopy("face.myfiles.unlock.mbAria")}
              spellCheck={false}
              autoComplete="off"
            />
            <button type="submit" className="btn secondary" disabled={busy}>
              {busy ? uicopy("face.myfiles.unlock.busy") : uicopy("face.myfiles.unlock.cta")}
            </button>
            <button type="button" className="btn secondary" onClick={unlockUnlimited} disabled={busy}>
              {uicopy("face.myfiles.unlock.unlimited")}
            </button>
          </form>
          <p className="vc-myfiles__unlocknote">
            <LockOpenRegular fontSize={12} aria-hidden="true" />
            {uicopy("face.myfiles.unlock.head")} — {uicopy("face.myfiles.unlock.lede")}
          </p>
          {objectLane === "live" ? (
            rows.length === 0 ? (
              <EmptyState
                icon={BoxMultipleRegular}
                title={uicopy("face.myfiles.empty")}
                line={uicopy("face.myfiles.emptyHint")}
              />
            ) : (
              <div className="vc-tablescroll">
                <table className="vc-table">
                  <caption className="vc-table__caption">{uicopy("face.myfiles.caption")}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{uicopy("face.myfiles.col.path")}</th>
                      <th scope="col">{uicopy("face.myfiles.col.channel")}</th>
                      <th scope="col">{uicopy("face.myfiles.col.size")}</th>
                      <th scope="col">{uicopy("face.myfiles.col.digest")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((object) => (
                      <tr key={object.id}>
                        <td>
                          <span className="vc-cell__path">{object.path}</span>
                        </td>
                        <td>
                          <span className="vc-channel" data-channel={object.channel}>
                            <i aria-hidden="true" />
                            {object.channel}
                          </span>
                        </td>
                        <td className="vc-num">{formatBytes(Number(object.size))}</td>
                        <td>
                          <span className="vc-digest" data-tip={object.digest} title={object.digest}>
                            {digestShort(object.digest)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <Skeleton rows={4} />
          )}
        </>
      ) : (
        <EmptyState
          icon={FolderOpenRegular}
          title={uicopy("face.myfiles.awayTitle")}
          line={uicopy("face.myfiles.away")}
        />
      )}
    </section>
  );
}

export default Myfiles;
