// # copy.test — the copy store law: the component never hardcodes text,
// the accessor answers the seed, the live db row overrides the seed, the
// missing key stays loud (the key itself), and the seed is the one place
// literals live for the build to bake. The provider row reads as a
// structural contract too: the owner icon-only law — the auth box wears
// only the glyphs, the words ride the aria-label and title surfaces.
// runnable with vitest:
// pnpm vitest run tests/copy.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";
import { copy, copyseed } from "../copy.ts";

/** the provider row source, read once: the icon-only law is asserted
 * against the bytes the build ships — the visible label spans and the
 * headline paragraph are gone, the names ride the aria/title surface of
 * the cells (the honest structural form of testing the row law). */
const providerrow = readFileSync(new URL("../Sol/widgets/AuthProviderrow.tsx", import.meta.url), "utf8");

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

  it("the provider row wears the icon-only grammar — the glyphs ride the cells, the words ride the aria and title surfaces", () => {
    const brandnames = { google: "Google", github: "GitHub", gitlab: "GitLab" } as Record<string, string>;
    for (const provider of ["google", "github", "gitlab"]) {
      const label = copy(`auth.oauth.${provider}`);
      assert.equal(
        label,
        `Continue with ${brandnames[provider]}`,
        `the ${provider} name carries the standard button grammar`,
      );
      assert.ok(!label.includes("·"), `the ${provider} name never carries the separator ornament`);
    }
    // the cli pairing cell answers the same simple grammar the owner ordered
    assert.equal(copy("auth.cli"), "Continue with CLI");
    // the back to the clock row and the options disclosure are gone by the owner order
    assert.equal(copy("auth.signin.back"), "auth.signin.back");
    assert.equal(copy("auth.signin.options"), "auth.signin.options");
    // the owner icon-only law, against the shipped source: zero visible
    // labels — the names ride the aria-label and title of the cells, the
    // glyphs keep their spans
    assert.equal(providerrow.includes("dt-oauthrow__label"), false, "no visible label span rides the row");
    assert.equal(providerrow.includes("dt-oauthrow__headline"), false, "the headline paragraph left the row");
    assert.ok(
      providerrow.includes('role="group" aria-label={copy("auth.oauth.headline")}'),
      "the row keeps its group name on the aria surface",
    );
    assert.ok(
      /aria-label=\{copy\(`auth\.oauth\.\$\{entry\.provider\}`\)\}/.test(providerrow),
      "the provider name rides the aria surface",
    );
    assert.ok(
      /title=\{entry\.ready \? copy\(`auth\.oauth\.\$\{entry\.provider\}`\) : copy\("auth\.oauth\.unconfigured"\)\}/.test(
        providerrow,
      ),
      "the provider title keeps the honest unconfigured verdict",
    );
    assert.ok(providerrow.includes('aria-label={copy("auth.cli")}'), "the cli name rides the aria surface");
    assert.ok(providerrow.includes('title={copy("auth.cli")}'), "the cli name rides the title surface");
    assert.ok(providerrow.includes("dt-oauthrow__glyph"), "the glyph spans keep riding the cells");
  });

  it("the callback receiving face names the provider through the slot", () => {
    assert.ok(copy("callback.received").includes("{provider}"), "the receiving face carries the provider slot");
    assert.ok(copy("callback.received.note").includes("gateway"), "the receiving face keeps the exchange honest");
  });
});
