/**
 * saascontent.ts — the release rows of the SaaS landing (root data layer).
 * PR8 P1 restored the nine narrative sections of the reference landing: the
 * chrome copy, the rail stops, the fan deck, the cadria rail, the debonair
 * rail, the explorer reels, the creator profiles and the section copy all
 * ride this file as pure data — the exact product copy of the reference —
 * while the hero statement keeps riding the ui store rows (the intro.hero.*
 * rows of uistore.ts). The reference photography died with the owner image
 * ban: every deck art token is a css treatment (gradients and radial
 * glows), so no external url ever answers the face. Pure data — no fetch,
 * no state, no timestamps — so a rerun renders the same landing byte for
 * byte.
 */

/** One nav row of the header tabs and the left rail stops. */
export type saasnavrow = { id: string; label: string };

/** The header chrome copy: the wordmark title, the alerts pill, the
 * sign-in key and the launch key — the reference grammar restored. */
export const saaschrome = {
  title: "DevThink",
  alerts: "Alerts",
  signin: "Sign In",
  launch: "Launch",
};

/** The five tabs of the header saddle bridge, one section each (the exact
 * reference labels and order). */
export const saasheadertabs: readonly saasnavrow[] = [
  { id: "hero-os", label: "OS" },
  { id: "workspace-subapps", label: "Explorer" },
  { id: "creators-doo", label: "Creators" },
  { id: "spatial-bento", label: "Cadria" },
  { id: "sonic-deck", label: "Debonair" },
];

/** The six stops of the left rail saddle — the six mandate stops of the
 * reference rail in its exact order and labels (the saddle cloud key stays
 * retired by the owner order: no seventh key ever answers the rail). */
export const saasrailstops: readonly saasnavrow[] = [
  { id: "hero-os", label: "DevThink OS" },
  { id: "creators-doo", label: "Doo & Creators" },
  { id: "workspace-subapps", label: "Explorer" },
  { id: "spatial-bento", label: "Cadria" },
  { id: "sonic-deck", label: "Debonair" },
  { id: "advisor-dark", label: "Doo Chat" },
];

/* ------------------------------------------------------------------ */
/* section 1 — the hero proof cards (the three scooped floats)         */
/* ------------------------------------------------------------------ */

/** The copy of the three hero proof cards: the rating card, the time card
 * and the neural core card (the exact reference words). */
export const saasherocards = {
  ratingfigure: "4,9",
  ratingline: "The perfect organizer and team builder",
  timetitle: "Use time to your advantage every day",
  timecopy: "Studios agents and streams in sync",
  coretitle: "Neural Shader Core",
  bars: [42, 70, 55, 88, 100, 76, 92, 64] as readonly number[],
};

/* ------------------------------------------------------------------ */
/* section 2 — the creators deck                                       */
/* ------------------------------------------------------------------ */

/** The creators section copy (the exact reference words). */
export const saascreatorsintro = {
  title: "Ready to create",
  accent: "great things?",
  followtitle: "Follow your favorite creators",
};

/** One swing card of the creators deck: the studio tile, the two lines of
 * copy, the tag pill and the surface treatment (the reference classes). */
export type saasswingcard = {
  app: string;
  title: string;
  copy: string;
  tag: string;
  tagclass: string;
  surface: string;
  titleclass: string;
  copyclass: string;
  target: string;
  swing: string;
};

/** The three swing cards under the creators statement. */
export const saasswingcards: readonly saasswingcard[] = [
  {
    app: "cadria",
    title: "Create & Stream",
    copy: "Build 3D scenes and publish directly to Cadria",
    tag: "Cadria",
    tagclass: "text-pink-600",
    surface: "surface-card p-6",
    titleclass: "text-slate-950",
    copyclass: "text-slate-500",
    target: "spatial-bento",
    swing: "swing-card-1",
  },
  {
    app: "getry",
    title: "AI Teams",
    copy: "Cocreate with autonomous agents in sync",
    tag: "Getry & Doo",
    tagclass: "text-white",
    surface: "indigo-tactile-surface text-white p-6",
    titleclass: "text-white",
    copyclass: "text-indigo-100",
    target: "advisor-dark",
    swing: "swing-card-2",
  },
  {
    app: "saddle",
    title: "Saddle Cloud",
    copy: "Run heavy studios and games in your browser",
    tag: "Saddle",
    tagclass: "text-sky-600",
    surface: "surface-card p-6",
    titleclass: "text-slate-950",
    copyclass: "text-slate-500",
    target: "workspace-subapps",
    swing: "swing-card-3",
  },
];

