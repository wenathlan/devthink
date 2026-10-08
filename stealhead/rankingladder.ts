/**
 * rankingladder.ts — the elo ladder arithmetic of the stealhead ranking
 * domain (root layer).
 *
 * the math under the ranking page: expected versus observed score, a k factor
 * picked from a caller supplied band table, deltas with clamp and a rating
 * floor. zero hardcode — every constant (the k bands, the delta ceiling, the
 * floor, the divisor) arrives as a parameter, so a season tunes its own ladder
 * by passing its config table. pure and multi-mode: the same call runs in the
 * browser (season previews) and in node (the unit tests), with zero DOM and
 * zero storage. the ladder rows themselves stay in ranking.ts; this file only
 * moves ratings.
 */

/** the machine readable failure codes of the ladder arithmetic. */
export type laddererrorcode = "bad-rating" | "bad-outcome" | "bad-ktable" | "bad-options";

/** the typed ladder failure, traceable to the code and the offending value. */
export class laddererror extends Error {
  /** machine readable failure code. */
  readonly code: laddererrorcode;
  /** the value the failure is about (when known). */
  readonly value: number | null;

  constructor(code: laddererrorcode, value: number | null, message?: string) {
    super(message ?? `ladder ${code}${value === null ? "" : ` (${value})`}`);
    this.name = "laddererror";
    this.code = code;
    this.value = value;
  }
}

/** one k-factor band: ratings from minrating (inclusive) to maxrating (exclusive). */
export type KBand = {
  /** the lowest rating the band covers (inclusive). */
  minrating: number;
  /** the highest rating the band covers (exclusive; infinity opens the band). */
  maxrating: number;
  /** the k factor the band plays with. */
  k: number;
};

/** the ladder configuration a season passes in — nothing is fixed here. */
export type LadderOptions = {
  /** the k factor bands, ordered by rating (the table is the parameter). */
  ktable: readonly KBand[];
  /** the |delta| ceiling applied to every rating change. */
  maxdelta: number;
  /** the lowest rating the ladder hands out. */
  floorrating: number;
  /** the elo scale divisor (400 in the classic form). */
  scale: number;
};

/** the outcome of one rated match from the subject player's perspective. */
export type LadderOutcome = "win" | "loss" | "draw";

/** one side of a rated duel. */
export type LadderSide = {
  /** the player or squad id. */
  id: string;
  /** the rating entering the match. */
  rating: number;
};

/** the result of one rated duel for both sides. */
export type DuelResult = {
  /** the player side with its new rating and delta. */
  player: LadderSide & { delta: number };
  /** the opponent side with its new rating and delta. */
  opponent: LadderSide & { delta: number };
  /** the expected score of the player side, 0-1. */
  expected: number;
};

/**
 * computes the expected score of a rating against an opponent rating.
 *
 * @param rating the subject rating.
 * @param opponentrating the opponent rating.
 * @param options the ladder config (the scale divisor comes from here).
 * @returns the expected score, 0-1.
 */
export function expectedscore(rating: number, opponentrating: number, options: Pick<LadderOptions, "scale">): number {
  validateoptions(options);
  if (!Number.isFinite(rating)) throw new laddererror("bad-rating", rating);
  if (!Number.isFinite(opponentrating)) throw new laddererror("bad-rating", opponentrating);
  return 1 / (1 + 10 ** ((opponentrating - rating) / options.scale));
}

/**
 * picks the k factor of a rating from the band table.
 *
 * @param rating the rating to band.
 * @param ktable the season band table (ordered, last band may open with infinity).
 * @returns the k factor of the covering band.
 */
export function kfactor(rating: number, ktable: readonly KBand[]): number {
  if (!Array.isArray(ktable) || ktable.length === 0) throw new laddererror("bad-ktable", null, "ladder ktable must list at least one band");
  for (const band of ktable) {
    if (!Number.isFinite(band.k) || band.k <= 0) throw new laddererror("bad-ktable", band.k, `ladder band k must be a positive number, got ${band.k}`);
    if (rating >= band.minrating && rating < band.maxrating) return band.k;
  }
  throw new laddererror("bad-ktable", rating, `ladder ktable does not cover rating ${rating}`);
}

