/**
 * routebase.ts — the base-aware history path of the one interface. The app
 * answers under a project pages subpath on the static hosts, so every raw
 * history write rides the declared vite base: a root-absolute "/panel" break
 * would walk the browser out of the app on a repository host (the site not
 * found page). Pure module, no react, no dom writes.
 */

/** The base the router mounts under: the declared vite base when the build
 * answers under a subpath, empty on a site-root host. */
export function routerbase(): string {
  const declaredBase = import.meta.env.BASE_URL;
  if (declaredBase && declaredBase !== "/" && declaredBase !== "./") {
    return declaredBase.replace(/\/+$/, "");
  }
  if (typeof window === "undefined") return "";
  const bootPath = window.location.pathname.replace(/index\.html$/, "").replace(/\/+$/, "");
  return bootPath;
}

/** One history-safe path: the router path joined onto the base, never a
 * root-absolute url that leaves the app on a subpath host. */
export function historypath(path: string): string {
  const base = routerbase();
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
