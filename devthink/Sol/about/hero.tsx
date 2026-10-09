/**
 * hero.tsx — the loose hero component of the about folder. The page top of
 * the institutional surface rides the ONE page hero grammar of the theme
 * (.pagehead), broken asymmetric: the display statement dominates the left
 * column, the lede and the single action sit as a bottom-aligned support
 * rail on the right. The halftone edge dissolves the band into the page.
 */
import { Link } from "wouter";

/** the campaign faces: the display token of the wave-2 stylesheet with the
 * current sans stack as the standing fallback, mono likewise */
const DISPLAY = "var(--font-display, var(--dt-sans))";
const MONO = "var(--font-mono, var(--dt-mono))";

/** the .pagehead contract floor: the doctrine values of the class contract,
 * inline so the hero stands before the wave-2 stylesheet lands on the
 * shared classes (inline only fixes structure and the contracted sizes;
 * the asymmetric columns ride the folder stylesheet so the narrow-screen
 * collapse can win over them) */
const heroStyle = { padding: "40px 0 28px", borderBottom: "1px solid var(--dt-edge)" } as const;
const eyebrowStyle = {
  margin: 0,
  color: "var(--dt-faint)",
  font: `500 10px ${MONO}`,
  letterSpacing: ".08em",
} as const;
const titleStyle = {
  margin: 0,
  maxWidth: 620,
  color: "var(--dt-text)",
  font: `700 30px/1.15 ${DISPLAY}`,
  letterSpacing: "-.02em",
} as const;
const ledeStyle = { margin: 0, color: "var(--dt-muted)", fontSize: 13, lineHeight: 1.7 } as const;
const actionsStyle = { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginTop: 14 } as const;
const actionLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  minHeight: 34,
  padding: "0 14px",
  color: "var(--dt-blue)",
  background: "rgb(255 255 255 / 4%)",
  border: "1px solid var(--dt-edge)",
  borderRadius: 8,
  font: `500 10px ${MONO}`,
  letterSpacing: ".08em",
  textDecoration: "none",
  cursor: "pointer",
  transition: "color 160ms var(--dt-ease), background 160ms var(--dt-ease), border-color 160ms var(--dt-ease)",
} as const;

export function AboutHero() {
  return (
    <header className="pagehead about-hero halftone" style={heroStyle}>
      <div className="about-hero__statement" style={{ display: "grid", gap: 14, alignContent: "start" }}>
        <p className="pagehead__eyebrow" style={eyebrowStyle}>
          devthink · about
        </p>
        <h1 className="pagehead__title" style={titleStyle}>
          An operating system for development work.
        </h1>
      </div>
      <div className="about-hero__rail" style={{ display: "grid", gap: 14, alignContent: "end" }}>
        <p className="pagehead__lede" style={ledeStyle}>
          DevThink runs as one system: the CLI, the local gateway and the browser surface share a catalog, a
          configuration and a local store.
        </p>
        <div className="pagehead__actions" style={actionsStyle}>
          <Link href="/docs" className="about-hero__action" style={actionLinkStyle}>
            read the docs
          </Link>
        </div>
      </div>
    </header>
  );
}
