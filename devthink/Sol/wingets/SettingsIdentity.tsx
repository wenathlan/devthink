/**
 * identity.tsx — the settings side of the local identity: one record of
 * user id + device id ensured silently on every boot of the os, plus the
 * display name as a stored preference. The os entry never asks for it —
 * the panel resolves it silently — and this section is the single honest
 * place where a person sees and edits it. It is a settings page, never a
 * login screen. Every string the card renders rides the copy store
 * (copy.ts). Loose component of the settings page, riding the dtw kit.
 */
import {PersonRegular} from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { copy } from "../../copy";
import {
  type BrowserIdentity,
  browserIdentity,
  readBrowserPreferences,
  saveBrowserPreference,
} from "../../storage.ts";

/** the display-name preference key inside the local database (the same key
 * the retired lock screen and entry pass stored — nothing else reads it) */
const NAME_KEY = "displayName";

/** one mono label/value line of the account ledger. */
function IdRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="dtw-settings__kv">
      <span className="dtw-settings__kvkey">{label}</span>
      <span className="dtw-settings__kvvalue">{value}</span>
    </div>
  );
}

/** LocalAccount — the local identity section of the browser-local settings
 * deck. Self-contained: reads the identity record and the stored display
 * name on mount, saves the name through the same browser preference store
 * the retired entry pass wrote, and never blocks on storage being
 * unavailable (the failure is a toast, not a gate). */
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
      toast(next ? copy("settings.identity.toast.saved") : copy("settings.identity.toast.cleared"));
    } catch {
      toast(copy("settings.identity.toast.unavailable"));
    } finally {
      setBusy(false);
    }
  }

  const dirty = name.trim() !== savedName;

  return (
    <section className="dtw-card" aria-label={copy("settings.identity.aria")}>
      <h2 className="dtw-cardtitle">
        <PersonRegular fontSize={15} aria-hidden="true" />
        {copy("settings.identity.title")}
      </h2>
      <p className="dtw-copy">{copy("settings.identity.lede")}</p>
      <form
        className="dtw-settings__form"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <label className="dtw-settings__field">
          <span>{copy("settings.identity.name")}</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={copy("settings.identity.name.ph")}
            maxLength={40}
            autoComplete="nickname"
            spellCheck={false}
            aria-label={copy("settings.identity.name")}
            className="dtw-settings__input"
          />
        </label>
        <button type="submit" disabled={busy || !dirty} aria-busy={busy || undefined} className="dtw-btn">
          {busy ? copy("settings.identity.saving") : copy("settings.identity.save")}
        </button>
        {savedName ? <small className="dtw-settings__base">{savedName}</small> : null}
      </form>
      <div>
        <IdRow
          label={copy("settings.identity.row.user")}
          value={identity?.userId ?? copy("settings.identity.row.initializing")}
        />
        <IdRow
          label={copy("settings.identity.row.device")}
          value={identity?.deviceId ?? copy("settings.identity.row.initializing")}
        />
        <IdRow
          label={copy("settings.identity.row.created")}
          value={
            identity?.createdAt
              ? new Date(identity.createdAt).toLocaleDateString()
              : copy("settings.identity.row.initializing")
          }
        />
        <IdRow label={copy("settings.identity.row.storage")} value={copy("settings.identity.row.storage.value")} />
      </div>
    </section>
  );
}
