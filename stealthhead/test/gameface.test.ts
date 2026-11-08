// # gameface.test — the under-construction law of stealthhead (the owner
//   order of the waves, pinned): the FPS game is in construction — clean
//   everything, ONE component saying "game in construction", never a dry
//   text notice. The whole surface is the Constructionface winget (the
//   drawn scene: brand mark, scope hologram, coral light, status chip) and
//   the game logics no longer surface: the page faces, the shell chrome and
//   the entry flow are retired from the tree, no surface file imports an
//   engine module, and the FPS engine logics stay preserved at their theme
//   root seats (match, ranking, weapons, world, physics, netcode,
//   spawner, hud — the rootlogic law) — real and untouched —
//   for the day the game wakes up. runnable with the vitest runner:
//   npm test
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

/** every source file of the sol tree (the topic modules, the wingets, the
 * stylesheet) — the walk the emoji ban sweeps over. */
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
const BARREL = read("../wingets.ts");
const LABELS = read("../labels.ts");
const SCOPE = read("../sol/wingets/HomeScope.tsx");
const CSS = read("../sol/sol.css");

/** the exact sol tree of the under-construction theme (alphabetical — the
 * folder law): only the component faces ride sol — the engine logics answer
 * the rootlogic law the owner charged (every .ts logic file lives beside
 * sol, never inside it), the wingets surface serves from the root barrel,
 * and the theme anchor and stylesheet keep their seats. no page folder
 * survives. */
const SOL_TREE = [
  "Sol.tsx",
  "match",
  "ranking",
  "sol.css",
  "weapons",
  "wingets",
  "world",
];

/** the engine logics (and their retired doors) — no surface file imports
 * any of them any more; the game is in construction. */
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
  "onboardingstate",
  "routerbase",
];

