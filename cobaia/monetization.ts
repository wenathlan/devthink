// # monetization.ts — the one keyword file of the monetization domain: the
// consolidation law of the root (PR3 of the uploaded rules — one keyword
// file per domain, "unifique num único módulo as lógicas variantes +
// correlacionadas que hoje encontram-se espalhadas") merged the four
// monetization doors of the cobaia site into this seat — the honest ad slot
// registry (the former adsconfig.ts body below), the typed billing accessor
// (checkoutlinks.ts), the seed blog accessor (posts.ts) and the family
// directory accessor (roster.ts) — every export preserved verbatim, zero
// logic changes, zero behavior changes. The consolidation notes: the doors
// shared no duplicated helper (each rode its own thin accessors over the
// content lane), so the one import the four sources repeated — the
// content.ts door of the uistore chain — rides once at the top; and no two
// sources double-declared a const or a decl under one name, so every export
// keeps the exact name the importers always read (the wingets index
// re-exports the roster pair by name so its surface stays identical). The
// four source files are deleted; every importer reads this one seat.

import {
  type blogpost,
  type checkoutplan,
  contenttable,
  contentvalue,
  type familymember,
  seedPlans,
  seedPosts,
  seedRoster,
  seedSupportLinks,
  type supportlinks as supportlinkstable,
} from "./content.ts";

/* the supportlinks type stays owned by content.ts (its original seat) — the
   accessor function below owns the monetization surface name alone, so the
   type alias re-export that collided with the function export retires. */
export type { blogpost, checkoutplan, familymember, supportlinkstable };

/* ════════════════════════════════════════════════════════════════════ */
/* SECTION: adsconfig.ts — the honest ad slot registry (the ad seat).   */
/* ════════════════════════════════════════════════════════════════════ */

// # adsconfig.ts — the honest ad slot registry of the family site, pure data
// at the app root. The family site carries ONE reserved ad container per
// content page (home, the app directory, the blog index), always at the end
// of the content, always labeled "advertisement", always a fixed aspect
// ratio so the page never shifts when a real unit arrives.
//
// THE SCRIPT RULE: no ad network script lives in this repository. The
// AdSense (or equivalent) loader is injected AFTER the network approves the
// site, through the deploy environment only. Until then the slot ids stay
// empty and the container renders the honest empty note. No network call,
// no click encouragement, no automated traffic ever touches an ad surface —
// invalid traffic is the one thing that kills both the ad account and the
// domain reputation, so the family does not do it.

/** one reserved ad slot: the config id and the reserved shape. */
export type adsslot = {
  /** the ad network slot id — empty until the owner configures it after approval */
  slotid: string;
  /** the display format the reserved box mimics */
  format: string;
  /** the css aspect-ratio value the container reserves (never shifts layout) */
  ratio: string;
};

/** the fixed label every ad container renders, visible and honest. */
export const ADS_LABEL = "advertisement";

/** the honest note the container renders while no slot id is configured. */
export const ADS_EMPTY = "ad slot not configured yet";

/** the reserved slots per content page, keyed by the page folder name. */
export const ADSSLOTS: Readonly<Record<string, adsslot>> = {
  home: { slotid: "", format: "display", ratio: "728 / 90" },
  apps: { slotid: "", format: "in-feed", ratio: "3 / 1" },
  blog: { slotid: "", format: "in-article", ratio: "3 / 1" },
};

/**
 * Reads the reserved slot of one content page.
 *
 * @param page the page folder name (home, apps, blog).
 * @returns the slot, or undefined when the page carries no slot.
 */
export function adsslotfor(page: string): adsslot | undefined {
  return ADSSLOTS[page];
}

/**
 * Answers whether a slot is configured with a real network id. An empty
 * (or whitespace) slot id means the container stays an honest placeholder.
 *
 * @param slot the reserved slot entry.
 * @returns true only when the slot id carries a value.
 */
export function adsslotlive(slot: adsslot | undefined): boolean {
  return slot !== undefined && slot.slotid.trim().length > 0;
}

/* ════════════════════════════════════════════════════════════════════ */
/* SECTION: checkoutlinks.ts — the typed billing accessor (the plans     */
/* seat).                                                                */
/* ════════════════════════════════════════════════════════════════════ */

