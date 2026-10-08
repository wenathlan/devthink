/**
 * spawner.ts — the spawn selection and respawn pacing of stealhead (root layer).
 *
 * spawn points per catalog map, team weighting, minimum-distance hard
 * filters, anti-camping pressure from recent deaths, respawn escalation
 * with protection windows and wave-mode scheduling. the design is
 * absorbed from the official catalog through the LOGICS-6 wave plan
 * (the scene-grid probability pattern of the clones, rebuilt as native
 * typescript under the deterministic-simulation discipline of the wave:
 * a seeded prng drives the picks, never Math.random, so the same seed
 * always replays the same match). the seed rows below catalog the three
 * maps of the world gallery (world.ts).
 * non-goals: no rendering, no networking i/o, no pathfinding, no map
 * geometry parsing, no storage.
 */

/** the minimal 3d point the spawner reasons about (own copy, y is up). */
export type SpawnVec3 = { x: number; y: number; z: number };

/** the sides the arena seats (aligned with the operator catalog). */
export type SpawnTeam = "ember" | "tide" | "neutral";

/** one cataloged spawn point of a map. */
export type SpawnPoint = {
  /** stable identity the match logic keys on. */
  id: string;
  /** the map name (the same rows the world gallery catalogs). */
  map: string;
  /** the side the point serves, or neutral for deathmatch flow. */
  team: SpawnTeam;
  /** the world position of the point. */
  position: SpawnVec3;
  /** the base lottery weight of the point. */
  weight: number;
};

/** one recent death the anti-camping pressure decays from. */
export type DeathMark = { position: SpawnVec3; tick: number };

/** everything one spawn decision needs, all of it pure data. */
export type SpawnQuery = {
  map: string;
  team: SpawnTeam;
  /** living enemy positions (hard safety filter). */
  enemies: SpawnVec3[];
  /** spawn points already taken this wave (hard stacking filter). */
  occupied: SpawnVec3[];
  deaths: DeathMark[];
  tick: number;
};

/** one scored candidate: the point plus its adjusted lottery weight. */
export type SpawnPick = { point: SpawnPoint; score: number };

/** the tuning knobs of the spawner (one config per mode). */
export type SpawnerConfig = {
  /** hard minimum distance to occupied points and living enemies. */
  mindistance: number;
  /** the radius the camp pressure decays over. */
  campradius: number;
  /** the tick half-life of the camp pressure. */
  camphalflife: number;
  /** the base respawn wait in ticks. */
  respawnbase: number;
  /** the respawn wait ceiling in ticks. */
  respawncap: number;
  /** the spawn-protection window in ticks. */
  protectionticks: number;
  /** how many top-scored candidates enter the final lottery. */
  topn: number;
};

/** one scheduled wave the planner emits. */
export type WavePlan = { wave: number; startat: number; count: number };

/** the wave-mode pacing config. */
export type WaveConfig = { waves: number; countperwave: number; intervalticks: number };

/** the tuning every mode falls back to. */
export const DEFAULTSPAWNCONFIG: SpawnerConfig = {
  mindistance: 12,
  campradius: 10,
  camphalflife: 400,
  respawnbase: 50,
  respawncap: 400,
  protectionticks: 60,
  topn: 3,
};

/** the seed rows the DB layer persists on first run (per map, per side). */
export const SPAWNSEED: SpawnPoint[] = [
  { id: "sd-e1", map: "steelhead dam", team: "ember", position: { x: -38, y: 0, z: -22 }, weight: 1 },
  { id: "sd-e2", map: "steelhead dam", team: "ember", position: { x: -34, y: 0, z: 18 }, weight: 0.8 },
  { id: "sd-t1", map: "steelhead dam", team: "tide", position: { x: 40, y: 0, z: 24 }, weight: 1 },
  { id: "sd-t2", map: "steelhead dam", team: "tide", position: { x: 36, y: 0, z: -16 }, weight: 0.8 },
  { id: "ch-e1", map: "cold harbor", team: "ember", position: { x: -42, y: 0, z: -8 }, weight: 1 },
  { id: "ch-e2", map: "cold harbor", team: "ember", position: { x: -12, y: 0, z: -40 }, weight: 0.7 },
  { id: "ch-t1", map: "cold harbor", team: "tide", position: { x: 44, y: 0, z: 10 }, weight: 1 },
  { id: "ch-t2", map: "cold harbor", team: "tide", position: { x: 14, y: 0, z: 42 }, weight: 0.7 },
  { id: "ry-n1", map: "rift yard", team: "neutral", position: { x: -30, y: 0, z: -30 }, weight: 1 },
  { id: "ry-n2", map: "rift yard", team: "neutral", position: { x: 30, y: 0, z: -30 }, weight: 1 },
  { id: "ry-n3", map: "rift yard", team: "neutral", position: { x: -30, y: 0, z: 30 }, weight: 1 },
  { id: "ry-n4", map: "rift yard", team: "neutral", position: { x: 30, y: 0, z: 30 }, weight: 1 },
];

/**
 * the seeded prng of the spawner (mulberry32): deterministic across
 * clients and replays — the wave rule bans Math.random in simulation.
 *
 * @param seed the 32-bit match seed.
 * @returns the next-number function.
 */
