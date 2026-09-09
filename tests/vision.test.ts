import { describe, expect, it } from "vitest";
import {
  cropshot,
  frameocr,
  groundshot,
  imagehashof,
  imageocr,
  mergelines,
  mergeparagraphs,
  ocrtext,
  pairquery,
  pairshot,
  pdfocr,
  proposeredactionmasks,
  redactshot,
  regionocr,
  visioncacheput,
  visioncacheserve,
  visioncost,
  visionshot,
  type framegrab,
  type maskfill,
  type ocrread,
  type pdfrasterize,
  type videostateread,
  type visionsend,
} from "../capture.js";
import {
  framebudgetgate,
  groundgate,
  ocrgate,
  pairgate,
  redactgate,
  regionboundsgate,
  visioncacheexpirygate,
  visionchoices,
  visionconsentgate,
  visioncostgrade,
  visiongate,
  visionsensitivegrade,
} from "../policy.js";
import type { ocrregion, ocrword, redactionmask, streamcursor, visiondescription } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one recognized word fixture with its box and confidence. */
function word(text: string, box: ocrregion, confidence: number): ocrword {
  return { text, box, confidence };
}

/** Builds one vision description fixture with labeled regions on a 400 by 800 image. */
function description(over: Partial<visiondescription> = {}): visiondescription {
  return {
    id: "d1",
    runid: "run1",
    stepid: "st1",
    imageid: "cap1",
    prompt: "Describe the checkout page.",
    text: "A checkout page with a total and a pay button.",
    regions: [
      { label: "pay button", box: { x: 160, y: 700, width: 80, height: 40 } },
      { label: "order total", box: { x: 40, y: 640, width: 120, height: 30 } },
    ],
    at: now,
    ...over,
  };
}

describe("vision imageocr recognition", () => {
  it("merges the recognized word boxes into lines and paragraphs by their own geometry while every word carries its confidence and the line reports the lowest one", async () => {
    const words = [
      word("Order", { x: 10, y: 20, width: 60, height: 20 }, 0.98),
      word("total:", { x: 80, y: 21, width: 50, height: 19 }, 0.71),
      word("42.50", { x: 140, y: 20, width: 60, height: 20 }, 0.95),
      word("Pay", { x: 12, y: 90, width: 40, height: 20 }, 0.99),
      word("now", { x: 60, y: 91, width: 50, height: 20 }, 0.88),
      word("Thanks", { x: 14, y: 115, width: 80, height: 24 }, 1),
    ];
    const lines = mergelines(words);
    expect(lines.map((line) => line.text)).toEqual(["Order total: 42.50", "Pay now", "Thanks"]);
    expect(lines[0]?.words).toBe(3);
    expect(lines[0]?.confidence).toBe(0.71);
    expect(lines[0]?.box).toEqual({ x: 10, y: 20, width: 190, height: 20 });
    expect(lines[1]?.confidence).toBe(0.88);
    expect(mergeparagraphs(lines)).toEqual(["Order total: 42.50", "Pay now Thanks"]);
    const read: ocrread = async () => words;
    const result = await imageocr({
      record: { runid: "run1", stepid: "st1", imageid: "cap1" },
      image: "data:image/png;base64,abc",
      read,
      id: "ocr1",
      now,
    });
    expect(result.id).toBe("ocr1");
    expect(result.imageid).toBe("cap1");
    expect(result.words).toHaveLength(6);
    expect(result.lines).toHaveLength(3);
    expect(result.paragraphs).toEqual(["Order total: 42.50", "Pay now Thanks"]);
    expect(result.text).toBe("Order total: 42.50 Pay now Thanks");
    expect(ocrtext("  Order   total:\n\n42.50  ")).toBe("Order total: 42.50");
    await expect(
      imageocr({ record: { runid: "run1", stepid: "st1", imageid: "cap1" }, image: "  ", read, now }),
    ).rejects.toThrow(/needs its captured image/);
    expect(ocrgate("imageocr").allowed).toBe(true);
    expect(ocrgate("visioncall").allowed).toBe(false);
    expect(visionchoices({ visionmodel: "see-1", visionendpoint: "https://vision.example/model" })).toEqual({
      model: "see-1",
      endpoint: "https://vision.example/model",
    });
    expect(visionchoices(undefined)).toEqual({});
  });
});

