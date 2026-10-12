/**
 * timeline.tsx — the loose timeline component of the about folder. The
 * release ladder of the platform rendered as an asymmetric split: the
 * section head (title, intro and the honest rung count standing as a
 * display stat — the r2-a display-stat grammar) holds the narrow left rail
 * while the ladder itself runs down the wide column with the signal
 * markers — the same release.ladder rows the history surface serves, read
 * through the shared catalog accessor, so the institutional page never
 * restates them. The entrance rides the engine .enter kit.
 */
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { type Rung, releaseLadder } from "../../catalog";

/** the entrance stagger step of the ladder (the engine .enter kit, 70ms). */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

export function AboutTimeline() {
  const [rungs, setRungs] = useState<Rung[]>([]);

  useEffect(() => {
    void releaseLadder().then(setRungs);
  }, []);

  return (
    <section className="inst-section about-ladder enter" style={step(5)}>
      <header className="about-ladder__head">
        <p className="r2a-kicker">the release ladder</p>
        <h2>How the platform moved</h2>
        <p className="inst-section__intro">
          The release ladder records the stamps of the platform; this page reads the same rows the history surface
          serves.
        </p>
        {rungs.length ? (
          <div className="r2a-stat">
            <p className="r2a-stat__label">release rungs</p>
            <p className="r2a-stat__value">{String(rungs.length).padStart(2, "0")}</p>
          </div>
        ) : null}
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
