/**
 * checkoutlinks.ts — the typed accessor of the billing configuration of
 * the family site: the thin door the pricing page, the support page and
 * the intro plans zone import, answering the plan table and the support
 * channels of the content lane (content.ts — the manifest; db.ts — the
 * content_rows table; the platform gateway — GET /api/v1/ui/content). The
 * data never lives here anymore: checkoutlinks() and supportlinks() answer
 * the live rows the platform served, the manifest seed otherwise (the
 * uistore chain). The payment links themselves are configuration, never
 * code: the owner pins the checkout hrefs (Stripe Payment Links or Paddle
 * overlays) into the store once billing goes live. Until then every href
 * ships empty and the interface renders the honest empty state — "checkout
 * not configured yet" — instead of pretending.
 *
 * The words never ride here: every plan sentence (name, billing period,
 * blurb, features) answers from the label store (labels.ts — the manifest
 * the seed carries into the site database), so the pricing cards and the
 * intro plans zone read their prose through the typed accessor and this
 * lane keeps only the billing values — ids, prices and links.
 *
 * No network call ever happens here: the links are plain hrefs the visitor
 * chooses to follow, no key is committed (not even a placeholder that looks
 * real) and no script is loaded. The prices are placeholders (US$0 / 5 / 19
 * per month) until the billing platform decision lands.
 */

import {
  type checkoutplan,
  contenttable,
  contentvalue,
  seedPlans,
  seedSupportLinks,
  type supportlinks as supportlinkstable,
} from "./content.ts";

export type { checkoutplan, supportlinkstable as supportlinks };

/**
 * The typed accessor of the pricing table: the live db rows when the
 * platform answered, the manifest seed otherwise — in display order (the
 * prose answers from the label store; only the billing values ride this
 * lane).
 *
 * @returns the plans of the /pricing page.
 */
export function checkoutlinks(): readonly checkoutplan[] {
  return contenttable("plans", seedPlans);
}

/**
 * The typed accessor of the support channels: the live db row when the
 * platform answered, the manifest seed otherwise — the same rule as the
 * plans: hrefs stay empty until the owner configures them.
 *
 * @returns the support channels of the /support page.
 */
export function supportlinks(): Readonly<supportlinkstable> {
  return contentvalue("supportlinks", seedSupportLinks);
}

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
  return checkoutlinks().find((plan) => plan.id === id);
}
