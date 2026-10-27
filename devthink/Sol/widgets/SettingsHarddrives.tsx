/**
 * harddrives.tsx — the drives panel of the settings app, beside the anchor:
 * the windows-style drive manager of the os. the os treats databases as
 * hard drives, so the shelf above lists the local drives (the owner
 * partitions of the store) the way the file manager of a desktop lists its
 * disks: the disk glyph, the capacity bar with the bytes the browser
 * honestly answers, the record counts of the mounted partition. a drive
 * that is not mounted answers "capacity after mount" — never an invented
 * figure. the wall below is the opt-in external storage: the platforms the
 * operator may bring (the google drive, the dropbox, the onedrive, the
 * box, an s3-compatible bucket or any file host by url), each with its
 * quiet monochrome mark, each "not connected" until the operator pairs it.
 * pairing lands with the database wave: the drafts stay local ui state,
 * nothing is sent and nothing is faked.
 */

import { AddRegular, DeleteRegular, HardDriveRegular } from "@fluentui/react-icons";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { DRIVES_KEY, browserStoreSummary, drives, type HardDrive, newdrive, opendrive } from "../../storage.ts";

export { DRIVES_KEY };

/** the soft layers under the hairline ring of the trylle cards */
const STRIP_SHADOW = "0 1px 2px rgb(0 0 0 / 26%), 0 3px 12px rgb(0 0 0 / 12%)";

/** the quiet button of the panel (open, connect, cancel): the s1 fill over
 * the s0 card, the strong hairline ring and the 44px touch target */
const BUTTON_QUIET =
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-s1 px-4 text-sm font-medium text-ink ring-1 ring-hairline-strong transition-colors duration-150 ease-micro hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50";

/** the strong button of the panel (new hd, pair drive): the windows accent
 * of the chrome with the micro press of the landing */
const BUTTON_PRIMARY =
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-win px-5 text-sm font-semibold text-(--win-accent-ink) transition-[filter,transform] duration-150 ease-micro hover:brightness-95 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50";

/** the field of the panel forms: the s2 fill, the hairline ring and the
 * two-pixel focus ring of the theme */
const FIELD =
  "min-h-11 w-full min-w-0 rounded-lg bg-s2 px-3.5 text-sm text-ink ring-1 ring-hairline transition-colors duration-150 ease-micro placeholder:text-ink-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none";

/** the byte answer of the storage manager: the one allocation the browser
 * reports for the origin store every local drive shares */
type Capacity = { usage: number; quota: number };

/** the ids of the external platforms of the opt-in wall */
type PlatformId = "gdrive" | "dropbox" | "onedrive" | "box" | "s3" | "host";

/** a pairing draft of one platform: the local ui state the panel holds
 * until the database wave lands the real pairing — the key stays in
 * memory, never rendered and never sent */
type PairDraft = { label: string; endpoint: string; key: string };

/** one external platform of the opt-in wall: the name, the honest blurb
 * and whether the pairing form asks for an endpoint and a key */
type Platform = { id: PlatformId; name: string; blurb: string; keyed: boolean };

/** the platforms of the opt-in wall, never pre-connected: every row starts
 * "not connected" and stays that way until the operator pairs it */
