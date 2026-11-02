/**
 * checkoutlinks.ts — the billing configuration of the family site, pure data
 * at the app root. The pricing page reads the plan table and the support page
 * reads the support channels from here; the payment links themselves are
 * configuration, never code: the owner pastes the checkout hrefs (Stripe
 * Payment Links or Paddle overlays) into this file once billing goes live.
 * Until then every href ships empty and the interface renders the honest
 * empty state — "checkout not configured yet" — instead of pretending.
 *
 * The words never ride here: every plan sentence (name, billing period,
 * blurb, features) answers from the label store (labels.ts — the manifest
 * the seed carries into the site database), so the pricing cards and the
 * intro plans zone read their prose through the typed accessor and this
 * file keeps only the billing values — ids, prices and links.
 *
 * No network call ever happens here: the links are plain hrefs the visitor
 * chooses to follow, no key is committed (not even a placeholder that looks
 * real) and no script is loaded. The prices are placeholders (US$0 / 5 / 19
 * per month) until the billing platform decision lands.
 */

import type { LabelKey } from "./labels.ts";

/** one plan row of the pricing page: the billing values and the label keys
 * of the plan prose (the store answers the words, this row answers the
 * numbers and the link). */
export type checkoutplan = {
  /** the stable plan id used by the interface and the tests */
  id: string;
  /** the placeholder monthly price in us dollars */
  priceusd: number;
  /** the label key of the display name of the plan */
  nameKey: LabelKey;
  /** the label key of the billing period the price reads against */
  perKey: LabelKey;
  /** the label key of the one-line honest promise of the plan */
  blurbKey: LabelKey;
  /** the label keys of the concrete features the plan includes */
  featureKeys: readonly LabelKey[];
  /** the payment link href — empty until the owner configures billing */
  href: string;
};

/** the pricing table of the /pricing page, in display order (the prose
 * answers from the label store — only the billing values live here). */
export const PLANS: readonly checkoutplan[] = [
  {
    id: "free",
    priceusd: 0,
    nameKey: "pricing.plan.free.name",
    perKey: "pricing.plan.free.per",
    blurbKey: "pricing.plan.free.blurb",
    featureKeys: [
      "pricing.plan.free.feat.1",
      "pricing.plan.free.feat.2",
      "pricing.plan.free.feat.3",
    ],
    href: "",
  },
  {
    id: "pro",
    priceusd: 5,
    nameKey: "pricing.plan.pro.name",
    perKey: "pricing.plan.pro.per",
    blurbKey: "pricing.plan.pro.blurb",
    featureKeys: [
      "pricing.plan.pro.feat.1",
      "pricing.plan.pro.feat.2",
      "pricing.plan.pro.feat.3",
    ],
    href: "",
  },
  {
    id: "studio",
    priceusd: 19,
    nameKey: "pricing.plan.studio.name",
    perKey: "pricing.plan.studio.per",
    blurbKey: "pricing.plan.studio.blurb",
    featureKeys: [
      "pricing.plan.studio.feat.1",
      "pricing.plan.studio.feat.2",
      "pricing.plan.studio.feat.3",
    ],
    href: "",
  },
];

/** the support channels of the /support page — the same rule as the plans:
 * hrefs stay empty until the owner configures them. */
export const SUPPORTLINKS: Readonly<{ sponsors: string; kofi: string }> = {
  /** the GitHub Sponsors profile url */
  sponsors: "",
  /** the Ko-fi page url */
  kofi: "",
};

/**
 * Answers whether a configured link is live. An empty (or whitespace) href
 * means the feature is not configured yet and the interface must say so.
 *
 * @param href the configured link href.
 * @returns true only when the href carries a real target.
 */
export function isconfigured(href: string): boolean {
  return href.trim().length > 0;
}

/**
 * Finds one plan of the table by its stable id.
 *
 * @param id the plan id (free, pro, studio).
 * @returns the plan, or undefined when no plan carries the id.
 */
export function planbyid(id: string): checkoutplan | undefined {
  return PLANS.find((plan) => plan.id === id);
}
