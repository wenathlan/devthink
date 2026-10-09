/**
 * familyurl.ts — the family address book of the stealhead theme (wave D1
 * polish): one helper turns a family slug into the relative URL of the
 * sibling application one folder above this app ("../cadria/" beside
 * "stealhead/"), so the window chrome links the whole wenathlan family
 * without hardcoding a host — the family redirects both ways.
 */

/**
 * Builds the relative URL of a family application from its slug.
 *
 * @param slug the folder slug of the family app (for example "cadria").
 * @returns the relative URL one level above this app, edge slashes trimmed,
 * trailing slash included.
 */
export function familyurl(slug: string): string {
  return `../${slug.replace(/^\/+|\/+$/g, "")}/`;
}
