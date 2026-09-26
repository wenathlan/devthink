import { describe, expect, it } from "vitest";
import {
  assemblelapse,
  beforeafter,
  consoletimeline,
  diffbase,
  diffshot,
  exportcaptures,
  namecaptures,
  nettimeline,
  thumbshot,
  timelapse,
  type pixeldiff,
} from "../evidence.js";
import {
  captureexportgate,
  captureretentiongrade,
  consolemaskgate,
  diffbasegate,
  diffthresholdgrade,
  forensicsreadonlygate,
  forensicscopegate,
  nettraceorigingate,
  thumbnailsizereadonlygrade,
  timelapsegate,
  timelapseintervalgrade,
} from "../policy.js";
import type { diffbaserecord, provlogentry } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one diff baseline fixture of a 400 by 800 checkout page. */
function baseline(over: Partial<diffbaserecord> = {}): diffbaserecord {
  return {
    id: "base1",
    runid: "run1",
    captureid: "cap-base",
    pagestate: "checkout page with the pay button",
    ...(over.threshold !== undefined ? { threshold: over.threshold } : {}),
    beat: 3,
    at: now,
    ...over,
  };
}

describe("forensics beforeafter pairing and step linkage", () => {
  it("pairs the pre and post captures around a sensitive step while a read only step skips its pre capture and both captures link to the stepid under the run heartbeat", () => {
    const sensitive = beforeafter({
      runid: "run1",
      stepid: "st1",
      stepkind: "click",
      risk: "sensitive",
      pre: { id: "cap-pre", at: now - 40 },
      post: { id: "cap-post", at: now },
      beat: 5,
      now,
    });
    expect(sensitive.pair.precaptureid).toBe("cap-pre");
    expect(sensitive.pair.postcaptureid).toBe("cap-post");
    expect(sensitive.pair.stepid).toBe("st1");
    expect(sensitive.pair.stepkind).toBe("click");
    expect(sensitive.pair.beat).toBe(5);
    expect(sensitive.skipped).toBeUndefined();
    expect(sensitive.reason).toContain("pre and post");
    const readonly = beforeafter({
      runid: "run1",
      stepid: "st2",
      stepkind: "readtable",
      risk: "read",
      post: { id: "cap-post2", at: now },
      beat: 5,
      now,
    });
    expect(readonly.pair.precaptureid).toBeUndefined();
    expect(readonly.pair.postcaptureid).toBe("cap-post2");
    expect(readonly.skipped).toBe("precapture");
    expect(readonly.reason).toContain("read only readtable step skips its pre capture");
    expect(() => beforeafter({ runid: "", stepid: "st1", stepkind: "click", risk: "sensitive", now })).toThrow(
      /names its run/,
    );
    expect(() => beforeafter({ runid: "run1", stepid: "  ", stepkind: "click", risk: "sensitive", now })).toThrow(
      /names its step/,
    );
    expect(forensicsreadonlygate("beforeafter").allowed).toBe(true);
    expect(forensicsreadonlygate("consoletimeline").allowed).toBe(true);
    expect(forensicsreadonlygate("nettimeline").allowed).toBe(true);
    expect(forensicsreadonlygate("runcommand").allowed).toBe(false);
    expect(forensicscopegate({ record: { runid: "run1" }, runid: "run1" }).allowed).toBe(true);
    expect(forensicscopegate({ record: { runid: "run2" }, runid: "run1" }).allowed).toBe(false);
  });
});

