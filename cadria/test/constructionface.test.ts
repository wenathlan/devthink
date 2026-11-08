// # constructionface.test — the construction law of cadria (the owner order
//   of the waves, pinned): the app is in construction — the detailed engine
//   wave builds the debonair and the cadria later, with the time their
//   engines, protocols and processes deserve — so the visible platform
//   surface is ONE component (the Constructionface winget) and every
//   platform route (home behind the entry gate, player, studio, edit,
//   gallery, settings) answers it under its own eyebrow, while the
//   first-run flow (the intro with its real demo chain, the onboarding,
//   the entrada the gate reveals) rides unchanged. The old premature
//   surfaces (the greeting home, the disc player, the studio panes, the
//   timeline editor, the gallery shelves, the preferences) are retired: no
//   sol page imports the engine or data modules any more, the face is a
//   drawn scene (the rose mark with the flow band, the bloom light, the
//   scan panel, the status chip) — never a dry text notice — and the
//   design bans hold on it (fluent icons, label-store copy, no emoji, no
//   transition: all). The truth lane stays whole beneath the face: the
//   versawase engine, the gateway over the site db and the deterministic
//   demo chain keep riding their own files untouched, so the day the
//   detailed wave lands the faces read their rows from the database
//   again. runnable with vitest:
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

/** the platform anchors the construction face owns — home mounts it behind
 * the entry gate, the five surfaces mount it bare inside the one shell,
 * every one under its own eyebrow from the label store. */
const ANCHORS: { route: string; file: string; eyebrow: string }[] = [
  { route: "home", file: "../sol/home/home.tsx", eyebrow: "home.eyebrow" },
  { route: "player", file: "../sol/player/player.tsx", eyebrow: "player.eyebrow" },
  { route: "studio", file: "../sol/studio/studio.tsx", eyebrow: "studio.eyebrow" },
  { route: "edit", file: "../sol/edit/edit.tsx", eyebrow: "edit.eyebrow" },
  { route: "gallery", file: "../sol/gallery/gallery.tsx", eyebrow: "gallery.eyebrow" },
  { route: "settings", file: "../sol/settings/settings.tsx", eyebrow: "settings.eyebrow" },
];

/** the engine and data logics that stay real beneath the face — a sol page
 * importing any of them would be a premature surface rendering as if the
 * detailed engine wave had already shipped. */
const ENGINE_MODULES = [
  "gateway",
  "image",
  "introfixtures",
  "studio",
  "synth",
  "timeline",
  "motion",
  "video",
];

/** the platform faces the engine ban sweeps — the six routes the
 * construction face owns (the first-run flow keeps its real engine chain:
 * the onboarding hears the mic and renders with the genuine seats, the
 * opening runs the deterministic demo — real capabilities, never fake). */
const PAGE_FILES = [
  "../sol/home/home.tsx",
  "../sol/player/player.tsx",
  "../sol/studio/studio.tsx",
  "../sol/edit/edit.tsx",
  "../sol/gallery/gallery.tsx",
  "../sol/settings/settings.tsx",
];

/** the first-run flow faces — they never read the project data lane (the
 * gateway strip the retired home fetched); their engine use is real. */
const FLOW_FILES = ["../sol/intro/intro.tsx", "../sol/onboarding/onboarding.tsx", "../sol/notfound/notfound.tsx"];

/** the platform faces the hardcoded-data ban sweeps — the six routes the
 * construction face owns (the first-run flow keeps its step ladder and the
 * intro keeps its nav map: flow structure, never data rows). */
const DATA_FACE_FILES = ANCHORS.filter((anchor) => anchor.route !== "home").map((anchor) => anchor.file);

