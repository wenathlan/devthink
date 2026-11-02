/**
 * HomeSignupgate.tsx — the signup gate of the product face: the person's
 * door onto the network database (the wave D rewire). The form rides the
 * engine door client (vaultclient — the face calls its own api): signup,
 * register an app database, and the vault answers the database id with the
 * api key shown exactly once — the key lives in this component's memory for
 * the one display and drops with the session, never localStorage, never a
 * cookie, never a log (the security law). The store keeps only the salted
 * password digest and the sha-256 key digest; the rehearsal law holds: when
 * the engine lane is away (no configured origin) the gate says so honestly
 * and the cta waits. Every word rides the ui store, every input the silk
 * chrome of the family.
 */

import { useState } from "react";
import { uicopy, uicopyfill } from "../../uistore.ts";
import { vaultclient, vaultorigin } from "../../vaultclient.ts";

/** the shown-once answer the gate holds in memory (the one display). */
interface OnceAnswer {
  databaseId: string;
  key: string;
  keyId: string;
}

/**
 * The signup gate of the vault.
 *
 * @returns the gate element (the form, or the shown-once display).
 */
export function Signupgate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [once, setOnce] = useState<OnceAnswer | null>(null);
  const [copied, setCopied] = useState(false);
  const away = vaultorigin() === "";

  /** opens the database: signup (idempotent on a taken email), register,
   * and the shown-once answer lands in memory alone. */
  const open = async () => {
    if (busy || away || once !== null) return;
    setBusy(true);
    setFailure(null);
    setCopied(false);
    const client = vaultclient();
    const signup = await client.signup(email, password);
    if (!signup.ok) {
      setFailure(signup.message);
      setBusy(false);
      return;
    }
    const register = await client.registerDatabase({ email, password, name });
    if (!register.ok) {
      setFailure(register.message);
      setBusy(false);
      return;
    }
    setOnce({ databaseId: register.database.id, key: register.key, keyId: register.keyId });
    setBusy(false);
  };

  /** copies the shown-once key at the person's word (their own clipboard,
   * their own choice — the vault cannot show it again). */
  const copy = async () => {
    if (once === null || copied) return;
    try {
      await navigator.clipboard.writeText(once.key);
      setCopied(true);
    } catch {
      /* the clipboard refused — the key stays on the screen for the person's eyes */
    }
  };

  return (
    <section className="vc-console" aria-label={uicopy("face.signup.aria")}>
      <header className="vc-panel__head">
        <h3 className="vc-panel__title">{uicopy("face.signup.head")}</h3>
      </header>
      <div className="vc-console__pane" role="form" aria-label={uicopy("face.signup.lede")}>
        <p className="vc-console__caption">{uicopy("face.signup.lede")}</p>
        {once === null ? (
          <>
            <label className="vc-cell__name" htmlFor="vc-signup-email">
              {uicopy("face.signup.email")}
            </label>
            <input
              id="vc-signup-email"
              className="silk-input"
              type="email"
              autoComplete="email"
              aria-label={uicopy("face.signup.emailAria")}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <label className="vc-cell__name" htmlFor="vc-signup-password">
              {uicopy("face.signup.password")}
            </label>
            <input
              id="vc-signup-password"
              className="silk-input"
              type="password"
              autoComplete="new-password"
              aria-label={uicopy("face.signup.passwordAria")}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <label className="vc-cell__name" htmlFor="vc-signup-name">
              {uicopy("face.signup.name")}
            </label>
            <input
              id="vc-signup-name"
              className="silk-input"
              type="text"
              aria-label={uicopy("face.signup.nameAria")}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <button type="button" className="silk-btn" onClick={() => void open()} disabled={busy || away}>
              {busy ? uicopy("face.signup.busy") : uicopy("face.signup.cta")}
            </button>
            {away ? <p className="vc-console__line">{uicopy("face.signup.away")}</p> : null}
            {failure !== null ? (
              <p className="vc-console__line">{uicopyfill("face.signup.failure", { message: failure })}</p>
            ) : null}
          </>
        ) : (
          <>
            <p className="vc-console__caption">{uicopy("face.signup.once.title")}</p>
            <p className="vc-console__line vc-console__line--live">{uicopy("face.signup.once.warning")}</p>
            <p className="vc-console__line">
              <span className="vc-cell__name">{uicopy("face.signup.once.databaseId")}</span>{" "}
              <span className="vc-cell__path">{once.databaseId}</span>
            </p>
            <p className="vc-console__line">
              <span className="vc-cell__name">{uicopy("face.signup.once.key")}</span>{" "}
              <span className="vc-cell__path">{once.key}</span>
            </p>
            <button type="button" className="silk-btn" onClick={() => void copy()}>
              {copied ? uicopy("face.signup.once.copied") : uicopy("face.signup.once.copy")}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default Signupgate;