/**
 * computes the rating delta of one match: k * (observed - expected), clamped
 * to the season ceiling. the sign follows the outcome.
 *
 * @param rating the subject rating.
 * @param opponentrating the opponent rating.
 * @param outcome the observed result.
 * @param options the ladder config (ktable, maxdelta, scale).
 * @returns the (possibly clamped) delta.
 */
export function ratingdelta(rating: number, opponentrating: number, outcome: LadderOutcome, options: Pick<LadderOptions, "ktable" | "maxdelta" | "scale">): number {
  if (outcome !== "win" && outcome !== "loss" && outcome !== "draw") throw new laddererror("bad-outcome", null, `ladder outcome must be win, loss or draw, got ${outcome}`);
  const observed = outcome === "win" ? 1 : outcome === "loss" ? 0 : 0.5;
  const expected = expectedscore(rating, opponentrating, options);
  const k = kfactor(rating, options.ktable);
  const raw = k * (observed - expected);
  return Math.max(-options.maxdelta, Math.min(options.maxdelta, raw));
}

/**
 * applies a delta to a rating, honoring the floor.
 *
 * @param rating the rating entering the change.
 * @param delta the delta to apply.
 * @param floor the lowest rating the ladder hands out.
 * @returns the new rating.
 */
export function applydelta(rating: number, delta: number, floor: number): number {
  return Math.max(floor, rating + delta);
}

/**
 * rates one duel for both sides: the opponent plays the mirrored outcome and
 * the deltas stay zero-sum (a clamped side keeps the clamp — the mirror still
 * sees its own raw delta).
 *
 * @param player the subject side.
 * @param opponent the opposing side.
 * @param outcome the result from the player perspective.
 * @param options the ladder config.
 * @returns both sides with their new ratings, deltas and the expected score.
 */
export function rankduel(player: LadderSide, opponent: LadderSide, outcome: LadderOutcome, options: Pick<LadderOptions, "ktable" | "maxdelta" | "floorrating" | "scale">): DuelResult {
  const mirrored: LadderOutcome = outcome === "win" ? "loss" : outcome === "loss" ? "win" : "draw";
  const playerdelta = ratingdelta(player.rating, opponent.rating, outcome, options);
  const opponentdelta = ratingdelta(opponent.rating, player.rating, mirrored, options);
  const expected = expectedscore(player.rating, opponent.rating, options);
  return {
    player: { ...player, rating: applydelta(player.rating, playerdelta, options.floorrating), delta: playerdelta },
    opponent: { ...opponent, rating: applydelta(opponent.rating, opponentdelta, options.floorrating), delta: opponentdelta },
    expected,
  };
}

/**
 * replays a run of matches against one rating: every step rates against the
 * running rating, so a streak compounds (or recovers) exactly as the season
 * ladder would.
 *
 * @param rating the rating entering the run.
 * @param matches the opponent rating plus outcome of every match, in order.
 * @param options the ladder config.
 * @returns the rating after the run.
 */
export function projectedrating(rating: number, matches: readonly { opponent: number; outcome: LadderOutcome }[], options: Pick<LadderOptions, "ktable" | "maxdelta" | "floorrating" | "scale">): number {
  let current = rating;
  for (const match of matches) {
    const side: LadderSide = { id: "subject", rating: current };
    const result = rankduel(side, { id: "opponent", rating: match.opponent }, match.outcome, options);
    current = result.player.rating;
  }
  return current;
}

/** validates the options shape once so every helper can trust it. */
function validateoptions(options: Pick<LadderOptions, "scale">): void {
  if (!options || !Number.isFinite(options.scale) || options.scale <= 0) {
    throw new laddererror("bad-options", options?.scale ?? null, `ladder scale must be a positive number, got ${options?.scale}`);
  }
}
