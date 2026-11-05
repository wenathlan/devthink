/**
 * adsconfig.ts — the honest ad slot registry of the family site, pure data
 * at the app root. The family site carries ONE reserved ad container per
 * content page (home, the app directory, the blog index), always at the end
 * of the content, always labeled "advertisement", always a fixed aspect
 * ratio so the page never shifts when a real unit arrives.
 *
 * THE SCRIPT RULE: no ad network script lives in this repository. The
 * AdSense (or equivalent) loader is injected AFTER the network approves the
 * site, through the deploy environment only. Until then the slot ids stay
 * empty and the container renders the honest empty note. No network call,
 * no click encouragement, no automated traffic ever touches an ad surface —
 * invalid traffic is the one thing that kills both the ad account and the
 * domain reputation, so the family does not do it.
 */

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
