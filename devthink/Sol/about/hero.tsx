/**
 * hero.tsx — the loose hero component of the about folder. The page top of
 * the institutional surface rides the ONE page hero grammar of the theme
 * (.pagehead: the 10px mono tracked eyebrow, the 28–32px display line, the
 * 13px muted lede and the right-aligned actions row). The skeleton belongs
 * to the page; the narrative rows below it come from the catalog.
 */
import { Link } from "wouter";

/** the .pagehead grammar floor: the doctrine values of the class contract,
 * inline so the hero stands before the wave-2 stylesheet lands on the
 * shared classes (inline only fixes structure and the contracted sizes) */
const pageheadStyle = { display: "grid", gap: 12, padding: "36px 0 0" } as const;
const eyebrowStyle = {
  margin: 0,
  color: "var(--dt-muted)",
  font: "500 10px var(--dt-mono)",
  letterSpacing: ".22em",
  textTransform: "uppercase",
} as const;
const titleStyle = { margin: 0, fontSize: 30, lineHeight: 1.15, letterSpacing: "-.02em" } as const;
const ledeStyle = { margin: 0, maxWidth: 640, color: "var(--dt-muted)", fontSize: 13, lineHeight: 1.7 } as const;
const actionsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  alignItems: "center",
  justifyContent: "flex-end",
  marginTop: 4,
} as const;
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
  font: "500 10px var(--dt-mono)",
  letterSpacing: ".08em",
  textDecoration: "none",
  cursor: "pointer",
  transition: "color 160ms var(--dt-ease), background 160ms var(--dt-ease), border-color 160ms var(--dt-ease)",
} as const;

export function AboutHero() {
  return (
    <header className="pagehead" style={pageheadStyle}>
      <p className="pagehead__eyebrow" style={eyebrowStyle}>
        devthink · about
      </p>
      <h1 className="pagehead__title" style={titleStyle}>
        An operating system for development work.
      </h1>
      <p className="pagehead__lede" style={ledeStyle}>
        DevThink runs as one system: the CLI, the local gateway and the browser surface share a catalog, a configuration
        and a local store.
      </p>
      <div className="pagehead__actions" style={actionsStyle}>
        <Link href="/docs" style={actionLinkStyle}>
          read the docs
        </Link>
      </div>
    </header>
  );
}
