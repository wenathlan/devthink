/**
 * SettingsSurface.tsx — the composite winget of the settings remount (the
 * detailed engine wave): the preferences column the retired page carried,
 * rebuilt as ONE mount so the page anchor stays the thin face the
 * construction law pins on it. The surface owns the real engine lanes the
 * old face rode:
 *
 * - the theme flip answers the theme engine (`currentTheme`/`toggleTheme`
 *   — the debonair door to the family personal store, the [data-theme]
 *   attribute on <html>, session scope, nothing stored);
 * - the reduced-motion override answers the motionpref engine
 *   (`reduceMotionApplied`/`setReduceMotion` — the data-motion="reduced"
 *   document flag the stylesheet guards answer to, on top of the os media
 *   query, never against it);
 * - the clean-url demo answers the cleanurl engine (`applyNow` — the
 *   hash-route and tracker strip the module runs on the address bar);
 * - the region select reads the catalog seam (`listOptionChoices` — the
 *   locale rows the site db serves);
 * - the about ledger reads the canonical version module the manifest
 *   sync stamps (`packageversion` from version.ts — never a hand-synced
 *   literal, the drift the cadria about row once carried is the defect
 *   this seat retires).
 *
 * The arming beat rides the face prop: the first paint before the session
 * state lands (the theme read, the motion flag, the url draft) the route
 * answers the construction face it wore. Every word rides the label
 * store.
 */

import { type ReactNode, useCallback, useEffect, useState } from "react";
import { listOptionChoices } from "../../catalog.ts";
import { applyNow } from "../../cleanurl.ts";
import type { OptionChoice } from "../../katexis.ts";
import { label } from "../../labels.ts";
import { reduceMotionApplied, setReduceMotion } from "../../motionpref.ts";
import { currentTheme, toggleTheme } from "../../theme.ts";
import { packageversion } from "../../version.ts";
import { useToast } from "../toast/Toast.tsx";

/** the about row reads the canonical version module the root carries — the
 * hand-synced literal the settings page once kept is the defect the module
 * retires; the release sync stamps this entry every rung so the about row
 * answers the family lockstep without ever reading the manifest. */
const VERSION = packageversion;

/** the dirty url the demo pollutes the address bar with (test data, not copy). */
const DIRTY_URL = "?utm_source=newsletter&utm_campaign=launch&gclid=ABC123&fbclid=XY99#/settings";

/** the answer of the clean-url demo readout. */
type UrlOut = { text: string; tone: "error" | "ok" };

/** the props of the settings surface mount. */
type SettingsSurfaceProps = {
  /** the face the route answers while the session state arms (the first
   * paint before the theme and motion reads land — the honest arming
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
  const [light, setLight] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [locale, setLocale] = useState("en");
  const [localeChoices, setLocaleChoices] = useState<readonly OptionChoice[]>([]);
  const [urlOut, setUrlOut] = useState<UrlOut | null>(null);

  // the locale choices read the catalog seam (the db rows over HTTPS when
  // configured, the seed rows offline) — they land when they land
  const loadChoices = useCallback((live: () => boolean): void => {
    listOptionChoices("locale").then((rows) => {
      if (live()) setLocaleChoices(rows);
    });
  }, []);

  // the arming beat: the session state lands on the mount effect (the
  // theme the document carries and the motion flag the document rides) —
  // the first paint answers the face the route wore
  useEffect(() => {
    let live = true;
    setLight(currentTheme() === "light");
    setReduced(reduceMotionApplied());
    loadChoices(() => live);
    setSeated(true);
    return () => {
      live = false;
    };
  }, [loadChoices]);

  // the arming beat: the session seats have not landed yet — the route
  // answers the face it wore (never a preferences column answering state
  // it never read)
  if (!seated) return <>{face}</>;

  /** flips the document theme in memory — the next load starts dark again. */
  const onLightToggle = (): void => {
    toggleTheme();
    setLight(currentTheme() === "light");
  };

  /** the real switch: the document flag the stylesheet guards answer to. */
  const onReduceMotionToggle = (): void => {
    const next = !reduceMotionApplied();
    setReduceMotion(next);
    setReduceMotion(next);
    toast.show(next ? label("settings.toast.motionOn") : label("settings.toast.motionOff"), "info");
  };

  const showDirty = (): void => {
    setUrlOut({ text: window.location.pathname + DIRTY_URL, tone: "error" });
  };

  const showClean = (): void => {
    applyNow();
    setUrlOut({ text: window.location.pathname + window.location.search, tone: "ok" });
    toast.show(label("settings.toast.cleaned"), "success");
  };

  /** the preferences live in memory only: the interface never writes to
   * the visitor machine (the honest toast the save key answers). */
  const savePreferences = (): void => {
    toast.show(label("settings.toast.saved"), "success");
  };

  return (
    <div className="stack" style={{ marginTop: 26 }}>
      {/* APPEARANCE — the theme flip + the motion override, one toggle each */}
      <section className="glass card card-gap" aria-labelledby="appearance-h">
        <h2 id="appearance-h" className="card-h">
          {label("settings.appearance.title")}
        </h2>
        <div className="pref-row">
          <div>
            <p className="pref-title">{label("settings.appearance.light")}</p>
            <p className="pref-hint">{label("settings.appearance.lightHint")}</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={light}
              onChange={onLightToggle}
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
              checked={reduced}
              onChange={onReduceMotionToggle}
              aria-label={label("settings.appearance.motionAria")}
            />
            <span className="track" />
          </label>
        </div>
      </section>

      {/* CLEAN URLS — the module demo: poll the bar with trackers, watch it
          clean itself (the real applyNow call on the address bar) */}
      <section className="glass card card-gap" aria-labelledby="urls-h">
        <h2 id="urls-h" className="card-h">
          {label("settings.urls.title")}
        </h2>
        <p className="p-sm">
          {label("settings.urls.lead")}
          <code>clean-url</code>
          {label("settings.urls.mid1")}
          <code>index.html</code>
          {label("settings.urls.mid2")}
          <code>utm_*</code>
          {label("settings.urls.sep")}
          <code>gclid</code>
          {label("settings.urls.sep")}
          <code>fbclid</code>
          {label("settings.urls.mid3")}
        </p>
        <div className="btn-row" style={{ marginTop: 0 }}>
          <button className="btn secondary small" type="button" onClick={showDirty}>
            {label("settings.urls.dirty")}
          </button>
          <button className="btn small" type="button" onClick={showClean}>
            {label("settings.urls.clean")}
          </button>
        </div>
        <p className={`badge url-out${urlOut ? ` ${urlOut.tone}` : ""}`}>
          {urlOut ? urlOut.text : label("settings.urls.empty")}
        </p>
      </section>

      {/* REGION — the locale select over the catalog seam */}
      <section className="glass card card-gap" aria-labelledby="region-h">
        <h2 id="region-h" className="card-h">
          {label("settings.region.title")}
        </h2>
        <div className="field">
          <label htmlFor="locale">{label("settings.region.language")}</label>
          <select
            id="locale"
            className="input measure-sm"
            value={locale}
            onChange={(event) => setLocale(event.target.value)}
          >
            {localeChoices.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        </div>
        <button className="btn small" type="button" onClick={savePreferences}>
          {label("settings.save")}
        </button>
      </section>

      {/* ABOUT — the quiet ledger, the version the canonical module stamps */}
      <section className="glass card" aria-labelledby="about-h">
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
            <dd>debonair.devthink.pro</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export default SettingsSurface;
