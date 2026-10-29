// # checkoutlinks.test — the billing configuration of the family site.
// Run: pnpm vitest run tests/checkoutlinks.test.ts
// The suite watches the promise the pricing page makes: the three plans
// exist with the placeholder prices (US$0 / 5 / 19 a month), every checkout
// href ships EMPTY so the interface renders the honest empty state instead
// of a dead link, the support channels obey the same rule, and the
// configured/not-configured contract answers only on real values.
import assert from "node:assert/strict";
import { describe, expect, it } from "vitest";
import { PLANS, SUPPORTLINKS, isconfigured, planbyid } from "../cobaia/checkoutlinks.ts";

describe("checkout links", () => {
  it("carries the three honest plans in display order", () => {
    assert.deepEqual(
      PLANS.map((plan) => plan.id),
      ["free", "pro", "studio"],
    );
    assert.deepEqual(
      PLANS.map((plan) => plan.name),
      ["Free", "Pro", "Studio"],
    );
  });

  it("prices the plans at the placeholder us$0 / 5 / 19 a month", () => {
    const prices = new Map(PLANS.map((plan) => [plan.id, plan.priceusd]));
    expect(prices.get("free")).toBe(0);
    expect(prices.get("pro")).toBe(5);
    expect(prices.get("studio")).toBe(19);
    for (const plan of PLANS) {
      assert.equal(plan.per, "month");
      assert.ok(plan.features.length >= 3, `${plan.id} must list at least three honest features`);
    }
  });

  it("ships every checkout href empty — the honest empty state", () => {
    for (const plan of PLANS) {
      assert.equal(plan.href, "", `${plan.id} must not carry a fake checkout link`);
      assert.equal(isconfigured(plan.href), false, `${plan.id} must read as not configured`);
    }
  });

  it("keeps the support channels unconfigured until the owner sets them", () => {
    assert.equal(SUPPORTLINKS.sponsors, "");
    assert.equal(SUPPORTLINKS.kofi, "");
    assert.equal(isconfigured(SUPPORTLINKS.sponsors), false);
  });

  it("answers the configured contract on real values only", () => {
    assert.equal(isconfigured(""), false);
    assert.equal(isconfigured("   "), false);
    assert.equal(isconfigured("https://buy.stripe.com/example"), true);
  });

  it("resolves plans by id and nothing else", () => {
    assert.equal(planbyid("pro")?.id, "pro");
    assert.equal(planbyid("enterprise"), undefined);
  });
});
