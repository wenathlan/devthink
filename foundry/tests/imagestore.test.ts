// # imagestore.test — the herd format engine of the /images page, runnable
// with the house vitest suite:
//   bunx vitest run tests/imagestore.test.ts
// The three real clone formats (.tzst / .tar.gz / .tar.xz), the honest
// conversion plans (always through the tar layer) and the size estimates.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  convertPlan,
  estimateSize,
  FORMATS,
  formatBytes,
  formatFromExt,
  formatOf,
  pourOrder,
  seedImages,
} from "../imagestore.ts";

describe("the formats", () => {
  it("answers the three real clone formats in floor order", () => {
    assert.deepEqual(
      FORMATS.map((format) => format.ext),
      [".tzst", ".tar.gz", ".tar.xz"],
    );
    assert.deepEqual(pourOrder(), FORMATS);
  });

  it("resolves formats by id and by extension", () => {
    assert.equal(formatOf("tzst")?.ext, ".tzst");
    assert.equal(formatOf("tarxz")?.label, "the release herd");
    assert.equal(formatFromExt(".tar.gz")?.id, "targz");
    assert.equal(formatFromExt(".TAR.GZ")?.id, "targz");
    assert.equal(formatOf("nope"), undefined);
    assert.equal(formatFromExt(".zip"), undefined);
  });
});

describe("the conversion plan", () => {
  it("always goes through the tar layer, never a direct recompress", () => {
    const plan = convertPlan("tzst", "tarxz");
    assert.equal(plan.from.id, "tzst");
    assert.equal(plan.to.id, "tarxz");
    assert.match(plan.steps[0], /unpack the \.tzst layer down to the tar stream/);
    assert.match(plan.steps[1], /recompress the tar stream into \.tar\.xz/);
    assert.match(plan.steps[2], /checksum/);
  });

  it("answers a one-line no-op plan for the same format", () => {
    const plan = convertPlan("targz", "targz");
    assert.equal(plan.steps.length, 1);
    assert.match(plan.steps[0], /no conversion/);
  });

  it("builds a plan for every ordered pair of distinct formats", () => {
    for (const from of FORMATS) {
      for (const to of FORMATS) {
        const plan = convertPlan(from.id, to.id);
        assert.ok(plan.steps.length >= 1);
        if (from.id !== to.id) assert.equal(plan.steps.length, 3);
      }
    }
  });
});

describe("the estimates", () => {
  it("orders the compress shares: xz smallest, gzip the middle", () => {
    const bytes = 1_000_000_000;
    const tzst = estimateSize(bytes, "tzst");
    const targz = estimateSize(bytes, "targz");
    const tarxz = estimateSize(bytes, "tarxz");
    assert.ok(tarxz < tzst, "xz rides smaller than zstd");
    assert.ok(tzst < targz, "zstd rides smaller than gzip");
    assert.ok(tarxz > 0 && targz < bytes);
  });

  it("answers zero for empty and negative streams", () => {
    assert.equal(estimateSize(0, "tzst"), 0);
    assert.equal(estimateSize(-5, "tarxz"), 0);
  });

  it("scales linearly with the stream size", () => {
    assert.equal(estimateSize(2_000_000, "tzst"), estimateSize(1_000_000, "tzst") * 2);
  });
});

describe("the shelf", () => {
  it("replays the same shelf from the same seed", () => {
    assert.deepEqual(seedImages(314159, 6), seedImages(314159, 6));
  });

  it("shelves unique ids on real formats with positive sizes", () => {
    const shelf = seedImages(8, 12);
    assert.equal(new Set(shelf.map((image) => image.id)).size, 12);
    for (const image of shelf) {
      assert.ok(FORMATS.some((format) => format.id === image.format));
      assert.ok(image.tarBytes > 0);
    }
  });
});

describe("the byte counts", () => {
  it("renders the tabular human units", () => {
    assert.equal(formatBytes(512), "512 B");
    assert.equal(formatBytes(1024), "1.0 KB");
    assert.equal(formatBytes(1_500_000), "1.4 MB");
    assert.equal(formatBytes(2_300_000_000), "2.1 GB");
    assert.equal(formatBytes(0), "0 B");
  });
});
