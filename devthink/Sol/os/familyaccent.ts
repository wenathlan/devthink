/**
 * familyaccent.ts — the accent table of the family views, as pure data.
 * Split from familyidentity.tsx so the contract (the design-spec section
 * 12 table and its resolver) can be imported by tests and by data modules
 * without pulling the JSX layer: the hexes are the single source, the
 * catalog in apps.ts mirrors them, and every view root resolves its
 * identity through familyAccentOf.
 *
 * The ten entries are the decided accents of the campaign (spec section
 * 2.3/12): devthink âmbar-Sol · argan jade · cadria rosa · debonair latão
 * · stealthhead ember · saddle ember-couro · forge lime-brasa · foundry
 * têmpera · vault gelo-de-cofre · getry violeta. None is a banned blue
 * (#3B82F6/#2563EB) or the banned orange (#F97316), and the hue gaps
 * between neighbors stay over 20°.
 */

/** the per-app identity accents of the design spec (section 12 table). */
export const FAMILY_ACCENT: Record<string, string> = {
  devthink: "#F59E0B", // âmbar-Sol (marca do OS)
  argan: "#34d8a8", // jade — protocolo-escuro
  cadria: "#f472b6", // rosa-magenta — estúdio
  debonair: "#d9962e", // latão — estúdio-noir
  stealthhead: "#e8563f", // ember coral — cinematográfico
  saddle: "#e86f2d", // ember couro (external clone; kept for rails)
  forge: "#a2cb3a", // lime-brasa — "só roda" (GO)
  foundry: "#2fb8b5", // têmpera — aço que roda e guarda
  vault: "#a3d7e6", // gelo-de-cofre — só guarda, selado
  getry: "#8b5cf6", // violeta — terminal-fósforo
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
