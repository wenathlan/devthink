/**
 * gatewayhome.tsx — the opening screen of the os: the Gateway launcher
 * with the platform sections and the family apps (Argan, Cadria, Debonair,
 * Stealthhead, Forge, Foundry, Vault, Getry) as showcase cards, the
 * command bar (Cmd+K) and the theme toggle in the standardized toolbar
 * (the ONE chrome is the shell navbar — no second header, no logo), the
 * gateway clock card and status. Clicking a tab or a card enters its
 * defined target (the 250ms view transition). The toolbar carries the
 * same contract as AppHeader (one identity block at the ToolbarIdent
 * scale, one mono scope crumb, one actions row, the once-per-load 400ms
 * entrance). The hero carries ONE light source (the .shader-fallback
 * signal bloom) + the halftone edge + the grain veil — no box grid; the
 * launch grid is asymmetric (1.6fr featured platform column + 1fr rails)
 * and every card obeys the card discipline (one title, one phrase, no
 * paragraphs).
 *
 * Task 3-c harmonization: the launcher rides the family identity grammar
 * (familyidentity.tsx) — the nine cards use the spec-12 accent per app in
 * a sealed glyph tile, the card hover is the 150ms micro lift of the
 * family grammar, and the whole surface shares the thin neutral scrollbar
 * and the surface tokens.
 */

