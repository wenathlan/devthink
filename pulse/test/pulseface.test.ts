// # pulseface.test — the under-construction law of pulse (the owner order
//   of the waves, pinned through the stealthhead precedent): the
//   voice-first social studio is in construction — clean everything, ONE
//   component saying "studio in construction", never a dry text notice,
//   zero invented automation logic, zero false metrics. The whole surface
//   is the Constructionface winget (the drawn scene: the fluent pulse
//   glyph mark on its graphite squircle, the voice waveform hologram, the
//   white sun light, the status chip) and the studio logics do not exist
//   yet: no page faces, no shell chrome, no entry flow, no channel boards
//   (X, Instagram, Facebook, YouTube), no swarm mission rail, no db seat —
//   the scaffold is honest, and the surface imports no family engine (the
//   studio consumes getry, saddle, cadria, debonair, vault and cobaia
//   through the family package union of package.json alone). runnable
//   with the vitest runner:
//   npm test
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

/** every source file of the sol tree (the wingets, the stylesheet) — the
 * walk the emoji ban sweeps over. */
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
const WAVE = read("../sol/wingets/Voicewave.tsx");
const CSS = read("../sol/sol.css");

/** the exact sol tree of the under-construction theme: the wingets barrel,
 * the theme anchor and the stylesheet. no page folder exists. */
const SOL_TREE = [
  "Sol.tsx",
  "sol.css",
  "wingets",
];

/** the studio seats that do not exist yet — the honest scaffold: the
 * channel automation, the mission distribution and the monetization site
 * logics of the sibling patterns carry no seat inside pulse while the
 * studio is in construction. */
const UNSEATED_MODULES = [
  "db",
  "content",
  "monetization",
  "onboardingstate",
  "routerbase",
  "sandboxmodality",
];

/** the family engines the studio consumes through the package union
 * (package.json) — never through a surface import while it is in
 * construction. */
const PACKAGE_UNION_ENGINES = [
  "getry",
  "saddle",
  "cadria",
  "debonair",
  "vault",
  "cobaia",
];

