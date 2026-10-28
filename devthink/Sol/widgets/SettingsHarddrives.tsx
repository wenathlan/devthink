/**
 * harddrives.tsx — the Drives page of the Windows 11 settings shell: the
 * local drives card (the os treats databases as hard drives, so the rows
 * list the owner partitions of the store the way a desktop lists its
 * disks — the disk-shaped fluent glyph, the honest capacity meter of the
 * one allocation the browser answers, the record counts of the mounted
 * partition; a drive that is not mounted answers its open action, never
 * an invented figure) and the external storage card (the opt-in platforms
 * the operator may bring, each with its quiet monochrome mark, each not
 * connected until the operator pairs it — the drafts stay local ui
 * state, nothing is sent and nothing is faked; pairing lands with the
 * database wave). The page rides the same dtw kit the other categories
 * wear — the borderless card, the 44px ledger rows separated by breath,
 * the flat wells and the one accent meter — so the windows 11 grammar
 * holds across the whole settings face. Loose component of the settings
 * page.
 */

import { AddRegular, CloudRegular, HardDriveRegular } from "@fluentui/react-icons";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { copy } from "../../copy";
import { browserStoreSummary, DRIVES_KEY, drives, type HardDrive, newdrive, opendrive } from "../../storage.ts";

export { DRIVES_KEY };

/** fills the {slot} holes of one copy row — the template grammar the
 * callback face rides (an unknown slot stays loud, never silent). */
function fill(key: string, slots: Record<string, string>): string {
  return copy(key).replace(/\{(\w+)\}/g, (hole, name: string) => slots[name] ?? hole);
}

/** the byte answer of the storage manager: the one allocation the browser
 * reports for the origin store every local drive shares */
type Capacity = { usage: number; quota: number };

/** the ids of the external platforms of the opt-in wall */
type PlatformId = "gdrive" | "dropbox" | "onedrive" | "box" | "s3" | "host";

/** a pairing draft of one platform: the local ui state the card holds
 * until the database wave lands the real pairing — the key stays in
 * memory, never rendered and never sent */
type PairDraft = { label: string; endpoint: string; key: string };

/** one external platform of the opt-in wall: the id keys the drawn mark
 * and the copy row, the keyed flag answers whether the pairing form asks
 * for an endpoint and a key */
type Platform = { id: PlatformId; keyed: boolean };

/** the platforms of the opt-in wall, never pre-connected: every row starts
 * "not connected" and stays that way until the operator pairs it */
const PLATFORMS: readonly Platform[] = [
  { id: "gdrive", keyed: false },
  { id: "dropbox", keyed: false },
  { id: "onedrive", keyed: false },
  { id: "box", keyed: false },
  { id: "s3", keyed: true },
  { id: "host", keyed: true },
];

/** the windows-style byte formatter of the capacity lines: real numbers
 * the browser answers, never an invented figure */
function formatbytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const figure = unit === 0 || value >= 100 ? Math.round(value).toString() : value.toFixed(1);
  return `${figure} ${units[unit]}`;
}

/** the identity mark of one external platform, drawn inline as a quiet
 * monochrome stroke glyph at 22px: no external asset ever loads on this
 * surface and the card keeps its chrome-neutral ink */
