// # timelineview.test — the pure view-model of the edit surface, runnable
// with the node built-in runner (no dependencies, no install):
//   node --test tests/timelineview.test.ts
// Every test watches the three promises the module makes: the tick↔pixel
// mapping never invents time (pixels floor, ticks saturate), the ruler picks
// the smallest readable step deterministically and labels with the exact
// SMPTE display, and the playhead helpers (edit points, magnet, quantized
// advance) only ever land on boundaries the algebra itself knows about.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { EditIssue, EditItem, EditTrack } from "../timelineedit.ts";
import {
  advanceplayhead,
  clipgeometry,
  DEFAULT_ZOOM_INDEX,
  editpoints,
  mediawindow,
  pxtotick,
  refusalnote,
  rulerticks,
  SLATE_FACES,
  sequenceend,
  slateface,
  snapedit,
  stockbin,
  ticktopx,
  visiblewindow,
  ZOOM_LEVELS,
} from "../timelineview.ts";
import { frameduration, MAX_TICKS, TICKS_PER_SECOND, tickofframe } from "../timeticks.ts";

const R24 = { num: 24, den: 1 };

function item(id: number, start: number, duration: number, sourceIn = 0, speed = 1): EditItem {
  return { id, start, duration, sourceIn, speed };
}

function track(items: EditItem[]): EditTrack {
  return { id: 1, locked: false, syncLock: false, items };
}

describe("timelineview mapping", () => {
  it("converts ticks to px and back without inventing time", () => {
    const px = 64;
    assert.equal(ticktopx(TICKS_PER_SECOND, px), px);
    // a floored round trip: px→tick floors, so tick→px→tick lands on the same tick
    const t = 2 * TICKS_PER_SECOND + 12345;
    assert.equal(pxtotick(ticktopx(t, 64), 64), t);
    // half a second at 64 px/s
    assert.equal(ticktopx(TICKS_PER_SECOND / 2, 64), 32);
    assert.equal(pxtotick(32, 64), TICKS_PER_SECOND / 2);
  });

  it("answers zero on damaged input instead of throwing", () => {
    assert.equal(ticktopx(Number.NaN, 64), 0);
    assert.equal(ticktopx(TICKS_PER_SECOND, 0), 0);
    assert.equal(pxtotick(Number.NaN, 64), 0);
    assert.equal(pxtotick(100, Number.NaN), 0);
    assert.equal(pxtotick(-50, 64), 0);
  });

  it("floors pixels coarser than ticks and saturates at the tick ceiling", () => {
    assert.equal(pxtotick(1, 64), Math.floor((1 / 64) * TICKS_PER_SECOND));
    // an absurd pixel offset saturates at the tick ceiling instead of overflowing
    assert.equal(pxtotick(1e9, 64), Number.MAX_SAFE_INTEGER);
  });
});

describe("timelineview ruler", () => {
  it("picks the smallest step whose majors clear 72 px", () => {
    // 64 px/s: 0.5s = 32px (too tight), 1s = 64px (too tight), 2s = 128px ✓
    const ticks = rulerticks(0, 10 * TICKS_PER_SECOND, R24, 64);
    const majors = ticks.filter((entry) => entry.major);
    assert.equal(majors.length, 6); // 0,2,4,6,8,10 — inclusive window
    assert.equal(majors[0].label, "00:00:00:00");
    assert.equal(majors[1].label, "00:00:02:00");
  });

  it("widens the step as the zoom drops and labels with exact timecode", () => {
    // 8 px/s: even 60s = 480px, 0.5s = 4px… majors = 8s? no: 8*8=64 <72, 10s = 80 ✓
    const ticks = rulerticks(0, 30 * TICKS_PER_SECOND, R24, 8);
    const majors = ticks.filter((entry) => entry.major);
    assert.equal(majors[0].label, "00:00:00:00");
    assert.equal(majors[1].label, "00:00:10:00");
  });

  it("stays bounded and empty on damaged windows", () => {
    assert.deepEqual(rulerticks(5, 5, R24, 64), []);
    assert.deepEqual(rulerticks(10, 0, R24, 64), []);
    const bounded = rulerticks(0, Number.MAX_SAFE_INTEGER, R24, 64);
    assert.ok(bounded.length <= 1600);
  });
});