describe("the under-construction law", () => {
  it("mounts ONE component on every path — the face is the whole surface", () => {
    expect(FACE).toMatch(/export function Constructionface\(\)/);
    expect(FACE.includes("wouter"), "the face rides no router").toBe(false);
    expect(FACE.includes("<Link"), "the face carries no dead affordance").toBe(false);
    expect(FACE.includes("eyebrow"), "the route eyebrows retired with the routes").toBe(false);
    // the retired page faces no longer exist — the folders are gone
    const sol = readdirSync(new URL("../sol", import.meta.url));
    expect([...sol].sort()).toEqual(SOL_TREE);
  });

  it("serves the face from the winget barrel — the dotted name lives once", () => {
    expect(BARREL).toMatch(/export \{ default as Constructionface \} from "\.\/sol\/wingets\/Constructionface\.tsx"/);
    for (const name of ["Constructionface", "HomeScope", "ShellBrandmark"]) {
      expect(BARREL.includes(name), `the barrel answers ${name}`).toBe(true);
    }
    expect(BARREL.includes("HomeEntrygate"), "the entry gate retired with the flow").toBe(false);
  });

  it("the game logics no longer surface — no surface file imports the engine", () => {
    const surface = [
      { path: "../App.tsx", source: read("../App.tsx") },
      { path: "../sol/Sol.tsx", source: read("../sol/Sol.tsx") },
      { path: "../labels.ts", source: LABELS },
      { path: "../theme.ts", source: read("../theme.ts") },
      { path: "../reveal.ts", source: read("../reveal.ts") },
      { path: "../sol/wingets/Constructionface.tsx", source: FACE },
      { path: "../sol/wingets/ShellBrandmark.tsx", source: read("../sol/wingets/ShellBrandmark.tsx") },
      { path: "../sol/wingets/HomeScope.tsx", source: SCOPE },
      { path: "../wingets.ts", source: BARREL },
    ];
    for (const { path, source } of surface) {
      for (const engine of ENGINE_MODULES) {
        expect(
          new RegExp(`from "[^"]*/${engine}(\\.ts)?"`).test(source),
          `${path} must not import the ${engine} engine — the game is in construction`,
        ).toBe(false);
      }
    }
    // the rootlogic law (the owner directive): every engine logic seat
    // LIVES at the root beside sol — and sol itself never carries a .ts
    // logic file again, only the component faces
    for (const seat of [
      "../match.ts",
      "../ranking.ts",
      "../weapons.ts",
      "../world.ts",
      "../physics.ts",
      "../spawner.ts",
      "../netcode.ts",
      "../hud.ts",
    ]) {
      expect(existsSync(new URL(seat, import.meta.url)), `${seat} rides the root`).toBe(true);
    }
    for (const retired of ["../onboardingstate.ts", "../routerbase.ts"]) {
      expect(existsSync(new URL(retired, import.meta.url)), `${retired} left the root`).toBe(false);
    }
  });

  it("keeps the engine logics real beneath the face — preserved at the root seats the rootlogic law pins", () => {
    const match = read("../match.ts");
    expect(match).toMatch(/export async function listmatches\(\)/);
    expect(match).toMatch(/export function seatleaderboard\(/);
    const ranking = read("../ranking.ts");
    expect(ranking).toMatch(/export async function listranking\(\)/);
    expect(ranking).toMatch(/export function assignpositions\(/);
    const weapons = read("../weapons.ts");
    expect(weapons).toMatch(/export const WEAPONCATALOG/);
    expect(weapons).toMatch(/export function dps\(/);
    // the pre-compiled world of the owner order stays declared at its topic path
    const world = read("../world.ts");
    expect(world).toMatch(/stage: "pre-compiled"/);
    expect(world).toMatch(/export const WORLDCATALOG/);
    for (const engine of ["physics", "netcode", "spawner", "hud"]) {
      expect(
        read(`../${engine}.ts`).length,
        `the ${engine} logic keeps riding its root seat (the rootlogic law)`,
      ).toBeGreaterThan(0);
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
    for (const rule of [
      ".shconstr ",
      ".shconstr__light",
      ".shconstr__reticle",
      ".shconstr__panel",
      ".shconstr__chip",
      ".shconstr__pulsedot",
    ]) {
      expect(CSS.includes(rule), `the stylesheet must carry ${rule}`).toBe(true);
    }
    expect(CSS).toMatch(/@keyframes shconstrScan/);
    expect(CSS).toMatch(/@keyframes shconstrHolo/);
    expect(CSS).toMatch(/@keyframes shconstrPulse/);
  });

  it("holds the design bans on the face — fluent icons, label-store copy, no emoji", () => {
    // every icon import of the surface rides the fluent family (the app
    // boundary carries the icons; the drawn scene rides the brand law)
    const surface = [...solSources(), { path: "../App.tsx", source: read("../App.tsx") }];
    const iconCarriers = surface.filter((f) => f.source.includes("@fluentui/react-icons"));
    expect(iconCarriers.length >= 1, "the surface carries the fluent icon law").toBe(true);
    for (const { path, source } of iconCarriers) {
      expect(source).toMatch(/import \{[^}]*\} from "@fluentui\/react-icons"/);
      expect(path.length > 0, `${path} carries the fluent icon law`).toBe(true);
    }
    /* the pictograph ranges an emoji icon would ride (the typographic arrow
     * → of the comment voice is prose, not a glyph — comments never render,
     * so the css sweep strips them before it judges) */
    const emoji = /[\u{1F000}-\u{1FAFF}]|\u{FE0F}/u;
    for (const { path, source } of surface) {
      const rendered = path.endsWith(".css") ? source.replace(/\/\*[\s\S]*?\*\//g, "") : source;
      expect(emoji.test(rendered), `${path} must not ship an emoji glyph`).toBe(false);
    }
    // every word the face renders rides the label store — no hardcoded copy
    for (const key of ["construction.aria", "construction.title", "construction.status", "construction.subtitle"]) {
      expect(FACE.includes(`label("${key}")`), `the face must speak through the ${key} label`).toBe(true);
      expect(LABELS.includes(`"${key}":`), `the label store must carry the ${key} key`).toBe(true);
    }
    expect(SCOPE.includes('label("home.scope.title")'), "the scope title rides the store").toBe(true);
    expect(LABELS.includes('"home.scope.title":'), "the label store must carry the scope title").toBe(true);
    expect(/>\s*[A-Za-z][^<>{}]*</.test(FACE), "no literal text node rides the face outside the store").toBe(false);
    // the honest voice of the law, pinned verbatim
    expect(LABELS).toMatch(/"construction\.status": "in construction"/);
    expect(LABELS).toMatch(/"construction\.subtitle": "The FPS platform is in construction\."/);
    // the retired copy no longer rides the store
    expect(LABELS.includes("shell.rail"), "the shell rail copy retired").toBe(false);
    expect(LABELS.includes("onboarding."), "the onboarding copy retired").toBe(false);
    expect(LABELS.includes('"construction.action"'), "the dead home affordance retired").toBe(false);
    // no all-properties transition inside the scene pass
    const scene = CSS.slice(CSS.indexOf(".shconstr {"), CSS.indexOf("@keyframes shconstrScan"));
    expect(/transition:\s*all/.test(scene), "the scene pass never transitions all").toBe(false);
  });
});
