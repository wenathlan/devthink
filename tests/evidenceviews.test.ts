import { describe, expect, it } from "vitest";
import {
  comparepairof,
  comparepairsforsteps,
  overlayslider,
  shotpanelof,
  shotpanelpan,
  shotpanelzoom,
} from "../views.js";
import { shotpanelgate } from "../policy.js";

const now = 1_800_000_000_000;

describe("shotpanel and compareviewer", () => {
  it("opens the shotpanel view of a granted origin with its redaction verdicts and refuses ungranted captures", () => {
    const view = shotpanelof({
      stepid: "step-2",
      runid: "run-1",
      captureid: "shot-9",
      provenance: "fullpage",
      origin: "https://example.com",
      granted: ["https://example.com"],
      redactions: [{ region: "top right card", verdict: "The card number region stays redacted." }],
      at: now,
    });
    expect(view.captureid).toBe("shot-9");
    expect(view.provenance).toBe("fullpage");
    expect(view.redactions[0]?.verdict).toMatch(/redacted/);
    expect(view.zoom).toBe(1);
    expect(() =>
      shotpanelof({
        stepid: "step-2",
        runid: "run-1",
        captureid: "shot-9",
        provenance: "viewport",
        origin: "https://other.example",
        granted: ["https://example.com"],
        at: now,
      }),
    ).toThrow(/allowlist/);
    expect(shotpanelgate({ captureorigin: "https://example.com", granted: ["https://example.com"] }).allowed).toBe(
      true,
    );
    expect(shotpanelgate({ captureorigin: "https://other.example", granted: ["https://example.com"] }).reason).toMatch(
      /granted origins/,
    );
  });

  it("zooms and pans the large stitched captures", () => {
    let view = shotpanelof({
      stepid: "step-2",
      runid: "run-1",
      captureid: "shot-9",
      provenance: "fullpage",
      origin: "https://example.com",
      granted: ["https://example.com"],
      at: now,
    });
    view = shotpanelzoom(view, 2);
    expect(view.zoom).toBe(2);
    view = shotpanelzoom(view, 1.5);
    expect(view.zoom).toBe(3);
    view = shotpanelpan(view, { x: 40, y: -10 });
    expect(view.pan).toEqual({ x: 40, y: -10 });
    expect(() => shotpanelzoom(view, 0)).toThrow(/positive/);
  });

  it("pairs the before and after captures of every executed write step and overlays them with a slider", () => {
    const pair = comparepairof({ stepid: "step-5", beforecaptureid: "shot-10", aftercaptureid: "shot-11" });
    expect(pair.slidervalue).toBe(50);
    const slid = overlayslider(pair, 80);
    expect(slid.slidervalue).toBe(80);
    expect(() => overlayslider(pair, 120)).toThrow(/between zero and one hundred/);
    expect(() => comparepairof({ stepid: "step-5", beforecaptureid: "shot-10", aftercaptureid: "shot-10" })).toThrow(
      /distinct/,
    );
    const pairs = comparepairsforsteps(
      [
        { stepid: "read-1", risk: "read", writeexecuted: false },
        { stepid: "fill-2", risk: "sensitive", writeexecuted: true },
        { stepid: "fill-3", risk: "sensitive", writeexecuted: false },
      ],
      { "fill-2": { beforecaptureid: "b-2", aftercaptureid: "a-2" }, "fill-3": { beforecaptureid: "b-3" } },
    );
    expect(pairs.map((candidate) => candidate.stepid)).toEqual(["fill-2"]);
    expect(pairs[0]?.beforecaptureid).toBe("b-2");
  });
});
