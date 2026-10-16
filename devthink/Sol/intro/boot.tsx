/**
 * boot.tsx — the owned face of the intro: the system boot for the desktop
 * and installer targets, the Windows sequence the owner described — hello,
 * the loading logo, the landscape with the clock, the lock screen with the
 * sign in, then the app home (/panel). One click or any key advances a
 * stage; reduced motion starts straight at the lock screen. The ring of
 * dots is the Windows boot spinner by request — the no dots rule governs
 * the web intro, not the boot. The stylesheet injects once at import time.
 */

import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { prefersReducedMotion } from "../../akash.ts";
import { browserIdentity, readBrowserPreferences, saveBrowserPreference } from "../../db.ts";
import { SolLogoMark } from "../panel/logo.tsx";

const BOOT_CSS = `
.boot-root { position: fixed; inset: 0; z-index: 60; display: grid; place-items: center; overflow: hidden; color: #f4f3ed; background-color: #202020; background-image: radial-gradient(#1a1f35 25%, #202020 100%); }
.boot-hello { display: grid; justify-items: center; gap: 18px; animation: bootfade 900ms var(--ease-decel, cubic-bezier(0.1, 0.9, 0.2, 1)) backwards; }
.boot-hello__word { font: 300 34px/1 'Urbanist', sans-serif; letter-spacing: -0.02em; }
.boot-ring { position: relative; width: 44px; height: 44px; animation: bootspin 1.6s linear infinite; }
.boot-ring span { position: absolute; top: 50%; left: 50%; width: 5px; height: 5px; margin: -2.5px; border-radius: 50%; background: #f4f3ed; opacity: 0.85; }
@keyframes bootspin { to { transform: rotate(360deg); } }
@keyframes bootfade { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.boot-lock { position: absolute; inset: 0; }
.boot-sky { position: absolute; inset: 0; background: linear-gradient(180deg, #0b1026 0%, #1b2a52 40%, #4a3f6e 62%, #b95f45 82%, #f2a65a 100%); }
.boot-sun { position: absolute; left: 50%; bottom: 26%; width: 180px; height: 180px; margin-left: -90px; border-radius: 50%; background: radial-gradient(circle, #ffd9a0 0%, #f2a65a 45%, transparent 72%); filter: blur(2px); }
.boot-hill { position: absolute; left: 0; right: 0; bottom: 0; }
.boot-hill--far { height: 46%; background: #241f38; clip-path: polygon(0 68%, 14% 42%, 30% 60%, 46% 30%, 62% 55%, 78% 36%, 100% 58%, 100% 100%, 0 100%); opacity: 0.9; }
.boot-hill--near { height: 30%; background: #14111f; clip-path: polygon(0 72%, 18% 40%, 36% 62%, 58% 26%, 74% 52%, 90% 34%, 100% 50%, 100% 100%, 0 100%); }
.boot-clock { position: absolute; left: clamp(24px, 8vw, 120px); bottom: clamp(28px, 9vh, 96px); animation: bootfade 700ms var(--ease-decel, cubic-bezier(0.1, 0.9, 0.2, 1)) backwards; }
.boot-clock__time { font: 200 clamp(64px, 11vw, 112px)/1 'Urbanist', sans-serif; letter-spacing: -0.03em; text-shadow: 0 2px 24px rgb(0 0 0 / 40%); }
.boot-clock__date { margin-top: 6px; font: 400 clamp(15px, 2vw, 22px)/1.3 'Urbanist', sans-serif; text-shadow: 0 2px 12px rgb(0 0 0 / 40%); }
.boot-hint { position: absolute; inset-x: 0; bottom: 18px; text-align: center; font: 400 11px 'Geist Mono', monospace; letter-spacing: 0.08em; color: rgb(244 243 237 / 55%); }
.boot-sign { position: absolute; inset: 0; display: grid; place-items: center; background: rgb(10 10 16 / 34%); backdrop-filter: blur(18px) saturate(140%); -webkit-backdrop-filter: blur(18px) saturate(140%); animation: bootfade 500ms var(--ease-decel, cubic-bezier(0.1, 0.9, 0.2, 1)) backwards; }
.boot-sign__card { display: grid; justify-items: center; gap: 14px; padding: 40px 56px; }
.boot-sign__avatar { display: grid; place-items: center; width: 96px; height: 96px; border-radius: 50%; background: linear-gradient(145deg, #4cc2ff, #0067c0); font: 600 38px 'Urbanist', sans-serif; color: #0b0d14; box-shadow: 0 18px 40px rgb(0 0 0 / 45%), inset 0 2px 3px rgb(255 255 255 / 45%); }
.boot-sign__name { color: #f4f3ed; font: 500 17px/1.3 'Urbanist', sans-serif; letter-spacing: -0.01em; }
.boot-sign__field { width: 260px; min-height: 40px; padding: 0 14px; color: #f4f3ed; background: rgb(255 255 255 / 8%); border: 0; border-bottom: 1px solid rgb(255 255 255 / 30%); border-radius: 4px; outline: 0; font: 400 13px 'Geist Mono', monospace; }
.boot-sign__field::placeholder { color: rgb(244 243 237 / 45%); }
.boot-sign__field:focus { border-bottom-color: #4cc2ff; }
.boot-sign__go { display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 22px; color: #ffffff; background: #0067c0; border: 0; border-radius: 4px; font: 600 13px 'Urbanist', sans-serif; cursor: pointer; transition: background 150ms var(--ease-micro, cubic-bezier(0.22, 1, 0.36, 1)); }
.boot-sign__go:hover { background: #1975c5; }
.boot-sign__go:active { transform: scale(0.98); }
.boot-sign__go:focus-visible { outline: 2px solid #4cc2ff; outline-offset: 2px; }
.boot-sign__micro { font: 400 10.5px 'Geist Mono', monospace; letter-spacing: 0.06em; color: rgb(244 243 237 / 55%); }
@media (prefers-reduced-motion: reduce) { .boot-ring, .boot-hello, .boot-clock, .boot-sign { animation: none; } }
`;

