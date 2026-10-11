/**
 * posts.ts — the seed blog of the family site, pure data at the app root.
 * The blog index (/blog) renders the sorted index and the full bodies of
 * these posts: real, written content about how the family is built, so the
 * site is useful on its own merits — the ad networks approve content, not
 * containers. New posts are appended here; the index sorts by date, so the
 * array order below never matters.
 */

/** one blog post: the stable slug, the honest metadata and the full body. */
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

/** the seed posts of the family site. */
export const POSTS: readonly blogpost[] = [
  {
    slug: "ten-sites-one-engine",
    title: "Ten sites, one engine: how the family ships on US$15 a month",
    date: "2026-10-06",
    tags: ["hosting", "static-sites"],
    excerpt:
      "The whole family fits the static hosting free tiers — the only fixed cost is the domains. How ten deployable sites stay on a US$15 a month floor.",
    body: [
      "Every application in the DevThink family builds down to the same shape: one html file, one stylesheet and a handful of hashed bundles at the app root. There is no server to keep warm, no container to babysit and no database bill attached to the public surface. The whole family fits the free tiers of the usual static hosts, so the only fixed cost of the operation is the domains — about US$15 a month.",
      "That number is the budget the family was designed against. The applications share one engine: the sandbox runner and the storage layer live as library-grade modules and get assembled per deploy, so a fix made once lands on every site that imports it. Nothing is provisioned per site beyond the deploy itself. A new application is a folder in the monorepo with the same skeleton as its siblings — config files at the root, the theme in Sol/, pure logic modules beside them and tests in the tests folder.",
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
      "Every site in the family carries the same skeleton. A page is a folder directly under Sol/, named after the page, with an anchor file of the same name inside it. Components sit loose beside the anchor, infrastructure lives in a single shell folder and the whole theme styles from one stylesheet. There are no deeper folders. The rule sounds rigid until you maintain ten sites with it — then it is the only reason they stay consistent.",
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

/**
 * Builds the blog index: the posts sorted by date, newest first. The ISO
 * date sort is lexicographic and stable, so the index order never depends
 * on the array order in this file.
 *
 * @returns the posts of the blog, newest first.
 */
export function postindex(): readonly blogpost[] {
  return [...POSTS].sort((a, b) => {
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
