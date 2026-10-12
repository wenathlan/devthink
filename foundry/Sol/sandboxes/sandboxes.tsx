/**
 * sandboxes page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it mounts the page and is consumed only by the theme anchor (Sol/Sol.tsx).
 *
 * Sandboxes — the machine room of the foundry: the herd answers on the
 * cold → warm → hot ladder, the machine drives it (warm, heat, cool,
 * freeze, step) through the real state machine (sandbox.ts) and refuses
 * what the machine does not do — with the honest refusal on the readout.
 * The herd is a SEEDED REHEARSAL (the seed is shown); every number is
 * tabular and every state is a dot plus text.
 */

import { Boxes, Flame, Play, RefreshCw, Snowflake, Thermometer } from "lucide-react";
import { useMemo, useState } from "react";
import {
  drive,
  type HerdCensus,
  herdCensus,
  SANDBOX_STATES,
  type Sandbox,
  type SandboxAction,
  seedHerd,
  step,
} from "../../sandbox.ts";
import { EmptyState } from "../shell/EmptyState";

/** the seed of the rehearsal herd (shown on the page, pinned by the tests) */
export const HERD_SEED = 620221;

/** the state label of a census cell */
const STATE_LABEL: Readonly<Record<Sandbox["state"], string>> = { cold: "cold", warm: "warm", hot: "hot" };

/** the summary band of the machine room. */
function Census({ census }: { census: HerdCensus }) {
  return (
    <section className="fs-summary" aria-label="the herd census">
      <div className="fs-summary__cell">
        <p className="fs-summary__label">
          <Boxes size={13} aria-hidden="true" />
          sandboxes
        </p>
        <p className="fs-summary__value">{census.total}</p>
      </div>
      <div className="fs-summary__cell fs-summary__cell--wide">
        <p className="fs-summary__label">the state ladder</p>
        <p className="fs-summary__value fs-summary__ladder">
          {SANDBOX_STATES.map((state) => (
            <span key={state} className="fs-statecount" data-state={state}>
              <i aria-hidden="true" />
              {census.byState[state]} {STATE_LABEL[state]}
            </span>
          ))}
        </p>
      </div>
      <div className="fs-summary__cell">
        <p className="fs-summary__label">warm share</p>
        <p className="fs-summary__value">{Math.round(census.warmShare * 100)}%</p>
      </div>
    </section>
  );
}

/** one sandbox row of the herd with its action buttons. */
function SandboxRow({
  sandbox,
  onAction,
  onStep,
}: {
  sandbox: Sandbox;
  onAction: (id: string, action: SandboxAction) => void;
  onStep: (id: string) => void;
}) {
  return (
    <article className="fs-row" data-state={sandbox.state}>
      <div className="fs-row__id">
        <h3 className="fs-row__name">{sandbox.name}</h3>
        <p className="fs-row__image">{sandbox.image}</p>
      </div>
      <div className="fs-row__state">
        <span className="fs-state">
          <i aria-hidden="true" />
          {STATE_LABEL[sandbox.state]}
        </span>
        <span className="fs-row__facts">
          boots {sandbox.boots} · steps {sandbox.steps}
        </span>
      </div>
      <div className="fs-row__actions">
        <button
          type="button"
          className="fs-act"
          aria-label={`warm ${sandbox.name}`}
          onClick={() => onAction(sandbox.id, "warm")}
        >
          <Thermometer size={13} aria-hidden="true" />
          warm
        </button>
        <button
          type="button"
          className="fs-act"
          aria-label={`heat ${sandbox.name}`}
          onClick={() => onAction(sandbox.id, "heat")}
        >
          <Flame size={13} aria-hidden="true" />
          heat
        </button>
        <button
          type="button"
          className="fs-act"
          aria-label={`cool ${sandbox.name}`}
          onClick={() => onAction(sandbox.id, "cool")}
        >
          <Snowflake size={13} aria-hidden="true" />
          cool
        </button>
        <button
          type="button"
          className="fs-act"
          aria-label={`freeze ${sandbox.name}`}
          onClick={() => onAction(sandbox.id, "freeze")}
        >
          freeze
        </button>
        <button
          type="button"
          className="fs-act fs-act--step"
          aria-label={`run one step on ${sandbox.name}`}
          onClick={() => onStep(sandbox.id)}
          disabled={sandbox.state !== "hot"}
        >
          <Play size={13} aria-hidden="true" />
          step
        </button>
      </div>
    </article>
  );
}

/** The sandboxes page: the machine room. */
export default function Sandboxes() {
  const [seed, setSeed] = useState(HERD_SEED);
  const [herd, setHerd] = useState<Sandbox[]>(() => seedHerd(HERD_SEED, 7));
  const [refusal, setRefusal] = useState<string | undefined>(undefined);
  const census = useMemo(() => herdCensus(herd), [herd]);

  /** drives one action through the real machine; a refusal surfaces on the
   * readout instead of pretending */
  function act(id: string, action: SandboxAction) {
    const target = herd.find((sandbox) => sandbox.id === id);
    if (!target) return;
    const answer = drive(target, action);
    setRefusal(answer.refusal);
    setHerd((current) => current.map((sandbox) => (sandbox.id === id ? answer.sandbox : sandbox)));
  }

  function runStep(id: string) {
    const target = herd.find((sandbox) => sandbox.id === id);
    if (!target) return;
    const answer = step(target);
    setRefusal(answer.refusal);
    setHerd((current) => current.map((sandbox) => (sandbox.id === id ? answer.sandbox : sandbox)));
  }

  function reseed() {
    const next = seed + 1;
    setSeed(next);
    setHerd(seedHerd(next, 7));
    setRefusal(undefined);
  }

  return (
    <main className="shell fs-page">
      <header className="pagehead">
        <p className="pagehead__eyebrow">sandboxes · the machine room</p>
        <h1 className="pagehead__title">Sandboxes</h1>
        <p className="pagehead__lede">
          The herd rides the cold → warm → hot ladder — cold waits built, warm keeps its working set, hot executes. A
          seeded rehearsal (seed {seed}) fills the room; the buttons drive the real state machine and the machine
          refuses what it does not do.
        </p>
        <div className="pagehead__actions">
          <button type="button" className="btn" onClick={reseed}>
            <RefreshCw size={14} aria-hidden="true" />
            reseed the herd
          </button>
        </div>
      </header>

      <Census census={census} />

      {refusal ? (
        <p className="fs-refusal" role="alert">
          the machine refuses: {refusal}
        </p>
      ) : (
        <p className="fs-refusal" data-idle="true" role="status">
          the machine answers — every move rides the cold → warm → hot ladder
        </p>
      )}

      {herd.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="the machine room stands empty"
          line="No sandbox is herded right now — reseed the rehearsal to fill the room again."
          action={
            <button type="button" className="btn secondary" onClick={reseed}>
              herd the rehearsal again
            </button>
          }
        />
      ) : (
        <section className="fs-herd" aria-label="the sandbox herd">
          <div className="fs-herd__head" aria-hidden="true">
            <span>sandbox</span>
            <span>state</span>
            <span>the machine</span>
          </div>
          {herd.map((sandbox) => (
            <SandboxRow key={sandbox.id} sandbox={sandbox} onAction={act} onStep={runStep} />
          ))}
        </section>
      )}

      <p className="fr-footnote">
        the machine allows cold → warm → hot and the cooling paths back — a cold sandbox never executes and a hot one is
        already executing. states: {SANDBOX_STATES.join(" · ")}.
      </p>
    </main>
  );
}
