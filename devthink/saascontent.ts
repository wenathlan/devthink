/**
 * saascontent.ts — the release rows of the SaaS landing (root data layer).
 * The intro face renders only what is real: the header chrome, the six rail
 * stops, the real studios of the monorepo and the footer map. The owner
 * order retired the mock decks — the invented film catalog, the licensed
 * track rail, the reel wall with its made-up stats, the demo chat and the
 * social proof — so the landing presents the studios that actually ship
 * and the words ride the ui store (the intro.* rows of uistore.ts) while
 * this file carries the structure. Pure data — no fetch, no state, no
 * timestamps — so a rerun renders the same landing byte for byte.
 */

/** One nav row of the header tabs and the left rail stops. */
export type saasnavrow = { id: string; label: string };

/** The header chrome copy: the wordmark title, the sign-in key and the
 * launch key (the alerts pill, the rail cloud key and the dock rows died
 * with the decorative toasts — the chrome answers three keys only). */
export const saaschrome = {
  title: "DevThink",
  signin: "Sign In",
  launch: "Launch",
};

/** The five tabs of the header saddle bridge, one section each. */
export const saasheadertabs: readonly saasnavrow[] = [
  { id: "hero-os", label: "OS" },
  { id: "workspace-subapps", label: "Studios" },
  { id: "creators-doo", label: "Doo" },
  { id: "spatial-bento", label: "Cadria" },
  { id: "sonic-deck", label: "Debonair" },
];

/** The six stops of the left rail saddle, one section each — the six keys
 * of the landing body the owner ordered (every other key of the old face
 * died with the mock decks). */
export const saasrailstops: readonly saasnavrow[] = [
  { id: "hero-os", label: "DevThink OS" },
  { id: "workspace-subapps", label: "Studios" },
  { id: "creators-doo", label: "Doo" },
  { id: "spatial-bento", label: "Cadria" },
  { id: "sonic-deck", label: "Debonair" },
  { id: "advisor-dark", label: "Getry" },
];

/** The real studios of the monorepo the family grid presents — the six
 * deploy units that ship beside the os, in family order. The id addresses
 * the ui store rows (intro.studios.<id>.name and .copy) and the fluent
 * glyph map of the sections winget. */
export const saasstudiofamily: readonly string[] = ["cadria", "debonair", "getry", "saddle", "vault", "doo"];

/** The studio spotlights: each landing stop deep-dives one real studio of
 * the family grid — the minimal section the owner ordered (title, one
 * line, the glyph). */
export const saasspotlights: readonly { id: string; studio: string }[] = [
  { id: "creators-doo", studio: "doo" },
  { id: "spatial-bento", studio: "cadria" },
  { id: "sonic-deck", studio: "debonair" },
  { id: "advisor-dark", studio: "getry" },
];

/** One footer link row: an internal target scrolls the landing to its
 * section, a route walks the entry chain to that page. */
export type saasfooterlink = { label: string; target?: string; route?: string };

/** The footer copy: the tagline, the link columns and the base row (the
 * destination-less Company column died with the owner order — every row
 * answers a real target). */
export const saasfooter = {
  tagline: "The thinking OS for creating sharing and running creative studios and AI teams instantly",
  launch: "Launch",
  columns: [
    {
      title: "Platform",
      links: [
        { label: "Overview", target: "hero-os" },
        { label: "Explorer", route: "/explore" },
        { label: "Studios", target: "workspace-subapps" },
        { label: "Doo", target: "creators-doo" },
      ] satisfies readonly saasfooterlink[],
    },
    {
      title: "Studios",
      links: [
        { label: "Cadria", target: "spatial-bento" },
        { label: "Debonair", target: "sonic-deck" },
        { label: "Saddle", target: "workspace-subapps" },
      ] satisfies readonly saasfooterlink[],
    },
    {
      title: "AI",
      links: [
        { label: "Doo", target: "creators-doo" },
        { label: "Getry", target: "advisor-dark" },
        { label: "Vault", target: "workspace-subapps" },
      ] satisfies readonly saasfooterlink[],
    },
  ] as readonly {
    title: string;
    links: readonly saasfooterlink[];
  }[],
  base: "© 2026 DevThink on devthink.pro",
};
