/**
 * matchrules.ts — the pure rules layer of the stealthhead match domain (root layer).
 *
 * the state machine under the match page: the valid transitions of lobby and
 * round, the round clock with its expiry budget, the seat scoring and the
 * next-action hints the board renders. every function is pure and multi-mode —
 * the same call runs in the browser (the match page reads the hints through
 * Sol/stealthhead/match) and in node (the unit tests), with zero DOM and zero
 * storage. the rules carry no rows: the match seed and the HTTPS accessor stay
 * in match.ts, this file only judges the shapes those rows move through.
 */
import type { MatchLobby, MatchPlayer, MatchRound } from "./match.ts";

/** the lobby lifecycle states (the same union the MatchLobby row carries). */
export type LobbyState = MatchLobby["state"];

/** the round lifecycle states (the same union the MatchRound row carries). */
export type RoundState = MatchRound["state"];

/** the machine readable failure codes of the match rules. */
export type matchruleserrorcode = "bad-transition" | "unknown-round" | "lobby-full" | "closed-lobby" | "bad-input";

/** the typed match rules failure, traceable to the lobby and both states. */
export class matchruleserror extends Error {
  /** machine readable failure code. */
  readonly code: matchruleserrorcode;
  /** the lobby the failure belongs to (when known). */
  readonly lobbyid: string | null;
  /** the state the move came from (when known). */
  readonly from: LobbyState | RoundState | null;
  /** the requested target state (when known). */
  readonly to: LobbyState | RoundState | null;

  constructor(
    code: matchruleserrorcode,
    lobbyid: string | null,
    from: LobbyState | RoundState | null,
    to: LobbyState | RoundState | null,
    message?: string,
  ) {
    super(
      message ??
        `match rules ${code} for lobby ${lobbyid ?? "?"}${from === null ? "" : ` (from ${from})`}${to === null ? "" : ` to ${to}`}`,
    );
    this.name = "matchruleserror";
    this.code = code;
    this.lobbyid = lobbyid;
    this.from = from;
    this.to = to;
  }
}

/** the lobby transition table: which target states each state may reach. */
export const LOBBYTRANSITIONS: Readonly<Record<LobbyState, readonly LobbyState[]>> = {
  open: ["live", "closed"],
  live: ["closed"],
  closed: [],
};

/** the round transition table: which target states each state may reach. */
export const ROUNDTRANSITIONS: Readonly<Record<RoundState, readonly RoundState[]>> = {
  pending: ["live"],
  live: ["scored"],
  scored: [],
};

/** one machine step of the lobby simulator: what happened and to which row. */
export type MatchEvent = {
  kind: "lobby-live" | "lobby-closed" | "round-live" | "round-scored" | "round-expired";
  /** the lobby the event belongs to. */
  lobbyid: string;
  /** the round the event belongs to (round events only). */
  roundid?: string;
};

/** the options of the lobby simulator tick. */
export type AdvanceOptions = {
  /** the seconds a live round may run before it expires (the caller owns the clock). */
  roundbudgetseconds: number;
  /** whether the next pending round opens right after one is scored or expires. */
  autoadvance: boolean;
};

/** one next-action hint the match board renders for a lobby. */
export type MatchAction = "start the match" | "open the next round" | "score the live round" | "close the lobby";

/**
 * checks whether a lobby may move from one state to another.
 *
 * @param from the current lobby state.
 * @param to the requested lobby state.
 * @returns true when the transition table allows the move.
 */
export function canlobbytransition(from: LobbyState, to: LobbyState): boolean {
  return LOBBYTRANSITIONS[from].includes(to);
}

/**
 * checks whether a round may move from one state to another.
 *
 * @param from the current round state.
 * @param to the requested round state.
 * @returns true when the transition table allows the move.
 */
export function canroundtransition(from: RoundState, to: RoundState): boolean {
  return ROUNDTRANSITIONS[from].includes(to);
}

/**
 * moves a lobby to a new state when the table allows it.
 *
 * @param lobby the lobby to move.
 * @param to the requested state.
 * @returns the moved lobby (a new row — the input is never mutated).
 */
export function transitionlobby(lobby: MatchLobby, to: LobbyState): MatchLobby {
  if (!canlobbytransition(lobby.state, to)) {
    throw new matchruleserror("bad-transition", lobby.id, lobby.state, to);
  }
  return { ...lobby, state: to };
}

/**
 * opens one pending round of a live lobby: only one round may be live at a
 * time and the lobby itself must be live.
 *
 * @param lobby the lobby holding the round.
 * @param roundid the round to open.
 * @returns the lobby with the round live (a new row).
 */
export function openround(lobby: MatchLobby, roundid: string): MatchLobby {
  if (lobby.state !== "live") {
    throw new matchruleserror("bad-transition", lobby.id, lobby.state, "live", `match rules round ${roundid} needs a live lobby, got ${lobby.state}`);
  }
  const round = lobby.rounds.find((row) => row.id === roundid);
  if (!round) throw new matchruleserror("unknown-round", lobby.id, null, null, `match rules round ${roundid} is not seated in lobby ${lobby.id}`);
  if (!canroundtransition(round.state, "live")) {
    throw new matchruleserror("bad-transition", lobby.id, round.state, "live", `match rules round ${roundid} cannot move from ${round.state} to live`);
  }
  if (lobby.rounds.some((row) => row.state === "live")) {
    throw new matchruleserror("bad-transition", lobby.id, "live", "live", `match rules lobby ${lobby.id} already runs a live round`);
  }
  return withround(lobby, roundid, { ...round, state: "live" });
}

