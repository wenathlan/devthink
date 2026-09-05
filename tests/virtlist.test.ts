import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { heightmapkey, heightmaprecord, measurevirtlistrows, openvirtlist, scrollvirtlist, virtlistheight, virtlistrows, virtlistsavings } from "../views.js";
import { virtlistwindowvalid } from "../policy.js";

describe("virtlist windowing and height maps", () => {
  it("opens the window at scroll top with the user configured row window", () => {
    const window = openvirtlist({ surface: "datagrid", total: 100, rows: 20 });
    expect(window).toEqual({ surface: "datagrid", start: 0, end: 20, total: 100, heights: {}, recycled: 0 });
    const unbounded = openvirtlist({ surface: "logstream", total: 40 });
    expect(unbounded.end).toBe(40);
    expect(() => openvirtlist({ surface: " ", total: 10 })).toThrow(/surface name/i);
  });

  it("moves the window on scroll, clamps inside the row range and recycles the overlapping rows", () => {
    const window = openvirtlist({ surface: "datagrid", total: 100, rows: 20 });
    const scrolled = scrollvirtlist(window, 30);
    expect(scrolled.start).toBe(30);
    expect(scrolled.end).toBe(50);
    expect(scrolled.recycled).toBe(0);
    const next = scrollvirtlist(scrolled, 40);
    expect(next.start).toBe(40);
    expect(next.end).toBe(60);
    expect(next.recycled).toBe(10);
    const clampedtop = scrollvirtlist(next, -50);
    expect(clampedtop.start).toBe(0);
    const clampedbottom = scrollvirtlist(next, 1000);
    expect(clampedbottom.start).toBe(80);
    expect(clampedbottom.end).toBe(100);
  });

  it("measures the row heights into the height map and reuses the stored heights", () => {
    let window = openvirtlist({ surface: "compareviewer", total: 10, rows: 5 });
    window = measurevirtlistrows(window, { "compareviewer:0": 24, "compareviewer:1": 32 });
    expect(window.heights).toEqual({ "compareviewer:0": 24, "compareviewer:1": 32 });
    window = measurevirtlistrows(window, { "compareviewer:2": 28 });
    expect(Object.keys(window.heights)).toHaveLength(3);
    const height = virtlistheight(window, 20);
    expect(height.measured).toBe(84);
    expect(height.total).toBe(84 + 7 * 20);
    expect(heightmapkey("compareviewer", 2)).toBe("compareviewer:2");
    const record = heightmaprecord({ surface: "compareviewer", heights: window.heights, now: 1 });
    expect(record.surface).toBe("compareviewer");
    expect(() => heightmaprecord({ surface: " ", heights: {}, now: 1 })).toThrow(/surface name/i);
  });

  it("renders only the window slice while the full list stays in memory", () => {
    const rows = Array.from({ length: 10 }, (_, index) => `row${index}`);
    const window = openvirtlist({ surface: "logstream", total: rows.length, rows: 3 });
    expect(virtlistrows(window, rows)).toEqual(["row0", "row1", "row2"]);
    const scrolled = scrollvirtlist(window, 8);
    expect(virtlistrows(scrolled, rows)).toEqual(["row7", "row8", "row9"]);
    const savings = virtlistsavings(scrolled);
    expect(savings).toEqual({ rendered: 3, skipped: 7, recycled: scrolled.recycled });
  });

  it("validates the row window as a user choice with no engine default", () => {
    expect(virtlistwindowvalid({ surface: "datagrid", rows: 20 }).allowed).toBe(true);
    expect(virtlistwindowvalid({ surface: "datagrid" }).allowed).toBe(true);
    expect(virtlistwindowvalid({ surface: "datagrid" }).reason).toMatch(/renders every row/i);
    expect(virtlistwindowvalid({ surface: "datagrid", rows: 0 }).allowed).toBe(false);
    expect(virtlistwindowvalid({ surface: "datagrid", rows: -3 }).allowed).toBe(false);
  });

  it("stepstimeline adopts the virtlist windowing the logstream and the datagrid render through", async () => {
    /* the 1.1.68 roadmap item 38 adoption: the stepstimeline nodes window through the same virtlist family, so a long plan renders its visible slice while the full step chain stays in memory and the scroll recycles the row nodes */
    const nodes = Array.from({ length: 60 }, (_, index) => `step-${index}`);
    const window = openvirtlist({ surface: "stepstimeline", total: nodes.length, rows: 25 });
    expect(window.surface).toBe("stepstimeline");
    expect(virtlistrows(window, nodes)).toHaveLength(25);
    const scrolled = scrollvirtlist(window, 40);
    expect(virtlistrows(scrolled, nodes)).toEqual(nodes.slice(35, 60));
    expect(virtlistsavings(scrolled)).toEqual({ rendered: 25, skipped: 35, recycled: 0 });
    const unbounded = openvirtlist({ surface: "stepstimeline", total: nodes.length });
    expect(unbounded.end).toBe(nodes.length);
    /* the sidepanel renders the timeline through the same window options family and the same rowsneeded budget seam the logstream renders through: an unset window renders every node while the windowed render notes the slice it shows */
    const sidepanel = await readFile("web/extension/sidepanel.ts", "utf8");
    expect(sidepanel).toContain('virtlist: { open: { surface: "stepstimeline", total: result.nodes.length } } }');
    expect(sidepanel).toContain("windowed = result.nodes.slice(perfview.window.start, perfview.window.end);");
    expect(sidepanel).toContain("} catch { /* an unset window renders every timeline node */ }");
    /* the logstream and the datagrid keep their own adoption of the same family */
    expect(sidepanel).toContain('virtlist: { open: { surface: "logstream", total: liveevents.length } } }');
    expect(sidepanel).toContain('virtlist: { open: { surface: "datagrid", total: rows.length } } }');
  });
});
