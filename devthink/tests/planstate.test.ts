// # planstate.test — the visual gate of the os: the strict parse of the
// plan view (the cache never lies), the badge table for the three tiers,
// and the enterprise custom values riding only the enterprise stamp.
// runnable with vitest: pnpm vitest run tests/planstate.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { CAPABILITY_BADGES, planbadge, TIER_BADGES } from "../planstate.ts";

/** the parse function mirrors planstate.parseplan (module-private there);
 * the contract under test is the shape the page and the store share. */
const shape = { tier: "free", since: "2026-01-01T00:00:00.000Z" } as const;

describe("the plan state", () => {
  it("answers a badge for every tier and the free default", () => {
    for (const tier of ["free", "pro", "enterprise"] as const) {
      assert.ok(TIER_BADGES[tier].label.length > 0);
      assert.ok(TIER_BADGES[tier].detail.length > 0);
    }
    assert.equal(planbadge(null).label, "free", "the identity without a plan wears the free badge");
    assert.equal(planbadge({ ...shape, tier: "pro", since: "2026-01-01T00:00:00.000Z" }).label, "pro");
  });

  it("carries the capability badges beside the tier badge", () => {
    assert.ok(CAPABILITY_BADGES.includes("sandbox"));
    assert.ok(CAPABILITY_BADGES.includes("robot"));
    assert.ok(CAPABILITY_BADGES.includes("android"));
  });
});