// # checkoutlinks.ts — the typed accessor of the billing configuration of
// the family site: the thin door the pricing page, the support page and
// the intro plans zone import, answering the plan table and the support
// channels of the content lane (content.ts — the manifest; db.ts — the
// content_rows table; the platform gateway — GET /api/v1/ui/content). The
// data never lives here anymore: checkoutlinks() and supportlinks() answer
// the live rows the platform served, the manifest seed otherwise (the
// uistore chain). The payment links themselves are configuration, never
// code: the owner pins the checkout hrefs (Stripe Payment Links or Paddle
// overlays) into the store once billing goes live. Until then every href
// ships empty and the interface renders the honest empty state — "checkout
// not configured yet" — instead of pretending.
//
// The words never ride here: every plan sentence (name, billing period,
// blurb, features) answers from the label store (labels.ts — the manifest
// the seed carries into the site database), so the pricing cards and the
// intro plans zone read their prose through the typed accessor and this
// lane keeps only the billing values — ids, prices and links.
//
// No network call ever happens here: the links are plain hrefs the visitor
// chooses to follow, no key is committed (not even a placeholder that looks
// real) and no script is loaded. The prices are placeholders (US$0 / 5 / 19
// per month) until the billing platform decision lands.

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

/* ════════════════════════════════════════════════════════════════════ */
/* SECTION: posts.ts — the seed blog accessor (the blog seat).          */
/* ════════════════════════════════════════════════════════════════════ */

// # posts.ts — the typed accessor of the seed blog: the thin door the blog
// page and the tests import, answering the posts of the content lane
// (content.ts — the manifest; db.ts — the content_rows table; the platform
// gateway — GET /api/v1/ui/content). The data never lives here anymore:
// posts() answers the live rows the platform served, the manifest seed
// otherwise (the uistore chain), the index sort and the honest word count
// stay exactly where they rode, and the blog index (/blog) renders the
// sorted index and the full bodies through this door — real, written
// content about how the family is built, so the site is useful on its own
// merits (the ad networks approve content, not containers). New posts
// append to the manifest; the index sorts by date, so the manifest order
// never matters.

/**
 * The typed accessor of the blog: the live db rows when the platform
 * answered, the manifest seed otherwise.
 *
 * @returns the posts of the blog.
 */
export function posts(): readonly blogpost[] {
  return contenttable("posts", seedPosts);
}

/**
 * Builds the blog index: the posts sorted by date, newest first. The ISO
 * date sort is lexicographic and stable, so the index order never depends
 * on the row order the store answers.
 *
 * @returns the posts of the blog, newest first.
 */
export function postindex(): readonly blogpost[] {
  return [...posts()].sort((a, b) => {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return 0;
  });
}

/**
 * Counts the words of one post's body — the honest length measure the tests
 * and the page footer can both read.
 *
 * @param post the post to measure.
 * @returns the total word count across the body paragraphs.
 */
export function postwords(post: blogpost): number {
  return post.body.join(" ").split(/\s+/).filter(Boolean).length;
}

/* ════════════════════════════════════════════════════════════════════ */
/* SECTION: roster.ts — the family directory accessor (the directory    */
/* seat).                                                                */
/* ════════════════════════════════════════════════════════════════════ */

// # roster.ts — the typed accessor of the family directory data: the thin
// door the /apps page, the shell footer, the home preview and the intro
// footer import, answering the roster of the content lane (content.ts —
// the manifest; db.ts — the content_rows table; the platform gateway — GET
// /api/v1/ui/content). The data never lives here anymore: roster() answers
// the live rows the platform served, the manifest seed otherwise (the
// uistore chain). Every deploy unit beside the cobaia, with the one accent
// each carries (the spec §12 table, mirrored from the argan contract; the
// devthink OS rides the family sun) and the honest role each app declares
// in its own devthink.toml — condensed to one line, nothing embellished:
// the page and the tests read the same table through this door, so the
// directory can never drift from the family.

/**
 * The typed accessor of the directory: the live db rows when the platform
 * answered, the manifest seed otherwise — rail order, the OS first, then
 * the applications.
 *
 * @returns the directory roster.
 */
export function roster(): readonly familymember[] {
  return contenttable("roster", seedRoster);
}
