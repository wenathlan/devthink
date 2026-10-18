/**
 * graphpanel — the run plan drawn as a stage graph (loose component beside
 * the runs anchor, inside the runs page folder).
 *
 * The forge draws its runs the way the owner asked everything to be drawn:
 * by graphs and nodes, stage by stage. The panel reads the root engine
 * (graphplan.ts — the forge's own plan logic) and projects the rehearsed
 * run into an SVG map: one trylle card per step riding its topological
 * stage, one hairline bezier per wire. States ride the windows hands —
 * the running stage wears the WINDOWS accent #4cc2ff through opacity only
 * (ring, dot pulse, live edge), the done stage stays discreet, the failed
 * stage rides the windows close red rgb(232 17 35) — and every state is a
 * dot plus text, never color alone. Nothing here improvises geometry: the
 * positions, the bounds and the states all come from the engine.
 */

import { useId, useMemo } from "react";
import {
  PLAN_STATES,
  planbounds,
  plangraphof,
  planpositions,
  planprogress,
  planstages,
  type planstate,
  plantally,
  type runplan,
} from "../../graphplan.ts";

/** the drawn card of one plan node (the trylle surface the graph rides) */
const CARD = { width: 176, height: 56 } as const;

/** the readable label of each plan state (the text beside the dot) */
const STATE_LABEL: Readonly<Record<planstate, string>> = {
  pending: "pending",
  running: "running",
  done: "done",
  failed: "failed",
  skipped: "skipped",
};

/** the tooltip note of each tally chip (what the state means on the floor) */
const STATE_TIP: Readonly<Record<planstate, string>> = {
  pending: "the stage waits for its turn in the ride order",
  running: "the stage runs now — the windows accent marks the live stage",
  done: "the stage settled — its evidence is already in the run record",
  failed: "the stage rode red — the failure keeps its record on the plan",
  skipped: "the stage was stranded by an earlier red rung",
};

/** the bezier path of one wire: right edge of the source card to the left
 * edge of the target card, the flat fluent hand-off the plan rides. */
function edgePath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const sx = from.x + CARD.width;
  const sy = from.y + CARD.height / 2;
  const tx = to.x;
  const ty = to.y + CARD.height / 2;
  const dx = Math.max(16, (tx - sx) / 2);
  return `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
}

/** the tally chip of one plan state: dot + count + word, never color alone. */
function TallyChip({ state, count }: { state: planstate; count: number }) {
  return (
    <li className="frg-tally__chip" data-state={state} data-tip={STATE_TIP[state]}>
      <i aria-hidden="true" />
      <span className="frg-tally__count">{count}</span>
      <span className="frg-tally__word">{STATE_LABEL[state]}</span>
    </li>
  );
}

/** one drawn node of the plan: the trylle card with its state hands. */
function PlanNode({
  node,
  index,
  surface,
}: {
  node: { id: string; kind: string; label: string; note: string; state: planstate };
  index: number;
  surface: string;
}) {
  return (
    <g className="frg-node" data-state={node.state}>
      <title>{`${String(index + 1).padStart(2, "0")} · ${node.label} — ${node.note} (${STATE_LABEL[node.state]})`}</title>
      <rect className="frg-node__card" fill={surface} width={CARD.width} height={CARD.height} rx={10} />
      <rect className="frg-node__wash" width={CARD.width} height={CARD.height} rx={10} />
      <text className="frg-node__kind" x={14} y={17}>
        {node.kind}
      </text>
      <text className="frg-node__label" x={14} y={35}>
        {node.label}
      </text>
      <circle className="frg-node__dot" cx={17} cy={46} r={3.5} />
      <text className="frg-node__state" x={26} y={49}>
        {STATE_LABEL[node.state]}
      </text>
    </g>
  );
}

/** the stage graph of the run plan: nodes, wires and the rehearsed states. */
export default function GraphPanel({ plan, states }: { plan: runplan; states: Readonly<Record<string, planstate>> }) {
  const gradientRaw = useId();
  const gradientId = `frg-surface-${gradientRaw.replace(/[^a-zA-Z0-9]/g, "")}`;

  const graph = useMemo(() => plangraphof(plan, states), [plan, states]);
  const positions = useMemo(() => planpositions(plan), [plan]);
  const bounds = useMemo(
    () => planbounds(positions, { cardwidth: CARD.width, cardheight: CARD.height, padding: 24 }),
    [positions],
  );
  const tally = useMemo(() => plantally(states), [states]);
  const progress = useMemo(() => planprogress(states), [states]);
  const stageCount = useMemo(() => planstages(plan).length, [plan]);

  const aria = `the run plan graph: ${plan.steps.length} steps across ${stageCount} stages, ${tally.done} done, ${tally.running} running, ${tally.failed} failed`;

  return (
    <section className="frg-panel" aria-label="the run plan stage graph">
      <div className="frg-head">
        <p className="frg-eyebrow">
          the run plan · {plan.id} · {stageCount} stages
        </p>
        <p className="frg-progress" data-tip={`the done share of the plan rides at ${progress} percent`}>
          {progress}%
        </p>
      </div>

      <ul className="frg-tally" aria-label="the plan state tally">
        {PLAN_STATES.map((state) => (
          <TallyChip key={state} state={state} count={tally[state]} />
        ))}
      </ul>

      <div className="frg-scroll">
        <svg
          className="frg-graph"
          role="img"
          aria-label={aria}
          viewBox={`${bounds.minx} ${bounds.miny} ${bounds.width} ${bounds.height}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop className="frg-stop-a" offset="0" />
              <stop className="frg-stop-b" offset="1" />
            </linearGradient>
          </defs>
          {graph.edges.map((edge) => {
            const from = positions[edge.from];
            const to = positions[edge.to];
            if (!from || !to) return null;
            const live = states[edge.from] === "done" && states[edge.to] === "running";
            return (
              <path
                key={`${edge.from}-${edge.to}`}
                className="frg-edge"
                data-live={live ? "true" : "false"}
                d={edgePath(from, to)}
              />
            );
          })}
          {graph.nodes.map((node, index) => {
            const at = positions[node.id];
            if (!at) return null;
            return (
              <g key={node.id} transform={`translate(${at.x} ${at.y})`}>
                <PlanNode node={node} index={index} surface={`url(#${gradientId})`} />
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="frg-stages" aria-label="the plan stages in ride order">
        {plan.steps.map((step, index) => {
          const state = states[step.id] ?? "pending";
          return (
            <li
              key={step.id}
              className="frg-stage"
              data-state={state}
              data-tip={`${step.note} — ${STATE_LABEL[state]}`}
            >
              <i aria-hidden="true" />
              <span className="frg-stage__index">{String(index + 1).padStart(2, "0")}</span>
              <span className="frg-stage__label">{step.label}</span>
              <span className="frg-stage__state">{STATE_LABEL[state]}</span>
            </li>
          );
        })}
      </ul>

      <p className="sr-only">
        {plan.steps.map((step, index) => `${index + 1}. ${step.label} (${step.kind}): ${step.note}`).join(" ")}
      </p>
    </section>
  );
}
