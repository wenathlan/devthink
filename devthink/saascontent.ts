/**
 * saascontent.ts — the release rows of the SaaS landing (root data layer).
 * The intro face renders this copy exactly as the approved reference ships
 * it: the header chrome, the hero statement with the inline mode switch,
 * the creator cards, the studio fan deck, the Cadria top ten, the explorer
 * reels, the Debonair tracks, the Doo demo, the footer and every toast the
 * face speaks. Pure data — no fetch, no state, no timestamps — so a rerun
 * renders the same landing byte for byte.
 */

/** One studio of the fan deck: the family app the landing presents. */
export type saasstudio = {
  id: string;
  name: string;
  subtitle: string;
  rating: string;
  badge: string;
  gradient: string;
  glow: string;
};

/** One top ten row of the Cadria rail. */
export type saasfilm = {
  rank: string;
  title: string;
  tag: string;
  match: string;
  duration: string;
  image: string;
  category: "3d" | "series" | "live";
};

/** One reel of the explorer wall. */
export type saasreel = { title: string; creator: string; tag: string; image: string };

/** One creator profile of the follow cards. */
export type saascreator = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  cover: string;
  covergradient: string;
  studio: string;
  stats: readonly (readonly [string, string])[];
};

/** One track of the Debonair rail: link carries the player index of the
 * core four, null for the editorial extras. */
export type saastrack = { title: string; artist: string; total: string; cover: string; link: number | null };

/** One nav row of the header tabs and the left rail stops. */
export type saasnavrow = { id: string; label: string };

/** The header chrome copy: the wordmark title, the alerts key and the
 * sign-in key of the header, the launch key, the left rail cloud key and
 * the three keys of the corner dock. */
export const saaschrome = {
  title: "DevThink",
  alerts: "Alerts",
  notificationssynced: "Notifications synced",
  signin: "Sign In",
  launch: "Launch",
  railcloud: "Saddle Cloud",
  dockstar: "Save to Favorites",
  savedtofavorites: "Saved to Favorites",
  dockexplore: "Explorer",
  docktop: "Top",
};

/** The five tabs of the header saddle bridge, one section each. */
export const saasheadertabs: readonly saasnavrow[] = [
  { id: "hero-os", label: "OS" },
  { id: "workspace-subapps", label: "Explorer" },
  { id: "creators-doo", label: "Creators" },
  { id: "spatial-bento", label: "Cadria" },
  { id: "sonic-deck", label: "Debonair" },
];

/** The six stops of the left rail saddle, one section each. */
export const saasrailstops: readonly saasnavrow[] = [
  { id: "hero-os", label: "DevThink OS" },
  { id: "creators-doo", label: "Doo & Creators" },
  { id: "workspace-subapps", label: "Explorer" },
  { id: "spatial-bento", label: "Cadria" },
  { id: "sonic-deck", label: "Debonair" },
  { id: "advisor-dark", label: "Doo Chat" },
];

/** The toast copy of the face: the fixed pills and the composing prefixes
 * the rows join their titles onto. */
export const saastoasts = {
  community: "Exploring Community Creations",
  dooroo: "Doo replied",
  shared: "Shared",
  portfolio: "Portfolio drafted",
  addedlist: "Added to My List",
  livetv: "Playing live TV",
  noordinary: "Playing No Ordinary Love",
  playing: "Playing",
  loaded: "Loaded",
  following: "Following",
  unfollowed: "Unfollowed",
};

/** One mode row of the hero switch: the id the switch carries and the mode
 * words the statement wears while the mode rides. */
export type saasheromode = { id: string; word: string };

/** The hero copy of the landing: the OS statement with the inline engine
 * switch the original reference carries inside the headline (the gradient
 * track with the white thumb and the aria label), the mode words that
 * answer the switch, the sub line, the two key labels and the three
 * scooped cards. */
