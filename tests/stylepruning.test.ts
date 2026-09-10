import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

/** The surface sources whose generated markup the pruning scan reads beside the one design file. */
const surfacesources = [
  "views.ts",
  "web/sidepanel.ts",
  "web/dashboardpage.ts",
  "web/popup.ts",
  "web/optionspage.ts",
  "web/transparencypage.ts",
];

/**
 * The style pruning enforcement of the 2.0.2 final polish (roadmap rc.2 item 43): the scan re-runs over web/index.html and the surface sources exactly the way the pruning pass did — every class selector of the embedded extension stylesheet must resolve to a class some surface renders through a class attribute, a className assignment (literal, ternary or template), an object literal property, a classList call or a setAttribute write.
 * The diffrow kind suffixes stay the one documented dynamic composition: the snapshot and console diffs render `diffrow ${entry.kind}` and `diffrow ${line.kind}` (sidepanel.ts) whose kind unions of types.ts carry added, removed and changed, so those three classes stay kept and noted rather than pruned.
 */

/** Collects every class token the given text renders: class attributes, className expressions with their ternaries and template literals, object literal className properties, classList calls and setAttribute writes. */
async function usedclassesof(text: string): Promise<{ used: Set<string>; composed: string[] }> {
  const used = new Set<string>();
  const composed: string[] = [];
  for (const match of text.matchAll(/class="([^"]*)"/g))
    for (const token of (match[1] ?? "").split(/\s+/)) if (token) used.add(token);
  for (const match of text.matchAll(/className\s*=\s*([^;\n]+);?/g)) {
    for (const literal of (match[1] ?? "").matchAll(/"([^"]*)"|`([^`]*)`/g)) {
      const value = literal[1] ?? literal[2] ?? "";
      for (const token of value.split(/[\s${}]+/)) if (token) used.add(token);
      if (value.includes("${")) composed.push(value.trim());
    }
  }
  for (const match of text.matchAll(/className:\s*"([^"]*)"/g))
    for (const token of (match[1] ?? "").split(/\s+/)) if (token) used.add(token);
  for (const match of text.matchAll(/classList\.(?:add|toggle|remove)\(([^;\n]+)\)/g)) {
    for (const literal of (match[1] ?? "").matchAll(/"([^"]*)"|`([^`]*)`/g)) {
      const value = literal[1] ?? literal[2] ?? "";
      for (const token of value.split(/[\s${}]+/)) if (token) used.add(token);
      if (value.includes("${")) composed.push(value.trim());
    }
  }
  for (const match of text.matchAll(/setAttribute\("class",\s*"([^"]*)"\)/g))
    for (const token of (match[1] ?? "").split(/\s+/)) if (token) used.add(token);
  return { used, composed };
}

describe("the style pruning of the extension pages", () => {
  it("keeps zero unused class selectors in the embedded extension stylesheet", async () => {
    const design = await readFile("web/design.html", "utf8");
    const stylesheet = /<style data-source="extension">([\s\S]*?)<\/style>/.exec(design)?.[1] ?? "";
    expect(stylesheet).not.toBe("");
    const styleclasses = new Set([...stylesheet.matchAll(/\.[a-z][a-z0-9-]*/g)].map((match) => match[0]!.slice(1)));
    expect(styleclasses.size).toBeGreaterThan(50);
    const { used, composed } = await usedclassesof(design);
    for (const source of surfacesources) {
      const scanned = await usedclassesof(await readFile(source, "utf8"));
      for (const token of scanned.used) used.add(token);
      composed.push(...scanned.composed);
    }
    /* the diffrow kind suffixes ride the kind unions the diff and console renders interpolate (sidepanel.ts `diffrow ${entry.kind}` and `diffrow ${line.kind}`), so the scan keeps them instead of pruning them: the classes the composition may produce stay documented here. */
    const dynamiccomposed = new Set(["added", "removed", "changed"]);
    const unused = [...styleclasses].filter((token) => !used.has(token) && !dynamiccomposed.has(token)).sort();
    expect(unused).toEqual([]);
    /* the noted dynamic compositions really ride a template literal over the diffrow rules the stylesheet keeps */
    expect(composed.filter((value) => value.startsWith("diffrow ")).length).toBeGreaterThanOrEqual(2);
    for (const token of dynamiccomposed) expect([...styleclasses].some((cls) => cls === token)).toBe(true);
  });

  it("keeps the pruned selector families out of the stylesheet while the classes the surfaces render stay declared", async () => {
    const design = await readFile("web/design.html", "utf8");
    const stylesheet = /<style data-source="extension">([\s\S]*?)<\/style>/.exec(design)?.[1] ?? "";
    /* the families the 2.0.2 pruning removed: no surface template and no generated markup literal ever rendered them — the run lifecycle rows render plain list items beside runbadge, the memory marks render nothing since the statedepth pass writes plain text, the vision word boxes never render beside the wordoverlay caption, the editor library list carries no class of its own and the idem key never rendered — so the rules stay pruned and the assertion holds the pruning in place */
    for (const pruned of [".runrow", ".idemkey", ".memorymark", "span.wordbox", ".editorlibrary"])
      expect(stylesheet.includes(pruned)).toBe(false);
    /* every class the surface templates render still resolves to a rule: the pruning removed rules only, never a class any surface uses */
    const styleclasses = new Set([...stylesheet.matchAll(/\.[a-z][a-z0-9-]*/g)].map((match) => match[0]!.slice(1)));
    for (const template of design.matchAll(/<template data-surface="([^"]+)">([\s\S]*?)<\/template>/g)) {
      for (const match of (template[2] ?? "").matchAll(/class="([^"]*)"/g)) {
        for (const token of (match[1] ?? "").split(/\s+/)) {
          if (token) expect(styleclasses.has(token)).toBe(true);
        }
      }
    }
    /* the classes the state machines toggle stay declared exactly like the wcag sweep demands */
    for (const source of surfacesources) {
      const text = await readFile(source, "utf8");
      for (const match of text.matchAll(/classList\.(?:add|toggle|remove)\("([^"]+)"\)/g))
        expect(styleclasses.has(match[1]!)).toBe(true);
    }
  });
});
