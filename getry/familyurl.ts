/**
 * familyurl.ts — the family registry resolver of the getry deploy unit.
 *
 * Every sibling application of the family (devthink, cadria, stealthhead,
 * debonair, argan, saddle, forge, foundry, vault) deploys as its own folder
 * beside this one, so the window chrome can hand the visitor to a relative
 * sibling URL from any route of this app: `familyurl("cadria")` answers
 * `../cadria/`. The deploybase.ts doctrine of the DevThink OS resolves the
 * same segments absolutely; a static family deploy has no server to ask,
 * so the registry here stays plain TS and speaks one level up. The rail
 * foot consumes it (the family section) — the family redirects both ways.
 */

/**
 * Builds the relative URL of one sibling deploy unit of the family.
 *
 * @param slug the deploy unit segment (the app folder name).
 * @returns the relative sibling URL, one level up, with the trailing slash.
 */
export function familyurl(slug: string): string {
  return `../${slug.replace(/^\/+|\/+$/g, "")}/`;
}
