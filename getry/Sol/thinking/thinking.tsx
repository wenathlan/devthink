/**
 * thinking page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { BrainCircuit } from "lucide-react";
/**
 * Thinking.tsx — the thinking page of the getry Sol theme (campaign v3 ·
 * r3): the 7-level reasoning ladder as one operational mono ladder — each
 * rung carries its hairline budget bar against the 68k ceiling, the default
 * rung rides the sky edge — beside the resolution rail that explains the
 * one budget math. every number reads thinking.ts; nothing is invented.
 */
import { useEffect } from "react";
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
        <p className="eyebrow">getry · thinking</p>
        <h1>the 7-level thinking system</h1>
        <p>
          Every chat route accepts a thinking level; the gateway resolves it to the budget the provider receives and
          carries the choice on the session context. Requests that name no level ride the deep-reasoning default.
        </p>
      </section>

      <section className="section r3-ops" aria-label="thinking levels">
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
                    {rung.level === DEFAULTTHINKINGLEVEL ? <span className="badge info">default</span> : null}
                  </h3>
                  <p className="ladderrung__desc">{rung.desc}</p>
                  <span className="r3-budget" aria-hidden="true">
                    <i style={{ width: `${rung.budget === 0 ? 0 : Math.round((rung.budget / ceiling) * 100)}%` }} />
                  </span>
                </div>
                <p className="ladderrung__budget">
                  {rung.budget === 0 ? "0" : formatbudget(rung.budget)}
                  <small> tokens</small>
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
                <BrainCircuit size={13} aria-hidden="true" /> how a level resolves
              </p>
              <p className="r3-rail__lede">
                The gateway reads the level from the request body (or falls back to <code>{DEFAULTTHINKINGLEVEL}</code>)
                and resolves the budget with the same math on every version — <code>budgetof("high")</code> answers{" "}
                <code>{formatbudget(budgetof(DEFAULTTHINKINGLEVEL))}</code> tokens — and records the rung on the session
                context so the rotation keeps the choice across turns.
              </p>
              <div className="railmeta__row">
                <span>ladder</span>
                <strong>{THINKINGLEVELS.map((rung) => rung.level).join(" · ")}</strong>
              </div>
              <div className="railmeta__row">
                <span>default rung</span>
                <strong>{DEFAULTTHINKINGLEVEL}</strong>
              </div>
              <div className="railmeta__row">
                <span>default budget</span>
                <strong>{formatbudget(budgetof(DEFAULTTHINKINGLEVEL))}</strong>
              </div>
              <p className="railmeta__foot">
                The caps repeat at the top of the ladder: xhigh and max ride the same {formatbudget(ceiling)} ceiling
                the providers allow. Seven rungs, one budget math, zero client storage.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
