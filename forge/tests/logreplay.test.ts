/**
 * logreplay.test.ts — the seeded replay contract of the forge console:
 * the same seed and tick answer the same lines, the level carries the
 * health rung and the keep cap holds the console bounded.
 */
import { describe, expect, it } from "vitest";
import { seedFleet } from "../fleet.ts";
import { logreplay, REPLAY_SEEDS, replaycount } from "../logreplay.ts";

const FLEET_SIZE = 8;

describe("the log replay", () => {
  it("answers the same lines for the same seed and tick", () => {
    const fleet = seedFleet(REPLAY_SEEDS[0], FLEET_SIZE);
    const first = logreplay(fleet, REPLAY_SEEDS[0], 12);
    const second = logreplay(fleet, REPLAY_SEEDS[0], 12);
    expect(second).toEqual(first);
  });

  it("carries the level from the health rung and never an empty text", () => {
    const fleet = seedFleet(REPLAY_SEEDS[1], FLEET_SIZE);
    const lines = logreplay(fleet, REPLAY_SEEDS[1], 6);
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) {
      expect(["info", "warn", "error"]).toContain(line.level);
      expect(line.text.length).toBeGreaterThan(0);
      expect(line.clock).toMatch(/^t\d{3}\.\d{2}$/);
    }
  });

  it("keeps the console bounded at the keep cap", () => {
    const fleet = seedFleet(REPLAY_SEEDS[2], FLEET_SIZE);
    const capped = logreplay(fleet, REPLAY_SEEDS[2], 30, 40);
    expect(capped.length).toBeLessThanOrEqual(40);
    const tiny = logreplay(fleet, REPLAY_SEEDS[2], 30, 5);
    expect(tiny.length).toBe(5);
  });

  it("counts the lines per level and skips offline runners", () => {
    const fleet = seedFleet(REPLAY_SEEDS[0], FLEET_SIZE);
    const lines = logreplay(fleet, REPLAY_SEEDS[0], 4);
    const counts = replaycount(lines);
    expect(counts.info + counts.warn + counts.error).toBe(lines.length);
    expect(lines.some((line) => line.text.includes("offline"))).toBe(false);
  });
});