/** One creator profile of the creators deck: the gradient banner, the
 * avatar treatment (the conic rainbow ring rides the ring flag), the studio
 * mark and the three stat tiles. */
export type saascreatorrow = {
  key: string;
  name: string;
  role: string;
  logo: string;
  ring: boolean;
  banner: string;
  avatar: string;
  initial: string;
  stats: readonly (readonly [string, string])[];
};

/** The two creator profiles (the exact reference names, roles and stats). */
export const saascreators: readonly saascreatorrow[] = [
  {
    key: "alan",
    name: "Alan Neres",
    role: "3D World Creator",
    logo: "cadria",
    ring: false,
    banner: "from-sky-200 via-indigo-100 to-pink-100",
    avatar: "from-sky-400 to-indigo-600",
    initial: "A",
    stats: [
      ["2,1K", "Likes"],
      ["3", "Posts"],
      ["18,6K", "Views"],
    ],
  },
  {
    key: "nato",
    name: "Nato",
    role: "Spatial Audio Director",
    logo: "debonair",
    ring: true,
    banner: "from-indigo-200 via-purple-100 to-sky-100",
    avatar: "from-indigo-400 to-purple-600",
    initial: "N",
    stats: [
      ["2,4K", "Likes"],
      ["3", "Posts"],
      ["22,1K", "Views"],
    ],
  },
];

/* ------------------------------------------------------------------ */
/* section 3 — the workspace fan deck                                  */
/* ------------------------------------------------------------------ */

/** The workspace section copy (the exact reference words). */
export const saasworkspace = {
  bridge: "Native Studios Built for Every Creator",
  titlea: "Native Studios",
  titleb: "Built for Every Creator",
  openkey: "Open",
  studiokey: "Studio",
};

/** One app of the workspace fan deck: the tile mark id, the two lines of
 * copy, the clay gradient, the ambient halo color, the badge and the
 * section the card walks to (the reference values). */
export type saasfanapp = {
  id: string;
  name: string;
  subtitle: string;
  rating: string;
  gradient: string;
  glow: string;
  badge: string;
  target: string;
};

/** The five apps of the fan deck, in the exact reference order. */
export const saasfandeck: readonly saasfanapp[] = [
  {
    id: "getry",
    name: "Getry",
    subtitle: "Multi Agent Gateway",
    rating: "4,9",
    gradient: "from-[#C4B5FD] via-[#8B5CF6] to-[#22D3EE]",
    glow: "#8B5CF6",
    badge: "35 AI Routes",
    target: "advisor-dark",
  },
  {
    id: "debonair",
    name: "Debonair",
    subtitle: "Music & AI Vocal DAW",
    rating: "4,8",
    gradient: "from-[#FDA4AF] via-[#FB7185] to-[#FB9236]",
    glow: "#FB7185",
    badge: "Kathesis DSP",
    target: "sonic-deck",
  },
  {
    id: "cadria",
    name: "Cadria",
    subtitle: "Cinema & 3D World Engine",
    rating: "4,9",
    gradient: "from-[#7DD3FC] via-[#38BDF8] to-[#0284C7]",
    glow: "#38BDF8",
    badge: "VersaWaze 3D",
    target: "spatial-bento",
  },
  {
    id: "saddle",
    name: "Saddle",
    subtitle: "Instant Cloud Runner",
    rating: "4,9",
    gradient: "from-[#6EE7B7] via-[#34D399] to-[#0EA5E9]",
    glow: "#10B981",
    badge: "Zero Local GPU",
    target: "workspace-subapps",
  },
  {
    id: "vault",
    name: "Vault",
    subtitle: "Edge Cloud Sync",
    rating: "4,7",
    gradient: "from-[#FDE68A] via-[#FBBF24] to-[#FB9236]",
    glow: "#3B82F6",
    badge: "Instant Sync",
    target: "editorial-bio",
  },
];

/* ------------------------------------------------------------------ */
/* section 4 — the ribbon and the studio flow                          */
/* ------------------------------------------------------------------ */

