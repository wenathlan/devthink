/**
 * onboardingstate.test.ts — the catalogued visitor state of the entry flow.
 * The reform of the wave: the seen flags ride the database through
 * /api/v1/onboarding, mirrored to localStorage purely as the offline cache.
 * These tests pin the pure contract: the https/public-host validation of
 * the API base (localhost, loopback and private hosts are refused before
 * any request leaves the tab), the flag-ladder semantics of the module
 * defaults and the doctrine keys of the local slots.
 */
import { describe, expect, it } from "vitest";
import { ispublichttpsbase, ONBOARDING_CACHE_KEY, onboardingapibase, VISITOR_KEY } from "../onboardingstate";

describe("the onboarding api base validation", () => {
  it("accepts public https origins only", () => {
    expect(ispublichttpsbase("https://devthink.pro")).toBe(true);
    expect(ispublichttpsbase("https://api.devthink.pro/")).toBe(true);
    expect(onboardingapibase("https://devthink.pro")?.origin).toBe("https://devthink.pro");
  });

  it("refuses every non-https scheme", () => {
    expect(ispublichttpsbase("http://devthink.pro")).toBe(false);
    expect(ispublichttpsbase("ftp://devthink.pro")).toBe(false);
    expect(ispublichttpsbase("//devthink.pro")).toBe(false);
    expect(ispublichttpsbase("devthink.pro")).toBe(false);
  });

  it("refuses localhost, loopback and private hosts", () => {
    expect(ispublichttpsbase("https://localhost")).toBe(false);
    expect(ispublichttpsbase("https://localhost:8080")).toBe(false);
    expect(ispublichttpsbase("https://app.localhost")).toBe(false);
    expect(ispublichttpsbase("https://host.local")).toBe(false);
    expect(ispublichttpsbase("https://127.0.0.1")).toBe(false);
    expect(ispublichttpsbase("https://127.8.8.8")).toBe(false);
    expect(ispublichttpsbase("https://0.0.0.0")).toBe(false);
    expect(ispublichttpsbase("https://10.1.2.3")).toBe(false);
    expect(ispublichttpsbase("https://172.16.0.9")).toBe(false);
    expect(ispublichttpsbase("https://172.31.255.1")).toBe(false);
    expect(ispublichttpsbase("https://192.168.1.4")).toBe(false);
    expect(ispublichttpsbase("https://169.254.1.1")).toBe(false);
    expect(ispublichttpsbase("https://100.64.0.1")).toBe(false);
    expect(ispublichttpsbase("https:::1")).toBe(false);
    expect(ispublichttpsbase("https://[::1]")).toBe(false);
  });

  it("refuses empty and unparseable values", () => {
    expect(ispublichttpsbase(undefined)).toBe(false);
    expect(ispublichttpsbase(null)).toBe(false);
    expect(ispublichttpsbase("")).toBe(false);
    expect(ispublichttpsbase("https://")).toBe(false);
    expect(onboardingapibase(undefined)).toBeNull();
  });
});

describe("the onboarding local slots", () => {
  it("keeps the cache and the visitor token under the doctrine keys", () => {
    expect(ONBOARDING_CACHE_KEY).toBe("dt.onboarding.seen");
    expect(VISITOR_KEY).toBe("dt.visitor.id");
  });
});
