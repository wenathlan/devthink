/**
 * SettingsSurface.tsx — the composite winget of the settings remount (the
 * detailed engine wave): the whole preferences column the retired page
 * carried, rebuilt as ONE mount so the page anchor stays the thin face the
 * construction law pins on it. The surface owns the real engine lanes the
 * old face rode:
 *
 * - the theme flip answers the theme engine (`applyTheme`/`currentTheme`
 *   — the [data-theme] attribute on <html>, session scope, nothing
 *   stored);
 * - the reduced-motion override answers the session flag the js-driven
 *   beats consult beside the os media query (documentElement dataset);
 * - the gateway url field answers the shared gateway client's own session
 *   state (`gatewayUrl`/`setGatewayUrl` — the same base the studio, the
 *   gallery, the home and the player read) with the live health check
 *   (`gatewayHealth`) and the honest toasts;
 * - the about ledger reads the canonical version module the manifest sync
 *   stamps (never a hand-synced literal — the drift gate walks it).
 *
 * The arming beat rides the face prop: the first paint before the session
 * state lands (the theme read and the gateway base) the route answers the
 * construction face it wore. Every word rides the label store.
 */

import { type ReactNode, useCallback, useEffect, useState } from "react";
import { gatewayHealth, gatewayUrl, setGatewayUrl } from "../../gateway.ts";
import { label } from "../../labels.ts";
import { applyTheme, currentTheme, type Theme } from "../../theme.ts";
import { packageversion } from "../../version.ts";
import { useToast } from "../toast/Toast.tsx";

/** the about row reads the canonical version module the root carries — the
 * hand-synced literal the settings page once kept drifted fifty five rungs
 * behind the manifest because package.json is forbidden to import at
 * runtime; the version module is the root constant the release sync stamps
 * every rung, so the about row answers the family lockstep without ever
 * reading the manifest. */
const VERSION = packageversion;

/** the lifecycle of the gateway health readout. */
type Health = "unknown" | "checking" | "online" | "offline";

/** the props of the settings surface mount. */
type SettingsSurfaceProps = {
  /** the face the route answers while the session state arms (the first
   * paint before the theme and gateway reads land — the honest arming
   * state). */
  face: ReactNode;
};

/**
 * SettingsSurface — the platform preferences over the real engine lanes.
 *
 * @param props the arming face of the route.
 * @returns the preferences element, or the arming face before the state lands.
 */
export function SettingsSurface({ face }: SettingsSurfaceProps) {
  const toast = useToast();
  const [seated, setSeated] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);
  const [urlDraft, setUrlDraft] = useState<string>("http://localhost:8787");
  const [health, setHealth] = useState<Health>("unknown");

  // the arming beat: the session state lands on the mount effect (the theme
  // the document carries and the gateway base the client holds) — the first
  // paint answers the face the route wore
  useEffect(() => {
    setTheme(currentTheme());
    setReduceMotion(document.documentElement.dataset.reduceMotion === "true");
    setUrlDraft(gatewayUrl());
    setSeated(true);
  }, []);

  /** asks the gateway for health; the answer lands in the quiet readout (the hook rides above the arming return — the react order law every seat answers). */
  const checkHealth = useCallback(async () => {
    setHealth("checking");
    const online = await gatewayHealth();
    setHealth(online ? "online" : "offline");
    toast.show(online ? label("settings.onlineToast") : label("settings.offlineToast"), online ? "success" : "error");
  }, [toast]);

  // the arming beat: the session seats have not landed yet — the route
  // answers the face it wore (never a preferences column answering state
  // it never read)
  if (!seated) return <>{face}</>;

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
    toast.show(label("settings.gateway.savedToast").replace("{url}", saved), "info");
  };

  return (
    <div className="stack" style={{ marginTop: 26, maxWidth: 640 }}>
      {/* APPEARANCE — the theme flip + the motion override, one toggle each */}
      <section className="card" aria-labelledby="appearance-h">
        <h2 id="appearance-h" className="card-h">
          {label("settings.appearance.head")}
        </h2>
        <div className="pref-row">
          <div>
            <p className="pref-title">{label("settings.appearance.light")}</p>
            <p className="pref-hint">{label("settings.appearance.lightHint")}</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={theme === "light"}
              onChange={flipTheme}
              aria-label={label("settings.appearance.lightAria")}
            />
            <span className="track" />
          </label>
        </div>
        <div className="pref-row pref-row-last">
          <div>
            <p className="pref-title">{label("settings.appearance.motion")}</p>
            <p className="pref-hint">{label("settings.appearance.motionHint")}</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(event) => flipMotion(event.target.checked)}
              aria-label={label("settings.appearance.motionAria")}
            />
            <span className="track" />
          </label>
        </div>
      </section>

      {/* GATEWAY — the session base url the studio/gallery/player/home fetches ride */}
      <section className="card" aria-labelledby="gateway-h">
        <h2 id="gateway-h" className="card-h">
          {label("settings.gateway.head")}
        </h2>
        <p className="p-sm">{label("settings.gateway.line")}</p>
        <div className="field">
          <label htmlFor="gateway-url">{label("settings.gateway.urlLabel")}</label>
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
            {label("settings.gateway.save")}
          </button>
          <button type="button" className="btn btn--ghost" style={{ minHeight: 40 }} onClick={() => void checkHealth()}>
            {label("settings.gateway.check")}
          </button>
          <span className="mono-label" role="status" style={{ marginLeft: "auto" }}>
            {label("settings.gateway.status").replace("{health}", health)}
          </span>
        </div>
      </section>

      {/* ABOUT — the quiet ledger, the version the root module stamps */}
      <section className="card" aria-labelledby="about-h">
        <h2 id="about-h" className="card-h">
          {label("settings.about.head")}
        </h2>
        <dl className="spec-ledger" style={{ margin: 0 }}>
          <div className="spec-row">
            <dt>{label("settings.about.version")}</dt>
            <dd>{VERSION}</dd>
          </div>
          <div className="spec-row">
            <dt>{label("settings.about.engine")}</dt>
            <dd>{label("settings.about.engineValue")}</dd>
          </div>
          <div className="spec-row">
            <dt>{label("settings.about.storage")}</dt>
            <dd>{label("settings.about.storageValue")}</dd>
          </div>
          <div className="spec-row">
            <dt>{label("settings.about.license")}</dt>
            <dd>GPL-3.0-only</dd>
          </div>
          <div className="spec-row">
            <dt>{label("settings.about.domain")}</dt>
            <dd>cadria.devthink.pro</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export default SettingsSurface;
