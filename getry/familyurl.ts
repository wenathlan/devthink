/**
 * familyurl.ts — the url of a family application beside this one (root
 * layer).
 *
 * the family deploys as sibling folders on one host: getry lives at
 * /getry/, the other deploy units at /<slug>/, and every cross-application
 * link must survive any mount point (project pages, self-hosted domains,
 * bare local preview servers) without trusting a build constant or reading
 * the live location. the helper therefore builds a RELATIVE url — one level
 * up from the current deploy unit, then into the sibling folder — so the
 * chrome of the window resolves the family from wherever the app is
 * mounted. the os itself answers at the family root of the host (the pages
 * site root — the real deploy of the os), never one segment deep, so the
 * devthink slug resolves to the root while every other slug resolves to
 * the sibling folder beside this one. pure and multi-mode: the same call
 * runs in the browser and in node (the unit tests), with zero storage.
 */

/** resolves the url of a family deploy unit that shares this host.
 *
 * @param slug the deploy unit segment (the app folder name); decorative
 *   slashes are stripped.
 * @returns the relative path of the family application, slash-terminated.
 */
export function familyurl(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  // the os answers at the family root itself: the devthink slug resolves to
  // the root (the real deploy of the os), every other slug to the sibling
  // folder one level up from this deploy unit
  if (clean === "devthink") return "../";
  // biome-ignore lint/style/useTemplate: the family contract body stays verbatim — every app of the family copies this exact line
  return "../" + clean + "/";
}
