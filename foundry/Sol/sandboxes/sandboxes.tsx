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

import {
  ArrowSyncRegular,
  BoxMultipleRegular,
  FireRegular,
  PlayFilled,
  TemperatureRegular,
  WeatherSnowflakeRegular,
} from "@fluentui/react-icons";
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
import { labelfill, label } from "../../labels.ts";
import { EmptyState } from "../widgets";

/** the seed of the rehearsal herd (shown on the page, pinned by the tests) */
export const HERD_SEED = 620221;

/** the state label of a census cell */
const STATE_LABEL: Readonly<Record<Sandbox["state"], string>> = {
  cold: label("sand.state.cold"),
  warm: label("sand.state.warm"),
  hot: label("sand.state.hot"),
};

/** the summary band of the machine room. */
function Census({ census }: { census: HerdCensus }) {
  return (
    <section className="fs-summary" aria-label={label("sand.census.aria")}>
      <div className="fs-summary__cell">
        <p className="fs-summary__label">
          <BoxMultipleRegular fontSize={13} aria-hidden="true" />
          {label("sand.census.sandboxes")}
        </p>
        <p className="fs-summary__value">{census.total}</p>
      </div>
      <div className="fs-summary__cell fs-summary__cell--wide">
        <p className="fs-summary__label">{label("sand.census.ladder")}</p>
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
        <p className="fs-summary__label">{label("sand.census.warmShare")}</p>
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
          {labelfill("sand.row.facts", { boots: String(sandbox.boots), steps: String(sandbox.steps) })}
        </span>
      </div>
      <div className="fs-row__actions">
        <button
          type="button"
          className="fs-act"
          aria-label={labelfill("sand.act.warmAria", { name: sandbox.name })}
          onClick={() => onAction(sandbox.id, "warm")}
        >
          <TemperatureRegular fontSize={13} aria-hidden="true" />
          {label("sand.act.warm")}
        </button>
        <button
          type="button"
          className="fs-act"
          aria-label={labelfill("sand.act.heatAria", { name: sandbox.name })}
          onClick={() => onAction(sandbox.id, "heat")}
        >
          <FireRegular fontSize={13} aria-hidden="true" />
          {label("sand.act.heat")}
        </button>
        <button
          type="button"
          className="fs-act"
          aria-label={labelfill("sand.act.coolAria", { name: sandbox.name })}
          onClick={() => onAction(sandbox.id, "cool")}
        >
          <WeatherSnowflakeRegular fontSize={13} aria-hidden="true" />
          {label("sand.act.cool")}
        </button>
        <button
          type="button"
          className="fs-act"
          aria-label={labelfill("sand.act.freezeAria", { name: sandbox.name })}
          onClick={() => onAction(sandbox.id, "freeze")}
        >
          {label("sand.act.freeze")}
        </button>
        <button
          type="button"
          className="fs-act fs-act--step"
          aria-label={labelfill("sand.act.stepAria", { name: sandbox.name })}
          onClick={() => onStep(sandbox.id)}
          disabled={sandbox.state !== "hot"}
        >
          <PlayFilled fontSize={13} aria-hidden="true" />
          {label("sand.act.step")}
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
        <p className="pagehead__eyebrow">{label("sand.eyebrow")}</p>
        <h1 className="pagehead__title">{label("sand.title")}</h1>
        <p className="pagehead__lede">{labelfill("sand.lede", { seed: String(seed) })}</p>
        <div className="pagehead__actions">
          <button type="button" className="btn" onClick={reseed}>
            <ArrowSyncRegular fontSize={14} aria-hidden="true" />
            {label("sand.reseed")}
          </button>
        </div>
      </header>

      <Census census={census} />

      {refusal ? (
        <p className="fs-refusal" role="alert">
          {labelfill("sand.refused", { why: refusal })}
        </p>
      ) : (
        <p className="fs-refusal" data-idle="true" role="status">
          {label("sand.answered")}
        </p>
      )}

      {herd.length === 0 ? (
        <EmptyState
          icon={BoxMultipleRegular}
          title={label("sand.empty.title")}
          line={label("sand.empty.line")}
          action={
            <button type="button" className="btn secondary" onClick={reseed}>
              {label("sand.empty.action")}
            </button>
          }
        />
      ) : (
        <section className="fs-herd" aria-label={label("sand.herd.aria")}>
          <div className="fs-herd__head" aria-hidden="true">
            <span>{label("sand.head.sandbox")}</span>
            <span>{label("sand.head.state")}</span>
            <span>{label("sand.head.machine")}</span>
          </div>
          {herd.map((sandbox) => (
            <SandboxRow key={sandbox.id} sandbox={sandbox} onAction={act} onStep={runStep} />
          ))}
        </section>
      )}

      <p className="fr-footnote">{labelfill("sand.footnote", { list: SANDBOX_STATES.join(" · ") })}</p>
    </main>
  );
}
