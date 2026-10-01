// # Settings — sub-anchor of the settings page: appearance, the clean-url demo and
// the network and region selects. Preferences persist locally; zone credentials
// never live here.
import { useEffect, useState } from "react";
import { Shell, type NavLink } from "../shell/Shell";
import { listOptionChoices } from "../../catalog.ts";
import type { OptionChoice } from "../../argan.ts";
import { applyNow } from "../../clean.url";
import { currentTheme, toggleTheme } from "../../theme";
import { useToast } from "../toast/Toast";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Zones", href: "/zones" },
  { label: "DNSSEC", href: "/dnssec" },
  { label: "Gateway", href: "/gateway" },
];

const DIRTY_URL = "?utm_source=newsletter&utm_campaign=launch&gclid=ABC123&fbclid=XY99#/settings";

type UrlOut = { text: string; tone: "error" | "ok" };

export default function Settings() {
  const toast = useToast();
  const [light, setLight] = useState(currentTheme() === "light");
  const [resolver, setResolver] = useState("argan");
  const [locale, setLocale] = useState("en");
  const [resolverChoices, setResolverChoices] = useState<readonly OptionChoice[]>([]);
  const [localeChoices, setLocaleChoices] = useState<readonly OptionChoice[]>([]);
  const [urlOut, setUrlOut] = useState<UrlOut | null>(null);

  useEffect(() => {
    let live = true;
    listOptionChoices("resolver").then((rows) => {
      if (live) setResolverChoices(rows);
    });
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
    <Shell name="argan" contained footerLinks={FOOTER_LINKS} domain="argan.devthink.pro">
      <p className="eyebrow">preferences</p>
      <h1 className="page-title">Settings</h1>
      <p className="lede" style={{ maxWidth: 600 }}>
        Site preferences only. Zone credentials, TSIG keys and cluster secrets never live here — they belong to the argan database on the host that runs the pipeline.
      </p>

      <div className="stack">
        <section className="glass card card-gap">
          <h2 className="card-h">Appearance</h2>
          <div className="pref-row">
            <div>
              <p className="pref-title">Light theme</p>
              <p className="pref-hint">Solar dark is the default.</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={light}
                onChange={onLightToggle}
                aria-label="Toggle light theme"
              />
              <span className="track" />
            </label>
          </div>
          <div className="pref-row pref-row-last">
            <div>
              <p className="pref-title">Reduce motion</p>
              <p className="pref-hint">Also respects your OS setting automatically.</p>
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
          <p className={`badge url-out${urlOut ? ` ${urlOut.tone}` : ""}`}>
            {urlOut ? urlOut.text : "—"}
          </p>
        </section>

        <section className="glass card">
          <h2 className="card-h">Network &amp; region</h2>
          <div className="field">
            <label htmlFor="resolver">Preferred resolver</label>
            <select
              id="resolver"
              className="input measure"
              value={resolver}
              onChange={(event) => setResolver(event.target.value)}
            >
              {resolverChoices.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
          </div>
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
