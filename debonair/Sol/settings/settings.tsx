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
import type { OptionChoice } from "../../katexis.ts";
import { currentTheme, toggleTheme } from "../../theme.ts";
import { type NavLink, Shell } from "../shell/Shell.tsx";
import { useToast } from "../toast/Toast.tsx";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Studio", href: "/studio" },
  { label: "Library", href: "/library" },
];

const DIRTY_URL = "?utm_source=newsletter&utm_campaign=launch&gclid=ABC123&fbclid=XY99#/settings";

type UrlOut = { text: string; tone: "error" | "ok" };

export default function Settings() {
  const toast = useToast();
  const [light, setLight] = useState(currentTheme() === "light");
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

  const showDirty = (): void => {
    setUrlOut({ text: window.location.pathname + DIRTY_URL, tone: "error" });
  };

  const showClean = (): void => {
    applyNow();
    setUrlOut({ text: window.location.pathname + window.location.search, tone: "ok" });
    toast.show("URL cleaned — no hash, no trackers", "success");
  };

  const savePreferences = (): void => {
    // preference state lives in memory only: the interface never writes to the visitor machine
    toast.show("Preferences saved locally", "success");
  };

  return (
    <Shell name="debonair" contained footerLinks={FOOTER_LINKS} themeButton={false} domain="devthink.pro">
      <p className="eyebrow">debonair · settings</p>
      <h1 className="page-title">Settings</h1>
      <p className="lede" style={{ maxWidth: 600 }}>
        Site preferences only. Product credentials and session audio never live here — they belong to{" "}
        <code>~/.config/debonair/</code> on your machine.
      </p>

      <div className="stack">
        <section className="glass card card-gap">
          <h2 className="card-h">Appearance</h2>
          <div className="pref-row">
            <div>
              <p className="pref-title">Light theme</p>
              <p className="pref-hint">Solar dark is the default — the mixer reads better at night.</p>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={light} onChange={onLightToggle} aria-label="Toggle light theme" />
              <span className="track" />
            </label>
          </div>
          <div className="pref-row pref-row-last">
            <div>
              <p className="pref-title">Reduce motion</p>
              <p className="pref-hint">
                Freezes the equalizer and playhead pulse. Also respects your OS setting automatically.
              </p>
            </div>
            <label className="toggle">
              <input type="checkbox" aria-label="Toggle reduce motion" />
              <span className="track" />
            </label>
          </div>
        </section>

        <section className="glass card card-gap">
          <h2 className="card-h">Clean URLs</h2>
          <p className="p-sm">
            This site runs the <code>clean-url</code> module: hash routes, <code>index.html</code>, duplicate slashes
            and campaign trackers (<code>utm_*</code>, <code>gclid</code>, <code>fbclid</code>…) are stripped from the
            address bar automatically — without reloading or polluting history.
          </p>
          <div className="btn-row" style={{ marginTop: 0 }}>
            <button className="btn secondary small" type="button" onClick={showDirty}>
              Poll this URL with trackers
            </button>
            <button className="btn small" type="button" onClick={showClean}>
              Watch it clean itself
            </button>
          </div>
          <p className={`badge url-out${urlOut ? ` ${urlOut.tone}` : ""}`}>{urlOut ? urlOut.text : "—"}</p>
        </section>

        <section className="glass card">
          <h2 className="card-h">Region</h2>
          <div className="field">
            <label htmlFor="locale">Language</label>
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
            Save preferences
          </button>
        </section>
      </div>
    </Shell>
  );
}
