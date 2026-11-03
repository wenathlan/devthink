/**
 * roster.ts — the typed accessor of the family directory data: the thin
 * door the /apps page, the shell footer, the home preview and the intro
 * footer import, answering the roster of the content lane (content.ts —
 * the manifest; db.ts — the content_rows table; the platform gateway — GET
 * /api/v1/ui/content). The data never lives here anymore: roster() answers
 * the live rows the platform served, the manifest seed otherwise (the
 * uistore chain). Every deploy unit beside the cobaia, with the one accent
 * each carries (the spec §12 table, mirrored from the argan contract; the
 * devthink OS rides the family sun) and the honest role each app declares
 * in its own devthink.toml — condensed to one line, nothing embellished:
 * the page and the tests read the same table through this door, so the
 * directory can never drift from the family.
 */

import { contenttable, type familymember, seedRoster } from "./content.ts";

export type { familymember };

/**
 * The typed accessor of the directory: the live db rows when the platform
 * answered, the manifest seed otherwise — rail order, the OS first, then
 * the applications.
 *
 * @returns the directory roster.
 */
export function roster(): readonly familymember[] {
  return contenttable("roster", seedRoster);
}
