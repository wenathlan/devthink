// # zoomlock.test — the zoom lock battery (the faun pattern the owner
// pinned in the reference): the page zoom dies at the shell door. the
// complaint was two doors — the page the visitor could scale until the
// design broke, and the scroll that chained past the app into the browser
// chrome — and the answer is one law in three seats: the viewport meta
// rides every html entry of the app (never only the index), the css
// contains the scroll at the app root (no chaining, no double-tap zoom,
// the horizontal strip shows its affordance) and the shell eats the ctrl
// wheel the browser would scale the page with. the window body honesty
// laws ride windowclip.test; the family index declarations ride
// routesdual.test; this battery pins the surfaces those cannot reach:
// every entry, the containment rules and the guard itself.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const approot = join(import.meta.dirname, "..");
const solcss = readFileSync(join(approot, "sol", "sol.css"), "utf8");
const appshell = readFileSync(join(approot, "App.tsx"), "utf8");
const explore = readFileSync(join(approot, "sol", "explore", "explore.tsx"), "utf8");

/** every html entry of the app root — the index the vite build serves, the
 * design reference page and the extension popup: each one is a door the
 * visitor can open, so each one pins the lock */
const htmlentries = readdirSync(approot).filter((name) => name.endsWith(".html"));

describe("the viewport lock (every html entry pins the faun meta)", () => {
  it("the app serves more than the index — the battery sees every door it pins", () => {
    expect(htmlentries, "the index, the design page and the popup are the entries").toContain("index.html");
    expect(htmlentries).toContain("design.html");
    expect(htmlentries).toContain("extensionpopup.html");
  });

  it("every entry declares the zoom zero viewport — the exact meta of the index, no free door", () => {
    for (const entry of htmlentries) {
      const html = readFileSync(join(approot, entry), "utf8");
      /* the build minifier may reorder the meta attributes (content before
       * name), so the lock matches the viewport meta in either attribute
       * order — the law pins the meta and its content, never the spelling. */
      expect(
        html,
        `${entry} carries the viewport meta`,
      ).toMatch(/<meta[^>]+name="viewport"/);
      expect(html, `${entry} pins the scale floor and ceiling`).toContain(
        "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0",
      );
      expect(html, `${entry} pins the user zoom off`).toContain("maximum-scale=1.0, user-scalable=no, viewport-fit=cover");
    }
  });
});

describe("the scroll containment (the app root never chains, the strip shows its cut)", () => {
  it("the app root kills the scroll chaining — html, body and #root answer one law", () => {
    expect(solcss).toContain("html,\nbody,\n#root {\n  overscroll-behavior: none;\n  touch-action: manipulation;\n}");
  });

  it("the root floors the touch gestures at manipulation — the double-tap zoom dies, the pan stays", () => {
    // the drag surfaces keep their own touch-action: none — the chain only
    // narrows, never widens, so the drag handles stay draggable
    expect(solcss).toContain("touch-action: manipulation;");
    expect(solcss).toContain("touch-action: none;");
  });

  it("the explore modules strip is a pan surface that shows its affordance — the global silence never hides a horizontal cut", () => {
    expect(explore).toContain('className="dtv-x__strip flex snap-x snap-mandatory gap-4 overflow-x-auto');
    expect(solcss).toContain(".dtv-x__strip {\n  scrollbar-width: thin;\n}");
    // the exception rides after the global silence it answers, the same
    // order law the window host exception obeys
    const globalsilence = "* {\n  scrollbar-width: none;\n}";
    expect(solcss).toContain(globalsilence);
    expect(solcss.indexOf(".dtv-x__strip {")).toBeGreaterThan(solcss.indexOf(globalsilence));
  });
});

describe("the wheel guard (the desktop page zoom dies at the shell door)", () => {
  it("the shell eats the ctrl wheel before the browser scales the page", () => {
    expect(appshell).toContain('zoomlockhost.addEventListener(\n    "wheel",');
    expect(appshell).toContain("if (event.ctrlKey) event.preventDefault();");
    expect(appshell).toContain("{ passive: false, capture: true },");
  });

  it("the guard arms once per page — the hot reload never stacks listeners", () => {
    expect(appshell).toContain("__dtzoomlock");
    expect(appshell).toContain("if (zoomlockhost && !zoomlockhost.__dtzoomlock) {");
  });
});
