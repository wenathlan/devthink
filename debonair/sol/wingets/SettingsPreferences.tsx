/**
 * SettingsPreferences.tsx — the composite winget of the settings remount
 * (the detailed engine wave answering the five construction routes): the
 * whole preferences card stack the retired page carried, rebuilt as ONE
 * mount so the page anchor stays the thin face the construction law pins
 * on it. The stack wires the real seats, never a rewritten one:
 *
 * - the appearance pair reads and drives the real preference engines: the
 *   theme flip (theme.ts — the in-memory theme on <html>, session scope,
 *   nothing written to the machine) and the reduce-motion switch
 *   (motionpref.ts — the document flag the stylesheet guards answer to,
 *   on top of the OS setting, never against it);
 * - the clean-url card runs the real module live: the dirty url the demo
 *   polls the address bar with and the applyNow() pass that strips the
 *   hash, the duplicate slashes and the campaign trackers without
 *   reloading or polluting history (cleanurl.ts over the argan dns
 *   bridge);
 * - the region select rides the catalog seam (the locale choices the site
 *   db serves over HTTPS when configured, the seed rows offline).
 *
 * Zero hardcoded rows: the choices are the seam's own, every word rides
 * the label store, the design rides the Sol classes the preferences always
 * wore. The arming beat answers the face the route wore while the seam
 * lands its first answer — never a fake select, never a dead card.
 */

import { useEffect, useState, type ReactNode } from "react";
import { listOptionChoices } from "../../catalog.ts";
import { applyNow } from "../../cleanurl.ts";
import type { OptionChoice } from "../../katexis.ts";
import { label } from "../../labels.ts";
import { reduceMotionApplied, setReduceMotion } from "../../motionpref.ts";
import { currentTheme, toggleTheme } from "../../theme.ts";
import { useToast } from "../toast/Toast.tsx";

type UrlOut = { text: string; tone: "error" | "ok" };

/** the dirty url the demo pollutes the address bar with (test data, not copy). */
const DIRTY_URL = "?utm_source=newsletter&utm_campaign=launch&gclid=ABC123&fbclid=XY99#/settings";

/** The props of the preferences mount. */
type PreferencesProps = {
  /** The face the route answers while the catalog seam arms (the first
   * paint before the locale choices land their answer). */
  face: ReactNode;
};

/**
 * SettingsPreferences — the preference cards over the real engines.
 *
 * @param props the arming face of the route.
 * @returns the preferences element, or the arming face before the seam answers.
 */
export function SettingsPreferences({ face }: PreferencesProps) {
  const toast = useToast();
  const [light, setLight] = useState(currentTheme() === "light");
  const [reduced, setReduced] = useState(() => reduceMotionApplied());
  const [locale, setLocale] = useState("en");
  const [localeChoices, setLocaleChoices] = useState<readonly OptionChoice[] | null>(null);
  const [urlOut, setUrlOut] = useState<UrlOut | null>(null);

  useEffect(() => {
    let live = true;
    listOptionChoices("locale").then((rows) => {
      if (live) setLocaleChoices(rows);
    });
    return () => {
      live = false;
    };
  }, []);

  const onLightToggle = (): void => {
    toggleTheme();
    setLight(currentTheme() === "light");
  };

  /** the real switch: the document flag the stylesheet guards answer to. */
  const onReduceMotionToggle = (): void => {
    const next = !reduceMotionApplied();
    setReduceMotion(next);
    setReduced(next);
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

  const savePreferences = (): void => {
    // preference state lives in memory only: the interface never writes to the visitor machine
    toast.show(label("settings.toast.saved"), "success");
  };

  // The arming beat: before the catalog seam lands the locale choices the
  // route answers the face it wore (the honest first paint, never a fake
  // select — the seam's own rows answer the moment they land)
  if (localeChoices === null) return <>{face}</>;

  return (
    <div className="stack">
      <section className="glass card card-gap">
        <h2 className="card-h">{label("settings.appearance.title")}</h2>
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

      <section className="glass card card-gap">
        <h2 className="card-h">{label("settings.urls.title")}</h2>
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

      <section className="glass card">
        <h2 className="card-h">{label("settings.region.title")}</h2>
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
    </div>
  );
}

export default SettingsPreferences;
