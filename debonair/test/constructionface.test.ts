// # constructionface.test — the detailed engine law of debonair (the owner
//   order of the waves, landed): the five composite wingets the wave rebuilt
//   ride their real engine seats — the landing strip of the home, the
//   decomposition bench of the ingest, the library shelf, the composer loop
//   of the generate and the preferences surface — beside the DAW console the
//   studio wave landed before them, and every platform route (home behind
//   the entry gate, studio, generate, ingest, library, settings) mounts its
//   composite with the construction face carried as the arming face (the
//   honest first paint before the engine seats land), while the first-run
//   flow (the intro, the onboarding, the entrada the gate reveals) rides
//   unchanged. The anchors stay thin — the one law the wave keeps: a page
//   anchor imports only the label store, the shell and the winget barrel,
//   never the engine or data modules directly (the composite wingets own
//   that wiring), the face stays a drawn scene (the amber mark, the bloom
//   light, the scan panel, the status chip) — never a dry text notice —
//   and the design bans hold on it (fluent icons, label-store copy, no
//   emoji, no transition: all). The truth lane stays whole beneath the
//   surfaces: the kathesis engine, the catalog seam over the site db, the
//   ingest store, the generate client and the take store keep riding their
//   own files. runnable with vitest:
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

/** the platform anchors the detailed engine wave owns — home mounts the
 * HomeSurface behind the entry gate, the four surfaces mount their
 * composites inside the app shell, every one with the construction face as
 * the arming face under its own eyebrow from the label store. */
const ANCHORS: { route: string; file: string; eyebrow: string; mount: string }[] = [
  { route: "home", file: "../sol/home/home.tsx", eyebrow: "home.eyebrow", mount: "HomeSurface" },
  { route: "generate", file: "../sol/generate/generate.tsx", eyebrow: "generate.eyebrow", mount: "GenerateSurface" },
  { route: "ingest", file: "../sol/ingest/ingest.tsx", eyebrow: "ingest.eyebrow", mount: "IngestSurface" },
  { route: "library", file: "../sol/library/library.tsx", eyebrow: "library.eyebrow", mount: "LibrarySurface" },
  { route: "settings", file: "../sol/settings/settings.tsx", eyebrow: "settings.eyebrow", mount: "SettingsSurface" },
];

/** the composite wingets the detailed engine wave rebuilt — one mount per
 * platform surface, each carrying the construction face as its arming
 * prop. */
const COMPOSITES: { file: string; name: string }[] = [
  { file: "../sol/wingets/HomeSurface.tsx", name: "HomeSurface" },
  { file: "../sol/wingets/GenerateSurface.tsx", name: "GenerateSurface" },
  { file: "../sol/wingets/IngestSurface.tsx", name: "IngestSurface" },
  { file: "../sol/wingets/LibrarySurface.tsx", name: "LibrarySurface" },
  { file: "../sol/wingets/SettingsSurface.tsx", name: "SettingsSurface" },
];

/** the engine and data logics the anchors must never import directly — the
 * composite wingets own that wiring; an anchor importing one would break
 * the thin-anchor law the wave keeps. */
