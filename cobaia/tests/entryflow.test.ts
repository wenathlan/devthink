// # entryflow.test — the construction-flow contract of the cobaia: the
// standardized family law (intro → onboarding → entrada) the owner ordered
// and the db-backed content law behind it. Run: pnpm vitest run
// tests/entryflow.test.ts
//
// The suite watches three promises:
// 1. the flow — the intro mounts before the onboarding, the onboarding
//    before the gated home (the entrada), and the onboarding page marks
//    its stage through the shared onboardingstate accessor, never a local
//    flag of its own;
// 2. the db — the content_rows table exists in the runtime schema, the
//    boot seed ingests the manifest, and the rows read back carry the
//    kinds the pages render (posts, roster, plans — no hardcoded row
//    lives in a face);
// 3. the copy — every onboarding key the frames cite answers from the
//    label manifest (a hardcoded string inside a widget is a defect).
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { describe, expect, it } from "vitest";
import { LABEL_MANIFEST, type LabelKey } from "../labels.ts";
import { CONTENTKINDS, seedPosts, seedRoster, seedPlans } from "../content.ts";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const SOL = read("../sol/Sol.tsx");
const HOME = read("../sol/home/home.tsx");
const INTRO = read("../sol/intro/intro.tsx");
const ONBOARDING = read("../sol/onboarding/onboarding.tsx");
const GATE = read("../sol/wingets/HomeEntrygate.tsx");
const STATE = read("../onboardingstate.ts");
const DB = read("../db.ts");
const CSS = read("../sol/sol.css");

describe("the entry flow contract (intro → onboarding → entrada)", () => {
  it("mounts the flow before the fundamentals — intro first, onboarding second, the gated home third", () => {
    expect(SOL).toMatch(/path="\/intro"/);
    expect(SOL).toMatch(/path="\/onboarding"/);
    expect(SOL.indexOf('"/intro"')).toBeLessThan(SOL.indexOf('"/onboarding"'));
    expect(SOL.indexOf('"/onboarding"')).toBeLessThan(SOL.indexOf('"/"'));
  });

  it("rides the entrada behind the entry gate — the home renders only through the gate", () => {
    expect(HOME).toMatch(/EntryGate/);
    expect(HOME).toMatch(/<HomeSurface \/>/);
    expect(GATE).toMatch(/navigate\("\/intro"/);
    expect(GATE).toMatch(/navigate\("\/onboarding"/);
  });

  it("marks the stages through the shared db-backed accessor, never a local flag", () => {
    expect(INTRO).toMatch(/markOnboardingStage\("intro"\)/);
    expect(ONBOARDING).toMatch(/markOnboardingStage\("onboarding"\)/);
    expect(STATE).toMatch(/cobaia\.onboarding\.seen/);
    expect(STATE).toMatch(/\/api\/v1\/onboarding/);
    expect(ONBOARDING).not.toMatch(/localStorage/);
  });

  it("answers every onboarding key the frames cite from the label manifest", () => {
    const keys = [
      "onboarding.aria",
      "onboarding.title",
      "onboarding.skip",
      "onboarding.back",
      "onboarding.next",
      "onboarding.enterCta",
      "onboarding.steps.is.eyebrow",
      "onboarding.steps.is.title",
      "onboarding.steps.is.text",
      "onboarding.steps.does.eyebrow",
      "onboarding.steps.does.title",
      "onboarding.steps.does.text",
      "onboarding.steps.enter.eyebrow",
      "onboarding.steps.enter.title",
      "onboarding.steps.enter.text",
      "onboarding.facts.plans",
      "onboarding.facts.support",
      "onboarding.facts.ads",
    ] as const satisfies readonly LabelKey[];
    for (const key of keys) {
      assert.ok(
        typeof LABEL_MANIFEST[key] === "string" && LABEL_MANIFEST[key].length > 0,
        `${key} must answer from the manifest`,
      );
    }
  });

  it("styles the frames responsively with the reduced-motion stop", () => {
    expect(CSS).toMatch(/\.cb-onboard \{/);
    expect(CSS).toMatch(/@media \(max-width: 480px\)/);
    expect(CSS).toMatch(/prefers-reduced-motion: reduce/);
  });
});

describe("the content law (the rows live in the db, the manifest is the seed)", () => {
  it("carries the content_rows table in the runtime schema and the seed ingestion", () => {
    expect(DB).toMatch(/CREATE TABLE IF NOT EXISTS content_rows/);
    expect(DB).toMatch(/seedContentTable/);
    expect(DB).toMatch(/readContentRows/);
  });

  it("seeds every kind the pages render — no face answers a fixed table of its own", () => {
    assert.deepEqual([...CONTENTKINDS], [
      "posts",
      "roster",
      "plans",
      "supportlinks",
      "ads.slots",
      "ads.label",
      "ads.empty",
    ]);
    assert.ok(seedPosts.length >= 3, "the blog seed carries the family posts");
    assert.ok(seedRoster.length === 10, "the roster seed carries the ten family members");
    assert.ok(seedPlans.length === 3, "the plans seed carries the three honest plans");
  });

  it("keeps the faces reading through the typed doors — no hardcoded row in a page", () => {
    expect(HOME).toMatch(/from "\.\.\/\.\.\/roster\.ts"/);
    expect(HOME).not.toMatch(/const ROSTER/);
    expect(read("../sol/apps/apps.tsx")).not.toMatch(/const ROSTER/);
    expect(read("../sol/pricing/pricing.tsx")).not.toMatch(/const PLANS/);
    expect(read("../sol/blog/blog.tsx")).not.toMatch(/const POSTS/);
  });
});
