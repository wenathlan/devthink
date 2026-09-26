import { describe, expect, it } from "vitest";
import {
  advanceselcachegeneration,
  cacheselentry,
  invalidateselcacheonmutations,
  invalidateselcacheonnavigation,
  openselcache,
  revalidateselentry,
  selcacheentries,
  selcachelookup,
  selcachestats,
  stalegenerationfailure,
} from "../memory.js";
import { selcachegate } from "../policy.js";
import { sessionmemory } from "../memory.js";

const now = 1_800_000_000_000;

class fakeadapter {
  private readonly data = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | undefined> {
    return this.data.get(key) as T | undefined;
  }
  async set<T>(key: string, value: T): Promise<void> {
    this.data.set(key, value);
  }
}

describe("selcache hit, invalidation and revalidation", () => {
  it("caches one resolution per selector under the current generation", () => {
    let cache = openselcache("run1");
    cache = cacheselentry(cache, { selector: "#a", resolution: "resolved:#a" });
    cache = cacheselentry(cache, { selector: "#a", resolution: "resolved:#a:second" });
    expect(cache.entries).toHaveLength(1);
    expect(cache.entries[0]?.resolution).toBe("resolved:#a:second");
    expect(() => openselcache(" ")).toThrow(/run id/i);
    expect(() => cacheselentry(cache, { selector: " ", resolution: "x" })).toThrow(/selector/i);
  });

  it("advances the generation on every dom mutation batch so old hits go stale", () => {
    let cache = cacheselentry(openselcache("run1"), { selector: "#a", resolution: "resolved:#a" });
    const lookup = selcachelookup(cache, "#a");
    expect(lookup.hit).toBe(true);
    expect(lookup.stale).toBe(false);
    cache = advanceselcachegeneration(cache, now);
    const stale = selcachelookup(cache, "#a");
    expect(stale.hit).toBe(false);
    expect(stale.stale).toBe(true);
    expect(stale.reason).toMatch(/generation 0 while the run stands at generation 1/i);
    expect(selcachegate({ selector: "#a", resolution: "resolved:#a", generation: 0 }, 1).allowed).toBe(false);
    expect(selcachegate({ selector: "#a", resolution: "resolved:#a", generation: 1 }, 1).allowed).toBe(true);
  });

  it("invalidates wholesale on navigation and selectively on matching mutation fingerprints", () => {
    let cache = openselcache("run1");
    cache = cacheselentry(cache, { selector: "#header .logo", resolution: "r1" });
    cache = cacheselentry(cache, { selector: "#table .row", resolution: "r2" });
    const navigated = invalidateselcacheonnavigation(cache, now);
    expect(navigated.entries).toHaveLength(0);
    expect(navigated.invalidations[0]?.reason).toBe("navigation");
    expect(navigated.invalidations[0]?.selectors).toEqual(["#header .logo", "#table .row"]);
    const mutated = invalidateselcacheonmutations(cache, ["#header"], now);
    expect(mutated.entries.map((entry) => entry.selector)).toEqual(["#table .row"]);
    expect(mutated.invalidations[0]?.reason).toBe("mutation");
    expect(mutated.invalidations[0]?.selectors).toEqual(["#header .logo"]);
  });

  it("revalidates cached hits before the dispatch and overwrites diverging resolutions", () => {
    let cache = cacheselentry(openselcache("run1"), { selector: "#a", resolution: "resolved:#a" });
    const confirmed = revalidateselentry(cache, { selector: "#a", freshresolution: "resolved:#a" });
    expect(confirmed).toBe(cache);
    const diverged = revalidateselentry(cache, { selector: "#a", freshresolution: "resolved:#a:fresh" });
    expect(diverged.entries[0]?.resolution).toBe("resolved:#a:fresh");
    expect(diverged.entries[0]?.generation).toBe(cache.generation);
    const added = revalidateselentry(cache, { selector: "#b", freshresolution: "resolved:#b" });
    expect(added.entries.map((entry) => entry.selector)).toEqual(["#a", "#b"]);
    const stats = selcachestats(cache, [
      { hit: true, stale: false },
      { hit: false, stale: true },
      { hit: true, stale: false },
    ]);
    expect(stats).toEqual({ hits: 2, stale: 1, total: 3 });
    expect(
      selcacheentries(advanceselcachegeneration(cacheselentry(cache, { selector: "#a", resolution: "r" }), now)),
    ).toHaveLength(0);
  });

  it("reports stale generation failures with a reviewed retry hint and prunes at run end", async () => {
    const failure = stalegenerationfailure({
      stepid: "s1",
      runid: "run1",
      selector: "#a",
      entrygeneration: 0,
      currentgeneration: 3,
      now,
    });
    expect(failure.message).toMatch(/generation 0 while the run run1 stands at generation 3/i);
    expect(failure.retry.allowed).toBe(true);
    expect(failure.retry.reason).toMatch(/new reviewed dispatch/i);
    expect(failure.context).toEqual({ selector: "#a", entrygeneration: "0", currentgeneration: "3" });
    const store = new sessionmemory(new fakeadapter());
    let state = cacheselentry(openselcache("run1"), { selector: "#a", resolution: "r" });
    state = advanceselcachegeneration(state, now);
    await store.setselcachestate(state);
    expect((await store.getselcachestate("run1"))?.generation).toBe(1);
    await store.pruneselcache("run1");
    const pruned = await store.getselcachestate("run1");
    expect(pruned?.entries).toHaveLength(0);
    expect(pruned?.generation).toBe(0);
  });
});
