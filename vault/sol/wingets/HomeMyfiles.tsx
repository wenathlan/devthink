/**
 * Myfiles.tsx — the my files surface of the product face: the person's
 * own drive, live only. The quota readout renders the verdict the engine
 * answered (usage, the owner-set limit, what remains, the state and the
 * census — the hd unlock readout: the row on the database, never a
 * locked cap), the unlock form writes the limit at the owner's word
 * (megabytes at any scale or unlimited — the configurable floor only
 * seeds the row at creation), and the file table lists the pinned
 * project's own objects with their verified digests. Every number rides
 * the live lanes (useVaultQuota, useVaultUsage, useVaultObjects) and the
 * storage pillars line renders the catalog the /api/v1/pillars door
 * answered — zero fixed data in this file: the copy rides the ui store,
 * the data rides the internal api, and the away lane says so honestly
 * (my files never renders a rehearsal of the person's bytes).
 */

import { type FormEvent, useState } from "react";
import { digestShort, formatBytes } from "../../objectface.ts";
import { uicopy, uicopyfill } from "../../uistore.ts";
import {
  useVaultObjects,
  useVaultPillars,
  useVaultQuota,
  useVaultUsage,
  vaultclient,
  vaultproject,
} from "../../vaultclient.ts";
import { Skeleton } from "./HomeSkeleton.tsx";
import { toast } from "./HomeToaster.tsx";

/** the megabytes floor the unlock form accepts (whole megabytes, one or
 * more — the parse refuses anything else before the lane ever rides). */
const MB_FLOOR = 1;

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
  /** the reload token: a fresh unlock re-reads the quota verdict and the
   * ledger the same mount (the deposit lane of the browse rides the same
   * law on its own surface). */
  const [reload, setReload] = useState(0);
  const { live: quota } = useVaultQuota(reload);
  const { live: usage } = useVaultUsage();
  const { live: objects, lane: objectLane } = useVaultObjects(reload);
  const { live: pillars } = useVaultPillars();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const project = vaultproject();
  const live = project !== "" && quota !== null;
  const rows = objects ?? [];
  const bytes = rows.reduce((total, row) => total + Number(row.size), 0);

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
      toast(uicopy("face.myfiles.unlock.refusedTitle"), uicopyfill("face.myfiles.unlock.refused", { message: answer.message }), "err");
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
      toast(uicopy("face.myfiles.unlock.refusedTitle"), uicopyfill("face.myfiles.unlock.refused", { message: answer.message }), "err");
    }
  }

  return (
    <section className="vc-console vc-myfiles" aria-label={uicopy("face.myfiles.aria")}>
      <header className="vc-panel__head">
        <h3 className="vc-panel__title">{uicopy("face.myfiles.head")}</h3>
        <p className="vc-panel__count">
          {uicopyfill("face.myfiles.count", { count: String(rows.length), bytes: formatBytes(bytes) })}
        </p>
      </header>
      {live && quota !== null ? (
        <>
          <div className="vc-console__pane" aria-label={uicopy("face.myfiles.quota.head")}>
            <p className="vc-console__caption">{uicopy("face.myfiles.quota.head")}</p>
            <p className="vc-console__line">
              <span className="vc-console__prompt">drive</span>
              {uicopyfill("face.myfiles.quota.usage", {
                usage: formatBytes(Number(quota.usage)),
                objects: String(quota.objects),
              })}
            </p>
            <p className="vc-console__line">
              <span className="vc-console__prompt">hd</span>
              {uicopyfill("face.myfiles.quota.limit", {
                limit:
                  quota.limitBytes === null ? uicopy("face.myfiles.unlimited") : formatBytes(Number(quota.limitBytes)),
              })}
            </p>
            <p className="vc-console__line">
              <span className="vc-console__prompt">left</span>
              {uicopyfill("face.myfiles.quota.remaining", {
                remaining:
                  quota.remaining === null
                    ? uicopy("face.myfiles.unlimited")
                    : formatBytes(Number(quota.remaining)),
              })}
            </p>
            <p className="vc-console__line vc-console__line--live">
              <span className="vc-console__prompt">state</span>
              {uicopyfill("face.myfiles.quota.state", { state: quota.state })}
            </p>
            {usage ? (
              <p className="vc-console__line">
                <span className="vc-console__prompt">census</span>
                {uicopyfill("face.myfiles.quota.census", {
                  chunks: String(usage.chunks),
                  bytes: formatBytes(Number(usage.bytes)),
                })}
              </p>
            ) : null}
          </div>
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
          <p className="vc-panel__count">
            {uicopy("face.myfiles.unlock.head")} — {uicopy("face.myfiles.unlock.lede")}
          </p>
          {objectLane === "live" ? (
            rows.length === 0 ? (
              <div className="vc-empty" role="status">
                <p className="vc-empty__title">{uicopy("face.myfiles.empty")}</p>
                <p className="vc-empty__line">{uicopy("face.myfiles.emptyHint")}</p>
              </div>
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
          {pillars !== null ? (
            <p className="vc-panel__count">
              {uicopyfill("face.myfiles.pillars.label", {
                pillars: pillars.map((pillar) => pillar.key).join(" · "),
              })}
            </p>
          ) : null}
        </>
      ) : (
        <div className="vc-empty" role="status">
          <p className="vc-empty__title">{uicopy("face.myfiles.away")}</p>
        </div>
      )}
    </section>
  );
}

export default Myfiles;
