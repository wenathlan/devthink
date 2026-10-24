/**
 * retention page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it mounts the page and is consumed only by the theme anchor (Sol/Sol.tsx).
 *
 * Retention — the clock of the safe: the page rolls the rehearsal clock
 * forward (one tick = one day) and the REAL engine (retention.ts) answers
 * the verdicts — what stays sealed, what rides the last days of its window
 * and what the sweep would collect. The sweep is a plan, never an action:
 * the rehearsal keeps every byte, and the copy says so. Every number is
 * tabular; every state is a dot plus text, never color alone.
 */

import {
  ArrowRotateCounterclockwiseRegular,
  ClockRegular,
  DeleteRegular,
  HourglassRegular,
  PlayFilled,
  ShieldCheckmarkRegular,
} from "@fluentui/react-icons";
import { useMemo, useState } from "react";
import { type BucketRule, retentionLabel, seedRules } from "../../buckets.ts";
import { formatBytes, seedVault, type VaultObject } from "../../objects.ts";
import { label, labelfill } from "../../labels";
import {
  firstDueTick,
  horizonTick,
  type RetentionVerdict,
  ROLL_STEP,
  retentionVerdicts,
  sweepPlan,
  tickLabel,
} from "../../retention.ts";
import { EmptyState } from "../widgets";

/** the seed of the rehearsal clock (shown on the page, pinned by the tests) */
export const RETENTION_SEED = 440215;

/** one verdict row of the retention ledger. */
function VerdictRow({ verdict }: { verdict: RetentionVerdict }) {
  return (
    <article className="vr-row" data-state={verdict.state}>
      <div className="vr-row__id">
        <h3 className="vr-row__path">{verdict.object.path}</h3>
        <p className="vr-row__meta">
          {labelfill("retention.row.meta", {
            bucket: verdict.object.bucket,
            tick: tickLabel(verdict.object.sealedAt),
          })}
        </p>
      </div>
      <span className="vr-state">
        <i aria-hidden="true" />
        {verdict.state}
      </span>
      <span className="vr-row__age">{labelfill("retention.row.age", { days: String(verdict.ageDays) })}</span>
      <span className="vr-row__why">{verdict.why}</span>
    </article>
  );
}

