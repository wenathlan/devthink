/**
 * introtarget.test.ts — the build-target resolver of the intro. The owner
 * doctrine: ONE interface serves every build target; what changes per target
 * is the TYPE OF INTRO. The resolver turns the raw VITE_DT_TARGET value into
 * the declared target and answers "web" (the SaaS intro) for anything it
 * does not know — the safe default of the public site.
 */
import { describe, expect, it } from "vitest";
import { INTRO_SEEN_KEY, type IntroTarget, panelgateverdict, resolveintrotarget } from "../introtarget";

describe("the intro target resolver", () => {
  it("resolves every literal target the intro choreography knows", () => {
    const targets: readonly IntroTarget[] = ["web", "desktop", "installer", "android", "extension"];
    for (const target of targets) expect(resolveintrotarget(target)).toBe(target);
  });

  it("normalizes the raw environment value before matching", () => {
    expect(resolveintrotarget(" web ")).toBe("web");
    expect(resolveintrotarget("DESKTOP")).toBe("desktop");
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

describe("the panel gate verdict (the entry chain: the panel is the last page)", () => {
  const session = { owner: "nathlan", createdAt: "2026-10-27T00:00:00.000Z", expiresAt: Date.now() + 60000 };

  it("opens the owned targets straight (the boot IS their intro)", () => {
    for (const target of ["desktop", "installer", "android", "extension"] as const) {
      expect(panelgateverdict(target, null, false)).toBe("open");
      expect(panelgateverdict(target, undefined, false)).toBe("open");
    }
  });

  it("locks the web target with no session and no offline unlock (the chain walks back to the auth face)", () => {
    expect(panelgateverdict("web", null, false)).toBe("locked");
    expect(panelgateverdict("web", undefined, false)).toBe("locked");
  });

  it("opens the web target with a live family session (the real door)", () => {
    expect(panelgateverdict("web", session, false)).toBe("open");
  });

  it("opens the web target with the declared offline unlock marker (the fallback door)", () => {
    expect(panelgateverdict("web", null, true)).toBe("open");
  });

  it("never lets a falsy session shape open the web gate", () => {
    expect(panelgateverdict("web", null, false)).toBe("locked");
    expect(panelgateverdict("web", undefined, false)).toBe("locked");
  });
});