describe("timelineview geometry", () => {
  it("places clips and floors the width at 2 px", () => {
    const one = item(1, TICKS_PER_SECOND, TICKS_PER_SECOND / 2);
    assert.deepEqual(clipgeometry(one, 64), { left: 64, width: 32 });
    const sliver = item(2, 0, 1); // one tick — invisible, but grabbable
    assert.deepEqual(clipgeometry(sliver, 64), { left: 0, width: 2 });
  });

  it("maps the media window of a clip against its source", () => {
    const clipped = item(1, 0, TICKS_PER_SECOND, 2 * TICKS_PER_SECOND, 1);
    assert.deepEqual(mediawindow(clipped, 4 * TICKS_PER_SECOND), { from: 0.5, to: 0.75 });
    // unknown source: the full window (the face paints whole)
    assert.deepEqual(mediawindow(clipped, null), { from: 0, to: 1 });
    assert.deepEqual(mediawindow(clipped, 0), { from: 0, to: 1 });
    // over-speed reading clamps to the source end
    const fast = item(2, 0, 4 * TICKS_PER_SECOND, 2 * TICKS_PER_SECOND, 4);
    assert.equal(mediawindow(fast, 4 * TICKS_PER_SECOND).to, 1);
  });
});

describe("timelineview sequence + playhead", () => {
  it("answers the sequence end and the sorted edit points", () => {
    const trk = track([item(1, 10, 5), item(2, 0, 5), item(3, 20, 5)]);
    assert.equal(sequenceend(trk), 25);
    assert.deepEqual(editpoints(trk), [0, 5, 10, 15, 20, 25]);
    assert.deepEqual(editpoints(track([])), [0]);
  });

  it("magnet-snaps the playhead to the nearest edit point inside the threshold", () => {
    const trk = track([item(1, 0, 10), item(2, 10, 10)]);
    assert.equal(snapedit(trk, 9, 2), 10);
    assert.equal(snapedit(trk, 9, 0.5), null);
    // a tie answers the earlier point — the cut behind the playhead wins
    assert.equal(snapedit(trk, 15, 5), 10);
    assert.equal(snapedit(trk, 14.5, 5), 10);
    assert.equal(snapedit(trk, 15, 0), null);
  });

  it("advances the playhead by wall clock, quantized to frames when asked", () => {
    const frame = frameduration(R24);
    const start = tickofframe(R24, 12);
    const plain = advanceplayhead(R24, start, 1000, false);
    assert.equal(plain, start + TICKS_PER_SECOND);
    const quantized = advanceplayhead(R24, start + Math.round(frame * 0.4), 1000, true);
    assert.equal(quantized, tickofframe(R24, 36)); // 12 frames + 1 s (24 frames), snapped nearest
    // non-advance answers the (quantized) input
    assert.equal(advanceplayhead(R24, start, 0, true), start);
    assert.equal(advanceplayhead(R24, start, -5, false), start);
  });

  it("answers the visible tick window for a scroll offset", () => {
    const win = visiblewindow(128, 64, 64);
    assert.deepEqual(win, { from: 2 * TICKS_PER_SECOND, to: 3 * TICKS_PER_SECOND });
    assert.deepEqual(visiblewindow(-10, 0, 64).from, 0);
  });
});

describe("timelineview stock bin", () => {
  it("ships deterministic slates with exact tick durations", () => {
    const bin = stockbin();
    assert.equal(bin.length, 5);
    assert.equal(bin[0].id, "slate-01");
    assert.equal(bin[0].duration, 4 * TICKS_PER_SECOND);
    assert.equal(bin[4].duration, 2 * TICKS_PER_SECOND);
    // every slate names itself and carries a detail line
    for (const slate of bin) {
      assert.ok(slate.name.length > 0);
      assert.ok(slate.detail.length > 0);
    }
  });

  it("wraps the rose face ramp for any bin index", () => {
    assert.equal(slateface(0), "#f472b6");
    assert.equal(slateface(5), slateface(0));
    assert.equal(slateface(-1), slateface(4));
  });
});