describe("vision regionocr bounds and pdfocr page streaming", () => {
  it("clamps the drawn region into the viewport while the word boxes offset to absolute coordinates and pdfocr reads one page at a time through the streamcursor checkpoints", async () => {
    const read: ocrread = async (_image, region) => [
      { text: "hello", box: { x: 0, y: 0, width: 50, height: 20 }, confidence: 0.9 },
      { text: "world", box: { x: 5, y: 2, width: 50, height: 18 }, confidence: 0.8 },
    ];
    const clamped = await regionocr({
      record: { runid: "run1", stepid: "st1", imageid: "cap1" },
      image: "data:image/png;base64,abc",
      region: { x: 380, y: 700, width: 120, height: 80 },
      viewport: { width: 400, height: 800 },
      read,
      id: "ocr2",
      now,
    });
    expect(clamped.words[0]?.box.x).toBe(380);
    expect(clamped.words[0]?.box.y).toBe(700);
    expect(clamped.words[1]?.box.x).toBe(385);
    expect(clamped.text).toBe("hello world");
    await expect(
      regionocr({
        record: { runid: "run1", stepid: "st1", imageid: "cap1" },
        image: "data:image/png;base64,abc",
        region: { x: 500, y: 900, width: 40, height: 30 },
        viewport: { width: 400, height: 800 },
        read,
        now,
      }),
    ).rejects.toThrow(/falls entirely outside/);
    const inside = regionboundsgate({
      region: { x: 10, y: 10, width: 100, height: 50 },
      viewport: { width: 400, height: 800 },
    });
    expect(inside.allowed).toBe(true);
    const crossing = regionboundsgate({
      region: { x: 350, y: 10, width: 100, height: 50 },
      viewport: { width: 400, height: 800 },
    });
    expect(crossing.allowed).toBe(true);
    expect(crossing.reason).toContain("clamps");
    expect(
      regionboundsgate({ region: { x: 450, y: 10, width: 100, height: 50 }, viewport: { width: 400, height: 800 } })
        .allowed,
    ).toBe(false);
    expect(
      regionboundsgate({ region: { x: 10, y: 10, width: 0, height: 50 }, viewport: { width: 400, height: 800 } })
        .allowed,
    ).toBe(false);
    const rasterized: string[] = [];
    const rasterize: pdfrasterize = async (documentid, page) => {
      rasterized.push(`${documentid}:p${page}`);
      return `data:image/png;base64,page${page}`;
    };
    const checkpoints: streamcursor[] = [];
    const pass = await pdfocr({
      record: { runid: "run1", stepid: "st1", documentid: "scan-1" },
      pages: 3,
      rasterize,
      read,
      checkpoint: (cursor) => {
        checkpoints.push({ ...cursor });
      },
      now,
    });
    expect(rasterized).toEqual(["scan-1:p1", "scan-1:p2", "scan-1:p3"]);
    expect(pass.pagesread).toBe(3);
    expect(pass.results.map((result) => result.imageid)).toEqual(["scan-1:p1", "scan-1:p2", "scan-1:p3"]);
    expect(checkpoints[checkpoints.length - 1]).toEqual({ pipelineid: "scan-1", offset: 3, chunk: 3, updatedat: now });
    const resumed = await pdfocr({
      record: { runid: "run1", stepid: "st1", documentid: "scan-1" },
      pages: 3,
      rasterize,
      read,
      ...(checkpoints[0] !== undefined ? { cursor: checkpoints[0] } : {}),
      now,
    });
    expect(resumed.skipped).toBe(1);
    expect(resumed.pagesread).toBe(2);
    expect(rasterized).toHaveLength(5);
    await expect(
      pdfocr({
        record: { runid: "run1", stepid: "st1", documentid: "scan-1" },
        pages: 3,
        rasterize,
        read,
        cursor: { pipelineid: "scan-other", offset: 1, chunk: 1, updatedat: now },
        now,
      }),
    ).rejects.toThrow(/another document/);
    expect(ocrgate("regionocr").allowed).toBe(true);
    expect(ocrgate("pdfocr").allowed).toBe(true);
  });
});

