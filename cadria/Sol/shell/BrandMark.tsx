/**
 * BrandMark.tsx — the ONE logo lockup of the chrome: the cadria glyph and
 * wordmark drawn in currentColor (a rounded video tile with the play wedge
 * cut out — the player identity of the platform — beside the lowercase
 * wordmark). Monochrome by construction: the lockup inherits the ink of the
 * surface it rides, so it stays correct in both themes and never competes
 * with the rose signal. The ONLY consumer is the titlebar logo slot of
 * Sol/shell/Shell.tsx — the brand appears exactly once per chrome; the drawn
 * rose mark (CadriaMark) belongs to the page hero zones, never to the bar.
 */

export type BrandMarkProps = {
  /** the glyph square size in px; the wordmark scales with it */
  size?: number;
  /** hides the lockup from the accessibility tree (the slot is decorative) */
  hidden?: boolean;
};

/** the glyph: the rounded tile with the play wedge punched out (evenodd). */
const GLYPH_PATH =
  "M6 2.5h8A3.5 3.5 0 0 1 17.5 6v8a3.5 3.5 0 0 1-3.5 3.5H6A3.5 3.5 0 0 1 2.5 14V6A3.5 3.5 0 0 1 6 2.5ZM8.1 6.9v6.2l5.6-3.1Z";

/**
 * The brand lockup: glyph + wordmark, one color, no gradients.
 *
 * @param size the glyph square in px (default 18 — the titlebar slot size).
 * @param hidden removes the lockup from the accessibility tree.
 * @returns the lockup element.
 */
export function BrandMark({ size = 18, hidden }: BrandMarkProps) {
  return (
    <span
      className="sol-brand"
      aria-hidden={hidden || undefined}
      style={{ display: "inline-flex", alignItems: "center", gap: Math.max(6, Math.round(size / 3)), flex: "none" }}
    >
      <svg
        viewBox="0 0 20 20"
        width={size}
        height={size}
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        style={{ display: "block", flex: "none" }}
      >
        <path fillRule="evenodd" clipRule="evenodd" d={GLYPH_PATH} />
      </svg>
      <span
        style={{
          fontSize: Math.round(size * 0.78),
          fontWeight: 650,
          letterSpacing: "-0.01em",
          lineHeight: 1,
          color: "inherit",
          whiteSpace: "nowrap",
        }}
      >
        cadria
      </span>
    </span>
  );
}

export default BrandMark;
