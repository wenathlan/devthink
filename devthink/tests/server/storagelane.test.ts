/**
 * The storage lane tests: every check rides the real functions against the
 * real sqlite file in the devthink data home — no mocks, no fixtures, no
 * images. Owners are unique per test so the shared store stays isolated.
 */
import { describe, expect, it } from "vitest";
import {
  DEFAULTQUOTAMB,
  StorageError,
  deleteobject,
  getobject,
  keyvalid,
  listobjects,
  putobject,
  usagefor,
} from "../../storagefamily.js";

let sequence = 0;
function newowner(): string {
  sequence += 1;
  return ["owner", String(Date.now()), String(sequence)].join("-");
}

describe("the storage lane", () => {
  it("stores, reads and rounds a real object through the vault-shaped record", () => {
    const owner = newowner();
    const stored = putobject(owner, "docs/readme", "the storage lane keeps everything in the family infrastructure", 900);
    expect(stored.bytes).toBeGreaterThan(0);
    const found = getobject(owner, "docs/readme");
    expect(found).not.toBeNull();
    expect(found?.content).toBe("the storage lane keeps everything in the family infrastructure");
    expect(found?.updatedAt).toBe(stored.updatedAt);
    const listing = listobjects(owner);
    expect(listing).toHaveLength(1);
    expect(listing[0].key).toBe("docs/readme");
  });

  it("replaces an object under the same key and keeps one record", () => {
    const owner = newowner();
    putobject(owner, "notes/first", "the first version", 900);
    putobject(owner, "notes/first", "the second version", 900);
    const found = getobject(owner, "notes/first");
    expect(found?.content).toBe("the second version");
    expect(listobjects(owner)).toHaveLength(1);
    const usage = usagefor(owner, 900);
    expect(usage.objects).toBe(1);
    expect(usage.quotamb).toBe(900);
  });

  it("refuses a write past the remaining quota and stores nothing", () => {
    const owner = newowner();
    const big = "x".repeat(2 * 1024 * 1024);
    expect(() => putobject(owner, "big/blob", big, 1)).toThrow(StorageError);
    expect(getobject(owner, "big/blob")).toBeNull();
    expect(usagefor(owner, 1).bytes).toBe(0);
  });

  it("removes an object and answers the removal honestly", () => {
    const owner = newowner();
    putobject(owner, "temp/gone", "nothing here stays", 900);
    expect(deleteobject(owner, "temp/gone")).toBe(true);
    expect(deleteobject(owner, "temp/gone")).toBe(false);
    expect(getobject(owner, "temp/gone")).toBeNull();
  });

  it("refuses keys that escape or break the shape", () => {
    const owner = newowner();
    expect(keyvalid("../../escape")).toBe(false);
    expect(keyvalid("/absolute")).toBe(false);
    expect(keyvalid("trailing/")).toBe(false);
    expect(keyvalid("docs/readme")).toBe(true);
    expect(() => putobject(owner, "../escape", "nope", 900)).toThrow(StorageError);
  });

  it("answers the default quota floor the owner asked for", () => {
    expect(DEFAULTQUOTAMB).toBe(900);
  });
});