const ENGINE_MODULES = [
  "arrangement",
  "audio",
  "catalog",
  "cleanurl",
  "composer",
  "dawview",
  "generateclient",
  "genre",
  "genrematrix",
  "ingest",
  "katexis",
  "mixergraph",
  "motionpref",
  "pianoroll",
  "playerbus",
  "rhythmgrammar",
  "seed",
  "take",
  "theme",
  "timelinemodel",
  "version",
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
 * detailed engine wave owns (the first-run flow keeps its step ladder: the
 * intro and the onboarding are flow structure, never data rows). */
const DATA_FACE_FILES = ANCHORS.map((anchor) => anchor.file);

describe("the detailed engine law of debonair", () => {
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
    // the studio route keeps the DAW console the studio wave landed — its
    // own geometry (the console import rides the winget file directly)
    const studio = read("../sol/studio/studio.tsx");
    expect(studio).toMatch(/<StudioConsole face=\{/);
    expect(studio).toMatch(/<Constructionface eyebrow=\{label\("studio\.eyebrow"\)\} \/>/);
    // the five shell surfaces ride the app shell — the rail and the
    // transport stay; the home owns its shell inside the winget (the
    // full-bleed landing behind the gate)
    for (const route of ["generate", "ingest", "library", "settings"]) {
      expect(read(`../sol/${route}/${route}.tsx`)).toMatch(/<Shell /);
    }
    const homeSurface = read("../sol/wingets/HomeSurface.tsx");
    expect(homeSurface).toMatch(/<Shell\s*\n?\s*name="debonair"/);
  });

  it("serves every composite from the winget barrel — the dotted name lives once", () => {
    expect(BARREL).toMatch(/export \{ default as Constructionface \} from "\.\/sol\/wingets\/Constructionface\.tsx"/);
    for (const composite of COMPOSITES) {
      expect(
        BARREL.includes(`export { ${composite.name} } from "./sol/wingets/${composite.file.split("/").pop()}"`),
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
    // the chrome the app frame keeps rides the barrel beside the composites
    for (const kept of ["Constructionface", "HomeEntrygate", "ShellPlayerbar"]) {
      expect(BARREL.includes(kept), `the ${kept} chrome of the app frame stays`).toBe(true);
    }
    // the page furniture the composites render keeps riding its own winget
    // files (imported by the composites that own the wiring) — never the
    // barrel, whose surface stays the composites and the chrome
    for (const furniture of ["HomeGenrecard", "HomeSongcard", "StudioFader", "StudioTimeline", "HomeCoverart"]) {
      expect(
        new RegExp(`export .*${furniture}`).test(BARREL),
        `the ${furniture} furniture must not ride the barrel — the composites import it`,
      ).toBe(false);
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
    // a hardcoded data array inside a platform anchor is the defect the owner
    // named: the rows answer from the db seam, never from an anchor literal
    for (const file of DATA_FACE_FILES) {
      const page = read(file);
      expect(
        /const [A-Z][A-Z_]+: readonly \{/.test(page),
        `${file} must not carry a hardcoded data array — the rows ride the db seam`,
      ).toBe(false);
      expect(/useState</.test(page), `${file} renders no stateful rows — the anchor stays the thin face`).toBe(false);
    }
    // the retired landing never mounts the hero stage directly again
    expect(read("../sol/home/home.tsx").includes("HERO_WAVE")).toBe(false);
  });

  it("wires the composites onto the real engine seats — the wingets import the logics the anchors never touch", () => {
    // the landing strip reads the catalog seam and the engine matrix
    const homeSurface = read("../sol/wingets/HomeSurface.tsx");
    expect(homeSurface).toMatch(/from "\.\.\/\.\.\/catalog\.ts"/);
    expect(homeSurface).toMatch(/from "\.\.\/\.\.\/genre\.ts"/);
    expect(homeSurface).toMatch(/from "\.\.\/\.\.\/arrangement\.ts"/);
    expect(homeSurface).toMatch(/from "\.\.\/\.\.\/playerbus\.ts"/);
    // the composer loop rides the generate client lane over the ingest records
    const generateSurface = read("../sol/wingets/GenerateSurface.tsx");
    expect(generateSurface).toMatch(/from "\.\.\/\.\.\/generateclient\.ts"/);
    expect(generateSurface).toMatch(/from "\.\.\/\.\.\/ingest\.ts"/);
    expect(generateSurface).toMatch(/from "\.\.\/\.\.\/(genre|arrangement|take|playerbus)\.ts"/);
    // the bench decomposes through the real ingest engine
    const ingestSurface = read("../sol/wingets/IngestSurface.tsx");
    expect(ingestSurface).toMatch(/from "\.\.\/\.\.\/ingest\.ts"/);
    expect(ingestSurface).toMatch(/decompose\(|ingestPcm\(/);
    expect(ingestSurface).toMatch(/from "\.\.\/\.\.\/kathesis\.ts"/);
    // the shelf reads the take store, the reference store and the catalog seam
    const librarySurface = read("../sol/wingets/LibrarySurface.tsx");
    expect(librarySurface).toMatch(/from "\.\.\/\.\.\/catalog\.ts"/);
    expect(librarySurface).toMatch(/from "\.\.\/\.\.\/take\.ts"/);
    expect(librarySurface).toMatch(/from "\.\.\/\.\.\/playerbus\.ts"/);
    // the preferences answer the theme, the motion flag, the catalog seam
    // and the canonical version module
    const settingsSurface = read("../sol/wingets/SettingsSurface.tsx");
    expect(settingsSurface).toMatch(/from "\.\.\/\.\.\/theme\.ts"/);
    expect(settingsSurface).toMatch(/from "\.\.\/\.\.\/motionpref\.ts"/);
    expect(settingsSurface).toMatch(/from "\.\.\/\.\.\/cleanurl\.ts"/);
    expect(settingsSurface).toMatch(/from "\.\.\/\.\.\/version\.ts"/);
    expect(settingsSurface).not.toMatch(/const VERSION = "2\./);
    // every composite accepts the arming face prop
    for (const composite of COMPOSITES) {
      const body = read(composite.file);
      expect(body.includes("face }:"), `the ${composite.name} composite must carry the arming face prop`).toBe(true);
    }
  });

  it("keeps the truth lane whole beneath the surfaces — the engines and the db seam stay", () => {
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
    expect(catalog).toMatch(/export function listGenreProfileCards\(\): Promise<GenreProfileCard\[]>/);
    expect(catalog.includes("function table<T>(name: string, seeds: readonly T[])")).toBe(true);
    // the db keeps seeding the first-run rows from the seed module
    const db = read("../db.ts");
    expect(db).toMatch(/seedLibraryTracks/);
    expect(db).toMatch(/seedVitrineTracks|seedTimelineTracks/);
    // the seed never fakes a published take — the honest empty vitrine
    const seed = read("../seed.ts");
    expect(seed.includes("export const seedVitrineTracks: readonly VitrineTrackRow[] = []")).toBe(true);
    // the ingest engine keeps answering the decomposition and the store lanes
    const ingest = read("../ingest.ts");
    expect(ingest).toMatch(/export function ingestPcm\(/);
    expect(ingest).toMatch(/export function decompose\(/);
    expect(ingest).toMatch(/export async function saveingest\(/);
    expect(ingest).toMatch(/export async function listingests\(/);
    // the generate client keeps answering the compose and the render walks
    const generateclient = read("../generateclient.ts");
    expect(generateclient).toMatch(/export function composeTake\(/);
    expect(generateclient).toMatch(/export function queueRender\(/);
    expect(generateclient).toMatch(/export async function pollRenderJob\(/);
    // the canonical version module answers the manifest (the about row the
    // settings surface reads never drifts from the package)
    const manifest = JSON.parse(read("../package.json")) as { version: string };
    const versionmodule = read("../version.ts");
    expect(versionmodule).toContain(`export const packageversion = "${manifest.version}" as const;`);
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

  it("holds the design bans on the face and the copy law of the surfaces — fluent icons, label-store copy, no emoji", () => {
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
    // the copy keys the landed surfaces speak ride the same store (the
    // manifest revision the seed ingests)
    for (const key of [
      "home.cta.ingest",
      "home.rail.offlineTitle",
      "home.rail.retry",
      "generate.lane.jobFailed",
      "ingest.doc.summary",
      "ingest.bench.refused",
      "library.samples.offlineTitle",
      "library.samples.retry",
      "settings.about.head",
      "settings.about.version",
    ]) {
      expect(LABELS.includes(`"${key}":`), `the label store must carry the ${key} key`).toBe(true);
    }
    // no all-properties transition inside the scene pass
    const scene = CSS.slice(CSS.indexOf(".dbnconstr {"), CSS.indexOf("@keyframes dbnconstrScan"));
    expect(/transition:\s*all/.test(scene), "the scene pass never transitions all").toBe(false);
  });
});
