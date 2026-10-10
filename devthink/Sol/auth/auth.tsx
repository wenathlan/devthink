/**
 * auth page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 *
 * SOL ENTRY PASS — the Windows-grade entry scene of the flow intro → auth →
 * panel. A pinned dark stage (#202020, the doctrine mica lift rendered as a
 * neutral white-4% radial so no accent hue leaks into the canvas) carries
 * exactly three atmosphere layers plus one light: three backdrop scenes
 * crossfading behind the card (pure CSS gradients in the Sol palette —
 * graphite, amber, rust — each owning 6s of an 18s cycle, drifting scale
 * 1.1→1, crossfading on opacity only, ≤8% luminance swing), the 64px grid at
 * white 2% under a radial mask, the feTurbulence film grain at a net 0.05,
 * and the ONE warm light — a single amber bloom (#F59E0B capped at 10%
 * alpha, masked) high over the card. No WebGL, no orbs, no decorative dots.
 *
 * On mount the entry intro plays once: the mark rises on the true Akash
 * spring (framer-motion, stiffness 300 / damping 15 — the pass's only
 * dependency use) and the name follows with backOut after 120ms; after the
 * hold the whole scene slides up and away in 0.8s on
 * cubic-bezier(0.76, 0, 0.24, 1). No loading dots, ever. The intro mark is
 * the transient entry beat; the persistent page keeps the ONE mark where it
 * belongs — the ShellChrome taskbar (logo discipline: no second mark in the
 * page body).
 *
 * The entry card is the family paper signature (#f4f3ed, near-black ink)
 * floating 1100×700 at radius 32 over the dark stage and expanding
 * fullscreen on the first real user interaction inside it (pointer press or
 * key press — the mount auto-focus is not an interaction and never
 * triggers it). The interior splits asymmetric 1.2fr/1fr divided by ONE
 * hairline: the local identity form dominates the main column, the opt-in
 * CLI pairing rides the rail above the trust ledger (hairline rows, no
 * boxes, mono 10px, sentence case, no marketing verbs). Inputs are 44px
 * flat wells with a hairline bottom and a 2px neutral focus underline in
 * the theme focus tone — zero glow; the submit is a solid ink button with
 * paper text, radius 8px, a 150ms hover wash on the entry curve
 * cubic-bezier(0.1, 0.9, 0.2, 1) and a scale(.98) press. The fullscreen
 * expand approximates the layout spring on var(--spring), entering from
 * the .96 modal floor, never from scale(0). prefers-reduced-motion turns
 * every animation of the pass off; prefers-reduced-transparency drops the
 * atmosphere layers for solid surfaces. The stage and the card are
 * deliberately pinned literals: a sign-in screen is one brand moment, in
 * light or dark theme.
 *
 * Session mechanics are untouched: the browser-local identity (db.ts
 * browserIdentity + the display-name preference — honest, no remote
 * authentication), the opt-in local CLI pairing (POST /pairings/consume —
 * the exact gateway contract and devthink.pair.* session keys the creation
 * panel reads on boot) and the pure afterAuthTarget guard. No backend is
 * faked; storage may refuse and the entry still completes.
 */

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { browserIdentity, readBrowserPreferences, saveBrowserPreference } from "../../db";
import { SolLogoMark } from "../panel/logo.tsx";
import { ShellChrome } from "../shell/ShellChrome.tsx";
import { useReducedMotion } from "../shell/trayflyouts.tsx";
import { afterAuthTarget, normalizeGateway, pairingReadiness } from "./authgate.ts";

export * from "./authgate.ts";

/* --------------------------------------------------------------------------
 * the auth entry-pass stylesheet — scoped to the .authx-* classes only this
 * page mounts, injected once at import time. The stage, the atmosphere
 * layers, the paper card grammar (wells, ink submit, hairline ledger) and
 * the intro overlay live here; the shared tokens (--focus, --ease-decel,
 * --spring, --shell-top) resolve through the Sol foundation.
 * ------------------------------------------------------------------------ */