/** The studio flow section copy (the exact reference words). */
export const saasflow = {
  badge: "Keep exploring",
  title: "Every studio flows into Cadria",
  copy: "One scroll from Native Studios into cinema 3D worlds and live TV",
  key: "Enter Cadria",
};

/* ------------------------------------------------------------------ */
/* section 5 — the cadria bento                                        */
/* ------------------------------------------------------------------ */

/** The cadria section copy (the exact reference words): the category tabs,
 * the hero original, the top 10 rail and the live tv banner. */
export const saascadria = {
  brand: "CADRIA",
  original: "Cadria Original",
  tabs: [
    { id: "trending", label: "Trending" },
    { id: "series", label: "Series" },
    { id: "3d", label: "3D Worlds" },
    { id: "live", label: "Live TV" },
  ] as readonly saasnavrow[],
  hero: { title: "LAST COLONY", ep: "S03E04 The Landing", match: "99% Match" },
  top10: "TOP 10",
  top10title: "Trending films on Cadria",
  hint: "Click to preview",
  play: "Play",
  live: {
    badge: "LIVE",
    title: "TV Queenstown Speed Festival",
    copy: "LAP 27 of 39 with 38 watching now",
    key: "Watch live",
  },
};

/** One cadria rail item: the rank, the two lines of meta, the match line
 * and the css art treatment that answers the banned reference photo. */
export type saascadriaitem = {
  rank: string;
  title: string;
  tag: string;
  match: string;
  duration: string;
  art: string;
  category: string;
};

/** The top 10 rail of cadria (the exact reference catalog). */
export const saascadriarail: readonly saascadriaitem[] = [
  {
    rank: "01",
    title: "Cyberia 2099",
    tag: "3D FILM",
    match: "99% Match",
    duration: "1h 48m",
    art: "radial-gradient(circle at 70% 20%, rgba(139,92,246,0.55), transparent 55%), linear-gradient(150deg, #0F172A 0%, #312E81 70%, #6D28D9 100%)",
    category: "3d",
  },
  {
    rank: "02",
    title: "Orbital Drift",
    tag: "SERIES",
    match: "98% Match",
    duration: "S02E01",
    art: "radial-gradient(circle at 30% 75%, rgba(56,189,248,0.5), transparent 55%), linear-gradient(200deg, #020617 0%, #0E7490 85%)",
    category: "series",
  },
  {
    rank: "03",
    title: "Apex GT Live",
    tag: "LIVE 4K",
    match: "96% Match",
    duration: "LIVE",
    art: "radial-gradient(circle at 50% 85%, rgba(244,63,94,0.55), transparent 60%), linear-gradient(160deg, #0F172A 0%, #7F1D1D 85%)",
    category: "live",
  },
  {
    rank: "04",
    title: "Solaris Mesh",
    tag: "3D SCENE",
    match: "95% Match",
    duration: "60 FPS",
    art: "radial-gradient(circle at 65% 30%, rgba(251,191,36,0.5), transparent 55%), linear-gradient(140deg, #111827 0%, #92400E 90%)",
    category: "3d",
  },
  {
    rank: "05",
    title: "Tidal Dreams",
    tag: "FILM",
    match: "94% Match",
    duration: "2h 04m",
    art: "radial-gradient(circle at 40% 20%, rgba(45,212,191,0.45), transparent 55%), linear-gradient(180deg, #082F49 0%, #155E75 100%)",
    category: "series",
  },
  {
    rank: "06",
    title: "Analog Hearts",
    tag: "AI FILM",
    match: "93% Match",
    duration: "1h 52m",
    art: "radial-gradient(circle at 75% 65%, rgba(244,114,182,0.45), transparent 55%), linear-gradient(150deg, #1F1147 0%, #831843 90%)",
    category: "series",
  },
  {
    rank: "07",
    title: "Neon Parade",
    tag: "LIVE 4K",
    match: "92% Match",
    duration: "LIVE",
    art: "radial-gradient(circle at 25% 80%, rgba(232,121,249,0.55), transparent 55%), linear-gradient(120deg, #0B0D16 0%, #701A75 90%)",
    category: "live",
  },
  {
    rank: "08",
    title: "Static Bloom",
    tag: "3D SCENE",
    match: "91% Match",
    duration: "60 FPS",
    art: "radial-gradient(circle at 60% 40%, rgba(125,211,252,0.4), transparent 55%), repeating-linear-gradient(90deg, #0F172A 0px, #0F172A 8px, #1E293B 9px, #0F172A 18px)",
    category: "3d",
  },
];