/** The retention page: the clock and the sweep plan of the safe. */
export default function Retention() {
  const [seed, setSeed] = useState(RETENTION_SEED);
  const [rules, setRules] = useState<BucketRule[]>(() => seedRules(RETENTION_SEED));
  const [objects, setObjects] = useState<VaultObject[]>(() => seedVault(RETENTION_SEED));
  const [now, setNow] = useState(0);

  const verdicts = useMemo(() => retentionVerdicts(objects, rules, now), [objects, rules, now]);
  const plan = useMemo(() => sweepPlan(objects, rules, now), [objects, rules, now]);
  const firstDue = useMemo(() => firstDueTick(objects, rules), [objects, rules]);
  const horizon = useMemo(() => horizonTick(objects, rules), [objects, rules]);
  const sealedCount = verdicts.filter((verdict) => verdict.state === "sealed").length;
  const protectedCount = verdicts.filter((verdict) => verdict.state === "protected").length;

  return (
    <main className="shell vr-page">
      <header className="pagehead">
        <p className="pagehead__eyebrow">{label("retention.eyebrow")}</p>
        <h1 className="pagehead__title">{label("retention.title")}</h1>
        <p className="pagehead__lede">{labelfill("retention.lede", { tick: tickLabel(now) })}</p>
        <div className="pagehead__actions">
          <button type="button" className="btn" onClick={() => setNow((value) => value + ROLL_STEP)}>
            <PlayFilled fontSize={14} aria-hidden="true" />
            {labelfill("retention.action.roll", { step: String(ROLL_STEP) })}
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setSeed(RETENTION_SEED);
              setRules(seedRules(RETENTION_SEED));
              setObjects(seedVault(RETENTION_SEED));
              setNow(0);
            }}
          >
            <ArrowRotateCounterclockwiseRegular fontSize={14} aria-hidden="true" />
            {label("retention.action.restore")}
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              const next = seed + 1;
              setSeed(next);
              setRules(seedRules(next));
              setObjects(seedVault(next));
              setNow(0);
            }}
          >
            <HourglassRegular fontSize={14} aria-hidden="true" />
            {labelfill("retention.action.reseed", { seed: String(seed + 1) })}
          </button>
        </div>
      </header>

      <section className="vr-summary" aria-label={label("retention.summary.aria")}>
        <div className="vr-summary__cell">
          <p className="vr-summary__label">
            <ClockRegular fontSize={13} aria-hidden="true" />
            {label("retention.summary.clock")}
          </p>
          <p className="vr-summary__value">{tickLabel(now)}</p>
        </div>
        <div className="vr-summary__cell">
          <p className="vr-summary__label">
            <ShieldCheckmarkRegular fontSize={13} aria-hidden="true" />
            {label("retention.summary.window")}
          </p>
          <p className="vr-summary__value">{labelfill("retention.summary.sealed", { count: String(sealedCount) })}</p>
        </div>
        <div className="vr-summary__cell">
          <p className="vr-summary__label">{label("retention.summary.forever")}</p>
          <p className="vr-summary__value">
            {labelfill("retention.summary.protected", { count: String(protectedCount) })}
          </p>
        </div>
        <div className="vr-summary__cell vr-summary__cell--wide">
          <p className="vr-summary__label">
            <DeleteRegular fontSize={13} aria-hidden="true" />
            {label("retention.summary.sweep")}
          </p>
          <p className="vr-summary__value">
            {labelfill("retention.summary.plan", { rows: String(plan.due.length), bytes: formatBytes(plan.bytes) })}
          </p>
        </div>
      </section>

      <section className="vr-timeline" aria-label={label("retention.timeline.aria")}>
        <p className="vr-timeline__head">{label("retention.timeline.head")}</p>
        <ul className="vr-ladder">
          {rules.map((rule) => (
            <li key={rule.bucket} className="vr-rung">
              <span className="vr-rung__bucket">{rule.bucket}</span>
              <span
                className="vr-rung__bar"
                role="img"
                aria-label={labelfill("retention.rung.aria", { bucket: rule.bucket, label: retentionLabel(rule.days) })}
                data-forever={rule.days === 0 ? "true" : undefined}
              >
                <i style={{ width: rule.days === 0 ? "100%" : `${Math.min(100, (rule.days / 365) * 100)}%` }} />
                <span className="vr-rung__label">{retentionLabel(rule.days)}</span>
              </span>
              <span className="vr-rung__note">{rule.note}</span>
            </li>
          ))}
        </ul>
        <p className="vr-timeline__fact">
          {labelfill("retention.timeline.fact", {
            first: Number.isFinite(firstDue) ? tickLabel(firstDue) : label("retention.tick.never"),
            horizon: horizon === 0 ? label("retention.tick.forever") : tickLabel(horizon),
          })}
        </p>
      </section>

      {verdicts.length === 0 ? (
        <EmptyState
          icon={HourglassRegular}
          title={label("retention.empty.title")}
          line={label("retention.empty.line")}
          action={
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                setObjects(seedVault(seed));
                setNow(0);
              }}
            >
              {label("retention.empty.action")}
            </button>
          }
        />
      ) : (
        <section className="vr-ledger" aria-label={label("retention.ledger.aria")}>
          <div className="vr-ledger__head" aria-hidden="true">
            <span>{label("retention.ledger.object")}</span>
            <span>{label("retention.ledger.state")}</span>
            <span>{label("retention.ledger.age")}</span>
            <span>{label("retention.ledger.why")}</span>
          </div>
          {verdicts.map((verdict) => (
            <VerdictRow key={verdict.object.id} verdict={verdict} />
          ))}
        </section>
      )}

      <p className="fr-footnote">
        {labelfill("retention.footnote", {
          rows: String(plan.due.length),
          bytes: formatBytes(plan.bytes),
          tick: tickLabel(now),
        })}
      </p>
    </main>
  );
}
