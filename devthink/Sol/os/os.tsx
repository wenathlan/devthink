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
 * --dt-* tokens of Sol/sol.css (see the "OS view" section there). The
 * chrome is the ONE shell navbar (ShellChrome); the views open with an
 * in-flow content toolbar (.os-toolbar), never a second header, and no
 * surface inside carries a "DevThink" label — the sections carry their
 * real identities (Chat, Docs, Explore, Gateway and the family names).
 * The view switch plays ONE transition: opacity + a 4px rise on 250ms
 * var(--dt-ease), guarded for reduced motion (os setting or system
 * preference) — never the two-motion stack.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { bindLocationJanitor, navigate as cleanNavigate } from "../../cleanurl";
import { ShellChrome } from "../shell/ShellChrome";
import { type AppId, appMeta } from "./apps";
import { ArganApp } from "./arganview";
import { CadriaApp } from "./cadriaview";
import { CommandMenu } from "./commandmenu";
import { DebonairApp } from "./debonairview";
import { DevThinkApp } from "./devthinkview";
import { GatewayHome } from "./gatewayhome";
import { DEFAULT_SETTINGS, isOSSettings, isOSView, type OSHandle, type OSSettings, type OSView } from "./ostypes";
import { useReveal } from "./reveal";
import { StealthheadApp } from "./stealthheadview";
import { useStoredState } from "./usestoredstate";

export * from "./appheader";
export * from "./arganview";
export * from "./aurachat";
export * from "./cadriaview";
export * from "./commandmenu";
export * from "./debonairview";
export * from "./devthinkview";
export * from "./gatewayhome";
export * from "./glasscard";
export * from "./modal";
export * from "./pagesection";
export * from "./statusdot";
export * from "./stealthheadview";
export * from "./urlcleanerdemo";

const GATEWAY_VIEW: OSView = { app: "gateway", page: "home" };

/** the one view-switch motion: 250ms, opacity + 4px rise, no second animation. */
const VIEW_TRANSITION = "opacity 250ms var(--dt-ease), transform 250ms var(--dt-ease)";

/** reduced motion, both sources: the os setting and the system preference. */
function motionReduced(): boolean {
  if (typeof window === "undefined") return true;
  if (document.documentElement.dataset.motion === "reduced") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Os() {
  const [view, setView] = useStoredState<OSView>("dt-os-view-v1", GATEWAY_VIEW, isOSView);
  const [settings, setSettings] = useStoredState<OSSettings>("dt-os-settings-v1", DEFAULT_SETTINGS, isOSSettings);
  const [cmdOpen, setCmdOpen] = useState(false);
  /* the view-switch state: the fresh mount starts hidden (opacity 0, 4px
     down) and flips one frame later so the 250ms transition plays; the
     reduced guard skips the hidden frame entirely */
  const [entered, setEntered] = useState(() => motionReduced());

  /* ---- navigation (the bar is always clean "/") ---- */
  const navigate = useCallback(
    (next: OSView) => {
      cleanNavigate<OSView>(next, setView);
    },
    [setView],
  );

  const openApp = useCallback(
    (app: AppId, page = "home") => {
      navigate({ app, page });
    },
    [navigate],
  );

  const goGateway = useCallback(() => navigate(GATEWAY_VIEW), [navigate]);

  const updateSettings = useCallback(
    (patch: Partial<OSSettings>) => setSettings((prev) => ({ ...prev, ...patch })),
    [setSettings],
  );

  const toggleTheme = useCallback(() => {
    setSettings((prev) => {
      const theme = prev.theme === "dark" ? "light" : "dark";
      toast[theme === "light" ? "info" : "success"](theme === "light" ? "Light theme" : "Solar theme", {
        description: theme === "light" ? "Inverted surfaces, same engine." : "#0B0806 · #F59E0B · #FFFBEB",
      });
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

  /* ---- the one view-switch transition ---- */
  // biome-ignore lint/correctness/useExhaustiveDependencies: the view app/page are the change signals — the switch must re-arm on every view change, not on identity changes.
  useEffect(() => {
    if (motionReduced()) {
      setEntered(true);
      return undefined;
    }
    const frame = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, [view.app, view.page]);

  /* ---- shared handle ---- */
  const os = useMemo<OSHandle>(
    () => ({ view, navigate, openApp, goGateway, settings, updateSettings, toggleTheme, openCmd }),
    [view, navigate, openApp, goGateway, settings, updateSettings, toggleTheme, openCmd],
  );

  const app = view.app === "gateway" ? undefined : appMeta(view.app);
  const knownApp = view.app !== "gateway" && app ? view.app : undefined;

  return (
    <div className="os-root">
      <ShellChrome />
      <div
        className="view-enter"
        key={`${view.app}:${view.page}`}
        data-entered={entered ? "true" : "false"}
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          /* the inline pass owns the switch: the css entry animation steps
             aside so exactly one 250ms motion plays per view change */
          animation: "none",
          opacity: entered ? 1 : 0,
          transform: entered ? "none" : "translateY(4px)",
          transition: VIEW_TRANSITION,
        }}
      >
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
          © {new Date().getFullYear()} wenathlan · devthink.pro — {app ? `${app.name} · ${app.domain}` : "Gateway"}
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
