/**
 * footer.tsx — the footer strip of the intro: the full family link row (the
 * eight sibling deploy units of the wenathlan family, resolved through the
 * relative familyurl contract so the links survive any mount point, each
 * carrying its spec §12 accent dot) plus a tiny legal line. Plain anchors,
 * zero storage, zero network — it works on a static deploy.
 */

import { familyrow } from "../../family.ts";
import { familyurl } from "../../familyurl.ts";

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
  const linkStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    fontSize: "0.88rem",
    textDecoration: "none",
  } as const;
  const dotStyle = (accent: string) =>
    ({ width: 7, height: 7, flex: "none", borderRadius: "50%", background: accent }) as const;
  const legalStyle = { margin: 0, color: MUTED, lineHeight: 1.6, maxWidth: "72ch" } as const;

  return (
    <footer style={footStyle}>
      <div style={innerStyle}>
        <nav aria-label="the wenathlan family" style={rowStyle}>
          <span className="mono-label" style={{ margin: 0 }}>
            the family
          </span>
          {familyrow().map((member) => (
            <a
              key={member.slug}
              href={familyurl(member.slug)}
              target="_blank"
              rel="noreferrer"
              className="intro-foot__link"
              style={linkStyle}
              title={`${member.slug} — the ${member.slug} surface of the family`}
            >
              <span aria-hidden="true" style={dotStyle(member.accent)} />
              {member.slug}
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
