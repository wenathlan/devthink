/**
 * familyurl.ts — the two-way door of the family.
 *
 * vault never pretends to be the whole network: the rail foot links the
 * sibling applications and the DevThink OS, and every sibling links back.
 * The family deploys share one origin, each application under its own
 * segment, so a family address is always the deploy base of this clone
 * followed by the sibling slug — vault is staged one level deep, hence the
 * relative "../" ride. Trailing and leading slashes on the slug are
 * tolerated and never doubled.
 */

/**
 * Resolves the url of a family deploy unit that shares this origin.
 *
 * @param slug the deploy unit segment (the app folder name).
 * @returns the relative url of the family application.
 */
export function familyurl(slug: string): string {
  // biome-ignore lint/style/useTemplate: the verbatim family form of the recipe
  return "../" + slug.replace(/^\/+|\/+$/g, "") + "/";
}