export function makerng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** the euclidean distance between two spawn positions. */
export function distance(a: SpawnVec3, b: SpawnVec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** filters the catalog rows of one map. */
export function spawnpointsformap(points: SpawnPoint[], map: string): SpawnPoint[] {
  return points.filter((point) => point.map === map);
}

/** filters one map down to the side the query seats (neutral always flows). */
export function spawnpointsforteam(points: SpawnPoint[], map: string, team: SpawnTeam): SpawnPoint[] {
  return spawnpointsformap(points, map).filter((point) => point.team === team || point.team === "neutral");
}

/** drops every point inside the hard radius of a blocked position. */
export function filterbymindistance(points: SpawnPoint[], blocked: SpawnVec3[], mindistance: number): SpawnPoint[] {
  return points.filter((point) => blocked.every((other) => distance(point.position, other) >= mindistance));
}

/** the nearest distance from a point to a position cloud (infinity when empty). */
export function nearestdistance(point: SpawnVec3, positions: SpawnVec3[]): number {
  let nearest = Infinity;
  for (const other of positions) nearest = Math.min(nearest, distance(point, other));
  return nearest;
}

/**
 * the anti-camping pressure of one point: every recent death inside the
 * camp radius contributes a weight that decays by half each half-life.
 *
 * @param point the candidate point.
 * @param deaths the recent death marks.
 * @param tick the current tick.
 * @param config the mode tuning.
 * @returns the pressure in [0, 1] (sum of contributions, clamped).
 */
export function campscore(point: SpawnPoint, deaths: DeathMark[], tick: number, config: SpawnerConfig): number {
  let pressure = 0;
  for (const death of deaths) {
    if (distance(point.position, death.position) > config.campradius) continue;
    pressure += 0.5 ** (Math.max(0, tick - death.tick) / config.camphalflife);
  }
  return Math.min(1, pressure);
}

/**
 * scores every candidate: base weight discounted by camp pressure and
 * by how close the nearest living enemy stands, sorted best first.
 *
 * @param points the candidate points.
 * @param query the spawn query.
 * @param config the mode tuning.
 * @returns the scored picks, descending.
 */
export function scorepoints(points: SpawnPoint[], query: SpawnQuery, config: SpawnerConfig): SpawnPick[] {
  return points
    .map((point) => {
      const camp = campscore(point, query.deaths, query.tick, config);
      const enemy = Math.min(1, nearestdistance(point.position, query.enemies) / (config.mindistance * 2));
      return { point, score: point.weight * (1 - camp) * (0.5 + 0.5 * enemy) };
    })
    .sort((a, b) => b.score - a.score);
}

/** keeps only the best n candidates for the final lottery. */
export function shortlist(picks: SpawnPick[], topn: number): SpawnPick[] {
  return picks.slice(0, Math.max(1, topn));
}

/**
 * the weighted lottery over the shortlist: score-proportional, driven
 * only by the seeded rng.
 *
 * @param picks the shortlisted picks.
 * @param rng the seeded prng.
 * @returns the winning pick.
 */
export function pickspawn(picks: SpawnPick[], rng: () => number): SpawnPick {
  const total = picks.reduce((sum, pick) => sum + pick.score, 0);
  let roll = rng() * total;
  for (const pick of picks) {
    roll -= pick.score;
    if (roll <= 0) return pick;
  }
  return picks[picks.length - 1];
}

/**
 * the whole pipeline: map, side, hard safety and stacking filters,
 * scoring, shortlist and seeded lottery. null when nothing survives.
 *
 * @param points the catalog rows.
 * @param query the spawn query.
 * @param config the mode tuning.
 * @param rng the seeded prng.
 * @returns the winning pick or null.
 */
export function selectspawn(
  points: SpawnPoint[],
  query: SpawnQuery,
  config: SpawnerConfig,
  rng: () => number,
): SpawnPick | null {
  const eligible = filterbymindistance(
    filterbymindistance(spawnpointsforteam(points, query.map, query.team), query.occupied, config.mindistance),
    query.enemies,
    config.mindistance,
  );
  if (eligible.length === 0) return null;
  const picks = shortlist(scorepoints(eligible, query, config), config.topn);
  return pickspawn(picks, rng);
}

/** appends a death mark and prunes the marks older than the window. */
export function withdeath(deaths: DeathMark[], mark: DeathMark, window: number): DeathMark[] {
  const fresh = deaths.filter((existing) => mark.tick - existing.tick <= window);
  fresh.push(mark);
  return fresh;
}

/**
 * the respawn wait: escalates 1.5x per recent death (streak punishment),
 * capped by the mode ceiling.
 *
 * @param recentdeaths how many deaths the escalation counts.
 * @param config the mode tuning.
 * @returns the wait in ticks.
 */
export function respawnwait(recentdeaths: number, config: SpawnerConfig): number {
  const wait = config.respawnbase * 1.5 ** Math.max(0, recentdeaths - 1);
  return Math.min(config.respawncap, Math.round(wait));
}

/** the tick spawn protection expires at. */
export function protectionuntil(spawnat: number, config: SpawnerConfig): number {
  return spawnat + config.protectionticks;
}

/** whether the protection window still covers the tick. */
export function isprotected(until: number, tick: number): boolean {
  return tick < until;
}

/** schedules one wave from its start tick. */
export function buildwave(config: WaveConfig, wave: number, fromtick: number): WavePlan {
  return { wave, startat: fromtick + (wave - 1) * config.intervalticks, count: config.countperwave };
}

/** every wave scheduled to open in the [fromtick, now] window. */
export function duewaves(config: WaveConfig, fromtick: number, now: number): WavePlan[] {
  const plans: WavePlan[] = [];
  for (let wave = 1; wave <= config.waves; wave++) {
    const plan = buildwave(config, wave, fromtick);
    if (plan.startat <= now) plans.push(plan);
  }
  return plans;
}