let bootCssReady = false;

/** Injects the boot stylesheet exactly once per document, at import time. */
function ensureBootCss(): void {
  if (bootCssReady || typeof document === "undefined") return;
  bootCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-boot", "");
  tag.textContent = BOOT_CSS;
  document.head.appendChild(tag);
}
ensureBootCss();

/** the hold of each opening stage (ms): hello, then the loading logo */
const HELLO_MS = 1300;
const LOADING_MS = 1700;

type bootstage = "hello" | "loading" | "lock" | "signin";

const NAME_KEY = "displayName";

/** The ring of dots of the loading stage: six beads on one rotation. */
function BootRing() {
  return (
    <div className="boot-ring" aria-hidden="true">
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <span key={angle} style={{ transform: `rotate(${angle}deg) translateY(-16px)` }} />
      ))}
    </div>
  );
}

/** The owned boot: hello, loading, the landscape clock, the lock screen.
 * The anchor hands the onDone callback — the intro flag rises on the way
 * out, right before the desktop takes the surface. */
export default function Boot({ onDone }: { onDone: () => void }) {
  const [, navigate] = useLocation();
  const [stage, setStage] = useState<bootstage>(() => (prefersReducedMotion() ? "lock" : "hello"));
  const [now, setNow] = useState(() => new Date());
  const [name, setName] = useState("");
  const [known, setKnown] = useState<string>();
  const [busy, setBusy] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);

  /** the stage ladder: every stage holds, then walks; a press skips */
  useEffect(() => {
    if (stage !== "hello" && stage !== "loading") return undefined;
    const timer = window.setTimeout(
      () => setStage(stage === "hello" ? "loading" : "lock"),
      stage === "hello" ? HELLO_MS : LOADING_MS,
    );
    return () => window.clearTimeout(timer);
  }, [stage]);

  /** the clock of the lock screen: one tick per second */
  useEffect(() => {
    if (stage !== "lock" && stage !== "signin") return undefined;
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [stage]);

  /** the saved display name answers before the visitor types */
  useEffect(() => {
    void readBrowserPreferences()
      .then((preferences) => {
        const saved = preferences[NAME_KEY]?.trim();
        if (saved) {
          setKnown(saved);
          setName((current) => current || saved);
        }
      })
      .catch(() => undefined);
  }, []);

  /** a press anywhere advances the opening stages and reveals the sign in */
  useEffect(() => {
    if (stage !== "hello" && stage !== "loading" && stage !== "lock") return undefined;
    const walk = () =>
      setStage((current) => (current === "hello" ? "loading" : current === "loading" ? "lock" : "signin"));
    window.addEventListener("pointerdown", walk);
    window.addEventListener("keydown", walk);
    return () => {
      window.removeEventListener("pointerdown", walk);
      window.removeEventListener("keydown", walk);
    };
  }, [stage]);

  /** the sign in: the local identity is ensured, the name is saved, the
   * desktop takes the surface */
  const enter = useCallback(async () => {
    setBusy(true);
    try {
      await browserIdentity();
      if (name.trim()) await saveBrowserPreference(NAME_KEY, name.trim());
      onDone();
      navigate("/panel");
    } catch {
      // storage may refuse; entering the desktop never blocks on it
      onDone();
      navigate("/panel");
    } finally {
      setBusy(false);
    }
  }, [name, navigate, onDone]);

  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const date = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  if (stage === "hello")
    return (
      <div className="boot-root" role="presentation">
        <div className="boot-hello">
          <SolLogoMark size={72} />
          <span className="boot-hello__word">hello</span>
        </div>
      </div>
    );

  if (stage === "loading")
    return (
      <div className="boot-root" role="presentation">
        <div className="boot-hello">
          <SolLogoMark size={72} />
          <BootRing />
        </div>
      </div>
    );

  return (
    <div className="boot-root">
      <div className="boot-lock" role="presentation">
        <div className="boot-sky" />
        <div className="boot-sun" />
        <div className="boot-hill boot-hill--far" />
        <div className="boot-hill boot-hill--near" />
        {stage === "lock" && (
          <div className="boot-clock">
            <div className="boot-clock__time">{time}</div>
            <div className="boot-clock__date">{date}</div>
          </div>
        )}
        {stage === "lock" && <div className="boot-hint">Press any key</div>}
      </div>
      {stage === "signin" && (
        <div className="boot-sign">
          <form
            className="boot-sign__card"
            onSubmit={(event) => {
              event.preventDefault();
              if (!busy) void enter();
            }}
          >
            <span className="boot-sign__avatar" aria-hidden="true">
              {(known || name || "D").trim().charAt(0).toUpperCase()}
            </span>
            <span className="boot-sign__name">{known || name || "Welcome"}</span>
            <input
              ref={nameRef}
              className="boot-sign__field"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Display name"
              maxLength={40}
              aria-label="Display name"
            />
            <button type="submit" className="boot-sign__go" disabled={busy} aria-busy={busy || undefined}>
              <span>Sign in</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
            <span className="boot-sign__micro">Local identity</span>
          </form>
        </div>
      )}
    </div>
  );
}
