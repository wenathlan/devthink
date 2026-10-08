/**
 * cleanurl.ts — the DEVTHINK CLEAN-URL MODULE (owner rule): the address
 * bar is always clean. No route hash (#/settings), no redirect garbage
 * (utm_*, gclid, fbclid, index.html, //) is ever visible. In the os the
 * navigation is client-side state: `navigate(view)` sets the internal
 * state and seals the bar at "/" via history.replaceState.
 */

/** legacy static hash route: #/settings, #settings */
const HASH_ROUTE = /^#\/?/;

/** campaign tracker patterns (ported verbatim from clean-url.js) */
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
  /** the final clean url */
  url: string;
  /** the removed tokens, shown by the demo panel */
  removed: {
    hash: string | null;
    trackers: string[];
    indexHtml: boolean;
    doubleSlashes: boolean;
  };
};

/**
 * cleans ANY url (even of another domain — the demo panel uses it).
 *
 * @param input the dirty url.
 * @param base the optional origin to resolve against.
 * @returns the clean url plus the tokens that were removed.
 */
export function cleanUrlDetailed(input: string, base?: string): CleanResult {
  const removed: CleanResult["removed"] = { hash: null, trackers: [], indexHtml: false, doubleSlashes: false };
  const origin = base ?? (typeof location !== "undefined" ? location.origin : "https://devthink.pro");
  let url: URL;
  try {
    url = new URL(input.trim(), origin);
  } catch {
    return { url: input, removed };
  }

  // 1) a hash route becomes a real path: /#/settings -> /settings (content anchors disappear)
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

  // 2) index.html and duplicated slashes disappear
  const beforePath = url.pathname;
  url.pathname = url.pathname.replace(BASENAME, "/").replace(/\/{2,}/g, "/");
  if (/(^|\/)index\.html?$/.test(beforePath)) removed.indexHtml = true;
  if (beforePath !== url.pathname && !removed.indexHtml) removed.doubleSlashes = true;

  // 3) campaign trackers leave the url
  const keys = Array.from(url.searchParams.keys());
  for (const k of keys) {
    if (isTracker(k)) {
      url.searchParams.delete(k);
      removed.trackers.push(k);
    }
  }

  return { url: url.toString(), removed };
}

/**
 * clean form of a url as a plain string.
 *
 * @param input the dirty url.
 * @param base the optional origin to resolve against.
 * @returns the clean url.
 */
export function cleanUrl(input: string, base?: string): string {
  return cleanUrlDetailed(input, base).url;
}

/** the view type of the os (a gateway page or a page of one app). */
export type View = { app: string; page: string };

/**
 * NAVIGATION OF THE OS — internal setState + always clean bar.
 * There is never a hash or path in the url: `history.replaceState(null, "", "/")`.
 *
 * @param view the next view.
 * @param set the state setter of the caller.
 */
export function navigate<T>(view: T, set: (v: T) => void): void {
  set(view);
  if (typeof window !== "undefined") {
    try {
      window.history.replaceState(null, "", "/");
    } catch {
      /* history unavailable (sandbox): the internal state carries on */
    }
  }
}

/**
 * normalizes the current url without reloading or polluting history.
 *
 * @returns true when the bar was actually rewritten.
 */
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

/**
 * reads a legacy static hash route (#/argan/zones) to restore a view.
 *
 * @param hash the location hash.
 * @returns the parsed route or null.
 */
export function parseHashRoute(hash: string): { app: string; page: string } | null {
  if (!hash || !HASH_ROUTE.test(hash)) return null;
  const path = hash.replace(HASH_ROUTE, "/").replace(/^\/+/, "").replace(/\/+$/, "");
  if (!path) return null;
  const [app, page = "home"] = path.split("/");
  if (!app) return null;
  return { app, page };
}

/**
 * bar janitor: cleans on the spot and listens to hashchange/popstate.
 *
 * @returns the boot hash route (legacy deep link) and a dispose fn.
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
