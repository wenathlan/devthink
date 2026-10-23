/**
 * auth page anchor — layer 3 of the anchor architecture. The file carrying
 * the folder's own name is the path manager of the page: it keeps ONLY the
 * stage orchestration — the lock -> signin state machine, the account
 * contract of the root accountgate.ts, the invitation params and the
 * navigation after the auth — and mounts the loose components that live
 * in Sol/components. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 *
 * Sign in — the windows 11 sequence: the lock face first (the big clock
 * on the LEFT side, the owner's law, the hint at the bottom), then the
 * sign-in face over the dimmed, blurred wallpaper. The face runs the
 * account contract of the root accountgate.ts: a machine without an
 * account asks for the display name and the password creation (the salted
 * digest lands in the credential vault of the local database — the os
 * HD), a machine with one asks for the password alone and answers the
 * wrong-try verdict inline. The provider row — continue with devthink
 * over google, github and gitlab (the bots are ready on the owner
 * accounts, the client ids ride the env, the single callback page
 * detects the origin by state) — rides the face under the password well;
 * the sign-in options open the cli pairing; the identity logic never
 * moved.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { ACCOUNT_NAME_KEY, type AccountState, accountstate, createAccount, verifyAccount } from "../../accountgate.ts";
import { afterAuthTarget, pairingReadiness, safegatewayurl } from "../../authgate.ts";
import { copy, loadcopy } from "../../copy.ts";
import {
  type OAuthProvider,
  buildAuthorizeUrl,
  mintPkcePair,
  newOAuthState,
  oauthVerifierKey,
  providerRow,
} from "../../oauthrow.ts";
import { readBrowserPreferences } from "../../db";
import { LockFace } from "../components/auth.lockface.tsx";
import { PowerMenu } from "../components/auth.powermenu.tsx";
import { SignInForm, type SignInEntryFields } from "../components/auth.signin.tsx";
import { StatusLine } from "../components/auth.statusline.tsx";

export * from "../../accountgate.ts";
export * from "../../authgate.ts";
export * from "../components/auth.lockface.tsx";
export * from "../components/auth.pairing.tsx";
export * from "../components/auth.powermenu.tsx";
export * from "../components/auth.providerrow.tsx";
export * from "../components/auth.signin.tsx";
export * from "../components/auth.statusline.tsx";

type PairingResponse = { token: string; userId: string; expiresAt: number };

/** The authentication page-app served at /auth: the lock clock first, the
 * sign-in face behind the unlock. */