describe("vision frameocr pause enforcement", () => {
  it("refuses the frame of a playing video before any pixel moves while a paused video seeks to its reviewed position and reads the frame", async () => {
    const words = [word("chapter", { x: 10, y: 10, width: 90, height: 20 }, 0.93)];
    const read: ocrread = async () => words;
    const states: Array<{ paused: boolean; positionms: number; durationms: number }> = [
      { paused: false, positionms: 4_000, durationms: 60_000 },
      { paused: true, positionms: 12_000, durationms: 60_000 },
    ];
    let stateindex = 0;
    const stateread: videostateread = async () => states[Math.min(stateindex, states.length - 1)]!;
    const grabs: number[] = [];
    const grab: framegrab = async (_selector, positionms) => {
      grabs.push(positionms);
      return { image: "data:image/png;base64,frame", width: 640, height: 360 };
    };
    await expect(
      frameocr({
        record: { runid: "run1", stepid: "st1" },
        frame: { runid: "run1", stepid: "st1", selector: "video.tutorial", positionms: 12_000, at: now },
        state: stateread,
        grab,
        read,
        now,
      }),
    ).rejects.toThrow(/refuses a moving picture/);
    expect(grabs).toHaveLength(0);
    stateindex = 1;
    const played = await frameocr({
      record: { runid: "run1", stepid: "st1" },
      frame: { runid: "run1", stepid: "st1", selector: "video.tutorial", positionms: 12_000, at: now },
      state: stateread,
      grab,
      read,
      now,
    });
    expect(grabs).toEqual([12_000]);
    expect(played.result.words[0]?.text).toBe("chapter");
    expect(played.frame.positionms).toBe(12_000);
    await expect(
      frameocr({
        record: { runid: "run1", stepid: "st1" },
        frame: { runid: "run1", stepid: "st1", selector: "video.tutorial", positionms: 90_000, at: now },
        state: stateread,
        grab,
        read,
        now,
      }),
    ).rejects.toThrow(/outside the video/);
    expect(ocrgate("frameocr").allowed).toBe(true);
    expect(framebudgetgate({ waitms: 800, budget: 1500 }).allowed).toBe(true);
    expect(framebudgetgate({ waitms: 1800, budget: 1500 }).allowed).toBe(false);
    expect(framebudgetgate({ waitms: 800 }).allowed).toBe(true);
    expect(visionconsentgate({ frames: true, consented: false }).allowed).toBe(false);
    expect(visionconsentgate({ frames: true, consented: true }).allowed).toBe(true);
    expect(visionconsentgate({ frames: false, consented: false }).allowed).toBe(true);
  });
});

describe("vision cropshot scaling and pairshot alignment", () => {
  it("scales the element crop into image pixels with the device pixel ratio awareness while the pair aligns with the nearest same viewport dom snapshot", () => {
    const crop = cropshot({
      image: { width: 1280, height: 800 },
      bounds: { x: 100, y: 300, width: 200, height: 80 },
      pixelratio: 2,
    });
    expect(crop.cssbounds).toEqual({ x: 100, y: 300, width: 200, height: 80 });
    expect(crop.crop).toEqual({ x: 200, y: 600, width: 400, height: 160 });
    expect(crop.width).toBe(400);
    expect(crop.height).toBe(160);
    expect(crop.ratio).toBe(2);
    const clamped = cropshot({
      image: { width: 1280, height: 800 },
      bounds: { x: 600, y: 380, width: 120, height: 60 },
      pixelratio: 2,
    });
    expect(clamped.crop).toEqual({ x: 1200, y: 760, width: 80, height: 40 });
    expect(() =>
      cropshot({
        image: { width: 1280, height: 800 },
        bounds: { x: 1400, y: 900, width: 60, height: 30 },
        pixelratio: 2,
      }),
    ).toThrow(/fall entirely outside/);
    const paired = pairshot({
      runid: "run1",
      stepid: "st1",
      image: { id: "cap1", capturetime: now, viewport: { width: 640, height: 400 } },
      snapshots: [
        { id: "dom-older", capturetime: now - 900, viewport: { width: 640, height: 400 } },
        { id: "dom-nearest", capturetime: now - 80, viewport: { width: 640, height: 400 } },
        { id: "dom-other-viewport", capturetime: now - 10, viewport: { width: 320, height: 200 } },
      ],
      id: "pair1",
      now,
    });
    expect(paired.pair?.domsnapshotid).toBe("dom-nearest");
    expect(paired.pair?.imageid).toBe("cap1");
    expect(paired.pair?.viewport).toEqual({ width: 640, height: 400 });
    expect(paired.reason).toContain("80 milliseconds");
    const unmatched = pairshot({
      runid: "run1",
      stepid: "st1",
      image: { id: "cap2", capturetime: now, viewport: { width: 640, height: 400 } },
      snapshots: [{ id: "dom-other-viewport", capturetime: now - 10, viewport: { width: 320, height: 200 } }],
      now,
    });
    expect(unmatched.pair).toBeUndefined();
    expect(unmatched.skipped).toBe("snapshot");
    expect(pairgate({ snapshot: { runid: "run1" }, runid: "run1" }).allowed).toBe(true);
    expect(pairgate({ snapshot: { runid: "run2" }, runid: "run1" }).allowed).toBe(false);
    const query = pairquery({
      query: "Order total",
      ocrtextvalue: "The Order total: 42.50 appears once.",
      domtext: "Checkout summary shows the order total row.",
    });
    expect(query.matches.map((match) => match.source).sort()).toEqual(["dom", "image"]);
    expect(query.matches[0]?.excerpt).toContain("order total");
    expect(
      pairquery({ query: "missing needle", ocrtextvalue: "nothing here", domtext: "nothing there" }).matches,
    ).toHaveLength(0);
    expect(() => pairquery({ query: "  ", ocrtextvalue: "", domtext: "" })).toThrow(/non-empty string/);
  });
});