describe("the construction law of cadria", () => {
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
    // the platform pages render bare — the ONE shell chrome lives in Sol
    for (const route of ["player", "studio", "edit", "gallery", "settings"]) {
      expect(read(`../sol/${route}/${route}.tsx`)).not.toMatch(/<Shell /);
    }
  });

  it("serves the face from the winget barrel — the dotted name lives once", () => {
    expect(BARREL).toMatch(/export \{ default as Constructionface \} from "\.\/sol\/wingets\/Constructionface\.tsx"/);
    for (const anchor of ANCHORS) {
      const page = read(anchor.file);
      expect(
        /from "\.\.\/wingets\/Constructionface/.test(page),
        `the ${anchor.route} anchor must not import the dotted winget file directly`,
      ).toBe(false);
      expect(
        /from "\.\.\/\.\.\/sol\/wingets\/Constructionface/.test(page),
        `the ${anchor.route} anchor must not import the dotted winget file directly`,
      ).toBe(false);
    }
    // the retired page furniture left with the faces that rendered it
    for (const retired of ["StudioControls", "StudioSourcerail", "StudioStageart", "ShellEmptystate"]) {
      expect(BARREL.includes(retired), `the retired ${retired} winget must not ride the barrel`).toBe(false);
    }
    // the intro strip the opening keeps still rides the barrel
    for (const kept of ["IntroSplash", "IntroDemo", "IntroCapabilities", "IntroFooter"]) {
      expect(BARREL.includes(kept), `the ${kept} winget of the opening stays`).toBe(true);
    }
  });

  it("retires the premature surfaces — no platform page imports the engine or data logics any more", () => {
    for (const file of PAGE_FILES) {
      const page = read(file);
      for (const engine of ENGINE_MODULES) {
        expect(
          new RegExp(`from "\\.\\./\\.\\./${engine}(\\.ts|\\.tsx)?"`).test(page),
          `${file} must not import the ${engine} logic — the premature surfaces are retired`,
        ).toBe(false);
      }
    }
    // the first-run flow never reads the project data lane
    for (const file of FLOW_FILES) {
      expect(
        read(file).includes('from "../../gateway'),
        `${file} must not import the gateway data lane`,
      ).toBe(false);
    }
    // a hardcoded data array inside a platform face is the defect the owner
    // named: the rows answer from the db seam, never from a component literal
    for (const file of DATA_FACE_FILES) {
      const page = read(file);
      expect(
        /const [A-Z][A-Z_]+: readonly \{/.test(page),
        `${file} must not carry a hardcoded data array — the rows ride the db seam`,
      ).toBe(false);
      expect(
        /useState</.test(page),
        `${file} renders no stateful rows — the face is the one construction surface`,
      ).toBe(false);
    }
    // the retired home never fetches the gateway strip directly again
    expect(read("../sol/home/home.tsx").includes("listGatewayProjects")).toBe(false);
  });

  it("keeps the truth lane whole beneath the face — the engines and the db seam stay", () => {
    // the engine seats keep riding their own files at the folder root
    const image = read("../image.ts");
    expect(image).toMatch(/export function renderSvg\(/);
    const synth = read("../synth.ts");
    expect(synth.length).toBeGreaterThan(0);
    const timeline = read("../timeline.ts");
    expect(timeline.length).toBeGreaterThan(0);
    // the gateway keeps answering the project rows over the site db
    const gateway = read("../gateway.ts");
    expect(gateway).toMatch(/export async function listGatewayProjects\(/);
    // the db keeps seeding the first-run rows from the seed module
    const db = read("../db.ts");
    expect(db).toMatch(/export function seedIfEmpty\(\): void/);
    expect(db).toMatch(/export function projectRows\(/);
    // the deterministic demo chain the intro runs stays real
    const fixtures = read("../introfixtures.ts");
    expect(fixtures).toMatch(/export function demoFixtures\(\)/);
  });

  it("rides the first-run flow — the intro, the onboarding, then the entrada", () => {
    // the intro marks its stage seen through the one accessor
    expect(INTRO).toMatch(/markOnboardingStage\("intro"\)/);
    expect(INTRO).toMatch(/href="\/onboarding"/);
    // the onboarding marks its stage seen and enters the platform home
    expect(ONBOARDING).toMatch(/markOnboardingStage\("onboarding"\)/);
    expect(ONBOARDING).toMatch(/navigate\("\/"\)/);
    // the gate only reads: an unseen intro hands to /intro, an unseen
    // onboarding to /onboarding, the finished flow reveals the entrada
    expect(GATE).toMatch(/navigate\("\/intro", \{ replace: true \}\)/);
    expect(GATE).toMatch(/navigate\("\/onboarding", \{ replace: true \}\)/);
    // the route tree keeps both stages before the home
    expect(SOL).toMatch(/<Route path="\/intro" component=\{IntroAnchor\} \/>/);
    expect(SOL).toMatch(/<Route path="\/onboarding" component=\{OnboardingAnchor\} \/>/);
    const platform = SOL.slice(SOL.indexOf("function Platform()"));
    expect(platform.indexOf('path="/onboarding"')).toBeLessThan(platform.indexOf("component={HomeGate}"));
  });

  it("draws the scene — the face is a composed visual, never a dry text notice", () => {
    // the app's own identity rides the panel: the drawn rose mark with the
    // flow band travelling inside the glyph strokes
    expect(FACE).toMatch(/<CadriaMark size=\{88\} flow \/>/);
    expect(FACE).toMatch(/cdrconstr__light/);
    expect(FACE).toMatch(/cdrconstr__mark/);
    // the honest status chip with its pulsing dot
    expect(FACE).toMatch(/cdrconstr__chip/);
    expect(FACE).toMatch(/cdrconstr__pulsedot/);
    // the reveal stagger answers the shared observer of the route tree
    expect(FACE).toMatch(/className="eyebrow reveal"/);
    // the stylesheet carries the scene pass of the face
    for (const rule of [
      ".cdrconstr ",
      ".cdrconstr__light",
      ".cdrconstr__panel",
      ".cdrconstr__chip",
      ".cdrconstr__pulsedot",
      ".cdrconstr__cue",
    ]) {
      expect(CSS.includes(rule), `the stylesheet must carry ${rule}`).toBe(true);
    }
    expect(CSS).toMatch(/@keyframes cdrconstrScan/);
    expect(CSS).toMatch(/@keyframes cdrconstrPulse/);
    // the reduced-motion pass stills the scene
    expect(CSS).toMatch(/\.cdrconstr__panel::before,\s*\n\s*\.cdrconstr__pulsedot \{\s*\n\s*animation: none;/);
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
    const scene = CSS.slice(CSS.indexOf(".cdrconstr {"), CSS.indexOf("@keyframes cdrconstrScan"));
    expect(/transition:\s*all/.test(scene), "the scene pass never transitions all").toBe(false);
  });
});
