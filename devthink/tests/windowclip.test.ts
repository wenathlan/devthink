// # windowclip.test — the cut-window fix battery (PR12): the six locks of
// the window era, pinned at the source. a window body answers the window
// it rides in — never the browser viewport — and the os never opens a
// window the screen cannot carry whole. the pure verdict (spawnfit) rides
// windowspawn.test; the clip flag (the family window src) rides
// routesdual.test; this battery pins the surfaces those cannot reach: the
// container law of the css, the container hook, the zoom compensation and
// the honesty laws of the window body.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const solcss = readFileSync(join(import.meta.dirname, "..", "Sol", "sol.css"), "utf8");
const ismobile = readFileSync(join(import.meta.dirname, "..", "useismobile.ts"), "utf8");
const workspace = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "PanelWorkspace.tsx"), "utf8");
const windowframe = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "PanelWindowframe.tsx"), "utf8");

describe("the window body container (the app answers the window, never the viewport)", () => {
  it("the host of the window body is a size container", () => {
    expect(solcss).toContain(".shell-window__host {");
    expect(solcss).toContain("container-type: inline-size;");
  });

  it("the critical collapses ride their @container mirrors — the same edges the @media blocks answer", () => {
    // the chat drawer at 860, the dtw chip rail at 760, the files icon
    // rail at 720, the games compact row at 560: one design, the space
    // clamps — inside a window the space IS the container
    for (const edge of ["860px", "760px", "720px", "560px"]) {
      expect(solcss).toContain(`@container (max-width: ${edge}) {`);
    }
  });

  it("the mirror speaks container units — the drawer answers the window width, not 86vw", () => {
    expect(solcss).toContain("width: min(300px, 86cqw);");
  });

  it("the hook measures the registered host with a ResizeObserver, the viewport everywhere else", () => {
    // matchMedia cannot see a container — the hook rides the observer on
    // the registered host and falls back to the viewport law outside the
    // windows (the context default carries no host)
    expect(ismobile).toContain("export const WindowBodySurface");
    expect(ismobile).toContain("new ResizeObserver(measure)");
    expect(ismobile).toContain('const QUERY = "(max-width: 860px)"');
    expect(ismobile).toContain("containerWidth <= BREAKPOINT");
    // the workspace registers the host element of the open window
    expect(workspace).toContain('<div className="shell-window__host" ref={hostRef}>');
    expect(workspace).toContain("<WindowBodySurface.Provider value={hostRef}>");
  });
});

describe("the zoom compensation (the geometry answers css pixels, the pointer arrives rendered)", () => {
  it("the spawn measures the viewport divided by the live interface zoom", () => {
    expect(workspace).toContain('frameScale(document.querySelector("main.shell-os"))');
    expect(workspace).toContain("Math.round(window.innerWidth / scale)");
    expect(workspace).toContain("Math.round(window.innerHeight / scale)");
    // the maximized verdict of the family rows rides the snapshot state
    expect(workspace).toContain('state: fit.maximized ? "maximized" : "normal"');
  });

  it("the gestures and the snap divide the pointer and the desktop by the scale", () => {
    expect(windowframe).toContain("export function frameScale");
    expect(windowframe).toContain("(move.clientX - startX) / scale");
    expect(windowframe).toContain("(move.clientY - startY) / scale");
    expect(windowframe).toContain("((cell.cols / template.cols) * area.width) / scale");
  });
});

describe("the honesty laws of the window body", () => {
  it("a cut shows its bar — the global invisible scroll never reaches inside a window", () => {
    // the global silence stays for every other surface, the window
    // bodies override it after it in the source, so a clipped body is
    // discoverable instead of silently swallowed
    const globalsilence = "* {\n  scrollbar-width: none;\n}";
    expect(solcss).toContain(globalsilence);
    expect(solcss).toContain(".shell-window__host * {\n  scrollbar-width: auto;\n}");
    expect(solcss.indexOf(".shell-window__host * {")).toBeGreaterThan(solcss.indexOf(globalsilence));
  });

  it("the app roots answer the window body height — the 100dvh of the pages never leaks in", () => {
    expect(solcss).toContain(".shell-window__host .dtw-app,\n.shell-window__host .dtfx-app {\n  height: 100%;\n}");
  });
});
