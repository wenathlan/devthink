/**
 * authflow.test.ts — the pure guards of the entry flow. The authentication
 * page-app (Sol/auth/auth.tsx) rides them on the owner entry chain intro →
 * explore → auth → panel: the post-session redirect (default /panel, a safe
 * ?next= override honored), the invitation passthrough (the pairing fields
 * carried untouched), the gateway normalization, the base-relative route
 * cleaner and the pairing readiness verdict.
 */
import { describe, expect, it, vi } from "vitest";
import {
  afterAuthTarget,
  handoverPath,
  normalizeGateway,
  pairingReadiness,
  routeFromPathname,
  safegatewayurl,
} from "../gateway";

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

  it("strips the deploy base a legacy ?next= arrival carries", () => {
    vi.stubEnv("BASE_URL", "/devthink/");
    try {
      expect(afterAuthTarget("?next=%2Fdevthink%2Fpanel")).toBe("/panel");
      expect(afterAuthTarget("?next=%2Fdevthink%2Fw%2Fabc%2Fs%2Fdef%2Ft%2Ftab%2Fchat")).toBe(
        "/w/abc/s/def/t/tab/chat",
      );
      // the base address itself answers the site root
      expect(afterAuthTarget("?next=/devthink")).toBe("/");
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("the base-relative route cleaner", () => {
  it("answers a route unchanged under the root and relative bases", () => {
    expect(routeFromPathname("/panel", "/")).toBe("/panel");
    expect(routeFromPathname("/panel", "./")).toBe("/panel");
    expect(routeFromPathname("/panel")).toBe("/panel");
  });

  it("strips the deploy folder prefix a full pathname carries", () => {
    expect(routeFromPathname("/devthink/panel", "/devthink/")).toBe("/panel");
    expect(routeFromPathname("/devthink/panel", "/devthink")).toBe("/panel");
    expect(routeFromPathname("/devthink", "/devthink/")).toBe("/");
    expect(routeFromPathname("/devthink/w/abc/s/def/t/tab/chat", "/devthink/")).toBe("/w/abc/s/def/t/tab/chat");
  });

  it("never strips a prefix the path does not actually carry", () => {
    expect(routeFromPathname("/panel", "/devthink/")).toBe("/panel");
    expect(routeFromPathname("/devthinker/panel", "/devthink/")).toBe("/devthinker/panel");
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
    expect(
      pairingReadiness({ gatewayUrl: "javascript:alert(1)", pairingId: "pair-1", code: "ABCD1234" }).missing,
    ).toEqual(["gateway"]);
  });
});

describe("the gateway call guard", () => {
  it("accepts the absolute http and https gateways the visitor owns", () => {
    expect(safegatewayurl(" http://127.0.0.1:8787/ ")).toBe("http://127.0.0.1:8787");
    expect(safegatewayurl("https://gateway.example.com/base/")).toBe("https://gateway.example.com/base");
  });

  it("refuses the schemes and tricks that turn the pairing into an exfiltration", () => {
    expect(safegatewayurl("javascript:alert(1)")).toBeUndefined();
    expect(safegatewayurl("file:///etc/passwd")).toBeUndefined();
    expect(safegatewayurl("ftp://gateway.example.com")).toBeUndefined();
    expect(safegatewayurl("data:text/html,hi")).toBeUndefined();
    expect(safegatewayurl("localhost:8787")).toBeUndefined();
    expect(safegatewayurl("//gateway.example.com")).toBeUndefined();
    expect(safegatewayurl("http://user:pass@127.0.0.1:8787")).toBeUndefined();
    expect(safegatewayurl("")).toBeUndefined();
  });

  it("strips the query and fragment the gateway base never needs", () => {
    expect(safegatewayurl("http://127.0.0.1:8787/?x=1#f")).toBe("http://127.0.0.1:8787");
  });
});
