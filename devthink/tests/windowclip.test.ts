// # windowclip.test — the cut-window fix battery (PR12): the seven locks of
// the window era, pinned at the source. a window body answers the window
// it rides in — never the browser viewport — and the os never opens a
// window the screen cannot carry whole. the pure verdict (spawnfit) rides
// windowspawn.test; the clip flag (the family window src) rides
// routesdual.test; this battery pins the surfaces those cannot reach: the
// container law of the css, the container hook, the zoom compensation,
// the honesty laws of the window body, and the hydrate re-fit that heals
// a persisted layout stored cut (the layout door of the law: the spawn
// opens whole, the reload keeps answering whole).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const solcss = readFileSync(join(import.meta.dirname, "..", "Sol", "sol.css"), "utf8");
const ismobile = readFileSync(join(import.meta.dirname, "..", "useismobile.ts"), "utf8");
const workspace = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "PanelWorkspace.tsx"), "utf8");
const windowframe = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "PanelWindowframe.tsx"), "utf8");
const spawnsource = readFileSync(join(import.meta.dirname, "..", "window.ts"), "utf8");

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

describe("the doctrine handles of the window manager (wave 3)", () => {
  it("eight resize handles ride the doctrine tokens — 8px offset −8px, every direction", () => {
    expect(solcss).toContain("--win-handles: 8;");
    expect(solcss).toContain("--win-handle-size: 8px;");
    expect(solcss).toContain("--win-handle-offset: -8px;");
    for (const direction of ["n", "s", "e", "w", "ne", "nw", "se", "sw"]) {
      const block = solcss.match(new RegExp(`\\.shell-window__rz\\[data-direction="${direction}"\\] \\{[^}]*\\}`));
      expect(block, `the ${direction} handle lives in the stylesheet`).toBeTruthy();
      expect(block?.[0], `the ${direction} handle rides the size token`).toContain("var(--win-handle-size)");
      expect(block?.[0], `the ${direction} handle rides the offset token`).toContain("var(--win-handle-offset)");
    }
  });

  it("the frame minimum is the doctrine 320x320 — the stylesheet, the resize logic and the spawn floor agree", () => {
    expect(solcss).toContain("min-width: 320px;");
    expect(solcss).toContain("min-height: 320px;");
    expect(windowframe).toContain("WINDOW_MIN_WIDTH = 320");
    expect(windowframe).toContain("WINDOW_MIN_HEIGHT = 320");
    expect(spawnsource).toContain("SPAWN_FLOOR_WIDTH = 320");
    expect(spawnsource).toContain("SPAWN_FLOOR_HEIGHT = 320");
  });

  it("the frame surface paints the doctrine tokens — the mica bed, the taskbar titlebar, no fixed values", () => {
    const frame = solcss.match(/^\.shell-window \{[^}]*\}/m);
    expect(frame?.[0], "the frame rides the mica bed").toContain("background: var(--win-mica-local);");
    const bar = solcss.match(/^\.shell-window__bar \{[^}]*\}/m);
    expect(bar?.[0], "the titlebar rides the doctrine band").toContain("var(--win-titlebar-h)");
    expect(bar?.[0], "the titlebar rides the taskbar tint").toContain("var(--win-taskbar-tint)");
    expect(bar?.[0], "the titlebar rides the taskbar acrylic").toContain("var(--win-taskbar-filter)");
  });

  it("the titlebar controls ride the doctrine pair — the close red, the focus ring, the pill, no white border", () => {
    const close = solcss.match(/\.shell-window__close:hover \{[^}]*\}/);
    expect(close?.[0], "the close hover rides the doctrine red").toContain("var(--win-close)");
    const focus = solcss.match(/\.shell-window__snapbtn:focus-visible,[\s\S]*?outline: 2px solid var\(--win-focus\);/);
    expect(focus, "the controls carry the doctrine focus ring").toBeTruthy();
    expect(solcss).toContain("border-radius: var(--win-pill);");
    const captions = solcss.match(/\.shell-window__caption,\n\.shell-window__close \{[^}]*\}/);
    expect(captions?.[0], "the caption pair carries no white separator").not.toContain("255 255 255");
  });

  it("the floatTab states ride the doctrine poses — the minimized .6 from the bottom, the hidden .8", () => {
    expect(solcss).toContain("--win-minimized: 0.6;");
    expect(solcss).toContain("--win-hidden: 0.8;");
    expect(solcss).toContain("scale(var(--win-minimized, 0.6))");
    expect(solcss).toContain("scale(var(--win-hidden, 0.8))");
    expect(solcss).toContain("transform-origin: bottom;");
  });

  it("the gestures paint on the compositor — will-change on the moving band, the rAF flush stays", () => {
    const moving = solcss.match(/\[data-moving="true"\] \{[^}]*\}/);
    expect(moving?.[0]).toContain("will-change: transform");
    expect(windowframe).toContain('setAttribute("data-moving", "true")');
    expect(windowframe).toContain("requestAnimationFrame");
  });
});

