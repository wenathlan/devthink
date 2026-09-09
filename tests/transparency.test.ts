import { describe, expect, it } from "vitest";
import {
  connectallowlist,
  permdiffchanged,
  permdiffsummary,
  permissiondiff,
  revokeaction,
  transparencygrants,
  windowhistory,
} from "../security.js";
import { transparencyreport } from "../protocol.js";

const now = 1_800_000_000_000;

describe("transparency", () => {
  it("computes the permdiff between two permission sets", () => {
    const diff = permissiondiff({
      from: ["required:activeTab", "required:storage", "optional:tabs"],
      to: ["required:activeTab", "required:storage", "optional:downloads"],
      fromversion: "1.1.61",
      toversion: "1.1.62",
      now,
    });
    expect(diff.added).toEqual(["optional:downloads"]);
    expect(diff.removed).toEqual(["optional:tabs"]);
    expect(permdiffchanged(diff)).toBe(true);
    expect(permdiffsummary(diff)).toMatch(/added optional:downloads and removed optional:tabs/);
  });

  it("records an unchanged permission set for the audit trail", () => {
    const diff = permissiondiff({
      from: ["required:storage"],
      to: ["required:storage"],
      fromversion: "1.1.61",
      toversion: "1.1.62",
      now,
    });
    expect(permdiffchanged(diff)).toBe(false);
    expect(permdiffsummary(diff)).toMatch(/changed no permission/);
    expect(() => permissiondiff({ from: [], to: [], fromversion: " ", toversion: "1.1.62", now })).toThrow(
      /two versions/,
    );
  });

  it("builds the transparency grant rows with origin, scope and boundary", () => {
    const grants = transparencygrants({
      allowlist: [{ origin: "https://example.com", profileid: "profile", grantedat: now }],
      profiles: [
        {
          profileid: "p2",
          origin: "https://shop.example",
          grants: ["click"],
          denials: ["fillcard"],
          createdat: now,
          updatedat: now,
        },
      ],
    });
    expect(grants).toHaveLength(2);
    expect(grants[0]).toMatchObject({
      origin: "https://example.com",
      boundary: "the user revokes the entry or the profile workspace",
    });
    expect(grants[1]?.scope).toMatch(/1 granted and 1 denied kinds/);
  });

  it("offers a revoke action for every listed grant", () => {
    const action = revokeaction({
      origin: "https://example.com",
      scope: "automation allowlist",
      boundary: "revocation",
      grantedat: now,
    });
    expect(action).toEqual({ action: "revoke", origin: "https://example.com", scope: "automation allowlist" });
  });

  it("lists every consent window ever granted with its expiry", () => {
    const history = windowhistory([
      {
        id: "w1",
        sessionid: "s",
        origin: "https://example.com",
        startedat: now,
        duration: 1000,
        expiresat: now + 1000,
        boundary: "1000 milliseconds the user chose",
        kinds: ["click"],
        state: "active",
      },
      {
        id: "w2",
        sessionid: "s",
        origin: "https://shop.example",
        startedat: now - 5000,
        duration: 1000,
        expiresat: now - 4000,
        boundary: "1000 milliseconds the user chose",
        kinds: ["click"],
        state: "closed",
        closedat: now - 4000,
      },
    ]);
    expect(history).toHaveLength(2);
    expect(history[0]?.state).toBe("active");
    expect(history[1]?.state).toBe("closed");
    expect(history[1]?.expiresat).toBe(now - 4000);
  });

  it("lists the connectallow entries with their senders", () => {
    const entries = connectallowlist([
      { senderid: "other-extension", displayname: "Reviewed bridge", addedat: now },
      { senderid: "second", displayname: "Second bridge", origin: "https://sender.example", addedat: now },
    ]);
    expect(entries[0]).toMatchObject({ senderid: "other-extension", displayname: "Reviewed bridge" });
    expect(entries[0]?.origin).toBeUndefined();
    expect(entries[1]?.origin).toBe("https://sender.example");
  });

  it("wraps the transparency data of the transparencypage in one versioned envelope", () => {
    const report = transparencyreport({
      grants: [
        { origin: "https://example.com", scope: "automation allowlist", boundary: "revocation", grantedat: now },
      ],
      windows: [
        {
          id: "w1",
          origin: "https://example.com",
          state: "active",
          boundary: "1000 milliseconds the user chose",
          startedat: now,
          expiresat: now + 1000,
        },
      ],
      connectallow: [{ senderid: "other-extension", displayname: "Reviewed bridge", addedat: now }],
      permdiffs: [{ fromversion: "1.1.61", toversion: "1.1.62", added: [], removed: [], computedat: now }],
      safedefaults: [{ origin: "https://first.example", firstseenat: now }],
      vault: [{ vaultid: "v", label: "Bank login", scope: "https://bank.example", provenance: "user", createdat: now }],
    });
    expect(report.posture).toBe("denydefault");
    expect(report.grants).toHaveLength(1);
    expect(report.windows).toHaveLength(1);
    expect(report.connectallow).toHaveLength(1);
    expect(report.permdiffs).toHaveLength(1);
    expect(report.safedefaults).toHaveLength(1);
    expect(report.vault[0]).toMatchObject({ label: "Bank login", scope: "https://bank.example" });
  });
});