describe("vision redactshot masking and audit records", () => {
  it("applies the redactionmask through the fill seam before any sharing while the proposals derive from the sensitive field shapes and the audit summary records the covered regions", async () => {
    const filled: ocrregion[] = [];
    const fill: maskfill = async (image, regions) => {
      filled.push(...regions.map((region) => ({ ...region })));
      return `${image}:masked`;
    };
    const mask: redactionmask = {
      id: "mask1",
      runid: "run1",
      captureid: "cap1",
      regions: [
        { x: 10, y: 20, width: 100, height: 30 },
        { x: 380, y: 700, width: 120, height: 40 },
      ],
      reason: "the payment card digits stay on the device",
      source: "userdrawn",
      at: now,
    };
    const masked = await redactshot({ image: "data:image/png;base64,abc", width: 400, height: 800, mask, fill });
    expect(masked.image).toBe("data:image/png;base64,abc:masked");
    expect(masked.regions).toBe(2);
    expect(masked.reason).toBe("the payment card digits stay on the device");
    expect(filled[1]).toEqual({ x: 380, y: 700, width: 20, height: 40 });
    expect(masked.summary).toContain("covered 2 regions");
    expect(masked.summary).toContain(mask.reason);
    await expect(
      redactshot({ image: "data:image/png;base64,abc", width: 400, height: 800, mask: { ...mask, regions: [] }, fill }),
    ).rejects.toThrow(/masks nothing/);
    await expect(
      redactshot({
        image: "data:image/png;base64,abc",
        width: 400,
        height: 800,
        mask: { ...mask, regions: [{ x: 900, y: 900, width: 10, height: 10 }] },
        fill,
      }),
    ).rejects.toThrow(/falls outside the capture/);
    const proposals = proposeredactionmasks({
      runid: "run1",
      captureid: "cap1",
      fields: [
        { name: "cardnumber", rect: { x: 10, y: 20, width: 120, height: 24 } },
        { name: "quantity", rect: { x: 10, y: 60, width: 60, height: 24 } },
        { name: "password", rect: { x: 10, y: 100, width: 90, height: 24 } },
      ],
      now,
    });
    expect(proposals.map((proposal) => proposal.regions[0]?.x)).toEqual([10, 10]);
    expect(proposals.every((proposal) => proposal.source === "fieldshape" && proposal.id.trim() !== "")).toBe(true);
    expect(proposals[0]?.reason).toContain("cardnumber");
    expect(redactgate({ redacted: true, destination: "clipboard" }).allowed).toBe(true);
    expect(redactgate({ redacted: false, destination: "download" }).allowed).toBe(false);
    expect(redactgate({ redacted: false, destination: "session memory" }).allowed).toBe(true);
    expect(
      visiongate({ endpoint: "https://vision.example/model", model: "see-1", granted: ["https://vision.example"] })
        .allowed,
    ).toBe(true);
    expect(
      visiongate({ endpoint: "https://outside.example/model", model: "see-1", granted: ["https://vision.example"] })
        .allowed,
    ).toBe(false);
    expect(visiongate({ endpoint: "", model: "", granted: ["https://vision.example"] }).allowed).toBe(false);
    expect(visionsensitivegrade("visionshot").allowed).toBe(true);
    expect(visionsensitivegrade("imageocr").allowed).toBe(false);
  });
});

