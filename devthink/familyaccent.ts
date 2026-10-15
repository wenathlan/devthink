/**
 * familyaccent.ts — the accent table of the family views, as pure data.
 * Split from familyidentity.tsx so the contract (the design-spec section
 * 12 table and its resolver) can be imported by tests and by data modules
 * without pulling the JSX layer: the hexes are the single source, the
 * catalog in apps.ts mirrors them, and every view root resolves its
 * identity through familyAccentOf.
 *
 * The ten entries are the decided accents of the campaign (spec section
 * 2.3/12): devthink Sol-amber · argan jade · cadria pink · debonair brass
 * · stealthhead ember · saddle leather-ember · forge ember-lime · foundry
 * temper · vault ice-box · getry violet. None is a banned blue
 * (#3B82F6/#2563EB) or the banned orange (#F97316), and the hue gaps
 * between neighbors stay over 20°.
 */

/** the per-app identity accents of the design spec (section 12 table). */
export const FAMILY_ACCENT: Record<string, string> = {
  devthink: "#F59E0B", // Sol amber (the OS brand)
  argan: "#34d8a8", // jade — dark protocol
  cadria: "#f472b6", // pink-magenta — the studio
  debonair: "#d9962e", // brass — studio noir
  stealthhead: "#e8563f", // ember coral — cinematic
  saddle: "#e86f2d", // leather ember (external clone; kept for rails)
  forge: "#a2cb3a", // ember lime — "only runs" (GO)
  foundry: "#2fb8b5", // temper — steel that runs and stores
  vault: "#a3d7e6", // ice-box — stores only, sealed
  getry: "#8b5cf6", // violet — phosphor terminal
};

/** the one glyph motion per app (the HeroGlyph timeline key). */
export type GlyphMotion = "dial" | "strike" | "temper" | "route" | "dig" | "reel" | "breathe" | "scope" | "sun";

/**
 * resolves the accent of one app id with the spec table as the authority
 * (falls back to the catalog accent so an unknown id never renders unlit).
 *
 * @param id the app id.
 * @param fallback the catalog accent used when the id is unknown.
 * @returns the identity hex of the app.
 */
export function familyAccentOf(id: string, fallback: string): string {
  return FAMILY_ACCENT[id] ?? fallback;
}
