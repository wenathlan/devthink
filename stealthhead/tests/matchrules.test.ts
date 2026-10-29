// # matchrules.test — honest unit tests for the match rules state machine,
// runnable with the vitest runner:
//   pnpm test
// The fixtures reuse the match seed rows of the root match logic.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { MATCHPLAYERSEED, MATCHSEED, type MatchLobby } from "../match.ts";
import {
  addscore,
  advancelobby,
  canlobbytransition,
  canroundtransition,
  matchruleserror,
  nextactions,
  openround,
  progressof,
  scoreround,
  seatplayers,
  transitionlobby,
} from "../matchrules.ts";

/** finds one seeded lobby by id (the tests key on the seed rows). */
function lobby(id: string): MatchLobby {
  const row = MATCHSEED.find((candidate) => candidate.id === id);
  assert.ok(row, `seed lobby ${id} missing`);
  return row;
}

describe("match rules transitions", () => {
  it("allows only the table transitions for lobbies", () => {
    assert.equal(canlobbytransition("open", "live"), true);
    assert.equal(canlobbytransition("open", "closed"), true);
    assert.equal(canlobbytransition("live", "open"), false);
    assert.equal(canlobbytransition("closed", "live"), false);
    assert.equal(canlobbytransition("closed", "closed"), false);
  });

  it("allows only pending -> live -> scored for rounds", () => {
    assert.equal(canroundtransition("pending", "live"), true);
    assert.equal(canroundtransition("live", "scored"), true);
    assert.equal(canroundtransition("pending", "scored"), false);
    assert.equal(canroundtransition("scored", "live"), false);
  });

  it("moves a lobby and never mutates the input row", () => {
    const open = lobby("m-2202");
    const live = transitionlobby(open, "live");
    assert.equal(live.state, "live");
    assert.equal(open.state, "open");
    assert.notEqual(live, open);
  });

  it("rejects a forbidden lobby transition with a typed error", () => {
    const closed = lobby("m-2204");
    assert.throws(
      () => transitionlobby(closed, "live"),
      (error: unknown) => {
        assert.ok(error instanceof matchruleserror);
        assert.equal(error.code, "bad-transition");
        assert.equal(error.lobbyid, "m-2204");
        assert.equal(error.from, "closed");
        assert.equal(error.to, "live");
        return true;
      },
    );
  });

  it("opens one pending round of a live lobby", () => {
    const seeded = lobby("m-2202");
    const live = transitionlobby(seeded, "live");
    const running = openround(live, "r-4");
    assert.equal(running.rounds.find((row) => row.id === "r-4")?.state, "live");
  });

  it("refuses to open a round while another runs or the lobby is not live", () => {
    const m2201 = lobby("m-2201");
    assert.throws(() => openround(m2201, "r-3"), matchruleserror);
    const live = transitionlobby(lobby("m-2202"), "live");
    const running = openround(live, "r-4");
    assert.throws(
      () => openround(running, "r-5"),
      (error: unknown) => {
        assert.ok(error instanceof matchruleserror);
        assert.equal(error.code, "bad-transition");
        return true;
      },
    );
    assert.throws(() => openround(transitionlobby(lobby("m-2202"), "closed"), "r-4"), matchruleserror);
  });

  it("rejects an unknown round with the unknown-round code", () => {
    const live = transitionlobby(lobby("m-2202"), "live");
    assert.throws(
      () => openround(live, "r-404"),
      (error: unknown) => {
        assert.ok(error instanceof matchruleserror);
        assert.equal(error.code, "unknown-round");
        return true;
      },
    );
  });

  it("scores the live round and the scored table rows stay scoreable by id", () => {
    const live = transitionlobby(lobby("m-2202"), "live");
    const running = openround(live, "r-4");
    const done = scoreround(running);
    assert.equal(done.rounds.find((row) => row.id === "r-4")?.state, "scored");
    const reopened = openround(done, "r-5");
    const scored = scoreround(reopened, "r-5");
    assert.equal(scored.rounds.find((row) => row.id === "r-5")?.state, "scored");
  });
});

