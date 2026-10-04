/**
 * app.header.tsx — the in-flow content toolbar of each view: the app's own
 * sections by their real names, the chat toggle, the theme toggle and the
 * back-to-gateway button. This is NOT a second navbar — the ONE chrome of
 * the surface is the shell navbar (ShellChrome, mounted by os.tsx); this
 * row is a plain content toolbar (no banner landmark, no glass chrome).
 */
import { useState } from "react";
import { ArrowLeft, MessageCircle, Menu, Moon, Sun } from "lucide-react";
import type { AppMeta } from "./apps";

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
      <nav className="os-toolbar__nav" aria-label={`${app.name} sections`}>
        {tabs()}
      </nav>

      <div className="os-toolbar__actions">
        <button
          type="button"
          className="icon-btn"
          onClick={onHome}
          aria-label="Back to the gateway"
          title="Back to the gateway"
        >
          <ArrowLeft size={18} strokeWidth={1.8} />
        </button>
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
        <nav id="mobile-nav" className="mobile-menu glass mobile-only" aria-label={`${app.name} menu`}>
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