describe("the under-construction law", () => {
  it("mounts ONE component on every path — the face is the whole surface", () => {
    expect(FACE).toMatch(/export function Constructionface\(\)/);
    expect(FACE.includes("wouter"), "the face rides no router").toBe(false);
    expect(FACE.includes("<Link"), "the face carries no dead affordance").toBe(false);
    expect(FACE.includes("eyebrow"), "the route eyebrows retired with the routes").toBe(false);
    // the studio page faces do not exist — the folders are gone
    const sol = readdirSync(new URL("../sol", import.meta.url));
    expect([...sol].sort()).toEqual(SOL_TREE);
  });

  it("serves the face from the winget barrel — the dotted name lives once", () => {
    expect(BARREL).toMatch(/export \{ default as Constructionface \} from "\.\/sol\/wingets\/Constructionface\.tsx"/);
    for (const name of ["Constructionface", "Voicewave"]) {
      expect(BARREL.includes(name), `the barrel answers ${name}`).toBe(true);
    }
    expect(BARREL.includes("HomeEntrygate"), "the entry gate retired with the flow").toBe(false);
  });

  it("keeps the scaffold honest — no studio logic exists, no surface file imports a family engine", () => {
    const surface = [
      { path: "../App.tsx", source: read("../App.tsx") },
      { path: "../sol/Sol.tsx", source: read("../sol/Sol.tsx") },
      { path: "../labels.ts", source: LABELS },
      { path: "../theme.ts", source: read("../theme.ts") },
      { path: "../reveal.ts", source: read("../reveal.ts") },
      { path: "../sol/wingets/Constructionface.tsx", source: FACE },
      { path: "../sol/wingets/Voicewave.tsx", source: WAVE },
      { path: "../wingets.ts", source: BARREL },
    ];
    for (const { path, source } of surface) {
      for (const engine of PACKAGE_UNION_ENGINES) {
        expect(
          new RegExp(`from "[^"]*@wenathlan/${engine}[^"]*"`).test(source),
          `${path} must not import the ${engine} engine — the studio consumes the family through the package union while it is in construction`,
        ).toBe(false);
      }
    }
    // the unseeded seats stay absent — the honest scaffold invents nothing
    for (const module of UNSEATED_MODULES) {
      expect(
        existsSync(new URL(`../${module}.ts`, import.meta.url)),
        `the ${module} seat does not exist yet — the studio is in construction`,
      ).toBe(false);
    }
    expect(existsSync(new URL("../schema.prisma", import.meta.url)), "the prisma seat does not exist yet").toBe(false);
  });

  it("draws the scene — the face is a composed visual, never a dry text notice", () => {
    // the studio's own identity rides the panel: the fluent pulse glyph on
    // the graphite squircle (the namesake voice-first signal), the drawn
    // voice waveform hanging as the hologram, the white sun light
    expect(FACE).toMatch(/<PulseRegular fontSize=\{44\} \/>/);
    expect(FACE).toMatch(/<Voicewave \/>/);
    expect(FACE).toMatch(/puconstr__wave/);
    expect(FACE).toMatch(/puconstr__light/);
    expect(FACE).toMatch(/puconstr__mark/);
    expect(FACE).toMatch(/puconstr__glyph/);
    // the honest status chip with its pulsing dot
    expect(FACE).toMatch(/puconstr__chip/);
    expect(FACE).toMatch(/puconstr__pulsedot/);
    // the reveal stagger answers the shared observer
    expect(FACE).toMatch(/observeReveals\(\)/);
    // the waveform is a real drawing — the bars and the guides
    expect(WAVE).toMatch(/className="puv-bar"/);
    expect(WAVE).toMatch(/className="puv-guide"/);
    expect(WAVE).toMatch(/viewBox="0 0 320 120"/);
    // the stylesheet carries the scene pass of the face
    for (const rule of [
      ".puconstr ",
      ".puconstr__light",
      ".puconstr__wave",
      ".puconstr__panel",
      ".puconstr__mark",
      ".puconstr__chip",
      ".puconstr__pulsedot",
      ".puv-root",
      ".puv-bar",
      ".puv-guide",
    ]) {
      expect(CSS.includes(rule), `the stylesheet must carry ${rule}`).toBe(true);
    }
    expect(CSS).toMatch(/@keyframes puconstrScan/);
    expect(CSS).toMatch(/@keyframes puconstrPulse/);
    expect(CSS).toMatch(/@keyframes puconstrHolo/);
    expect(CSS).toMatch(/@keyframes puvBreathe/);
  });

  it("holds the design bans on the face — fluent icons, label-store copy, no emoji, no lucide", () => {
    // every icon import of the surface rides the fluent family (the app
    // boundary carries the boundary icons; the face carries the pulse glyph)
    const surface = [...solSources(), { path: "../App.tsx", source: read("../App.tsx") }];
    const iconCarriers = surface.filter((f) => f.source.includes("@fluentui/react-icons"));
    expect(iconCarriers.length >= 1, "the surface carries the fluent icon law").toBe(true);
    for (const { path, source } of iconCarriers) {
      expect(source).toMatch(/import \{[^}]*\} from "@fluentui\/react-icons"/);
      expect(path.length > 0, `${path} carries the fluent icon law`).toBe(true);
    }
    // the lucide ban: no seat of the surface answers the retired icon family
    for (const { path, source } of surface) {
      expect(source.includes("lucide-react"), `${path} must not import the retired lucide family`).toBe(false);
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
    for (const key of [
      "pulse.name",
      "pulse.construction.aria",
      "pulse.construction.title",
      "pulse.construction.status",
      "pulse.construction.note",
    ]) {
      expect(FACE.includes(`label("${key}")`), `the face must speak through the ${key} label`).toBe(true);
      expect(LABELS.includes(`"${key}":`), `the label store must carry the ${key} key`).toBe(true);
    }
    expect(WAVE.includes('label("voicewave.title")'), "the waveform title rides the store").toBe(true);
    expect(LABELS.includes('"voicewave.title":'), "the label store must carry the waveform title").toBe(true);
    expect(/>\s*[A-Za-z][^<>{}]*</.test(FACE), "no literal text node rides the face outside the store").toBe(false);
    // the honest voice of the law, pinned verbatim
    expect(LABELS).toMatch(/"pulse\.construction\.status": "in construction"/);
    expect(LABELS).toMatch(/"pulse\.construction\.note": "The voice-first social studio is in construction\."/);
    // the copy door the mission validates answers the same store
    expect(LABELS).toMatch(/export function copy\(key: LabelKey\): string/);
    // no all-properties transition inside the scene pass
    const scene = CSS.slice(CSS.indexOf(".puconstr {"), CSS.indexOf("@keyframes puconstrScan"));
    expect(/transition:\s*all/.test(scene), "the scene pass never transitions all").toBe(false);
  });
});
