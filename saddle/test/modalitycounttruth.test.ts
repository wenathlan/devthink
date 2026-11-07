// # modalitycounttruth.test — the count truth battery: the saddle
// modality registry's actual row count is the one number every surface
// answers. the modality ladder freezes at 30-90 (the registry never
// claims a count outside the frozen band) and the ninety-modalities law
// the readme carries must match the registry rows. the doc-surface walk
// reads the surfaces the audit found carrying counts and refuses any
// divergent claim (24/30/40/50/60 drift the audit healed): a surface
// either states the registry count or states no count at all. runnable
// with vitest: pnpm vitest run test/modalitycounttruth.test.ts
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import {
  MODALITIES,
  MODALITYPLANCOUNT,
  MODALITY_COUNT,
  planreport,
} from "../modalityregistry.ts";

/** the frozen ladder band the owner charged (law 47: the modality
 * ladder target freezes at 30-90, doctrine 100+1). */
const LADDERMIN = 30;
const LADDERMAX = 90;

/** the doc surfaces the count-truth audit found carrying modality count
 * claims. the battery walks them against the registry every run, so a
 * divergent claim (the 24/30/40/50/60 drift the complaint named) cannot
 * land again without reding the battery. a missing file skips (the
 * published package carries none of the doc seats). */
const TRUTHSURFACES = [
  "../../saddle/README.md",
  "../../devthink/docs/rulesofficial.md",
  "../../devthink/docs/rulesofical.md",
  "../../devthink/docs/infra.md",
  "../../devthink/docs/doctrine.md",
] as const;

/** the count-claim grammar: a number stated right beside the modality
 * word, or the stale ladder phrasings the audit retired (more than n
 * modalities, walking to n, toward n, and the slashed demand ladders
 * like 30 / 40 / 90 modalidades). */
const COUNTCLAIM = /(\d{1,3})\s*(?:sandbox\s+|vm\s+)*modalidades|modalities|more than (\d{1,3}) modalit|walking to (\d{1,3})|toward (\d{1,3}) modalit/gi;

/** the retired word-form claims (the spelled-out drift the audit
 * healed: quarenta/trinta modalidades, forty/thirty modalities) — any
 * of them beside a modality word is always a divergence, the truth
 * being ninety/noventa. */
const WORDCLAIM = /(?:quarenta|cinquenta|trinta)\s+modalidades|(?:forty|fifty|thirty)\s+(?:sandbox\s+)?modalities/i;

function surfaceline(rooturl: URL, rel: string): string | null {
  const fileurl = new URL(rel, rooturl);
  if (!existsSync(fileURLToPath(fileurl))) return null;
  return readFileSync(fileURLToPath(fileurl), "utf8");
}

/** every number the line claims beside a modality word. */
function countclaims(line: string): number[] {
  const claims: number[] = [];
  for (const m of line.matchAll(COUNTCLAIM)) {
    const n = Number(m[1] ?? m[2] ?? m[3] ?? m[4]);
    if (Number.isFinite(n) && n > 0) claims.push(n);
  }
  return claims;
}

describe("the modality count truth", () => {
  it("the registry row count is the one number every surface answers", () => {
    assert.equal(MODALITIES.length, MODALITYPLANCOUNT, "the catalog length answers the plan line");
    assert.equal(MODALITY_COUNT, MODALITIES.length, "the derived count never drifts from the catalog");
    const report = planreport();
    assert.equal(report.catalogcount, MODALITY_COUNT);
    assert.equal(report.live + report.host + report.planned, MODALITY_COUNT, "the census sums to the count");
  });

  it("the ladder stays frozen inside the 30-90 band", () => {
    assert.ok(MODALITY_COUNT >= LADDERMIN, `the count ${MODALITY_COUNT} never walks below the frozen band floor ${LADDERMIN}`);
    assert.ok(MODALITY_COUNT <= LADDERMAX, `the count ${MODALITY_COUNT} never walks above the frozen band ceiling ${LADDERMAX}`);
    assert.equal(MODALITYPLANCOUNT, MODALITY_COUNT, "the plan line and the registry rows agree");
  });

  it("the registry rows cover the first through the ninetieth seat exactly once", () => {
    const nums = MODALITIES.map((modality) => (modality as unknown as { num: number }).num).sort((a, b) => a - b);
    for (let expected = 1; expected <= MODALITY_COUNT; expected += 1) {
      assert.equal(nums[expected - 1], expected, `the seat ${expected} rides the registry exactly once`);
    }
  });

  it("the doc surfaces never claim a count the registry does not carry", () => {
    const rooturl = new URL(import.meta.url);
    for (const rel of TRUTHSURFACES) {
      const body = surfaceline(rooturl, rel);
      if (body === null) continue; // the published envelope carries no doc seat
      const lines = body.split("\n");
      lines.forEach((line, index) => {
        if (!/modalit|modalidade/i.test(line)) return;
        assert.ok(
          !WORDCLAIM.test(line),
          `${rel.replace("../../", "")}:${index + 1} carries a retired word-form count — the registry answers ${MODALITY_COUNT}`,
        );
        for (const claim of countclaims(line)) {
          assert.equal(
            claim,
            MODALITY_COUNT,
            `${rel.replace("../../", "")}:${index + 1} claims ${claim} — the registry answers ${MODALITY_COUNT} (the code registry is the truth)`,
          );
        }
      });
    }
  });
});
