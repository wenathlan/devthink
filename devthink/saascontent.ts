/**
 * saascontent.ts — the release rows of the SaaS landing (root data layer).
 * The intro face renders this copy exactly as it ships: the studio fan
 * deck, the Cadria top ten, the explorer reels, the Debonair tracks and the
 * featured creators. Pure data — no fetch, no state, no timestamps — so a
 * rerun renders the same landing byte for byte.
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
  studio: string;
  stats: readonly (readonly [string, string])[];
};

/** The native studios the fan deck cycles through. */
export const saasstudios: readonly saasstudio[] = [
  {
    id: "getry",
    name: "Getry",
    subtitle: "Multi agent gateway",
    rating: "4,9",
    badge: "35 AI routes",
    gradient: "from-[#C4B5FD] via-[#8B5CF6] to-[#22D3EE]",
    glow: "shadow-[0_28px_70px_-12px_rgba(139,92,246,0.55)]",
  },
  {
    id: "debonair",
    name: "Debonair",
    subtitle: "Music and AI vocal DAW",
    rating: "4,8",
    badge: "Kathesis DSP",
    gradient: "from-[#FDA4AF] via-[#FB7185] to-[#FB923C]",
    glow: "shadow-[0_28px_70px_-12px_rgba(244,63,94,0.55)]",
  },
  {
    id: "cadria",
    name: "Cadria",
    subtitle: "Cinema and 3D world engine",
    rating: "4,9",
    badge: "VersaWaze 3D",
    gradient: "from-[#7DD3FC] via-[#38BDF8] to-[#0284C7]",
    glow: "shadow-[0_32px_80px_-12px_rgba(56,189,248,0.6)]",
  },
  {
    id: "saddle",
    name: "Saddle",
    subtitle: "Instant cloud runner",
    rating: "4,9",
    badge: "Zero local GPU",
    gradient: "from-[#6EE7B7] via-[#34D399] to-[#0EA5E9]",
    glow: "shadow-[0_28px_70px_-12px_rgba(16,185,129,0.55)]",
  },
  {
    id: "vault",
    name: "Vault",
    subtitle: "Edge cloud sync",
    rating: "4,7",
    badge: "Instant sync",
    gradient: "from-[#FDE68A] via-[#FBBF24] to-[#FB923C]",
    glow: "shadow-[0_28px_70px_-12px_rgba(59,130,246,0.55)]",
  },
];

/** The Cadria top ten the film rail renders. */
export const saasfilms: readonly saasfilm[] = [
  {
    rank: "01",
    title: "Cyberia 2099",
    tag: "3D film",
    match: "99% match",
    duration: "1h 48m",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    category: "3d",
  },
  {
    rank: "02",
    title: "Orbital Drift",
    tag: "Series",
    match: "98% match",
    duration: "S02E01",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    category: "series",
  },
  {
    rank: "03",
    title: "Apex GT Live",
    tag: "Live 4K",
    match: "96% match",
    duration: "Live",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80",
    category: "live",
  },
  {
    rank: "04",
    title: "Solaris Mesh",
    tag: "3D scene",
    match: "95% match",
    duration: "60 fps",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80",
    category: "3d",
  },
  {
    rank: "05",
    title: "Tidal Dreams",
    tag: "Film",
    match: "94% match",
    duration: "2h 04m",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
    category: "series",
  },
  {
    rank: "06",
    title: "Analog Hearts",
    tag: "AI film",
    match: "93% match",
    duration: "1h 52m",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    category: "series",
  },
  {
    rank: "07",
    title: "Neon Parade",
    tag: "Live 4K",
    match: "92% match",
    duration: "Live",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    category: "live",
  },
  {
    rank: "08",
    title: "Static Bloom",
    tag: "3D scene",
    match: "91% match",
    duration: "60 fps",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    category: "3d",
  },
];

/** The reels the explorer wall renders. */
export const saasreels: readonly saasreel[] = [
  {
    title: "Neon Ramen 3D",
    creator: "@alan Cadria",
    tag: "3D mesh",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Afro Synth Live",
    creator: "@nato Debonair",
    tag: "AI stem",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Cliffside Coast",
    creator: "@marco Cadria",
    tag: "4K film",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Orbital Odyssey",
    creator: "@doo Saddle",
    tag: "Cloud game",
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
    creator: "@sade Debonair",
    tag: "24 bit",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Night Rider GT",
    creator: "@saiko Saddle",
    tag: "60 fps",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=500&auto=format&fit=crop&q=80",
  },
];

/** The Debonair rail: the trending tracks with their covers. */
export const saastracks: readonly { title: string; artist: string; total: string; cover: string }[] = [
  {
    title: "One For The Road",
    artist: "Arctic Monkeys",
    total: "3:27",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Get Lucky",
    artist: "Daft Punk, Pharrell Williams",
    total: "6:10",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "No Ordinary Love",
    artist: "Sade",
    total: "7:21",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Dracula",
    artist: "Tame Impala",
    total: "3:26",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Velvet Echoes",
    artist: "Sade AI remaster",
    total: "5:30",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Midnight Console",
    artist: "Live DAW session",
    total: "6:02",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80",
  },
];

/** The featured creators the follow cards render. */
export const saascreators: readonly saascreator[] = [
  {
    id: "alan",
    name: "Alan Neres",
    role: "3D world creator",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    cover: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80",
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
    role: "Spatial audio director",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80",
    studio: "debonair",
    stats: [
      ["2,4K", "Likes"],
      ["3", "Posts"],
      ["22,1K", "Views"],
    ],
  },
];
