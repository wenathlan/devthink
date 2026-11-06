/**
 * entryflow.test.ts — the entry-flow law of the os (the owner order of the
 * waves, pinned): the devthink is the working platform — the real entry
 * into what works — so its faces stay the honest surfaces they are while
 * the debonair and the cadria ride the construction pass. The law this
 * battery pins: the first-run chain answers intro → onboarding → entrada
 * (the "/" intro resolves the build target and consults the catalogued
 * onboarding state before it plays, the onboarding marks its stage seen
 * through the one accessor and hands the surface to the explore entrada,
 * the route tree keeps the chain), the visible faces read their rows
 * through the data seams (the intro SaaS sections import the saascontent
 * data layer — never a row literal inside the tsx — and the explore
 * entrada loads its gallery through the catalog accessors), and every
 * catalog accessor answers through the one db lane (the site database over
 * HTTPS when the endpoint is paired, the reviewed seeds offline — the
 * doctrine the catalog header carries: the interface never hardcodes data
 * in components). runnable with vitest:
 *   pnpm vitest run tests/entryflow.test.ts
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const SOL = read("../sol/Sol.tsx");
const INTRO = read("../sol/intro/intro.tsx");
const ONBOARDING = read("../sol/onboarding/onboarding.tsx");
const EXPLORE = read("../sol/explore/explore.tsx");
const SAAS_SECTIONS = read("../sol/wingets/IntroSaassections.tsx");
const CATALOG = read("../catalog.ts");
const ONBOARDINGSTATE = read("../onboardingstate.ts");

/** the faces the data-seam law sweeps — the visible surfaces of the os. */
const FACES = [
  "../sol/wingets/IntroSaassections.tsx",
  "../sol/explore/explore.tsx",
  "../sol/plans/plans.tsx",
  "../sol/chat/chat.tsx",
  "../sol/files/files.tsx",
];

describe("the entry flow of the os", () => {
  it("rides the first-run chain — the intro, the onboarding, then the entrada", () => {
    // the intro consults the catalogued onboarding state before it plays and
    // marks its stage through the one writer when the visitor enters
    expect(INTRO).toMatch(/readonboardingstate\(\)/);
    expect(INTRO).toMatch(/writeonboardingstage\("intro"\)/);
    // the handover respects the build target: the login face for the web
    // targets, the desktop for the owned ones
    expect(INTRO).toMatch(/export function introhandover\(target: IntroTarget\): string/);
    expect(INTRO).toMatch(/return target === "desktop" \|\| target === "installer" \? "\/panel" : "\/auth";/);
    // the onboarding marks its stage seen and hands the surface to the
    // explore entrada
    expect(ONBOARDING).toMatch(/export const ONBOARDING_HANDOVER = "\/explore";/);
    expect(ONBOARDING).toMatch(/writeonboardingstage\("onboarding"\)/);
    // the route tree keeps every stage of the chain
    expect(SOL).toMatch(/<Route path="\/" component=\{IntroAnchor\} \/>/);
    expect(SOL).toMatch(/<Route path="\/onboarding" component=\{OnboardingAnchor\} \/>/);
    expect(SOL).toMatch(/<Route path="\/explore" component=\{ExploreAnchor\} \/>/);
    expect(SOL).toMatch(/<Route path="\/auth" component=\{AuthAnchor\} \/>/);
    expect(SOL).toMatch(/<Route path="\/panel" component=\{PanelAnchor\} \/>/);
  });

  it("keeps the one writer of the seen flags — the catalogued onboarding state", () => {
    // the accessor owns the flags: the faces only read and mark through it
    expect(ONBOARDINGSTATE).toMatch(/export type VisitorOnboarding = \{/);
    expect(ONBOARDINGSTATE).toMatch(/onboardingseen: boolean/);
    expect(ONBOARDINGSTATE).toMatch(/export async function readonboardingstate\(\)/);
    expect(ONBOARDINGSTATE).toMatch(/export async function writeonboardingstage\(/);
  });

  it("reads the rows through the data seams — no face carries a row literal", () => {
    // the intro SaaS sections import the saascontent data layer: the rows
    // live in the content module, the tsx never declares a data array
    expect(SAAS_SECTIONS).toMatch(/from "\.\.\/\.\.\/saascontent\.ts"/);
    expect(/const [A-Z][A-Z_]+_?(ROWS|TRACKS|PROJECTS|CARDS|METRICS): readonly \{/.test(SAAS_SECTIONS)).toBe(false);
    // the explore entrada loads its gallery through the catalog accessors
    expect(EXPLORE).toMatch(/from "\.\.\/\.\.\/catalog"/);
    // the faces never declare runtime data rows inside the tsx — the label
    // key maps the copy laws allow (the words answer the stores) stay
    for (const face of FACES) {
      const source = read(face);
      expect(
        /const [A-Z][A-Z_]+_?(ROWS|TRACKS|PROJECTS|CARDS|METRICS|SAMPLES|DEMO): readonly \{/.test(source),
        `${face} must not carry a hardcoded runtime data array — the rows ride the data seams`,
      ).toBe(false);
    }
  });

  it("answers every catalog accessor through the one db lane", () => {
    // the catalog lane: the site database over HTTPS when the endpoint is
    // paired, the reviewed seeds offline — one lane for every table
    expect(CATALOG).toMatch(/async function catalogRows<T>\(kind: CatalogKind, seeds: T\[\]\): Promise<T\[\]> \{/);
    expect(CATALOG).toMatch(/const base = \(import\.meta\.env\.VITE_CATALOG_URL as string \| undefined\)/);
    // the accessors the faces read answer through the lane
    for (const accessor of [
      "export function nativeApps(): Promise<NativeApp[]>",
      "export function runnerBinaries(): Promise<RunnerBinary[]>",
      "export function studioAssets(): Promise<StudioAsset[]>",
      "export function studioTracks(): Promise<StudioTrack[]>",
    ]) {
      expect(CATALOG.includes(accessor), `the catalog must carry ${accessor}`).toBe(true);
      expect(
        CATALOG.slice(CATALOG.indexOf(accessor)).split("\n").slice(0, 3).join("\n").includes("catalogRows("),
        `${accessor} must answer through the catalogRows lane`,
      ).toBe(true);
    }
    // the offline answer is the reviewed seed, never an invented row
    expect(CATALOG).toMatch(/export const seedRecipes: Recipe\[\] = \[\]/);
  });
});
