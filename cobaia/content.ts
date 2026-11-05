/**
 * content.ts — the content law of cobaia: every content row the pages
 * render rides the database — the content_rows table of the site store
 * (db.ts, seeded from this manifest at boot), served by the platform
 * gateway over GET /api/v1/ui/content — and the pages read through the
 * typed accessors (posts.ts, roster.ts, checkoutlinks.ts, adsconfig.ts —
 * the thin doors that keep their module names, so every importer keeps
 * working). The literals live HERE and ONLY HERE as the build seed (the
 * labels.ts twin): the db boot ingests the seed rows into the table, the
 * live rows answer the pages when the platform serves them, and the seed
 * answers the offline static build (the memory-seed law — never browser
 * storage). The typed accessors answer the live rows the platform answered
 * and fall back to the seed, so the interface never blanks where a row
 * belongs and the db stays the single living config of the site content.
 * The wave moved every row verbatim from the data modules it used to ride
 * — zero invented rows, zero dropped rows, zero restated words.
 *
 * the browser never imports db.ts (better-sqlite3 cannot ride the static
 * bundle): the types come across erased, the loader pulls the live rows
 * over the internal api, and the seed always answers when the platform is
 * away.
 *
 * @section 1  seed — the manifest rows the db receives at boot
 * @section 2  client — the live loader, the per-kind door and the mount
 *             hook the pages render through (browser side)
 */

import { useEffect, useState } from "react";
import type { LabelKey } from "./labels.ts";

/* ------------------------------------------------------------------ */
/* @section 1 — seed: the manifest rows the db receives at boot         */
/* ------------------------------------------------------------------ */

/** one blog post: the stable slug, the honest metadata and the full body
 * (moved verbatim from posts.ts — the seed blog of the family site). */
export type blogpost = {
  /** the stable slug of the post */
  slug: string;
  /** the display title (sentence case, no marketing words) */
  title: string;
  /** the publication date as an iso date (yyyy-mm-dd) */
  date: string;
  /** the topic tags of the post */
  tags: readonly string[];
  /** the one or two sentence summary shown in the index */
  excerpt: string;
  /** the full body of the post, one paragraph per string */
  body: readonly string[];
};

/** one member of the directory: the deploy segment, the accent, the role
 * (moved verbatim from roster.ts — the spec §12 table and the honest role
 * each app declares in its own devthink.toml). */
export type familymember = {
  /** the deploy unit segment (the app folder name beside this site) */
  slug: string;
  /** the one accent the member carries (the spec §12 table) */
  accent: string;
  /** the honest one-line role of the member */
  role: string;
};

/** one plan row of the pricing page: the billing values and the label keys
 * of the plan prose (moved verbatim from checkoutlinks.ts — the store
 * answers the words, this row answers the numbers and the link). */
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

/** the support channels of the /support page (moved verbatim from
 * checkoutlinks.ts — the same rule as the plans: hrefs stay empty until
 * the owner configures them). */
export type supportlinks = {
  /** the GitHub Sponsors profile url */
  sponsors: string;
  /** the Ko-fi page url */
  kofi: string;
};

/** one reserved ad slot: the config id and the reserved shape (moved
 * verbatim from adsconfig.ts — the honest ad slot registry of the family
 * site). */
export type adsslot = {
  /** the ad network slot id — empty until the owner configures it after approval */
  slotid: string;
  /** the display format the reserved box mimics */
  format: string;
  /** the css aspect-ratio value the container reserves (never shifts layout) */
  ratio: string;
};

/** the seed posts of the family site — the full bodies, verbatim: real,
 * written content about how the family is built, so the site is useful on
 * its own merits (the ad networks approve content, not containers). */
