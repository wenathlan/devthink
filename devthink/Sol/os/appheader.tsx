/**
 * appheader.tsx — the ONE in-flow content toolbar of every os view: the
 * app's own sections by their real names, one identity block, one actions
 * row and one back grammar. This is NOT a second navbar — the ONE chrome
 * of the surface is the shell navbar (ShellChrome, mounted by os.tsx);
 * this row is a plain content toolbar (no banner landmark, no glass
 * chrome).
 *
 * The toolbar grammar (one height, one scale, everywhere):
 * - identity block: eyebrow 10px mono uppercase tracked (the app role
 *   line, third-person lowercase copy) over the title 20px sans -0.01em.
 * - one back grammar: the leading ArrowLeft button ("back to the
 *   gateway") opens every view, before the identity block.
 * - one actions row: Aura chat toggle, theme toggle (desktop), sections
 *   menu (mobile) — right-aligned, single row.
 * The five views (argan, cadria, debonair, stealthhead, devthink) mount
 * this component with the same prop contract; the gateway toolbar
 * (gatewayhome.tsx) reuses ToolbarIdent for the same scale.
 */

import { ArrowLeft, Menu, MessageCircle, Moon, Sun } from "lucide-react";
import { type CSSProperties, useState } from "react";
import type { AppMeta } from "./apps";

/** the eyebrow of the toolbar scale: 10px mono uppercase tracked muted. */
const EYEBROW_STYLE: CSSProperties = {
  margin: 0,
  font: "600 10px/1.4 var(--dt-mono)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--dt-muted)",
};

/** the title of the toolbar scale: 20px sans -0.01em. */
const TITLE_STYLE: CSSProperties = {
  margin: 0,
  font: "600 20px/1.15 var(--dt-sans)",
  letterSpacing: "-0.01em",
  color: "var(--sol-text)",
  whiteSpace: "nowrap",
};

/** the role line of the launcher cards: same mono micro-label scale. */
export const CARD_ROLE_STYLE: CSSProperties = {
  margin: "2px 0 0",
  font: "600 10px/1.5 var(--dt-mono)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--dt-faint)",
};

/**
 * the shared identity block of the toolbar: one eyebrow over one title at
 * the toolbar scale (a `p` pair — the page h1 stays in the PageSection).
 *
 * @param eyebrow the 10px mono role line (third-person lowercase copy).
 * @param title the 20px sans surface name.
 */
export function ToolbarIdent({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div
      className="os-toolbar__ident"
      style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0, paddingRight: 4 }}
    >
      <p className="os-toolbar__eyebrow" style={EYEBROW_STYLE}>
        {eyebrow}
      </p>
      <p className="os-toolbar__title" style={TITLE_STYLE}>
        {title}
      </p>
    </div>
  );
}

export function AppHeader({
  app,
  active,
  chatOpen,
  onNavigate,
  onHome,
  onToggleChat,
  theme,
  onToggleTheme,
}: {
  app: AppMeta;
  active: string;
  chatOpen: boolean;
  onNavigate: (page: string) => void;
  onHome: () => void;
  onToggleChat: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = (extraClass = "") =>
    app.pages.map((p) => (
      <button
        key={p.id}
        type="button"
        className={`nav-pill ${extraClass}`}
        aria-current={active === p.id ? "page" : undefined}
        onClick={() => {
          onNavigate(p.id);
          setMenuOpen(false);
        }}
      >
        {p.label}
      </button>
    ));

  return (
    <div className="os-toolbar">
      {/* the one back grammar: leading, single, labelled */}
      <button
        type="button"
        className="icon-btn os-toolbar__back"
        onClick={onHome}
        aria-label="Back to the gateway"
        title="Back to the gateway"
      >
        <ArrowLeft size={18} strokeWidth={1.8} />
      </button>

      <ToolbarIdent eyebrow={app.role} title={app.name} />
      <span className="os-toolbar__sep" aria-hidden="true" />

      <nav className="os-toolbar__nav" aria-label={`${app.name} sections`}>
        {tabs()}
      </nav>

      {/* the one actions row */}
      <div className="os-toolbar__actions">
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleChat}
          aria-pressed={chatOpen}
          aria-label={chatOpen ? "Close this app's Aura chat" : "Open this app's Aura chat"}
          title="Aura chat"
        >
          <MessageCircle size={18} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          className="icon-btn desktop-only"
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Switch to the light theme" : "Switch to the solar (dark) theme"}
          title="Theme"
        >
          {theme === "dark" ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
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
        <nav id="mobile-nav" className="mobile-menu mobile-only" aria-label={`${app.name} menu`}>
          {tabs()}
          <button
            type="button"
            className="nav-pill"
            onClick={() => {
              onToggleTheme();
              setMenuOpen(false);
            }}
          >
            {theme === "dark" ? "Light theme" : "Solar theme"}
          </button>
        </nav>
      ) : null}
    </div>
  );
}
