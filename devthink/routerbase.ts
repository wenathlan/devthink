/**
 * routerbase.ts — the router base owner of the family: ONE derivation law
 * for the wouter base every app anchor consults, the single canonical
 * implementation the family apps import per the dedup law (the app
 * routerbase.ts files are thin doors onto this seat — the same grammar the
 * reveal and personalstore doors ride).
 *
 * the law answers three mount doors with one truth:
 *   1. the declared build base wins first — a pages deployment that
 *      carries its vite base (VITE_BASE_PATH, e.g. "/devthink/cadria/")
 *      never consults the runtime path;
 *   2. a root-declared build ("/", "./") derives the base from the boot
 *      pathname through the app's own slug: the slug segment owns the
 *      mount boundary, everything through it is the base and everything
 *      after it is the route — the family dev bridge serves every sibling
 *      at "/<slug>/" under the one dev server, and the relative hosts
 *      mount the pages under "<folder>/<slug>/";
 *   3. a path that never carries the slug is a route tree at the root —
 *      the base stays empty so the deep links of a root-mounted app land
 *      on their pages (the flattening era dies: "/studio" is a route,
 *      never a folder).
 *
 * client-safe by construction: zero imports — no react, no wouter, no node
 * builtins, no storage, no network — so every static bundle of every app
 * can carry the door without dragging anything into the graph. The os
 * envelope (devthink/App.tsx) keeps its own door: the os mounts at the
 * site root where any folder prefix is the base at a cold boot (the
 * dispatcher parks deep links at the application root first) — a law the
 * slug-bearing apps never need, so the two seats stay honest to their
 * surfaces.
 */

/** The slug-aware wouter base of one family app.
 *
 * @param slug the deploy unit slug of the calling app (its repository
 *   folder name — "cadria", "debonair", …): the segment the runtime path
 *   consults when the build declares no absolute base.
 * @returns the router base string ("" at the root, "/<slug>" under the
 *   dev bridge, "/<folder>/<slug>" or the declared base otherwise).
 */
export function routerBase(slug: string): string {
  const declared = (typeof import.meta !== "undefined" ? (import.meta.env?.BASE_URL as string | undefined) : undefined) ?? "/";
  if (declared !== "/" && declared !== "./") return declared.replace(/\/+$/, "");
  if (typeof window === "undefined") return "";
  const path = window.location.pathname.replace(/index\.html$/, "").replace(/\/+$/, "");
  if (path === "") return "";
  const segments = path.split("/").filter(Boolean);
  const at = segments.indexOf(slug);
  if (at >= 0) return `/${segments.slice(0, at + 1).join("/")}`;
  return "";
}