export const seedPosts: readonly blogpost[] = [
  {
    slug: "ten-sites-one-engine",
    title: "Ten sites, one engine: how the family ships on US$15 a month",
    date: "2026-10-06",
    tags: ["hosting", "static-sites"],
    excerpt:
      "The whole family fits the static hosting free tiers — the only fixed cost is the domains. How ten deployable sites stay on a US$15 a month floor.",
    body: [
      "Every application in the DevThink family builds down to the same shape: one html file, one stylesheet and a handful of hashed bundles at the app root. There is no server to keep warm, no container to babysit and no database bill attached to the public surface. The whole family fits the free tiers of the usual static hosts, so the only fixed cost of the operation is the domains — about US$15 a month.",
      "That number is the budget the family was designed against. The applications share one engine: the sandbox runner and the storage layer live as library-grade modules and get assembled per deploy, so a fix made once lands on every site that imports it. Nothing is provisioned per site beyond the deploy itself. A new application is a folder in the monorepo with the same skeleton as its siblings — config files at the root, the theme in sol/, pure logic modules beside them and tests in the tests folder.",
      "The trade-offs are real. Static sites cannot hold state, so the public surface of every app stores nothing on the visitor machine: no cookies, no accounts, no tracking. The pieces that genuinely need a backend — the AI gateway, the storage clones — run as separate deploy units on their own free tiers, and the sites talk to them over plain https with no credentials embedded anywhere.",
      "The accounting stays honest. US$15 a month is the floor, not the ceiling: a gateway that outgrows its free tier, or a storage clone that needs a persistent disk, moves the number. But the design keeps the moving parts few and every cost on a line item you can read. Ten working tools for the price of two coffees, and the bill never surprises anyone.",
    ],
  },
  {
    slug: "one-css-one-tree",
    title: "One CSS, one tree: the design system behind the family",
    date: "2026-09-29",
    tags: ["design", "front-end"],
    excerpt:
      "A page is a folder, an anchor and one stylesheet. The token set and the flat tree that keep ten sites feeling like one family.",
    body: [
      "Every site in the family carries the same skeleton. A page is a folder directly under sol/, named after the page, with an anchor file of the same name inside it. Components sit loose beside the anchor, infrastructure lives in a single shell folder and the whole theme styles from one stylesheet. There are no deeper folders. The rule sounds rigid until you maintain ten sites with it — then it is the only reason they stay consistent.",
      "The theme runs on a fixed token set tuned against the trylle ruler: a near-black canvas, ink at #fafafa, eight surface steps from #171717 to #484848 and exactly one accent per application. Hairlines are the ink color mixed down to five and ten percent. Shadows are rings — a one-pixel outline plus doubling blur layers — instead of diffuse glows. Motion is capped at 150 milliseconds for micro-interactions on one shared cubic-bezier curve, and only transform and opacity ever animate.",
      "Each application keeps its own signal color: the sandbox engine wears tan, the gateway violet, the game platform coral, the video studio rose. The site you are reading uses the amber sun the whole family shares. One accent per screen, spent on actions and state, never on decoration — the ninety-ten rule. Everything else stays gray on gray: the hierarchy comes from the surface ladder and the typography, not from color.",
      "The constraints do the work. Because every token, radius, easing and spacing step is shared, a component copied between applications lands looking correct. Because the tree is flat, an audit is a directory listing. And because the stylesheet is one file, the entire design system of a site can be reviewed in a single pass. Ten sites feel like one family because, structurally, they are one.",
    ],
  },
  {
    slug: "no-backend-no-tracking",
    title: "Why every family site ships without a backend or tracking",
    date: "2026-09-18",
    tags: ["privacy", "architecture"],
    excerpt:
      "The only thing a visitor machine does is load the interface. The architecture behind static sites that store nothing — and the one honest exception reserved for ads.",
    body: [
      "The public surface of the DevThink family makes a promise that is easy to state and hard to keep: the only thing a visitor machine does is load the interface. No local storage, no cookies, no analytics beacons, no fingerprinting. The sites are static files served from a CDN; once the bundles arrive, nothing is written anywhere and nothing phones home.",
      "This is partly philosophy and partly architecture. The family's tools are sandboxes, studios and gateways — their honest work happens inside the browser tab or in separate, clearly-labeled deploy units. The public sites present those tools; they do not need to know who you are. So they skip the account systems, the session storage and the third-party scripts that most portfolios bolt on by default. The result loads fast, works offline after the first load and leaks nothing.",
      "The one exception the family is preparing for is advertising, and it is built the honest way. The family site runs reserved ad containers: fixed aspect-ratio boxes, visibly labeled as advertisement, placed at the end of content pages where they cannot be mistaken for navigation or buttons. The ad script itself is only added after the network approves the site, and it arrives through the deploy environment — it is never committed into the code. Until then the containers render as empty reserved boxes.",
      "No automated traffic ever touches an ad surface. Clicking your own ads, or running bots against them, is invalid traffic — the one mistake that ends an ad account and a domain reputation at the same time. The family does not do it, full stop. That is the whole contract: real content on every page, honest empty states where a feature is not configured yet, and a visitor machine that stays the visitor's machine.",
    ],
  },
];

/** the directory roster, rail order: the OS first, then the applications —
 * verbatim from roster.ts. */
