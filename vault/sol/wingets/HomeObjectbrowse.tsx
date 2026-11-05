/**
 * Objectbrowse.tsx — the object browser of the product face: the dense
 * browse table the storage products answer with — bucket filter chips, a
 * path filter, and hairline rows of the ledger (path in mono, channel dot
 * plus kind, tabular size, digest under the tip, the seal state pill).
 * The ledger rides the REAL client lane first: when the configured engine
 * answers, the rows are the live objects the engine returned (their real
 * sha-256 digests and bucket dimension), and the deposit widget seals new
 * bytes into the same ledger; when the lane is away the declared rehearsal
 * answers (seedVault — objects.ts, the storage contract of storage.ts
 * deciding the channel) and the surface says so honestly — never a live
 * claim on rehearsal bytes. The boot shows the shimmer skeleton while the
 * ledger lands (the doctrine loading face) and the honest empty state
 * answers an empty filter. Nothing invented, whichever lane answers says
 * so.
 */

import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  digestShort,
  formatBytes,
  seedVault,
  VAULT_BUCKETS,
  type VaultObject,
  verifyObject,
} from "../../objectface.ts";
import { uicopy, uicopyfill } from "../../uistore.ts";
import { useVaultObjects, vaultclient, vaultproject } from "../../vaultclient.ts";
import { FACE_SEED } from "./HomePlanstable.tsx";
import { Skeleton } from "./HomeSkeleton.tsx";
import { toast } from "./HomeToaster.tsx";

/** the boot window the ledger skeleton rides (one settle, honest — the
 * readout says the ledger is opening, never that bytes are moving). */
const BOOT_MS = 480;

/** one row of the browse table: the rehearsal shape widened with the lane
 * the row answered from — a live row carries the engine's real sha-256
 * digest (verified on every engine read), a rehearsal row carries the
 * deterministic seed digest the verify discipline re-derives. */
interface BrowseRow {
  id: string;
  bucket: string;
  path: string;
  mime: string;
  size: number;
  lfs: boolean;
  digest: string;
  /** true when the engine answered this row (the real ledger), false when
   * the declared rehearsal seeded it */
  live: boolean;
}

/** widens one rehearsal object into a browse row (the rehearsal lane). */
function rehearsalRow(object: VaultObject): BrowseRow {
  return {
    id: object.id,
    bucket: object.bucket,
    path: object.path,
    mime: object.mime,
    size: object.size,
    lfs: object.lfs,
    digest: object.digest,
    live: false,
  };
}

/**
 * The object browser of the vault.
 *
 * @returns the browse element.
 */
