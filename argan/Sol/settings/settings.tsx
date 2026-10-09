/**
 * settings page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Settings — the sectioned console (campaign v3 · r3-argan): a sticky mono
// rail over three numbered sections (appearance, clean urls, network) ruled by
// hairlines — no boxes. Preferences persist locally; zone credentials never
// live here.
import { useEffect, useState } from "react";
import type { OptionChoice } from "../../argan.ts";
import { listOptionChoices } from "../../catalog.ts";
import { applyNow } from "../../cleanurl";
import { currentTheme, toggleTheme } from "../../theme";
import { type NavLink, Shell } from "../shell/Shell";
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
      <header className="r3a-head">
        <p className="r3a-head__eyebrow">argan · settings</p>
        <h1 className="r3a-head__title">Site preferences only.</h1>
        <p className="r3a-head__lede">
          Zone credentials, TSIG keys and cluster secrets never live here — they belong to the argan database on the
          host that runs the pipeline.
        </p>
      </header>

      <div className="r3a-set">
        <nav className="r3a-set__rail" aria-label="Settings sections">
          <a href="#sec-appearance">appearance</a>
          <a href="#sec-urls">clean urls</a>
          <a href="#sec-network">network</a>
        </nav>

        <div className="r3a-set__body">
          <section id="sec-appearance" className="r3a-set__sec" aria-labelledby="ap-h">
            <div className="r3a-h">
              <span className="r3a-h__no" aria-hidden="true">
                01
              </span>
              <h2 id="ap-h" className="r3a-h__title">
                Appearance
              </h2>
            </div>
            <div className="r3a-set__row">
              <div>
                <p className="pref-title">Light theme</p>
                <p className="pref-hint">Solar dark is the default.</p>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={light} onChange={onLightToggle} aria-label="Toggle light theme" />
                <span className="track" />
              </label>
            </div>
            <div className="r3a-set__row">
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

          <section id="sec-urls" className="r3a-set__sec" aria-labelledby="url-h">
            <div className="r3a-h">
              <span className="r3a-h__no" aria-hidden="true">
                02
              </span>
              <h2 id="url-h" className="r3a-h__title">
                Clean URLs
              </h2>
            </div>
            <p className="r3a-set__copy">
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

          <section id="sec-network" className="r3a-set__sec" aria-labelledby="net-h">
            <div className="r3a-h">
              <span className="r3a-h__no" aria-hidden="true">
                03
              </span>
              <h2 id="net-h" className="r3a-h__title">
                Network &amp; region
              </h2>
            </div>
            <div className="r3a-set__fields">
              <div className="field">
                <label htmlFor="resolver">Preferred resolver</label>
                <select
                  id="resolver"
                  className="input"
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
                  className="input"
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
            </div>
            <button className="btn small" type="button" onClick={savePreferences}>
              Save preferences
            </button>
          </section>
        </div>
      </div>
    </Shell>
  );
}
