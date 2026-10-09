/**
 * familyurl.ts — the cross-application resolver of the forge (root layer).
 * The rail foot of the application window links every sibling deploy unit
 * of the family; each sibling is mounted one level up from this app, so the
 * helper builds the relative url from the slug directly. Pure and
 * side-effect free: no storage, no location read — the same call runs in
 * the browser (the rail links) and in node (unit tests).
 */

/**
 * Resolves the url of a family deploy unit beside this application.
 *
 * @param slug the deploy unit segment (the app folder name, e.g. "cadria").
 * @returns the relative url of the family application, with the trailing
 * slash so the sibling's clean-url doctrine answers the request.
 */
export function familyurl(slug: string): string {
  return `../${slug.replace(/^\/+|\/+$/g, "")}/`;
}