export const seedRoster: readonly familymember[] = [
  {
    slug: "devthink",
    accent: "#f59e0b",
    role: "the OS: the one interface where the whole family opens as windows.",
  },
  {
    slug: "saddle",
    accent: "#e86f2d",
    role: "the sandbox: runs any sandbox, anywhere, no setup.",
  },
  {
    slug: "forge",
    accent: "#a2cb3a",
    role: "the execution clone: runs any binary in the family sandbox, stores nothing.",
  },
  {
    slug: "foundry",
    accent: "#2fb8b5",
    role: "the complete clone: runs, is the sandbox and keeps the network databases.",
  },
  {
    slug: "vault",
    accent: "#a3d7e6",
    role: "the storage clone: keeps every site database and receives the data backups.",
  },
  {
    slug: "getry",
    accent: "#8b5cf6",
    role: "the AI workspace: five model pools, thirty-five routes, rotating keys.",
  },
  {
    slug: "cadria",
    accent: "#f472b6",
    role: "the video and image studio: player, editor and gallery in one window.",
  },
  {
    slug: "debonair",
    accent: "#d9962e",
    role: "the audio app and DAW: studio, generate and library in one console.",
  },
  {
    slug: "stealthhead",
    accent: "#e8563f",
    role: "the FPS game platform: match, ranking, weapons and world — loads instantly.",
  },
  {
    slug: "argan",
    accent: "#34d8a8",
    role: "the DNS toolkit: zones, records, dnssec and handshake.",
  },
];

/** the pricing table of the /pricing page, in display order — the billing
 * values verbatim from checkoutlinks.ts (the prose answers from the label
 * store; only the billing values ride this lane). */
export const seedPlans: readonly checkoutplan[] = [
  {
    id: "free",
    priceusd: 0,
    nameKey: "pricing.plan.free.name",
    perKey: "pricing.plan.free.per",
    blurbKey: "pricing.plan.free.blurb",
    featureKeys: ["pricing.plan.free.feat.1", "pricing.plan.free.feat.2", "pricing.plan.free.feat.3"],
    href: "",
  },
  {
    id: "pro",
    priceusd: 5,
    nameKey: "pricing.plan.pro.name",
    perKey: "pricing.plan.pro.per",
    blurbKey: "pricing.plan.pro.blurb",
    featureKeys: ["pricing.plan.pro.feat.1", "pricing.plan.pro.feat.2", "pricing.plan.pro.feat.3"],
    href: "",
  },
  {
    id: "studio",
    priceusd: 19,
    nameKey: "pricing.plan.studio.name",
    perKey: "pricing.plan.studio.per",
    blurbKey: "pricing.plan.studio.blurb",
    featureKeys: ["pricing.plan.studio.feat.1", "pricing.plan.studio.feat.2", "pricing.plan.studio.feat.3"],
    href: "",
  },
];

/** the support channels of the /support page — verbatim from
 * checkoutlinks.ts: hrefs stay empty until the owner configures them. */
export const seedSupportLinks: Readonly<supportlinks> = {
  sponsors: "",
  kofi: "",
};

/** the reserved slots per content page, keyed by the page folder name —
 * verbatim from adsconfig.ts. */
export const seedAdsSlots: Readonly<Record<string, adsslot>> = {
  home: { slotid: "", format: "display", ratio: "728 / 90" },
  apps: { slotid: "", format: "in-feed", ratio: "3 / 1" },
  blog: { slotid: "", format: "in-article", ratio: "3 / 1" },
};

/** the fixed label every ad container renders, visible and honest —
 * verbatim from adsconfig.ts. */
export const seedAdsLabel = "advertisement";

/** the honest note the container renders while no slot id is configured —
 * verbatim from adsconfig.ts. */
export const seedAdsEmpty = "ad slot not configured yet";

/** the content kinds of the lane: the db table rows, the api answer and the
 * accessors cite the same names (the catalog naming law the sibling sites
 * ride — one kind per manifest table). */
export const CONTENTKINDS = [
  "posts",
  "roster",
  "plans",
  "supportlinks",
  "ads.slots",
  "ads.label",
  "ads.empty",
] as const;

/** one content kind of the lane. */
export type contentkind = (typeof CONTENTKINDS)[number];

/** one content row as the db holds it and the api answers it: the kind
 * names the table, the ordinal pins the row order inside the kind, and the
 * payload carries the json encoding of the row (the manifest is the source
 * of truth, the store serves the rows). */
export type contentrow = {
  /** the kind the row belongs to */
  kind: contentkind;
  /** the row order inside the kind */
  ordinal: number;
  /** the json encoding of the row */
  payload: string;
};

/* ------------------------------------------------------------------ */
/* @section 2 — client: the loader, the door and the mount hook        */
/* ------------------------------------------------------------------ */

/** the live rows the platform answered, parsed per kind and ordered by
 * ordinal (null until the first load — the offline law: the seed answers
 * first). */
