// # bigintids.test — the pointer mint the storage law names: ids sort by
// creation (the high bits carry the clock), never collide within a tick
// (the tail increments), self-describe their mint time and ride the strong
// platform randomness. runnable with vitest: pnpm vitest run tests/bigintids.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { idtick, mintid } from "../debonair/bigintids.ts";

describe("bigintids", () => {
  it("mints ascending ids across ticks", () => {
    const base = 1_700_000_000_000;
    let previous = 0n;
    for (let i = 0; i < 200; i++) {
      const id = BigInt(mintid(base + i));
      assert.ok(id > previous, `id ${id} must exceed ${previous}`);
      previous = id;
    }
  });

  it("never repeats inside one millisecond (the tail walks)", () => {
    const base = 1_700_000_000_000;
    const seen = new Set<string>();
    for (let i = 0; i < 5000; i++) seen.add(mintid(base));
    assert.equal(seen.size, 5000);
  });

  it("self-describes the mint tick", () => {
    const at = 1_700_000_012_345;
    const id = mintid(at);
    assert.equal(idtick(id), at);
  });
});
