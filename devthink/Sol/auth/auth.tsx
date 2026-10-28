/**
 * auth page anchor — layer 3 of the anchor architecture. The file carrying
 * the folder's own name is the path manager of the page: it keeps ONLY the
 * stage orchestration — the lock -> signin state machine, the account
 * contract of the root accountgate.ts, the invitation params and the
 * navigation after the auth — and mounts the loose components that live
 * in Sol/widgets. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 *
 * Sign in — the windows 11 sequence: the lock face first (the big clock
 * on the LEFT side, the owner's law, the hint at the bottom), then the
 * sign-in face over the dimmed, blurred wallpaper. The face rides the
 * REAL account lane first (accountclient.ts over the server account
 * routes): the creation and the password entry land on the server, the
 * family session covers every device of the family deploy. The local
 * accountgate of the root accountgate.ts stays as the DECLARED offline
 * fallback only — the honest offline row names it when the lane never
 * answered. The provider row — continue with google and github
 * wearing the official brand marks, plus the cli pairing button under
 * the same simple grammar (one button, zero manual configuration: the
 * invitation link consumes itself, the honest note answers a plain
 * click) — rides the face under the password well; the identity logic
 * never moved.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  ACCOUNT_NAME_KEY,
  type AccountState,
  accountstate,
  buildAuthorizeUrl,
  createAccount,
  createserveraccount,
  mintPkcePair,
  newOAuthState,
  normalizeaccountowner,
  type OAuthProvider,
  oauthVerifierKey,
  parklocalunlock,
  providerRow,
  restoreonce,
  saveaccountsession,
  signinserveraccount,
  storedaccountowner,
  verifyAccount,
} from "../../account.ts";
import { copy, loadcopy } from "../../copy.ts";
import { afterAuthTarget, pairingReadiness, safegatewayurl } from "../../gateway.ts";
import { readBrowserPreferences } from "../../storage.ts";
import { LockFace, PowerMenu, type SignInEntryFields, SignInForm, StatusLine } from "../widgets";

export * from "../../account.ts";
export * from "../../gateway.ts";
export * from "../widgets";

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
  // the invitation params ride the url once — the auto-consume effect and
  // the cli button read them, the manual form is gone so the states never
  // change after mount
  const gateway = invitation.current.get("gateway") || "";
  const pairingId = invitation.current.get("pair") || "";
  const code = (invitation.current.get("code") || "").toUpperCase();
  const [paired, setPaired] = useState(() => Boolean(window.sessionStorage.getItem("devthink.pair.token")));
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

  // the persistent family session: the server cookie restores the sign in
  // without asking again — a live lane answer walks the face straight in
  useEffect(() => {
    void restoreonce().then((restored) => {
      if (restored) finish();
    });
  }, [finish]);

  /**
   * the first entry: the account is created on the SERVER when the lane
   * answers — the real account of the family, the session issued in the
   * same answer. A taken owner with a matching secret signs in. When the
   * lane never answers, the local accountgate is the DECLARED offline
   * fallback: the account lands on this machine's HD and the honest
   * offline row says so — no pretending.
   */
  const createEntry = useCallback(async () => {
    const display = name.trim();
    const owner = normalizeaccountowner(display);
    if (!display) return setFailure(copy("auth.signin.failure.choose"));
    if (!owner) return setFailure(copy("auth.signin.failure.name"));
    if (password.length < 4) return setFailure(copy("auth.signin.failure.password"));
    if (password !== confirm) return setFailure(copy("auth.signin.failure.confirm"));
    setBusy(true);
    setFailure("");
    try {
      const verdict = await createserveraccount(owner, password);
      if (verdict.verdict === "ok") {
        saveaccountsession(verdict.session.token, verdict.session.owner);
        finish();
        return;
      }
      if (verdict.verdict === "refused") {
        // the owner may already exist on the server — the same secret signs in
        const signin = await signinserveraccount(owner, password);
        if (signin.verdict === "ok") {
          saveaccountsession(signin.session.token, signin.session.owner);
          finish();
          return;
        }
        if (signin.verdict === "refused") {
          setFailure(copy("auth.signin.failure.taken"));
          return;
        }
      }
      // the lane never answered — the declared offline fallback carries
      // the account on this machine's HD only, and the row says so
      await createAccount(display, password);
      setFailure(copy("auth.account.offline"));
    } catch {
      setFailure(copy("auth.signin.failure.saved"));
    } finally {
      setBusy(false);
    }
  }, [confirm, finish, name, password]);

  /**
   * the returning entry: the password is verified against the SERVER
   * account when the lane answers and an owner handle is known. A refusal
   * answers the wrong-try verdict inline. When the lane never answers,
   * the local accountgate is the declared offline fallback.
   */
  const passwordEntry = useCallback(async () => {
    if (!password) return setFailure(copy("auth.signin.failure.enter"));
    setBusy(true);
    setFailure("");
    try {
      const owner = storedaccountowner() || normalizeaccountowner(known);
      if (owner) {
        const verdict = await signinserveraccount(owner, password);
        if (verdict.verdict === "ok") {
          saveaccountsession(verdict.session.token, verdict.session.owner);
          finish();
          return;
        }
        if (verdict.verdict === "refused") {
          setFailure(copy("auth.signin.failure.incorrect"));
          return;
        }
      }
      // the lane never answered — the declared offline fallback verifies
      // against this machine's HD and parks the session unlock marker the
      // panel gate reads (the honest offline door of the entry chain)
      if (await verifyAccount(password)) {
        parklocalunlock();
        return finish();
      }
      setFailure(copy("auth.signin.failure.incorrect"));
    } catch {
      setFailure(copy("auth.signin.failure.incomplete"));
    } finally {
      setBusy(false);
    }
  }, [finish, known, password]);

  /** the sync up: pairs this browser with the visitor's own local CLI
   * gateway through the exact contract the panel already speaks — the
   * simple button answers the invitation link when one rides the url and
   * the honest note otherwise, zero manual configuration */
  const consumePairing = useCallback(
    async (gatewayUrl: string, pairingIdValue: string, pairingCode: string) => {
      const readiness = pairingReadiness({ gatewayUrl, pairingId: pairingIdValue, code: pairingCode });
      if (!readiness.ready)
        return toast(
          copy("auth.signin.failure.sync")
            .replace("{missing}", readiness.missing.join(", "))
            .replace("{verb}", readiness.missing.length === 1 ? "is" : "are"),
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
        if (!response.ok) throw new Error(copy("auth.cli.rejected"));
        const result = (await response.json()) as PairingResponse;
        // the exact keys the creation panel reads on boot
        window.sessionStorage.setItem("devthink.gateway", gateway);
        window.sessionStorage.setItem("devthink.pair.token", result.token);
        window.sessionStorage.setItem("devthink.pair.user", result.userId);
        window.sessionStorage.setItem("devthink.pair.expires", String(result.expiresAt));
        setPaired(true);
        toast(copy("auth.cli.paired"));
        finish();
      } catch {
        toast(copy("auth.cli.hint"));
      } finally {
        setBusy(false);
      }
    },
    [finish],
  );

  /** the cli button entry: the invitation link consumes itself when its
   * params ride the url, the honest hint answers a plain click — the
   * manual configuration form is gone by the owner order. */
  const pairClick = useCallback(() => {
    if (paired) return toast(copy("auth.cli.paired"));
    if (!gateway.trim() || !pairingId.trim() || code.trim().length !== 8) {
      return toast(copy("auth.cli.hint"));
    }
    void consumePairing(gateway, pairingId, code);
  }, [code, consumePairing, gateway, paired, pairingId]);

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
          oauth={{
            row: oauthrow,
            busy: oauthbusy,
            onBegin: (provider) => void beginOAuth(provider),
            onPair: pairClick,
          }}
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