export const saashero = {
  leada: "An OS",
  leadb: "built for",
  leadc: "every AI",
  modetoggle: "Toggle OS Mode",
  modes: [
    { id: "agents", word: "and your agents" },
    { id: "studios", word: "and your studios" },
  ] as readonly saasheromode[],
  subtitle: "Create stream and run any studio or AI team in one unified OS",
  keyprimary: "Get Started",
  keysecondary: "Why DevThink?",
  rating: "4,9",
  organizer: "The perfect organizer and team builder",
  timetitle: "Use time to your advantage every day",
  timebody: "Studios agents and streams in sync",
  shader: "Neural Shader Core",
  chart: [42, 70, 55, 88, 100, 76, 92, 64] as readonly number[],
  faces: [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80",
  ] as readonly string[],
};

/** The creators section copy: the statement, the follow heading and the
 * three build cards under the doo mark. */
export const saascreatorsintro = {
  headinga: "Ready to create",
  headingb: "great things?",
  followheading: "Follow your favorite creators",
  cards: [
    {
      app: "cadria",
      title: "Create & Stream",
      body: "Build 3D scenes and publish directly to Cadria",
      tag: "Cadria",
      surface: "surface-card p-6",
      titletone: "text-slate-950",
      bodytone: "text-slate-500",
      tagtone: "text-pink-600",
    },
    {
      app: "getry",
      title: "AI Teams",
      body: "Cocreate with autonomous agents in sync",
      tag: "Getry & Doo",
      surface: "indigo-tactile-surface p-6 text-white",
      titletone: "text-white",
      bodytone: "text-indigo-100",
      tagtone: "text-white",
    },
    {
      app: "saddle",
      title: "Saddle Cloud",
      body: "Run heavy studios and games in your browser",
      tag: "Saddle",
      surface: "surface-card p-6",
      titletone: "text-slate-950",
      bodytone: "text-slate-500",
      tagtone: "text-sky-600",
    },
  ] as readonly {
    app: string;
    title: string;
    body: string;
    tag: string;
    surface: string;
    titletone: string;
    bodytone: string;
    tagtone: string;
  }[],
};

/** The native studios section copy: the bridge label, the split heading
 * and the open studio button around the fan deck. */
export const saasstudiosintro = {
  bridge: "Native Studios Built for Every Creator",
  headinga: "Native Studios",
  headingb: "Built for Every Creator",
  openprefix: "Open",
  opensuffix: "Studio",
};

/** The native studios the fan deck cycles through. */
export const saasstudios: readonly saasstudio[] = [
  {
    id: "getry",
    name: "Getry",
    subtitle: "Multi Agent Studio",
    rating: "4,9",
    badge: "35 AI Models",
    gradient: "from-[#C4B5FD] via-[#8B5CF6] to-[#22D3EE]",
    glow: "shadow-[0_28px_70px_-12px_rgba(139,92,246,0.55)]",
  },
  {
    id: "debonair",
    name: "Debonair",
    subtitle: "Music & AI Vocal DAW",
    rating: "4,8",
    badge: "Studio Sound",
    gradient: "from-[#FDA4AF] via-[#FB7185] to-[#FB923C]",
    glow: "shadow-[0_28px_70px_-12px_rgba(244,63,94,0.55)]",
  },
  {
    id: "cadria",
    name: "Cadria",
    subtitle: "Cinema & 3D World Engine",
    rating: "4,9",
    badge: "Realtime 3D",
    gradient: "from-[#7DD3FC] via-[#38BDF8] to-[#0284C7]",
    glow: "shadow-[0_32px_80px_-12px_rgba(56,189,248,0.6)]",
  },
  {
    id: "saddle",
    name: "Saddle",
    subtitle: "Instant Cloud Play",
    rating: "4,9",
    badge: "Zero Local GPU",
    gradient: "from-[#6EE7B7] via-[#34D399] to-[#0EA5E9]",
    glow: "shadow-[0_28px_70px_-12px_rgba(16,185,129,0.55)]",
  },
  {
    id: "vault",
    name: "Vault",
    subtitle: "Edge Cloud Sync",
    rating: "4,7",
    badge: "Instant Sync",
    gradient: "from-[#FDE68A] via-[#FBBF24] to-[#FB923C]",
    glow: "shadow-[0_28px_70px_-12px_rgba(59,130,246,0.55)]",
  },
];