function PlatformMark({ id }: { id: PlatformId }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={22}
      height={22}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="dtw-settings__drivemark"
    >
      {id === "gdrive" ? (
        <>
          {/* the triangle-ish triple plane of the google drive */}
          <path d="M12 3.6 3 19.4h18Z" />
          <path d="M7.1 12.3h9.8M7.1 12.3 12 19.4M16.9 12.3 12 19.4" />
        </>
      ) : id === "dropbox" ? (
        <>
          {/* the diamond of the dropbox */}
          <path d="M12 3.7 20.3 12 12 20.3 3.7 12Z" />
          <path d="M3.7 12h16.6" />
        </>
      ) : id === "onedrive" ? (
        <>
          {/* the cloud pair of the onedrive */}
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z" />
          <path
            d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"
            transform="translate(1.4 -1.6) scale(.5)"
            vectorEffect="non-scaling-stroke"
          />
        </>
      ) : id === "box" ? (
        <>
          {/* the cube of the box */}
          <path d="M12 2.9 20 7.4v9.2L12 21.1 4 16.6V7.4Z" />
          <path d="M4 7.4 12 11.9 20 7.4M12 11.9v9.2" />
        </>
      ) : id === "s3" ? (
        <>
          {/* the bucket of the s3-compatible store */}
          <ellipse cx="12" cy="6" rx="6.6" ry="2.5" />
          <path d="M5.4 6v11.4c0 1.4 3 2.5 6.6 2.5s6.6-1.1 6.6-2.5V6" />
        </>
      ) : (
        <>
          {/* the generic server of the file host */}
          <rect x="3.9" y="4.2" width="16.2" height="6.6" rx="1.5" />
          <rect x="3.9" y="13.2" width="16.2" height="6.6" rx="1.5" />
          <path d="M6.8 7.5h3.2M6.8 16.5h3.2" />
        </>
      )}
    </svg>
  );
}

/** The drives page: the windows-style drive ledger of this machine, the
 * new-drive action and the opt-in wall of the external platforms. */