const PLATFORMS: readonly Platform[] = [
  {
    id: "gdrive",
    name: "Google Drive",
    blurb: "The drive you already hold on Google — the files stay on their servers.",
    keyed: false,
  },
  {
    id: "dropbox",
    name: "Dropbox",
    blurb: "The Dropbox you already sync, mounted as one more drive of the os.",
    keyed: false,
  },
  {
    id: "onedrive",
    name: "OneDrive",
    blurb: "Microsoft's drive, under the same opt-in law as every platform here.",
    keyed: false,
  },
  {
    id: "box",
    name: "Box",
    blurb: "The Box account you already hold — the content stays on their side.",
    keyed: false,
  },
  {
    id: "s3",
    name: "S3 compatible",
    blurb: "Any S3-compatible bucket: you bring the endpoint and the keys.",
    keyed: true,
  },
  {
    id: "host",
    name: "File host by url",
    blurb: "Your own file host over http — the generic door for anything that answers.",
    keyed: true,
  },
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

/** the honest capacity answer of one drive: the bytes the browser reports
 * for the store the mounted partition lives in, or the quiet unknown
 * states — never an invented figure */
function capacityanswer(mounted: boolean, capacity?: Capacity): string {
  if (!mounted) return "capacity answers after mount";
  if (!capacity) return "the browser does not answer a quota on this machine";
  return `${formatbytes(capacity.usage)} used of ${formatbytes(capacity.quota)}`;
}

/** the identity mark of one external platform, drawn inline as a quiet
 * monochrome stroke glyph at 28px: no external asset ever loads on this
 * surface and the panel keeps its chrome-neutral ink */
function PlatformMark({ id }: { id: PlatformId }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={28}
      height={28}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-ink-2"
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

/** The drives panel: the windows-style drive cards of this machine, the
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
      toast.error("The drive could not be mounted.");
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
      toast(`New drive mounted: ${drive.label}. It starts empty.`);
      navigate("/panel");
      window.location.reload();
    } catch {
      toast.error("The new drive could not be created on this machine.");
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

  /** files the pairing as a draft of this panel: the drive registry knows
   * local partitions only, so the real pairing lands with the database
   * wave and no connected state is ever faked */
  function pair(platform: Platform) {
    setDrafts((current) => ({
      ...current,
      [platform.id]: {
        label: pairlabel.trim() || platform.name,
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

  // the shelf folds the mounted drive back in (the first read of the
  // registry can return the list before the lazy registration lands) and
  // mounts it first, the way the file manager of a desktop lists the
  // system disk
  const shelf = active ? [active, ...list.filter((drive) => drive.id !== active.id)] : list;

  return (
    <>
      <section aria-labelledby="dt-drives-local-heading" className="grid gap-4">
        <header className="max-w-[56ch]">
          <p className="font-mono text-[10px] tracking-[.08em] text-ink-3">the local drives</p>
          <h2
            id="dt-drives-local-heading"
            className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink"
          >
            Drives on this machine
          </h2>
          <p className="mt-2 text-sm leading-[1.55] text-ink-2">
            The os treats databases as hard drives: every drive below is one owner partition of the local store. Mount a
            new partition or reopen one you made before — the records never leave this browser.
          </p>
        </header>

        {shelf.length === 0 ? (
          <p
            className="rounded-2xl bg-s0 p-5 font-mono text-xs text-ink-3 ring-1 ring-hairline-strong"
            style={{ boxShadow: STRIP_SHADOW }}
          >
            Reading the drives of this machine…
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4" aria-label="The drives of this machine">
            {shelf.map((drive) => {
              const mounted = drive.id === active?.id;
              const share = capacity ? Math.min(100, Math.max(0, (capacity.usage / capacity.quota) * 100)) : 0;
              return (
                <li
                  key={drive.id}
                  className="rounded-2xl bg-s0 p-4 ring-1 ring-hairline-strong sm:p-5"
                  style={{ boxShadow: STRIP_SHADOW }}
                >
                  <div className="flex items-center gap-4">
                    <span
                      aria-hidden="true"
                      className={
                        mounted
                          ? "grid size-11 shrink-0 place-items-center rounded-lg bg-s2 text-ink ring-1 ring-hairline-strong"
                          : "grid size-11 shrink-0 place-items-center rounded-lg bg-s1 text-ink-3 ring-1 ring-hairline"
                      }
                    >
                      <HardDriveRegular fontSize={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-display text-sm font-semibold tracking-[-0.01em] text-ink">
                        {drive.label}
                      </h3>
                      <p className="mt-1 truncate font-mono text-[11px] text-ink-3">
                        {mounted ? "mounted" : "unmounted"} · {drive.id} · created {drive.createdAt.slice(0, 10)}
                      </p>
                    </div>
                    {mounted ? null : (
                      <button
                        type="button"
                        className={BUTTON_QUIET}
                        disabled={busy}
                        onClick={() => void mount(drive.id)}
                        aria-label={`Open the drive ${drive.label}`}
                      >
                        Open
                      </button>
                    )}
                  </div>
                  {mounted && capacity ? (
                    <div
                      className="mt-4 h-1.5 overflow-hidden rounded-full bg-s2"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(share)}
                      aria-label="Store usage — the one allocation every drive on this machine shares"
                    >
                      <div className="h-full rounded-full bg-win" style={{ width: `${share}%` }} />
                    </div>
                  ) : (
                    <div className="mt-4 h-1.5 rounded-full bg-s2" aria-hidden="true" />
                  )}
                  <p
                    className={
                      mounted && capacity
                        ? "mt-2 font-mono text-xs tabular-nums text-ink-2"
                        : "mt-2 font-mono text-xs text-ink-3"
                    }
                  >
                    {capacityanswer(mounted, capacity)}
                  </p>
                  {mounted && summary?.available ? (
                    <p className="mt-1 font-mono text-xs tabular-nums text-ink-3">
                      {summary.workspaces} workspaces · {summary.sessions} sessions · {summary.messages} messages
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        <div className="rounded-2xl bg-s0 p-4 ring-1 ring-hairline-strong sm:p-5" style={{ boxShadow: STRIP_SHADOW }}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className={FIELD}
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Name the new drive (HD 2)"
              maxLength={24}
              aria-label="New drive name"
            />
            <button type="button" className={BUTTON_PRIMARY} disabled={busy} onClick={() => void create()}>
              <AddRegular fontSize={14} aria-hidden="true" />
              New HD
            </button>
          </div>
          <p className="mt-3 text-xs leading-[1.55] text-ink-3">
            A new HD is a new database partition: it starts empty and the previous drive stays on this machine — open it
            again any time. The capacity bar reads the browser's allocation for the whole store, the one disk every
            drive here shares. <DeleteRegular fontSize={11} aria-hidden="true" /> never deletes a drive.
          </p>
        </div>
      </section>

      <section aria-labelledby="dt-drives-platforms-heading" className="grid gap-4">
        <header className="max-w-[56ch]">
          <p className="font-mono text-[10px] tracking-[.08em] text-ink-3">the external drives · opt in</p>
          <h2
            id="dt-drives-platforms-heading"
            className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink"
          >
            Connect a storage platform
          </h2>
          <p className="mt-2 text-sm leading-[1.55] text-ink-2">
            The default system keeps every record on this machine — bringing your own storage is opt-in. Pair a platform
            only if you want it in the os: nothing connects until you do, and no key leaves this panel.
          </p>
        </header>

        <ul
          className="rounded-2xl bg-s0 ring-1 ring-hairline-strong"
          style={{ boxShadow: STRIP_SHADOW }}
          aria-label="The external storage platforms"
        >
          {PLATFORMS.map((platform, index) => {
            const draft = drafts[platform.id];
            const formid = `dt-pair-${platform.id}`;
            return (
              <li key={platform.id} className={index === 0 ? "p-4 sm:p-5" : "border-t border-hairline p-4 sm:p-5"}>
                <div className="flex items-center gap-4">
                  <PlatformMark id={platform.id} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="font-display text-sm font-semibold tracking-[-0.01em] text-ink">
                        {platform.name}
                      </h3>
                      <span className="font-mono text-[10px] tracking-[.08em] text-ink-3">
                        {draft ? "pairing drafted · not connected" : "not connected"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-[1.55] text-ink-3">{platform.blurb}</p>
                  </div>
                  <button
                    type="button"
                    className={BUTTON_QUIET}
                    aria-expanded={pairing === platform.id}
                    aria-controls={formid}
                    aria-label={`Connect ${platform.name}`}
                    onClick={() => {
                      if (pairing === platform.id) {
                        setPairing(undefined);
                      } else {
                        openpairing(platform);
                      }
                    }}
                  >
                    Connect
                  </button>
                </div>

                {pairing === platform.id ? (
                  <form
                    id={formid}
                    className="mt-4 grid gap-3 rounded-xl bg-s2 p-4 ring-1 ring-hairline"
                    onSubmit={(event) => {
                      event.preventDefault();
                      pair(platform);
                    }}
                  >
                    <input
                      className={FIELD}
                      value={pairlabel}
                      maxLength={24}
                      onChange={(event) => setPairlabel(event.target.value)}
                      placeholder={`Name the drive (${platform.name} — work)`}
                      aria-label="Drive label"
                    />
                    {platform.keyed ? (
                      <>
                        <input
                          className={FIELD}
                          type="url"
                          required
                          value={pairendpoint}
                          onChange={(event) => setPairendpoint(event.target.value)}
                          placeholder={platform.id === "s3" ? "https://s3.example.com" : "https://files.example.com"}
                          aria-label="Endpoint url"
                        />
                        <input
                          className={FIELD}
                          type="password"
                          required
                          autoComplete="off"
                          spellCheck={false}
                          value={pairkey}
                          onChange={(event) => setPairkey(event.target.value)}
                          placeholder="access key or secret"
                          aria-label="Access key"
                        />
                      </>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="submit" className={BUTTON_PRIMARY}>
                        Pair drive
                      </button>
                      <button type="button" className={BUTTON_QUIET} onClick={() => setPairing(undefined)}>
                        Cancel
                      </button>
                    </div>
                    <p className="m-0 font-mono text-[11px] leading-[1.55] text-ink-3">
                      pairing lands with the database wave — the draft stays on this panel and nothing is sent.
                    </p>
                  </form>
                ) : null}

                {draft ? (
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <p className="m-0 min-w-0 flex-1 font-mono text-[11px] leading-[1.55] text-ink-3">
                      "{draft.label}" drafted{draft.endpoint ? ` · ${draft.endpoint}` : ""} · not connected — pairing
                      lands with the database wave.
                    </p>
                    <button
                      type="button"
                      className={BUTTON_QUIET}
                      onClick={() => unpair(platform.id)}
                      aria-label={`Remove the ${platform.name} pairing draft`}
                    >
                      Remove draft
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>

        <p className="m-0 max-w-[56ch] text-xs leading-[1.55] text-ink-3">
          The store does not know external drives yet: the pairing drafts live in this panel's memory only — nothing is
          written to the machine, nothing is sent anywhere, and no platform reports a quota it did not answer.
        </p>
      </section>
    </>
  );
}
