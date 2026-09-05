import { describe, expect, it } from "vitest";
import { blackboardsections, boardsummary, emptyboard, entryfresh, inheritconsent, postentry, readentries, retireentries, retireentry } from "../swarm.js";
import type { blackboard } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one board fixture with the four shared sections. */
function board(over: Partial<blackboard> = {}): blackboard {
  return { sections: [...blackboardsections], entries: [], ...over };
}

describe("blackboard post and read", () => {
  it("posts an entry to a section with the author and the consent class", () => {
    const posted = postentry({ board: board(), id: "e1", key: "pricing.url", value: "https://example.com/pricing", section: "facts", author: "a1", now });
    expect(posted.entries).toHaveLength(1);
    expect(posted.entries[0]).toMatchObject({ key: "pricing.url", author: "a1", section: "facts", consentclass: "read", valuekind: "text" });
  });

  it("refuses entries without a key, a value, an author or with a json value that does not parse", () => {
    expect(() => postentry({ board: board(), id: "e1", key: " ", value: "v", section: "facts", author: "a1", now })).toThrow(/key/i);
    expect(() => postentry({ board: board(), id: "e1", key: "k", value: " ", section: "facts", author: "a1", now })).toThrow(/value/i);
    expect(() => postentry({ board: board(), id: "e1", key: "k", value: "v", section: "facts", author: " ", now })).toThrow(/author/i);
    expect(() => postentry({ board: board(), id: "e1", key: "k", value: "v", section: "secret" as never, author: "a1", now })).toThrow(/sections/i);
    expect(() => postentry({ board: board(), id: "e1", key: "k", value: "{not json", section: "facts", author: "a1", valuekind: "json", now })).toThrow(/json/i);
    const valid = postentry({ board: board(), id: "e1", key: "rows", value: "[1,2]", section: "findings", author: "a1", valuekind: "json", now });
    expect(valid.entries[0]?.valuekind).toBe("json");
  });

  it("reads the entries of one section with the freshness filter", () => {
    let state = postentry({ board: board(), id: "e1", key: "goal", value: "Extract the pricing", section: "goals", author: "user", now });
    state = postentry({ board: state, id: "e2", key: "fact", value: "The table has 40 rows", section: "facts", author: "a1", now: now + 1_000 });
    state = postentry({ board: state, id: "e3", key: "late", value: "Found the totals", section: "findings", author: "a2", now: now + 10_000 });
    expect(readentries({ board: state, now: now + 20_000 })).toHaveLength(3);
    expect(readentries({ board: state, section: "facts", now: now + 20_000 }).map(entry => entry.key)).toEqual(["fact"]);
    const fresh = readentries({ board: state, now: now + 20_000, freshness: 11_000 });
    expect(fresh.map(entry => entry.key)).toEqual(["late"]);
    expect(entryfresh(state.entries[0]!, now + 20_000, 5_000)).toBe(false);
    expect(entryfresh(state.entries[0]!, now + 20_000, 15_000)).toBe(true);
    expect(entryfresh(state.entries[0]!, now + 20_000)).toBe(true);
  });
});

describe("blackboard retirement", () => {
  it("retires the stale entries by the user configured window and never without one", () => {
    let state = postentry({ board: board({ retirementwindow: 10_000 }), id: "e1", key: "old", value: "Stale fact", section: "facts", author: "a1", now });
    state = postentry({ board: state, id: "e2", key: "new", value: "Fresh fact", section: "facts", author: "a1", now: now + 15_000 });
    const outcome = retireentries({ board: state, now: now + 20_000 });
    expect(outcome.retired).toEqual(["e1"]);
    expect(outcome.board.entries.find(entry => entry.id === "e1")?.retiredat).toBe(now + 20_000);
    expect(readentries({ board: outcome.board, now: now + 20_000 }).map(entry => entry.id)).toEqual(["e2"]);
    const kept = retireentries({ board: board(), now: now + 100_000 });
    expect(kept.retired).toEqual([]);
  });

  it("retires one entry by its id while the stored entry stays for the audit trail", () => {
    let state = postentry({ board: board(), id: "e1", key: "scratch.note", value: "Try the second page", section: "scratch", author: "a1", now });
    state = retireentry({ board: state, entryid: "e1", now: now + 1_000 });
    expect(state.entries[0]?.retiredat).toBe(now + 1_000);
    expect(readentries({ board: state, now: now + 2_000 })).toHaveLength(0);
    expect(() => retireentry({ board: state, entryid: "e1", now: now + 3_000 })).toThrow(/already retired/i);
    expect(() => retireentry({ board: state, entryid: "missing", now })).toThrow(/does not exist/i);
  });
});

describe("blackboard cross agent visibility and consent", () => {
  it("makes the writes of one agent visible to every agent of the swarm", () => {
    let state = postentry({ board: board(), id: "e1", key: "goal", value: "Extract the pricing", section: "goals", author: "a1", now });
    state = postentry({ board: state, id: "e2", key: "finding", value: "The table paginates", section: "findings", author: "a2", now: now + 1 });
    const readera = readentries({ board: state, now });
    const readerb = readentries({ board: state, now });
    expect(readera).toEqual(readerb);
    expect(readera.map(entry => entry.author)).toEqual(["a2", "a1"]);
  });

  it("inherits the consent class of the source extraction into the entry", () => {
    const posted = postentry({ board: board(), id: "e1", key: "form.values", value: "The form carried the address", section: "findings", author: "a1", consentclass: "sensitive", now });
    expect(posted.entries[0]?.consentclass).toBe("sensitive");
    const inherited = inheritconsent(posted.entries[0]!, "interaction");
    expect(inherited.consentclass).toBe("interaction");
    expect(posted.entries[0]?.consentclass).toBe("sensitive");
  });

  it("summarizes the sections with the authors and the freshest posting time", () => {
    let state = postentry({ board: board(), id: "e1", key: "goal", value: "Extract", section: "goals", author: "user", now });
    state = postentry({ board: state, id: "e2", key: "fact", value: "40 rows", section: "facts", author: "a1", now: now + 1_000 });
    const summary = boardsummary(state, now + 2_000);
    expect(summary.find(section => section.section === "goals")).toMatchObject({ entries: 1, authors: ["user"], freshestat: now });
    expect(summary.find(section => section.section === "facts")?.authors).toEqual(["a1"]);
    expect(summary.find(section => section.section === "scratch")).toMatchObject({ entries: 0, authors: [] });
  });
});