let contentlive: ReadonlyMap<string, readonly unknown[]> | null = null;

/** the abort window of the platform read (ms) — the page never blocks on a
 * slow gateway (the uistore law). */
const READ_TIMEOUT_MS = 4000;

/** Reads the site content api base off the vite env without leaning on the
 * vite client types: the platform gateway serving the site store over
 * HTTPS (the VITE_CATALOG_URL seat the sibling sites ride); empty answers
 * from the seed. */
function readContentBase(): string {
  try {
    const env = (import.meta as ImportMeta & { env?: { VITE_CATALOG_URL?: string } }).env;
    return (typeof env?.VITE_CATALOG_URL === "string" ? env.VITE_CATALOG_URL : "").trim().replace(/\/$/, "");
  } catch {
    return "";
  }
}

/** the configured platform base (empty answers from the seed — the offline
 * static build law). */
const endpoint = readContentBase();

/** the route the content lane rides: the platform gateway serves the site
 * store over /api/v1/ui/content (the uistore route family, cobaia's noun —
 * no server route lives in this app, the same law the onboarding tables
 * ride). */
const CONTENT_PATH = "/api/v1/ui/content";

/**
 * Loads the live content rows from the site store: GET /api/v1/ui/content
 * over the configured base (the platform gateway serving the content_rows
 * table of the cobaia store over HTTPS). The failure keeps the seed
 * answering (the offline build law), and the load happens once per
 * session.
 *
 * @returns void — the live store fills; the seed keeps answering on any
 * failure.
 */
export async function loadcontent(): Promise<void> {
  if (contentlive) return;
  if (!endpoint) return;
  try {
    const res = await fetch(new URL(CONTENT_PATH, endpoint).toString(), {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(READ_TIMEOUT_MS),
    });
    if (!res.ok) return;
    const answer = (await res.json()) as { rows?: contentrow[] };
    if (!Array.isArray(answer.rows)) return;
    const buckets = new Map<string, { ordinal: number; value: unknown }[]>();
    for (const row of answer.rows) {
      if (!row || typeof row.kind !== "string" || typeof row.ordinal !== "number") continue;
      if (typeof row.payload !== "string") continue;
      let value: unknown;
      try {
        value = JSON.parse(row.payload);
      } catch {
        continue;
      }
      const bucket = buckets.get(row.kind);
      if (bucket) bucket.push({ ordinal: row.ordinal, value });
      else buckets.set(row.kind, [{ ordinal: row.ordinal, value }]);
    }
    const rows = new Map<string, readonly unknown[]>();
    for (const [kind, bucket] of buckets) {
      rows.set(
        kind,
        bucket.sort((a, b) => a.ordinal - b.ordinal).map((entry) => entry.value),
      );
    }
    contentlive = rows;
  } catch {
    /* the platform is away: the seed keeps answering */
  }
}

/**
 * Answers one content table of the lane: the live rows the platform
 * answered, the manifest seed otherwise (the uistore chain — live first,
 * seed always). The typed doors the pages import (posts, roster,
 * checkoutlinks, adsconfig) project their typed view through this one
 * seat, so no door ever answers a fixed table of its own.
 *
 * @param kind the content kind (one of CONTENTKINDS).
 * @param seed the manifest seed rows of the kind.
 * @returns the live rows when the platform answered, the seed otherwise.
 */
export function contenttable<T>(kind: contentkind, seed: readonly T[]): readonly T[] {
  const live = contentlive?.get(kind);
  return Array.isArray(live) ? (live as readonly T[]) : seed;
}

/**
 * Answers one singleton content value of the lane: the live row the
 * platform answered, the manifest seed otherwise (the one-row kinds — the
 * support channels record, the ad slot registry, the ad contract strings).
 *
 * @param kind the content kind (one of CONTENTKINDS).
 * @param seed the manifest seed value of the kind.
 * @returns the live value when the platform answered, the seed otherwise.
 */
export function contentvalue<T>(kind: contentkind, seed: T): T {
  const live = contentlive?.get(kind);
  return Array.isArray(live) && live.length > 0 ? (live[0] as T) : seed;
}

/**
 * useContent — the mount hook of the store-riding page: it loads the live
 * rows once per mount and re-renders the face when they land. The seed
 * answers the first paint with the same rows the db serves, so the swap
 * never flashes.
 */
export function useContent(): void {
  const [, bump] = useState(0);
  useEffect(() => {
    let alive = true;
    void loadcontent().then(() => {
      if (alive) bump((n) => n + 1);
    });
    return () => {
      alive = false;
    };
  }, []);
}
