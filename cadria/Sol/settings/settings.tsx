/**
 * settings page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Settings — platform settings (design doctrine pass): the theme flip
// (light/dark via [data-theme] on <html>, session scope — nothing stored),
// the gateway url field (session state through the shared gatewayclient —
// the studio and the gallery read the same base) with a live health check,
// the reduced-motion override (a session flag the js-driven beats consult
// beside the os media query) and the about ledger. no danger zone: nothing
// on this page can destroy anything. the anchor renders BARE: the one Shell
// chrome lives in Sol/Sol.tsx.
import { useCallback, useState } from "react";
import { applyTheme, currentTheme, type Theme } from "../../theme";
import { gatewayHealth, gatewayUrl, setGatewayUrl } from "../shell/gatewayclient.ts";
import { useToast } from "../toast/Toast.tsx";

/** synced by hand with cadria/package.json "version" — package.json is forbidden to import at runtime. */
const VERSION = "2.0.94";

/** the lifecycle of the gateway health readout. */
type Health = "unknown" | "checking" | "online" | "offline";

export default function Settings() {
  const toast = useToast();
  const [theme, setTheme] = useState<Theme>(currentTheme());
  const [reduceMotion, setReduceMotion] = useState<boolean>(
    () => document.documentElement.dataset.reduceMotion === "true",
  );
  const [urlDraft, setUrlDraft] = useState<string>(() => gatewayUrl());
  const [health, setHealth] = useState<Health>("unknown");

  /** flips the document theme in memory — the next load starts from sol dark again. */
  const flipTheme = (): void => {
    const next: Theme = theme === "light" ? "dark" : "light";
    applyTheme(next);
    setTheme(next);
  };

  /** the session motion override: js-driven beats (player loop, onboarding demo) read this attribute beside the os media query; the css hard stop stays on the media query alone. */
  const flipMotion = (on: boolean): void => {
    setReduceMotion(on);
    if (on) document.documentElement.dataset.reduceMotion = "true";
    else delete document.documentElement.dataset.reduceMotion;
  };

  /** saves the gateway base for the session (no persistence, stated honestly). */
  const saveUrl = (): void => {
    const saved = setGatewayUrl(urlDraft);
    setUrlDraft(saved);
    setHealth("unknown");
    toast.show(`gateway set to ${saved} — session only`, "info");
  };

  /** asks the gateway for health; the answer lands in the quiet readout. */
  const checkHealth = useCallback(async () => {
    setHealth("checking");
    const online = await gatewayHealth();
    setHealth(online ? "online" : "offline");
    toast.show(online ? "the gateway answers" : "the gateway is not answering", online ? "success" : "error");
  }, [toast]);

  return (
    <>
      <section aria-labelledby="settings-h" style={{ maxWidth: 640 }}>
        <p className="eyebrow">cadria · settings</p>
        <h1 id="settings-h" className="page-title" style={{ fontSize: "clamp(1.9rem, 4vw, 2.8rem)" }}>
          settings
        </h1>
        <p className="lede">
          site preferences only, all session scope — the interface never writes to the visitor machine. project assets
          and render keys belong to the studio.
        </p>
      </section>

      <div className="stack" style={{ marginTop: 26, maxWidth: 640 }}>
        {/* APPEARANCE — the theme flip + the motion override, one toggle each */}
        <section className="card" aria-labelledby="appearance-h">
          <h2 id="appearance-h" className="card-h">
            appearance
          </h2>
          <div className="pref-row">
            <div>
              <p className="pref-title">light theme</p>
              <p className="pref-hint">
                sol dark is the default — the frame reads better in the darkroom. holds for the session.
              </p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={theme === "light"}
                onChange={flipTheme}
                aria-label="toggle the light theme"
              />
              <span className="track" />
            </label>
          </div>
          <div className="pref-row pref-row-last">
            <div>
              <p className="pref-title">reduce motion</p>
              <p className="pref-hint">
                the os setting is respected automatically; this override holds the js-driven beats too (the player loop,
                the onboarding demo) — session scope.
              </p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={reduceMotion}
                onChange={(event) => flipMotion(event.target.checked)}
                aria-label="override the motion preference to reduced"
              />
              <span className="track" />
            </label>
          </div>
        </section>

        {/* GATEWAY — the session base url the studio/gallery/player fetches ride */}
        <section className="card" aria-labelledby="gateway-h">
          <h2 id="gateway-h" className="card-h">
            gateway
          </h2>
          <p className="p-sm">
            the local generation gateway the studio posts to and the gallery, home and player read from. the base lives
            in memory for this session only — reload resets it to the default.
          </p>
          <div className="field">
            <label htmlFor="gateway-url">gateway base url</label>
            <input
              id="gateway-url"
              className="input measure-sm"
              type="url"
              value={urlDraft}
              spellCheck={false}
              onChange={(event) => setUrlDraft(event.target.value)}
            />
          </div>
          <div className="row row--wrap" style={{ gap: 10 }}>
            <button type="button" className="btn" style={{ minHeight: 40 }} onClick={saveUrl}>
              save for this session
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              style={{ minHeight: 40 }}
              onClick={() => void checkHealth()}
            >
              check health
            </button>
            <span className="mono-label" role="status" style={{ marginLeft: "auto" }}>
              status: {health}
            </span>
          </div>
        </section>

        {/* ABOUT — the quiet ledger, the version synced by hand with package.json */}
        <section className="card" aria-labelledby="about-h">
          <h2 id="about-h" className="card-h">
            about
          </h2>
          <dl className="spec-ledger" style={{ margin: 0 }}>
            <div className="spec-row">
              <dt>version</dt>
              <dd>{VERSION}</dd>
            </div>
            <div className="spec-row">
              <dt>engine</dt>
              <dd>versawase · deterministic analysis → render</dd>
            </div>
            <div className="spec-row">
              <dt>storage</dt>
              <dd>none — session only</dd>
            </div>
            <div className="spec-row">
              <dt>license</dt>
              <dd>GPL-3.0-only</dd>
            </div>
            <div className="spec-row">
              <dt>domain</dt>
              <dd>cadria.devthink.pro</dd>
            </div>
          </dl>
        </section>
      </div>
    </>
  );
}
