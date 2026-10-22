/**
 * callback page anchor — layer 3 of the anchor architecture. The file
 * carrying the folder's own name is the path manager of the page: it
 * imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx)
 * consumes this file.
 *
 * The single callback page of the provider row — one page for all
 * providers: the person signs in with google, github or gitlab (the bots
 * are ready on the owner accounts) and the provider answers back here,
 * where the state marker names the origin (detectProviderFromState of the
 * root oauthrow.ts). The page renders the honest verdict of the url
 * params, never more: an error param answers the error face, a code with
 * a recognizable origin answers the receiving face — devthink received
 * the provider sign in, the token exchange lands with the gateway wave,
 * no fake success and no invented user — and anything else answers the
 * unknown-origin face. Every word the page renders rides the copy store
 * (copy.ts): the component carries no text.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { copy, loadcopy } from "../../copy.ts";
import { detectProviderFromState } from "../../oauthrow.ts";

/** The sign-in callback page served at /callback: the receiving face of
 * every provider round trip, the honest verdict of the url params. */
export default function Callback() {
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const [, setCopylive] = useState(false);

  // the copy store arms on mount: the db rows answer when the platform is
  // reachable, the build seed otherwise
  useEffect(() => {
    void loadcopy().then(() => setCopylive(true));
  }, []);

  const error = params.get("error");
  const code = params.get("code");
  const state = params.get("state");
  const provider = detectProviderFromState(state);

  return (
    <main className="dt-callback">
      <section className="dt-callback__card" aria-label={copy("callback.title")}>
        <p className="dt-callback__eyebrow">{copy("callback.title")}</p>
        {error ? (
          <>
            <h1 className="dt-callback__headline">{copy("callback.error")}</h1>
            <p className="dt-callback__note">{copy("callback.error.note")}</p>
            <code className="dt-callback__raw">{error}</code>
          </>
        ) : code && provider ? (
          <>
            <h1 className="dt-callback__headline">{copy("callback.received").replace("{provider}", provider)}</h1>
            <p className="dt-callback__note">{copy("callback.received.note")}</p>
            <code className="dt-callback__raw">state · {state}</code>
          </>
        ) : (
          <>
            <h1 className="dt-callback__headline">{copy("callback.unknown")}</h1>
            <p className="dt-callback__note">{copy("callback.unknown.note")}</p>
          </>
        )}
        <nav className="dt-callback__links">
          <Link href="/auth" className="dt-callback__link">
            {copy("callback.back.auth")}
          </Link>
          <Link href="/panel" className="dt-callback__link">
            {copy("callback.back.panel")}
          </Link>
        </nav>
      </section>
    </main>
  );
}
