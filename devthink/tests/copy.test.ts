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

  it("keeps the seed as the single literal surface of the pages", () => {
    const seed = copyseed();
    assert.ok(Object.keys(seed).length >= 20, "the pages' copy rides the seed");
    for (const [key, text] of Object.entries(seed)) {
      assert.ok(/^(plans|auth|callback|settings|panel)\./.test(key), `the seed key ${key} stays scoped to its page`);
      assert.ok(text.length > 0, `the seed row ${key} carries text`);
    }
  });

  it("the provider row wears the provider button grammar — continue with google and the family, zero separator ornaments", () => {
    const brandnames = { google: "Google", github: "GitHub", gitlab: "GitLab" } as Record<string, string>;
    for (const provider of ["google", "github", "gitlab"]) {
      const label = copy(`auth.oauth.${provider}`);
      assert.equal(label, `Continue with ${brandnames[provider]}`, `the ${provider} label carries the standard button grammar`);
      assert.ok(!label.includes("·"), `the ${provider} label never carries the separator ornament`);
    }
    // the cli pairing row answers the same simple grammar the owner ordered
    assert.equal(copy("auth.cli"), "Continue with CLI");
    // the back to the clock row and the options disclosure are gone by the owner order
    assert.equal(copy("auth.signin.back"), "auth.signin.back");
    assert.equal(copy("auth.signin.options"), "auth.signin.options");
  });

  it("the callback receiving face names the provider through the slot", () => {
    assert.ok(copy("callback.received").includes("{provider}"), "the receiving face carries the provider slot");
    assert.ok(copy("callback.received.note").includes("gateway"), "the receiving face keeps the exchange honest");
  });
});
