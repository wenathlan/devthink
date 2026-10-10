/**
 * login.tsx — the Windows-style identity screen shown once after the boot.
 * This is an honest local identity: the person is only a display name stored
 * in the browser-local database (IndexedDB through ../../db) — there is no
 * remote authentication, no password and no credential here. The underlying
 * local identity record is ensured through browserIdentity(); returning
 * browsers see "Continue as {name}", new browsers create the name. The card
 * rides the professional card grammar: 8px radii, 44px inputs with the thin
 * focus ring (the signal underline comes from the R1-a pass in sol.css; the
 * entrance is one orchestrated 70ms-step reveal with the breathing mark).
 */

import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { browserIdentity, readBrowserPreferences, saveBrowserPreference } from "../../db";
import { SolLogoMark } from "./logo.tsx";

/** the display-name preference key inside the local database */
const NAME_KEY = "displayName";

type LoginScreenProps = {
  /** liberates the entry slides; identity persistence already happened */
  onDone: () => void;
};

/** formats the local machine clock for the lock screen */
function formatClock(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date);
}

/** the big lock-screen clock, refreshed twice a minute */
function useLockClock(): string {
  const [clock, setClock] = useState(() => formatClock(new Date()));
  useEffect(() => {
    const tick = window.setInterval(() => setClock(formatClock(new Date())), 30_000);
    return () => window.clearInterval(tick);
  }, []);
  return clock;
}

export function LoginScreen({ onDone }: LoginScreenProps) {
  const [known, setKnown] = useState<string>();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const clock = useLockClock();

  // the name input starts focused like a lock screen, without the autofocus attribute
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    void readBrowserPreferences()
      .then((preferences) => {
        const saved = preferences[NAME_KEY]?.trim();
        if (saved) setKnown(saved);
      })
      .catch(() => undefined);
  }, []);

  /** ensures the local identity record and stores the display name, then enters */
  async function enter(displayName: string) {
    setBusy(true);
    try {
      await browserIdentity();
      if (displayName) await saveBrowserPreference(NAME_KEY, displayName);
    } catch {
      // storage may be unavailable; entering never blocks on the local identity
    }
    onDone();
  }

  const canCreate = Boolean(name.trim()) && !busy;

  return (
    <main className="login-screen">
      <div className="login-screen__grid" aria-hidden="true" />
      <header className="login-clock">
        <strong>{clock}</strong>
        <span>local machine time</span>
      </header>
      <section className="login-card" aria-label="DevThink local identity">
        {/* the one mark of the login zone: the card carries the mark alone — the h1 carries the words */}
        <div className="login-card__mark" aria-hidden="true">
          <SolLogoMark size={44} />
        </div>
        {known && !renaming ? (
          <div className="login-card__flow">
            <h1>Welcome back</h1>
            <p className="login-card__who">{known}</p>
            <button type="button" className="login-card__primary" disabled={busy} onClick={() => void enter(known)}>
              <span>Continue as {known}</span>
              <ArrowRight size={15} aria-hidden="true" />
            </button>
            <button type="button" className="login-card__quiet" onClick={() => setRenaming(true)}>
              use another name
            </button>
          </div>
        ) : (
          <form
            className="login-card__flow"
            onSubmit={(event) => {
              event.preventDefault();
              if (!canCreate) return;
              void enter(name.trim());
            }}
          >
            <h1>{known ? "Change the name" : "Who is working here?"}</h1>
            <p className="login-card__copy">
              One local identity keeps sessions, tabs and preferences together in this browser. Nothing leaves the
              machine.
            </p>
            <input
              ref={nameRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your display name"
              maxLength={40}
              autoComplete="off"
              spellCheck={false}
              aria-label="Display name"
            />
            <button type="submit" className="login-card__primary" disabled={!canCreate}>
              <span>{busy ? "Preparing the workspace…" : "Create identity"}</span>
              <ArrowRight size={15} aria-hidden="true" />
            </button>
            {known ? (
              <button type="button" className="login-card__quiet" onClick={() => setRenaming(false)}>
                back
              </button>
            ) : (
              <button type="button" className="login-card__quiet" disabled={busy} onClick={() => void enter("")}>
                continue without a name
              </button>
            )}
          </form>
        )}
        <footer className="login-card__foot">browser-local identity · no remote authentication</footer>
      </section>
    </main>
  );
}
