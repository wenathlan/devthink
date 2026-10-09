/**
 * ranking.ts — the leaderboard domain logic of stealthhead (root layer).
 *
 * the competitive ladder model plus the sort/rank helpers the ranking
 * page renders through. the rows below are the in-memory seed of the
 * site DB: the self-hosted database (see db.ts) carries the same table
 * and serves it over HTTPS, and the static build falls back to this
 * seed without ever touching the visitor machine.
 */

/** one ladder entry of the competitive season. */
export type RankingEntry = {
  id: string;
  player: string;
  squad: string;
  region: string;
  season: string;
  score: number;
  wins: number;
  matches: number;
  kd: number;
};

/** the in-memory seed the DB layer persists on first run. */
export const RANKINGSEED: RankingEntry[] = [
  { id: "rk-1", player: "vanta.k", squad: "ember", region: "sa-east", season: "s6", score: 48120, wins: 214, matches: 331, kd: 2.41 },
  { id: "rk-2", player: "ruinmaker", squad: "ember", region: "sa-east", season: "s6", score: 45560, wins: 198, matches: 322, kd: 2.12 },
  { id: "rk-3", player: "solar.havoc", squad: "tide", region: "us-east", season: "s6", score: 43990, wins: 187, matches: 310, kd: 1.98 },
  { id: "rk-4", player: "quietfurnace", squad: "ash", region: "eu-west", season: "s6", score: 41230, wins: 176, matches: 305, kd: 1.86 },
  { id: "rk-5", player: "northglow", squad: "ash", region: "eu-west", season: "s6", score: 39870, wins: 169, matches: 298, kd: 1.74 },
  { id: "rk-6", player: "glassjack", squad: "sol", region: "us-east", season: "s6", score: 37410, wins: 158, matches: 287, kd: 1.66 },
  { id: "rk-7", player: "emberline", squad: "tide", region: "sa-east", season: "s6", score: 35020, wins: 149, matches: 276, kd: 1.52 },
  { id: "rk-8", player: "coldsnap", squad: "sol", region: "us-west", season: "s6", score: 32880, wins: 140, matches: 268, kd: 1.44 },
  { id: "rk-9", player: "duskwake", squad: "ash", region: "eu-west", season: "s6", score: 30110, wins: 131, matches: 254, kd: 1.31 },
  { id: "rk-10", player: "halcyon.ra", squad: "ember", region: "sa-east", season: "s6", score: 28940, wins: 124, matches: 249, kd: 1.22 },
];

/** fetch budget for the HTTPS answer of the self-hosted DB. */
const fetchbudget = 2500;

/** the in-memory answer cache for the document lifetime (no storage). */
let rankingcache: RankingEntry[] | null = null;

/**
 * lists the ladder entries: asks the self-hosted DB over HTTPS first and
 * falls back to the in-memory seed when the endpoint is absent (static
 * build). never touches the visitor machine.
 *
 * @returns the ranking rows.
 */
export async function listranking(): Promise<RankingEntry[]> {
  if (rankingcache) return rankingcache;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), fetchbudget);
    const response = await fetch("/api/v1/ranking", { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`ranking answered ${response.status}`);
    const rows = (await response.json()) as RankingEntry[];
    rankingcache = rows;
    return rows;
  } catch {
    return RANKINGSEED;
  }
}

/**
 * sorts entries by score, best first; ties break by wins then name so
 * the ladder stays stable between renders.
 *
 * @param entries the rows to sort.
 * @returns the sorted rows.
 */
export function sortentries(entries: RankingEntry[]): RankingEntry[] {
  return [...entries].sort(
    (left, right) => right.score - left.score || right.wins - left.wins || left.player.localeCompare(right.player),
  );
}

/**
 * stamps the ladder positions (1-based) onto sorted entries.
 *
 * @param entries the entries already sorted by score.
 * @returns the entries with position filled.
 */
export function assignpositions(entries: RankingEntry[]): (RankingEntry & { position: number })[] {
  return sortentries(entries).map((entry, index) => ({ ...entry, position: index + 1 }));
}

/**
 * filters the ladder by season.
 *
 * @param entries the rows to filter.
 * @param season the season tag to keep.
 * @returns the matching rows.
 */
export function filterbyseason(entries: RankingEntry[], season: string): RankingEntry[] {
  return entries.filter((entry) => entry.season === season);
}

/**
 * computes the win rate of one entry as a 0-100 percentage.
 *
 * @param entry the entry to measure.
 * @returns the win rate percentage.
 */
export function winrate(entry: RankingEntry): number {
  if (entry.matches === 0) return 0;
  return Math.round((entry.wins / entry.matches) * 100);
}

/**
 * keeps only the podium (top three) of a sorted ladder.
 *
 * @param entries the sorted rows.
 * @returns the first three rows.
 */
export function podium<T extends { position?: number }>(entries: T[]): T[] {
  return entries.slice(0, 3);
}