export default function Auth() {
  const [, navigate] = useLocation();
  const invitation = useRef(new URLSearchParams(window.location.search));
  const [stage, setStage] = useState<"lock" | "signin">("lock");
  const [account, setAccount] = useState<AccountState>("absent");
  const [known, setKnown] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [gateway, setGateway] = useState(() => invitation.current.get("gateway") || "");
  const [pairingId, setPairingId] = useState(() => invitation.current.get("pair") || "");
  const [code, setCode] = useState(() => invitation.current.get("code")?.toUpperCase() || "");
  const [paired, setPaired] = useState(() => Boolean(window.sessionStorage.getItem("devthink.pair.token")));
  const [cliopen, setCliopen] = useState(() => Boolean(invitation.current.get("pair")));
  const [, setCopylive] = useState(false);
  const [oauthbusy, setOauthbusy] = useState(false);

  // the account contract of this machine's HD: whether the password exists
  // and the display name the face greets
  useEffect(() => {
    void Promise.all([accountstate(), readBrowserPreferences()])
      .then(([state, preferences]) => {
        setAccount(state);
        setKnown((preferences[ACCOUNT_NAME_KEY] ?? "").trim());
      })
      .catch(() => undefined);
  }, []);

  // the copy store arms on mount: the row words ride the live db rows when
  // the platform answered, the build seed otherwise
  useEffect(() => {
    void loadcopy().then(() => setCopylive(true));
  }, []);

  const finish = useCallback(() => {
    navigate(afterAuthTarget(window.location.search));
  }, [navigate]);

  /** the first entry: the account is created on this machine's HD (name +
   * password digest) and the desktop hands over */
  const createEntry = useCallback(async () => {
    const display = name.trim();
    if (!display) return setFailure("Choose the display name of this account.");
    if (password.length < 4) return setFailure("The password needs at least 4 characters.");
    if (password !== confirm) return setFailure("The passwords don't match. Try again.");
    setBusy(true);
    setFailure("");
    try {
      await createAccount(display, password);
      finish();
    } catch {
      setFailure("The account could not be saved on this machine.");
    } finally {
      setBusy(false);
    }
  }, [confirm, finish, name, password]);

  /** the returning entry: the password is verified against this machine's
   * verifier — the wrong try answers inline, never a navigation */
  const passwordEntry = useCallback(async () => {
    if (!password) return setFailure("Enter the password of this account.");
    setBusy(true);
    setFailure("");
    try {
      if (await verifyAccount(password)) return finish();
      setFailure("The password is incorrect. Try again.");
    } catch {
      setFailure("The sign in could not be completed on this machine.");
    } finally {
      setBusy(false);
    }
  }, [finish, password]);

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
          body: JSON.stringify({ pairingId: pairingIdValue, code: pairingCode }) });
        if (!response.ok) throw new Error("Pairing was rejected.");
        const result = (await response.json()) as PairingResponse;
        // the exact keys the creation panel reads on boot
        window.sessionStorage.setItem("devthink.gateway", gateway);
        window.sessionStorage.setItem("devthink.pair.token", result.token);
        window.sessionStorage.setItem("devthink.pair.user", result.userId);
        window.sessionStorage.setItem("devthink.pair.expires", String(result.expiresAt));
        setPaired(true);
        toast("DevThink is paired with your local CLI.");
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

  /** the provider row entry: a ready provider starts the oauth round trip —
   * the state minted, the pkce verifier parked for the exchange, the
   * browser handed the authorize url. Unconfigured providers never reach
   * here (the row renders them disabled with the honest note). */
  const beginOAuth = useCallback(async (provider: OAuthProvider) => {
    const entry = providerRow().providers.find((candidate) => candidate.provider === provider);
    if (!entry?.ready) return;
    setOauthbusy(true);
    try {
      const state = newOAuthState(provider);
      const pair = await mintPkcePair();
      try {
        window.sessionStorage.setItem(oauthVerifierKey(provider), pair.verifier);
      } catch {
        /* storage unavailable: the verifier stays unparked, the exchange
           answers honestly when the gateway wave lands */
      }
      window.location.assign(buildAuthorizeUrl(provider, state, pair.challenge));
    } catch {
      setOauthbusy(false);
      toast(copy("auth.oauth.failed"));
    }
  }, []);

  // an invitation link (?gateway&pair&code) consumes itself, exactly like
  // the panel does when the invitation lands there: the paired guard makes
  // the effect idempotent, a rejection simply waits for the next edit
  useEffect(() => {
    if (paired) return;
    if (!gateway.trim() || !pairingId.trim() || code.trim().length !== 8) return;
    void consumePairing(gateway, pairingId, code);
  }, [code, consumePairing, gateway, paired, pairingId]);

  const readiness = pairingReadiness({ gatewayUrl: gateway, pairingId, code });
  const oauthrow = providerRow();

  /** the unlock: the lock face component owns the gesture family (the
   * swipe, the click, the wheel, the keys) — the stage machine only
   * answers */
  const unlock = useCallback(() => setStage("signin"), []);

  const submitEntry = account === "ready" ? passwordEntry : createEntry;

  /** the entry bundle of the sign-in face: the anchor owns the state, the
   * face is a controlled surface */
  const entry: SignInEntryFields = {
    name,
    password,
    confirm,
    failure,
    busy,
    reveal,
    onNameChange: setName,
    onPasswordChange: setPassword,
    onConfirmChange: setConfirm,
    onToggleReveal: () => setReveal((open) => !open),
    submit: () => void submitEntry(),
  };

  return (
    <main className={`dtw-login${stage === "signin" ? " dtw-login--signin" : ""}`}>
      <div className="dtw-login__stage" aria-hidden="true" />

      {stage === "lock" ? (
        <LockFace onUnlock={unlock} />
      ) : (
        <SignInForm
          account={account}
          known={known}
          entry={entry}
          pairing={{
            gateway,
            pairingId,
            code,
            readiness,
            busy,
            onGatewayChange: setGateway,
            onPairingIdChange: setPairingId,
            onCodeChange: setCode,
            onConsume: () => void consumePairing(gateway, pairingId, code),
          }}
          cliopen={cliopen}
          onToggleCli={() => setCliopen((open) => !open)}
          oauth={{ row: oauthrow, busy: oauthbusy, onBegin: (provider) => void beginOAuth(provider) }}
          onBack={() => setStage("lock")}
        />
      )}

      {/* the windows corners: the live network status rides the bottom
          left, the power flyout the bottom right — both faces, like the
          lock screen of the real system */}
      <StatusLine />
      <PowerMenu />
    </main>
  );
}