/** The studio flow strip between the fan deck and Cadria. */
export const saasflow = {
  badge: "Keep exploring",
  heading: "Every studio flows into Cadria",
  copy: "One scroll from Native Studios into cinema 3D worlds and live TV",
  cta: "Enter Cadria",
};

/** The Cadria section copy: the brand row, the tabs, the default hero, the
 * rail header and the live TV banner. */
export const saascadria = {
  brand: "CADRIA",
  tabs: [
    { id: "trending", label: "Trending" },
    { id: "series", label: "Series" },
    { id: "3d", label: "3D Worlds" },
    { id: "live", label: "Live TV" },
  ] as readonly { id: string; label: string }[],
  hero: {
    title: "LAST COLONY",
    ep: "S03E04 The Landing",
    match: "99% Match",
    image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1000&auto=format&fit=crop&q=80",
  },
  original: "Cadria Original",
  play: "Play",
  top10: "TOP 10",
  railheading: "Trending films on Cadria",
  previewhint: "Click to preview",
  livebadge: "LIVE",
  livetitle: "TV Queenstown Speed Festival",
  livecopy: "LAP 27 of 39 with 38 watching now",
  liveimage: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1400&auto=format&fit=crop&q=80",
  livealt: "Queenstown Speed Festival",
  watchlive: "Watch live",
};

/** The Cadria top ten the film rail renders. */
export const saasfilms: readonly saasfilm[] = [
  {
    rank: "01",
    title: "Cyberia 2099",
    tag: "3D FILM",
    match: "99% Match",
    duration: "1h 48m",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    category: "3d",
  },
  {
    rank: "02",
    title: "Orbital Drift",
    tag: "SERIES",
    match: "98% Match",
    duration: "S02E01",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    category: "series",
  },
  {
    rank: "03",
    title: "Apex GT Live",
    tag: "LIVE 4K",
    match: "96% Match",
    duration: "LIVE",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80",
    category: "live",
  },
  {
    rank: "04",
    title: "Solaris Mesh",
    tag: "3D SCENE",
    match: "95% Match",
    duration: "60 FPS",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80",
    category: "3d",
  },
  {
    rank: "05",
    title: "Tidal Dreams",
    tag: "FILM",
    match: "94% Match",
    duration: "2h 04m",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
    category: "series",
  },
  {
    rank: "06",
    title: "Analog Hearts",
    tag: "AI FILM",
    match: "93% Match",
    duration: "1h 52m",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    category: "series",
  },
  {
    rank: "07",
    title: "Neon Parade",
    tag: "LIVE 4K",
    match: "92% Match",
    duration: "LIVE",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    category: "live",
  },
  {
    rank: "08",
    title: "Static Bloom",
    tag: "3D SCENE",
    match: "91% Match",
    duration: "60 FPS",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    category: "3d",
  },
];

/** The explorer wall copy: the creators badge, the statement and the
 * explore key of the unified feed. */
export const saasexplorer = {
  badge: "Join over 100,000 human and AI creators",
  heading: "Publish Once, Stream Across Every Studio",
  copy: "Every 3D scene film cut and AI stem goes live in the unified DevThink Explorer",
  cta: "Explore Creations",
  badgepath: "EXPLORER UNIFIED FEED EXPLORER UNIFIED FEED ",
};

/** The reels the explorer wall renders. */
export const saasreels: readonly saasreel[] = [
  {
    title: "Neon Ramen 3D",
    creator: "@alan Cadria",
    tag: "3D Mesh",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Afro Synth Live",
    creator: "@nato Debonair",
    tag: "AI Stem",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Cliffside Coast",
    creator: "@marco Cadria",
    tag: "4K Film",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Orbital Odyssey",
    creator: "@doo_agent Saddle",
    tag: "Cloud Game",
    image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Citrus Macro Lab",
    creator: "@chloe Cadria",
    tag: "Shader",
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Velvet Echoes",
    creator: "@sade_ai Debonair",
    tag: "24 Bit",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Night Rider GT",
    creator: "@saiko Saddle",
    tag: "60 FPS",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=500&auto=format&fit=crop&q=80",
  },
];

