/**
 * footer.tsx — the footer strip of the intro: the minimal family link row
 * (the sibling deploy units of the wenathlan family, resolved through the
 * relative familyurl contract so the links survive any mount point) plus a
 * tiny legal line. Plain anchors, zero storage, zero network — it works on
 * a static deploy.
 */

import { familyurl } from "../../familyurl.ts";

/** the family siblings the intro links, in rail order. */
const FAMILY: readonly string[] = ["argan", "debonair", "stealthhead", "vault"];

/** quiet secondary text: the page ink, softened (theme-proof). */
const MUTED = "color-mix(in srgb, currentColor 64%, transparent)";
/** the hairline the page draws beside the contract's own. */
const HAIR = "1px solid color-mix(in srgb, currentColor 18%, transparent)";

/** The footer strip: the family row and the legal line. */
export function IntroFooter() {
  const footStyle = { borderTop: HAIR, marginTop: 12 } as const;
  const innerStyle = {
    width: "100%",
    maxWidth: 1080,
    margin: "0 auto",
    padding: "26px 24px 40px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  } as const;
  const rowStyle = { display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "10px 18px" } as const;
  const linkStyle = { fontSize: "0.88rem", textDecoration: "none" } as const;
  const legalStyle = { margin: 0, color: MUTED, lineHeight: 1.6, maxWidth: "72ch" } as const;

  return (
    <footer style={footStyle}>
      <div style={innerStyle}>
        <nav aria-label="the wenathlan family" style={rowStyle}>
          <span className="mono-label" style={{ margin: 0 }}>
            the family
          </span>
          {FAMILY.map((slug) => (
            <a
              key={slug}
              href={familyurl(slug)}
              target="_blank"
              rel="noreferrer"
              className="intro-foot__link"
              style={linkStyle}
            >
              {slug}
            </a>
          ))}
        </nav>
        <p className="mono-label" style={legalStyle}>
          cadria — the video and image home of the wenathlan family · every render is computed locally; nothing is
          stored, uploaded or tracked · © wenathlan, gpl-3.0-only
        </p>
      </div>
    </footer>
  );
}

export default IntroFooter;