describe("timelineview refusal vocabulary", () => {
  /** the full issue vocabulary of the algebra — the surface must answer every key. */
  const ISSUES: readonly EditIssue[] = [
    "locked",
    "no-item",
    "sync-lock-conflict",
    "no-handles",
    "too-short",
    "overlap",
    "nothing",
  ];

  it("answers an honest one-line note for every issue the algebra can return", () => {
    const notes = new Set<string>();
    for (const issue of ISSUES) {
      const note = refusalnote(issue);
      assert.ok(typeof note === "string" && note.length > 0, `${issue} must carry a note`);
      assert.ok(!note.includes("undefined"), `${issue} must not leak undefined`);
      notes.add(note);
    }
    // every note is distinct — the readout never blurs two refusals together
    assert.equal(notes.size, ISSUES.length);
  });

  it("keeps the refusals honest — they say what was kept and why", () => {
    assert.match(refusalnote("locked"), /unlock/);
    assert.match(refusalnote("no-handles"), /master handles/);
    assert.match(refusalnote("too-short"), /one frame/);
    assert.match(refusalnote("overlap"), /neighbour/);
    assert.match(refusalnote("nothing"), /nothing/);
  });
});

describe("timelineview zoom ladder", () => {
  it("keeps the ladder ascending with a sane default index", () => {
    assert.ok(ZOOM_LEVELS.length >= 4);
    for (let i = 1; i < ZOOM_LEVELS.length; i++) assert.ok(ZOOM_LEVELS[i] > ZOOM_LEVELS[i - 1]);
    assert.ok(DEFAULT_ZOOM_INDEX >= 0 && DEFAULT_ZOOM_INDEX < ZOOM_LEVELS.length);
    assert.equal(ZOOM_LEVELS[DEFAULT_ZOOM_INDEX], 64);
  });
});

describe("timelineview saturation + honesty", () => {
  const BANNED = new Set(["#3b82f6", "#2563eb", "#f97316"]);
  const MASTER_TICKS = 20 * TICKS_PER_SECOND;

  it("saturates the playhead at the tick ceiling instead of overflowing", () => {
    // a wall clock absurdity (a tab left playing for years) must clamp, never wrap
    assert.equal(advanceplayhead(R24, 0, Number.MAX_SAFE_INTEGER, false), Number.MAX_SAFE_INTEGER);
    assert.equal(advanceplayhead(R24, 0, Number.MAX_SAFE_INTEGER, true), MAX_TICKS);
    // the quantized ceiling is a real frame boundary, not NaN
    assert.equal(advanceplayhead(R24, MAX_TICKS, 1000, true), MAX_TICKS);
  });

  it("keeps the stock bin deterministic and every cut inside the 20 s master", () => {
    const bin = stockbin();
    assert.deepEqual(bin, stockbin());
    // the surface trims against a 20 s master: slate i reads from 2i s, so the
    // furthest source out must clear the handles for every slate
    for (let i = 0; i < bin.length; i++) {
      const sourceOut = i * 2 * TICKS_PER_SECOND + bin[i].duration;
      assert.ok(sourceOut <= MASTER_TICKS, `${bin[i].name} exceeds the master's handles`);
    }
  });

  it("paints the clip faces in the house rose ramp only", () => {
    assert.deepEqual(SLATE_FACES, ["#f472b6", "#ec4899", "#f9a8d4", "#db2777", "#f78dc3"]);
    for (const face of SLATE_FACES) {
      assert.ok(!BANNED.has(face), `a slate face rides a banned default: ${face}`);
    }
    // any index (even absurd ones) answers a face from the ramp — never invented
    for (const index of [0, 1, 7, 999, -3, Number.NaN]) {
      assert.ok(SLATE_FACES.includes(slateface(index)), `slateface(${index}) left the ramp`);
    }
  });
});
