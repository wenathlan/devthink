// # family — the family table of debonair (root layer, beside familyurl.ts).
// The deploy units of the wenathlan family with the one accent each carries
// (the spec §12 table, mirrored from the devthink familyidentity wave) and
// the slugs in rail order. Pure data, no imports: the chrome (the shell rail
// foot), the landing footer and the node tests all consume this one table, so
// the family row can never drift between surfaces.

/** the sibling deploy units beside debonair, rail order (debonair itself is
 * not listed — the row links OUT, never back). */
export const FAMILY_SLUGS: readonly string[] = [
  "argan",
  "cadria",
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

/** the spec §12 accent table for the eight siblings (debonair's own brass
 * lives in the theme tokens, never in this row). */
export const FAMILY_ACCENTS: Readonly<Record<string, FamilyMember>> = {
  argan: { slug: "argan", accent: "#34d8a8", dotInk: "#04231a" },
  cadria: { slug: "cadria", accent: "#f472b6", dotInk: "#2a0715" },
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
