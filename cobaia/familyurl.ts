/**
 * familyurl.ts — the address book of the family deploy units that share the
 * host with the cobaia. The family redirects both ways: the site directory
 * (/apps) links every sibling application and the DevThink OS, and every
 * sibling links back through its own copy of this helper. The deploy units
 * sit beside this one as sibling folders on the shared origin, so the url
 * resolves one level above this application (../slug/), with the slug
 * trimmed of any slashes so both bare names and pasted segments resolve to
 * the same address. The DevThink OS itself answers at the family root of
 * the host (the pages site root — the real deploy of the os), never one
 * segment deep, so the devthink slug resolves to the root while every
 * other slug resolves to the sibling folder beside this one. Pure and
 * side-effect free: the helper only shapes strings.
 */

/**
 * Resolves the url of a family deploy unit that shares this origin.
 *
 * @param slug the deploy unit segment (the app folder name).
 * @returns the relative url of the family application, one level above this
 * deploy unit, always carrying the trailing slash.
 */
export function familyurl(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  // the os answers at the family root itself: the devthink slug resolves to
  // the root (the real deploy of the os), every other slug to the sibling
  // folder one level up from this deploy unit
  if (clean === "devthink") return "../";
  return `../${clean}/`;
}
