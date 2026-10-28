/**
 * intro.plans.tsx — the plans zone of the intro: the real offer, read from
 * the one checkoutlinks table the pricing page reads — never restated, never
 * rounded, never invented. A configured checkout href renders a live anchor;
 * an empty one renders the disabled button with the honest note "checkout
 * not configured yet" — the not-configured state stays honest, exactly like
 * /pricing. The studio plan leads raised, the same lead law the pricing page
 * carries. The section rides a ladder band (the surface rung s0) and the
 * cb-in stagger under the second; zero network calls — the links are plain
 * hrefs the visitor chooses to follow.
 */

import type { CSSProperties } from "react";
import { Link } from "wouter";
import { type checkoutplan, isconfigured, PLANS } from "../../checkoutlinks";
import { label, labelfill } from "../../labels";

/** renders one plan's checkout control: a live anchor when the owner
 * configured the link, the honest disabled state until then. */
function PlanAction({ plan }: { plan: checkoutplan }) {
  if (isconfigured(plan.href)) {
    return (
      <a className="cb-btn" href={plan.href} rel="noreferrer">
        {labelfill("intro.plans.choose", { name: plan.name })}
      </a>
    );
  }
  return (
    <>
      <button className="cb-btn" type="button" disabled>
        {labelfill("intro.plans.choose", { name: plan.name })}
      </button>
      <p className="cb-note">{label("intro.plans.notConfigured")}</p>
    </>
  );
}

/**
 * The plans zone: the section head, the three honest plans and the door to
 * the full pricing page.
 *
 * @returns the plans section element.
 */
export function IntroPlans() {
  return (
    <section className="cb-introband cb-introband--s1" id="intro-plans" aria-label={label("intro.plans.aria")}>
      <div className="cb-introwrap">
        <div className="cb-secthead cb-in" style={{ "--cb-d": 0 } as CSSProperties}>
          <p className="cb-eyebrow">{label("intro.plans.eyebrow")}</p>
          <h2 className="cb-secttitle">{label("intro.plans.title")}</h2>
          <p className="cb-sectlede">{label("intro.plans.lede")}</p>
        </div>
        <div className="cb-plans">
          {PLANS.map((plan, index) => (
            <article
              key={plan.id}
              className={plan.id === "studio" ? "cb-plan cb-plan--lead cb-in" : "cb-plan cb-in"}
              style={{ "--cb-d": index + 1 } as CSSProperties}
              aria-label={labelfill("pricing.card.planAria", { name: plan.name })}
            >
              <p className="cb-planname">{plan.name}</p>
              <p className="cb-planprice">
                ${plan.priceusd}
                <span className="cb-planper"> / {plan.per}</span>
              </p>
              <p className="cb-planblurb">{plan.blurb}</p>
              <ul className="cb-planfeats">
                {plan.features.map((feature) => (
                  <li key={feature} className="cb-planfeat">
                    {feature}
                  </li>
                ))}
              </ul>
              <PlanAction plan={plan} />
            </article>
          ))}
        </div>
        <p className="cb-introdoorline cb-in" style={{ "--cb-d": 4 } as CSSProperties}>
          <Link className="cb-link" href="/pricing">
            {label("intro.plans.door")}
          </Link>
        </p>
      </div>
    </section>
  );
}

export default IntroPlans;
