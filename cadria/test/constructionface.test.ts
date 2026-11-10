// # constructionface.test — the detailed engine law of cadria (the owner order
//   of the waves, landed): the seven composite wingets the wave rebuilt ride
//   their real engine seats — the studio bench and pipeline, the edit
//   timeline, the gallery wall, the home strip, the player viewer, the
//   settings surface — and every platform route (home behind the entry gate,
//   player, studio, edit, gallery, settings) mounts its composite with the
//   construction face carried as the arming face (the honest first paint
//   before the engine seats land), while the first-run flow (the intro with
//   its real demo chain, the onboarding, the entrada the gate reveals) rides
//   unchanged. The anchors stay thin — the one law the wave keeps: a page
//   anchor imports only the label store and the winget barrel, never the
//   engine or data modules directly (the composite wingets own that wiring),
//   the face stays a drawn scene (the rose mark with the flow band, the
//   bloom light, the scan panel, the status chip) — never a dry text notice
//   — and the design bans hold on it (fluent icons, label-store copy, no
//   emoji, no transition: all). The truth lane stays whole beneath the
//   surfaces: the versawase engine, the gateway over the site db and the
//   deterministic demo chain keep riding their own files. runnable with
//   vitest:
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

/** the platform anchors the detailed engine wave owns — home mounts the
 * HomeSurface behind the entry gate, the five surfaces mount their composites
 * bare inside the one shell, every one with the construction face as the
 * arming face under its own eyebrow from the label store. */
const ANCHORS: { route: string; file: string; eyebrow: string; mount: string }[] = [
  { route: "home", file: "../sol/home/home.tsx", eyebrow: "home.eyebrow", mount: "HomeSurface" },
  { route: "player", file: "../sol/player/player.tsx", eyebrow: "player.eyebrow", mount: "PlayerViewer" },
  { route: "studio", file: "../sol/studio/studio.tsx", eyebrow: "studio.eyebrow", mount: "StudioBench" },
  { route: "edit", file: "../sol/edit/edit.tsx", eyebrow: "edit.eyebrow", mount: "EditTimeline" },
  { route: "gallery", file: "../sol/gallery/gallery.tsx", eyebrow: "gallery.eyebrow", mount: "GalleryWall" },
  { route: "settings", file: "../sol/settings/settings.tsx", eyebrow: "settings.eyebrow", mount: "SettingsSurface" },
];

/** the composite wingets the detailed engine wave rebuilt — one mount per
 * platform surface, each carrying the construction face as its arming prop. */
const COMPOSITES: { file: string; name: string }[] = [
  { file: "../sol/wingets/StudioBench.tsx", name: "StudioBench" },
  { file: "../sol/wingets/StudioPipeline.tsx", name: "PipelineBench" },
  { file: "../sol/wingets/EditTimeline.tsx", name: "EditTimeline" },
  { file: "../sol/wingets/GalleryWall.tsx", name: "GalleryWall" },
  { file: "../sol/wingets/HomeSurface.tsx", name: "HomeSurface" },
  { file: "../sol/wingets/PlayerViewer.tsx", name: "PlayerViewer" },
  { file: "../sol/wingets/SettingsSurface.tsx", name: "SettingsSurface" },
];

/** the engine and data logics the anchors must never import directly — the
 * composite wingets own that wiring; an anchor importing one would break the
 * thin-anchor law the wave keeps. */
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

/** the platform faces the engine ban sweeps — the six routes the detailed
 * engine wave owns (the first-run flow keeps its real engine chain: the
 * onboarding hears the mic and renders with the genuine seats, the opening
 * runs the deterministic demo — real capabilities, never fake). */
const PAGE_FILES = [
  "../sol/home/home.tsx",
  "../sol/player/player.tsx",
  "../sol/studio/studio.tsx",
  "../sol/edit/edit.tsx",
  "../sol/gallery/gallery.tsx",
  "../sol/settings/settings.tsx",
];

/** the first-run flow faces — they never read the project data lane (the
 * gateway strip the home surface fetches); their engine use is real. */
const FLOW_FILES = ["../sol/intro/intro.tsx", "../sol/onboarding/onboarding.tsx", "../sol/notfound/notfound.tsx"];

