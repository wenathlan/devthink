/**
 * deploy.base.ts — the deployment base of the running application (root
 * layer).
 *
 * the interface is served from many hosts with different mount points: the
 * project pages mount the site under a repository segment, the self-hosted
 * domains mount it at the root, and the other platforms pick their own
 * prefix. every cross-application link (the family deploy units beside this
 * one) must resolve against the base the browser actually booted from, so
 * the helper derives it from the live location instead of trusting a build
 * constant. pure and multi-mode: the same call runs in the browser (the
 * shell navigations) and in node (the unit tests), with zero storage.
 */

/** derives the mount base of the application from a boot path.
 *
 * @param pathname the live window path (or any path to derive from).
 * @returns the base with no trailing slash; an empty string at the root.
 */
export function derivebase(pathname: string): string {
  let stripped = pathname.replace(/index\.html$/, "").replace(/\/+$/, "");
  /* a session restore boots through the workspace route (/w/...): the mount
   * base ends where that route begins, never inside it. */
  const workspace = stripped.indexOf("/w/");
  if (workspace > 0) stripped = stripped.slice(0, workspace);
  return stripped;
}

/** the base frozen at module evaluation: the boot pathname is the only path
 * that reflects the mount point — by click time the router may already sit
 * on a restored workspace route. */
let bootbase: string | null = null;

/** reads the mount base of the live document (empty string in node).
 *
 * @returns the base the application booted under.
 */
export function deploybase(): string {
  if (typeof window === "undefined") return "";
  if (bootbase === null) bootbase = derivebase(window.location.pathname);
  return bootbase;
}

/** resolves the url of a family deploy unit that shares this origin.
 *
 * @param slug the deploy unit segment (the app folder name).
 * @returns the absolute path of the family application.
 */
export function familyurl(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  const base = deploybase();
  return base === "" ? `/${clean}` : `${base}/${clean}`;
}