/**
 * scores the live round of a lobby (or one named round).
 *
 * @param lobby the lobby holding the round.
 * @param roundid the round to score (the live one when omitted).
 * @returns the lobby with the round scored (a new row).
 */
export function scoreround(lobby: MatchLobby, roundid?: string): MatchLobby {
  const round = roundid ? lobby.rounds.find((row) => row.id === roundid) : lobby.rounds.find((row) => row.state === "live");
  if (!round) throw new matchruleserror("unknown-round", lobby.id, null, null, `match rules no scoreable round in lobby ${lobby.id}`);
  if (!canroundtransition(round.state, "scored")) {
    throw new matchruleserror("bad-transition", lobby.id, round.state, "scored", `match rules round ${round.id} cannot move from ${round.state} to scored`);
  }
  return withround(lobby, round.id, { ...round, state: "scored" });
}

/**
 * seats players into a lobby against its capacity.
 *
 * @param lobby the lobby to seat into.
 * @param players the players already seated plus the newcomers.
 * @returns the same rows when the capacity holds.
 */
export function seatplayers(lobby: MatchLobby, players: MatchPlayer[]): MatchPlayer[] {
  if (players.length > lobby.capacity) {
    throw new matchruleserror("lobby-full", lobby.id, null, null, `match rules lobby ${lobby.id} seats ${lobby.capacity}, got ${players.length}`);
  }
  return players;
}

/**
 * adds points to one seat, floored at zero (a penalty never goes negative).
 *
 * @param player the seat to score.
 * @param points the points to add (negative for penalties).
 * @returns the seat with the new score (a new row).
 */
export function addscore(player: MatchPlayer, points: number): MatchPlayer {
  if (!Number.isFinite(points)) throw new matchruleserror("bad-input", player.lobbyid, null, null, `match rules seat ${player.id} got a non finite score delta`);
  return { ...player, score: Math.max(0, player.score + points) };
}

/**
 * advances one lobby by one tick of the caller clock: the live round expires
 * past its budget, the next pending round opens on autoadvance and the lobby
 * closes when every round is scored. pure — the caller keeps the clock.
 *
 * @param lobby the lobby to advance.
 * @param seconds the seconds the live round has run so far.
 * @param options the budget and the autoadvance flag.
 * @returns the new lobby plus the events the tick produced.
 */
export function advancelobby(lobby: MatchLobby, seconds: number, options: AdvanceOptions): { lobby: MatchLobby; events: MatchEvent[] } {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new matchruleserror("bad-input", lobby.id, null, null, `match rules tick needs seconds >= 0, got ${seconds}`);
  }
  if (!Number.isFinite(options.roundbudgetseconds) || options.roundbudgetseconds <= 0) {
    throw new matchruleserror("bad-input", lobby.id, null, null, `match rules tick needs a round budget > 0, got ${options.roundbudgetseconds}`);
  }
  let current = lobby;
  const events: MatchEvent[] = [];
  if (lobby.state === "open") {
    current = transitionlobby(current, "live");
    events.push({ kind: "lobby-live", lobbyid: lobby.id });
  }
  if (current.state === "live") {
    const live = current.rounds.find((row) => row.state === "live");
    if (live && seconds > options.roundbudgetseconds) {
      current = withround(current, live.id, { ...live, state: "scored" });
      events.push({ kind: "round-expired", lobbyid: lobby.id, roundid: live.id });
    }
    if (options.autoadvance && !current.rounds.some((row) => row.state === "live")) {
      const next = current.rounds.find((row) => row.state === "pending");
      if (next) {
        current = withround(current, next.id, { ...next, state: "live" });
        events.push({ kind: "round-live", lobbyid: lobby.id, roundid: next.id });
      }
    }
    if (current.rounds.every((row) => row.state === "scored")) {
      current = transitionlobby(current, "closed");
      events.push({ kind: "lobby-closed", lobbyid: lobby.id });
    }
  }
  return { lobby: current, events };
}

/**
 * lists the next-action hints of a lobby for the match board.
 *
 * @param lobby the lobby to inspect.
 * @returns the actions in the order the board should show them.
 */
export function nextactions(lobby: MatchLobby): MatchAction[] {
  if (lobby.state === "closed") return [];
  if (lobby.state === "open") return ["start the match"];
  const live = lobby.rounds.some((row) => row.state === "live");
  const pending = lobby.rounds.some((row) => row.state === "pending");
  if (live) return ["score the live round"];
  return pending ? ["open the next round"] : ["close the lobby"];
}

/**
 * measures the progress of a lobby as the scored share of its rounds.
 *
 * @param lobby the lobby to measure.
 * @returns the 0-100 percentage of scored rounds.
 */
export function progressof(lobby: MatchLobby): number {
  if (lobby.rounds.length === 0) return 0;
  return Math.round((lobby.rounds.filter((row) => row.state === "scored").length / lobby.rounds.length) * 100);
}

/** replaces one round of a lobby without mutating the input. */
function withround(lobby: MatchLobby, roundid: string, round: MatchRound): MatchLobby {
  return { ...lobby, rounds: lobby.rounds.map((row) => (row.id === roundid ? round : row)) };
}
