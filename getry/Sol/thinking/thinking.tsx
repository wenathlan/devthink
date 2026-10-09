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
 * Thinking.tsx — the thinking page of the getry Sol theme: the 7-level
 * reasoning ladder drawn as one staircase — each rung steps deeper than
 * the last, the ladder dots walk the seven-rung scale, the default rung
 * is marked by the sky ladder — with the budget resolution doctrine below.
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

      <section className="section" aria-label="thinking levels">
        <div className="ladderledger">
          {THINKINGLEVELS.map((rung, index) => (
            <article
              key={rung.level}
              className={`ladderrung reveal${rung.level === DEFAULTTHINKINGLEVEL ? " default" : ""}`}
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
      </section>

      <section className="section" aria-label="budget doctrine">
        <div className="glass card reveal">
          <h2>
            <BrainCircuit size={18} /> how a level resolves
          </h2>
          <p>
            The gateway reads the level from the request body (or falls back to <code>{DEFAULTTHINKINGLEVEL}</code>),
            resolves the budget with the same math on every version — <code>budgetof("high")</code> answers{" "}
            <code>{formatbudget(budgetof(DEFAULTTHINKINGLEVEL))}</code> tokens — and records the rung on the session
            context so the rotation keeps the choice across turns. The caps repeat at the top of the ladder: xhigh and
            max ride the same 68k ceiling the providers allow.
          </p>
          <p className="mono" style={{ fontSize: "0.8rem", marginBottom: 0 }}>
            none · minimal · low · medium · high · xhigh · max — seven rungs, one budget math, zero client storage
          </p>
        </div>
      </section>
    </>
  );
}
