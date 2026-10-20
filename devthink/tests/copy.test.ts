// # copy.test — the copy store law: the component never hardcodes text,
// the accessor answers the seed, the live db row overrides the seed, the
// missing key stays loud (the key itself), and the seed is the one place
// literals live for the build to bake. runnable with vitest:
// pnpm vitest run tests/copy.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { copy, copyseed } from "../copy.ts";

describe("the copy store", () => {
  it("answers the seed through the accessor (the offline build law)", () => {
    assert.equal(copy("plans.title"), "Plans and payment");
    assert.ok(copy("plans.lede").includes("no limits"));
  });

  it("stays loud on a missing key (never a blank)", () => {
    assert.equal(copy("plans.no.such.key"), "plans.no.such.key");
  });

  it("keeps the seed as the single literal surface of the page", () => {
    const seed = copyseed();
    assert.ok(Object.keys(seed).length >= 20, "the plans page copy rides the seed");
    for (const [key, text] of Object.entries(seed)) {
      assert.ok(key.startsWith("plans."), `the seed key ${key} stays scoped to its page`);
      assert.ok(text.length > 0, `the seed row ${key} carries text`);
    }
  });
});
