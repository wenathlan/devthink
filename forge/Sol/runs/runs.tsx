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

import { Activity, Gauge, HeartPulse, Play } from "lucide-react";
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
import { EmptyState } from "../shell/EmptyState";

/** the seed of the rehearsal floor (shown on the page, pinned by the tests) */
export const FLOOR_SEED = 20260214;
/** the size of the rehearsal fleet */
const FLEET_SIZE = 8;

/** the readable label of a runner state */
const STATE_LABEL: Readonly<Record<Runner["state"], string>> = {
  idle: "idle",
  starting: "starting",
  busy: "busy",
  draining: "draining",
  offline: "offline",
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
          <span className="fr-metric__label">load</span>
          <span className="fr-metric__value">{Math.round(runner.load * 100)}%</span>
        </span>
        <span className="fr-loadbar" role="img" aria-label={`load ${Math.round(runner.load * 100)} percent`}>
          <i style={{ width: `${Math.round(runner.load * 100)}%` }} />
        </span>
      </div>
      <div className="fr-row__record">
        <span className="fr-metric">
          <span className="fr-metric__label">runs</span>
          <span className="fr-metric__value">{runner.runs}</span>
        </span>
        <span className="fr-metric">
          <span className="fr-metric__label">failures</span>
          <span className="fr-metric__value">{runner.failures}</span>
        </span>
      </div>
      <div className="fr-row__health">
        <span
          className="fr-ladder"
          data-rung={health.rung}
          role="img"
          aria-label={`health ${health.label} (rung ${health.rung + 1} of 3)`}
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

  return (
    <main className="shell fr-page">
      <header className="pagehead">
        <p className="pagehead__eyebrow">runs · the runner floor</p>
        <h1 className="pagehead__title">Runner fleets</h1>
        <p className="pagehead__lede">
          A seeded rehearsal of the runner floor — seed {seed}, {FLEET_SIZE} runners on the saddle engine boundary. The
          tick advances the floor by its own rules; nothing here claims a live build.
        </p>
        <div className="pagehead__actions">
          <button type="button" className="btn" onClick={() => setTick((value) => value + 1)}>
            <Play size={14} aria-hidden="true" />
            advance the floor
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setSeed((value) => value + 1);
              setTick(0);
            }}
          >
            reseed the rehearsal
          </button>
        </div>
      </header>

      <section className="fr-summary" aria-label="the floor summary">
        <div className="fr-summary__cell">
          <p className="fr-summary__label">
            <Activity size={13} aria-hidden="true" />
            runners
          </p>
          <p className="fr-summary__value">{summary.total}</p>
        </div>
        <div className="fr-summary__cell">
          <p className="fr-summary__label">
            <HeartPulse size={13} aria-hidden="true" />
            health ladder
          </p>
          <p className="fr-summary__value fr-summary__ladder">
            {HEALTH_LADDER.map((label) => (
              <span key={label} className="fr-lanecount" data-health={label}>
                <i aria-hidden="true" />
                {summary.byHealth[label]} {label}
              </span>
            ))}
          </p>
        </div>
        <div className="fr-summary__cell">
          <p className="fr-summary__label">
            <Gauge size={13} aria-hidden="true" />
            busy load
          </p>
          <p className="fr-summary__value">{Math.round(summary.busyLoad * 100)}%</p>
        </div>
        <div className="fr-summary__cell">
          <p className="fr-summary__label">floor verdict</p>
          <p className="fr-summary__value fr-summary__verdict" data-healthy={summary.healthy ? "true" : "false"}>
            {summary.healthy ? "healthy — no red on the floor" : "not healthy — a runner rides red"}
          </p>
        </div>
      </section>

      {floor.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="no runners mustered"
          line="The floor stands empty — reseed the rehearsal to muster the fleet again."
          action={
            <button type="button" className="btn secondary" onClick={() => setSeed(FLOOR_SEED)}>
              muster the rehearsal fleet
            </button>
          }
        />
      ) : (
        <section className="fr-fleet" aria-label="the runner fleet">
          <div className="fr-fleet__head" aria-hidden="true">
            <span>runner</span>
            <span>state</span>
            <span>load</span>
            <span>record</span>
            <span>health</span>
          </div>
          {floor.map((runner) => (
            <RunnerRow key={runner.id} runner={runner} />
          ))}
        </section>
      )}

      <p className="fr-footnote">
        states the floor answers: {RUNNER_STATES.join(" · ")} — the health ladder is green → amber → red, and red never
        hides its failure record.
      </p>
    </main>
  );
}
