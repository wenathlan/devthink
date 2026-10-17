/**
 * auth page anchor — layer 3 of the anchor architecture. The file carrying
 * the folder's own name is the path manager of the page: it imports the
 * loose components beside it, mounts the page and re-exports the public
 * component surface. Only the theme anchor (Sol/Sol.tsx) consumes this file.
 *
 * Sign in — the windows sequence: the lock screen first (the big clock and
 * the date, unlocking by a swipe up), then the authentication face (the
 * avatar, the display name, the submit) with the cli pairing riding the
 * bottom actions. The identity logic never moved: the local identity is
 * ensured silently, the display name is the only credential, and the sync
 * up rides the guarded pairing contract. The old paper card is retired —
 * this face rides the dtw login skins with the fluent icons.
 */
import { ArrowRightRegular, ChevronUpRegular, WindowConsoleRegular } from "@fluentui/react-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { afterAuthTarget, pairingReadiness, safegatewayurl } from "../../authgate.ts";
import { browserIdentity, readBrowserPreferences, saveBrowserPreference } from "../../db";
import { SolLogoMark } from "../panel/logo.tsx";
import { ShellChrome } from "../shell/ShellChrome.tsx";
import "./login.css";

export * from "../../authgate.ts";

/** the display-name preference key inside the local database (the same key
 * the desktop lock screen reads) */
const NAME_KEY = "displayName";

type PairingResponse = { token: string; userId: string; expiresAt: number };

/** The authentication page-app served at /auth: the lock clock first, the
 * sign-in face behind the unlock. */
