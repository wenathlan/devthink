/**
 * thinking page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { BrainRegular } from "@fluentui/react-icons";
/**
 * Thinking.tsx — the thinking page of the getry Sol theme (campaign v3 ·
 * r3): the 7-level reasoning ladder as one operational mono ladder — each
 * rung carries its hairline budget bar against the 68k ceiling, the default
 * rung rides the sky edge — beside the resolution rail that explains the
 * one budget math. every number reads thinking.ts; nothing is invented.
 */
import { useEffect } from "react";
import { label, labelfill } from "../../labels";
import { observeReveals } from "../../reveal";
import { budgetof, DEFAULTTHINKINGLEVEL, formatbudget, THINKINGLEVELS } from "../../thinking";

/**
 * the thinking page.
 *
 * @returns the thinking element.
 */
export default function Thinking() {
  useEffect(() => {
    observeReveals();
  }, []);

  /** the shared ceiling of the ladder (the rungs that max out the providers). */
  const ceiling = budgetof("max");

  return (
    <>
      <section className="pagehead halftone">
        <p className="eyebrow">{label("thinking.eyebrow")}</p>
        <h1>{label("thinking.title")}</h1>
        <p>{label("thinking.lede")}</p>
      </section>

      <section className="section r3-ops" aria-label={label("thinking.levels.aria")}>
        <div className="r3-split">
          <div className="ladderledger r3-ladder">
            {THINKINGLEVELS.map((rung, index) => (
              <article
                key={rung.level}
                className={`ladderrung r3-rung reveal${rung.level === DEFAULTTHINKINGLEVEL ? " default" : ""}`}
              >
                <span className="ladderrung__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="ladderrung__body">
                  <h3 className="ladderrung__name">
                    {rung.level}
                    {rung.level === DEFAULTTHINKINGLEVEL ? (
                      <span className="badge info">{label("thinking.defaultBadge")}</span>
                    ) : null}
                  </h3>
                  <p className="ladderrung__desc">{rung.desc}</p>
                  <span className="r3-budget" aria-hidden="true">
                    <i style={{ width: `${rung.budget === 0 ? 0 : Math.round((rung.budget / ceiling) * 100)}%` }} />
                  </span>
                </div>
                <p className="ladderrung__budget">
                  {labelfill("thinking.rung.budget", { budget: rung.budget === 0 ? "0" : formatbudget(rung.budget) })}
                </p>
                <span className="ladderrung__dots ladderdots" aria-hidden="true">
                  {THINKINGLEVELS.map((dot) => (
                    <i key={dot.level} data-on={THINKINGLEVELS.indexOf(dot) <= index ? "true" : undefined} />
                  ))}
                </span>
              </article>
            ))}
          </div>

          <aside className="r3-rail">
            <div className="railmeta reveal">
              <p className="railmeta__head">
                <BrainRegular fontSize={13} aria-hidden="true" /> {label("thinking.rail.head")}
              </p>
              <p className="r3-rail__lede">
                {label("thinking.rail.ledeLead")}
                <code>{DEFAULTTHINKINGLEVEL}</code>
                {label("thinking.rail.ledeMid1")}
                <code>budgetof("high")</code>
                {label("thinking.rail.ledeMid2")}
                <code>{formatbudget(budgetof(DEFAULTTHINKINGLEVEL))}</code>
                {label("thinking.rail.ledeTail")}
              </p>
              <div className="railmeta__row">
                <span>{label("thinking.rail.ladder")}</span>
                <strong>{THINKINGLEVELS.map((rung) => rung.level).join(" · ")}</strong>
              </div>
              <div className="railmeta__row">
                <span>{label("thinking.rail.defaultRung")}</span>
                <strong>{DEFAULTTHINKINGLEVEL}</strong>
              </div>
              <div className="railmeta__row">
                <span>{label("thinking.rail.defaultBudget")}</span>
                <strong>{formatbudget(budgetof(DEFAULTTHINKINGLEVEL))}</strong>
              </div>
              <p className="railmeta__foot">
                {labelfill("thinking.rail.foot", { ceiling: formatbudget(ceiling) })}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
