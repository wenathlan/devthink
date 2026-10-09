/**
 * auth page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 */

import { ArrowLeft, ArrowRight, KeyRound, MonitorSmartphone } from "lucide-react";
/** Style: DevThink Auth — the page-app of the entry flow (the owner
 * doctrine: explore → enter (sync up) → authentication → panel). The form
 * mounts on the session mechanisms that ALREADY exist, never on a faked
 * backend: the browser-local identity (db.ts browserIdentity + the display
 * name preference — honest, no remote authentication) and the opt-in local
 * CLI pairing (the /pairings/consume gateway contract, storing the exact
 * devthink.pair.* session keys the creation panel reads on boot). A
 * successful session navigates through the pure guard afterAuthTarget
 * (authgate.ts) — default /panel, a safe ?next= override honored. */
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { browserIdentity, readBrowserPreferences, saveBrowserPreference } from "../../db";
import { SolLogoMark } from "../panel/logo";
import { afterAuthTarget, normalizeGateway, pairingReadiness } from "./authgate";

export * from "./authgate";

/** the display-name preference key inside the local database (the same key
 * the desktop lock screen reads) */
const NAME_KEY = "displayName";

type PairingResponse = { token: string; userId: string; expiresAt: number };

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

  return (
    <main className="auth-page">
      <header className="auth-page__top">
        <a className="auth-page__back" href="/explore">
          <ArrowLeft size={14} aria-hidden="true" /> back to explore
        </a>
        <span className="auth-page__brand" aria-hidden="true">
          <SolLogoMark size={20} accent />
          DevThink
        </span>
      </header>

      <section className="login-card auth-card" aria-label="Enter DevThink">
        <div className="login-card__mark" aria-hidden="true">
          <SolLogoMark size={40} />
        </div>
        <h1>enter devthink</h1>
        <p className="auth-card__copy">
          The creation panel is yours: the identity lives in this browser and the sync up with your cli is optional. No
          password, no remote authentication — honesty about where the session lives.
        </p>

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
          <button type="submit" className="login-card__primary" disabled={busy || !name.trim()}>
            <span>{busy ? "opening the panel…" : paired ? "go to the panel" : "enter the panel"}</span>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </form>

        <div className="auth-card__rule" aria-hidden="true">
          <span>or sync up with your cli</span>
        </div>

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
          <button type="submit" className="login-card__quiet auth-card__sync" disabled={busy}>
            <span>{paired ? "renew the pairing" : "sync up with the local cli"}</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
          <small className="auth-card__hint">
            {readiness.ready
              ? "all set — the invitation can also arrive by link (?pair&code)."
              : `invitation fields: ${readiness.missing.join(" · ")}`}
          </small>
        </form>

        <footer className="login-card__foot">
          browser-local identity · opt-in sync up · the session lives in sessionStorage
        </footer>
      </section>
    </main>
  );
}
