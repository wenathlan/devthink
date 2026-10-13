/**
 * identity.tsx — the Settings side of the local identity: the surface that
 * replaced the retired /auth entry pass (defect map §5). The identity is
 * browser-local through db.ts (IndexedDB): one record of user id + device
 * id ensured silently on every boot of the OS, plus the display name as a
 * stored preference. The OS entry never asks for it — the panel resolves
 * it silently — and this section is the single honest place where a person
 * sees and edits it. It is a settings page, never a login screen.
 */

/** Style: DevThink Settings — the clean local-account section. Named classes
 * from Sol/sol.viewsdelta.css (.set-*) over the theme tokens: one hairline
 * section riding the deck skeleton (.r2c-sec), 44px well input with the 2px
 * focus underline in the theme focus tone, tabular-nums ids, zero accent
 * hue (the canvas neutrals carry the section), zero pill, zero box-in-box.
 * Every surface rides the canonical ink tokens (--color-ink*) so the section
 * stays legible when the deck inherits the light theme (the /os anchor raises
 * data-theme on the document root) — the light twin is a real twin. */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type BrowserIdentity, browserIdentity, readBrowserPreferences, saveBrowserPreference } from "../../db";

/** the display-name preference key inside the local database (the same key
 * the retired lock screen and entry pass stored — nothing else reads it) */
const NAME_KEY = "displayName";

/** the mono label voice of the section (the deck's lowercase mono eyebrow) */
const monoLabel = { font: "500 10px/1 var(--font-mono, monospace)", letterSpacing: ".08em" } as const;
const displayFace = { fontFamily: "var(--font-display, sans-serif)" } as const;

/** one mono label/value line of the account ledger. */
function IdRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="set-idrow">
      <span className="set-idrow__k" style={monoLabel}>
        {label}
      </span>
      <span className="set-idrow__v">{value}</span>
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
          <p className="r2c-sec__eyebrow">local account — this browser</p>
          <h2 className="r2c-sec__title">Local account.</h2>
        </div>
      </header>
      <p className="set-copy">
        One local identity keeps sessions, tabs and preferences in this browser. Nothing leaves the machine — no
        account, no server.
      </p>
      <form
        className="set-form"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <label className="set-field">
          <span className="set-field__label" style={monoLabel}>
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
            className="set-input"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !dirty}
          aria-busy={busy || undefined}
          className="set-btn"
          style={displayFace}
        >
          {busy ? "saving…" : "save name"}
        </button>
        {savedName ? (
          <span className="set-current" style={monoLabel}>
            current: {savedName}
          </span>
        ) : null}
      </form>
      <div className="set-ledger">
        <IdRow label="user id" value={identity?.userId ?? "initializing"} />
        <IdRow label="device id" value={identity?.deviceId ?? "initializing"} />
        <IdRow
          label="created"
          value={identity?.createdAt ? new Date(identity.createdAt).toLocaleDateString() : "initializing"}
        />
        <IdRow label="storage" value="this browser only — no telemetry" />
      </div>
    </section>
  );
}
