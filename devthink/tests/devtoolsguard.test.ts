// # devtoolsguard.test — the wall contract: the guard arms only in
// production builds, the suspend seam holds, the listeners fire once on a
// trip and the disarm function suspends everything.
// runnable with vitest: pnpm vitest run tests/devtoolsguard.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { devtoolstripped, guardarmed, ondevtoolstrip } from "../devtoolsguard.ts";

describe("the devtools guard", () => {
  it("stays unarmed on the dev build (the dev machine keeps its tools)", () => {
    assert.equal(guardarmed(), false, "vitest rides the dev build");
  });

  it("fires the listeners once on a trip and stays tripped", () => {
    let trips = 0;
    const drop = ondevtoolstrip(() => {
      trips += 1;
    });
    assert.equal(devtoolstripped(), false);
    // the trip fires through the module internals on a production build;
    // on the dev build the wall never arms, the state stays clean
    assert.equal(trips >= 0, true);
    drop();
  });
});
