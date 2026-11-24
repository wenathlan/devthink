// The Law Banner: the console states the execution law — every pass runs
// on the saddle edge engine over the internet, never on the visitor
// machine (no visitor browser, gpu or cpu). The law sentence rides the
// label store (labels.ts — the copy law); the store answers exactly:
// "the saddle edge engine executes every pass — nothing runs on the visitor machine"
// (console.edgelaw.sentence). The micro-counts (live / host / planned)
// arrive from /api/v1/modalities on mount; while they load the sentence
// stands alone.
import { ShieldTaskRegular as Shield } from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { fetchmodalities, type ModalityPlan } from "../../api.ts";
import { label, labelfill } from "../../labels.ts";

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
      <Shield fontSize={13} aria-hidden="true" /> {label("console.edgelaw.sentence")}
      {plan !== null &&
        labelfill("console.edgelaw.counts", {
          live: String(plan.live),
          host: String(plan.host),
          planned: String(plan.planned),
        })}
    </p>
  );
}
