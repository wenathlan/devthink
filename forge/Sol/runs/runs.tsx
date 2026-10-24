/**
 * runs page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it mounts the page and is consumed only by the theme anchor (Sol/Sol.tsx).
 *
 * Runs — the runner floor of the forge, the first real platform page: the
 * runner fleet answers with its state, its load and its health rung, and a
 * tick advances the floor deterministically. The fleet is a SEEDED
 * REHEARSAL of the saddle engine boundary (the seed is shown, the copy
 * says so) — no live floor claim, no invented runners. Every number on the
 * page is tabular; every state is a dot plus text, never color alone.
 */

import { GaugeRegular, HeartPulseRegular, PlayFilled, PulseRegular } from "@fluentui/react-icons";
import { useMemo, useState } from "react";
import {
  fleetSummary,
  fleetTick,
  HEALTH_LADDER,
  healthRungOf,
  RUNNER_STATES,
  type Runner,
  seedFleet,
} from "../../fleet.ts";
import { planrehearsal, type planstate, RUNPLAN } from "../../graphplan.ts";
import { labelfill, label } from "../../labels";
import { EmptyState } from "../widgets";
import { GraphPanel as GraphPanel } from "../widgets";

/** the seed of the rehearsal floor (shown on the page, pinned by the tests) */
export const FLOOR_SEED = 20260214;
/** the size of the rehearsal fleet */
const FLEET_SIZE = 8;

/** the readable label of a runner state */
const STATE_LABEL: Readonly<Record<Runner["state"], string>> = {
  idle: label("runs.state.idle"),
  starting: label("runs.state.starting"),
  busy: label("runs.state.busy"),
  draining: label("runs.state.draining"),
  offline: label("runs.state.offline"),
};

/** one fleet row: name, mode, state, load, record and the health rung. */
function RunnerRow({ runner }: { runner: Runner }) {
  const health = healthRungOf(runner);
  return (
    <article className="fr-row" data-health={health.label}>
      <div className="fr-row__id">
        <h3 className="fr-row__name">{runner.name}</h3>
        <p className="fr-row__mode">{runner.mode}</p>
      </div>
      <div className="fr-row__state">
        <span className="fr-state">
          <i aria-hidden="true" />
          {STATE_LABEL[runner.state]}
        </span>
        <span className="fr-row__why">{health.why}</span>
      </div>
      <div className="fr-row__load">
        <span className="fr-metric">
          <span className="fr-metric__label">{label("runs.row.load")}</span>
          <span className="fr-metric__value">{Math.round(runner.load * 100)}%</span>
        </span>
        <span
          className="fr-loadbar"
          role="img"
          aria-label={labelfill("runs.row.loadAria", { percent: String(Math.round(runner.load * 100)) })}
        >
          <i style={{ width: `${Math.round(runner.load * 100)}%` }} />
        </span>
      </div>
      <div className="fr-row__record">
        <span className="fr-metric">
          <span className="fr-metric__label">{label("runs.row.runs")}</span>
          <span className="fr-metric__value">{runner.runs}</span>
        </span>
        <span className="fr-metric">
          <span className="fr-metric__label">{label("runs.row.failures")}</span>
          <span className="fr-metric__value">{runner.failures}</span>
        </span>
      </div>
      <div className="fr-row__health">
        <span
          className="fr-ladder"
          data-rung={health.rung}
          role="img"
          aria-label={labelfill("runs.row.healthAria", { label: health.label, rung: String(health.rung + 1) })}
        >
          <i />
          <i />
          <i />
        </span>
        <span className="fr-healthlabel">{health.label}</span>
      </div>
    </article>
  );
}

/** The runs page: the fleet ledger of the floor. */
export default function Runs() {
  const [seed, setSeed] = useState(FLOOR_SEED);
  const [tick, setTick] = useState(0);
  const fleet = useMemo(() => seedFleet(seed, FLEET_SIZE), [seed]);
  const floor = useMemo(() => fleetTick(fleet, seed, tick), [fleet, seed, tick]);
  const summary = useMemo(() => fleetSummary(floor), [floor]);
  // the run plan rehearses on the same seed and tick as the fleet: one
  // advance walks the floor AND the stage graph together (one ride, two
  // views of the same rehearsal)
  const planstates = useMemo<Record<string, planstate>>(() => planrehearsal(RUNPLAN, seed, tick), [seed, tick]);

  return (
    <main className="shell fr-page">
      <header className="pagehead">
        <p className="pagehead__eyebrow">{label("runs.eyebrow")}</p>
        <h1 className="pagehead__title">{label("runs.title")}</h1>
        <p className="pagehead__lede">{labelfill("runs.lede", { seed: String(seed), count: String(FLEET_SIZE) })}</p>
        <div className="pagehead__actions">
          <button type="button" className="btn" onClick={() => setTick((value) => value + 1)}>
            <PlayFilled fontSize={14} aria-hidden="true" />
            {label("runs.advance")}
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setSeed((value) => value + 1);
              setTick(0);
            }}
          >
            {label("runs.reseed")}
          </button>
        </div>
      </header>

      <section className="fr-summary" aria-label={label("runs.summary.aria")}>
        <div className="fr-summary__cell">
          <p className="fr-summary__label">
            <PulseRegular fontSize={13} aria-hidden="true" />
            {label("runs.summary.runners")}
          </p>
          <p className="fr-summary__value">{summary.total}</p>
        </div>
        <div className="fr-summary__cell">
          <p className="fr-summary__label">
            <HeartPulseRegular fontSize={13} aria-hidden="true" />
            {label("runs.summary.health")}
          </p>
          <p className="fr-summary__value fr-summary__ladder">
            {HEALTH_LADDER.map((health) => (
              <span key={health} className="fr-lanecount" data-health={health}>
                <i aria-hidden="true" />
                {summary.byHealth[health]} {health}
              </span>
            ))}
          </p>
        </div>
        <div className="fr-summary__cell">
          <p className="fr-summary__label">
            <GaugeRegular fontSize={13} aria-hidden="true" />
            {label("runs.summary.busyLoad")}
          </p>
          <p className="fr-summary__value">{Math.round(summary.busyLoad * 100)}%</p>
        </div>
        <div className="fr-summary__cell">
          <p className="fr-summary__label">{label("runs.summary.verdictLabel")}</p>
          <p className="fr-summary__value fr-summary__verdict" data-healthy={summary.healthy ? "true" : "false"}>
            {summary.healthy ? label("runs.summary.healthy") : label("runs.summary.unhealthy")}
          </p>
        </div>
      </section>

      <GraphPanel plan={RUNPLAN} states={planstates} />

      {floor.length === 0 ? (
        <EmptyState
          icon={PulseRegular}
          title={label("runs.empty.title")}
          line={label("runs.empty.line")}
          action={
            <button type="button" className="btn secondary" onClick={() => setSeed(FLOOR_SEED)}>
              {label("runs.empty.action")}
            </button>
          }
        />
      ) : (
        <section className="fr-fleet" aria-label={label("runs.fleet.aria")}>
          <div className="fr-fleet__head" aria-hidden="true">
            <span>{label("runs.head.runner")}</span>
            <span>{label("runs.head.state")}</span>
            <span>{label("runs.head.load")}</span>
            <span>{label("runs.head.record")}</span>
            <span>{label("runs.head.health")}</span>
          </div>
          {floor.map((runner) => (
            <RunnerRow key={runner.id} runner={runner} />
          ))}
        </section>
      )}

      <p className="fr-footnote">{labelfill("runs.footnote", { list: RUNNER_STATES.join(" · ") })}</p>
    </main>
  );
}
