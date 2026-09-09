import { describe, expect, it } from "vitest";
import {
  coldstartverdict,
  durationsampleof,
  durationsampletoperf,
  selectorprofileof,
  selectorstatsupdate,
  slomopause,
  slomoresume,
  slomosessionof,
  slomostepdelay,
  spanchildren,
  startupsampleof,
  steptracefile,
  steptracespanof,
} from "../perf.js";
import { slowmofactorvalid } from "../policy.js";
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

describe("durationmeter", () => {
  it("measures every step with monotonic clocks and writes the samples into the perf records", () => {
    const sample = durationsampleof({ stepid: "s1", start: 100.5, end: 220.75 });
    expect(sample).toEqual({ stepid: "s1", start: 100.5, end: 220.75, duration: 120.25, monotonic: true });
    expect(durationsampleof({ stepid: "s1", start: 300, end: 100 }).duration).toBe(0);
    expect(durationsampleof({ stepid: "s1", start: 1, end: 2, monotonic: false }).monotonic).toBe(false);
    expect(() => durationsampleof({ stepid: " ", start: 0, end: 1 })).toThrow(/step id/i);
    const record = durationsampletoperf({
      runid: "run1",
      sample,
      queries: 2,
      cachehits: 1,
      delta: false,
      now,
      provenance: { origin: "https://example.com", environment: "pagecontext", task: "durationmeter" },
    });
    expect(record.duration).toBe(120.25);
    expect(record.provenance.task).toBe("durationmeter");
  });
});

describe("selectorprofile", () => {
  it("counts the resolution time and the failure rate per selector and flags the selectors above the user latency threshold", () => {
    const stats = selectorprofileof({
      selector: "#button",
      samples: [
        { duration: 80, ok: true },
        { duration: 120, ok: true },
        { duration: 100, ok: false },
      ],
      threshold: 90,
    });
    expect(stats).toEqual({
      selector: "#button",
      count: 3,
      totalduration: 300,
      average: 100,
      failures: 1,
      failurerate: 1 / 3,
      flagged: true,
    });
    expect(
      selectorprofileof({ selector: "#button", samples: [{ duration: 50, ok: true }], threshold: 90 }).flagged,
    ).toBe(false);
    expect(selectorprofileof({ selector: "#button", samples: [] }).count).toBe(0);
    expect(() => selectorprofileof({ selector: " ", samples: [] })).toThrow(/selector/i);
    const updated = selectorstatsupdate(stats, { selector: "#button", duration: 100, ok: true, threshold: 90 });
    expect(updated.count).toBe(4);
    expect(updated.average).toBe(100);
    expect(selectorstatsupdate(undefined, { selector: "#fresh", duration: 40, ok: true }).count).toBe(1);
  });

  it("stores the selectorprofile stats of the profile workspace", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setselectorprofile(
      selectorprofileof({ selector: "#button", samples: [{ duration: 100, ok: true }], threshold: 90 }),
    );
    expect(await store.getselectorprofiles()).toHaveLength(1);
    await store.setselectorprofile(
      selectorprofileof({ selector: "#button", samples: [{ duration: 300, ok: false }], threshold: 90 }),
    );
    const latest = (await store.getselectorprofiles()).find((stats) => stats.selector === "#button");
    expect(latest?.count).toBe(1);
    expect(latest?.failures).toBe(1);
  });
});

