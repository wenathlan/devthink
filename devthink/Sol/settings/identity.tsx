/**
 * identity.tsx — the Settings side of the local identity: the surface that
 * replaced the retired /auth entry pass (defect map §5). The identity is
 * browser-local through db.ts (IndexedDB): one record of user id + device
 * id ensured silently on every boot of the OS, plus the display name as a
 * stored preference. The OS entry never asks for it — the panel resolves
 * it silently — and this section is the single honest place where a person
 * sees and edits it. It is a settings page, never a login screen.
 */

/** Style: DevThink Settings — the clean local-account section. Tailwind
 * utilities over the theme tokens: one hairline section riding the deck
 * skeleton (.r2c-sec), 44px well input with the 2px focus underline in the
 * theme focus tone, tabular-nums ids, micro 150ms transitions, zero accent
 * hue (the canvas neutrals carry the section), zero pill, zero box-in-box.
 * Every surface rides the ink tokens (--dt-text/muted/faint) through
 * color-mix alphas instead of fixed white/xx washes, so the section stays
 * legible when the deck inherits the light theme (the /os anchor raises
 * data-theme on the document root) — the light twin is a real twin. */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type BrowserIdentity, browserIdentity, readBrowserPreferences, saveBrowserPreference } from "../../db";

/** the display-name preference key inside the local database (the same key
 * the retired lock screen and entry pass stored — nothing else reads it) */
const NAME_KEY = "displayName";

/** the mono label voice of the section (the deck's lowercase mono eyebrow) */
const monoLabel = { font: "500 10px/1 var(--dt-mono, monospace)", letterSpacing: ".08em" } as const;
const displayFace = { fontFamily: "var(--font-display, var(--dt-sans, sans-serif))" } as const;

/** one mono label/value line of the account ledger. */
function IdRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <span className="shrink-0 text-[var(--dt-muted)]" style={monoLabel}>
        {label}
      </span>
      <span className="min-w-0 truncate text-right text-[11.5px] leading-relaxed text-[var(--dt-text)] tabular-nums">
        {value}
      </span>
    </div>
  );
}

/**
 * LocalAccount — the local identity section of the browser-local settings
 * deck. Self-contained: reads the identity record and the stored display
 * name on mount, saves the name through the same browser preference store
 * the retired entry pass wrote, and never blocks on storage being
 * unavailable (the failure is a toast, not a gate).
 */
export function LocalAccount() {
  const [identity, setIdentity] = useState<BrowserIdentity>();
  const [savedName, setSavedName] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void Promise.all([browserIdentity(), readBrowserPreferences()])
      .then(([record, preferences]) => {
        setIdentity(record);
        const stored = preferences[NAME_KEY]?.trim() ?? "";
        setSavedName(stored);
        setName(stored);
      })
      .catch(() => undefined);
  }, []);

  async function save() {
    if (busy) return;
    const next = name.trim();
    setBusy(true);
    try {
      // the identity record is ensured before the name rides on it — the
      // same order the retired entry pass used
      await browserIdentity();
      if (next) await saveBrowserPreference(NAME_KEY, next);
      setSavedName(next);
      setName(next);
      toast(next ? "The display name was saved in this browser." : "The display name was cleared.");
    } catch {
      toast("The local database is unavailable in this browser; the name was not saved.");
    } finally {
      setBusy(false);
    }
  }

  const dirty = name.trim() !== savedName;

  return (
    <section id="account" className="r2c-sec" aria-label="Local account">
      <header className="r2c-sec__head">
        <span className="r2c-sec__index" aria-hidden="true">
          02
        </span>
        <div style={{ minWidth: 0 }}>
          <p className="r2c-sec__eyebrow">local account · this browser</p>
          <h2 className="r2c-sec__title">Local account.</h2>
        </div>
      </header>
      <p className="max-w-[54ch] text-[12.5px] leading-relaxed text-[var(--dt-muted)]">
        One local identity keeps sessions, tabs and preferences together in this browser. Nothing leaves the machine —
        no account, no server, no credential.
      </p>
      <form
        className="mt-1 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <label className="grid gap-2">
          <span className="text-[var(--dt-muted)]" style={monoLabel}>
            display name
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your display name"
            maxLength={40}
            autoComplete="nickname"
            spellCheck={false}
            aria-label="Display name"
            className="h-11 w-[min(320px,100%)] rounded-md border-0 border-b border-[color-mix(in_srgb,var(--dt-text)_15%,transparent)] bg-[color-mix(in_srgb,var(--dt-text)_4%,transparent)] px-3.5 text-[12px] text-[var(--dt-text)] outline-none transition-[background-color,border-color,box-shadow] duration-150 placeholder:text-[var(--dt-faint)] hover:bg-[color-mix(in_srgb,var(--dt-text)_6%,transparent)] focus:bg-[color-mix(in_srgb,var(--dt-text)_7%,transparent)] focus:border-[color-mix(in_srgb,var(--dt-text)_25%,transparent)] focus:shadow-[inset_0_-2px_0_var(--focus,#dfe5ee)]"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !dirty}
          aria-busy={busy || undefined}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--dt-text)_10%,transparent)] bg-[color-mix(in_srgb,var(--dt-text)_6%,transparent)] px-4 text-[11.5px] font-medium text-[var(--dt-text)] transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--dt-text)_10%,transparent)] active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-[color-mix(in_srgb,var(--dt-text)_6%,transparent)]"
          style={displayFace}
        >
          {busy ? "saving…" : "save name"}
        </button>
        {savedName ? (
          <span className="pb-3 text-[10.5px] text-[var(--dt-faint)]" style={monoLabel}>
            current: {savedName}
          </span>
        ) : null}
      </form>
      <div className="mt-4 divide-y divide-[color-mix(in_srgb,var(--dt-text)_6%,transparent)] border-t border-[color-mix(in_srgb,var(--dt-text)_7%,transparent)]">
        <IdRow label="user id" value={identity?.userId ?? "initializing"} />
        <IdRow label="device id" value={identity?.deviceId ?? "initializing"} />
        <IdRow
          label="created"
          value={identity?.createdAt ? new Date(identity.createdAt).toLocaleDateString() : "initializing"}
        />
        <IdRow label="storage" value="this browser only · no telemetry" />
      </div>
    </section>
  );
}
