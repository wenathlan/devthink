/**
 * pricing page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 *
 * The pricing table of the cobaia content site: three honest plans (free,
 * pro, studio — us$0 / 5 / 19 a month, placeholders until billing lands).
 * The buttons read their checkout href from the pure config at the app root
 * (checkoutlinks.ts): a configured link renders a real anchor, an empty one
 * renders the disabled button with the honest note "checkout not configured
 * yet". No checkout page carries an ad — the ad slots live only on the
 * content pages. Zero network calls: the links are plain hrefs the visitor
 * chooses to follow.
 */
import type { CSSProperties } from "react";
import { PLANS, isconfigured, type checkoutplan } from "../../checkoutlinks";

/** renders one plan's checkout control: a live anchor when the owner
 * configured the link, the honest disabled state until then. */
function PlanAction({ plan }: { plan: checkoutplan }) {
  if (isconfigured(plan.href)) {
    return (
      <a className="cb-btn" href={plan.href} rel="noreferrer">
        choose {plan.name}
      </a>
    );
  }
  return (
    <>
      <button className="cb-btn" type="button" disabled>
        choose {plan.name}
      </button>
      <p className="cb-note">checkout not configured yet</p>
    </>
  );
}

export function Pricing() {
  return (
    <div className="cb-page">
      <section className="cb-hero" aria-label="cobaia pricing">
        <p className="cb-eyebrow cb-in" style={{ "--cb-d": 0 } as CSSProperties}>
          pricing
        </p>
        <h1 className="cb-title cb-in" style={{ "--cb-d": 1 } as CSSProperties}>
          Pay for what you use. Or use it free.
        </h1>
        <p className="cb-lede cb-in" style={{ "--cb-d": 2 } as CSSProperties}>
          the core surface of every application is free and stays free. the paid plans unlock pro features per app or
          across the family. the prices below are placeholders until billing goes live — a plan activates the moment its
          checkout link is configured, and says so honestly until then.
        </p>
      </section>

      <section className="cb-section" aria-label="the plans">
        <div className="cb-plans">
          {PLANS.map((plan, index) => (
            <article
              key={plan.id}
              className={plan.id === "studio" ? "cb-plan cb-plan--lead cb-in" : "cb-plan cb-in"}
              style={{ "--cb-d": index + 1 } as CSSProperties}
              aria-label={`${plan.name} plan`}
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
      </section>

      <section className="cb-section" aria-label="what the money covers">
        <div className="cb-secthead">
          <h2 className="cb-secttitle">What the money covers</h2>
          <p className="cb-sectlede">
            the family runs on about us$15 a month of domains and free static hosting. the paid plans cover that floor
            first, then the gateway tiers. there are no ads inside the applications — the ad slots live only on this
            site's content pages, and they are labeled and reserved.
          </p>
        </div>
        <p className="cb-note is-live">
          billing decision pending: stripe payment links or paddle (merchant of record). the checkout hrefs are
          configuration at the app root — never code, never a committed key.
        </p>
      </section>
    </div>
  );
}

export default Pricing;
