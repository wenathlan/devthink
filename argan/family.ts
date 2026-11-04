// # family — the family table of argan, housed at the argan root.
// The deploy units of the wenathlan family with the one accent each carries
// (the spec §12 table, mirrored from the devthink familyidentity wave and
// from the cadria contract) and the slugs in rail order. Pure data, zero
// imports: the chrome (the shell rail foot), the landing footer and the
// vitest suite all consume this one table, so the family row can never
// drift between surfaces. The file carries the whole family keyword under
// the fold law (every file that starts with the same keyword is one file):
// the table lane this header describes and the retired familyurl arm as
// the section below — the relative url resolver that keeps every
// cross-app link mount-proof, every export of the family one export of
// this file.

/** the sibling deploy units beside argan, rail order (argan itself is not
 * listed — the row links OUT, never back). */
export const FAMILY_SLUGS: readonly string[] = [
  "cadria",
  "debonair",
  "forge",
  "foundry",
  "getry",
  "saddle",
  "stealthhead",
  "vault",
];

/** one family member: the slug, the display accent and the dot ink that rides
 * on the accent (the spec's accent-ink column). */
export type FamilyMember = { slug: string; accent: string; dotInk: string };

/** the spec §12 accent table for the eight siblings (argan's own jade
 * #34d8a8 lives in the theme tokens, never in this row). */
export const FAMILY_ACCENTS: Readonly<Record<string, FamilyMember>> = {
  cadria: { slug: "cadria", accent: "#f472b6", dotInk: "#2a0715" },
  debonair: { slug: "debonair", accent: "#d9962e", dotInk: "#241703" },
  forge: { slug: "forge", accent: "#a2cb3a", dotInk: "#161d03" },
  foundry: { slug: "foundry", accent: "#2fb8b5", dotInk: "#03211f" },
  getry: { slug: "getry", accent: "#8b5cf6", dotInk: "#120533" },
  saddle: { slug: "saddle", accent: "#e86f2d", dotInk: "#2a0f02" },
  stealthhead: { slug: "stealthhead", accent: "#e8563f", dotInk: "#2c0703" },
  vault: { slug: "vault", accent: "#a3d7e6", dotInk: "#072330" },
};

/** the family row in rail order, each with its accent; unknown slugs are
 * skipped (the row only ever links real deploy units). */
export function familyrow(): readonly FamilyMember[] {
  const row: FamilyMember[] = [];
  for (const slug of FAMILY_SLUGS) {
    const member = FAMILY_ACCENTS[slug];
    if (member) row.push(member);
  }
  return row;
}

/* ===== the familyurl lane — familyurl.ts retires into the keyword file ===== */

/**
 * familyurl.ts — the url of a family application beside this one (root
 * layer).
 *
 * the family deploys as sibling folders on one host: argan lives at
 * /argan/, the other deploy units at /<slug>/, and every cross-application
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
