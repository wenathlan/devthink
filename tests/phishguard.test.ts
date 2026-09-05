import { describe, expect, it } from "vitest";
import { credentialstep, lookalikedistance, originlabels, phishnotetext, phishthresholdvalid, phishverdictof, verdictfresh } from "../security.js";

const now = 1_800_000_000_000;

describe("phishguard", () => {
  it("marks login and credential steps for the watch", () => {
    expect(credentialstep({ kind: "consentpassword", target: "" })).toBe(true);
    expect(credentialstep({ kind: "authflow", target: "" })).toBe(true);
    expect(credentialstep({ kind: "fillcard", target: "" })).toBe(true);
    expect(credentialstep({ kind: "click", target: "#submit" })).toBe(false);
    expect(credentialstep({ kind: "type", target: "#password" })).toBe(true);
    expect(credentialstep({ kind: "fillform", target: "#login", value: "", options: JSON.stringify({ fields: [{ name: "passphrase", value: "x" }] }) })).toBe(true);
  });

  it("splits origins into registrable ordered labels", () => {
    expect(originlabels("https://pay.example.com")).toEqual(["com", "example", "pay"]);
    expect(originlabels("https://example.com")).toEqual(["com", "example"]);
    expect(originlabels("https://example.com/path/segment")).toEqual(["com", "example"]);
  });

  it("measures the lookalike distance between origins from zero to one", () => {
    expect(lookalikedistance("https://example.com", "https://example.com")).toBe(0);
    expect(lookalikedistance("https://pay.example.com", "https://pay.example.com")).toBe(0);
    const lookalike = lookalikedistance("https://pay.example.com.attacker.example", "https://pay.example.com");
    expect(lookalike).toBeGreaterThan(0);
    expect(lookalike).toBeLessThan(1);
    const far = lookalikedistance("https://example.com", "https://totally-different.example");
    expect(far).toBeGreaterThan(lookalike);
    expect(lookalikedistance("", "https://example.com")).toBe(1);
  });

  it("validates the threshold as a user choice between zero and one", () => {
    expect(phishthresholdvalid(0.4).valid).toBe(true);
    expect(phishthresholdvalid(0).valid).toBe(false);
    expect(phishthresholdvalid(1).valid).toBe(false);
    expect(phishthresholdvalid(1.5).valid).toBe(false);
  });

  it("blocks login origins whose distance crosses the user threshold and names the matched origin", () => {
    const verdict = phishverdictof({ origin: "https://pay.example.com.attacker.example", granted: ["https://pay.example.com", "https://other.example"], threshold: 0.5, now });
    expect(verdict.blocked).toBe(true);
    expect(verdict.matchedorigin).toBe("https://pay.example.com");
    expect(verdict.reason).toMatch(/names https:\/\/pay\.example\.com/);
    expect(verdict.distance).toBeLessThanOrEqual(0.5);
  });

  it("passes granted origins and distant origins under the threshold", () => {
    const granted = phishverdictof({ origin: "https://pay.example.com", granted: ["https://pay.example.com"], threshold: 0.4, now });
    expect(granted.blocked).toBe(false);
    expect(granted.distance).toBe(0);
    const distant = phishverdictof({ origin: "https://unrelated.example", granted: ["https://pay.example.com"], threshold: 0.3, now });
    expect(distant.blocked).toBe(false);
    expect(distant.matchedorigin).toBe("https://pay.example.com");
    const lonely = phishverdictof({ origin: "https://first.example", granted: [], threshold: 0.4, now });
    expect(lonely.blocked).toBe(false);
    expect(lonely.matchedorigin).toBeUndefined();
  });

  it("blocks exactly at the threshold boundary", () => {
    const origin = "https://pay.example.com.attacker.example";
    const granted = ["https://pay.example.com"];
    const distance = lookalikedistance(origin, granted[0] as string);
    const at = phishverdictof({ origin, granted, threshold: distance, now });
    expect(at.blocked).toBe(true);
    const below = phishverdictof({ origin, granted, threshold: distance / 2, now });
    expect(below.blocked).toBe(false);
  });

  it("expires verdicts past their freshness window", () => {
    const verdict = phishverdictof({ origin: "https://pay.example.com", granted: ["https://pay.example.com"], threshold: 0.4, now });
    expect(verdictfresh(verdict, now, undefined)).toBe(true);
    expect(verdictfresh(verdict, now + 1000, 5000)).toBe(true);
    expect(verdictfresh(verdict, now + 6000, 5000)).toBe(false);
  });

  it("renders the phishguard notice the surfaces show before a login step", () => {
    const blocked = phishverdictof({ origin: "https://pay.example.com.attacker.example", granted: ["https://pay.example.com"], threshold: 0.5, now });
    expect(phishnotetext(blocked)).toMatch(/blocks/);
    const pass = phishverdictof({ origin: "https://pay.example.com", granted: ["https://pay.example.com"], threshold: 0.5, now });
    expect(phishnotetext(pass)).toMatch(/under the user threshold/);
  });
});
