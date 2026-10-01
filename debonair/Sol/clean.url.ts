// the debonair unit of the family.
// # clean.url — the clean URL bar of the family, typed for the SPA
// Hash routes become paths, index.html and duplicate slashes disappear, campaign
// trackers are stripped with replaceState (no reload, no history pollution) and the
// canonical link stays in sync. Navigation itself is handled by wouter Link, so no
// click interception and no reload binding live here.

const HASH_ROUTE = /^#\/?/;
const BASENAME = /(^|\/)index\.html?$/;
const TRACKERS: readonly RegExp[] = [
  /^(utm_|gclid|fbclid|msclkid|dclid|mc_|ref_?src$)/i,
  /^igshid$/i,
  /^yclid$/i,
  /^twclid$/i,
  /^_tt/i,
  /^srsltid$/i,
];

function isTracker(key: string): boolean {
  return TRACKERS.some((pattern) => pattern.test(key));
}

/** Builds the clean form of a url of this site; foreign origins come back untouched. */
export function cleanUrl(input: string, origin: string = window.location.origin): string {
  let url: URL;
  try {
    url = new URL(input, origin);
  } catch {
    return input;
  }
  if (url.origin !== origin) return input;

  let out = url;

  // 1) a route in the hash becomes a real path: /#/settings -> /settings
  if (HASH_ROUTE.test(out.hash)) {
    const path = out.hash.replace(HASH_ROUTE, "/");
    out = new URL(path + out.search, origin);
  } else if (out.hash) {
    out = new URL(out.pathname + out.search, origin);
  }

  // 2) index.html and duplicated slashes disappear
  out.pathname = out.pathname.replace(BASENAME, "/").replace(/\/{2,}/g, "/");

  // 3) campaign trackers leave the url
  let hadTrackers = false;
  Array.from(out.searchParams.keys()).forEach((key) => {
    if (isTracker(key)) {
      out.searchParams.delete(key);
      hadTrackers = true;
    }
  });
  if (hadTrackers) out.search = out.searchParams.toString();

  return out.toString();
}

/** Normalizes the current address without reloading or polluting the history. */
export function applyNow(): boolean {
  const cleaned = cleanUrl(window.location.href);
  if (cleaned === window.location.href) return false;
  window.history.replaceState(window.history.state, "", cleaned);
  return true;
}

/** Keeps <link rel=canonical> and og:url in sync with the clean url (SEO, sharing). */
export function syncCanonical(): void {
  const canonical = document.querySelector('link[rel="canonical"]');
  canonical?.setAttribute("href", window.location.origin + window.location.pathname);
  const og = document.querySelector('meta[property="og:url"]');
  og?.setAttribute("content", window.location.origin + window.location.pathname);
}
