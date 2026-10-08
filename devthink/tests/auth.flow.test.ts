/**
 * auth.flow.test.ts — the pure guards of the authentication flow. The auth
 * page-app mounts on the session mechanisms that already exist (the
 * browser-local identity, the opt-in local CLI pairing) and navigates
 * through these guards: the post-session redirect (default /panel, a safe
 * ?next= override honored), the gateway normalization and the pairing
 * readiness verdict.
 */
import { describe, expect, it } from "vitest";
import { afterAuthTarget, normalizeGateway, pairingReadiness } from "../Sol/auth/auth.gate";

describe("the post-auth redirect guard", () => {
  it("lands on the creation panel by default", () => {
    expect(afterAuthTarget("")).toBe("/panel");
    expect(afterAuthTarget("?gateway=http://127.0.0.1:8787")).toBe("/panel");
  });

  it("honors a same-origin ?next= absolute path", () => {
    expect(afterAuthTarget("?next=/panel")).toBe("/panel");
    expect(afterAuthTarget("?next=/docs")).toBe("/docs");
    expect(afterAuthTarget("?next=/w/abc123/s/def456/t/tab789/chat")).toBe("/w/abc123/s/def456/t/tab789/chat");
  });

  it("refuses the escapes that leave the site or the route space", () => {
    expect(afterAuthTarget("?next=https://evil.example")).toBe("/panel");
    expect(afterAuthTarget("?next=//evil.example")).toBe("/panel");
    expect(afterAuthTarget("?next=/\\evil.example")).toBe("/panel");
    expect(afterAuthTarget("?next=%2F%2Fevil.example")).toBe("/panel");
    expect(afterAuthTarget("?next=/panel%20?x=1")).toBe("/panel");
  });
});

describe("the gateway normalization", () => {
  it("trims the value and strips one trailing slash", () => {
    expect(normalizeGateway(" http://127.0.0.1:8787/ ")).toBe("http://127.0.0.1:8787");
    expect(normalizeGateway("http://127.0.0.1:8787//")).toBe("http://127.0.0.1:8787/");
    expect(normalizeGateway("   ")).toBe("");
  });
});

describe("the pairing readiness verdict", () => {
  it("answers ready only when every field is filled correctly", () => {
    expect(pairingReadiness({ gatewayUrl: "http://127.0.0.1:8787", pairingId: "pair-1", code: "ABCD1234" })).toEqual({
      ready: true,
      missing: [],
    });
  });

  it("names the fields that are missing or malformed", () => {
    expect(pairingReadiness({ gatewayUrl: "", pairingId: "", code: "" }).missing).toEqual(["gateway", "pairing", "code"]);
    expect(pairingReadiness({ gatewayUrl: "http://127.0.0.1:8787", pairingId: " ", code: "ABC" }).missing).toEqual([
      "pairing",
      "code",
    ]);
    expect(pairingReadiness({ gatewayUrl: "http://127.0.0.1:8787", pairingId: "pair-1", code: "ABCD12345" }).missing).toEqual([
      "code",
    ]);
  });
});
