"use client";

/* ==========================================================================
   DevThinkOS — raiz do OS (client-side, UMA rota "/"):
   · estado global de view { app, page } persistido (localStorage)
   · módulo clean-url: barra sempre "/", hashchange/popstate vigiados
   · tema sol/claro + reduce-motion aplicados no <html>
   · ⌘K command menu · toasts sonner · reveal on scroll · footer sticky
   ========================================================================== */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";
import {
  bindLocationJanitor,
  navigate as cleanNavigate,
} from "../engine/clean-url";
import { useReveal } from "../engine/reveal";
import { useStoredState } from "../engine/use-stored-state";
import { appMeta, type AppId } from "../engine/apps";
import {
  DEFAULT_SETTINGS,
  isOSSettings,
  isOSView,
  type OSHandle,
  type OSSettings,
  type OSView,
} from "../engine/os-types";
import { CommandMenu } from "./command-menu";
import { GatewayHome } from "./gateway-home";
import { DevThinkApp } from "../apps/devthink-app";
import { ArganApp } from "../apps/argan-app";
import { DebonairApp } from "../apps/debonair-app";
import { CadriaApp } from "../apps/cadria-app";
import { StealthheadApp } from "../apps/stealthhead-app";

const GATEWAY_VIEW: OSView = { app: "gateway", page: "home" };

export function DevThinkOS() {
  const [view, setView] = useStoredState<OSView>("dt-os-view-v1", GATEWAY_VIEW, isOSView);
  const [settings, setSettings] = useStoredState<OSSettings>("dt-os-settings-v1", DEFAULT_SETTINGS, isOSSettings);
  const [cmdOpen, setCmdOpen] = useState(false);

  /* ---- navegação (sempre barra limpa "/") ---- */
  const navigate = useCallback(
    (next: OSView) => {
      cleanNavigate<OSView>(next, setView);
    },
    [setView]
  );

  const openApp = useCallback(
    (app: AppId, page = "home") => {
      navigate({ app, page });
    },
    [navigate]
  );

  const goGateway = useCallback(() => navigate(GATEWAY_VIEW), [navigate]);

  const updateSettings = useCallback(
    (patch: Partial<OSSettings>) => setSettings((prev) => ({ ...prev, ...patch })),
    [setSettings]
  );

  const toggleTheme = useCallback(() => {
    setSettings((prev) => {
      const theme = prev.theme === "dark" ? "light" : "dark";
      toast[theme === "light" ? "info" : "success"](
        theme === "light" ? "Tema claro" : "Tema solar",
        { description: theme === "light" ? "Superfícies invertidas, mesmo engine." : "#0B0806 · #F59E0B · #FFFBEB" }
      );
      return { ...prev, theme };
    });
  }, [setSettings]);

  const openCmd = useCallback(() => setCmdOpen(true), []);

  /* ---- tema + reduce-motion no <html> ---- */
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
  }, [settings.theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.reduceMotion) root.setAttribute("data-motion", "reduced");
    else root.removeAttribute("data-motion");
  }, [settings.reduceMotion]);

  /* ---- zelador da barra de URL + deep-link legado (#/app/page) ---- */
  useEffect(() => {
    const janitor = bindLocationJanitor();
    if (janitor.bootRoute) {
      const meta = appMeta(janitor.bootRoute.app);
      if (meta) {
        const page = meta.pages.some((p) => p.id === janitor.bootRoute?.page) ? janitor.bootRoute.page : "home";
        setView({ app: meta.id, page });
      }
    }
    return janitor.dispose;
  }, [setView]);

  /* ---- ⌘K / Ctrl+K ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---- reveal on scroll + topo ao trocar de view ---- */
  useReveal([view.app, view.page]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view.app, view.page]);

  /* ---- handle compartilhado ---- */
  const os = useMemo<OSHandle>(
    () => ({ view, navigate, openApp, goGateway, settings, updateSettings, toggleTheme, openCmd }),
    [view, navigate, openApp, goGateway, settings, updateSettings, toggleTheme, openCmd]
  );

  const app = view.app === "gateway" ? undefined : appMeta(view.app);
  const knownApp = view.app !== "gateway" && app ? view.app : undefined;

  return (
    <div className="os-root">
      <Toaster
        position="bottom-center"
        theme={settings.theme === "light" ? "light" : "dark"}
        toastOptions={{
          style: {
            background: "var(--sol-bg-2)",
            color: "var(--sol-text)",
            border: "1px solid var(--sol-line-strong)",
            borderRadius: "14px",
            fontFamily: "inherit",
          },
        }}
      />

      <div className="view-enter" key={`${view.app}:${view.page}`} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {view.app === "gateway" || !knownApp ? (
          <GatewayHome os={os} />
        ) : knownApp === "devthink" ? (
          <DevThinkApp os={os} />
        ) : knownApp === "argan" ? (
          <ArganApp os={os} />
        ) : knownApp === "debonair" ? (
          <DebonairApp os={os} />
        ) : knownApp === "cadria" ? (
          <CadriaApp os={os} />
        ) : (
          <StealthheadApp os={os} />
        )}
      </div>

      <footer className="footer">
        <span>
          © {new Date().getFullYear()} wenathlan · devthink.pro — {app ? `${app.name} · ${app.domain}` : "gateway do DevThink OS"}
        </span>
        <span className="spacer" />
        <button type="button" onClick={goGateway}>
          Gateway
        </button>
        <button type="button" onClick={() => openApp("devthink", "docs")}>
          Docs
        </button>
        <button type="button" onClick={() => openApp("devthink", "explore")}>
          Explore
        </button>
        <button type="button" onClick={() => openApp("devthink", "settings")}>
          Settings
        </button>
      </footer>

      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} os={os} />
    </div>
  );
}