export default function Auth() {
  const [, navigate] = useLocation();
  const invitation = useRef(new URLSearchParams(window.location.search));
  const [stage, setStage] = useState<"lock" | "signin">("lock");
  const [now, setNow] = useState(() => new Date());
  const [name, setName] = useState("");
  const [known, setKnown] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [gateway, setGateway] = useState(() => invitation.current.get("gateway") || "");
  const [pairingId, setPairingId] = useState(() => invitation.current.get("pair") || "");
  const [code, setCode] = useState(() => invitation.current.get("code")?.toUpperCase() || "");
  const [paired, setPaired] = useState(() => Boolean(window.sessionStorage.getItem("devthink.pair.token")));
  const [cliopen, setCliopen] = useState(() => Boolean(invitation.current.get("pair")));
  const nameRef = useRef<HTMLInputElement | null>(null);
  const dragstart = useRef<{ y: number } | null>(null);

  /** the lock clock ticks once a minute is enough, but one tick per second
   * keeps the minute edge honest; the interval dies with the mount */
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // returning browsers start from their saved display name
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

  // the name field takes focus as the sign-in face reveals
  useEffect(() => {
    if (stage !== "signin") return;
    const timer = window.setTimeout(() => nameRef.current?.focus(), 320);
    return () => window.clearTimeout(timer);
  }, [stage]);

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
        // the guarded base: the readiness verdict above already answered
        // safe, the guard answers the exact url every pairing call rides
        const gateway = safegatewayurl(gatewayUrl);
        if (!gateway) return;
        const response = await fetch(`${gateway}/pairings/consume`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ pairingId: pairingIdValue, code: pairingCode }),
        });
        if (!response.ok) throw new Error("Pairing was rejected.");
        const result = (await response.json()) as PairingResponse;
        // the exact session keys the creation panel reads on boot
        window.sessionStorage.setItem("devthink.gateway", gateway);
        window.sessionStorage.setItem("devthink.pair.token", result.token);
        window.sessionStorage.setItem("devthink.pair.user", result.userId);
        window.sessionStorage.setItem("devthink.pair.expires", String(result.expiresAt));
        setPaired(true);
        toast("The browser is paired with your local DevThink cli for this session.");
        finish();
      } catch {
        toast(
          "The sync up could not be completed. Confirm the cli gateway is running, the page origin is allowed, and the code has not expired.",
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

  /** the unlock: a pointer swipe up, a wheel up, a click or the enter and
   * space keys lift the lock — the windows gesture family */
  const unlock = useCallback(() => setStage("signin"), []);
  const onlockpointerdown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragstart.current = { y: event.clientY };
  };
  const onlockpointermove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragstart.current) return;
    if (dragstart.current.y - event.clientY > 56) {
      dragstart.current = null;
      unlock();
    }
  };
  const onlockpointerup = () => {
    dragstart.current = null;
  };
  const onlockkeydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " " || event.key === "ArrowUp") {
      event.preventDefault();
      unlock();
    }
  };

  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
  const initials = (known || name).trim().charAt(0).toUpperCase();

  return (
    <main className="dtw-login">
      <div className="dtw-login__stage" aria-hidden="true" />
      <ShellChrome />

      {stage === "lock" ? (
        <div
          className="dtw-login__clock"
          role="button"
          tabIndex={0}
          aria-label="Unlock"
          onPointerDown={onlockpointerdown}
          onPointerMove={onlockpointermove}
          onPointerUp={onlockpointerup}
          onPointerCancel={onlockpointerup}
          onClick={unlock}
          onKeyDown={onlockkeydown}
          onWheel={unlock}
        >
          <span className="dtw-login__time">{time}</span>
          <span className="dtw-login__date">{date}</span>
          <span className="dtw-login__hint">
            <ChevronUpRegular fontSize={18} aria-hidden="true" />
            Swipe up to unlock
          </span>
        </div>
      ) : (
        <div className="dtw-login__dock">
          <section className="dtw-login__pane" aria-label="Sign in to DevThink">
            {initials ? (
              <span className="dtw-login__avatar" aria-hidden="true">
                {initials}
              </span>
            ) : (
              <span className="dtw-login__avatar" aria-hidden="true">
                <SolLogoMark size={44} />
              </span>
            )}
            <h1 className="dtw-login__welcome">{known ? `Welcome, ${known}` : "Welcome"}</h1>
            <input
              ref={nameRef}
              className="dtw-login__name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your display name"
              maxLength={40}
              autoComplete="nickname"
              spellCheck={false}
              aria-label="Display name"
            />
            <button
              type="button"
              className="dtw-login__submit"
              disabled={busy}
              aria-busy={busy || undefined}
              onClick={() => void enterLocal(name)}
            >
              <span>{paired ? "Go to the panel" : "Sign in"}</span>
              <ArrowRightRegular fontSize={15} aria-hidden="true" />
            </button>
            <div className="dtw-login__actions">
              <button
                type="button"
                className="dtw-login__quiet"
                disabled={busy}
                onClick={() => setCliopen((open) => !open)}
              >
                <WindowConsoleRegular fontSize={15} aria-hidden="true" />
                Sign in with the cli
              </button>
              {cliopen ? (
                <form
                  className="dtw-login__pairing"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void consumePairing(gateway, pairingId, code);
                  }}
                >
                  <input
                    value={gateway}
                    onChange={(event) => setGateway(event.target.value)}
                    placeholder="http://127.0.0.1:8787"
                    autoComplete="off"
                    aria-label="Gateway endpoint"
                    spellCheck={false}
                  />
                  <input
                    value={pairingId}
                    onChange={(event) => setPairingId(event.target.value)}
                    placeholder="pair id"
                    autoComplete="off"
                    aria-label="Pairing id"
                    spellCheck={false}
                  />
                  <input
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    placeholder="8-char code"
                    maxLength={8}
                    autoComplete="one-time-code"
                    aria-label="Access code"
                  />
                  <button type="submit" className="dtw-login__submit" disabled={busy}>
                    <span>{paired ? "Renew the pairing" : "Sync up with the cli"}</span>
                    <ArrowRightRegular fontSize={14} aria-hidden="true" />
                  </button>
                  <small className="dtw-login__hinttext">
                    {readiness.ready
                      ? "All fields present, the invitation can also arrive as a link"
                      : `Still needed: ${readiness.missing.join(", ")}`}
                  </small>
                </form>
              ) : null}
            </div>
            <ul className="dtw-login__ledger">
              <li>Local-first identity</li>
              <li>CLI pairing opt-in</li>
              <li>No telemetry</li>
            </ul>
            <button type="button" className="dtw-login__quiet" onClick={unlock}>
              Back to the clock
            </button>
          </section>
        </div>
      )}

      <Link
        href="/explore"
        className="dtw-login__quiet"
        style={{ position: "absolute", zIndex: 40, top: 16, left: 16 }}
      >
        Back to explore
      </Link>
    </main>
  );
}