/** The hero art of the cadria original (the css treatment of the banned
 * reference photo). */
export const saascadriaheroart =
  "radial-gradient(circle at 30% 25%, rgba(56,189,248,0.4), transparent 55%), radial-gradient(circle at 75% 80%, rgba(139,92,246,0.35), transparent 50%), linear-gradient(150deg, #090D16 0%, #1E1B4B 60%, #312E81 100%)";

/** The art of the live tv banner. */
export const saascadrialiveart =
  "radial-gradient(circle at 80% 20%, rgba(251,146,60,0.4), transparent 50%), linear-gradient(120deg, #090D16 0%, #431407 90%)";

/* ------------------------------------------------------------------ */
/* section 6 — the explorer wall                                       */
/* ------------------------------------------------------------------ */

/** The explorer interlude copy (the exact reference words): the spinning
 * badge ring, the social proof line, the statement and the coral key. */
export const saasexplorer = {
  spin: "EXPLORER UNIFIED FEED EXPLORER UNIFIED FEED ",
  badge: "Join over 100,000 human and AI creators",
  title: "Publish Once, Stream Across Every Studio",
  copy: "Every 3D scene film cut and AI stem goes live in the unified DevThink Explorer",
  key: "Explore Creations",
};

/** One panoramic reel of the explorer wall. */
export type saasreelrow = { title: string; creator: string; tag: string; art: string };

/** The seven reels of the explorer wall (the exact reference catalog). */
export const saasreels: readonly saasreelrow[] = [
  {
    title: "Neon Ramen 3D",
    creator: "@alan Cadria",
    tag: "3D Mesh",
    art: "radial-gradient(circle at 70% 25%, rgba(129,140,248,0.6), transparent 55%), linear-gradient(140deg, #1E1B4B, #4338CA)",
  },
  {
    title: "Afro Synth Live",
    creator: "@nato Debonair",
    tag: "AI Stem",
    art: "radial-gradient(circle at 30% 75%, rgba(251,146,60,0.6), transparent 55%), linear-gradient(140deg, #431407, #EA580C)",
  },
  {
    title: "Cliffside Coast",
    creator: "@marco Cadria",
    tag: "4K Film",
    art: "radial-gradient(circle at 50% 20%, rgba(125,211,252,0.6), transparent 55%), linear-gradient(180deg, #0EA5E9, #155E75)",
  },
  {
    title: "Orbital Odyssey",
    creator: "@doo_agent Saddle",
    tag: "Cloud Game",
    art: "radial-gradient(circle at 65% 35%, rgba(99,102,241,0.6), transparent 55%), linear-gradient(140deg, #020617, #3730A3)",
  },
  {
    title: "Citrus Macro Lab",
    creator: "@chloe Cadria",
    tag: "Shader",
    art: "radial-gradient(circle at 35% 30%, rgba(254,240,138,0.6), transparent 55%), linear-gradient(140deg, #365314, #CA8A04)",
  },
  {
    title: "Velvet Echoes",
    creator: "@sade_ai Debonair",
    tag: "24 Bit",
    art: "radial-gradient(circle at 60% 70%, rgba(192,132,252,0.6), transparent 55%), linear-gradient(140deg, #3B0764, #9333EA)",
  },
  {
    title: "Night Rider GT",
    creator: "@saiko Saddle",
    tag: "60 FPS",
    art: "radial-gradient(circle at 25% 70%, rgba(239,68,68,0.6), transparent 55%), linear-gradient(140deg, #0C0A09, #B91C1C)",
  },
];

/* ------------------------------------------------------------------ */
/* section 7 — the debonair sonic deck                                 */
/* ------------------------------------------------------------------ */

/** The debonair section copy (the exact reference words). */
export const saasdebonair = {
  bridge: "Debonair Studio",
  brand: "DEBONAIR",
  sub: "Lossless AI DAW",
  clock: "12:35 25°C",
  editorial: "Editorial",
  herotitlea: "LOVE",
  herotitleb: "2K26",
  herocopy: "Handpicked masters spatial remixes and AI stems from the community",
  play: "Play",
  openkey: "Open Kathesis DAW",
  railtitle: "Trending tracks on Debonair",
};

