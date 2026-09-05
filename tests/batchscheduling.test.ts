import { describe, expect, it } from "vitest";
import { adaptivepollnext, advancelane, batchbackpressuresignal, cadenceunderpressure, coalescefanout, coalescequeries, domainlanesfor, politedelayfor } from "../perf.js";
import { adaptivepollvalid, batchwindowvalid, domainlimitsvalid, politedelayvalid } from "../policy.js";

const now = 1_800_000_000_000;

describe("batch backpressure", () => {
  it("pauses enqueueing when the downstream steps fall behind past the user window and never drops a queued step", () => {
    const paused = batchbackpressuresignal({ runid: "run1", enqueued: 10, completed: 3, window: 5, now });
    expect(paused).toEqual({ runid: "run1", enqueued: 10, completed: 3, behind: 7, paused: true, window: 5, at: now });
    const open = batchbackpressuresignal({ runid: "run1", enqueued: 10, completed: 8, window: 5, now });
    expect(open.paused).toBe(false);
    const unbounded = batchbackpressuresignal({ runid: "run1", enqueued: 10, completed: 0, now });
    expect(unbounded.paused).toBe(false);
    expect(unbounded.window).toBeUndefined();
    expect(() => batchbackpressuresignal({ runid: " ", enqueued: 1, completed: 0, now })).toThrow(/run id/i);
    expect(batchwindowvalid({ window: 5 }).allowed).toBe(true);
    expect(batchwindowvalid({ window: 5 }).reason).toMatch(/never drops a queued step/i);
    expect(batchwindowvalid({}).reason).toMatch(/never pauses/i);
    expect(batchwindowvalid({ window: 0 }).allowed).toBe(false);
  });
});

describe("domain limits", () => {
  it("caps concurrent steps per domain at the user chosen slots and queues the overflow per lane", () => {
    const steps = [
      { id: "a1", domain: "example.com" },
      { id: "a2", domain: "example.com" },
      { id: "a3", domain: "example.com" },
      { id: "b1", domain: "shop.example" },
    ];
    const lanes = domainlanesfor({ steps, limits: { "example.com": 2 } });
    expect(lanes).toHaveLength(2);
    const example = lanes.find(lane => lane.domain === "example.com");
    expect(example?.slots).toBe(2);
    expect(example?.running).toEqual(["a1", "a2"]);
    expect(example?.queued).toEqual(["a3"]);
    const shop = lanes.find(lane => lane.domain === "shop.example");
    expect(shop?.running).toEqual(["b1"]);
    expect(shop?.queued).toEqual([]);
    const afterone = { ...example!, running: example!.running.slice(0, 1) };
    const advanced = advancelane(afterone, 1);
    expect(advanced.running).toEqual(["a1", "a3"]);
    expect(advanced.queued).toEqual([]);
    const overadvanced = advancelane(advanced, 5);
    expect(overadvanced.running).toHaveLength(2);
    expect(domainlimitsvalid({ domain: "example.com", slots: 2 }).allowed).toBe(true);
    expect(domainlimitsvalid({ domain: "example.com" }).reason).toMatch(/unbounded/i);
    expect(domainlimitsvalid({ domain: "example.com", slots: 0 }).allowed).toBe(false);
  });
});

describe("politedelay", () => {
  it("spaces batch requests per domain with jitter and honors the per domain floors", () => {
    expect(politedelayfor({ domain: "example.com", base: 500, jitter: 200, roll: 0.5 })).toBe(600);
    expect(politedelayfor({ domain: "example.com", base: 500, jitter: 200, roll: 0 })).toBe(500);
    expect(politedelayfor({ domain: "example.com", base: 100, floor: 400, jitter: 0, roll: 1 })).toBe(400);
    expect(politedelayfor({ domain: "example.com", base: 0, roll: 0 })).toBe(0);
    expect(() => politedelayfor({ domain: " ", base: 1, roll: 0 })).toThrow(/domain/i);
    expect(politedelayvalid({ domain: "example.com", base: 500, jitter: 200 }).allowed).toBe(true);
    expect(politedelayvalid({ domain: "example.com" }).reason).toMatch(/unspaced/i);
    expect(politedelayvalid({ domain: "example.com", base: -1 }).allowed).toBe(false);
  });
});

describe("adaptivepoll", () => {
  it("widens the interval while observations stay unchanged and narrows it when changes resume", () => {
    const window = { floor: 100, ceiling: 1600, growth: 2 };
    expect(adaptivepollnext({ interval: 100, window, changed: false })).toBe(200);
    expect(adaptivepollnext({ interval: 1600, window, changed: false })).toBe(1600);
    expect(adaptivepollnext({ interval: 400, window, changed: true })).toBe(200);
    expect(adaptivepollnext({ interval: 100, window, changed: true })).toBe(100);
    expect(adaptivepollnext({ interval: 500, window: { ...window, growth: 1 }, changed: false })).toBe(500);
    expect(adaptivepollvalid({ window }).allowed).toBe(true);
    expect(adaptivepollvalid({}).reason).toMatch(/fixed/i);
    expect(adaptivepollvalid({ window: { floor: 200, ceiling: 100, growth: 2 } }).allowed).toBe(false);
    expect(adaptivepollvalid({ window: { floor: 100, ceiling: 200, growth: 1 } }).allowed).toBe(false);
  });
});

describe("requestcoalesce", () => {
  it("merges identical pending queries into one dispatch and fans the single result out to every waiter", () => {
    const merged = coalescequeries({ requests: [
      { key: "run1:https://example.com/data", waiter: "s1" },
      { key: "run1:https://example.com/data", waiter: "s2" },
      { key: "run1:https://example.com/data", waiter: "s2" },
      { key: "run1:https://example.com/other", waiter: "s3" },
    ] });
    expect(merged).toHaveLength(2);
    const first = merged.find(entry => entry.key === "run1:https://example.com/data");
    expect(first?.waiters).toEqual(["s1", "s2"]);
    expect(first?.dispatched).toBe(true);
    const fanout = coalescefanout(first!, { ok: true });
    expect(fanout).toEqual([{ waiter: "s1", result: { ok: true } }, { waiter: "s2", result: { ok: true } }]);
  });
});

describe("cadence under memory pressure", () => {
  it("lowers the snapshot frequency under memory pressure and restores it when the pressure clears", () => {
    const base = { base: 500, current: 500, pressure: false };
    const pressured = cadenceunderpressure({ control: base, pressure: true, widening: 2 });
    expect(pressed(pressured));
    expect(pressured.current).toBe(1000);
    expect(pressured.pressure).toBe(true);
    const held = cadenceunderpressure({ control: pressured, pressure: true, widening: 2 });
    expect(held.current).toBe(1000);
    const cleared = cadenceunderpressure({ control: pressured, pressure: false, widening: 2 });
    expect(cleared.current).toBe(500);
    expect(cleared.pressure).toBe(false);
    const nowidening = cadenceunderpressure({ control: base, pressure: true });
    expect(nowidening.current).toBe(500);
  });
});

function pressed(control: { base: number; current: number; pressure: boolean }): boolean {
  return control.current >= control.base;
}
