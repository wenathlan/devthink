/**
 * authflow.test.ts — the pure guards of the entry flow. The retired /auth
 * entry pass survives only as a compat handover: it navigates through these
 * guards to the destination the OS already resolves silently — the
 * post-session redirect (default /panel, a safe ?next= override honored),
 * the silent handover path (the same target with the pairing invitation
 * fields passed through untouched), the gateway normalization and the
 * pairing readiness verdict.
 */
import { describe, expect, it } from "vitest";
import { afterAuthTarget, handoverPath, normalizeGateway, pairingReadiness } from "../Sol/auth/authgate";

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

describe("the silent handover path", () => {
  it("answers the plain panel route when there is nothing to pass through", () => {
    expect(handoverPath("")).toBe("/panel");
    expect(handoverPath("?next=/docs")).toBe("/docs");
  });

  it("passes the pairing invitation fields through untouched", () => {
    expect(handoverPath("?gateway=http://127.0.0.1:8787&pair=pair-1&code=ABCD1234")).toBe(
      "/panel?gateway=http%3A%2F%2F127.0.0.1%3A8787&pair=pair-1&code=ABCD1234",
    );
  });

  it("drops unknown fields so a crafted query never rides along", () => {
    expect(handoverPath("?pair=pair-1&code=ABCD1234&next=https://evil.example")).toBe(
      "/panel?pair=pair-1&code=ABCD1234",
    );
  });

  it("joins with & when a next target already carries its own query", () => {
    expect(handoverPath("?next=%2Fpanel%3Fx%3D1&pair=pair-1&code=ABCD1234")).toBe(
      "/panel?x=1&pair=pair-1&code=ABCD1234",
    );
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
    expect(pairingReadiness({ gatewayUrl: "", pairingId: "", code: "" }).missing).toEqual([
      "gateway",
      "pairing",
      "code",
    ]);
    expect(pairingReadiness({ gatewayUrl: "http://127.0.0.1:8787", pairingId: " ", code: "ABC" }).missing).toEqual([
      "pairing",
      "code",
    ]);
    expect(
      pairingReadiness({ gatewayUrl: "http://127.0.0.1:8787", pairingId: "pair-1", code: "ABCD12345" }).missing,
    ).toEqual(["code"]);
  });
});