export function HardDrives() {
  const [, navigate] = useLocation();
  const [active, setActive] = useState<HardDrive>();
  const [list, setList] = useState<HardDrive[]>([]);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof browserStoreSummary>>>();
  const [capacity, setCapacity] = useState<Capacity>();
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [pairing, setPairing] = useState<PlatformId>();
  const [pairlabel, setPairlabel] = useState("");
  const [pairendpoint, setPairendpoint] = useState("");
  const [pairkey, setPairkey] = useState("");
  const [drafts, setDrafts] = useState<Partial<Record<PlatformId, PairDraft>>>({});

  const refresh = useCallback(() => {
    void drives()
      .then((state) => {
        setActive(state.active);
        setList(state.list);
      })
      .catch(() => undefined);
    void browserStoreSummary(false)
      .then(setSummary)
      .catch(() => undefined);
    // the one honest byte answer of the machine: the storage manager
    // reports the allocation of the origin store every local drive shares
    if (typeof navigator !== "undefined" && navigator.storage) {
      void navigator.storage
        .estimate()
        .then((answer) => {
          if (typeof answer.usage === "number" && typeof answer.quota === "number" && answer.quota > 0) {
            setCapacity({ usage: answer.usage, quota: answer.quota });
          }
        })
        .catch(() => undefined);
    }
  }, []);

  useEffect(refresh, [refresh]);

  async function mount(driveId: string) {
    setBusy(true);
    try {
      await opendrive(driveId);
      // the store rehydrates from the mounted owner: a fresh boot reads it
      window.location.reload();
    } catch {
      toast.error(copy("settings.drives.mount.fail"));
      setBusy(false);
    }
  }

  async function create() {
    setBusy(true);
    try {
      const drive = await newdrive(label);
      setLabel("");
      setActive(drive);
      const state = await drives();
      setList(state.list);
      toast(fill("settings.drives.new.done", { label: drive.label }));
      navigate("/panel");
      window.location.reload();
    } catch {
      toast.error(copy("settings.drives.new.fail"));
    } finally {
      setBusy(false);
    }
  }

  /** opens the pairing form of one platform, prefilled from its draft */
  function openpairing(platform: Platform) {
    const draft = drafts[platform.id];
    setPairlabel(draft?.label ?? "");
    setPairendpoint(draft?.endpoint ?? "");
    setPairkey(draft?.key ?? "");
    setPairing(platform.id);
  }

  /** files the pairing as a draft of this card: the drive registry knows
   * local partitions only, so the real pairing lands with the database
   * wave and no connected state is ever faked */
  function pair(platform: Platform) {
    setDrafts((current) => ({
      ...current,
      [platform.id]: {
        label: pairlabel.trim() || copy(`settings.drives.platform.${platform.id}`),
        endpoint: pairendpoint.trim(),
        key: pairkey,
      },
    }));
    setPairing(undefined);
    setPairlabel("");
    setPairendpoint("");
    setPairkey("");
  }

  /** clears the pairing draft of one platform */
  function unpair(id: PlatformId) {
    setDrafts((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  // the ledger folds the mounted drive back in (the first read of the
  // registry can return the list before the lazy registration lands) and
  // mounts it first, the way the file manager of a desktop lists the
  // system disk
  const shelf = active ? [active, ...list.filter((drive) => drive.id !== active.id)] : list;
  const share = capacity ? Math.min(100, Math.max(0, (capacity.usage / capacity.quota) * 100)) : 0;
  const pairingplatform = PLATFORMS.find((platform) => platform.id === pairing);

  return (
    <>
      <section className="dtw-card" aria-label={copy("settings.drives.local")}>
        <h2 className="dtw-cardtitle">
          <HardDriveRegular fontSize={15} aria-hidden="true" />
          {copy("settings.drives.local")}
        </h2>
        <p className="dtw-settings__carddesc">{copy("settings.drives.local.desc")}</p>

        {shelf.length === 0 ? (
          <p className="dtw-settings__base">{copy("settings.drives.pending")}</p>
        ) : (
          <ul className="dtw-rows" aria-label={copy("settings.drives.local.aria")}>
            {shelf.map((drive) => {
              const mounted = drive.id === active?.id;
              return (
                <li key={drive.id} className="dtw-row">
                  <span
                    className="dtw-settings__driveicon"
                    data-mounted={mounted ? "true" : undefined}
                    aria-hidden="true"
                  >
                    <HardDriveRegular fontSize={18} />
                  </span>
                  <span className="dtw-settings__drivemeta">
                    <strong>{drive.label}</strong>
                    <small>
                      {copy(mounted ? "settings.drives.mounted" : "settings.drives.unmounted")} · {drive.id} ·{" "}
                      {fill("settings.drives.created", { date: drive.createdAt.slice(0, 10) })}
                    </small>
                  </span>
                  {mounted ? null : (
                    <button
                      type="button"
                      className="dtw-btn"
                      disabled={busy}
                      onClick={() => void mount(drive.id)}
                      aria-label={fill("settings.drives.open.aria", { label: drive.label })}
                    >
                      {copy("settings.drives.open")}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {capacity ? (
          <div className="dtw-settings__meterzone">
            <div
              className="dtw-settings__meter"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(share)}
              aria-label={copy("settings.drives.meter.aria")}
            >
              <div className="dtw-settings__meterfill" style={{ width: `${share}%` }} />
            </div>
            <p className="dtw-settings__base">
              {fill("settings.drives.capacity", {
                usage: formatbytes(capacity.usage),
                quota: formatbytes(capacity.quota),
              })}
            </p>
            {summary?.available ? (
              <p className="dtw-settings__base">
                {fill("settings.drives.records", {
                  workspaces: String(summary.workspaces),
                  sessions: String(summary.sessions),
                  messages: String(summary.messages),
                })}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="dtw-settings__base">{copy("settings.drives.capacity.none")}</p>
        )}

        <form
          className="dtw-settings__newdrive"
          onSubmit={(event) => {
            event.preventDefault();
            void create();
          }}
        >
          <input
            className="dtw-settings__input"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder={copy("settings.drives.new.ph")}
            maxLength={24}
            aria-label={copy("settings.drives.new.aria")}
          />
          <button type="submit" className="dtw-btn dtw-btn--primary" disabled={busy}>
            <AddRegular fontSize={14} aria-hidden="true" />
            {copy("settings.drives.new")}
          </button>
        </form>
        <p className="dtw-settings__carddesc">{copy("settings.drives.new.note")}</p>
      </section>

      <section className="dtw-card" aria-label={copy("settings.drives.external")}>
        <h2 className="dtw-cardtitle">
          <CloudRegular fontSize={15} aria-hidden="true" />
          {copy("settings.drives.external")}
        </h2>
        <p className="dtw-settings__carddesc">{copy("settings.drives.external.desc")}</p>

        <ul className="dtw-rows" aria-label={copy("settings.drives.external.aria")}>
          {PLATFORMS.map((platform) => {
            const draft = drafts[platform.id];
            const name = copy(`settings.drives.platform.${platform.id}`);
            return (
              <li key={platform.id} className="dtw-row">
                <PlatformMark id={platform.id} />
                <span className="dtw-settings__drivemeta">
                  <strong>{name}</strong>
                  <small>
                    {draft
                      ? `${draft.label}${draft.endpoint ? ` · ${draft.endpoint}` : ""} · ${copy("settings.drives.status.off")}`
                      : copy("settings.drives.status.off")}
                  </small>
                </span>
                <span className="dtw-settings__actions">
                  {draft ? (
                    <button
                      type="button"
                      className="dtw-btn"
                      onClick={() => unpair(platform.id)}
                      aria-label={fill("settings.drives.remove.aria", { name })}
                    >
                      {copy("settings.drives.remove")}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="dtw-btn"
                    aria-expanded={pairing === platform.id ? "true" : "false"}
                    aria-controls={pairing === platform.id ? "dt-pair-form" : undefined}
                    aria-label={fill("settings.drives.connect.aria", { name })}
                    onClick={() => {
                      if (pairing === platform.id) {
                        setPairing(undefined);
                      } else {
                        openpairing(platform);
                      }
                    }}
                  >
                    {copy("settings.drives.connect")}
                  </button>
                </span>
              </li>
            );
          })}
        </ul>

        {pairingplatform ? (
          <form
            id="dt-pair-form"
            className="dtw-settings__pairform"
            onSubmit={(event) => {
              event.preventDefault();
              pair(pairingplatform);
            }}
          >
            <label className="dtw-settings__pairfield">
              <span>{copy("settings.drives.pair.label")}</span>
              <input
                className="dtw-settings__input"
                value={pairlabel}
                maxLength={24}
                onChange={(event) => setPairlabel(event.target.value)}
                placeholder={fill("settings.drives.pair.label.ph", {
                  name: copy(`settings.drives.platform.${pairingplatform.id}`),
                })}
              />
            </label>
            {pairingplatform.keyed ? (
              <>
                <label className="dtw-settings__pairfield">
                  <span>{copy("settings.drives.pair.endpoint")}</span>
                  <input
                    className="dtw-settings__input"
                    type="url"
                    required
                    value={pairendpoint}
                    onChange={(event) => setPairendpoint(event.target.value)}
                    placeholder={copy(
                      pairingplatform.id === "s3"
                        ? "settings.drives.pair.endpoint.ph.s3"
                        : "settings.drives.pair.endpoint.ph.host",
                    )}
                  />
                </label>
                <label className="dtw-settings__pairfield">
                  <span>{copy("settings.drives.pair.key")}</span>
                  <input
                    className="dtw-settings__input"
                    type="password"
                    required
                    autoComplete="off"
                    spellCheck={false}
                    value={pairkey}
                    onChange={(event) => setPairkey(event.target.value)}
                    placeholder={copy("settings.drives.pair.key.ph")}
                  />
                </label>
              </>
            ) : null}
            <span className="dtw-settings__actions">
              <button type="submit" className="dtw-btn dtw-btn--primary">
                {copy("settings.drives.pair")}
              </button>
              <button type="button" className="dtw-btn" onClick={() => setPairing(undefined)}>
                {copy("settings.drives.cancel")}
              </button>
            </span>
            <p className="dtw-settings__carddesc">{copy("settings.drives.pair.note")}</p>
          </form>
        ) : null}
      </section>
    </>
  );
}