const AUTH_CSS = `
.authx { position: relative; display: grid; grid-template-rows: auto 1fr; min-height: 100dvh; overflow: hidden; }

/* the pinned dark canvas + the mica lift (one neutral radial, no accent hue) */
.authx-stage { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; background-color: #202020; background-image: radial-gradient(1100px 640px at 50% -12%, rgb(255 255 255 / 4%) 0%, transparent 62%); background-attachment: fixed; }

/* the three backdrop scenes: pure CSS gradients, graphite/amber/rust; each
   owns 6s of the 18s cycle (fade 1s in, hold, 1s out), drifting 1.1 → 1 */
.authx-scene { position: absolute; inset: 0; opacity: 0; transform: scale(1.1); will-change: opacity, transform; animation: authx-scene-fade 18s linear infinite, authx-scene-drift 6s var(--ease-decel, cubic-bezier(0.1, 0.9, 0.2, 1)) infinite; }
.authx-scene--a { background: radial-gradient(110% 80% at 20% 0%, rgb(255 255 255 / 3%) 0%, transparent 58%), radial-gradient(130% 100% at 90% 100%, rgb(0 0 0 / 22%) 0%, transparent 62%); animation-delay: 0s, 0s; }
.authx-scene--b { background: radial-gradient(80% 60% at 80% 12%, rgb(245 158 11 / 7%) 0%, transparent 60%), radial-gradient(120% 90% at 12% 96%, rgb(0 0 0 / 16%) 0%, transparent 58%); animation-delay: -12s, -12s; }
.authx-scene--c { background: radial-gradient(90% 70% at 14% 18%, rgb(120 53 15 / 14%) 0%, transparent 58%), radial-gradient(120% 100% at 88% 88%, rgb(255 255 255 / 2%) 0%, transparent 55%); animation-delay: -6s, -6s; }
@keyframes authx-scene-fade { 0% { opacity: 0; } 5.56% { opacity: 1; } 27.78% { opacity: 1; } 33.34% { opacity: 0; } 100% { opacity: 0; } }
@keyframes authx-scene-drift { from { transform: scale(1.1); } to { transform: scale(1); } }

/* the 64px grid at white 2% under a radial mask */
.authx-grid { position: absolute; inset: 0; background-image: linear-gradient(rgb(255 255 255 / 2%) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 2%) 1px, transparent 1px); background-size: 64px 64px; -webkit-mask-image: radial-gradient(72% 64% at 50% 42%, #000 0%, transparent 100%); mask-image: radial-gradient(72% 64% at 50% 42%, #000 0%, transparent 100%); }

/* the ONE warm light: a single amber bloom high over the card, 10% alpha max */
.authx-bloom { position: absolute; inset: 0; background: radial-gradient(46% 40% at 50% 14%, rgb(245 158 11 / 10%) 0%, rgb(245 158 11 / 3%) 42%, transparent 70%); -webkit-mask-image: radial-gradient(64% 56% at 50% 16%, #000 0%, transparent 100%); mask-image: radial-gradient(64% 56% at 50% 16%, #000 0%, transparent 100%); }

/* film grain: feTurbulence tile 140, net opacity .05, zero image files */
.authx-grain { position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='dtauthg'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.86' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23dtauthg)' opacity='0.05'/%3E%3C/svg%3E"); background-size: 140px 140px; }

/* the dock: the card floats centered under the taskbar */
.authx-dock { position: relative; z-index: 10; display: grid; place-items: center; padding: 24px clamp(12px, 3vw, 32px); }

/* the paper card: the family light signature over the dark stage — 1100×700
   at radius 32, expanding fullscreen on the first interaction; the entrance
   rises from the .96 modal floor, the expand rides the layout-spring bezier */
.authx-card { position: relative; display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); width: min(1100px, 100%); height: min(700px, 100%); overflow: hidden; color: #1c1c1c; background: #f4f3ed; border-radius: 32px; box-shadow: 0 0 0 1px rgb(20 20 20 / 8%), 0 32px 64px rgb(0 0 0 / 28%), 0 0 8px rgb(0 0 0 / 20%); animation: authx-card-in 560ms var(--ease-decel, cubic-bezier(0.1, 0.9, 0.2, 1)) 1.15s backwards; transition: width 640ms var(--spring, cubic-bezier(0.2, 1.2, 0.4, 1)), height 640ms var(--spring, cubic-bezier(0.2, 1.2, 0.4, 1)), border-radius 480ms var(--spring, cubic-bezier(0.2, 1.2, 0.4, 1)); }
.authx-card[data-expanded="true"] { width: 100vw; height: 100dvh; border-radius: 0; }
@keyframes authx-card-in { from { opacity: 0; transform: translateY(24px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

.authx-col { display: flex; flex-direction: column; gap: 12px; min-width: 0; padding: clamp(28px, 4vw, 48px); overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgb(28 28 28 / 24%) transparent; }
.authx-col::-webkit-scrollbar { width: 6px; }
.authx-col::-webkit-scrollbar-thumb { border-radius: 3px; background: rgb(28 28 28 / 24%); }
.authx-col--main { justify-content: safe center; gap: 14px; }
.authx-col--rail { border-left: 1px solid rgb(28 28 28 / 10%); }

.authx-back { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 8px; margin: -8px 0 0 -8px; color: rgb(28 28 28 / 62%); font: 500 10px var(--font-mono, monospace); letter-spacing: 0.08em; text-decoration: none; transition: color 150ms var(--ease-decel, cubic-bezier(0.1, 0.9, 0.2, 1)); }
.authx-back:hover { color: #1c1c1c; }
.authx-back:focus-visible { outline: 2px solid rgb(28 28 28 / 70%); outline-offset: 2px; }

.authx-title { margin: 0; color: #1c1c1c; font: 700 clamp(24px, 3vw, 30px)/1.1 var(--font-display, sans-serif); letter-spacing: -0.02em; text-wrap: balance; }
.authx-lede { margin: 0; max-width: 46ch; color: rgb(28 28 28 / 64%); font: 400 13px/1.7 var(--font-display, sans-serif); text-wrap: pretty; }
.authx-label { margin: 8px 0 0; color: rgb(28 28 28 / 62%); font: 500 10px/1 var(--font-mono, monospace); letter-spacing: 0.12em; }
.authx-micro { margin: 0; color: rgb(28 28 28 / 62%); font: 400 10.5px/1.6 var(--font-mono, monospace); }

.authx-form { display: grid; gap: 12px; justify-items: stretch; }
.authx-row { display: grid; grid-template-columns: minmax(0, 1fr) 112px; gap: 8px; }

/* inputs: 44px flat wells, hairline bottom, the 2px neutral focus underline
   in the theme focus tone, zero glow */
.authx-card input { width: 100%; min-height: 44px; padding: 0 12px 0 14px; color: #1c1c1c; background: rgb(28 28 28 / 4%); border: 0; border-bottom: 1px solid rgb(28 28 28 / 18%); border-radius: 0; outline: 0; font: 400 12px var(--font-mono, monospace); transition: background 150ms var(--ease-decel, cubic-bezier(0.1, 0.9, 0.2, 1)), border-color 150ms var(--ease-decel, cubic-bezier(0.1, 0.9, 0.2, 1)), box-shadow 150ms var(--ease-decel, cubic-bezier(0.1, 0.9, 0.2, 1)); }
.authx-card input::placeholder { color: rgb(28 28 28 / 48%); }
.authx-card input:hover { background: rgb(28 28 28 / 6%); }
.authx-card input:focus { background: rgb(28 28 28 / 7%); border-bottom-color: rgb(28 28 28 / 24%); box-shadow: inset 0 -2px 0 var(--focus, #dfe5ee); }
.authx-card input:focus-visible { outline: none; }

/* the submit: solid ink, paper text, radius 8, 150ms hover wash on the entry
   curve, press scale .98 */
.authx-submit { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 0 20px; color: #f4f3ed; background: #1c1c1c; border: 0; border-radius: 8px; font: 600 12px/1 var(--font-display, sans-serif); letter-spacing: 0.01em; cursor: pointer; transition: background 150ms var(--ease-decel, cubic-bezier(0.1, 0.9, 0.2, 1)), transform 120ms var(--ease-accel, cubic-bezier(0.7, 0, 1, 0.5)), opacity 150ms var(--ease-decel, cubic-bezier(0.1, 0.9, 0.2, 1)); }
.authx-submit:hover:not(:disabled) { background: color-mix(in srgb, #1c1c1c 88%, #f4f3ed); }
.authx-submit:active:not(:disabled) { transform: scale(0.98); }
.authx-submit:disabled { opacity: 0.4; cursor: not-allowed; }
.authx-submit:focus-visible { outline: 2px solid rgb(28 28 28 / 70%); outline-offset: 2px; }

.authx-quiet { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 0 16px; color: rgb(28 28 28 / 75%); background: transparent; border: 1px solid rgb(28 28 28 / 16%); border-radius: 8px; font: 500 11px/1 var(--font-mono, monospace); cursor: pointer; transition: background 150ms var(--ease-decel, cubic-bezier(0.1, 0.9, 0.2, 1)), color 150ms var(--ease-decel, cubic-bezier(0.1, 0.9, 0.2, 1)), transform 120ms var(--ease-accel, cubic-bezier(0.7, 0, 1, 0.5)); }
.authx-quiet:hover:not(:disabled) { color: #1c1c1c; background: rgb(28 28 28 / 5%); }
.authx-quiet:active:not(:disabled) { transform: scale(0.98); }
.authx-quiet:disabled { opacity: 0.4; cursor: not-allowed; }
.authx-quiet:focus-visible { outline: 2px solid rgb(28 28 28 / 70%); outline-offset: 2px; }

.authx-hint { color: rgb(28 28 28 / 62%); font: 400 10px/1.7 var(--font-mono, monospace); }

/* the trust rail: the hairline ledger, no boxes */
.authx-ledger { display: grid; margin: auto 0 0; padding: 0; list-style: none; }
.authx-ledger li { padding: 10px 0; border-top: 1px solid rgb(28 28 28 / 10%); color: rgb(28 28 28 / 62%); font: 500 10px/1.6 var(--font-mono, monospace); letter-spacing: 0.08em; }

/* the intro overlay: the transient entry beat — the mark on the Akash
   spring, the name on backOut, the scene sliding up on exit */
.authx-intro { position: fixed; inset: 0; z-index: 100; display: grid; place-content: center; justify-items: center; gap: 18px; color: #f4f3ed; background: #202020; pointer-events: none; }
.authx-intro__mark { display: grid; place-items: center; }
.authx-intro__name { color: #f4f3ed; font: 600 21px/1 var(--font-display, sans-serif); letter-spacing: -0.01em; }

@media (max-width: 900px) {
  .authx-card { grid-template-columns: 1fr; }
  .authx-col--rail { border-left: 0; border-top: 1px solid rgb(28 28 28 / 10%); }
  .authx-ledger { margin: 8px 0 0; }
}

/* guards: the pass never moves for visitors who said still, and the
   atmosphere collapses to solid surfaces for visitors who said opaque */
@media (prefers-reduced-motion: reduce) {
  .authx-scene { animation: none; }
  .authx-scene--a { opacity: 1; transform: none; }
  .authx-card { animation: none; transition: none; }
  .authx-card input, .authx-submit, .authx-quiet, .authx-back { transition: none; }
}
[data-motion="reduced"] .authx-scene { animation: none; }
[data-motion="reduced"] .authx-scene--a { opacity: 1; transform: none; }
[data-motion="reduced"] .authx-card { animation: none; transition: none; }
[data-motion="reduced"] .authx-card input, [data-motion="reduced"] .authx-submit, [data-motion="reduced"] .authx-quiet, [data-motion="reduced"] .authx-back { transition: none; }
@media (prefers-reduced-transparency: reduce) {
  .authx-scene, .authx-grid, .authx-bloom, .authx-grain { display: none; }
  .authx-stage { background-image: none; }
}
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

/** the intro hold before the scene slides up and away (the exit itself is
 * 0.8s, so the whole beat clears in 2.2s) */
const INTRO_HOLD_MS = 1400;

/** the focus delay: the display-name field takes focus as the entry card
 * reveals (immediately for visitors who said still) */
const FOCUS_DELAY_MS = 1250;

type PairingResponse = { token: string; userId: string; expiresAt: number };

/** The authentication page-app served at /auth. */
export default function Auth() {
  const [, navigate] = useLocation();
  const reduced = useReducedMotion();
  const invitation = useRef(new URLSearchParams(window.location.search));
  const [name, setName] = useState("");
  const [known, setKnown] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [gateway, setGateway] = useState(() => invitation.current.get("gateway") || "");
  const [pairingId, setPairingId] = useState(() => invitation.current.get("pair") || "");
  const [code, setCode] = useState(() => invitation.current.get("code")?.toUpperCase() || "");
  const [paired, setPaired] = useState(() => Boolean(window.sessionStorage.getItem("devthink.pair.token")));
  const [expanded, setExpanded] = useState(false);
  // the intro never mounts at all for visitors who said still
  const [intro, setIntro] = useState<"play" | "gone">(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "gone" : "play",
  );
  const cardRef = useRef<HTMLElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);

  // the intro plays once: hold, then the AnimatePresence exit slides the
  // whole scene up on cubic-bezier(0.76, 0, 0.24, 1)
  useEffect(() => {
    if (intro !== "play") return undefined;
    const timer = window.setTimeout(() => setIntro("gone"), INTRO_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [intro]);

  // returning browsers start from their saved display name; the field takes
  // focus as the entry card reveals
  useEffect(() => {
    const focusTimer = window.setTimeout(() => nameRef.current?.focus(), reduced ? 0 : FOCUS_DELAY_MS);
    void readBrowserPreferences()
      .then((preferences) => {
        const saved = preferences[NAME_KEY]?.trim();
        if (saved) {
          setKnown(saved);
          setName((current) => current || saved);
        }
      })
      .catch(() => undefined);
    return () => window.clearTimeout(focusTimer);
  }, [reduced]);

  // the card expands fullscreen on the first real user interaction inside
  // it — a pointer press or a key press (Tab). The mount auto-focus is not
  // a user interaction and must not trigger the expand.
  const expand = useCallback(() => setExpanded(true), []);
  useEffect(() => {
    if (expanded) return undefined;
    const inside = (event: Event) => {
      if (cardRef.current?.contains(event.target as Node)) expand();
    };
    window.addEventListener("pointerdown", inside);
    window.addEventListener("keydown", inside);
    return () => {
      window.removeEventListener("pointerdown", inside);
      window.removeEventListener("keydown", inside);
    };
  }, [expand, expanded]);

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

  return (
    <main className="authx">
      {/* the pinned dark canvas: mica lift, three crossfading scenes, the
          64px grid, the ONE amber bloom and the film grain (all decorative,
          all pointer-transparent) */}
      <div className="authx-stage" aria-hidden="true">
        <div className="authx-scene authx-scene--a" />
        <div className="authx-scene authx-scene--b" />
        <div className="authx-scene authx-scene--c" />
        <div className="authx-grid" />
        <div className="authx-bloom" />
        <div className="authx-grain" />
      </div>

      <ShellChrome />

      <div className="authx-dock">
        <section ref={cardRef} className="authx-card" data-expanded={expanded || undefined} aria-label="Enter DevThink">
          {/* the main column: the local identity form, the honest mechanism */}
          <div className="authx-col authx-col--main">
            <Link href="/explore" className="authx-back">
              <ArrowLeft size={12} aria-hidden="true" /> Back to explore
            </Link>
            <h1 className="authx-title">Enter DevThink</h1>
            <p className="authx-lede">
              Your identity is created and kept in this browser. It never leaves the machine.
            </p>
            <form
              className="authx-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (!busy) void enterLocal(name.trim());
              }}
            >
              <label className="authx-label" htmlFor="dt-auth-name">
                Display name
              </label>
              <input
                id="dt-auth-name"
                ref={nameRef}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={known || "Your display name"}
                maxLength={40}
                aria-label="Display name"
              />
              <p className="authx-micro">Saved in the local browser database. No account, no server.</p>
              <button
                type="submit"
                className="authx-submit"
                disabled={busy || !name.trim()}
                aria-busy={busy || undefined}
              >
                <span>{busy ? "Opening the panel…" : paired ? "Go to the panel" : "Enter the panel"}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            </form>
          </div>

          {/* the rail: the opt-in CLI pairing above the trust ledger — one
              hairline divides the columns, no box in a box */}
          <div className="authx-col authx-col--rail">
            <p className="authx-label">Pair with the local CLI</p>
            <p className="authx-micro">Optional. Consumes a pairing invitation issued by your own gateway.</p>
            <form
              className="authx-form"
              onSubmit={(event) => {
                event.preventDefault();
                void consumePairing(gateway, pairingId, code);
              }}
            >
              <input
                value={gateway}
                onChange={(event) => setGateway(event.target.value)}
                placeholder="http://127.0.0.1:8787"
                inputMode="url"
                autoComplete="off"
                aria-label="Local gateway url"
              />
              <div className="authx-row">
                <input
                  value={pairingId}
                  onChange={(event) => setPairingId(event.target.value)}
                  placeholder="Pairing id"
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
              <button type="submit" className="authx-quiet" disabled={busy} aria-busy={busy || undefined}>
                <span>{paired ? "Renew the pairing" : "Sync up with the CLI"}</span>
                <ArrowRight size={13} aria-hidden="true" />
              </button>
              <small className="authx-hint">
                {readiness.ready
                  ? "All fields present — the invitation can also arrive as a link (?pair&code)."
                  : `Still needed: ${readiness.missing.join(", ")}.`}
              </small>
            </form>
            <ul className="authx-ledger">
              <li>Local-first identity</li>
              <li>CLI pairing opt-in</li>
              <li>No telemetry</li>
            </ul>
          </div>
        </section>
      </div>

      {/* the transient entry beat: the mark on the true Akash spring (300/15),
          the name on backOut after 120ms, the scene lifting away on exit —
          skipped entirely for visitors who said still */}
      <AnimatePresence>
        {intro === "play" && (
          <motion.div
            key="dt-auth-intro"
            className="authx-intro"
            aria-hidden="true"
            exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
          >
            <motion.span
              className="authx-intro__mark"
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <SolLogoMark size={64} />
            </motion.span>
            <motion.span
              className="authx-intro__name"
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.12, duration: 0.6, ease: "backOut" }}
            >
              DevThink
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
