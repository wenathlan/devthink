// # catalog.test — the vitrine seam of the site catalog (wave PV4.004):
// the fold that carries one gateway wire row (the GET /api/v1/tracks
// answer) onto the catalog row the home song grid reads — one law both
// shapes ride, so the site api and the tests answer the same fold — and
// the offline law: the seed answers the honest empty shelf (never a fake
// published take; the publish lane fills the rows, the db serves them).
// runnable with vitest:
//   pnpm vitest run tests/catalog.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { listVitrineTracks, vitrineRowOf } from "../catalog.ts";
import type { VitrineTrackValue } from "../gatewayapi.ts";
import type { VitrineTrackRow } from "../katexis.ts";
import { seedVitrineTracks } from "../seed.ts";

/** One wire row the publish lane answers (the gateway's own projection). */
function wireRow(overrides: Partial<VitrineTrackValue> = {}): VitrineTrackValue {
  const base: VitrineTrackValue = {
    kind: "render",
    id: "7521765765602607866",
    name: "Gateway lane take",
    genre: "dark trap",
    seconds: 9,
    status: "ready",
    wavPointer: "7521765765602608001",
    ownerId: "7521765765602607860",
    publishedAt: "2026-06-01T00:00:00.000Z",
  };
  return { ...base, ...overrides };
}

describe("catalog — the vitrine seam", () => {
  it("folds one wire row onto the catalog row (the one law both shapes ride)", () => {
    const row: VitrineTrackRow = vitrineRowOf(wireRow());
    assert.equal(row.group, "vitrine");
    assert.equal(row.kind, "render");
    assert.equal(row.id, "7521765765602607866");
    assert.equal(row.name, "Gateway lane take");
    assert.equal(row.genre, "dark trap");
    assert.equal(row.seconds, 9);
    assert.equal(row.blobId, "7521765765602608001", "the wav pointer rides the blob lane the play key resolves");
    assert.equal(row.mime, "audio/wav");
    assert.equal(row.publishedAt, "2026-06-01T00:00:00.000Z");
  });

  it("folds a reference row beside the render row (one grammar)", () => {
    const row = vitrineRowOf(wireRow({ kind: "reference", id: "pub-a-vitrine", wavPointer: "7521765765602608002" }));
    assert.equal(row.kind, "reference");
    assert.equal(row.id, "pub-a-vitrine");
    assert.equal(row.blobId, "7521765765602608002");
  });

  it("answers the honest empty shelf offline (the seed never fakes a published take)", async () => {
    assert.deepEqual(seedVitrineTracks, []);
    const rows = await listVitrineTracks();
    assert.deepEqual(rows, [], "nothing is published until a real row lands");
  });
});
