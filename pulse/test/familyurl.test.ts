/**
 * familyurl.test.ts — the sibling link builder of the rail foot: one slug
 * in, the relative family URL out (edge slashes trimmed, trailing slash
 * included), exactly the shape the window chrome links the family with.
 */
import { describe, expect, it } from "vitest";
import { familyurl } from "../familyurl";

describe("familyurl", () => {
  it("builds the relative sibling url with the trailing slash", () => {
    expect(familyurl("cadria")).toBe("../cadria/");
  });

  it("trims the surrounding slashes of the slug", () => {
    expect(familyurl("/cadria/")).toBe("../cadria/");
  });

  it("trims repeated edge slashes on both sides", () => {
    expect(familyurl("///debonair///")).toBe("../debonair/");
  });

  it("resolves the os at the family root itself, never one segment deep", () => {
    expect(familyurl("devthink")).toBe("../");
    expect(familyurl("/devthink/")).toBe("../");
  });
});
