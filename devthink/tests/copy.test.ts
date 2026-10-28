// # copy.test — the copy store law: the component never hardcodes text,
// the accessor answers the seed, the live db row overrides the seed, the
// missing key stays loud (the key itself), and the seed is the one place
// literals live for the build to bake. runnable with vitest:
// pnpm vitest run tests/copy.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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

  it("the provider row answers the icon law — the brand marks ride alone, the continue with words stay as the accessible names", () => {
    const brandnames = { google: "Google", github: "GitHub" } as Record<string, string>;
    for (const provider of ["google", "github"]) {
      const label = copy(`auth.oauth.${provider}`);
      assert.equal(
        label,
        `Continue with ${brandnames[provider]}`,
        `the ${provider} name carries the standard button grammar`,
      );
      assert.ok(!label.includes("·"), `the ${provider} name never carries the separator ornament`);
    }
    // the gitlab provider and the unconfigured hover phrase left the row by
    // the owner order — only google, github and the cli glyph answer the face
    assert.equal(copy("auth.oauth.gitlab"), "auth.oauth.gitlab");
    assert.equal(copy("auth.oauth.unconfigured"), "auth.oauth.unconfigured");
    // the cli pairing row answers the same simple grammar the owner ordered
    assert.equal(copy("auth.cli"), "Continue with CLI");
    // the continue-with headline dies with the icon-only row — the words
    // never print again (the row group keeps its own accessible name)
    assert.equal(copy("auth.oauth.headline"), "auth.oauth.headline");
    assert.ok(copy("auth.oauth.row").length > 0, "the row group keeps its accessible name");
    // the component renders the marks alone: zero visible label element,
    // zero headline element, and every icon button carries its accessible
    // name from the copy store (an icon without a name is banned)
    const source = readFileSync(join(import.meta.dirname, "..", "Sol", "widgets", "AuthProviderrow.tsx"), "utf8");
    assert.ok(!source.includes("dt-oauthrow__label"), "the visible label element is gone from the row");
    assert.ok(!source.includes("dt-oauthrow__headline"), "the headline element is gone from the row");
    assert.ok(
      source.includes("aria-label={copy(`auth.oauth.${entry.provider}`)}"),
      "every provider button carries its accessible name from the copy store",
    );
    assert.ok(
      source.includes('aria-label={copy("auth.cli")}'),
      "the cli button carries its accessible name from the copy store",
    );
    // the back to the clock row and the options disclosure are gone by the owner order
    assert.equal(copy("auth.signin.back"), "auth.signin.back");
    assert.equal(copy("auth.signin.options"), "auth.signin.options");
  });

  it("the callback receiving face names the provider through the slot", () => {
    assert.ok(copy("callback.received").includes("{provider}"), "the receiving face carries the provider slot");
    assert.ok(copy("callback.received.note").includes("gateway"), "the receiving face keeps the exchange honest");
  });
});
