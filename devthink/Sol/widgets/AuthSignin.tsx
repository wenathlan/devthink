/**
 * signin.tsx — the sign-in face of the auth sequence, the second face
 * of the windows sequence: the dimmed, blurred mica wallpaper behind the
 * split sign-in card and NOTHING else — the akash grammar the owner
 * pointed to (the visual panel carrying the brand and the rotating value
 * slides, the form panel carrying the account contract) wearing the
 * windows material of the house: the mica ring, the ever gradient, the
 * fluent glyphs, zero indigo, zero lucide, zero dots.
 *
 * The form speaks the account contract of the root account.ts
 * through the anchor's controlled props: a machine without an account
 * asks for the display name and the password creation, a machine with
 * one asks for the password alone and answers the wrong-try verdict
 * inline. The password well keeps the windows grammar: one rounded cell
 * carrying the input, the reveal eye and the arrow submit riding inside
 * it. Below the well: the provider row (continue with google, github,
 * gitlab and the cli pairing button under the same simple grammar — one
 * button, zero manual configuration). Every string rides the copy
 * catalog (the seed of copy.ts is the one place literals live). Loose
 * component of the auth page, riding the dtw-login kit of sol.css.
 */
import { ArrowRightRegular, EyeOffRegular, EyeRegular, PersonRegular } from "@fluentui/react-icons";
import { useEffect, useRef, useState } from "react";
import type { AccountState } from "../../account.ts";
import { copy } from "../../copy.ts";
import { ProviderRow, type ProviderRowProps } from "./AuthProviderrow.tsx";
import { SolLogoMark, SolWordmark } from "./PanelLogo.tsx";

/** the rotation law of the visual panel: one slide rides 7 seconds, the
 * crossfade walks the house micro curve, and reduced motion parks the
 * rotation on the first slide (the honest still). */
const SLIDE_KEYS = ["auth.slide.1", "auth.slide.2", "auth.slide.3"] as const;
const SLIDEMS = 7000;

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
  /** the provider row bundle (see providerrow). */
  oauth: ProviderRowProps;
}

/** SignInForm — the split sign-in card over the dimmed, blurred mica
 * wallpaper: the visual panel (the brand, the rotating value slides, the
 * slide rails) beside the form panel (the avatar, the welcome, the
 * windows password well, the provider row with the cli button). The
 * password field takes focus as the face reveals (the 320ms ride the
 * entrance curve of the card). */