describe("forensics consoletimeline ordering and reload continuity", () => {
  it("collects the console entries in capture order with the stepid active at each entry while the run wide sequence numbers continue across page reloads", () => {
    const steps = [
      { id: "st1", startedat: now, endedat: now + 500 },
      { id: "st2", startedat: now + 500, endedat: now + 900 },
    ];
    const entries = [
      { level: "warn", text: "cart recalculated", source: "console", at: now + 250 },
      { level: "error", text: "payment failed", source: "error", at: now + 700, reload: 1 },
      { level: "log", text: "first line", source: "console", at: now + 100 },
      { level: "log", text: "after reload", source: "console", at: now + 600, reload: 1 },
    ];
    const timeline = consoletimeline({ runid: "run1", entries, steps, beat: 4, now });
    expect(timeline.map((entry) => entry.sequence)).toEqual([1, 2, 3, 4]);
    expect(timeline.map((entry) => entry.text)).toEqual([
      "first line",
      "cart recalculated",
      "after reload",
      "payment failed",
    ]);
    expect(timeline.map((entry) => entry.stepid)).toEqual(["st1", "st1", "st2", "st2"]);
    expect(timeline.map((entry) => entry.level)).toEqual(["log", "warn", "log", "error"]);
    expect(timeline[2]?.reload).toBe(1);
    expect(timeline.every((entry) => entry.beat === 4)).toBe(true);
    const continued = consoletimeline({
      runid: "run1",
      entries: [{ level: "log", text: "next batch", source: "console", at: now + 1000 }],
      steps: [{ id: "st3", startedat: now + 950 }],
      startsequence: 4,
      beat: 4,
      now,
    });
    expect(continued[0]?.sequence).toBe(5);
    expect(continued[0]?.stepid).toBe("st3");
    const fallback = consoletimeline({
      runid: "run1",
      entries: [{ level: "log", text: "before every step", source: "console", at: now - 100 }],
      steps: [{ id: "st0", startedat: now }],
      now,
    });
    expect(fallback[0]?.stepid).toBe("");
    expect(() => consoletimeline({ runid: "", entries: [], steps: [], now })).toThrow(/names its run/);
    expect(consolemaskgate({ masked: true }).allowed).toBe(true);
    expect(consolemaskgate({ masked: false }).allowed).toBe(false);
  });
});

describe("forensics nettimeline joining through correlateids", () => {
  it("attaches each traced request to the step running at its timestamp and joins the request with its response through the correlation map of the run", () => {
    const steps = [
      { id: "st1", startedat: now, endedat: now + 400 },
      { id: "st2", startedat: now + 400, endedat: now + 800 },
    ];
    const correlations = [
      { requestid: "req-1", correlationid: "corr-1", responseid: "res-1", status: 200 },
      { requestid: "req-2", correlationid: "corr-2" },
    ];
    const timeline = nettimeline({
      runid: "run1",
      entries: [
        { url: "https://shop.example/api/cart", method: "GET", at: now + 100, correlationid: "corr-1" },
        { url: "https://shop.example/api/pay", method: "POST", at: now + 500, requestid: "req-2" },
      ],
      steps,
      correlations,
      beat: 6,
    });
    expect(timeline).toHaveLength(2);
    expect(timeline[0]?.stepid).toBe("st1");
    expect(timeline[0]?.correlationid).toBe("corr-1");
    expect(timeline[0]?.paired).toBe(true);
    expect(timeline[0]?.status).toBe(200);
    expect(timeline[1]?.stepid).toBe("st2");
    expect(timeline[1]?.correlationid).toBe("corr-2");
    expect(timeline[1]?.paired).toBeUndefined();
    expect(timeline[1]?.status).toBe(0);
    expect(timeline.every((entry) => entry.beat === 6)).toBe(true);
    expect(() => nettimeline({ runid: "", entries: [], steps: [], correlations: [] })).toThrow(/names its run/);
    const granted = nettraceorigingate({ url: "https://shop.example/api/cart", granted: ["https://shop.example"] });
    expect(granted.allowed).toBe(true);
    expect(nettraceorigingate({ url: "https://outside.example/api", granted: ["https://shop.example"] }).allowed).toBe(
      false,
    );
    expect(nettraceorigingate({ url: "not a url", granted: ["https://shop.example"] }).allowed).toBe(false);
  });
});

