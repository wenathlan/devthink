// Signal & Ledger: the boot ladder — the three boot classes with the
// ceilings the records themselves state. The winget fetches the plan on
// mount and computes the hot / warm / cold floors and ceilings from the
// fetched records; no number in this file is fixed.
import { TimerRegular as Ladder } from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { fetchmodalities, type ModalityPlan } from "../../api.ts";

/** one rung of the ladder: the class name, its population and the ms
 * floor / ceiling the records state. */
type Rung = { boot: "hot" | "warm" | "cold"; floor: number; ceiling: number; count: number };

/** the three boot classes of the plan: the class names are the ladder
 * shape (ui scaffolding), every number comes from the fetched records. */
const classes: readonly ("hot" | "warm" | "cold")[] = ["hot", "warm", "cold"];

/** computes the rungs from the fetched records: min / max bootms per class,
 * empty classes stay out of the ladder. */
function rungsof(plan: ModalityPlan): Rung[] {
  return classes
    .map((boot) => {
      const times = plan.records.filter((record) => record.boot === boot).map((record) => record.bootms);
      return {
        boot,
        count: times.length,
        floor: times.length > 0 ? Math.min(...times) : 0,
        ceiling: times.length > 0 ? Math.max(...times) : 0,
      };
    })
    .filter((rung) => rung.count > 0);
}

/**
 * the boot ladder strip: one tile per boot class with the ceiling the
 * records state — while the plan loads the tiles skeleton, when the engine
 * does not answer the tiles say unreached instead of inventing numbers.
 */
export default function ComputeBootladder() {
  const [plan, setplan] = useState<ModalityPlan | null>(null);
  const [failed, setfailed] = useState(false);

  /** the ladder mount: read the plan once; null means the engine slept. */
  useEffect(() => {
    let cancelled = false;
    fetchmodalities()
      .then((result) => {
        if (cancelled) return;
        if (result === null) {
          setfailed(true);
          return;
        }
        setfailed(false);
        setplan(result);
      })
      .catch(() => {
        if (!cancelled) setfailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rungs = plan === null ? [] : rungsof(plan);
  const loading = plan === null && !failed;

  return (
    <section className="content-section" aria-label="the boot ladder of the engine plan">
      <div className="content-section-heading">
        <p className="eyebrow">BOOT LADDER / CLASSES</p>
        <span className="mono-label">
          <Ladder fontSize={12} aria-hidden="true" /> {failed ? "engine unreachable" : "ceilings from the records"}
        </span>
      </div>
      <div className="metric-strip">
        {classes.map((boot) => {
          const rung = rungs.find((entry) => entry.boot === boot);
          return (
            <div className="metric" key={boot}>
              <span className="metric-value">
                {loading ? <span className="dash-skeleton" /> : rung === undefined ? "—" : `${rung.ceiling} ms`}
              </span>
              <span className="metric-label">
                {failed
                  ? `${boot} · unreached`
                  : rung === undefined
                    ? `${boot} · empty class`
                    : `${boot} · boot ceiling`}
              </span>
              <span className="metric-detail">
                {failed
                  ? "the engine did not answer"
                  : rung === undefined
                    ? "the plan carries no member"
                    : `floor ${rung.floor} ms · ${rung.count} modalities`}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
