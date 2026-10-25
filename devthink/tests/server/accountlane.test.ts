/**
 * The account lane tests: every check rides the real functions against the
 * real sqlite store in the devthink data home — no mocks, no fixtures, no
 * network. Owners are unique per test so the shared store stays isolated.
 * The wrong-secret refusal is the 401-class verdict the route maps; the
 * duplicate create is the 409-class verdict; the garbage tokens refuse
 * before any query runs.
 */
import { beforeAll, describe, expect, it } from "vitest";
import {
  AccountError,
  createaccount,
  issueaccountsession,
  normalizeaccountowner,
  prepareaccounts,
  revokeaccountsession,
  verifyaccount,
  verifyaccountsession,
} from "../../accountlane.js";

let sequence = 0;
function newowner(): string {
  sequence += 1;
  return ["owner", String(Date.now()), String(sequence)].join("-");
}

describe("the account lane", () => {
  beforeAll(async () => {
    await prepareaccounts();
  });

  it("creates a real account and verifies the secret back", () => {
    const owner = newowner();
    const created = createaccount(owner, "the family secret 7");
    expect(created.owner).toBe(owner);
    expect(created.id.length).toBeGreaterThan(0);
    expect(created.createdAt).toBeTruthy();
    const verified = verifyaccount(owner, "the family secret 7");
    expect(verified?.id).toBe(created.id);
    expect(verified?.owner).toBe(owner);
  });

  it("refuses a wrong secret with the 401-class refusal", () => {
    const owner = newowner();
    createaccount(owner, "correct horse battery 9");
    expect(verifyaccount(owner, "wrong secret attempt")).toBeNull();
    expect(verifyaccount(owner, "")).toBeNull();
    // an absent account refuses identically — no hint about which half failed
    expect(verifyaccount(newowner(), "correct horse battery 9")).toBeNull();
  });

  it("refuses a duplicate create and never rewrites the digest", () => {
    const owner = newowner();
    createaccount(owner, "first secret 11");
    expect(() => createaccount(owner, "second secret 22")).toThrow(AccountError);
    expect(verifyaccount(owner, "first secret 11")).not.toBeNull();
    expect(verifyaccount(owner, "second secret 22")).toBeNull();
  });

  it("normalizes the owner so the same handle collides once", () => {
    const owner = newowner();
    createaccount([" ", owner.toUpperCase(), " "].join(""), "secret one 5");
    expect(() => createaccount(owner, "secret two 6")).toThrow(AccountError);
    expect(normalizeaccountowner(["  ", "Mixed Case Handle", "!!"].join(" "))).toBe("mixed-case-handle");
    expect(normalaccountownerrefuses()).toBe(true);
  });

  it("refuses owners and secrets outside the shapes", () => {
    expect(() => createaccount("no", "secret 44")).toThrow(AccountError);
    expect(() => createaccount(newowner(), "abc")).toThrow(AccountError);
  });

  it("issues, verifies and revokes a real family session", () => {
    const owner = newowner();
    const created = createaccount(owner, "roundtrip secret 3");
    const session = issueaccountsession(created.id);
    expect(session.token).toMatch(/^[a-f0-9]{64}$/);
    const view = verifyaccountsession(session.token);
    expect(view?.accountid).toBe(created.id);
    expect(view?.owner).toBe(owner);
    expect(view?.expiresAt).toBeGreaterThan(Date.now());
    expect(revokeaccountsession(session.token)).toBe(true);
    expect(verifyaccountsession(session.token)).toBeNull();
    expect(revokeaccountsession(session.token)).toBe(false);
  });

  it("refuses garbage tokens before any query runs", () => {
    expect(verifyaccountsession("not a token at all")).toBeNull();
    expect(verifyaccountsession("")).toBeNull();
    expect(verifyaccountsession("zzzz-not-hex-zzzz")).toBeNull();
    expect(revokeaccountsession("1234")).toBe(false);
  });
});

/** The owner normalization refusals, asserted through one boolean. */
function normalaccountownerrefuses(): boolean {
  return normalizeaccountowner("no") === "" && normalizeaccountowner("") === "" && normalizeaccountowner("..") === "";
}
