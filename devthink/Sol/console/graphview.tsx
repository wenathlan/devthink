/**
 * graphview.tsx — the SVG drawing of a node graph, loose beside the console
 * anchor (no canvas, no wheel zoom of its own).
 *
 * The component draws the view state the root logic answers
 * (graphviewstate.ts lays the cards on the topological layers,
 * graphrunner.ts walks the stages): every node is a trylle card — the
 * surface ramp #171717→#252525 inside a 1px ring, the .625rem radius — and
 * every edge is one bezier hairline riding ink 10%. A node the runner holds
 * running pulses the WINDOWS accent #4cc2ff on opacity alone; a done node
 * wears the discreet check; a failed one wears the close red rgb(232 17 35)
 * and a skipped one dims. The stage ledger under the map reads the progress
 * per stage (the etapas) and the aggregated percentage. The zoom stays with
 * the page — the zoomlock owns the 100% baseline, so the map carries no
 * wheel zoom and no pinch of its own; it scales with its container like any
 * other ink on the page. Motion rides transform/opacity only and dies under
 * prefers-reduced-motion.
 */
import { useId } from "react";
import type { nodegraph, nodestate } from "../../graphnodes.js";
import { viewbounds, type viewposition } from "../../graphviewstate.js";

/** The card box of one node on the map (the hit target stays at 44px+ tall). */
export const GRAPHVIEW_CARD_WIDTH = 176;
export const GRAPHVIEW_CARD_HEIGHT = 56;

/** The half pitch the bezier wires ride (the control points of the curve). */
const WIRE_DIP = 26;

/* --------------------------------------------------------------------------
 * the graphview stylesheet — scoped to the classes this component mounts;
 * lands once at import time (the console-folder pass pattern)
 * ------------------------------------------------------------------------ */
const GRAPHVIEW_CSS = `
.gview { display: grid; gap: 10px; min-width: 0; }
.gview__map { display: block; width: 100%; height: auto; border-radius: var(--sol-radius); }
.gview__card { cursor: pointer; }
.gview__card rect.gview__surface { stroke: rgb(250 250 250 / 10%); stroke-width: 1; transition: opacity var(--sol-micro) var(--sol-ease-out); }
.gview__card:focus-visible { outline: none; }
.gview__card:focus-visible rect.gview__surface { stroke: var(--win-accent); }
.gview__card[data-selected="true"] rect.gview__surface { stroke: var(--win-accent); }
.gview__card[data-state="skipped"] rect.gview__surface, .gview__card[data-state="skipped"] .gview__label { opacity: .45; }
.gview__card[data-state="running"] rect.gview__surface { stroke: var(--win-accent); }
.gview__pulse { animation: gviewpulse 1.6s ease-in-out infinite; }
@keyframes gviewpulse { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }
.gview__label { fill: var(--color-ink); font: 500 12px/1 var(--font-display); }
.gview__kind { fill: var(--color-ink-3); font: 600 9px/1 var(--font-mono); letter-spacing: .14em; text-transform: lowercase; }
.gview__wire { fill: none; stroke: rgb(250 250 250 / 10%); stroke-width: 1; }
.gview__port { fill: rgb(250 250 250 / 10%); }
.gview__port--live { fill: var(--win-accent); }
.gview__mark-done { fill: none; stroke: var(--color-ink-3); stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.gview__mark-failed { fill: none; stroke: rgb(232 17 35); stroke-width: 1.5; stroke-linecap: round; }
.gview__mark-pending { fill: none; stroke: rgb(250 250 250 / 10%); stroke-width: 1.5; }
.gview__mark-skip { fill: none; stroke: var(--color-ink-3); stroke-width: 1.5; stroke-linecap: round; }
.gview__rail { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; margin: 0; padding: 0; color: var(--color-ink-3); font: 500 10px/1.6 var(--font-mono); letter-spacing: .08em; }
.gview__stages { display: flex; align-items: center; gap: 6px; }
.gview__pip { display: inline-flex; align-items: center; justify-content: center; min-width: 22px; height: 22px; padding: 0 6px; border: 1px solid rgb(250 250 250 / 10%); border-radius: 6px; color: var(--color-ink-3); font: 600 10px/1 var(--font-mono); }
.gview__pip[data-state="active"] { border-color: color-mix(in srgb, var(--win-accent) 55%, transparent); color: var(--win-accent); }
.gview__pip[data-state="done"] { border-color: rgb(250 250 250 / 4%); color: var(--color-ink); }
.gview__stagebar { position: relative; flex: 1 1 120px; height: 2px; background: rgb(250 250 250 / 8%); }
.gview__stagebar > i { position: absolute; inset: 0; background: var(--win-accent); transform-origin: left center; }
.gview__stagenote { color: var(--color-ink-3); }
@media (prefers-reduced-motion: reduce) {
  .gview__pulse { animation: none; }
  .gview__card rect.gview__surface { transition: none; }
}
[data-motion="reduced"] .gview__pulse { animation: none; }
[data-motion="reduced"] .gview__card rect.gview__surface { transition: none; }
`;

