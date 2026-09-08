import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { sessionmemory } from "../memory.js";
import { applycontrasttheme, contrasttokensof, darklighttokensof, highcontrasttokens, localebundles, localeformat, localestring, resolveappearance, siteprofileactive, siteprofilefor, siteprofileof, supportedlanguages } from "../views.js";
import { siteprofilegate } from "../policy.js";

const now = 1_800_000_000_000;

/** The in memory adapter the memory seam tests ride: every record lands in a map so the layout round trip reads back exactly what the toggle wrote. */
class fakeadapter {
  private readonly data = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | undefined> { return this.data.get(key) as T | undefined; }
  async set<T>(key: string, value: T): Promise<void> { this.data.set(key, value); }
}

/** Parses one hex color into its linear rgb channels the WCAG relative luminance arithmetic needs. */
function channelsof(hex: string): number[] {
  const digits = hex.replace("#", "");
  const parts = [0, 2, 4].map(index => Number.parseInt(digits.slice(index, index + 2), 16) / 255);
  return parts.map(value => value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4));
}

/** Computes the WCAG relative luminance of one hex color. */
function luminanceof(hex: string): number {
  const channels = channelsof(hex);
  return 0.2126 * (channels[0] ?? 0) + 0.7152 * (channels[1] ?? 0) + 0.0722 * (channels[2] ?? 0);
}

/** Computes the WCAG contrast ratio of a foreground over a background. */
function contrastof(foreground: string, background: string): number {
  const one = luminanceof(foreground);
  const two = luminanceof(background);
  const [light, dark] = one > two ? [one, two] : [two, one];
  return (light + 0.05) / (dark + 0.05);
}

