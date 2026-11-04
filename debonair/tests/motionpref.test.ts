// # motionpref.test — the in-session reduce-motion switch the settings page
// drives: the document flag (data-motion="reduced") and the session note ride
// injectable stubs, so the honest toggle is pinned without a browser. The
// stylesheet guards answer to the attribute; this test pins the attribute.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  MOTION_PREF_KEY,
  type MotionRoot,
  memoryMotionStorage,
  reduceMotionApplied,
  reduceMotionStored,
  setReduceMotion,
  toggleReduceMotion,
} from "../motionpref.ts";

/** A root stub that answers like the <html> element. */
function stubRoot(): MotionRoot & { attrs: Map<string, string> } {
  const attrs = new Map<string, string>();
  return {
    attrs,
    getAttribute: (name) => attrs.get(name) ?? null,
    setAttribute: (name, value) => {
      attrs.set(name, value);
    },
    removeAttribute: (name) => {
      attrs.delete(name);
    },
  };
}

describe("motionpref", () => {
  it("applies and clears the document flag with the session note", () => {
    const root = stubRoot();
    const storage = memoryMotionStorage();
    setReduceMotion(true, storage, root);
    assert.equal(reduceMotionApplied(root), true);
    assert.equal(reduceMotionStored(storage), true);
    assert.equal(root.attrs.get("data-motion"), "reduced");
    assert.equal(storage.getItem(MOTION_PREF_KEY), "1");

    setReduceMotion(false, storage, root);
    assert.equal(reduceMotionApplied(root), false);
    assert.equal(reduceMotionStored(storage), false);
    assert.equal(root.attrs.has("data-motion"), false);
    assert.equal(storage.getItem(MOTION_PREF_KEY), null);
  });

  it("toggles from the current document state", () => {
    const root = stubRoot();
    const storage = memoryMotionStorage();
    assert.equal(toggleReduceMotion(storage, root), true);
    assert.equal(reduceMotionApplied(root), true);
    assert.equal(toggleReduceMotion(storage, root), false);
    assert.equal(reduceMotionApplied(root), false);
  });

  it("degrades when the session storage refuses the write", () => {
    const root = stubRoot();
    const frozen = memoryMotionStorage();
    const broken = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {
        throw new Error("quota");
      },
    };
    setReduceMotion(true, broken as typeof frozen, root);
    // the document flag still holds — the interface stays honest for this tab
    assert.equal(reduceMotionApplied(root), true);
    assert.equal(reduceMotionStored(frozen), false);
  });

  it("reads an untouched document and storage as motion allowed", () => {
    const root = stubRoot();
    const storage = memoryMotionStorage();
    assert.equal(reduceMotionApplied(root), false);
    assert.equal(reduceMotionStored(storage), false);
  });
});
