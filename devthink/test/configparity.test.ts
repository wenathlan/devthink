// # configparity.test — the family config parity cell (the devfold law):
// the parity gate retired from the standalone arm into the config owner,
// and the cell rides the exported gate because the module's own getry
// specifiers resolve only through the vitest alias lane (the ci
// config-parity job runs this cell the same way the family suite does).
// runnable with vitest: pnpm vitest run test/configparity.test.ts
import { describe, expect, it } from "vitest";
import { runparitygate } from "../config.ts";

describe("the family config parity gate", () => {
  it("walks the eleven app roots and answers green on the standard config set", () => {
    expect(() => runparitygate()).not.toThrow();
  });
});