describe("forensics diffbase storage and diffshot scoring", () => {
  it("freezes the baseline for a page state and computes the changed regions with the similarity score while the regression flag answers the user threshold alone", async () => {
    const stored = diffbase({
      runid: "run1",
      captureid: "cap-base",
      pagestate: "checkout page",
      threshold: 0.7,
      beat: 2,
      now,
    });
    expect(stored.threshold).toBe(0.7);
    expect(stored.pagestate).toBe("checkout page");
    expect(() => diffbase({ runid: "run1", captureid: "", pagestate: "checkout page", now })).toThrow(
      /names its stored capture/,
    );
    expect(() => diffbase({ runid: "run1", captureid: "cap-base", pagestate: "  ", now })).toThrow(
      /names its page state/,
    );
    expect(() =>
      diffbase({ runid: "run1", captureid: "cap-base", pagestate: "checkout", threshold: 1.5, now }),
    ).toThrow(/between zero and one/);
    expect(diffbasegate({ confirmed: true, pagestate: "checkout page" }).allowed).toBe(true);
    expect(diffbasegate({ confirmed: false, pagestate: "checkout page" }).allowed).toBe(false);
    const walk: pixeldiff = async (_baseline, _capture, grid) => {
      const blocks = Array.from({ length: grid.cols * grid.rows }, (_unused, index) =>
        index === 0 || index === 1 || index === grid.cols ? 1 : 0,
      );
      return { width: 400, height: 800, blocks };
    };
    const result = await diffshot({
      baseline: stored,
      capture: { id: "cap-new", bytes: "data:image/png;base64,new", width: 400, height: 800 },
      diff: walk,
      blocks: { cols: 4, rows: 3 },
      stepid: "st5",
      beat: 7,
      now,
    });
    expect(result.baselineid).toBe(stored.id);
    expect(result.captureid).toBe("cap-new");
    expect(result.score).toBe(0.75);
    expect(result.regression).toBe(false);
    expect(result.regions).toEqual([
      { x: 0, y: 0, width: 200, height: 267 },
      { x: 0, y: 267, width: 100, height: 267 },
    ]);
    expect(result.summary).toContain("0.75");
    const flagged = await diffshot({
      baseline: { ...stored, threshold: 0.99 },
      capture: { id: "cap-new", bytes: "data:image/png;base64,new", width: 400, height: 800 },
      diff: walk,
      blocks: { cols: 4, rows: 3 },
      stepid: "st5",
      now,
    });
    expect(flagged.regression).toBe(true);
    const unthresholded = await diffshot({
      baseline: baseline(),
      capture: { id: "cap-new", bytes: "data:image/png;base64,new", width: 400, height: 800 },
      diff: walk,
      blocks: { cols: 4, rows: 3 },
      stepid: "st5",
      now,
    });
    expect(unthresholded.regression).toBe(false);
    expect(unthresholded.summary).toContain("no user threshold configured");
    const mismatch: pixeldiff = async (_baseline, _capture, grid) => ({
      width: 400,
      height: 800,
      blocks: Array.from({ length: grid.cols * grid.rows - 1 }, () => 0),
    });
    await expect(
      diffshot({
        baseline: stored,
        capture: { id: "cap-new", bytes: "x", width: 400, height: 800 },
        diff: mismatch,
        now,
      }),
    ).rejects.toThrow(/exactly the reviewed blocks/);
    expect(diffthresholdgrade({ threshold: 0.9 }).allowed).toBe(true);
    expect(diffthresholdgrade({ threshold: 1.5 }).allowed).toBe(false);
    expect(diffthresholdgrade({}).allowed).toBe(true);
  });
});

