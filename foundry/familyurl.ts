/**
 * familyurl.ts — the address book of the family deploy units that share the
 * host with the foundry. The family redirects both ways: the rail foot of
 * the window links every sibling application and the DevThink OS, and every
 * sibling links back. The deploy units sit beside this one as sibling
 * folders on the shared origin, so the url resolves one level above this
 * application (../slug/), with the slug trimmed of any slashes so both bare
 * names and pasted segments resolve to the same address. Pure and
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
  return `../${slug.replace(/^\/+|\/+$/g, "")}/`;
}