describe("the detailed engine law of cadria", () => {
  it("answers every platform route with its composite winget, the construction face riding as the arming face", () => {
    for (const anchor of ANCHORS) {
      const page = read(anchor.file);
      expect(
        page.includes(`<${anchor.mount} face={`),
        `the ${anchor.route} route must mount the ${anchor.mount} composite with its arming face`,
      ).toBe(true);
      expect(page.includes("<Constructionface"), `the ${anchor.route} arming face must be the construction face`).toBe(
        true,
      );
      expect(
        page.includes(`eyebrow={label("${anchor.eyebrow}")}`),
        `the ${anchor.route} face must wear the ${anchor.eyebrow} eyebrow from the label store`,
      ).toBe(true);
      expect(
        page.includes('from "../../wingets"'),
        `the ${anchor.route} anchor must import its mount from the winget barrel`,
      ).toBe(true);
    }
    // home decides first — the surface mounts only behind the finished flow
    const home = read("../sol/home/home.tsx");
    expect(home).toMatch(/<EntryGate>/);
    expect(home.indexOf("<EntryGate>")).toBeLessThan(home.indexOf("<HomeSurface"));
    // the studio page mounts the generation bench with the pipeline below it
    const studio = read("../sol/studio/studio.tsx");
    expect(studio).toMatch(/<StudioBench face=\{/);
    expect(studio).toMatch(/<PipelineBench \/>/);
    expect(studio.indexOf("<StudioBench")).toBeLessThan(studio.indexOf("<PipelineBench"));
    // the platform pages render bare — the ONE shell chrome lives in Sol
    for (const route of ["player", "studio", "edit", "gallery", "settings"]) {
      expect(read(`../sol/${route}/${route}.tsx`)).not.toMatch(/<Shell /);
    }
  });

  it("serves every composite from the winget barrel — the dotted name lives once", () => {
    expect(BARREL).toMatch(/export \{ default as Constructionface \} from "\.\/sol\/wingets\/Constructionface\.tsx"/);
    for (const composite of COMPOSITES) {
      expect(
        BARREL.includes(`./sol/wingets/${composite.file.split("/").pop()}`),
        `the ${composite.name} composite must ride the barrel`,
      ).toBe(true);
    }
    for (const anchor of ANCHORS) {
      const page = read(anchor.file);
      expect(
        /from "\.\.\/\.\.\/sol\/wingets\//.test(page),
        `the ${anchor.route} anchor must not import a dotted winget file directly`,
      ).toBe(false);
    }
    // the intro strip the opening keeps still rides the barrel
    for (const kept of ["IntroSplash", "IntroDemo", "IntroCapabilities", "IntroFooter"]) {
      expect(BARREL.includes(kept), `the ${kept} winget of the opening stays`).toBe(true);
    }
  });

  it("keeps the anchors thin — no platform page imports the engine or data logics directly", () => {
    for (const file of PAGE_FILES) {
      const page = read(file);
      for (const engine of ENGINE_MODULES) {
        expect(
          new RegExp(`from "\\.\\./\\.\\./${engine}(\\.ts|\\.tsx)?"`).test(page),
          `${file} must not import the ${engine} logic — the composite wingets own that wiring`,
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
    // a hardcoded data array inside a platform anchor is the defect the owner
    // named: the rows answer from the db seam, never from an anchor literal
    for (const anchor of ANCHORS) {
      const page = read(anchor.file);
      expect(
        /const [A-Z][A-Z_]+: readonly \{/.test(page),
        `${anchor.file} must not carry a hardcoded data array — the rows ride the db seam`,
      ).toBe(false);
      expect(
        /useState</.test(page),
        `${anchor.file} renders no stateful rows — the anchor stays the thin face`,
      ).toBe(false);
    }
  });

  it("wires the composites onto the real engine seats — the wingets import the logics the anchors never touch", () => {
    // the gallery wall reads the gateway lane the retired face rode
    const galleryWall = read("../sol/wingets/GalleryWall.tsx");
    expect(galleryWall).toMatch(/from "\.\.\/\.\.\/gateway\.ts"/);
    // the home strip reads the same lane
    const homeSurface = read("../sol/wingets/HomeSurface.tsx");
    expect(homeSurface).toMatch(/from "\.\.\/\.\.\/gateway\.ts"/);
    // the edit timeline folds through the real edit algebra
    const editTimeline = read("../sol/wingets/EditTimeline.tsx");
    expect(editTimeline).toMatch(/from "\.\.\/\.\.\/timeline\.ts"/);
    expect(editTimeline).toMatch(/from "\.\.\/\.\.\/motion\.ts"/);
    // the studio bench rides the analysis chain and the generation fold
    const studioBench = read("../sol/wingets/StudioBench.tsx");
    expect(studioBench).toMatch(/from "\.\.\/\.\.\/(studio|gateway|image)\.ts"/);
    // the pipeline bench reads the engine tables over the gateway lane
    const pipeline = read("../sol/wingets/StudioPipeline.tsx");
    expect(pipeline).toMatch(/from "\.\.\/\.\.\/gateway\.ts"/);
    expect(pipeline).toMatch(/from "\.\.\/\.\.\/transcode\.ts"/);
    // every composite accepts the arming face prop
    for (const composite of COMPOSITES) {
      if (composite.name === "PipelineBench") continue; // the pipeline owns its own honest states
      const body = read(composite.file);
      expect(
        body.includes("face }:"),
        `the ${composite.name} composite must carry the arming face prop`,
      ).toBe(true);
    }
  });

  it("keeps the truth lane whole beneath the surfaces — the engines and the db seam stay", () => {
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
    expect(gateway).toMatch(/export async function fetchPipelineCatalog\(/);
    expect(gateway).toMatch(/export async function runGatewayPipeline\(/);
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

  it("draws the scene — the arming face is a composed visual, never a dry text notice", () => {
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

  it("holds the design bans on the arming face — fluent icons, label-store copy, no emoji", () => {
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
    // the pipeline labels the bench speaks ride the same store
    for (const key of [
      "studio.pipeline.head",
      "studio.pipeline.lede",
      "studio.pipeline.run",
      "studio.pipeline.stageDone",
      "studio.pipeline.stageSkipped",
      "studio.pipeline.stageFailed",
    ]) {
      expect(LABELS.includes(`"${key}":`), `the label store must carry the ${key} key`).toBe(true);
    }
    // no all-properties transition inside the scene pass
    const scene = CSS.slice(CSS.indexOf(".cdrconstr {"), CSS.indexOf("@keyframes cdrconstrScan"));
    expect(/transition:\s*all/.test(scene), "the scene pass never transitions all").toBe(false);
  });
});
