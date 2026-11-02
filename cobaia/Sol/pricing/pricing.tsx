/**
 * pricing page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 *
 * The pricing table of the cobaia content site: three honest plans (free,
 * pro, studio — us$0 / 5 / 19 a month, placeholders until billing lands).
 * The billing values answer from the pure config at the app root
 * (checkoutlinks.ts — ids, prices, checkout hrefs) and every plan sentence
 * (name, blurb, features) rides the label store: a configured link renders
 * a real anchor, an empty one renders the disabled button with the honest
 * note "checkout not configured yet". No checkout page carries an ad — the
 * ad slots live only on the content pages. Zero network calls: the links
 * are plain hrefs the visitor chooses to follow.
 */
import type { CSSProperties } from "react";
import { PLANS, isconfigured, type checkoutplan } from "../../checkoutlinks";
import { labelfill, label } from "../../labels";

/** renders one plan's checkout control: a live anchor when the owner
 * configured the link, the honest disabled state until then. */
function PlanAction({ plan }: { plan: checkoutplan }) {
  if (isconfigured(plan.href)) {
    return (
      <a className="cb-btn" href={plan.href} rel="noreferrer">
        {labelfill("pricing.action.choose", { name: label(plan.nameKey) })}
      </a>
    );
  }
  return (
    <>
      <button className="cb-btn" type="button" disabled>
        {labelfill("pricing.action.choose", { name: label(plan.nameKey) })}
      </button>
      <p className="cb-note">{label("pricing.action.notConfigured")}</p>
    </>
  );
}

export function Pricing() {
  return (
    <div className="cb-page">
      <section className="cb-hero" aria-label={label("pricing.aria.hero")}>
        <p className="cb-eyebrow cb-in" style={{ "--cb-d": 0 } as CSSProperties}>
          {label("pricing.eyebrow")}
        </p>
        <h1 className="cb-title cb-in" style={{ "--cb-d": 1 } as CSSProperties}>
          {label("pricing.title")}
        </h1>
        <p className="cb-lede cb-in" style={{ "--cb-d": 2 } as CSSProperties}>
          {label("pricing.lede")}
        </p>
      </section>

      <section className="cb-section" aria-label={label("pricing.section.plansAria")}>
        <div className="cb-plans">
          {PLANS.map((plan, index) => (
            <article
              key={plan.id}
              className={plan.id === "studio" ? "cb-plan cb-plan--lead cb-in" : "cb-plan cb-in"}
              style={{ "--cb-d": index + 1 } as CSSProperties}
              aria-label={labelfill("pricing.card.planAria", { name: label(plan.nameKey) })}
            >
              <p className="cb-planname">{label(plan.nameKey)}</p>
              <p className="cb-planprice">
                ${plan.priceusd}
                <span className="cb-planper"> / {label(plan.perKey)}</span>
              </p>
              <p className="cb-planblurb">{label(plan.blurbKey)}</p>
              <ul className="cb-planfeats">
                {plan.featureKeys.map((featureKey) => (
                  <li key={featureKey} className="cb-planfeat">
                    {label(featureKey)}
                  </li>
                ))}
              </ul>
              <PlanAction plan={plan} />
            </article>
          ))}
        </div>
      </section>

      <section className="cb-section" aria-label={label("pricing.section.moneyAria")}>
        <div className="cb-secthead">
          <h2 className="cb-secttitle">{label("pricing.section.moneyTitle")}</h2>
          <p className="cb-sectlede">{label("pricing.section.moneyLede")}</p>
        </div>
        <p className="cb-note is-live">{label("pricing.section.moneyNote")}</p>
      </section>
    </div>
  );
}

export default Pricing;
