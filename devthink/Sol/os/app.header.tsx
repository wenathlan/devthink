/**
 * app.header.tsx — the sticky glass topbar of each sub-view: brand with
 * orb, internal pill navigation (mobile menu sheet), the chat toggle,
 * the theme toggle and the "back to gateway" button.
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

  const pills = (extraClass = "") =>
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
    <header className="topnav" style={{ position: "sticky" }}>
      <button type="button" className="brand" onClick={onHome} aria-label={`${app.name} — voltar ao gateway`}>
        <span className="brand-orb" aria-hidden="true" />
        {app.name}
      </button>

      <nav className="topnav-links" aria-label={`${app.name} — seções`}>
        {pills()}
      </nav>

      <div className="topnav-actions" style={{ marginLeft: "auto" }}>
        <button
          type="button"
          className="icon-btn"
          onClick={onHome}
          aria-label="Voltar ao gateway DevThink OS"
          title="Voltar ao gateway"
        >
          <ArrowLeft size={18} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleChat}
          aria-pressed={chatOpen}
          aria-label={chatOpen ? "Fechar chat Aura deste app" : "Abrir chat Aura deste app"}
          title="Chat Aura"
        >
          <MessageCircle size={18} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          className="icon-btn desktop-only"
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema solar (escuro)"}
          title="Tema"
        >
          {theme === "dark" ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
        </button>
        <button
          type="button"
          className="icon-btn mobile-only"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label="Abrir menu de navegação"
        >
          <Menu size={18} strokeWidth={1.8} />
        </button>
      </div>

      {menuOpen ? (
        <nav id="mobile-nav" className="mobile-menu glass mobile-only" aria-label={`${app.name} — menu`}>
          {pills()}
          <button
            type="button"
            className="nav-pill"
            onClick={() => {
              onToggleTheme();
              setMenuOpen(false);
            }}
          >
            {theme === "dark" ? "Tema claro" : "Tema solar"}
          </button>
        </nav>
      ) : null}
    </header>
  );
}
