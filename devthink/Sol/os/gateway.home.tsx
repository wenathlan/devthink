/**
 * gateway.home.tsx — the opening screen of the os: the launcher with the
 * 5 apps as showcase cards, the command bar (Cmd+K), the gateway clock
 * and status, and the theme toggle. Clicking an app enters it (250ms
 * riseIn transition). The Sol workbench design prevails: the os palette
 * is mapped onto the --dt-* tokens in Sol/index.css.
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
      setNow(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
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
          aria-label={`Abrir app ${a.name}`}
        >
          {a.name}
        </button>
      ))}
    </>
  );

  return (
    <>
      <header className="topnav">
        <button type="button" className="brand" onClick={() => setMenuOpen(false)} aria-label="DevThink OS — gateway">
          <span className="brand-orb" aria-hidden="true" />
          DevThink OS
        </button>
        <nav className="topnav-links" aria-label="Apps do gateway">
          {headerNav}
        </nav>
        <div className="topnav-actions" style={{ marginLeft: "auto" }}>
          <span className="clock desktop-only" aria-label="Relógio do gateway">
            {clock}
          </span>
          <button
            type="button"
            className="icon-btn desktop-only"
            onClick={os.openCmd}
            aria-label="Abrir barra de comando (Command K)"
            title="Barra de comando (⌘K)"
          >
            <Command size={18} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={os.toggleTheme}
            aria-label={os.settings.theme === "dark" ? "Mudar para tema claro" : "Mudar para tema solar (escuro)"}
            title="Tema"
          >
            {os.settings.theme === "dark" ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
          </button>
          <button
            type="button"
            className="icon-btn mobile-only"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Abrir menu de apps"
          >
            <Search size={18} strokeWidth={1.8} />
          </button>
        </div>
        {menuOpen ? (
          <nav id="mobile-nav" className="mobile-menu glass mobile-only" aria-label="Menu de apps">
            {headerNav}
          </nav>
        ) : null}
      </header>

      <main className="shell">
        {/* HERO */}
        <section style={{ paddingTop: "clamp(40px, 8vw, 96px)", paddingBottom: "clamp(24px, 5vw, 56px)" }}>
          <p className="eyebrow reveal">gateway · todas as rotas em uma barra</p>
          <h1 className="wordmark reveal in">DevThink OS</h1>
          <p className="reveal in max-560" style={{ fontSize: "1.12rem", marginTop: 18 }}>
            O launcher do workbench provider-neutral: cinco apps em um shell só, chat Aura por app chamando o gateway
            local, barra de URL sempre limpa e persistência 100% no seu dispositivo.
          </p>
          <div className="reveal in row mt-26">
            <button type="button" className="cmd-hint" onClick={os.openCmd} aria-label="Abrir a barra de comando">
              <Search size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>Buscar apps, abas, ações…</span>
              <kbd>⌘K</kbd>
            </button>
          </div>
          <div className="reveal in row mt-34">
            <span className="badge">
              <span className="dot" aria-hidden="true" /> gateway online
            </span>
            <span className="badge success">5 apps</span>
            <span className="badge info">glm-5.3 · /v1/chat/completions</span>
            <span className="badge warning">clean-url ativo</span>
          </div>
        </section>

        {/* APPS — showcase cards */}
        <section className="section tight" aria-labelledby="apps-h">
          <div className="section-head">
            <p className="eyebrow reveal">a família</p>
            <h2 id="apps-h" className="reveal" style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.4rem)" }}>
              Cinco apps, um engine
            </h2>
            <p className="reveal">
              Cada app é uma vitrine própria com header, navegação interna e chat Aura com persona — entre e volte pelo
              botão do gateway.
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
                  aria-label={`Entrar no app ${a.name} (${a.domain})`}
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
                    entrar no app <ArrowRight size={15} strokeWidth={1.8} aria-hidden="true" />
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
              Painel do gateway
            </h2>
          </div>
          <div className="grid cols-3">
            <div className="glass card reveal">
              <div className="row between">
                <h3 style={{ fontSize: "1rem", margin: 0 }}>Chat</h3>
                <Activity size={18} strokeWidth={1.8} aria-hidden="true" style={{ color: "var(--sol-primary)" }} />
              </div>
              <p className="small mt-8" style={{ marginBottom: 8 }}>
                POST <code>/v1/chat/completions</code> · modelo <code>devthink</code> → glm-5.3, com{" "}
                <code>reasoning_content</code> virando cognição interna nas bolhas.
              </p>
              <StatusDot label="200 OK" />
            </div>
            <div className="glass card reveal">
              <div className="row between">
                <h3 style={{ fontSize: "1rem", margin: 0 }}>Barra limpa</h3>
                <Eraser size={18} strokeWidth={1.8} aria-hidden="true" style={{ color: "var(--sol-primary)" }} />
              </div>
              <p className="small mt-8" style={{ marginBottom: 8 }}>
                Navegação = <code>setState</code> + <code>history.replaceState(&quot;/&quot;)</code>. Hash, trackers e{" "}
                <code>index.html</code> são limpos em <code>hashchange</code>/<code>popstate</code>.
              </p>
              <StatusDot label="URL sempre /" tone="info" />
            </div>
            <div className="glass card reveal">
              <div className="row between">
                <h3 style={{ fontSize: "1rem", margin: 0 }}>Relógio do gateway</h3>
                <span className="clock">{clock}</span>
              </div>
              <p className="small mt-8" style={{ marginBottom: 8 }}>
                Sessão client-first: tema, view ativa, projetos, settings e chats vivem em <code>localStorage</code>{" "}
                via <code>useStoredState</code>.
              </p>
              <StatusDot label="sem rede além do chat" tone="warning" />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
