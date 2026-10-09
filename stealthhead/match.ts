/**
 * match.ts — the match domain logic of stealthhead (root layer).
 *
 * models the lobby/round/player triangle of the FPS platform plus the
 * pure helpers the match page renders through. the rows below are the
 * in-memory seed of the site DB: the self-hosted database (see db.ts)
 * carries the same tables and serves them over HTTPS, and the static
 * build falls back to this seed without ever touching the visitor
 * machine. no storage, no hardware: data lives on the site.
 */

/** one round inside a match lobby. */
export type MatchRound = {
  id: string;
  index: number;
  map: string;
  mode: string;
  state: "pending" | "live" | "scored";
};

/** one player seated in a match lobby. */
export type MatchPlayer = {
  id: string;
  lobbyid: string;
  handle: string;
  squad: string;
  score: number;
  ping: number;
};

/** one match lobby: rounds plus the seated players. */
export type MatchLobby = {
  id: string;
  title: string;
  region: string;
  state: "open" | "live" | "closed";
  capacity: number;
  rounds: MatchRound[];
};

/** the in-memory seed the DB layer persists on first run. */
export const MATCHSEED: MatchLobby[] = [
  {
    id: "m-2201",
    title: "dawn raid ranked",
    region: "sa-east",
    state: "live",
    capacity: 10,
    rounds: [
      { id: "r-1", index: 1, map: "steelhead dam", mode: "domination", state: "scored" },
      { id: "r-2", index: 2, map: "cold harbor", mode: "team deathmatch", state: "live" },
      { id: "r-3", index: 3, map: "rift yard", mode: "search", state: "pending" },
    ],
  },
  {
    id: "m-2202",
    title: "nightfall wingman",
    region: "us-east",
    state: "open",
    capacity: 8,
    rounds: [
      { id: "r-4", index: 1, map: "vertigo stacks", mode: "duel", state: "pending" },
      { id: "r-5", index: 2, map: "glass atoll", mode: "duel", state: "pending" },
    ],
  },
  {
    id: "m-2203",
    title: "emberline casual",
    region: "eu-west",
    state: "open",
    capacity: 12,
    rounds: [
      { id: "r-6", index: 1, map: "emberline", mode: "control", state: "pending" },
    ],
  },
  {
    id: "m-2204",
    title: "solstice cup finals",
    region: "sa-east",
    state: "closed",
    capacity: 10,
    rounds: [
      { id: "r-7", index: 1, map: "steelhead dam", mode: "domination", state: "scored" },
      { id: "r-8", index: 2, map: "rift yard", mode: "search", state: "scored" },
      { id: "r-9", index: 3, map: "cold harbor", mode: "team deathmatch", state: "scored" },
    ],
  },
];

/** the seated players of the seed, keyed by lobby. */
export const MATCHPLAYERSEED: MatchPlayer[] = [
  { id: "p-1", lobbyid: "m-2201", handle: "vanta.k", squad: "ember", score: 4850, ping: 18 },
  { id: "p-2", lobbyid: "m-2201", handle: "ruinmaker", squad: "ember", score: 4210, ping: 22 },
  { id: "p-3", lobbyid: "m-2201", handle: "solar.havoc", squad: "tide", score: 3980, ping: 31 },
  { id: "p-4", lobbyid: "m-2202", handle: "quietfurnace", squad: "ash", score: 2140, ping: 27 },
  { id: "p-5", lobbyid: "m-2202", handle: "northglow", squad: "ash", score: 1980, ping: 44 },
  { id: "p-6", lobbyid: "m-2203", handle: "glassjack", squad: "sol", score: 990, ping: 35 },
  { id: "p-7", lobbyid: "m-2204", handle: "vanta.k", squad: "ember", score: 7320, ping: 19 },
  { id: "p-8", lobbyid: "m-2204", handle: "ruinmaker", squad: "ember", score: 6870, ping: 21 },
];

/** fetch budget for the HTTPS answer of the self-hosted DB. */
const fetchbudget = 2500;

/** the in-memory answer cache for the document lifetime (no storage). */
let lobbycache: MatchLobby[] | null = null;

/**
 * lists the match lobbies: asks the self-hosted DB over HTTPS first and
 * falls back to the in-memory seed when the endpoint is absent (static
 * build). never touches the visitor machine.
 *
 * @returns the lobby rows.
 */
export async function listmatches(): Promise<MatchLobby[]> {
  if (lobbycache) return lobbycache;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), fetchbudget);
    const response = await fetch("/api/v1/matches", { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`matches answered ${response.status}`);
    const rows = (await response.json()) as MatchLobby[];
    lobbycache = rows;
    return rows;
  } catch {
    return MATCHSEED;
  }
}

/**
 * lists the players seated in one lobby (or every seat when no id).
 *
 * @param lobbyid the optional lobby filter.
 * @returns the player rows.
 */
export async function listmatchplayers(lobbyid?: string): Promise<MatchPlayer[]> {
  const rows = MATCHPLAYERSEED.filter((player) => !lobbyid || player.lobbyid === lobbyid);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), fetchbudget);
    const response = await fetch(`/api/v1/matches/players${lobbyid ? `?lobby=${encodeURIComponent(lobbyid)}` : ""}`, { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`players answered ${response.status}`);
    const fetched = (await response.json()) as MatchPlayer[];
    return fetched.length > 0 ? fetched : rows;
  } catch {
    return rows;
  }
}

/**
 * sorts lobbies live first, then open, then closed; ties break by id so
 * the order stays stable.
 *
 * @param lobbies the lobbies to order.
 * @returns the ordered lobbies.
 */
export function orderlobbies(lobbies: MatchLobby[]): MatchLobby[] {
  const weight: Record<MatchLobby["state"], number> = { live: 0, open: 1, closed: 2 };
  return [...lobbies].sort((left, right) => weight[left.state] - weight[right.state] || left.id.localeCompare(right.id));
}

/**
 * counts the rounds of a lobby per state.
 *
 * @param lobby the lobby to inspect.
 * @returns the pending/live/scored counts.
 */
export function roundcounts(lobby: MatchLobby): { pending: number; live: number; scored: number } {
  return {
    pending: lobby.rounds.filter((round) => round.state === "pending").length,
    live: lobby.rounds.filter((round) => round.state === "live").length,
    scored: lobby.rounds.filter((round) => round.state === "scored").length,
  };
}

/**
 * finds the current round of a lobby (the live one, else the first pending).
 *
 * @param lobby the lobby to inspect.
 * @returns the current round or null when the lobby is closed.
 */
export function currentround(lobby: MatchLobby): MatchRound | null {
  return lobby.rounds.find((round) => round.state === "live") ?? lobby.rounds.find((round) => round.state === "pending") ?? null;
}

/**
 * ranks the seats of one lobby by score, best first.
 *
 * @param players the seats to rank.
 * @returns the players ordered by score.
 */
export function seatleaderboard(players: MatchPlayer[]): MatchPlayer[] {
  return [...players].sort((left, right) => right.score - left.score);
}
