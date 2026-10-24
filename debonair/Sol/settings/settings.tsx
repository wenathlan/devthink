/**
 * settings page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Settings — sub-anchor of the settings page: appearance, the clean-url demo and the
// region select. Preferences stay in memory: the interface never writes to the
// visitor machine.
import { useEffect, useState } from "react";
import { listOptionChoices } from "../../catalog.ts";
import { applyNow } from "../../cleanurl.ts";
import { label } from "../../labels.ts";
import type { OptionChoice } from "../../katexis.ts";
import { reduceMotionApplied, setReduceMotion } from "../../motionpref.ts";
import { currentTheme, toggleTheme } from "../../theme.ts";
import { type NavLink, Shell } from "../shell/Shell.tsx";
import { useToast } from "../toast/Toast.tsx";

type UrlOut = { text: string; tone: "error" | "ok" };

/** the dirty url the demo pollutes the address bar with (test data, not copy). */
const DIRTY_URL = "?utm_source=newsletter&utm_campaign=launch&gclid=ABC123&fbclid=XY99#/settings";

export default function Settings() {
  // the footer links read the label store at render time (the manifest
  // answers english, the store answers the translated rows the seed protected)
  const FOOTER_LINKS: readonly NavLink[] = [
    { label: label("nav.studio"), href: "/studio" },
    { label: label("nav.library"), href: "/library" },
  ];

  const toast = useToast();
  const [light, setLight] = useState(currentTheme() === "light");
  const [reduced, setReduced] = useState(() => reduceMotionApplied());
  const [locale, setLocale] = useState("en");
  const [localeChoices, setLocaleChoices] = useState<readonly OptionChoice[]>([]);
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

  return (
    <Shell name="debonair" contained footerLinks={FOOTER_LINKS} themeButton={false} domain="devthink.pro">
      <p className="eyebrow">{label("settings.eyebrow")}</p>
      <h1 className="page-title">{label("settings.title")}</h1>
      <p className="lede" style={{ maxWidth: 600 }}>
        {label("settings.ledeLead")}
        <code>~/.config/debonair/</code>
        {label("settings.ledeTail")}
      </p>

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
    </Shell>
  );
}
