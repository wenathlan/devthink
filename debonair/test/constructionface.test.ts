// # constructionface.test — the construction law of debonair (the owner
//   order of the waves, pinned): the app is in construction — the detailed
//   engine wave builds the debonair and the cadria later, with the time
//   their engines, protocols and processes deserve — so the visible
//   platform surface is ONE component (the Constructionface winget) and
//   every platform route (home behind the entry gate, studio, generate,
//   ingest, library, settings) answers it under its own eyebrow, while the
//   first-run flow (the intro, the onboarding, the entrada the gate
//   reveals) rides unchanged. The old premature surfaces (the prompt-first
//   landing, the DAW console, the composer loop, the decomposition bench,
//   the shelf, the preferences) are retired: no sol page imports the
//   engine or data modules any more, the face is a drawn scene (the amber
//   mark, the bloom light, the scan panel, the status chip) — never a dry
//   text notice — and the design bans hold on it (fluent icons,
//   label-store copy, no emoji, no transition: all). The truth lane stays
//   whole beneath the face: the engine logics and the db seam keep riding
//   their own files untouched, so the day the detailed wave lands the
//   faces read their rows from the database again. runnable with vitest:
//   pnpm test
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const FACE = read("../sol/wingets/Constructionface.tsx");
const BARREL = read("../wingets.ts");
const LABELS = read("../labels.ts");
const CSS = read("../sol/sol.css");
const SOL = read("../sol/Sol.tsx");
const INTRO = read("../sol/intro/intro.tsx");
const ONBOARDING = read("../sol/onboarding/onboarding.tsx");
const GATE = read("../sol/wingets/HomeEntrygate.tsx");
const PLAYERBAR = read("../sol/wingets/ShellPlayerbar.tsx");

/** the platform anchors the construction face owns — home mounts it behind
 * the entry gate, the five surfaces mount it inside the shell, every one
 * under its own eyebrow from the label store. */
const ANCHORS: { route: string; file: string; eyebrow: string }[] = [
  { route: "home", file: "../sol/home/home.tsx", eyebrow: "home.eyebrow" },
  { route: "studio", file: "../sol/studio/studio.tsx", eyebrow: "studio.eyebrow" },
  { route: "generate", file: "../sol/generate/generate.tsx", eyebrow: "generate.eyebrow" },
  { route: "ingest", file: "../sol/ingest/ingest.tsx", eyebrow: "ingest.eyebrow" },
  { route: "library", file: "../sol/library/library.tsx", eyebrow: "library.eyebrow" },
  { route: "settings", file: "../sol/settings/settings.tsx", eyebrow: "settings.eyebrow" },
];

/** the engine and data logics that stay real beneath the face — a sol page
 * importing any of them would be a premature surface rendering as if the
 * detailed engine wave had already shipped. */
const ENGINE_MODULES = [
  "arrangement",
  "audio",
  "catalog",
  "composer",
  "dawview",
  "genrematrix",
  "katexis",
  "mixergraph",
  "pianoroll",
  "playerbus",
  "rhythmgrammar",
  "timelinemodel",
  "seed",
];

/** the page anchors the engine ban sweeps — the faces the visitor sees. */
const PAGE_FILES = [
  "../sol/home/home.tsx",
  "../sol/studio/studio.tsx",
  "../sol/generate/generate.tsx",
  "../sol/ingest/ingest.tsx",
  "../sol/library/library.tsx",
  "../sol/settings/settings.tsx",
  "../sol/intro/intro.tsx",
  "../sol/onboarding/onboarding.tsx",
  "../sol/notfound/notfound.tsx",
];

/** the platform faces the hardcoded-data ban sweeps — the six routes the
 * construction face owns (the first-run flow keeps its step ladder: the
 * intro and the onboarding are flow structure, never data rows). */
const DATA_FACE_FILES = ANCHORS.map((anchor) => anchor.file);

