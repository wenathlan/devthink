/* ==========================================================================
   DEVTHINK CLEAN-URL MODULE — barra de URL sempre limpa (porta TS do clean-url.js)
   Regra do dono: nenhuma hashtag de rota (#/settings), nenhum lixo de
   redirecionamento (utm_*, gclid, fbclid, index.html, //) visível na barra.
   No DevThink OS a navegação é client-side por estado: `navigate(view)`
   faz o setState interno e sela a barra em "/" via history.replaceState.
   ========================================================================== */

"use strict";

/** Rota em hash do legado estático: #/settings, #settings */
const HASH_ROUTE = /^#\/?/;

/** Padrões de tracker de campanha (portados verbatim do clean-url.js) */
const TRACKERS: RegExp[] = [
  /^(utm_|gclid|fbclid|msclkid|dclid|mc_|ref_?src$)/i,
  /^igshid$/i,
  /^yclid$/i,
  /^twclid$/i,
  /^_tt/i,
  /^srsltid$/i,
];

/** /docs/index.html -> /docs/ */
const BASENAME = /(^|\/)index\.html?$/;

function isTracker(key: string): boolean {
  return TRACKERS.some((rx) => rx.test(key));
}

export type CleanResult = {
  /** URL final limpa */
  url: string;
  /** tokens removidos, para o painel demo */
  removed: {
    hash: string | null;
    trackers: string[];
    indexHtml: boolean;
    doubleSlashes: boolean;
  };
};

/** Limpa QUALQUER URL (mesmo de outro domínio — usada pelo painel demo). */
export function cleanUrlDetailed(input: string, base?: string): CleanResult {
  const removed: CleanResult["removed"] = { hash: null, trackers: [], indexHtml: false, doubleSlashes: false };
  const origin = base ?? (typeof location !== "undefined" ? location.origin : "https://devthink.pro");
  let url: URL;
  try {
    url = new URL(input.trim(), origin);
  } catch {
    return { url: input, removed };
  }

  // 1) rota em hash vira path real: /#/settings -> /settings (âncoras de conteúdo somem)
  if (HASH_ROUTE.test(url.hash)) {
    const hashRaw = url.hash;
    const path = hashRaw.replace(HASH_ROUTE, "/");
    removed.hash = hashRaw;
    try {
      url = new URL(path + url.search, origin);
    } catch {
      return { url: input, removed };
    }
  } else if (url.hash) {
    removed.hash = url.hash;
    try {
      url = new URL(url.pathname + url.search, origin);
    } catch {
      return { url: input, removed };
    }
  }

  // 2) index.html e barras duplicadas somem
  const beforePath = url.pathname;
  url.pathname = url.pathname.replace(BASENAME, "/").replace(/\/{2,}/g, "/");
  if (/(^|\/)index\.html?$/.test(beforePath)) removed.indexHtml = true;
  if (beforePath !== url.pathname && !removed.indexHtml) removed.doubleSlashes = true;

  // 3) trackers de campanha saem da URL
  const keys = Array.from(url.searchParams.keys());
  for (const k of keys) {
    if (isTracker(k)) {
      url.searchParams.delete(k);
      removed.trackers.push(k);
    }
  }

  return { url: url.toString(), removed };
}

/** Forma limpa de uma URL (string). */
export function cleanUrl(input: string, base?: string): string {
  return cleanUrlDetailed(input, base).url;
}

/** Tipo de view do OS (app do gateway ou página de um app). */
export type View = { app: string; page: string };

/**
 * NAVEGAÇÃO DO OS — setState interno + barra sempre limpa.
 * Nunca há hash nem path na URL: `history.replaceState(null, "", "/")`.
 */
export function navigate<T>(view: T, set: (v: T) => void): void {
  set(view);
  if (typeof window !== "undefined") {
    try {
      window.history.replaceState(null, "", "/");
    } catch {
      /* histórico indisponível (sandbox): segue com o estado interno */
    }
  }
}

/** Normaliza a URL atual sem recarregar nem poluir o histórico. */
export function ensureCleanLocation(): boolean {
  if (typeof window === "undefined") return false;
  const { href } = window.location;
  const cleaned = cleanUrl(href, window.location.origin);
  if (cleaned !== href) {
    try {
      window.history.replaceState(window.history.state, "", cleaned);
    } catch {
      return false;
    }
    return true;
  }
  return false;
}

/** Lê rota em hash do legado estático (#/argan/zones) para restaurar a view. */
export function parseHashRoute(hash: string): { app: string; page: string } | null {
  if (!hash || !HASH_ROUTE.test(hash)) return null;
  const path = hash.replace(HASH_ROUTE, "/").replace(/^\/+/, "").replace(/\/+$/, "");
  if (!path) return null;
  const [app, page = "home"] = path.split("/");
  if (!app) return null;
  return { app, page };
}

/**
 * Zelador da barra: limpa na hora e escuta hashchange/popstate.
 * Devolve a rota em hash detectada no boot (deep-link legado) e uma cleanup fn.
 */
export function bindLocationJanitor(): { bootRoute: { app: string; page: string } | null; dispose: () => void } {
  if (typeof window === "undefined") return { bootRoute: null, dispose: () => {} };
  const bootRoute = parseHashRoute(window.location.hash);
  ensureCleanLocation();
  const onChange = () => ensureCleanLocation();
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  return {
    bootRoute,
    dispose: () => {
      window.removeEventListener("hashchange", onChange);
      window.removeEventListener("popstate", onChange);
    },
  };
}
