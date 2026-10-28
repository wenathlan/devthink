/**
 * callback page anchor — layer 3 of the anchor architecture. The file
 * carrying the folder's own name is the path manager of the page: it
 * imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx)
 * consumes this file.
 *
 * The single callback page of the provider row — one page for all
 * providers: the person signs in with google and github (the bots
 * are ready on the owner accounts) and the provider answers back here,
 * where the state marker names the origin (detectProviderFromState of the
 * root oauthrow.ts). The page COMPLETES the round trip: the code arrival
 * redeems the parked pkce verifier through the gateway wave
 * (exchangeoauthcodeclient of the root account.ts), the family session
 * lands in the account slots, and the honest verdict rows answer — a
 * provider error answers the error face, a completed exchange answers the
 * signed-in face, a lane refusal answers the refused face, a lane that
 * never answered answers the offline face, and anything else answers the
 * unknown-origin face. No fake success and no invented user. Every word
 * the page renders rides the copy store (copy.ts): the component carries
 * no text.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { copy, loadcopy } from "../../copy.ts";
import { detectProviderFromState, exchangeoauthcodeclient, oauthVerifierKey, saveaccountsession } from "../../account.ts";

/** The sign-in callback page served at /callback: the completing face of
 * every provider round trip, the honest verdict of the exchange. */
export default function Callback() {
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const [, setCopylive] = useState(false);
  const [phase, setPhase] = useState<"waiting" | "signedin" | "refused" | "offline">("waiting");
  const [owner, setOwner] = useState("");

  // the copy store arms on mount: the db rows answer when the platform is
  // reachable, the build seed otherwise
  useEffect(() => {
    void loadcopy().then(() => setCopylive(true));
  }, []);

  const error = params.get("error");
  const code = params.get("code");
  const state = params.get("state");
  const provider = detectProviderFromState(state);

  // the exchange effect: the code arrival completes the round trip — the
  // parked pkce verifier redeems at the gateway, the family session lands
  // in the account slots, the parked verifier burns, and the refusal rows
  // answer honestly when the lane refuses or never answered
  useEffect(() => {
    if (error || !code || !provider) return;
    let alive = true;
    const verifier = window.sessionStorage.getItem(oauthVerifierKey(provider)) || "";
    const redirectUri = [window.location.origin, window.location.pathname].join("");
    void exchangeoauthcodeclient(provider, code, verifier, redirectUri).then((verdict) => {
      if (!alive) return;
      if (verdict.verdict === "ok") {
        saveaccountsession(verdict.session.token, verdict.session.owner);
        setOwner(verdict.session.owner);
        try {
          window.sessionStorage.removeItem(oauthVerifierKey(provider));
        } catch {
          /* the parked verifier is best effort */
        }
        setPhase("signedin");
        return;
      }
      setPhase(verdict.verdict === "offline" ? "offline" : "refused");
    });
    return () => {
      alive = false;
    };
  }, [code, error, provider]);

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
          phase === "signedin" ? (
            <>
              <h1 className="dt-callback__headline">{copy("callback.signedin")}</h1>
              <p className="dt-callback__note">{copy("callback.signedin.note")}</p>
              <code className="dt-callback__raw">owner · {owner}</code>
            </>
          ) : phase === "refused" ? (
            <>
              <h1 className="dt-callback__headline">{copy("callback.exchange.refused")}</h1>
              <p className="dt-callback__note">{copy("callback.exchange.refused.note")}</p>
            </>
          ) : phase === "offline" ? (
            <>
              <h1 className="dt-callback__headline">{copy("callback.exchange.offline")}</h1>
              <p className="dt-callback__note">{copy("callback.exchange.offline.note")}</p>
            </>
          ) : (
            <>
              <h1 className="dt-callback__headline">{copy("callback.received").replace("{provider}", provider)}</h1>
              <p className="dt-callback__note">{copy("callback.received.note")}</p>
              <code className="dt-callback__raw">state · {state}</code>
            </>
          )
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