describe("the construction law of debonair", () => {
  it("answers every platform route with the one construction face under its own eyebrow", () => {
    for (const anchor of ANCHORS) {
      const page = read(anchor.file);
      expect(page.includes("<Constructionface"), `the ${anchor.route} route must render the construction face`).toBe(
        true,
      );
      expect(
        page.includes(`eyebrow={label("${anchor.eyebrow}")}`),
        `the ${anchor.route} face must wear the ${anchor.eyebrow} eyebrow from the label store`,
      ).toBe(true);
      expect(
        page.includes('from "../../wingets"'),
        `the ${anchor.route} anchor must import the face from the winget barrel`,
      ).toBe(true);
    }
    // home decides first — the face mounts only behind the finished flow
    const home = read("../sol/home/home.tsx");
    expect(home).toMatch(/<EntryGate>/);
    expect(home.indexOf("<EntryGate>")).toBeLessThan(home.indexOf("<Constructionface"));
    // the five surfaces ride the app shell — the rail and the transport stay
    for (const route of ["studio", "generate", "ingest", "library", "settings"]) {
      expect(read(`../sol/${route}/${route}.tsx`)).toMatch(/<Shell /);
    }
  });

  it("serves the face from the winget barrel — the dotted name lives once", () => {
    expect(BARREL).toMatch(/export \{ default as Constructionface \} from "\.\/sol\/wingets\/Constructionface\.tsx"/);
    for (const anchor of ANCHORS) {
      const page = read(anchor.file);
      expect(
        /from "\.\.\/\.\.\/sol\/wingets\/Constructionface/.test(page),
        `the ${anchor.route} anchor must not import the dotted winget file directly`,
      ).toBe(false);
      expect(
        /from "\.\.\/\.\.\/sol\/wingets\/Constructionface/.test(page),
        `the ${anchor.route} anchor must not import the dotted winget file directly`,
      ).toBe(false);
    }
    // the retired page furniture left with the faces that rendered it
    for (const retired of ["HomeGenrecard", "HomeSongcard", "StudioFader", "StudioTimeline"]) {
      expect(BARREL.includes(retired), `the retired ${retired} winget must not ride the barrel`).toBe(false);
    }
  });

  it("retires the premature surfaces — no sol page imports the engine or data logics any more", () => {
    for (const file of PAGE_FILES) {
      const page = read(file);
      for (const engine of ENGINE_MODULES) {
        expect(
          new RegExp(`from "\\.\\./\\.\\./${engine}(\\.ts)?"`).test(page),
          `${file} must not import the ${engine} logic — the premature surfaces are retired`,
        ).toBe(false);
      }
    }
    // a hardcoded data array inside a platform face is the defect the owner
    // named: the rows answer from the db seam, never from a component literal
    for (const file of DATA_FACE_FILES) {
      const page = read(file);
      expect(
        /const [A-Z][A-Z_]+: readonly \{/.test(page),
        `${file} must not carry a hardcoded data array — the rows ride the db seam`,
      ).toBe(false);
      expect(/useState</.test(page), `${file} renders no stateful rows — the face is the one construction surface`).toBe(
        false,
      );
    }
    // the retired landing never mounts the hero stage directly again
    expect(read("../sol/home/home.tsx").includes("HERO_WAVE")).toBe(false);
  });

  it("keeps the truth lane whole beneath the face — the engines and the db seam stay", () => {
    // the engine seats keep riding their own files at the app root
    const katexis = read("../katexis.ts");
    expect(katexis).toMatch(/export const MASTERING/);
    const arrangement = read("../arrangement.ts");
    expect(arrangement).toMatch(/export function planTake\(/);
    // the catalog seam keeps answering every table through the one lane (the
    // site db over HTTPS when configured, the seed rows offline)
    const catalog = read("../catalog.ts");
    expect(catalog).toMatch(/export function listLibraryTracks\(\): Promise<LibraryTrackRow\[]>/);
    expect(catalog).toMatch(/export function listVitrineTracks\(\): Promise<VitrineTrackRow\[]>/);
    expect(catalog.includes("function table<T>(name: string, seeds: readonly T[])")).toBe(true);
    // the db keeps seeding the first-run rows from the seed module
    const db = read("../db.ts");
    expect(db).toMatch(/seedLibraryTracks/);
    expect(db).toMatch(/seedVitrineTracks|seedTimelineTracks/);
    // the seed never fakes a published take — the honest empty vitrine
    const seed = read("../seed.ts");
    expect(seed.includes("export const seedVitrineTracks: readonly VitrineTrackRow[] = []")).toBe(true);
  });

  it("rides the first-run flow — the intro, the onboarding, then the entrada", () => {
    // the intro marks its stage seen and hands the surface to the onboarding
    expect(INTRO).toMatch(/markIntroSeen\(\)/);
    expect(INTRO).toMatch(/"\/onboarding"/);
    // the onboarding marks its stage seen and enters the platform home
    expect(ONBOARDING).toMatch(/markOnboardingSeen\(\)/);
    expect(ONBOARDING).toMatch(/navigate\("\/"\)/);
    // the gate only reads: an unseen intro hands to /intro, an unseen
    // onboarding to /onboarding, the finished flow reveals the entrada
    expect(GATE).toMatch(/navigate\("\/intro", \{ replace: true \}\)/);
    expect(GATE).toMatch(/navigate\("\/onboarding", \{ replace: true \}\)/);
    // the route tree keeps both stages before the home
    expect(SOL).toMatch(/<Route path="\/intro" component=\{IntroAnchor\} \/>/);
    expect(SOL).toMatch(/<Route path="\/onboarding" component=\{OnboardingAnchor\} \/>/);
    expect(SOL.indexOf('path="/intro"')).toBeLessThan(SOL.indexOf('path="/onboarding"'));
    expect(SOL.indexOf('path="/onboarding"')).toBeLessThan(SOL.indexOf('path="/" component={HomeAnchor}'));
  });

  it("draws the scene — the face is a composed visual, never a dry text notice", () => {
    // the app's own identity rides the panel: the drawn amber mark
    expect(FACE).toMatch(/<DebonairMark size=\{88\} \/>/);
    expect(FACE).toMatch(/dbnconstr__light/);
    expect(FACE).toMatch(/dbnconstr__mark/);
    // the honest status chip with its pulsing dot
    expect(FACE).toMatch(/dbnconstr__chip/);
    expect(FACE).toMatch(/dbnconstr__pulsedot/);
    // the reveal stagger answers the shared observer of the route tree
    expect(FACE).toMatch(/className="eyebrow reveal"/);
    // the stylesheet carries the scene pass of the face
    for (const rule of [
      ".dbnconstr ",
      ".dbnconstr__light",
      ".dbnconstr__panel",
      ".dbnconstr__chip",
      ".dbnconstr__pulsedot",
      ".dbnconstr__cue",
    ]) {
      expect(CSS.includes(rule), `the stylesheet must carry ${rule}`).toBe(true);
    }
    expect(CSS).toMatch(/@keyframes dbnconstrScan/);
    expect(CSS).toMatch(/@keyframes dbnconstrPulse/);
    // the reduced-motion pass stills the scene
    expect(CSS).toMatch(/\.dbnconstr__panel::before,\s*\n\s*\.dbnconstr__pulsedot \{\s*\n\s*animation: none;/);
  });

  it("keeps the shell chrome honest — the transport renders nothing while no take rides the bus", () => {
    // the player bar is the shared transport of the app frame: with the
    // platform in construction nothing enqueues a take, and the bar answers
    // null instead of faking a deck
    expect(PLAYERBAR).toMatch(/view\.takes\.length === 0\) return null/);
  });

  it("holds the design bans on the face — fluent icons, label-store copy, no emoji", () => {
    // the icon rides the fluent family, never a drawn emoji
    expect(FACE).toMatch(/import \{ HomeRegular \} from "@fluentui\/react-icons"/);
    // every word the face renders rides the label store — no hardcoded copy
    for (const key of [
      "construction.aria",
      "construction.title",
      "construction.status",
      "construction.subtitle",
      "construction.action",
      "construction.replay",
    ]) {
      expect(FACE.includes(`label("${key}")`), `the face must speak through the ${key} label`).toBe(true);
      expect(LABELS.includes(`"${key}":`), `the label store must carry the ${key} key`).toBe(true);
    }
    expect(/>\s*[A-Za-z][^<>{}]*</.test(FACE), "no literal text node rides the face outside the store").toBe(false);
    // the honest voice of the law, pinned verbatim
    expect(LABELS).toMatch(/"construction\.status": "in construction"/);
    for (const anchor of ANCHORS) {
      expect(LABELS.includes(`"${anchor.eyebrow}":`), `the label store must carry the ${anchor.eyebrow} eyebrow`).toBe(
        true,
      );
    }
    // no all-properties transition inside the scene pass
    const scene = CSS.slice(CSS.indexOf(".dbnconstr {"), CSS.indexOf("@keyframes dbnconstrScan"));
    expect(/transition:\s*all/.test(scene), "the scene pass never transitions all").toBe(false);
  });
});