describe("siteprofiles, darklight themes and locales", () => {
  it("stores the per site interface preferences beside the originprofiles family", () => {
    const profile = siteprofileof({ origin: "https://example.com", theme: "dark", defaultview: "review", at: now });
    expect(profile.theme).toBe("dark");
    expect(siteprofileactive(profile, "https://example.com")).toBe(true);
    expect(siteprofileactive(profile, "https://other.example")).toBe(false);
    expect(siteprofilefor([profile], "https://example.com")?.defaultview).toBe("review");
    expect(siteprofilefor([profile], "https://other.example")).toBeUndefined();
    expect(() => siteprofileof({ origin: "http://insecure.example", at: now })).toThrow(/https/);
    expect(siteprofilegate({ origin: "https://example.com" }).allowed).toBe(true);
    expect(siteprofilegate({ origin: "ftp://example.com" }).reason).toMatch(/https origin shape/);
  });

  it("resolves the appearance with the siteprofile first, the user override next and the os preference last", () => {
    const siteprofile = siteprofileof({ origin: "https://example.com", theme: "light", at: now });
    expect(resolveappearance({ ospreference: "dark", siteprofile }).source).toBe("site");
    expect(resolveappearance({ ospreference: "dark", siteprofile }).mode).toBe("light");
    expect(resolveappearance({ ospreference: "dark", useroverride: "light" }).source).toBe("user");
    expect(resolveappearance({ ospreference: "dark", useroverride: "system" }).mode).toBe("dark");
    expect(resolveappearance({ ospreference: "light" }).source).toBe("os");
    const tokens = darklighttokensof("dark");
    expect(tokens.tokens.surface).not.toBe(darklighttokensof("light").tokens.surface);
    expect(Object.keys(tokens.tokens)).toContain("surface");
    expect(Object.keys(tokens.tokens)).toContain("elevated");
  });

  it("falls back to english for missing strings and covers every supported language", () => {
    const bundles = localebundles();
    expect(supportedlanguages(bundles)).toEqual(["en", "pt"]);
    expect(localestring(bundles, "pt", "popup.recent.title")).toBe("Execuções recentes");
    expect(localestring(bundles, "pt", "stepapprove.approve")).toBe("Aprovar");
    expect(localestring(bundles, "en", "popup.recent.title")).toBe("Recent runs");
    expect(localestring(bundles, "pt", "unknown.key")).toBe("unknown.key");
    const ptmissing = { language: "pt", strings: { "popup.title": "Devthink" } };
    expect(localestring([ptmissing, ...bundles], "pt", "popup.recent.title")).toBe("Recent runs");
  });

  it("formats dates, numbers and durations per language", () => {
    const at = Date.UTC(2025, 0, 5, 8, 6);
    expect(localeformat({ language: "en", value: at, kind: "date" })).toBe("2025-01-05 08:06");
    expect(localeformat({ language: "pt", value: at, kind: "date" })).toBe("05/01/2025 08:06");
    expect(localeformat({ language: "en", value: 1234.5, kind: "number" })).toBe("1,234.5");
    expect(localeformat({ language: "pt", value: 1234.5, kind: "number" })).toBe("1.234,5");
    expect(localeformat({ language: "en", value: 125_000, kind: "duration" })).toBe("2m 5s");
    expect(localeformat({ language: "pt", value: 125_000, kind: "duration" })).toBe("2 min 5 s");
  });

  it("keeps the default darklight sets unchanged while the high contrast set answers WCAG AA", () => {
    /* the 2.0.2 high contrast fix of the rc.2 final polish: the default darklight token sets stay byte identical to the shipped family so the wcag sweep of the default tokens keeps its ratios, while the high contrast variant retunes the same token names */
    expect(darklighttokensof("dark").tokens).toEqual({ surface: "#1f1f1f", elevated: "#2b2b2b", text: "#e3e3e3", muted: "#9aa0a6", accent: "#8ab4f8", border: "#3c4043", focus: "#aecbfa", error: "#f28b82", success: "#81c995", warning: "#fdd663" });
    expect(darklighttokensof("light").tokens).toEqual({ surface: "#ffffff", elevated: "#f8f9fa", text: "#202124", muted: "#5f6368", accent: "#1a73e8", border: "#dadce0", focus: "#174ea6", error: "#b3261e", success: "#188038", warning: "#e37400" });
    for (const mode of ["dark", "light"] as const) {
      const tokens = highcontrasttokens(mode);
      expect(tokens.mode).toBe(mode);
      expect(Object.keys(tokens.tokens).sort()).toEqual(["accent", "border", "elevated", "error", "focus", "muted", "success", "surface", "text", "warning"]);
      const surface = tokens.tokens.surface!;
      /* the reading tokens of the high contrast set answer at least 4.5:1 against their surface */
      for (const name of ["text", "muted", "error", "success", "warning"]) {
        const ratio = contrastof(tokens.tokens[name]!, surface);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }
      /* the accent and the border answer at least 3:1 so controls and edges stay perceivable */
      for (const name of ["accent", "border"]) {
        const ratio = contrastof(tokens.tokens[name]!, surface);
        expect(ratio).toBeGreaterThanOrEqual(3);
      }
      /* the resolution keeps the default preference exactly the darklight set of the same mode while the high preference swaps the variant in */
      expect(contrasttokensof({ mode, contrast: "default" }).tokens).toEqual(darklighttokensof(mode).tokens);
      expect(contrasttokensof({ mode, contrast: "high" }).tokens).toEqual(highcontrasttokens(mode).tokens);
    }
    /* the write path the darklight family already uses lands every --theme-* custom property while the body carries its data-contrast marker */
    const written: Record<string, string> = {};
    const attributes: Record<string, string> = {};
    applycontrasttheme({ style: { setProperty: (name, value) => { written[name] = value; } } }, { setAttribute: (name, value) => { attributes[name] = value; } }, highcontrasttokens("dark"), "high");
    expect(written["--theme-surface"]).toBe("#000000");
    expect(written["--theme-text"]).toBe("#ffffff");
    expect(written["color-scheme"]).toBe("dark");
    expect(attributes["data-contrast"]).toBe("high");
    applycontrasttheme({ style: { setProperty: (name, value) => { written[name] = value; } } }, { setAttribute: (name, value) => { attributes[name] = value; } }, darklighttokensof("light"), "default");
    expect(attributes["data-contrast"]).toBe("default");
  });

  it("persists the contrastpreference toggle through the surface layout seam", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setsurfacelayout({ surface: "optionspage", preferences: { contrastpreference: "high" }, updatedat: now });
    expect((await store.getsurfacelayout("optionspage"))?.preferences.contrastpreference).toBe("high");
    /* the optionspage toggle reads and writes the preference through the same seam for every themed surface, and the themed surfaces resolve the high contrast variant from their own layout record */
    const optionspage = await readFile("web/extension/optionspage.ts", "utf8");
    expect(optionspage).toContain('document.querySelector<HTMLSelectElement>("#contrastpreference")');
    expect(optionspage).toContain('const contrastsurfaces = ["optionspage", "sidepanel", "dashboardpage"] as const;');
    expect(optionspage).toContain("await savecontrastpreference(contrast);");
    expect(optionspage).toContain('layout: { get: { surface: "optionspage" } }');
    expect(optionspage).toContain("for (const surface of contrastsurfaces) {");
    expect(optionspage).toContain('await request({ kind: "surface", layout: { set: { surface, preferences } } });');
    const design = await readFile("web/extension/index.html", "utf8");
    expect(design).toContain('<select id="contrastpreference" aria-label="Contrast preference"><option value="default">Default contrast</option><option value="high">High contrast (WCAG AA)</option></select>');
    expect(design).toContain('body[data-contrast="high"]');
    for (const source of ["web/extension/sidepanel.ts", "web/extension/dashboardpage.ts"]) {
      const text = await readFile(source, "utf8");
      expect(text).toContain('layout: { get: { surface: ');
      expect(text).toContain('applycontrasttheme(document.documentElement, document.body, contrasttokensof({ mode: theme.appearance.mode, contrast: "high" }), "high")');
    }
  });
});
