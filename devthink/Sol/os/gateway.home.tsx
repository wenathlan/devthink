/**
 * gateway.home.tsx — the opening screen of the os: the Gateway launcher
 * with the platform sections and the family apps (Argan, Cadria, Debonair,
 * StealHead) as showcase cards, the command bar (Cmd+K) and the theme
 * toggle in an in-flow content toolbar (the ONE chrome is the shell
 * navbar — no second header), the gateway clock card and status. Clicking
 * a tab or a card enters its defined target (250ms riseIn transition).
 * The Sol workbench design prevails: the os palette is mapped onto the
 * --dt-* tokens in Sol/sol.css.
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

  /* the launcher tabs: the platform sections carry their real names with a
     defined target, then the family apps by their own names (never a
     "DevThink something" label — the OS itself is the DevThink) */
  const platform = APPS.find((a) => a.id === "devthink");
  const family = APPS.filter((a) => a.id !== "devthink");

  const tabs = () => (
    <>
      {(platform?.pages ?? []).map((p) => (
        <button
          key={p.id}
          type="button"
          className="nav-pill"
          onClick={() => os.openApp("devthink", p.id)}
        >
          {p.label}
        </button>
      ))}
      <span className="os-toolbar__sep" aria-hidden="true" />
      {family.map((a) => (
        <button
          key={a.id}
          type="button"
          className="nav-pill"
          onClick={() => os.openApp(a.id)}
        >
          {a.name}
        </button>
      ))}
    </>
  );

  return (
    <>
      <div className="os-toolbar">
        <nav className="os-toolbar__nav" aria-label="Gateway sections">
          {tabs()}
        </nav>
        <div className="os-toolbar__actions">
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
            aria-controls={menuOpen ? "mobile-nav" : undefined}
            aria-label="Open the sections menu"
          >
            <Search size={18} strokeWidth={1.8} />
          </button>
        </div>
        {menuOpen ? (
          <nav id="mobile-nav" className="mobile-menu glass mobile-only" aria-label="Gateway menu">
            {tabs()}
          </nav>
        ) : null}
      </div>

      <main className="shell">
        {/* HERO */}
        <section style={{ paddingTop: "clamp(40px, 8vw, 96px)", paddingBottom: "clamp(24px, 5vw, 56px)" }}>
          <p className="eyebrow reveal">gateway · every route in one bar</p>
          <h1 className="wordmark reveal in">Gateway</h1>
          <p className="reveal in max-560" style={{ fontSize: "1.12rem", marginTop: 18 }}>
            The launcher of the family operating surface: the platform sections and the family apps in one shell, an
            Aura chat per app calling the local gateway, an always-clean URL bar and 100% on-device persistence.
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
            <span className="badge success">5 surfaces</span>
            <span className="badge info">glm-5.3 · /v1/chat/completions</span>
            <span className="badge warning">clean-url active</span>
          </div>
        </section>

        {/* SURFACES — showcase cards */}
        <section className="section tight" aria-labelledby="apps-h">
          <div className="section-head">
            <p className="eyebrow reveal">the family</p>
            <h2 id="apps-h" className="reveal" style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.4rem)" }}>
              One OS, five surfaces
            </h2>
            <p className="reveal">
              Each surface carries its own name, a content toolbar with internal navigation and an Aura chat with
              persona — step in and return through the gateway button.
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
                  aria-label={`Open ${a.name} — ${a.domain}`}
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
                    enter the surface <ArrowRight size={15} strokeWidth={1.8} aria-hidden="true" />
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