describe("the hydrate re-fit law (the cut never survives a reload — the PR12 answer at the layout door)", () => {
  /** the persisted layout (dt.windows.v1) rode localStorage verbatim: a
   * snapshot stored on a bigger screen — or in the era before the family
   * band — hydrated cut (past the clipped shell box, under the taskbar,
   * below the 961px+ breakpoints of the standalone tree) and the owner
   * saw the app "cortado" on every panel boot while the direct url
   * answered it whole. the re-fit answers the law at this door: every
   * stored snapshot re-runs the live verdict before it renders. */
  it("every stored snapshot re-fits the live screen before it renders", () => {
    expect(workspace).toContain("function refitsnapshot(win: WindowSnapshot): WindowSnapshot {");
    expect(workspace).toContain(".map((win, index) => ({ ...refitsnapshot(win), z: Z_BASE + index }));");
  });

  it("one verdict serves every door — the spawn and the re-fit ask the same live fit", () => {
    expect(workspace).toContain("function livefit(id: string): SpawnFit {");
    expect(workspace).toContain("const fit = livefit(id);");
  });

  it("a family window stored under its design band heals up to the band — the stored size never downgrades the design", () => {
    // the 940px window of the pre-law era renders the narrow tree the
    // direct url never shows: the band is the law, the size lifts to it
    expect(workspace).toContain('if (windowapp(win.id)?.kind === "family") {');
    expect(workspace).toContain("bounds.width = Math.max(bounds.width, fit.width);");
    expect(workspace).toContain("bounds.height = Math.max(bounds.height, fit.height);");
  });

  it("the floating bounds clamp into the live desktop band — never past the clip, never under the taskbar", () => {
    expect(workspace).toContain("function clampbounds(");
    expect(workspace).toContain("Math.max(WINDOW_MIN_WIDTH, Math.round(bounds.width))");
    expect(workspace).toContain("Math.max(WINDOW_MIN_HEIGHT, Math.round(bounds.height))");
    expect(workspace).toContain("Math.max(0, fit.desktopWidth - width)");
    expect(workspace).toContain("Math.max(0, fit.desktopHeight - height)");
  });

  it("a floating family pose whose band cannot fit the screen answers the full snap — the hydrate, the restore and the un-minimize", () => {
    expect(workspace).toContain("win.state === \"normal\" || (win.state === \"minimized\" && (win.restoredState ?? \"normal\") === \"normal\")");
    expect(workspace).toContain('{ ...next, float: keep, restoredState: "maximized" }');
    expect(workspace).toContain('{ ...next, float: keep, state: "maximized" }');
  });

  it("the live viewport re-clamps the open windows — a monitor swap never leaves a window cut", () => {
    expect(workspace).toContain("window.addEventListener(\"resize\", onResize);");
    expect(workspace).toContain("current.map((win) => clampsnapshot(win))");
    // the no-op guard: an in-band layout never re-renders on a resize
    expect(workspace).toContain("if (samebounds(clamped, win) && samebounds(float, win.float)) return win;");
  });
});
