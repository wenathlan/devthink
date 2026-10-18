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
import {
  firstDueTick,
  horizonTick,
  type RetentionVerdict,
  ROLL_STEP,
  retentionVerdicts,
  sweepPlan,
  tickLabel,
} from "../../retention.ts";
import { EmptyState } from "../shell/EmptyState";

/** the seed of the rehearsal clock (shown on the page, pinned by the tests) */
export const RETENTION_SEED = 440215;

/** one verdict row of the retention ledger. */
function VerdictRow({ verdict }: { verdict: RetentionVerdict }) {
  return (
    <article className="vr-row" data-state={verdict.state}>
      <div className="vr-row__id">
        <h3 className="vr-row__path">{verdict.object.path}</h3>
        <p className="vr-row__meta">
          {verdict.object.bucket} · sealed at {tickLabel(verdict.object.sealedAt)}
        </p>
      </div>
      <span className="vr-state">
        <i aria-hidden="true" />
        {verdict.state}
      </span>
      <span className="vr-row__age">age {verdict.ageDays}d</span>
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
        <p className="pagehead__eyebrow">retention · the clock of the safe</p>
        <h1 className="pagehead__title">Retention</h1>
        <p className="pagehead__lede">
          One tick of the vault is one day of rehearsal time — the clock now rides {tickLabel(now)}. The engine answers
          the verdicts and the sweep PLAN; the rehearsal never deletes a byte.
        </p>
        <div className="pagehead__actions">
          <button type="button" className="btn" onClick={() => setNow((value) => value + ROLL_STEP)}>
            <PlayFilled fontSize={14} aria-hidden="true" />
            roll the clock +{ROLL_STEP}d
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
            restore the rehearsal
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
            reseed seed {seed + 1}
          </button>
        </div>
      </header>

      <section className="vr-summary" aria-label="the retention summary">
        <div className="vr-summary__cell">
          <p className="vr-summary__label">
            <ClockRegular fontSize={13} aria-hidden="true" />
            the clock
          </p>
          <p className="vr-summary__value">{tickLabel(now)}</p>
        </div>
        <div className="vr-summary__cell">
          <p className="vr-summary__label">
            <ShieldCheckmarkRegular fontSize={13} aria-hidden="true" />
            inside the window
          </p>
          <p className="vr-summary__value">{sealedCount} sealed</p>
        </div>
        <div className="vr-summary__cell">
          <p className="vr-summary__label">forever rows</p>
          <p className="vr-summary__value">{protectedCount} protected</p>
        </div>
        <div className="vr-summary__cell vr-summary__cell--wide">
          <p className="vr-summary__label">
            <DeleteRegular fontSize={13} aria-hidden="true" />
            the sweep would collect
          </p>
          <p className="vr-summary__value">
            {plan.due.length} rows · {formatBytes(plan.bytes)}
          </p>
        </div>
      </section>

      <section className="vr-timeline" aria-label="the retention timeline of the shelf">
        <p className="vr-timeline__head">the shelf policies — window days per bucket</p>
        <ul className="vr-ladder">
          {rules.map((rule) => (
            <li key={rule.bucket} className="vr-rung">
              <span className="vr-rung__bucket">{rule.bucket}</span>
              <span
                className="vr-rung__bar"
                role="img"
                aria-label={`${rule.bucket}: ${retentionLabel(rule.days)}`}
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
          the first window expires at {Number.isFinite(firstDue) ? tickLabel(firstDue) : "never"} · the far end of the
          shelf rides {horizon === 0 ? "forever" : tickLabel(horizon)} · the ladder bar reads against a 365-day scale
          (forever fills it — labeled, never colored alone)
        </p>
      </section>

      {verdicts.length === 0 ? (
        <EmptyState
          icon={HourglassRegular}
          title="the clock reads an empty vault"
          line="No row rides the ledger — restore the rehearsal to set the clock against real objects."
          action={
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                setObjects(seedVault(seed));
                setNow(0);
              }}
            >
              restore the rehearsal vault
            </button>
          }
        />
      ) : (
        <section className="vr-ledger" aria-label="the retention verdicts">
          <div className="vr-ledger__head" aria-hidden="true">
            <span>object</span>
            <span>state</span>
            <span>age</span>
            <span>why</span>
          </div>
          {verdicts.map((verdict) => (
            <VerdictRow key={verdict.object.id} verdict={verdict} />
          ))}
        </section>
      )}

      <p className="fr-footnote">
        the sweep is a plan, never an action — {plan.due.length} rows · {formatBytes(plan.bytes)} would leave the safe
        at {tickLabel(now)}, and the rehearsal keeps every byte of them.
      </p>
    </main>
  );
}