describe("forensics thumbshot sizing and timelapse assembly", () => {
  it("scales the thumbnail inside the user edge with the aspect ratio held while the lapse plans its frames on the interval and assembles them into the ordered sequence", () => {
    const sized = thumbshot({ runid: "run1", capture: { id: "cap1", width: 1280, height: 800 }, edge: 320, now });
    expect(sized.width).toBe(320);
    expect(sized.height).toBe(200);
    expect(sized.scale).toBe(0.25);
    expect(sized.thumb.captureid).toBe("cap1");
    const portrait = thumbshot({ runid: "run1", capture: { id: "cap2", width: 600, height: 1200 }, edge: 300, now });
    expect(portrait.width).toBe(150);
    expect(portrait.height).toBe(300);
    const fullsize = thumbshot({ runid: "run1", capture: { id: "cap3", width: 1280, height: 800 }, now });
    expect(fullsize.width).toBe(1280);
    expect(fullsize.height).toBe(800);
    expect(fullsize.reason).toContain("no user edge is configured");
    expect(() => thumbshot({ runid: "run1", capture: { id: "cap4", width: 100, height: 100 }, edge: 0, now })).toThrow(
      /positive number of pixels/,
    );
    expect(thumbnailsizereadonlygrade({ edge: 320 }).allowed).toBe(true);
    expect(thumbnailsizereadonlygrade({ edge: 0 }).allowed).toBe(false);
    expect(thumbnailsizereadonlygrade({}).allowed).toBe(true);
    const planned = timelapse({ runid: "run1", interval: 500, duration: 2000, startedat: now });
    expect(planned.frames).toBe(5);
    expect(planned.config.state).toBe("running");
    expect(planned.stopsat).toBe(now + 2000);
    const stopped = timelapse({ runid: "run1", interval: 500, duration: 2000, startedat: now, stoppedat: now + 700 });
    expect(stopped.frames).toBe(2);
    expect(stopped.config.state).toBe("stopped");
    expect(stopped.config.stoppedat).toBe(now + 700);
    expect(() => timelapse({ runid: "run1", interval: 0, duration: 2000, startedat: now })).toThrow(
      /positive number of milliseconds/,
    );
    expect(
      assemblelapse([
        { runid: "run1", captureid: "f3", sequence: 3, at: now + 1000 },
        { runid: "run1", captureid: "f1", sequence: 1, at: now },
        { runid: "run1", captureid: "f2", sequence: 2, at: now + 500 },
      ]).map((frame) => frame.captureid),
    ).toEqual(["f1", "f2", "f3"]);
    expect(
      assemblelapse([
        { runid: "run1", captureid: "old", sequence: 2, at: now },
        { runid: "run1", captureid: "new", sequence: 2, at: now + 100 },
      ]),
    ).toHaveLength(1);
    expect(timelapsegate({ userstarted: true, interval: 500 }).allowed).toBe(true);
    expect(timelapsegate({ userstarted: false }).allowed).toBe(false);
    expect(timelapsegate({ userstarted: true, interval: 0 }).allowed).toBe(false);
    expect(timelapseintervalgrade({ interval: 500 }).allowed).toBe(true);
    expect(timelapseintervalgrade({ interval: 0 }).allowed).toBe(false);
    expect(timelapseintervalgrade({}).allowed).toBe(true);
  });
});