describe("match rules capacity and scoring", () => {
  it("seats players while the capacity holds and refuses overflow", () => {
    const seated = lobby("m-2202");
    const ok = seatplayers(
      seated,
      MATCHPLAYERSEED.filter((player) => player.lobbyid === "m-2202"),
    );
    assert.equal(ok.length, 2);
    const overflow = [
      ...MATCHPLAYERSEED,
      { id: "p-99", lobbyid: "m-2202", handle: "overflow.seat", squad: "ash", score: 0, ping: 60 },
    ];
    assert.throws(
      () => seatplayers(seated, overflow),
      (error: unknown) => {
        assert.ok(error instanceof matchruleserror);
        assert.equal(error.code, "lobby-full");
        return true;
      },
    );
  });

  it("adds score, floors penalties at zero and refuses non finite deltas", () => {
    const seat = MATCHPLAYERSEED[0];
    assert.equal(addscore(seat, 120).score, seat.score + 120);
    assert.equal(addscore({ ...seat, score: 40 }, -90).score, 0);
    assert.throws(() => addscore(seat, Number.NaN), matchruleserror);
  });
});

describe("match rules tick simulator", () => {
  it("opens an open lobby on the first tick", () => {
    const result = advancelobby(lobby("m-2202"), 0, { roundbudgetseconds: 300, autoadvance: false });
    assert.equal(result.lobby.state, "live");
    assert.deepEqual(
      result.events.map((event) => event.kind),
      ["lobby-live"],
    );
  });

  it("expires a live round past its budget and autoadvances the next one", () => {
    const seeded = lobby("m-2202");
    const first = advancelobby(seeded, 0, { roundbudgetseconds: 300, autoadvance: true });
    assert.equal(first.lobby.rounds.find((row) => row.id === "r-4")?.state, "live");
    const second = advancelobby(first.lobby, 301, { roundbudgetseconds: 300, autoadvance: true });
    assert.equal(second.lobby.rounds.find((row) => row.id === "r-4")?.state, "scored");
    assert.equal(second.lobby.rounds.find((row) => row.id === "r-5")?.state, "live");
    assert.ok(second.events.some((event) => event.kind === "round-expired" && event.roundid === "r-4"));
    assert.ok(second.events.some((event) => event.kind === "round-live" && event.roundid === "r-5"));
  });

  it("closes the lobby when every round is scored", () => {
    let current = transitionlobby(lobby("m-2202"), "live");
    current = scoreround(openround(current, "r-4"));
    current = scoreround(openround(current, "r-5"));
    const ticked = advancelobby(current, 0, { roundbudgetseconds: 300, autoadvance: true });
    assert.equal(ticked.lobby.state, "closed");
    assert.deepEqual(
      ticked.events.map((event) => event.kind),
      ["lobby-closed"],
    );
  });

  it("keeps a live round inside its budget untouched", () => {
    const seeded = lobby("m-2202");
    const first = advancelobby(seeded, 0, { roundbudgetseconds: 300, autoadvance: true });
    const second = advancelobby(first.lobby, 120, { roundbudgetseconds: 300, autoadvance: true });
    assert.equal(second.lobby.state, "live");
    assert.equal(second.lobby.rounds.find((row) => row.id === "r-4")?.state, "live");
    assert.equal(second.events.length, 0);
  });

  it("refuses a bad clock or a bad budget", () => {
    assert.throws(
      () => advancelobby(lobby("m-2202"), -1, { roundbudgetseconds: 300, autoadvance: true }),
      matchruleserror,
    );
    assert.throws(
      () => advancelobby(lobby("m-2202"), 10, { roundbudgetseconds: 0, autoadvance: true }),
      matchruleserror,
    );
  });
});

describe("match rules board hints", () => {
  it("hints the board actions in lifecycle order", () => {
    assert.deepEqual(nextactions(lobby("m-2202")), ["start the match"]);
    assert.deepEqual(nextactions(lobby("m-2201")), ["score the live round"]);
    assert.deepEqual(nextactions(lobby("m-2204")), []);
  });

  it("hints the close action for a live lobby with everything scored", () => {
    const allscored: MatchLobby = {
      ...lobby("m-2202"),
      state: "live",
      rounds: lobby("m-2202").rounds.map((row) => ({ ...row, state: "scored" })),
    };
    assert.deepEqual(nextactions(allscored), ["close the lobby"]);
  });

  it("measures the scored progress of a lobby", () => {
    assert.equal(progressof(lobby("m-2201")), 33);
    assert.equal(progressof(lobby("m-2204")), 100);
    assert.equal(progressof({ ...lobby("m-2203"), rounds: [] }), 0);
  });
});
