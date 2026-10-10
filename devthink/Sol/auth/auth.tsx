/**
 * auth page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 */

import { ArrowLeft, ArrowRight, KeyRound, MonitorSmartphone } from "lucide-react";
/** Style: DevThink Auth — the page-app of the entry flow (campaign v3
 * r2-a). ONE named light (the entry glow, a shader-fallback bloom high over
 * the card) and the signal accent #ff5f00 at the 90/10 split. The page body
 * opens as the editorial head — mono eyebrow, the Bricolage display line,
 * one honest phrase — and the entry card below is ONE instrument cut
 * asymmetric: the local identity form dominates the 1.2fr column, the sync
 * up rides the 1fr trust rail as a hairline ledger (no box-in-box). The
 * form mounts on the session mechanisms that ALREADY exist, never on a
 * faked backend: the browser-local identity (db.ts browserIdentity + the
 * display name preference — honest, no remote authentication) and the
 * opt-in local CLI pairing (the /pairings/consume gateway contract, storing
 * the exact devthink.pair.* session keys the creation panel reads on boot).
 * A successful session navigates through the pure guard afterAuthTarget
 * (authgate.ts) — default /panel, a safe ?next= override honored. Logo
 * discipline: the ONE mark of this zone lives in the ShellChrome navbar;
 * the page body carries no second mark. */
import { type CSSProperties, type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { browserIdentity, readBrowserPreferences, saveBrowserPreference } from "../../db";
import { ShellChrome } from "../shell/ShellChrome.tsx";
import { afterAuthTarget, normalizeGateway, pairingReadiness } from "./authgate.ts";

export * from "./authgate.ts";

/* --------------------------------------------------------------------------
 * the auth page-app stylesheet — the r2-a entry pass of this folder: the
 * asymmetric card interior (form 1.2fr / trust rail 1fr divided by one
 * hairline, never a box in a box), the 44px inputs with the signal focus
 * ring at color-mix(--sig 45%), the machined signal submit and the trust
 * ledger. Scoped to the classes only this page mounts; it lands once at
 * import time. The session mechanisms are untouched.
 * ------------------------------------------------------------------------ */
const AUTH_CSS = `
.halftone::after, .grain::before { pointer-events: none; }
.r2a-auth-light { background: radial-gradient(46% 44% at 50% 0%, color-mix(in srgb, var(--dtv3-signal) 13%, transparent) 0%, transparent 68%); }
.auth-page { padding-bottom: clamp(56px, 10vh, 120px); }
.auth-card { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); width: min(980px, 100%); background: rgb(255 255 255 / 3.5%); border: 1px solid var(--dtv3-hairline); border-radius: 20px; box-shadow: 0 40px 110px rgb(0 0 0 / 40%), inset 0 1px 0 rgb(255 255 255 / 6%); }
[data-theme="light"] .auth-card { background: rgb(255 255 255 / 70%); border-color: rgb(23 25 31 / 12%); box-shadow: 0 30px 80px rgb(23 25 31 / 12%), inset 0 1px 0 rgb(255 255 255 / 55%); }
.auth-card__main { display: grid; gap: 16px; align-content: start; min-width: 0; padding: clamp(28px, 4vw, 44px); }
.auth-card__rail { display: grid; gap: 16px; align-content: start; min-width: 0; padding: clamp(28px, 3.4vw, 40px); background: transparent; border-left: 1px solid var(--dtv3-hairline); }
.auth-card__rail-label { color: var(--dtv3-ink-3); font: 500 10px var(--font-mono, var(--dt-mono)); letter-spacing: .08em; text-transform: lowercase; }
.auth-card input { border-radius: 10px; }
.auth-card input:focus { border-color: color-mix(in srgb, var(--dtv3-sig) 45%, transparent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--dtv3-sig) 14%, transparent); }
.auth-card button:focus-visible, .auth-card input:focus-visible { outline: 2px solid color-mix(in srgb, var(--dtv3-sig) 45%, transparent); outline-offset: 2px; }
.login-card__primary { color: #1a120a; background: var(--dtv3-sig); border: 1px solid rgb(255 255 255 / 14%); border-radius: 10px; box-shadow: inset 0 1px 0 rgb(255 255 255 / 28%), 0 10px 26px rgb(255 95 0 / 22%); }
.login-card__primary:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-1px); }
.auth-card__hint { font: 400 10px/1.7 var(--font-mono, var(--dt-mono)); }
.auth-card__trust { display: grid; margin: 4px 0 0; padding: 0; list-style: none; }
.auth-card__trust li { padding: 10px 2px; border-top: 1px solid var(--dtv3-hairline); color: var(--dtv3-ink-3); font: 500 10px/1.6 var(--font-mono, var(--dt-mono)); letter-spacing: .04em; text-transform: lowercase; }
.auth-back:hover { color: var(--dt-text); border-color: var(--dtv3-hairline); background: rgb(255 255 255 / 4%); }
.auth-back:active { transform: scale(.97); }
.auth-card__sync:hover:not(:disabled) { color: var(--dt-text); background: rgb(255 255 255 / 5%); }
@media (max-width: 860px) {
  .auth-card { grid-template-columns: 1fr; }
  .auth-card__rail { border-left: 0; border-top: 1px solid var(--dtv3-hairline); }
}
@media (prefers-reduced-motion: reduce) {
  .auth-back { transition: none; }
}
[data-motion="reduced"] .auth-back { transition: none; }
`;

let authCssReady = false;

/** Injects the auth stylesheet exactly once per document, at import time. */
function ensureAuthCss(): void {
  if (authCssReady || typeof document === "undefined") return;
  authCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-auth-pass", "");
  tag.textContent = AUTH_CSS;
  document.head.appendChild(tag);
}
ensureAuthCss();

/** the display-name preference key inside the local database (the same key
 * the desktop lock screen reads) */
const NAME_KEY = "displayName";

type PairingResponse = { token: string; userId: string; expiresAt: number };

/** the press feedback of the submit buttons: scale(.97) while the pointer
 * holds the control down, released by the window pointerup or on leave —
 * the windows press grammar, carried in TSX so the flow page ships no
 * stylesheet of its own */
function usePressScale() {
  const [pressed, setPressed] = useState(false);
  useEffect(() => {
    if (!pressed) return undefined;
    const release = () => setPressed(false);
    window.addEventListener("pointerup", release);
    return () => window.removeEventListener("pointerup", release);
  }, [pressed]);
  return {
    pressed,
    props: {
      onPointerDown: () => setPressed(true),
      onPointerCancel: () => setPressed(false),
      onPointerLeave: () => setPressed(false),
    },
  };
}

const DISPLAY = "var(--font-display, var(--dt-sans))";

/** the entrance stagger of the page: one orchestrated rise through the
 * engine .enter kit, the delay reading the --i custom prop (70ms steps). */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

/** the editorial head of the entry flow: the mono eyebrow row (the back
 * affordance of the retired top bar stays right), the Bricolage display
 * line and the one honest phrase — no second brand mark anywhere (the
 * navbar owns the mark) */
const pageheadStyle = {
  display: "grid",
  gap: 14,
  width: "100%",
  maxWidth: 1180,
  marginInline: "auto",
  padding: "56px clamp(16px, 4vw, 32px) 0",
} as const;
const headTopStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
} as const;
const titleStyle = {
  margin: 0,
  color: "var(--dtv3-ink-1, var(--dt-text))",
  font: `700 clamp(38px, 5.4vw, 72px)/1.02 ${DISPLAY}`,
  letterSpacing: "-.035em",
  textAlign: "left",
} as const;
const ledeStyle = { margin: 0, maxWidth: "52ch", color: "var(--dt-muted)", fontSize: 14, lineHeight: 1.75 } as const;

