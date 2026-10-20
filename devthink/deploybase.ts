/**
 * deploybase.ts — the deployment base of the running application (root
 * layer).
 *
 * the interface is served from many hosts with different mount points: the
 * project pages mount the site under a repository segment, the self-hosted
 * domains mount it at the root, and the other platforms pick their own
 * prefix. two helpers answer that reality:
 *
 * - `derivebase` derives the mount base of this application from a boot
 *   path (pure, node-safe) — the absolute form a host needs to address
 *   this app's own segments from outside.
 * - `familyurl` resolves a FAMILY deploy unit (argan, cadria, …, saddle —
 *   the sibling folders beside this one in the shared repository). the
 *   family contract is relative and identical in every member app: one
 *   "../" ride out of this app's mount segment followed by the sibling
 *   slug. the browser resolves it against the segment the page actually
 *   booted from, so the same call lands on the sibling on the dev server,
 *   on a GitHub Pages project subpath and on a self-hosted domain root —
 *   no build constant, no hardcoded "/<slug>" absolute path. pure and
 *   multi-mode: the same call runs in the browser (the shell navigations)
 *   and in node (the unit tests), with zero storage.
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
  if (workspace >= 0) stripped = stripped.slice(0, workspace);
  return stripped;
}

/** the base frozen at module evaluation: the boot pathname is the only path
 * that reflects the mount point — by click time the router may already sit
 * on a restored workspace route. */
let bootbase: string | null = null;

/** reads the mount base of the live document (empty string in node).
 *
 * The build-time base wins when the deploy provides one (the pages build
 * sets VITE_BASE_PATH — it is the true mount point and the boot pathname
 * can never contradict it, because the spa routes it owns — /panel, /chat,
 * a family arrival — are segments of the app, not of the host). The boot
 * pathname answers only when no build base exists (self-hosted roots).
 *
 * @returns the base the application booted under (no trailing slash).
 */
export function deploybase(): string {
  if (typeof window === "undefined") return "";
  if (bootbase === null) {
    const buildbase = import.meta.env.BASE_URL;
    if (buildbase && buildbase !== "/" && buildbase !== "./") {
      bootbase = buildbase.replace(/\/+$/, "");
    } else {
      bootbase = derivebase(window.location.pathname);
    }
  }
  return bootbase;
}

/**
 * Resolves the url of a family deploy unit that shares this origin.
 *
 * The verbatim family form (the same recipe every member app carries):
 * `"../" + slug with trimmed slashes + "/"`. Leading and trailing slashes
 * on the slug are tolerated and never doubled. The form is RELATIVE by
 * contract — one hop out of the app's own mount segment, then the sibling
 * slug — and the browser resolves it against the segment the page
 * actually booted from: a devthink page at /panel resolves "../saddle/"
 * to "/saddle/", a family arrival at /saddle resolves it to "/saddle/"
 * too (the parent of the mount is the site root), and a project-pages
 * mount at /devthink/ lands on the sibling the same way. The absolute
 * form the module once answered ("deploybase() + /<slug>/") died on the
 * family arrival routes exactly there: a boot at /saddle froze the base
 * at "/saddle" and the power clip iframe asked for "/saddle/saddle/" —
 * a url that answers nothing. The relative contract never meets that
 * wall: it names the sibling by position, never by the boot's own
 * segment.
 *
 * @param slug the deploy unit segment (the app folder name).
 * @returns the in-site url of the family application ("../<slug>/").
 */
export function familyurl(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  return `../${clean}/`;
}