describe("vision groundshot ranking and visioncache hits", () => {
  it("ranks the grounding candidates by the averaged text and geometry scores while the visioncache serves the repeated image hash without a model call under the user retention", async () => {
    const elements = [
      { selector: "button.pay", text: "Pay now with card", rect: { x: 80, y: 350, width: 40, height: 20 } },
      { selector: "button.cancel", text: "Cancel the order", rect: { x: 20, y: 350, width: 40, height: 20 } },
      { selector: "span.total", text: "Order total 42.50", rect: { x: 20, y: 320, width: 60, height: 15 } },
      { selector: "footer", text: "Shop footer links", rect: { x: 0, y: 780, width: 400, height: 20 } },
    ];
    const grounded = groundshot({
      description: description(),
      elements,
      pixelratio: 2,
      record: { runid: "run1", stepid: "st1" },
      id: "g1",
      now,
    });
    expect(grounded.descriptionid).toBe("d1");
    expect(grounded.matches[0]?.selector).toBe("span.total");
    expect(grounded.matches[0]?.label).toBe("order total");
    expect(grounded.matches[0]?.score).toBeGreaterThan(
      grounded.matches.find((match) => match.selector === "button.pay")?.score ?? 0,
    );
    expect(grounded.matches.every((match) => match.score > 0)).toBe(true);
    expect(grounded.matches.some((match) => match.selector === "footer")).toBe(false);
    expect(groundgate("groundshot").allowed).toBe(true);
    expect(groundgate("groundquery").allowed).toBe(false);
    expect(() =>
      groundshot({
        description: { ...description(), regions: [] },
        elements,
        pixelratio: 1,
        record: { runid: "run1", stepid: "st1" },
        now,
      }),
    ).toThrow(/needs its labeled regions/);
    const send: visionsend = async () => ({
      text: "A checkout page.",
      regions: [{ label: "pay button", box: { x: 160, y: 700, width: 80, height: 40 } }],
    });
    const described = await visionshot({
      record: { runid: "run1", stepid: "st1", imageid: "cap1" },
      image: "data:image/png;base64,abc",
      prompt: "Describe the page.",
      send,
      id: "d2",
      now,
    });
    expect(described.prompt).toBe("Describe the page.");
    expect(described.regions[0]?.label).toBe("pay button");
    await expect(
      visionshot({
        record: { runid: "run1", stepid: "st1", imageid: "cap1" },
        image: "data:image/png;base64,abc",
        prompt: "   ",
        send,
        now,
      }),
    ).rejects.toThrow(/non-empty reviewed string/);
    const hash = imagehashof("data:image/png;base64,abc");
    const stored = visioncacheput({
      entries: [],
      entry: {
        hash,
        runid: "run1",
        imageid: "cap1",
        kind: "ocr",
        ocr: {
          id: "ocr1",
          runid: "run1",
          stepid: "st1",
          imageid: "cap1",
          text: "Order total 42.50",
          words: [],
          lines: [],
          paragraphs: [],
          at: now,
        },
        hits: 0,
        at: now,
      },
    });
    expect(stored).toHaveLength(1);
    const replaced = visioncacheput({
      entries: stored,
      entry: {
        hash,
        runid: "run1",
        imageid: "cap1",
        kind: "ocr",
        ocr: {
          id: "ocr2",
          runid: "run1",
          stepid: "st1",
          imageid: "cap1",
          text: "Order total 42.50",
          words: [],
          lines: [],
          paragraphs: [],
          at: now,
        },
        hits: 3,
        at: now,
      },
    });
    expect(replaced).toHaveLength(1);
    expect(replaced[0]?.hits).toBe(3);
    const served = visioncacheserve({ entries: replaced, hash, kind: "ocr", now: now + 1000 });
    expect(served.entry?.hits).toBe(4);
    expect(served.entry?.ocr?.id).toBe("ocr2");
    expect(served.expired).toBe(0);
    const missed = visioncacheserve({
      entries: replaced,
      hash: imagehashof("data:image/png;base64,other"),
      kind: "ocr",
      now: now + 1000,
    });
    expect(missed.entry).toBeUndefined();
    const expired = visioncacheserve({ entries: replaced, hash, kind: "ocr", now: now + 5000, retention: 4000 });
    expect(expired.entry).toBeUndefined();
    expect(expired.expired).toBe(1);
    expect(expired.entries).toHaveLength(0);
    expect(visioncacheserve({ entries: replaced, hash, kind: "ocr", now: now + 5000 }).entry?.hits).toBe(4);
    expect(visioncacheexpirygate({ entryat: now, now: now + 5000, retention: 4000 }).allowed).toBe(false);
    expect(visioncacheexpirygate({ entryat: now, now: now + 1000, retention: 4000 }).allowed).toBe(true);
    expect(visioncacheexpirygate({ entryat: now, now: now + 5000 }).allowed).toBe(true);
    const cost = visioncost({
      runid: "run1",
      calls: [
        { kind: "imageocr", model: true, at: now },
        { kind: "pairshot", model: false, at: now },
        { kind: "visionshot", model: true, at: now },
      ],
    });
    expect(cost.calls).toBe(3);
    expect(cost.modelcalls).toBe(2);
    expect(cost.units).toBe(2);
    expect(cost.description).toContain("2 riding the configured model endpoint");
    expect(visioncostgrade("visioncost").allowed).toBe(true);
    expect(visioncostgrade("shipmetrics").allowed).toBe(false);
  });
});
