// # runstream.test — the deterministic log replay of the /logs page,
// runnable with the node built-in runner (no dependencies, no install):
//   node --test tests/runstream.test.ts
// One seed unrolls the whole line stream: the same seed answers the same
// lines forever, the outcome derives from the stream itself, the prefix
// window and the census are pure.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatLogTime, linesWithin, logCensus, logDuration, logOutcome, logText, runLogLines } from "../runstream.ts";

describe("replay determinism", () => {
  it("answers the same stream from the same seed", () => {
    assert.deepEqual(runLogLines(421337), runLogLines(421337));
  });

  it("answers the same stream for the same seed at any size", () => {
    const a = runLogLines(7, 9);
    const b = runLogLines(7, 9);
    assert.deepEqual(a, b);
    assert.equal(a.length, 3 + 9 + 2);
  });

  it("opens every run with the three boot lines in order", () => {
    const lines = runLogLines(1);
    assert.match(lines[0].text, /^floor: accepting run on the /);
    assert.match(lines[1].text, /mount sandbox/);
    assert.match(lines[2].text, /restore working set/);
  });

  it("keeps the stream chronological (t never goes backwards)", () => {
    const lines = runLogLines(90012);
    for (let i = 1; i < lines.length; i++) {
      assert.ok(lines[i].t >= lines[i - 1].t, `line ${i} drifted backwards`);
    }
  });

  it("answers differing streams for differing seeds (over 20 seeds)", () => {
    const firsts = new Set<string>();
    for (let seed = 1; seed <= 20; seed++) {
      const lines = runLogLines(seed);
      firsts.add(JSON.stringify(lines));
    }
    // at most two identical streams across 20 seeds is well within chance
    assert.ok(firsts.size >= 18, `expected near-unique streams, got ${firsts.size}`);
  });
});

describe("outcome honesty", () => {
  it("derives success when the stream carries no error", () => {
    const lines = runLogLines(421337);
    if (lines.some((line) => line.level === "error")) return;
    assert.equal(logOutcome(lines), "success");
  });

  it("derives failed from the error line itself", () => {
    const lines = runLogLines(1, 1); // small stream; find a failing seed
    let failing: ReturnType<typeof runLogLines> | undefined;
    for (let seed = 0; seed < 64 && !failing; seed++) {
      const candidate = runLogLines(seed);
      if (candidate.some((line) => line.level === "error")) failing = candidate;
    }
    assert.ok(failing, "some seed in 0..63 must fail");
    void lines;
    assert.equal(logOutcome(failing), "failed");
    const last = failing[failing.length - 1];
    assert.match(last.text, /outcome: failed/);
  });

  it("closes a successful run with the report line", () => {
    for (let seed = 0; seed < 64; seed++) {
      const lines = runLogLines(seed);
      if (!lines.some((line) => line.level === "error")) {
        assert.match(lines[lines.length - 1].text, /outcome: success/);
        return;
      }
    }
    assert.fail("no successful seed found in 0..63");
  });
});

describe("window and clock", () => {
  it("linesWithin answers the chronological prefix", () => {
    const lines = runLogLines(5124);
    const mid = logDuration(lines) / 2;
    const head = linesWithin(lines, mid);
    assert.ok(head.length > 0);
    assert.ok(head.length < lines.length);
    assert.deepEqual(
      head,
      lines.filter((line) => line.t <= mid),
    );
  });

  it("linesWithin at zero answers only the boot head, at full the whole stream", () => {
    const lines = runLogLines(5124);
    assert.ok(linesWithin(lines, 0).length >= 1);
    assert.deepEqual(linesWithin(lines, logDuration(lines)), lines);
  });

  it("logDuration answers the last timestamp", () => {
    const lines = runLogLines(77031);
    assert.equal(logDuration(lines), Math.max(...lines.map((line) => line.t)));
  });

  it("formatLogTime renders the tabular mm:ss.mmm clock", () => {
    assert.equal(formatLogTime(0), "00:00.000");
    assert.equal(formatLogTime(1000), "00:01.000");
    assert.equal(formatLogTime(61_234), "01:01.234");
    assert.equal(formatLogTime(600_000), "10:00.000");
    assert.equal(formatLogTime(-5), "00:00.000");
  });

  it("logCensus counts every level and sums to the total", () => {
    const lines = runLogLines(77031);
    const census = logCensus(lines);
    assert.equal(census.info + census.warn + census.error, lines.length);
  });

  it("logText renders one line per stream line with the clock first", () => {
    const lines = runLogLines(421337);
    const text = logText(lines);
    const rows = text.split("\n");
    assert.equal(rows.length, lines.length);
    assert.match(rows[0], /^\d{2}:\d{2}\.\d{3} info /);
  });
});
