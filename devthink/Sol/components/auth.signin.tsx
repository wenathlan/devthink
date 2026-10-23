/**
 * signin.tsx — the sign-in face of the auth sequence, the second face
 * of the windows sequence: the dimmed, blurred wallpaper behind a
 * centered column and NOTHING else — no cards, no panels, no marketing.
 * The column speaks the account contract of the root accountgate.ts
 * through the anchor's controlled props: a machine without an account
 * asks for the display name and the password creation, a machine with
 * one asks for the password alone and answers the wrong-try verdict
 * inline. The password well speaks the windows grammar: one rounded cell
 * carrying the input, the reveal eye and the arrow submit riding inside
 * it. Below the well: the provider row (continue with devthink over
 * google, github and gitlab) and the sign-in options disclosure with the
 * cli pairing. Loose component of the auth page, riding the dtw-login
 * kit of sol.css.
 */
import {
  ArrowRightRegular,
  EyeOffRegular,
  EyeRegular,
  PersonRegular,
  WindowConsoleRegular,
} from "@fluentui/react-icons";
import { useEffect, useRef } from "react";
import { type AccountState } from "../../accountgate.ts";
import { PairingForm, type PairingFormProps } from "./auth.pairing.tsx";
import { ProviderRow, type ProviderRowProps } from "./auth.providerrow.tsx";

/** the entry bundle: the credential fields of the face, controlled by the
 * anchor — the stage machine owns the state, this is a controlled face,
 * the identity logic never moved. */
export interface SignInEntryFields {
  /** the display name of the account being created. */
  name: string;
  /** the password of the entry (or of the creation). */
  password: string;
  /** the password confirmation of the creation. */
  confirm: string;
  /** the inline wrong-try verdict, "" when the face is calm. */
  failure: string;
  /** an entry is running: every control freezes while it lasts. */
  busy: boolean;
  /** the password reveal is open. */
  reveal: boolean;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  onToggleReveal: () => void;
  /** the submit: the account contract answers (create or verify). */
  submit: () => void;
}

export interface SignInFormProps {
  /** the account contract verdict of this machine's HD. */
  account: AccountState;
  /** the display name the face greets ("" before the HD answers). */
  known: string;
  entry: SignInEntryFields;
  /** the cli pairing fields and the consume contract (see auth.pairing). */
  pairing: PairingFormProps;
  /** the cli pairing disclosure is open. */
  cliopen: boolean;
  onToggleCli: () => void;
  /** the provider row bundle (see providerrow). */
  oauth: ProviderRowProps;
  /** back to the lock clock. */
  onBack: () => void;
}

/** SignInForm — the sign-in face over the dimmed, blurred wallpaper: the
 * centered avatar, the welcome, the windows password well, the provider
 * row, the sign-in options and the way back to the clock. The password
 * field takes focus as the face reveals (the 320ms ride the entrance
 * curve of the column). */
export function SignInForm({ account, known, entry, pairing, cliopen, onToggleCli, oauth, onBack }: SignInFormProps) {
  const passwordRef = useRef<HTMLInputElement | null>(null);

  // the password field takes focus as the sign-in face reveals — the
  // component mounts exactly when the stage machine lifts the lock
  useEffect(() => {
    const timer = window.setTimeout(() => passwordRef.current?.focus(), 320);
    return () => window.clearTimeout(timer);
  }, []);

  const initials = (known || entry.name).trim().charAt(0).toUpperCase();
  const greeting = known ? `Welcome, ${known}` : "Welcome";

  return (
    <div className="dtw-login__dock">
      <section className="dtw-login__pane" aria-label="Sign in to DevThink">
        <span className="dtw-login__avatar" aria-hidden="true">
          {initials ? initials : <PersonRegular fontSize={44} aria-hidden="true" />}
        </span>
        <h1 className="dtw-login__welcome">{account === "ready" ? greeting : "Create your account"}</h1>

        {account === "ready" ? (
          <form
            className="dtw-login__fields"
            onSubmit={(event) => {
              event.preventDefault();
              entry.submit();
            }}
          >
            <div className="dtw-login__row">
              <input
                ref={passwordRef}
                className="dtw-login__name"
                type={entry.reveal ? "text" : "password"}
                value={entry.password}
                onChange={(event) => entry.onPasswordChange(event.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                aria-label="Password"
              />
              <button
                type="button"
                className="dtw-login__reveal"
                aria-label={entry.reveal ? "Hide the password" : "Show the password"}
                aria-pressed={entry.reveal}
                onClick={entry.onToggleReveal}
              >
                {entry.reveal ? <EyeOffRegular fontSize={16} aria-hidden="true" /> : <EyeRegular fontSize={16} aria-hidden="true" />}
              </button>
              <button type="submit" className="dtw-login__submit" disabled={entry.busy} aria-busy={entry.busy || undefined} aria-label="Sign in">
                <ArrowRightRegular fontSize={17} aria-hidden="true" />
              </button>
            </div>
            {entry.failure ? (
              <p className="dtw-login__failure" role="alert">
                {entry.failure}
              </p>
            ) : null}
          </form>
        ) : (
          <form
            className="dtw-login__fields"
            onSubmit={(event) => {
              event.preventDefault();
              entry.submit();
            }}
          >
            <div className="dtw-login__row">
              <input
                className="dtw-login__name"
                value={entry.name}
                onChange={(event) => entry.onNameChange(event.target.value)}
                placeholder="Your display name"
                maxLength={40}
                autoComplete="nickname"
                spellCheck={false}
                aria-label="Display name"
              />
            </div>
            <div className="dtw-login__row">
              <input
                ref={passwordRef}
                className="dtw-login__name"
                type={entry.reveal ? "text" : "password"}
                value={entry.password}
                onChange={(event) => entry.onPasswordChange(event.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
                aria-label="Create a password"
              />
              <button
                type="button"
                className="dtw-login__reveal"
                aria-label={entry.reveal ? "Hide the password" : "Show the password"}
                aria-pressed={entry.reveal}
                onClick={entry.onToggleReveal}
              >
                {entry.reveal ? <EyeOffRegular fontSize={16} aria-hidden="true" /> : <EyeRegular fontSize={16} aria-hidden="true" />}
              </button>
            </div>
            <div className="dtw-login__row">
              <input
                className="dtw-login__name"
                type={entry.reveal ? "text" : "password"}
                value={entry.confirm}
                onChange={(event) => entry.onConfirmChange(event.target.value)}
                placeholder="Confirm the password"
                autoComplete="new-password"
                aria-label="Confirm the password"
              />
            </div>
            {entry.failure ? (
              <p className="dtw-login__failure" role="alert">
                {entry.failure}
              </p>
            ) : null}
            <button type="submit" className="dtw-login__create" disabled={entry.busy} aria-busy={entry.busy || undefined}>
              <span>Create account and sign in</span>
              <ArrowRightRegular fontSize={15} aria-hidden="true" />
            </button>
          </form>
        )}

        <ProviderRow {...oauth} />

        <div className="dtw-login__actions">
          <button
            type="button"
            className="dtw-login__quiet"
            disabled={entry.busy}
            aria-expanded={cliopen}
            onClick={onToggleCli}
          >
            <WindowConsoleRegular fontSize={15} aria-hidden="true" />
            Sign-in options
          </button>
          {cliopen ? <PairingForm {...pairing} /> : null}
        </div>
        <button type="button" className="dtw-login__quiet" onClick={onBack}>
          Back to the clock
        </button>
      </section>
    </div>
  );
}
