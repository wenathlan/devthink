/**
 * settings page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Settings — sub-anchor of the settings page: appearance, the clean-url demo and the
// player defaults. Preferences stay in memory: the interface never writes to the
// visitor machine.
import { useEffect, useState } from "react";
import { Shell, type NavLink } from "../shell/Shell";
import { listOptionChoices } from "../../catalog.ts";
import type { OptionChoice } from "../../versawase.ts";
import { applyNow } from "../../cleanurl";
import { currentTheme, toggleTheme } from "../../theme";
import { useToast } from "../toast/Toast";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Player", href: "/player" },
  { label: "Studio", href: "/studio" },
  { label: "Gallery", href: "/gallery" },
];

const DIRTY_URL = "?utm_source=newsletter&utm_campaign=launch&gclid=ABC123&fbclid=XY99#/settings";

type UrlOut = { text: string; tone: "error" | "ok" };

export default function Settings() {
  const toast = useToast();
  const [light, setLight] = useState(currentTheme() === "light");
  const [autoplay, setAutoplay] = useState("ask");
  const [autoplayChoices, setAutoplayChoices] = useState<readonly OptionChoice[]>([]);
  const [urlOut, setUrlOut] = useState<UrlOut | null>(null);

  useEffect(() => {
    let live = true;
    listOptionChoices("autoplay").then((rows) => {
      if (live) setAutoplayChoices(rows);
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
    <Shell
      name="cadria"
      contained
      cta={{ label: "Open studio", href: "/studio" }}
      footerLinks={FOOTER_LINKS}
      domain="cadria.devthink.pro"
    >
      <p className="eyebrow">preferences</p>
      <h1 className="page-title">Settings</h1>
      <p className="lede" style={{ maxWidth: 600 }}>
        Site preferences only. Project assets, timelines and render keys belong to the studio workspace — nothing here ever touches your media.
      </p>

      <div className="stack">
        <section className="glass card card-gap">
          <h2 className="card-h">Appearance</h2>
          <div className="pref-row">
            <div>
              <p className="pref-title">Light theme</p>
              <p className="pref-hint">Solar dark is the default — the frame reads better in the darkroom.</p>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={light} onChange={onLightToggle} aria-label="Toggle light theme" />
              <span className="track" />
            </label>
          </div>
          <div className="pref-row pref-row-last">
            <div>
              <p className="pref-title">Reduce motion</p>
              <p className="pref-hint">Also respects your OS setting automatically — same rule as the player (F-CAD-014).</p>
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
            This site runs the <code>clean-url</code> module: hash routes, <code>index.html</code>, duplicate slashes and campaign trackers (<code>utm_*</code>, <code>gclid</code>, <code>fbclid</code>…) are stripped from the address bar automatically — without reloading or polluting history.
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
          <h2 className="card-h">Player defaults</h2>
          <div className="field">
            <label htmlFor="autoplay">Autoplay on open</label>
            <select
              id="autoplay"
              className="input measure-sm"
              value={autoplay}
              onChange={(event) => setAutoplay(event.target.value)}
            >
              {autoplayChoices.map((choice) => (
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
