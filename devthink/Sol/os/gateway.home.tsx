/**
 * gateway.home.tsx — the opening screen of the os: the launcher with the
 * 5 apps as showcase cards, the command bar (Cmd+K), the gateway clock
 * and status, and the theme toggle. Clicking an app enters it (250ms
 * riseIn transition). The Sol workbench design prevails: the os palette
 * is mapped onto the --dt-* tokens in Sol/sol.css.
 */
import { useEffect, useState } from "react";
import { ArrowRight, Command, Eraser, Moon, Search, Sun, Activity } from "lucide-react";
import { APPS } from "./apps";
import { StatusDot } from "./status.dot";
import type { OSHandle } from "./os.types";

function useClock(): string {
  const [now, setNow] = useState<string>("--:--:--");
  useEffect(() => {
    const tick = () =>
      setNow(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function GatewayHome({ os }: { os: OSHandle }) {
  const clock = useClock();
  const [menuOpen, setMenuOpen] = useState(false);

  const headerNav = (
    <>
      {APPS.map((a) => (
        <button
          key={a.id}
          type="button"
          className="nav-pill"
          onClick={() => os.openApp(a.id)}
          aria-label={`Open the ${a.name} app`}
        >
          {a.name}
        </button>
      ))}
    </>
  );

  return (
    <>
      <header className="topnav">
        <nav className="topnav-links" aria-label="Gateway apps">
          {headerNav}
        </nav>
        <div className="topnav-actions" style={{ marginLeft: "auto" }}>
          <span className="clock desktop-only" title="Gateway clock">
            {clock}
          </span>
          <button
            type="button"
            className="icon-btn desktop-only"
            onClick={os.openCmd}
            aria-label="Open the command bar (Command K)"
            title="Command bar (⌘K)"
          >
            <Command size={18} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={os.toggleTheme}
            aria-label={os.settings.theme === "dark" ? "Switch to the light theme" : "Switch to the solar (dark) theme"}
            title="Theme"
          >
            {os.settings.theme === "dark" ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
          </button>
          <button
            type="button"
            className="icon-btn mobile-only"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Open the app menu"
          >
            <Search size={18} strokeWidth={1.8} />
          </button>
        </div>
        {menuOpen ? (
          <nav id="mobile-nav" className="mobile-menu glass mobile-only" aria-label="App menu">
            {headerNav}
          </nav>
        ) : null}
      </header>

      <main className="shell">
        {/* HERO */}
        <section style={{ paddingTop: "clamp(40px, 8vw, 96px)", paddingBottom: "clamp(24px, 5vw, 56px)" }}>
          <p className="eyebrow reveal">gateway · every route in one bar</p>
          <h1 className="wordmark reveal in">DevThink OS</h1>
          <p className="reveal in max-560" style={{ fontSize: "1.12rem", marginTop: 18 }}>
            The launcher of the provider-neutral workbench: five apps in one shell, an Aura chat per app calling the
            local gateway, an always-clean URL bar and 100% on-device persistence.
          </p>
          <div className="reveal in row mt-26">
            <button type="button" className="cmd-hint" onClick={os.openCmd} aria-label="Open the command bar">
              <Search size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>Search apps, tabs, actions…</span>
              <kbd>⌘K</kbd>
            </button>
          </div>
          <div className="reveal in row mt-34">
            <span className="badge">
              <span className="dot" aria-hidden="true" /> gateway online
            </span>
            <span className="badge success">5 apps</span>
            <span className="badge info">glm-5.3 · /v1/chat/completions</span>
            <span className="badge warning">clean-url active</span>
          </div>
        </section>

        {/* APPS — showcase cards */}
        <section className="section tight" aria-labelledby="apps-h">
          <div className="section-head">
            <p className="eyebrow reveal">the family</p>
            <h2 id="apps-h" className="reveal" style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.4rem)" }}>
              Five apps, one engine
            </h2>
            <p className="reveal">
              Each app is its own showcase with a header, internal navigation and an Aura chat with persona — step in
              and return through the gateway button.
            </p>
          </div>
          <div className="grid cols-2">
            {APPS.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.id}
                  type="button"
                  className="glass glass-hover card app-card reveal"
                  onClick={() => os.openApp(a.id)}
                  aria-label={`Enter the ${a.name} app (${a.domain})`}
                >
                  <div className="app-top">
                    <span className="feat-ico" aria-hidden="true">
                      <Icon size={22} strokeWidth={1.8} />
                    </span>
                    <StatusDot label="online" />
                  </div>
                  <h3 style={{ marginTop: 14 }}>{a.name}</h3>
                  <span className="domain">{a.domain}</span>
                  <p>{a.desc}</p>
                  <span className="go">
                    enter the app <ArrowRight size={15} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* GATEWAY STATUS */}
        <section className="section tight" aria-labelledby="gw-h">
          <div className="section-head">
            <p className="eyebrow reveal">status</p>
            <h2 id="gw-h" className="reveal" style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}>
              Gateway panel
            </h2>
          </div>
          <div className="grid cols-3">
            <div className="glass card reveal">
              <div className="row between">
                <h3 style={{ fontSize: "1rem", margin: 0 }}>Chat</h3>
                <Activity size={18} strokeWidth={1.8} aria-hidden="true" style={{ color: "var(--sol-primary)" }} />
              </div>
              <p className="small mt-8" style={{ marginBottom: 8 }}>
                POST <code>/v1/chat/completions</code> · model <code>devthink</code> → glm-5.3, with{" "}
                <code>reasoning_content</code> becoming the internal cognition inside the bubbles.
              </p>
              <StatusDot label="200 OK" />
            </div>
            <div className="glass card reveal">
              <div className="row between">
                <h3 style={{ fontSize: "1rem", margin: 0 }}>Clean bar</h3>
                <Eraser size={18} strokeWidth={1.8} aria-hidden="true" style={{ color: "var(--sol-primary)" }} />
              </div>
              <p className="small mt-8" style={{ marginBottom: 8 }}>
                Navigation = <code>setState</code> + <code>history.replaceState(&quot;/&quot;)</code>. Hash, trackers and{" "}
                <code>index.html</code> are wiped on <code>hashchange</code>/<code>popstate</code>.
              </p>
              <StatusDot label="URL always /" tone="info" />
            </div>
            <div className="glass card reveal">
              <div className="row between">
                <h3 style={{ fontSize: "1rem", margin: 0 }}>Gateway clock</h3>
                <span className="clock">{clock}</span>
              </div>
              <p className="small mt-8" style={{ marginBottom: 8 }}>
                Client-first session: theme, active view, projects, settings and chats live in <code>localStorage</code>{" "}
                via <code>useStoredState</code>.
              </p>
              <StatusDot label="no network beyond chat" tone="warning" />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