describe("steptrace", () => {
  it("nests spans per step and per worker task through their parent refs", () => {
    const parent = steptracespanof({ runid: "run1", stepid: "s1", start: 1, end: 5, cause: "navigate dispatch" });
    const child = steptracespanof({
      runid: "run1",
      task: "htmlsnapshot",
      start: 2,
      end: 4,
      cause: "worker parse",
      parent: parent.id,
    });
    expect(spanchildren([parent, child], parent.id)).toEqual([child]);
    expect(spanchildren([parent, child], child.id)).toEqual([]);
    expect(() => steptracespanof({ runid: " ", start: 1, end: 2, cause: "x" })).toThrow(/run id/i);
  });

  it("exports a trace file for the timeline view with its spans in start order", () => {
    const late = steptracespanof({ runid: "run1", stepid: "s2", start: 10, end: 20, cause: "click dispatch" });
    const early = steptracespanof({ runid: "run1", stepid: "s1", start: 1, end: 9, cause: "navigate dispatch" });
    const file = steptracefile({ runid: "run1", spans: [late, early] });
    expect(file.format).toBe("devthink-steptrace");
    expect(file.events).toBe(2);
    expect(file.spans.map((span) => span.stepid)).toEqual(["s1", "s2"]);
    expect(() => steptracefile({ runid: " ", spans: [] })).toThrow(/run id/i);
  });

  it("stores the steptrace spans of one run through the memory store", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addsteptracespan(
      steptracespanof({ runid: "run1", stepid: "s1", start: 1, end: 2, cause: "navigate dispatch" }),
    );
    await store.addsteptracespan(
      steptracespanof({ runid: "run1", stepid: "s2", start: 3, end: 4, cause: "click dispatch" }),
    );
    expect(await store.getsteptrace("run1")).toHaveLength(2);
    await store.clearsteptrace("run1");
    expect(await store.getsteptrace("run1")).toHaveLength(0);
  });
});

describe("startupmeter and coldstart", () => {
  it("measures the cold start from the startup event to ready with the lazymods budget spent", () => {
    const sample = startupsampleof({ startedat: now, readyat: now + 400, spent: 3, target: 500 });
    expect(sample).toEqual({ startedat: now, readyat: now + 400, duration: 400, spent: 3, target: 500 });
    expect(startupsampleof({ startedat: now, readyat: now, spent: 0 }).target).toBeUndefined();
    const verdict = coldstartverdict({ sample, heavy: ["capture", "compare"], firstpaint: ["capture"] });
    expect(verdict.withintarget).toBe(true);
    expect(verdict.heavyinfirstpaint).toEqual(["capture"]);
    const late = coldstartverdict({
      sample: startupsampleof({ startedat: now, readyat: now + 900, spent: 2, target: 500 }),
      heavy: [],
      firstpaint: [],
    });
    expect(late.withintarget).toBe(false);
    const untargeted = coldstartverdict({
      sample: startupsampleof({ startedat: now, readyat: now + 900, spent: 2 }),
      heavy: [],
      firstpaint: [],
    });
    expect(untargeted.withintarget).toBe(true);
    expect(untargeted.reason).toMatch(/no cold start target/i);
  });

  it("records the startupmeter samples of the profile workspace", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addstartupsample(startupsampleof({ startedat: now, readyat: now + 400, spent: 3 }));
    await store.addstartupsample(startupsampleof({ startedat: now, readyat: now + 300, spent: 2 }));
    const samples = await store.getstartupsamples();
    expect(samples).toHaveLength(2);
    expect(samples[0]?.duration).toBe(300);
  });
});

describe("slowmo replay", () => {
  it("replays a recorded run at the chosen speed factor with pauses between steps for inspection", () => {
    const session = slomosessionof({ runid: "run1", factor: 0.5, now });
    expect(session.factor).toBe(0.5);
    expect(slomosessionof({ runid: "run1", now }).factor).toBe(1);
    expect(() => slomosessionof({ runid: " ", now })).toThrow(/run id/i);
    expect(slomostepdelay({ factor: 0.5, duration: 1000 })).toBe(2000);
    expect(slomostepdelay({ factor: 2, duration: 1000 })).toBe(500);
    const paused = slomopause({ session, stepid: "s2", spanid: "span9" });
    expect(paused.paused).toBe(true);
    expect(paused.stepid).toBe("s2");
    expect(paused.spanid).toBe("span9");
    expect(slomoresume(paused).paused).toBe(false);
    expect(slowmofactorvalid({ factor: 0.5 }).allowed).toBe(true);
    expect(slowmofactorvalid({}).reason).toMatch(/recorded speed/i);
    expect(slowmofactorvalid({ factor: 0 }).allowed).toBe(false);
  });

  it("stores the slowmo replay sessions of the profile workspace", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setslomosession(slomosessionof({ runid: "run1", factor: 0.5, now }));
    await store.setslomosession(
      slomopause({ session: slomosessionof({ runid: "run1", factor: 0.5, now }), stepid: "s1", spanid: "span1" }),
    );
    const sessions = await store.getslomosessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0]?.paused).toBe(true);
  });
});
