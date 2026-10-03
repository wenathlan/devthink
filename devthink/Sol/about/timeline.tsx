/**
 * timeline.tsx — the loose timeline component of the about folder. The release
 * ladder of the platform rendered as a vertical timeline: the same
 * release.ladder rows the history surface serves, read through the shared
 * catalog accessor, so the institutional page never restates them.
 */
import { useEffect, useState } from "react";
import { releaseLadder, type Rung } from "../../catalog";

export function AboutTimeline() {
  const [rungs, setRungs] = useState<Rung[]>([]);

  useEffect(() => {
    void releaseLadder().then(setRungs);
  }, []);

  return (
    <section className="inst-section">
      <h2>How the platform moved</h2>
      <p className="inst-section__intro">
        The release ladder records the stamps of the platform; this page reads the same rows the history surface
        serves.
      </p>
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
