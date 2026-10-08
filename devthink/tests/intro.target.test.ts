/**
 * intro.target.test.ts — the build-target resolver of the intro. The owner
 * doctrine: ONE interface serves every build target; what changes per target
 * is the TYPE OF INTRO. The resolver turns the raw VITE_DT_TARGET value into
 * the declared target and answers "web" (the SaaS intro) for anything it
 * does not know — the safe default of the public site.
 */
import { describe, expect, it } from "vitest";
import { INTRO_SEEN_KEY, resolveintrotarget, type IntroTarget } from "../intro.target";

describe("the intro target resolver", () => {
  it("resolves every literal target the intro choreography knows", () => {
    const targets: readonly IntroTarget[] = ["web", "installer", "android", "extension"];
    for (const target of targets) expect(resolveintrotarget(target)).toBe(target);
  });

  it("normalizes the raw environment value before matching", () => {
    expect(resolveintrotarget(" web ")).toBe("web");
    expect(resolveintrotarget("INSTALLER")).toBe("installer");
    expect(resolveintrotarget("Android")).toBe("android");
    expect(resolveintrotarget("\textension\n")).toBe("extension");
  });

  it("answers web for unknown, empty and missing values", () => {
    expect(resolveintrotarget(undefined)).toBe("web");
    expect(resolveintrotarget("")).toBe("web");
    expect(resolveintrotarget("   ")).toBe("web");
    expect(resolveintrotarget("iso")).toBe("web");
    expect(resolveintrotarget("webos")).toBe("web");
    expect(resolveintrotarget("installer ")).toBe("installer");
  });
});

describe("the intro session contract", () => {
  it("keeps the seen flag under the doctrine key", () => {
    expect(INTRO_SEEN_KEY).toBe("dt.intro.seen");
  });
});
