// The Law Banner: the console states the execution law — every pass runs
// on the saddle edge engine over the internet, never on the visitor
// machine (no visitor browser, gpu or cpu). The micro-counts (live / host
// / planned) arrive from /api/v1/modalities on mount; while they load the
// sentence stands alone.
import { ShieldTaskRegular as Shield } from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { fetchmodalities, type ModalityPlan } from "../../api.ts";

/** the law the console carries: one sentence, lowercase english. */
const lawsentence = "the saddle edge engine executes every pass — nothing runs on the visitor machine";

/**
 * the edge-law band: a single slim line above the console content — the
 * shield, the law sentence and, once the engine answers, the live / host /
 * planned micro-counts of the modality plan.
 */
export default function ConsoleEdgelaw() {
  const [plan, setplan] = useState<ModalityPlan | null>(null);

  /** the banner mount: read the plan once; silence keeps the sentence alone. */
  useEffect(() => {
    let cancelled = false;
    fetchmodalities()
      .then((result) => {
        if (!cancelled && result !== null) {
          setplan(result);
        }
      })
      .catch(() => {
        /* the sentence alone is the honest floor when the engine sleeps */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <p className="r3-declared-ribbon" role="note">
      <Shield fontSize={13} aria-hidden="true" /> {lawsentence}
      {plan !== null && ` · live ${plan.live} · host ${plan.host} · planned ${plan.planned}`}
    </p>
  );
}