let graphviewCssReady = false;

/** Injects the graphview stylesheet exactly once per document, at import time. */
function ensureGraphViewCss(): void {
  if (graphviewCssReady || typeof document === "undefined") return;
  graphviewCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-graphview-pass", "");
  tag.textContent = GRAPHVIEW_CSS;
  document.head.appendChild(tag);
}
ensureGraphViewCss();

/** The stateful props the surface reads; the parent answers them from the pure view state and the runner view. */
export interface GraphViewProps {
  /** The (visible slice of the) graph to draw. */
  graph: nodegraph;
  /** The layered positions of the drawn nodes (graphviewstate answers them). */
  positions: Readonly<Record<string, viewposition>>;
  /** The state of every node (the runner view carries it; pending when absent). */
  nodestates?: Readonly<Record<string, nodestate>>;
  /** The stage waves (the etapas) the ledger reads. */
  stages?: readonly (readonly string[])[];
  /** The stage the run stands on (0-based). */
  stageindex?: number;
  /** The aggregated progress (0..100). */
  progress?: number;
  /** The selected node id. */
  selected?: string | null;
  /** The selection callback (click or keyboard on a card). */
  onselect?: (id: string) => void;
  /** The accessible name of the map. */
  label?: string;
}

/** Reads one state of the ladder with the pending default. */
function stateof(nodestates: Readonly<Record<string, nodestate>> | undefined, id: string): nodestate {
  return nodestates?.[id] ?? "pending";
}

/** Answers whether the stage settled (every node of the wave done) and otherwise reads started vs. pending against the run cursor. */
function stagestate(
  wave: readonly string[],
  nodestates: Readonly<Record<string, nodestate>> | undefined,
  waveindex: number,
  stageindex: number,
): "done" | "active" | "pending" {
  const states = wave.map((id) => stateof(nodestates, id));
  if (states.every((state) => state === "done")) return "done";
  return waveindex <= stageindex ? "active" : "pending";
}

/** The state marker of a card: the discreet check, the close red, the hollow ring, the live dot. */
function StateMark({ state }: { state: nodestate }) {
  if (state === "done") {
    return <path className="gview__mark-done" d={`M ${GRAPHVIEW_CARD_WIDTH - 26} 16 l 5 5 l 9 -10`} />;
  }
  if (state === "failed") {
    return (
      <g className="gview__mark-failed">
        <path d={`M ${GRAPHVIEW_CARD_WIDTH - 25} 15 l 9 9`} />
        <path d={`M ${GRAPHVIEW_CARD_WIDTH - 16} 15 l -9 9`} />
      </g>
    );
  }
  if (state === "running") {
    return (
      <g>
        <circle className="gview__pulse" cx={GRAPHVIEW_CARD_WIDTH - 20} cy={20} r={5} fill="var(--win-accent)" />
      </g>
    );
  }
  if (state === "skipped") {
    return <path className="gview__mark-skip" d={`M ${GRAPHVIEW_CARD_WIDTH - 25} 20 h 9`} />;
  }
  return <circle className="gview__mark-pending" cx={GRAPHVIEW_CARD_WIDTH - 20} cy={20} r={5} />;
}

/**
 * The SVG map of one graph: the trylle cards on their layers, the bezier
 * wires, the state marks and the stage ledger. The component draws only —
 * the geometry comes from graphviewstate.ts, the motion from the runner.
 */