export function SignInForm({ account, known, entry, oauth }: SignInFormProps) {
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [slide, setSlide] = useState(0);
  const [still, setStill] = useState(false);

  // the password field takes focus as the sign-in face reveals — the
  // component mounts exactly when the stage machine lifts the lock
  useEffect(() => {
    const timer = window.setTimeout(() => passwordRef.current?.focus(), 320);
    return () => window.clearTimeout(timer);
  }, []);

  // the slide rotation rides its own clock; the reduced-motion preference
  // parks it on the first slide (the still face never animates)
  useEffect(() => {
    if (still) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % SLIDE_KEYS.length), SLIDEMS);
    return () => window.clearInterval(timer);
  }, [still]);

  const initials = (known || entry.name).trim().charAt(0).toUpperCase();
  const greeting = known ? copy("auth.signin.welcome.named").replace("{name}", known) : copy("auth.signin.welcome");

  return (
    <div className="dtw-login__dock">
      <section className="dtw-login__card" aria-label={copy("auth.signin.aria")}>
        <div className="dtw-login__visual" aria-hidden="true" data-still={still ? "true" : "false"}>
          <div className="dtw-login__visualbrand">
            <SolLogoMark size={30} />
            <SolWordmark height={18} />
          </div>
          <div className="dtw-login__slides">
            {SLIDE_KEYS.map((key, index) => (
              <div key={key} className="dtw-login__slide" data-active={index === slide ? "true" : "false"}>
                <h2 className="dtw-login__slidetitle">{copy([key, "title"].join("."))}</h2>
                <p className="dtw-login__slidesub">{copy([key, "subtitle"].join("."))}</p>
              </div>
            ))}
          </div>
          <div className="dtw-login__sliderails" aria-hidden="true">
            {SLIDE_KEYS.map((key, index) => (
              <button
                key={key}
                type="button"
                className="dtw-login__sliderail"
                data-active={index === slide ? "true" : "false"}
                tabIndex={-1}
                aria-hidden="true"
                onClick={() => {
                  setSlide(index);
                  setStill(true);
                }}
              />
            ))}
          </div>
          <span className="dtw-login__visualtag">{copy("auth.brand.tagline")}</span>
        </div>

        <div className="dtw-login__pane">
          <span className="dtw-login__avatar" aria-hidden="true">
            {initials ? initials : <PersonRegular fontSize={44} aria-hidden="true" />}
          </span>
          <h1 className="dtw-login__welcome">{account === "ready" ? greeting : copy("auth.signin.create")}</h1>
          {account === "ready" ? null : <p className="dtw-login__lede">{copy("auth.signin.create.lede")}</p>}

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
                  placeholder={copy("auth.signin.password")}
                  autoComplete="current-password"
                  aria-label={copy("auth.signin.password")}
                />
                <button
                  type="button"
                  className="dtw-login__reveal"
                  aria-label={entry.reveal ? copy("auth.signin.reveal.hide") : copy("auth.signin.reveal.show")}
                  aria-pressed={entry.reveal}
                  onClick={entry.onToggleReveal}
                >
                  {entry.reveal ? (
                    <EyeOffRegular fontSize={16} aria-hidden="true" />
                  ) : (
                    <EyeRegular fontSize={16} aria-hidden="true" />
                  )}
                </button>
                <button
                  type="submit"
                  className="dtw-login__submit"
                  disabled={entry.busy}
                  aria-busy={entry.busy || undefined}
                  aria-label={copy("auth.signin.submit")}
                >
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
                  placeholder={copy("auth.signin.name")}
                  maxLength={40}
                  autoComplete="nickname"
                  spellCheck={false}
                  aria-label={copy("auth.signin.name")}
                />
              </div>
              <div className="dtw-login__row">
                <input
                  ref={passwordRef}
                  className="dtw-login__name"
                  type={entry.reveal ? "text" : "password"}
                  value={entry.password}
                  onChange={(event) => entry.onPasswordChange(event.target.value)}
                  placeholder={copy("auth.signin.password.create")}
                  autoComplete="new-password"
                  aria-label={copy("auth.signin.password.create")}
                />
                <button
                  type="button"
                  className="dtw-login__reveal"
                  aria-label={entry.reveal ? copy("auth.signin.reveal.hide") : copy("auth.signin.reveal.show")}
                  aria-pressed={entry.reveal}
                  onClick={entry.onToggleReveal}
                >
                  {entry.reveal ? (
                    <EyeOffRegular fontSize={16} aria-hidden="true" />
                  ) : (
                    <EyeRegular fontSize={16} aria-hidden="true" />
                  )}
                </button>
              </div>
              <div className="dtw-login__row">
                <input
                  className="dtw-login__name"
                  type={entry.reveal ? "text" : "password"}
                  value={entry.confirm}
                  onChange={(event) => entry.onConfirmChange(event.target.value)}
                  placeholder={copy("auth.signin.password.confirm")}
                  autoComplete="new-password"
                  aria-label={copy("auth.signin.password.confirm")}
                />
              </div>
              {entry.failure ? (
                <p className="dtw-login__failure" role="alert">
                  {entry.failure}
                </p>
              ) : null}
              <button
                type="submit"
                className="dtw-login__create"
                disabled={entry.busy}
                aria-busy={entry.busy || undefined}
              >
                <span>{copy("auth.signin.create.submit")}</span>
                <ArrowRightRegular fontSize={15} aria-hidden="true" />
              </button>
            </form>
          )}

          <ProviderRow {...oauth} />
        </div>
      </section>
    </div>
  );
}
