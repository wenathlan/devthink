/**
 * hero.tsx — the loose hero component of the about folder. The page top of
 * the institutional surface rides the ONE page hero grammar of the theme
 * (.pagehead), broken asymmetric: the display statement dominates the left
 * column at 1.6fr, the lede and the single action sit as a bottom-aligned
 * support rail on the right. Campaign v3 r2-a: the band stages its own ONE
 * named light (the morning window, a shader-fallback bloom high on the
 * right) with the engine halftone-edge dissolving the dots into the page,
 * and the entrance rides the engine .enter kit at 70ms steps.
 */
import type { CSSProperties } from "react";
import { Link } from "wouter";

/** the campaign faces: the display token of the wave-2 stylesheet with the
 * current sans stack as the standing fallback, mono likewise */
const DISPLAY = "var(--font-display, var(--dt-sans))";

/** the entrance stagger of the hero columns (the engine .enter kit). */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

/** the .pagehead contract floor: the doctrine values of the class contract,
 * inline so the hero stands before the wave-2 stylesheet lands on the
 * shared classes (inline only fixes structure and the contracted sizes;
 * the asymmetric columns and the stage ride the folder stylesheet) */
const heroStyle = { padding: "64px 0 40px", borderBottom: "1px solid var(--dtv3-hairline)" } as const;
const titleStyle = {
  margin: 0,
  maxWidth: 700,
  color: "var(--dtv3-ink-1, var(--dt-text))",
  font: `700 clamp(46px, 7vw, 96px)/0.98 ${DISPLAY}`,
  letterSpacing: "-.04em",
  textWrap: "balance",
} as const;
const ledeStyle = { margin: 0, maxWidth: "44ch", color: "var(--dt-muted)", fontSize: 14, lineHeight: 1.75 } as const;

export function AboutHero() {
  return (
    <header className="pagehead about-hero shader-stage halftone-edge" style={heroStyle}>
      {/* the ONE named light of the page: the morning window, high on the
          right; it breathes once per cycle (guarded by the engine kit) */}
      <div className="shader-fallback r2a-about-light breathe" aria-hidden="true" />
      <div
        className="about-hero__statement enter"
        style={{ display: "grid", gap: 16, alignContent: "start", ...step(0) }}
      >
        <p className="pagehead__eyebrow r2a-eyebrow">devthink · about</p>
        <h1 className="pagehead__title r2a-display r2a-display--xl" style={titleStyle}>
          one system, every surface
        </h1>
      </div>
      <div
        className="about-hero__rail enter"
        style={{ display: "grid", gap: 16, alignContent: "end", paddingBottom: 8, ...step(1) }}
      >
        <p className="pagehead__lede r2a-lede" style={ledeStyle}>
          DevThink runs as one system: the CLI, the local gateway and the browser surface share a catalog, a
          configuration and a local store.
        </p>
        <div className="pagehead__actions" style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <Link href="/docs" className="about-hero__action r2a-action">
            read the docs
          </Link>
        </div>
      </div>
    </header>
  );
}
