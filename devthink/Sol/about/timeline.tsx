/**
 * timeline.tsx — the loose timeline component of the about folder. The
 * release ladder of the platform rendered as an asymmetric split: the
 * section head (title, intro and the honest rung count) holds the narrow
 * left rail while the ladder itself runs down the wide column — the same
 * release.ladder rows the history surface serves, read through the shared
 * catalog accessor, so the institutional page never restates them.
 */
import { useEffect, useState } from "react";
import { type Rung, releaseLadder } from "../../catalog";

const MONO = "var(--font-mono, var(--dt-mono))";
const countStyle = {
  margin: 0,
  color: "var(--dt-faint)",
  font: `500 10px ${MONO}`,
  letterSpacing: ".08em",
  fontVariantNumeric: "tabular-nums",
} as const;

export function AboutTimeline() {
  const [rungs, setRungs] = useState<Rung[]>([]);

  useEffect(() => {
    void releaseLadder().then(setRungs);
  }, []);

  return (
    <section className="inst-section about-ladder">
      <header className="about-ladder__head">
        <h2>How the platform moved</h2>
        <p className="inst-section__intro">
          The release ladder records the stamps of the platform; this page reads the same rows the history surface
          serves.
        </p>
        {rungs.length ? <p className="about-ladder__count" style={countStyle}>{`${rungs.length} rungs`}</p> : null}
      </header>
      <ol className="inst-timeline">
        {rungs.map((rung) => (
          <li key={rung.version}>
            <span className="inst-timeline__version">
              {rung.version}
              {rung.latest ? <em className="inst-timeline__latest">latest</em> : null}
            </span>
            <strong>{rung.stamp}</strong>
            <p>{rung.note}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