/** One track of the debonair rail: the cover art treatment, the totals and
 * the player index (null for the editorial extras the rail carries). */
export type saastrackrow = { title: string; artist: string; total: string; art: string; index: number | null };

/** The debonair rail: the four playable tracks of the reference deck plus
 * the two editorial extras. */
export const saasdebonairrail: readonly saastrackrow[] = [
  {
    title: "One For The Road",
    artist: "Arctic Monkeys",
    total: "3:27",
    art: "radial-gradient(circle at 30% 30%, rgba(148,163,184,0.4), transparent 50%), linear-gradient(135deg, #1E293B, #0F172A)",
    index: 0,
  },
  {
    title: "Get Lucky",
    artist: "Daft Punk, Pharrell Williams",
    total: "6:10",
    art: "radial-gradient(circle at 70% 25%, rgba(254,240,138,0.5), transparent 55%), linear-gradient(135deg, #78350F, #F59E0B)",
    index: 1,
  },
  {
    title: "No Ordinary Love",
    artist: "Sade",
    total: "7:21",
    art: "radial-gradient(circle at 30% 70%, rgba(244,114,182,0.45), transparent 55%), linear-gradient(135deg, #4C0519, #BE185D)",
    index: 2,
  },
  {
    title: "Dracula",
    artist: "Tame Impala",
    total: "3:26",
    art: "radial-gradient(circle at 60% 30%, rgba(167,139,250,0.45), transparent 55%), linear-gradient(135deg, #1E1B4B, #4C1D95)",
    index: 3,
  },
  {
    title: "Velvet Echoes",
    artist: "Sade AI Remaster",
    total: "5:30",
    art: "radial-gradient(circle at 40% 60%, rgba(192,132,252,0.45), transparent 55%), linear-gradient(135deg, #2E1065, #7E22CE)",
    index: null,
  },
  {
    title: "Midnight Console",
    artist: "Live DAW Session",
    total: "6:02",
    art: "radial-gradient(circle at 65% 35%, rgba(56,189,248,0.4), transparent 55%), linear-gradient(135deg, #082F49, #0369A1)",
    index: null,
  },
];

/** The hero art of the debonair editorial. */
export const saasdebonairheroart =
  "radial-gradient(circle at 25% 30%, rgba(244,63,94,0.5), transparent 55%), radial-gradient(circle at 80% 80%, rgba(129,26,91,0.5), transparent 55%), linear-gradient(140deg, #090D16 0%, #4C0519 70%, #831843 100%)";

/* ------------------------------------------------------------------ */
/* section 8 — the doo advisor                                         */
/* ------------------------------------------------------------------ */

/** The advisor section copy (the exact reference words): the badge, the
 * statement, the two keys, the three stat tiles and the demo chat. */
export const saasadvisor = {
  bridge: "Doo Native AI",
  badge: "Doo Native AI",
  titlea: "Your personal",
  titleb: "AI advisor",
  copy: "Ask anything and Doo drafts designs and ships with you inside every studio",
  keyprimary: "Draft my portfolio",
  keysecondary: "Explore studios",
  stats: [
    ["35", "Studios"],
    ["60", "FPS Cloud"],
    ["24", "Bit Audio"],
  ] as readonly (readonly [string, string])[],
  chat: {
    name: "Doo",
    status: "Online Replies instantly",
    question: "Can you review my interface and make it feel premium?",
    reply: "Yes I have 3+ years of experience on UI/UX",
    placeholder: "Ask Doo anything",
  },
};

/** One footer link row: an internal target scrolls the landing to its
 * section, a route walks the entry chain to that page, a plain row stays
 * the reference span. */
export type saasfooterlink = { label: string; target?: string; route?: string };

/** The footer copy: the tagline, the four reference link columns and the
 * base row. */
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
        { label: "Creators", target: "creators-doo" },
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
    {
      title: "Company",
      links: [{ label: "Manifesto" }, { label: "Careers" }, { label: "Press" }] satisfies readonly saasfooterlink[],
    },
  ] as readonly {
    title: string;
    links: readonly saasfooterlink[];
  }[],
  base: "© 2026 DevThink on devthink.pro",
};