import { Activity, ArrowRight, Command, Eraser, Menu, Moon, Search, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { CARD_ROLE_STYLE, ToolbarIdent, useHeaderEntrance } from "./appheader.tsx";
import { APPS } from "./apps.ts";
import { FamilyStyles, familyAccentOf } from "./familyidentity.tsx";
import type { OSHandle } from "./ostypes.ts";
import { StatusDot } from "./statusdot.tsx";

/** the entrance stagger of the launcher: the [style] custom prop of .enter. */
const stagger = (i: number) => ({ "--i": i }) as React.CSSProperties;

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
  const entered = useHeaderEntrance();

  /* the launcher tabs: the platform sections carry their real names with a
     defined target, then the family apps by their own names (never a
     "DevThink something" label — the OS itself is the DevThink) */
  const platform = APPS.find((a) => a.id === "devthink");
  const family = APPS.filter((a) => a.id !== "devthink");

  const tabs = () => (
    <>
      {(platform?.pages ?? []).map((p) => (
        <button key={p.id} type="button" className="nav-pill" onClick={() => os.openApp("devthink", p.id)}>
          {p.label}
        </button>
      ))}
      <span className="os-toolbar__sep" aria-hidden="true" />
      {family.map((a) => (
        <button key={a.id} type="button" className="nav-pill" onClick={() => os.openApp(a.id)}>
          {a.name}
        </button>
      ))}
    </>
  );

  return (
    <div className="fam-view">
      <FamilyStyles />
      <div className="os-toolbar" data-entered={entered ? "true" : "false"}>
        <ToolbarIdent eyebrow="the launcher of the family" title="Gateway" />
        <span className="os-toolbar__sep" aria-hidden="true" />
        {/* the one scope crumb: the mono breadcrumb at the center of the row */}
        <span className="os-toolbar__crumb">devthink.pro / gateway</span>
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
            <Menu size={18} strokeWidth={1.8} />
          </button>
        </div>
        {menuOpen ? (
          <nav id="mobile-nav" className="mobile-menu mobile-only" aria-label="Gateway menu">
            {tabs()}
          </nav>
        ) : null}
      </div>

      <main className="shell">
        {/* HERO — one light source + halftone edge, no box grid */}
        <section
          className="shader-stage halftone-edge"
          style={{ paddingTop: "clamp(40px, 8vw, 96px)", paddingBottom: "clamp(24px, 5vw, 56px)" }}
        >
          <div className="shader-fallback" aria-hidden="true" />
          <div className="grain-overlay" aria-hidden="true" />
          <p className="eyebrow enter" style={stagger(0)}>
            the family operating surface
          </p>
          <h1 className="wordmark enter" style={stagger(1)}>
            Every route, one bar
          </h1>
          <p className="enter max-560" style={{ ...stagger(2), fontSize: "1.12rem", marginTop: 18 }}>
            Nine surfaces, one shell — an Aura chat per app and an always-clean URL bar.
          </p>
          <div className="enter row mt-26" style={stagger(3)}>
            <button type="button" className="cmd-hint press" onClick={os.openCmd} aria-label="Open the command bar">
              <Search size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>Search apps, tabs, actions…</span>
              <kbd>⌘K</kbd>
            </button>
          </div>
          <div className="enter row mt-34" style={stagger(4)}>
            <span className="badge">
              <span className="dot live-dot" aria-hidden="true" /> gateway online
            </span>
            <span className="badge success">{APPS.length} surfaces</span>
            <span className="badge info">glm-5.3 · /v1/chat/completions</span>
            <span className="badge warning">clean-url active</span>
          </div>
        </section>

        {/* SURFACES — the asymmetric launcher: the featured platform column
            at 1.6fr + the family rails; every card = one title + one role
            phrase (the full description stays on the accessible name) */}
        <section className="section tight" aria-labelledby="apps-h">
          <div className="section-head">
            <p className="eyebrow reveal">the family</p>
            <h2 id="apps-h" className="reveal" style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.4rem)" }}>
              One OS, {APPS.length} surfaces
            </h2>
            <p className="reveal">
              Each surface carries its own name and its own Aura — step in, return by the gateway.
            </p>
          </div>
          <div className="dtv3-launch">
            {APPS.map((a, i) => {
              const Icon = a.icon;
              const accent = familyAccentOf(a.id, a.accent);
              return (
                <button
                  key={a.id}
                  type="button"
                  className={`fam-card fam-card--hover app-card enter${a.id === "devthink" ? " dtv3-featured" : ""}`}
                  style={stagger(5 + i)}
                  onClick={() => os.openApp(a.id)}
                  aria-label={`Open ${a.name} — ${a.desc}`}
                >
                  <div className="app-top">
                    <span
                      className="feat-ico"
                      aria-hidden="true"
                      style={{
                        background: "var(--fam-s3)",
                        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${accent} 26%, transparent)`,
                      }}
                    >
                      <Icon size={22} strokeWidth={1.8} style={{ color: accent }} />
                    </span>
                    <StatusDot label="online" />
                  </div>
                  <h3 style={{ marginTop: 14 }}>{a.name}</h3>
                  <p className="app-card__role" style={CARD_ROLE_STYLE}>
                    {a.role}
                  </p>
                  <span className="domain">{a.domain}</span>
                  <span className="go" style={{ color: accent }}>
                    enter the surface <ArrowRight size={15} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* GATEWAY STATUS — the asymmetric split: the chat contract as the
            1.6fr dominant + the support rail; one title + one metric per card */}
        <section className="section tight" aria-labelledby="gw-h">
          <div className="section-head">
            <p className="eyebrow reveal">status</p>
            <h2 id="gw-h" className="reveal" style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}>
              Gateway panel
            </h2>
          </div>
          <div className="dtv3-split">
            <div className="fam-card dtv3-main enter" style={stagger(10)}>
              <div className="row between">
                <h3 style={{ fontSize: "1rem", margin: 0 }}>Chat</h3>
                <Activity size={18} strokeWidth={1.8} aria-hidden="true" style={{ color: "var(--sol-primary)" }} />
              </div>
              <p className="dtv3-metric" style={{ margin: "10px 0 12px" }}>
                POST /v1/chat/completions → glm-5.3
              </p>
              <StatusDot label="200 OK" />
            </div>
            <div className="fam-card enter" style={stagger(11)}>
              <div className="row between">
                <h3 style={{ fontSize: "1rem", margin: 0 }}>Clean bar</h3>
                <Eraser size={18} strokeWidth={1.8} aria-hidden="true" style={{ color: "var(--sol-primary)" }} />
              </div>
              <p className="dtv3-metric" style={{ margin: "10px 0 12px" }}>
                hash, trackers and index.html wiped on every navigation
              </p>
              <StatusDot label="URL always /" tone="info" />
            </div>
            <div className="fam-card enter" style={stagger(12)}>
              <div className="row between">
                <h3 style={{ fontSize: "1rem", margin: 0 }}>Gateway clock</h3>
                <span className="dtv3-clock">{clock}</span>
              </div>
              <p className="dtv3-metric" style={{ margin: "10px 0 12px" }}>
                theme, view and projects live on-device
              </p>
              <StatusDot label="no network beyond chat" tone="warning" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