export function Objectbrowse() {
  /** the live object lane: the real client reads the engine's own list
   * door once per mount (and once per deposit — the reload token bumps);
   * the away lane keeps the declared rehearsal, loudly. */
  const [reload, setReload] = useState(0);
  const { live, lane } = useVaultObjects(reload);
  const rehearsal = useMemo(() => seedVault(FACE_SEED).map(rehearsalRow), []);
  const [bucket, setBucket] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [booting, setBooting] = useState(true);
  const [draft, setDraft] = useState({ path: "", mime: "text/plain", body: "" });
  const [busy, setBusy] = useState(false);

  /* the boot settle: the skeleton rides once, then the ledger answers */
  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), BOOT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const rows = live !== null && lane === "live" ? live.map(liveRow) : rehearsal;

  const visible = useMemo(() => {
    const byBucket = bucket === "all" ? rows : rows.filter((row) => row.bucket === bucket);
    const needle = query.trim().toLowerCase();
    const byPath = needle ? byBucket.filter((row) => row.path.toLowerCase().includes(needle)) : byBucket;
    return byPath;
  }, [bucket, rows, query]);

  const bytes = useMemo(() => visible.reduce((total, row) => total + row.size, 0), [visible]);

  /** seals the draft through the real deposit door — the engine answers
   * the sealed row (its real sha-256 and bucket) and the list lane walks
   * again; the away lane keeps the widget honest (no deposit, no lie). */
  async function deposit(event: FormEvent) {
    event.preventDefault();
    const project = vaultproject();
    if (project === "") return;
    const bytesOfDraft = new TextEncoder().encode(draft.body);
    setBusy(true);
    const client = vaultclient();
    const answer = await client.deposit({
      project,
      path: draft.path,
      mime: draft.mime,
      bytes: bytesOfDraft,
      bucket: bucket === "all" ? VAULT_BUCKETS[0] : bucket,
    });
    setBusy(false);
    if (answer.ok) {
      toast(
        uicopy("face.toast.sealedTitle"),
        uicopyfill("face.toast.sealedBody", {
          path: answer.object.path,
          channel: answer.object.channel,
          digest: answer.object.digest.slice(0, 8),
        }),
        "ok",
      );
      setDraft({ path: "", mime: draft.mime, body: "" });
      setReload((token) => token + 1);
    } else {
      toast(uicopy("face.toast.refusedTitle"), answer.message, "err");
    }
  }

  return (
    <section className="vc-browse" aria-label={uicopy("face.browse.aria")} aria-busy={booting ? "true" : undefined}>
      <header className="vc-panel__head">
        <h3 className="vc-panel__title">{uicopy("face.browse.head")}</h3>
        <p className="vc-panel__count">
          {uicopyfill("face.browse.count", { count: String(visible.length), bytes: formatBytes(bytes) })}
        </p>
      </header>
      {/* the honest lane declaration: whichever ledger answers says so —
       * the live line names the engine, the away line names the rehearsal. */}
      <p className="vc-panel__count">
        {lane === "live" && live !== null
          ? uicopyfill("face.browse.live", {
              count: String(live.length),
              bytes: formatBytes(live.reduce((total, row) => total + Number(row.size), 0)),
            })
          : uicopy("face.browse.rehearsal")}
      </p>
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
      {lane === "live" ? (
        <form className="vc-browse__tools" onSubmit={deposit} aria-label={uicopy("face.browse.deposit.aria")}>
          <input
            className="vc-search"
            type="text"
            value={draft.path}
            onChange={(event) => setDraft({ ...draft, path: event.target.value })}
            placeholder={uicopy("face.browse.deposit.pathPlaceholder")}
            aria-label={uicopy("face.browse.deposit.pathAria")}
            spellCheck={false}
            autoComplete="off"
          />
          <input
            className="vc-search"
            type="text"
            value={draft.mime}
            onChange={(event) => setDraft({ ...draft, mime: event.target.value })}
            placeholder={uicopy("face.browse.deposit.mimePlaceholder")}
            aria-label={uicopy("face.browse.deposit.mimeAria")}
            spellCheck={false}
            autoComplete="off"
          />
          <input
            className="vc-search"
            type="text"
            value={draft.body}
            onChange={(event) => setDraft({ ...draft, body: event.target.value })}
            placeholder={uicopy("face.browse.deposit.bodyPlaceholder")}
            aria-label={uicopy("face.browse.deposit.bodyAria")}
            spellCheck={false}
            autoComplete="off"
          />
          <button type="submit" className="btn secondary" disabled={busy}>
            {busy ? uicopy("face.browse.deposit.busy") : uicopy("face.browse.deposit.cta")}
          </button>
        </form>
      ) : (
        <p className="vc-panel__count">{uicopy("face.browse.deposit.away")}</p>
      )}
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
              {visible.map((object) => (
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
                    <span className="vc-seal" data-intact={object.live ? "true" : "false"}>
                      {object.live
                        ? uicopy("face.browse.seal.live")
                        : verifyObject(rehearsalObjectOf(object))
                          ? uicopy("objects.seal.intact")
                          : uicopy("objects.seal.broken")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** widens one live engine row into a browse row (the real ledger lane). */
function liveRow(row: {
  id: string;
  bucket: string;
  path: string;
  mime: string;
  size: bigint;
  digest: string;
  channel: string;
}): BrowseRow {
  return {
    id: row.id,
    bucket: row.bucket,
    path: row.path,
    mime: row.mime,
    size: Number(row.size),
    lfs: row.channel === "lfs",
    digest: row.digest,
    live: true,
  };
}

/** rebuilds the rehearsal shape one browse row answered from — the verify
 * discipline re-derives the seed digest, so only rehearsal rows ride it. */
function rehearsalObjectOf(row: BrowseRow): VaultObject {
  return {
    id: row.id,
    bucket: row.bucket,
    path: row.path,
    mime: row.mime,
    size: row.size,
    lfs: row.lfs,
    digest: row.digest,
    sealedAt: 0,
  };
}

export default Objectbrowse;