export function GraphView({
  graph,
  positions,
  nodestates,
  stages,
  stageindex = 0,
  progress = 0,
  selected,
  onselect,
  label,
}: GraphViewProps) {
  const gradientid = `gview-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const waves = stages ?? [];
  const drawn = graph.nodes.filter((node) => node.id in positions);
  const bounds = viewbounds(positions, {
    cardwidth: GRAPHVIEW_CARD_WIDTH,
    cardheight: GRAPHVIEW_CARD_HEIGHT,
    padding: 20,
  });
  const maplabel =
    label ?? `node graph: ${drawn.length} nodes on ${waves.length || 1} stages, ${Math.round(progress)} percent done`;
  const picknode = (id: string) => () => onselect?.(id);
  const keynode = (id: string) => (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onselect?.(id);
    }
  };
  return (
    <figure className="gview">
      <svg
        className="gview__map"
        role="img"
        aria-label={maplabel}
        viewBox={`${bounds.minx} ${bounds.miny} ${bounds.width} ${bounds.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradientid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#171717" />
            <stop offset="100%" stopColor="#252525" />
          </linearGradient>
        </defs>
        {/* the wires first: the cards draw over the hairlines */}
        {graph.edges
          .filter((edge) => edge.from in positions && edge.to in positions)
          .map((edge) => {
            const from = positions[edge.from];
            const to = positions[edge.to];
            if (!from || !to) return null;
            const x1 = from.x + GRAPHVIEW_CARD_WIDTH;
            const y1 = from.y + GRAPHVIEW_CARD_HEIGHT / 2;
            const x2 = to.x;
            const y2 = to.y + GRAPHVIEW_CARD_HEIGHT / 2;
            const midx = (x1 + x2) / 2;
            const live = stateof(nodestates, edge.to) === "running";
            return (
              <g key={`${edge.from}-${edge.to}-${edge.port}`}>
                <path
                  className="gview__wire"
                  d={`M ${x1} ${y1} C ${midx + WIRE_DIP / 2} ${y1}, ${midx - WIRE_DIP / 2} ${y2}, ${x2} ${y2}`}
                />
                <circle className={live ? "gview__port gview__port--live" : "gview__port"} cx={x2} cy={y2} r={2.5} />
              </g>
            );
          })}
        {drawn.map((node) => {
          const position = positions[node.id];
          if (!position) return null;
          const state = stateof(nodestates, node.id);
          return (
            <g
              key={node.id}
              className="gview__card"
              data-state={state}
              data-selected={selected === node.id ? "true" : undefined}
              /* biome-ignore lint/a11y/useSemanticElements: an svg g cannot host a semantic button element; the keyboard contract stays on tabindex, aria-label and onKeyDown */
              role="button"
              tabIndex={0}
              aria-label={`${node.label}: ${state}`}
              transform={`translate(${position.x} ${position.y})`}
              onClick={picknode(node.id)}
              onKeyDown={keynode(node.id)}
            >
              <rect
                className="gview__surface"
                width={GRAPHVIEW_CARD_WIDTH}
                height={GRAPHVIEW_CARD_HEIGHT}
                rx={10}
                ry={10}
                fill={`url(#${gradientid})`}
              />
              {state === "running" && (
                <rect
                  className="gview__pulse"
                  width={GRAPHVIEW_CARD_WIDTH}
                  height={GRAPHVIEW_CARD_HEIGHT}
                  rx={10}
                  ry={10}
                  fill="none"
                  stroke="var(--win-accent)"
                  strokeWidth={1}
                />
              )}
              <text className="gview__kind" x={14} y={20}>
                {node.kind}
              </text>
              <text className="gview__label" x={14} y={38}>
                {node.label}
              </text>
              <StateMark state={state} />
            </g>
          );
        })}
      </svg>
      <figcaption className="gview__rail">
        <span className="gview__stages" aria-hidden="true">
          {waves.map((wave, index) => (
            <span
              key={wave.join("-")}
              className="gview__pip"
              data-state={stagestate(wave, nodestates, index, stageindex)}
            >
              {index + 1}
            </span>
          ))}
        </span>
        <span className="gview__stagebar" role="img" aria-label={`run progress ${Math.round(progress)} percent`}>
          <i style={{ transform: `scaleX(${Math.min(100, Math.max(0, progress)) / 100})` }} />
        </span>
        <span className="gview__stagenote">
          stage {Math.min(stageindex + 1, Math.max(waves.length, 1))}/{Math.max(waves.length, 1)} —{" "}
          {Math.round(progress)}%
        </span>
      </figcaption>
    </figure>
  );
}

export default GraphView;