/** The authentication page-app served at /auth. */
export default function Auth() {
  const [, navigate] = useLocation();
  const invitation = useRef(new URLSearchParams(window.location.search));
  const [name, setName] = useState("");
  const [known, setKnown] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [gateway, setGateway] = useState(() => invitation.current.get("gateway") || "");
  const [pairingId, setPairingId] = useState(() => invitation.current.get("pair") || "");
  const [code, setCode] = useState(() => invitation.current.get("code")?.toUpperCase() || "");
  const [paired, setPaired] = useState(() => Boolean(window.sessionStorage.getItem("devthink.pair.token")));
  const nameRef = useRef<HTMLInputElement | null>(null);

  // returning browsers start from their saved display name
  useEffect(() => {
    nameRef.current?.focus();
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

  const finish = useCallback(() => {
    navigate(afterAuthTarget(window.location.search));
  }, [navigate]);

  /** the local identity: ensured silently, the display name is the only
   * credential — and it never leaves the machine */
  const enterLocal = useCallback(
    async (displayName: string) => {
      setBusy(true);
      try {
        await browserIdentity();
        if (displayName) await saveBrowserPreference(NAME_KEY, displayName);
        finish();
      } catch {
        // storage may be unavailable; entering never blocks on the identity
        finish();
      } finally {
        setBusy(false);
      }
    },
    [finish],
  );

  /** the sync up: pairs this browser with the visitor's own local CLI
   * gateway through the exact contract the panel already speaks */
  const consumePairing = useCallback(
    async (gatewayUrl: string, pairingIdValue: string, pairingCode: string) => {
      const readiness = pairingReadiness({ gatewayUrl, pairingId: pairingIdValue, code: pairingCode });
      if (!readiness.ready)
        return toast(
          `Complete the sync up: ${readiness.missing.join(", ")} ${readiness.missing.length === 1 ? "is" : "are"} missing.`,
        );
      setBusy(true);
      try {
        const response = await fetch(`${normalizeGateway(gatewayUrl)}/pairings/consume`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ pairingId: pairingIdValue, code: pairingCode }),
        });
        if (!response.ok) throw new Error("Pairing was rejected.");
        const result = (await response.json()) as PairingResponse;
        // the exact session keys the creation panel reads on boot
        window.sessionStorage.setItem("devthink.gateway", normalizeGateway(gatewayUrl));
        window.sessionStorage.setItem("devthink.pair.token", result.token);
        window.sessionStorage.setItem("devthink.pair.user", result.userId);
        window.sessionStorage.setItem("devthink.pair.expires", String(result.expiresAt));
        setPaired(true);
        toast("The browser is paired with your local DevThink CLI for this session.");
        finish();
      } catch {
        toast(
          "The sync up could not be completed. Confirm the CLI gateway is running, the page origin is allowed, and the code has not expired.",
        );
      } finally {
        setBusy(false);
      }
    },
    [finish],
  );

  // an invitation link (?gateway&pair&code) consumes itself, exactly like
  // the panel does when the invitation lands there: the paired guard makes
  // the effect idempotent, a rejection simply waits for the next edit
  useEffect(() => {
    if (paired) return;
    if (!gateway.trim() || !pairingId.trim() || code.trim().length !== 8) return;
    void consumePairing(gateway, pairingId, code);
  }, [code, consumePairing, gateway, paired, pairingId]);

  const readiness = pairingReadiness({ gatewayUrl: gateway, pairingId, code });
  const primaryPress = usePressScale();
  const syncPress = usePressScale();

  return (
    <main className="auth-page grain shader-stage">
      {/* the ONE named light of the page: the entry glow, high over the
          card; it breathes once per cycle (guarded by the engine kit) */}
      <div className="shader-fallback r2a-auth-light breathe" aria-hidden="true" />
      <ShellChrome />
      <header className="pagehead enter" style={{ ...pageheadStyle, ...step(0) }}>
        <div className="pagehead__top" style={headTopStyle}>
          <p className="pagehead__eyebrow r2a-eyebrow">devthink · auth</p>
          <div className="pagehead__actions">
            <Link href="/explore" className="auth-back r2a-action">
              <ArrowLeft size={13} aria-hidden="true" /> back to explore
            </Link>
          </div>
        </div>
        <h1 className="pagehead__title r2a-display" style={titleStyle}>
          enter devthink
        </h1>
        <p className="pagehead__lede r2a-lede" style={ledeStyle}>
          The identity lives in this browser and the sync up with your own cli stays optional — honesty about where the
          session lives.
        </p>
      </header>

      <section
        className="login-card auth-card enter"
        aria-label="Enter DevThink"
        style={{ margin: "auto", padding: 0, ...step(1) }}
      >
        <div className="auth-card__main">
          <form
            className="auth-card__form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!busy) void enterLocal(name.trim());
            }}
          >
            <label className="auth-card__label" htmlFor="dt-auth-name">
              <MonitorSmartphone size={13} aria-hidden="true" /> local identity of this browser
            </label>
            <input
              id="dt-auth-name"
              ref={nameRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={known ? known : "your display name"}
              maxLength={40}
              aria-label="Display name"
            />
            <button
              type="submit"
              className="login-card__primary press"
              disabled={busy || !name.trim()}
              aria-busy={busy || undefined}
              {...primaryPress.props}
            >
              <span>{busy ? "opening the panel…" : paired ? "go to the panel" : "enter the panel"}</span>
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </form>
        </div>

        <div className="auth-card__rail">
          <p className="auth-card__rail-label">or sync up with your cli</p>
          <form
            className="auth-card__form"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              void consumePairing(gateway, pairingId, code);
            }}
          >
            <label className="auth-card__label" htmlFor="dt-auth-gateway">
              <KeyRound size={13} aria-hidden="true" /> sync up — pairs this session with the local gateway
            </label>
            <input
              id="dt-auth-gateway"
              value={gateway}
              onChange={(event) => setGateway(event.target.value)}
              placeholder="http://127.0.0.1:8787"
              inputMode="url"
              autoComplete="off"
              aria-label="Local gateway url"
            />
            <div className="auth-card__row">
              <input
                value={pairingId}
                onChange={(event) => setPairingId(event.target.value)}
                placeholder="pairing id"
                autoComplete="off"
                aria-label="Pairing id"
              />
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="8-char code"
                maxLength={8}
                autoComplete="off"
                aria-label="Pairing code"
              />
            </div>
            <button
              type="submit"
              className="login-card__quiet auth-card__sync press"
              disabled={busy}
              aria-busy={busy || undefined}
              {...syncPress.props}
            >
              <span>{paired ? "renew the pairing" : "sync up with the local cli"}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
            <small className="auth-card__hint">
              {readiness.ready
                ? "all set — the invitation can also arrive by link (?pair&code)."
                : `invitation fields: ${readiness.missing.join(" · ")}`}
            </small>
          </form>
          {/* the trust ledger: what this entry really does, as hairline rows */}
          <ul className="auth-card__trust">
            <li>browser-local identity</li>
            <li>opt-in sync up</li>
            <li>the session lives in sessionStorage</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