describe("forensics namecaptures uniqueness and exportcaptures bundles", () => {
  it("stamps the lowercase file names unique per run with the counter bump while the bundle assembles only with the provlog provenance of every capture and the redaction masks", () => {
    const rule = { pattern: "{plan}-{step}-{timestamp}-{sequence}", parts: ["plan", "step", "timestamp", "sequence"] };
    const named = namecaptures({
      rule,
      parts: [
        { plan: "Run One", step: "Step A", timestamp: now, sequence: 1 },
        { plan: "Run One", step: "Step A", timestamp: now, sequence: 1 },
        { plan: "Run One", step: "Step B", timestamp: now, sequence: 2 },
      ],
    });
    expect(named.names[0]).toBe(`run-one-step-a-${now}-1`);
    expect(named.names[1]).toBe(`run-one-step-a-${now}-1-2`);
    expect(named.names[2]).toBe(`run-one-step-b-${now}-2`);
    expect(new Set(named.names).size).toBe(3);
    const retaken = namecaptures({
      rule,
      parts: [{ plan: "Run One", step: "Step A", timestamp: now, sequence: 1 }],
      taken: named.taken,
    });
    expect(retaken.names[0]).toBe(`run-one-step-a-${now}-1-3`);
    expect(() => namecaptures({ rule: { pattern: "  ", parts: ["plan"] }, parts: [] })).toThrow(/lowercase pattern/);
    expect(() => namecaptures({ rule: { pattern: "{plan}", parts: [] }, parts: [] })).toThrow(/lists its parts/);
    const provlog: provlogentry[] = [
      {
        id: "prov1",
        pipelineid: "run1",
        runid: "run1",
        operation: "capture",
        rowkeys: ["cap1"],
        summary: "The capture cap1 bundles with its provenance.",
        at: now,
      },
      {
        id: "prov2",
        pipelineid: "run1",
        runid: "run1",
        operation: "capture",
        rowkeys: ["cap2"],
        summary: "The capture cap2 bundles with its provenance.",
        at: now,
      },
    ];
    const bundle = exportcaptures({
      runid: "run1",
      captures: ["cap1", "cap2"],
      pairs: ["pair1"],
      consoleentries: 4,
      netentries: 2,
      diffs: ["diff1"],
      thumbnails: ["thumb1"],
      lapses: ["f1", "f2"],
      names: [
        { captureid: "cap1", name: "run-one-1" },
        { captureid: "cap2", name: "run-one-2" },
      ],
      provlog,
      masked: true,
      now,
    });
    expect(bundle.captures).toEqual(["cap1", "cap2"]);
    expect(bundle.provenance).toEqual(["prov1", "prov2"]);
    expect(bundle.consoleentries).toBe(4);
    expect(bundle.netentries).toBe(2);
    expect(bundle.masked).toBe(true);
    expect(() =>
      exportcaptures({
        runid: "run1",
        captures: ["cap1", "cap3"],
        pairs: [],
        consoleentries: 0,
        netentries: 0,
        diffs: [],
        thumbnails: [],
        lapses: [],
        names: [],
        provlog,
        masked: true,
        now,
      }),
    ).toThrow(/provenance covers 1 of them/);
    expect(() =>
      exportcaptures({
        runid: "run1",
        captures: ["cap1"],
        pairs: [],
        consoleentries: 0,
        netentries: 0,
        diffs: [],
        thumbnails: [],
        lapses: [],
        names: [],
        provlog: [],
        masked: true,
        now,
      }),
    ).toThrow(/never leaves the device/);
    expect(() =>
      exportcaptures({
        runid: "run1",
        captures: ["cap1"],
        pairs: [],
        consoleentries: 0,
        netentries: 0,
        diffs: [],
        thumbnails: [],
        lapses: [],
        names: [],
        provlog,
        masked: false,
        now,
      }),
    ).toThrow(/unmasked capture never exports/);
    expect(captureexportgate({ useraction: true, redacted: true, provenance: true, captures: 2 }).allowed).toBe(true);
    expect(captureexportgate({ useraction: false, redacted: true, provenance: true, captures: 2 }).allowed).toBe(false);
    expect(captureexportgate({ useraction: true, redacted: false, provenance: true, captures: 2 }).allowed).toBe(false);
    expect(captureexportgate({ useraction: true, redacted: true, provenance: false, captures: 2 }).allowed).toBe(false);
    expect(captureretentiongrade({ pruned: 0 }).allowed).toBe(true);
    expect(captureretentiongrade({ retention: 200, pruned: 12 }).allowed).toBe(true);
    expect(captureretentiongrade({ retention: 0, pruned: 0 }).allowed).toBe(false);
  });
});
