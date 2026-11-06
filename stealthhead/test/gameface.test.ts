// # gameface.test — the gameface law of stealthhead (the owner order of the
//   waves, pinned): the game is in construction, so the visible game surface
//   is ONE component — the Constructionface winget — and every game route
//   (home behind the entry gate, match, ranking, weapons, world) answers it
//   with its own eyebrow, while the FPS engine logics keep riding their own
//   files at the app root, real and untouched, for the day the game wakes
//   up. The old fake surfaces (the lobby scoreboard, the ladder podium, the
//   armory meters, the map plates) are retired: no sol page imports the
//   engine any more, the face is a drawn scene (brand mark, scope hologram,
//   coral light, status chip) — never a dry text notice — and the design
//   bans hold on it (fluent icons, label-store copy, no emoji). runnable
//   with the vitest runner:
//   npm test
import { readdirSync, readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

/** every source file of the sol tree (pages, wingets, stylesheet) — the
 * walk the engine-import ban and the emoji ban sweep over. */
function solSources(): { path: string; source: string }[] {
  const found: { path: string; source: string }[] = [];
  const stack = ["../sol"];
  while (stack.length > 0) {
    const dir = stack.pop() as string;
    for (const name of readdirSync(new URL(dir, import.meta.url))) {
      const full = `${dir}/${name}`;
      if (statSync(new URL(full, import.meta.url)).isDirectory()) {
        stack.push(full);
      } else if (/\.(tsx?|css)$/.test(name)) {
        found.push({ path: full, source: read(full) });
      }
    }
  }
  return found;
}

const FACE = read("../sol/wingets/Constructionface.tsx");
const BARREL = read("../sol/wingets/index.ts");
const LABELS = read("../labels.ts");
const CSS = read("../sol/sol.css");

/** the game anchors the construction face owns — home mounts it behind the
 * entry gate, the four domains mount it bare, every one under its own
 * eyebrow from the label store. */
const ANCHORS: { route: string; file: string; eyebrow: string }[] = [
  { route: "home", file: "../sol/home/home.tsx", eyebrow: "home.eyebrow" },
  { route: "match", file: "../sol/match/match.tsx", eyebrow: "match.eyebrow" },
  { route: "ranking", file: "../sol/ranking/ranking.tsx", eyebrow: "ranking.eyebrow" },
  { route: "weapons", file: "../sol/weapons/weapons.tsx", eyebrow: "weapons.eyebrow" },
  { route: "world", file: "../sol/world/world.tsx", eyebrow: "world.eyebrow" },
];

/** the engine logics that stay real beneath the face — a sol page importing
 * any of them would be a fake surface rendering as if the game shipped. */
const ENGINE_MODULES = [
  "match",
  "matchrules",
  "ranking",
  "weapons",
  "world",
  "physics",
  "netcode",
  "spawner",
  "hud",
];

describe("the gameface law", () => {
  it("answers every game route with the one construction face under its own eyebrow", () => {
    for (const anchor of ANCHORS) {
      const page = read(anchor.file);
      expect(
        page.includes("<Constructionface"),
        `the ${anchor.route} route must render the construction face`,
      ).toBe(true);
      expect(
        page.includes(`eyebrow={label("${anchor.eyebrow}")}`),
        `the ${anchor.route} face must wear the ${anchor.eyebrow} eyebrow from the label store`,
      ).toBe(true);
      expect(
        page.includes('from "../wingets"'),
        `the ${anchor.route} anchor must import the face from the winget barrel`,
      ).toBe(true);
    }
    // home decides first — the face mounts only behind the finished flow
    const home = read("../sol/home/home.tsx");
    expect(home).toMatch(/<EntryGate>/);
    expect(home.indexOf("<EntryGate>")).toBeLessThan(home.indexOf("<Constructionface"));
  });

  it("serves the face from the winget barrel — the dotted name lives once", () => {
    expect(BARREL).toMatch(/export \{ default as Constructionface \} from "\.\/Constructionface\.tsx"/);
    for (const anchor of ANCHORS) {
      const page = read(anchor.file);
      expect(
        /from "\.\.\/wingets\/Constructionface/.test(page),
        `the ${anchor.route} anchor must not import the dotted winget file directly`,
      ).toBe(false);
    }
  });

  it("retires the old fake surfaces — no sol page imports the engine logics any more", () => {
    for (const { path, source } of solSources()) {
      for (const engine of ENGINE_MODULES) {
        expect(
          new RegExp(`from "\\.\\./\\.\\./${engine}(\\.ts)?"`).test(source),
          `${path} must not import the ${engine} engine logic — the ledger faces are retired`,
        ).toBe(false);
      }
    }
    // the retired home landing never mounts the scope stage directly again
    expect(read("../sol/home/home.tsx").includes("HomeScope")).toBe(false);
  });

  it("keeps the engine logics real beneath the face — nothing was deleted", () => {
    const match = read("../match.ts");
    expect(match).toMatch(/export async function listmatches\(\)/);
    expect(match).toMatch(/export function seatleaderboard\(/);
    const ranking = read("../ranking.ts");
    expect(ranking).toMatch(/export async function listranking\(\)/);
    expect(ranking).toMatch(/export function assignpositions\(/);
    const weapons = read("../weapons.ts");
    expect(weapons).toMatch(/export const WEAPONCATALOG/);
    expect(weapons).toMatch(/export function dps\(/);
    // the pre-compiled world of the owner order stays declared at the root
    const world = read("../world.ts");
    expect(world).toMatch(/stage: "pre-compiled"/);
    expect(world).toMatch(/export const WORLDCATALOG/);
    for (const engine of ["physics", "netcode", "spawner", "hud"]) {
      expect(read(`../${engine}.ts`).length, `the ${engine} logic keeps riding its own file`).toBeGreaterThan(0);
    }
  });

  it("draws the scene — the face is a composed visual, never a dry text notice", () => {
    // the game's own identity rides the panel: the brand mark with the flow
    // band, the scope reticle hanging as the hologram, the coral light
    expect(FACE).toMatch(/<BrandMark size=\{88\} flow \/>/);
    expect(FACE).toMatch(/<Scope \/>/);
    expect(FACE).toMatch(/shconstr__reticle/);
    expect(FACE).toMatch(/shconstr__light/);
    // the honest status chip with its pulsing dot
    expect(FACE).toMatch(/shconstr__chip/);
    expect(FACE).toMatch(/shconstr__pulsedot/);
    // the reveal stagger answers the shared observer
    expect(FACE).toMatch(/observeReveals\(\)/);
    // the stylesheet carries the scene pass of the face
    for (const rule of [".shconstr ", ".shconstr__light", ".shconstr__reticle", ".shconstr__panel", ".shconstr__chip", ".shconstr__pulsedot"]) {
      expect(CSS.includes(rule), `the stylesheet must carry ${rule}`).toBe(true);
    }
    expect(CSS).toMatch(/@keyframes shconstrScan/);
    expect(CSS).toMatch(/@keyframes shconstrHolo/);
    expect(CSS).toMatch(/@keyframes shconstrPulse/);
  });

  it("holds the design bans on the face — fluent icons, label-store copy, no emoji", () => {
    // the icon rides the fluent family, never a drawn emoji
    expect(FACE).toMatch(/import \{ HomeRegular \} from "@fluentui\/react-icons"/);
    /* the pictograph ranges an emoji icon would ride (the typographic arrow
     * → of the comment voice is prose, not a glyph — comments never render,
     * so the css sweep strips them before it judges) */
    const emoji = /[\u{1F000}-\u{1FAFF}]|\u{FE0F}/u;
    for (const { path, source } of solSources()) {
      const rendered = path.endsWith(".css") ? source.replace(/\/\*[\s\S]*?\*\//g, "") : source;
      expect(emoji.test(rendered), `${path} must not ship an emoji glyph`).toBe(false);
    }
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
    expect(LABELS).toMatch(/"construction\.subtitle": "The FPS platform is in construction\."/);
    for (const anchor of ANCHORS) {
      expect(LABELS.includes(`"${anchor.eyebrow}":`), `the label store must carry the ${anchor.eyebrow} eyebrow`).toBe(true);
    }
    // no all-properties transition inside the scene pass
    const scene = CSS.slice(CSS.indexOf(".shconstr {"), CSS.indexOf("@keyframes shconstrScan"));
    expect(/transition:\s*all/.test(scene), "the scene pass never transitions all").toBe(false);
  });
});
