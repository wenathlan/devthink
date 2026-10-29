/**
 * roster.ts — the family directory data of the /apps page, loose beside its
 * anchor. Every deploy unit beside the cobaia, with the one accent each
 * carries (the spec §12 table, mirrored from the argan contract; the
 * devthink OS rides the family sun) and the honest role each app declares in
 * its own devthink.toml — condensed to one line, nothing embellished. Pure
 * data, no imports: the page and the tests read the same table, so the
 * directory can never drift from the family.
 */

/** one member of the directory: the deploy segment, the accent, the role. */
export type familymember = {
  /** the deploy unit segment (the app folder name beside this site) */
  slug: string;
  /** the one accent the member carries (the spec §12 table) */
  accent: string;
  /** the honest one-line role of the member */
  role: string;
};

/** the directory roster, rail order: the OS first, then the applications. */
export const ROSTER: readonly familymember[] = [
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