/** The Debonair section copy: the brand row with the clock, the editorial
 * hero and the rail header. */
export const saasdebonair = {
  bridge: "Debonair Studio",
  brand: "DEBONAIR",
  dawlabel: "Lossless AI DAW",
  clock: "12:35 25°C",
  editorial: "Editorial",
  titlea: "LOVE",
  titleb: "2K26",
  copy: "Handpicked masters spatial remixes and AI stems from the community",
  heroimage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1400&auto=format&fit=crop&q=80",
  heroalt: "LOVE 2K26",
  play: "Play",
  opendaw: "Open the DAW",
  railheading: "Trending tracks on Debonair",
};

/** The Debonair rail: the trending tracks with their covers, the core four
 * linked to the player and the two editorial extras. */
export const saastracks: readonly saastrack[] = [
  {
    title: "One For The Road",
    artist: "Arctic Monkeys",
    total: "3:27",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80",
    link: 0,
  },
  {
    title: "Get Lucky",
    artist: "Daft Punk, Pharrell Williams",
    total: "6:10",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
    link: 1,
  },
  {
    title: "No Ordinary Love",
    artist: "Sade",
    total: "7:21",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
    link: 2,
  },
  {
    title: "Dracula",
    artist: "Tame Impala",
    total: "3:26",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80",
    link: 3,
  },
  {
    title: "Velvet Echoes",
    artist: "Sade AI Remaster",
    total: "5:30",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
    link: null,
  },
  {
    title: "Midnight Console",
    artist: "Live DAW Session",
    total: "6:02",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80",
    link: null,
  },
];

/** The Doo section copy: the advisor statement, the stat tiles and the
 * demo chat card with its default reply. */
export const saasdoo = {
  bridge: "Doo Native AI",
  badge: "Doo Native AI",
  headinga: "Your personal",
  headingb: "AI advisor",
  copy: "Ask anything and Doo drafts designs and ships with you inside every studio",
  primary: "Draft my portfolio",
  secondary: "Explore studios",
  stats: [
    ["35", "Studios"],
    ["60", "FPS Cloud"],
    ["24", "Bit Audio"],
  ] as readonly (readonly [string, string])[],
  name: "Doo",
  status: "Online Replies instantly",
  question: "Can you review my interface and make it feel premium?",
  reply: "Yes I have 3+ years of experience on UI/UX",
  placeholder: "Ask Doo anything",
};

/** One footer link row: an internal target scrolls the landing to its
 * section, a route walks the entry chain to that page, no field answers
 * the plain span. */
export type saasfooterlink = { label: string; target?: string; route?: string };

/** The footer copy: the tagline, the link columns and the base row. */
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
        { label: "Doo", target: "advisor-dark" },
        { label: "Getry", target: "advisor-dark" },
        { label: "Vault", target: "editorial-bio" },
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

/** The featured creators the follow cards render. */
export const saascreators: readonly saascreator[] = [
  {
    id: "alan",
    name: "Alan Neres",
    role: "3D World Creator",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    cover: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80",
    covergradient: "from-sky-200 via-indigo-100 to-pink-100",
    studio: "cadria",
    stats: [
      ["2,1K", "Likes"],
      ["3", "Posts"],
      ["18,6K", "Views"],
    ],
  },
  {
    id: "nato",
    name: "Nato",
    role: "Spatial Audio Director",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80",
    covergradient: "from-indigo-200 via-purple-100 to-sky-100",
    studio: "debonair",
    stats: [
      ["2,4K", "Likes"],
      ["3", "Posts"],
      ["22,1K", "Views"],
    ],
  },
];
