/**
 * familyurl.ts — the url of a family application beside this one (root
 * layer).
 *
 * the family deploys as sibling folders on one host: saddle lives at
 * /saddle/, the other deploy units at /<slug>/, and every cross-application
 * link must survive any mount point (project pages, self-hosted domains,
 * bare local preview servers) without trusting a build constant or reading
 * the live location. the helper therefore builds a RELATIVE url — one level
 * up from the current deploy unit, then into the sibling folder — so the
 * chrome of the window resolves the family from wherever the app is
 * mounted. pure and multi-mode: the same call runs in the browser and in
 * node (the unit tests), with zero storage.
 */

/** resolves the url of a family deploy unit that shares this host.
 *
 * @param slug the deploy unit segment (the app folder name); decorative
 *   slashes are stripped.
 * @returns the relative path of the family application, slash-terminated.
 */
export function familyurl(slug: string): string {
  // biome-ignore lint/style/useTemplate: the family contract body stays verbatim — every app of the family copies this exact line
  return "../" + slug.replace(/^\/+|\/+$/g, "") + "/";
}
