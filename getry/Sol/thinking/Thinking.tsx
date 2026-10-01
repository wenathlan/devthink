/**
 * Thinking.tsx — the thinking page of the getry Sol theme: the 7-level
 * reasoning ladder with the budget each rung carries and how the gateway
 * resolves a request that names no level.
 */
import { useEffect } from "react";
import { BrainCircuit } from "lucide-react";
import { observeReveals } from "../../reveal";
import { DEFAULTTHINKINGLEVEL, THINKINGLEVELS, budgetof, formatbudget } from "../../thinking";

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
      <section className="pagehead">
        <p className="eyebrow">the reasoning ladder</p>
        <h1>the 7-level thinking system</h1>
        <p>
          Every chat route accepts a thinking level; the gateway resolves it to the budget the provider receives and
          carries the choice on the session context. Requests that name no level ride the deep-reasoning default.
        </p>
      </section>

      <section className="section" aria-label="thinking levels">
        <div className="thinkingladder">
          {THINKINGLEVELS.map((rung) => (
            <article key={rung.level} className={`glass glass-hover card laddercard reveal${rung.level === DEFAULTTHINKINGLEVEL ? " default" : ""}`}>
              <div className="ladderhead">
                <span className="laddername">{rung.level}</span>
                {rung.level === DEFAULTTHINKINGLEVEL ? <span className="badge info">default</span> : null}
              </div>
              <p className="ladderbudget">
                {rung.budget === 0 ? "0" : formatbudget(rung.budget)}
                <small> tokens</small>
              </p>
              <p className="ladderdesc">{rung.desc}</p>
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
