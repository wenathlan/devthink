/**
 * os page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file; no module outside the folder imports the folder members
 * directly. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/**
 * Os.tsx — the /os route anchor of the Sol workbench: the dissolved
 * DevThink OS (formerly the Next.js route under devthink/os with
 * page.tsx/layout.tsx). One client-side surface with a single view state:
 * - global view state { app, page } persisted (localStorage)
 * - clean-url module: the bar is always "/", hashchange/popstate watched
 * - solar/light theme + reduce-motion applied to <html>
 * - Cmd+K command menu · toasts via the app-level sonner Toaster (the
 *   Sol App.tsx mounts the single Toaster, so no second one here) ·
 *   reveal on scroll · sticky footer
 * The Sol workbench design prevails: the os palette is remapped onto the
 * --dt-* tokens of Sol/sol.css (see the "OS view" section there).
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  bindLocationJanitor,
  navigate as cleanNavigate,
} from "./clean.url";
import { useReveal } from "./reveal";
import { useStoredState } from "./use.stored.state";
import { appMeta, type AppId } from "./apps";
import {
  DEFAULT_SETTINGS,
  isOSSettings,
  isOSView,
  type OSHandle,
  type OSSettings,
  type OSView,
} from "./os.types";
import { CommandMenu } from "./command.menu";
import { GatewayHome } from "./gateway.home";
import { DevThinkApp } from "./devthink.view";
import { ArganApp } from "./argan.view";
import { DebonairApp } from "./debonair.view";
import { CadriaApp } from "./cadria.view";
import { StealthheadApp } from "./stealthhead.view";

export * from "./app.header";
export * from "./argan.view";
export * from "./aura.chat";
export * from "./cadria.view";
export * from "./command.menu";
export * from "./debonair.view";
export * from "./devthink.view";
export * from "./gateway.home";
export * from "./glass.card";
export * from "./modal";
export * from "./page.section";
export * from "./status.dot";
export * from "./stealthhead.view";
export * from "./url.cleaner.demo";

const GATEWAY_VIEW: OSView = { app: "gateway", page: "home" };

export default function Os() {
  const [view, setView] = useStoredState<OSView>("dt-os-view-v1", GATEWAY_VIEW, isOSView);
  const [settings, setSettings] = useStoredState<OSSettings>("dt-os-settings-v1", DEFAULT_SETTINGS, isOSSettings);
  const [cmdOpen, setCmdOpen] = useState(false);

  /* ---- navigation (the bar is always clean "/") ---- */
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
        theme === "light" ? "Light theme" : "Solar theme",
        { description: theme === "light" ? "Inverted surfaces, same engine." : "#0B0806 · #F59E0B · #FFFBEB" }
      );
      return { ...prev, theme };
    });
  }, [setSettings]);

  const openCmd = useCallback(() => setCmdOpen(true), []);

  /* ---- theme + reduce-motion on <html> ---- */
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

  /* ---- bar janitor + legacy deep link (#/app/page) ---- */
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

  /* ---- Cmd+K / Ctrl+K ---- */
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

  /* ---- reveal on scroll + top on view change ---- */
  useReveal([view.app, view.page]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  /* ---- shared handle ---- */
  const os = useMemo<OSHandle>(
    () => ({ view, navigate, openApp, goGateway, settings, updateSettings, toggleTheme, openCmd }),
    [view, navigate, openApp, goGateway, settings, updateSettings, toggleTheme, openCmd]
  );

  const app = view.app === "gateway" ? undefined : appMeta(view.app);
  const knownApp = view.app !== "gateway" && app ? view.app : undefined;

  return (
    <div className="os-root">
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
          © {new Date().getFullYear()} wenathlan · devthink.pro — {app ? `${app.name} · ${app.domain}` : "DevThink OS gateway"}
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
