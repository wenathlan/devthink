/**
 * checkoutlinks.ts — the billing configuration of the family site, pure data
 * at the app root. The pricing page reads the plan table and the support page
 * reads the support channels from here; the payment links themselves are
 * configuration, never code: the owner pastes the checkout hrefs (Stripe
 * Payment Links or Paddle overlays) into this file once billing goes live.
 * Until then every href ships empty and the interface renders the honest
 * empty state — "checkout not configured yet" — instead of pretending.
 *
 * No network call ever happens here: the links are plain hrefs the visitor
 * chooses to follow, no key is committed (not even a placeholder that looks
 * real) and no script is loaded. The prices are placeholders (US$0 / 5 / 19
 * per month) until the billing platform decision lands.
 */

/** one plan row of the pricing page: the honest offer and its config link. */
export type checkoutplan = {
  /** the stable plan id used by the interface and the tests */
  id: string;
  /** the display name of the plan */
  name: string;
  /** the placeholder monthly price in us dollars */
  priceusd: number;
  /** the billing period the price reads against */
  per: string;
  /** the one-line honest promise of the plan */
  blurb: string;
  /** the concrete features the plan includes */
  features: readonly string[];
  /** the payment link href — empty until the owner configures billing */
  href: string;
};

/** the pricing table of the /pricing page, in display order. */
export const PLANS: readonly checkoutplan[] = [
  {
    id: "free",
    name: "Free",
    priceusd: 0,
    per: "month",
    blurb: "every app's core surface, for as long as the family is up.",
    features: [
      "the core surface of all ten applications",
      "no ads inside the apps, ever",
      "community support through the public issue tracker",
    ],
    href: "",
  },
  {
    id: "pro",
    name: "Pro",
    priceusd: 5,
    per: "month",
    blurb: "one app, the pro features unlocked, billed per application.",
    features: [
      "the pro features of one chosen application",
      "priority routes on the shared gateway",
      "early access to that app's new surfaces",
    ],
    href: "",
  },
  {
    id: "studio",
    name: "Studio",
    priceusd: 19,
    per: "month",
    blurb: "the whole family at once, for people who live in the tools.",
    features: [
      "the pro features of every application in the family",
      "early access across the family",
      "a direct line to the maintainer for feature requests",
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
