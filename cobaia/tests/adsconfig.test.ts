// # adsconfig.test — the honest ad slot registry of the family site.
// Run: pnpm vitest run tests/adsconfig.test.ts
// The suite watches the promise the ad slot makes: one reserved slot per
// content page (home, apps, blog), every slot id shipping EMPTY (no ad
// network script, no id, no key is ever committed — the loader enters after
// approval through the deploy environment), the fixed visible label, and the
// aspect-ratio shapes the containers reserve so the page never shifts.
import assert from "node:assert/strict";
import { describe, expect, it } from "vitest";
import { ADS_EMPTY, ADS_LABEL, ADSSLOTS, adsslotfor, adsslotlive } from "../adsconfig.ts";

describe("the ad slot registry", () => {
  it("reserves one slot per content page and nothing else", () => {
    assert.deepEqual(Object.keys(ADSSLOTS), ["home", "apps", "blog"]);
    assert.deepEqual(
      Object.values(ADSSLOTS).map((slot) => slot.format),
      ["display", "in-feed", "in-article"],
    );
  });

  it("ships every slot id empty — the honest placeholder", () => {
    for (const [page, slot] of Object.entries(ADSSLOTS)) {
      assert.equal(slot.slotid, "", `${page} must not carry a committed ad network id`);
      assert.equal(adsslotlive(slot), false, `${page} must read as not configured`);
    }
  });

  it("labels the container advertisement, visibly and always", () => {
    assert.equal(ADS_LABEL, "advertisement");
    assert.ok(ADS_EMPTY.length > 0);
  });

  it("reserves fixed aspect ratios so the page never shifts", () => {
    for (const slot of Object.values(ADSSLOTS)) {
      assert.match(slot.ratio, /^\d+ \/ \d+$/);
    }
  });

  it("answers the live contract on real slot ids only", () => {
    assert.equal(adsslotlive(undefined), false);
    assert.equal(adsslotlive({ slotid: "  ", format: "display", ratio: "728 / 90" }), false);
    assert.equal(adsslotlive({ slotid: "ca-pub-0000000000000000", format: "display", ratio: "728 / 90" }), true);
  });

  it("returns nothing for pages without a slot", () => {
    expect(adsslotfor("pricing")).toBeUndefined();
    expect(adsslotfor("support")).toBeUndefined();
    expect(adsslotfor("legal")).toBeUndefined();
    expect(adsslotfor("notfound")).toBeUndefined();
  });
});
