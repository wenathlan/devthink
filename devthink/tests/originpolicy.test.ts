import { describe, expect, it } from "vitest";
import {
  allowlistcheck,
  classconsentcovers,
  consentprompttext,
  consentwindowstate,
  deniedevidenceof,
  exactorigin,
  expireconsentwindows,
  haltedstepsof,
  missingclassconsents,
  openconsentwindow,
  originprofileof,
  profilegrade,
  profilekind,
  profilesummary,
  renewconsentwindow,
  revokerun,
  scopegrantof,
  sensitiveclassesof,
  wildcardentry,
  windowgatesstep,
  denydefaultnotice,
} from "../security.js";
import {
  automationallowlistgate,
  consentdurationvalid,
  consentwindowgate,
  logreadgate,
  originprofilegate,
  revokerungate,
  sensitiveclassgate,
  sensitivepipelingate,
} from "../policy.js";
import type { actionkind, automationallowlistentry, classconsent, originprofile, toolstep } from "../types.js";

const now = 1_000;
const origin = "https://example.com";
const other = "https://other.example";

function step(
  kind: actionkind,
  overrides: Partial<Pick<toolstep, "value" | "options" | "target">> = {},
): Pick<toolstep, "kind" | "value" | "options"> {
  return { kind, ...overrides };
}

function allowlist(origins: string[]): automationallowlistentry[] {
  return origins.map((entry) => ({ origin: entry, profileid: "default", grantedat: now }));
}

describe("denydefault allowlist posture", () => {
  it("refuses every ungranted origin under the denydefault posture", () => {
    const verdict = allowlistcheck({
      origin,
      allowlist: allowlist([other]),
      profileid: "default",
      sessionorigin: other,
    });
    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toMatch(/denydefault posture refuses https:\/\/example\.com/i);
    const gate = automationallowlistgate({
      origin,
      allowlist: allowlist([other]),
      session: { id: "s1", tabid: 1, origin: other, startedat: now, expiresat: now + 1000 },
    });
    expect(gate.allowed).toBe(false);
  });

  it("grants a listed origin and treats the active tab as one explicit single origin grant", () => {
    expect(allowlistcheck({ origin, allowlist: allowlist([origin]), profileid: "default" }).allowed).toBe(true);
    const tabgrant = allowlistcheck({ origin, allowlist: [], profileid: "default", sessionorigin: origin });
    expect(tabgrant.allowed).toBe(true);
    expect(tabgrant.reason).toMatch(/exactly one explicit single origin grant/i);
    const differenttab = allowlistcheck({ origin, allowlist: [], profileid: "default", sessionorigin: other });
    expect(differenttab.allowed).toBe(false);
  });

  it("matches origins exactly with no wildcard expansion and refuses wildcard entries", () => {
    expect(exactorigin(origin, origin)).toBe(true);
    expect(exactorigin(origin, "https://*.example.com")).toBe(false);
    expect(exactorigin("https://a.example.com", "https://example.com")).toBe(false);
    const wildcard = allowlistcheck({ origin, allowlist: allowlist(["https://*.example.com"]), profileid: "default" });
    expect(wildcard.allowed).toBe(false);
    expect(wildcard.reason).toMatch(/wildcard/i);
    expect(wildcardentry("https://*/*")).toBe(true);
    expect(wildcardentry("*")).toBe(true);
    expect(wildcardentry(origin)).toBe(false);
  });

  it("scopes the allowlist per profile workspace", () => {
    const scoped = allowlistcheck({
      origin,
      allowlist: [{ origin, profileid: "otherprofile", grantedat: now }],
      profileid: "default",
    });
    expect(scoped.allowed).toBe(false);
    expect(scoped.reason).toMatch(/absent from the automation allowlist/i);
  });
});

describe("origin profiles per site", () => {
  it("builds a profile and moves a kind between its grants and denials", () => {
    const profile = originprofileof({ origin, grants: ["submitform" as actionkind], now });
    expect(profile.grants).toEqual(["submitform"]);
    const denied = profilekind({ profile, kind: "submitform", decision: "deny", now: now + 1 });
    expect(denied.denials).toEqual(["submitform"]);
    expect(denied.grants).toEqual([]);
    const granted = profilekind({ profile: denied, kind: "fillcard", decision: "grant", now: now + 2 });
    expect(granted.grants).toEqual(["fillcard"]);
    expect(granted.denials).toEqual(["submitform"]);
    expect(() => originprofileof({ origin: " ", now })).toThrow(/exact origin/i);
  });

  it("consults the profile before sensitive kinds and refuses denied kinds", () => {
    const profile: originprofile = {
      profileid: "p1",
      origin,
      grants: ["fillcard" as actionkind],
      denials: ["submitform" as actionkind],
      createdat: now,
      updatedat: now,
    };
    expect(profilegrade({ profile, kind: "submitform", sensitive: true }).allowed).toBe(false);
    expect(profilegrade({ profile, kind: "submitform", sensitive: true }).reason).toMatch(
      /denies the submitform kind/i,
    );
    expect(profilegrade({ profile, kind: "fillcard", sensitive: true }).allowed).toBe(true);
    expect(originprofilegate({ profile, kind: "submitform", sensitive: true }).allowed).toBe(false);
    expect(originprofilegate({ profile: undefined, kind: "submitform", sensitive: true }).allowed).toBe(true);
    expect(profilegrade({ profile, kind: "readtext", sensitive: false }).consult).toBe(false);
  });

  it("summarizes the profile of the active tab for the popup", () => {
    expect(profilesummary(undefined)).toMatch(/no origin profile/i);
    expect(
      profilesummary({
        profileid: "p1",
        origin,
        grants: ["fillcard" as actionkind],
        denials: ["submitform" as actionkind],
        createdat: now,
        updatedat: now,
      }),
    ).toMatch(/grants 1 kind and denies 1 kind/i);
  });
});

describe("sensitive classes and fresh consents", () => {
  it("classifies sensitive kinds into payment, credential, delete and publish classes", () => {
    expect(sensitiveclassesof(step("fillcard")).classes).toEqual(["payment"]);
    expect(sensitiveclassesof(step("consentpassword")).classes).toEqual(["credential"]);
    expect(sensitiveclassesof(step("discardtab")).classes).toEqual(["delete"]);
    expect(sensitiveclassesof(step("postfiles")).classes).toEqual(["publish"]);
    expect(sensitiveclassesof(step("readtext")).sensitive).toBe(false);
  });

  it("refines the classification by kind options instead of kind names alone", () => {
    const cardform = step("fillform", { options: JSON.stringify({ fields: [{ name: "cardnumber", value: "4242" }] }) });
    expect(sensitiveclassesof(cardform).classes).toContain("payment");
    const credentialsubmit = step("submitform", {
      options: JSON.stringify({ fields: [{ name: "password", value: "hunter2" }] }),
    });
    expect(sensitiveclassesof(credentialsubmit).classes).toContain("credential");
    const mutatingcall = step("callrest", { options: JSON.stringify({ method: "POST" }) });
    expect(sensitiveclassesof(mutatingcall).classes).toContain("publish");
    const readonlycall = sensitiveclassesof(step("callrest", { options: JSON.stringify({ method: "GET" }) }));
    expect(readonlycall.classes).toEqual([]);
  });

  it("classifies upload, download and evaluate as sensitive by default", () => {
    for (const kind of ["attachfile", "downloadfile", "evaluate"] as actionkind[]) {
      const verdict = sensitiveclassesof(step(kind));
      expect(verdict.sensitive).toBe(true);
      expect(verdict.bydefault).toBe(true);
      expect(verdict.classes).toEqual([]);
    }
  });

  it("classifies credential bearing form submits as the credential class", () => {
    const verdict = sensitiveclassesof(
      step("submitform", { options: JSON.stringify({ fields: [{ name: "apitoken", value: "tok" }] }) }),
    );
    expect(verdict.classes).toContain("credential");
    expect(verdict.reason).toMatch(/credential/i);
  });

  it("requires one fresh consent prompt per class per origin", () => {
    const consents: classconsent[] = [{ id: "c1", origin, sensitiveclass: "payment", grantedat: now }];
    expect(classconsentcovers(consents, origin, "payment", now + 1)).toBe(true);
    expect(classconsentcovers(consents, origin, "credential", now + 1)).toBe(false);
    expect(classconsentcovers(consents, other, "payment", now + 1)).toBe(false);
    const expired: classconsent[] = [
      { id: "c2", origin, sensitiveclass: "payment", grantedat: now, expiresat: now + 10 },
    ];
    expect(classconsentcovers(expired, origin, "payment", now + 10)).toBe(false);
    const missing = missingclassconsents({
      origin,
      classes: ["payment", "credential"],
      bydefault: false,
      consents,
      now: now + 1,
    });
    expect(missing.needed).toBe(true);
    expect(missing.missing).toEqual(["credential"]);
    expect(missingclassconsents({ origin, classes: [], bydefault: true, consents, now: now + 1 }).needed).toBe(true);
    expect(
      missingclassconsents({ origin, classes: ["payment"], bydefault: false, consents, now: now + 1 }).needed,
    ).toBe(false);
  });

  it("routes sensitive steps through the consent gate and names the class in the prompt", () => {
    const gate = sensitiveclassgate({
      origin,
      classes: ["payment"],
      bydefault: false,
      sensitive: true,
      consents: [],
      now,
    });
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toMatch(/fresh consent prompt/i);
    const granted = sensitiveclassgate({
      origin,
      classes: ["payment"],
      bydefault: false,
      sensitive: true,
      consents: [{ id: "c1", origin, sensitiveclass: "payment", grantedat: now }],
      now,
    });
    expect(granted.allowed).toBe(true);
    const pipeline = sensitivepipelingate({ step: step("fillcard"), profile: undefined, consents: [], origin, now });
    expect(pipeline.allowed).toBe(false);
    expect(pipeline.reason).toMatch(/payment/i);
    const prompt = consentprompttext({
      origin,
      kind: "fillcard",
      classes: ["payment"],
      bydefault: false,
      duration: 60_000,
    });
    expect(prompt).toMatch(/fillcard step on https:\/\/example\.com/i);
    expect(prompt).toMatch(/payment class/i);
    expect(prompt).toMatch(/60000 milliseconds/i);
    expect(prompt).toMatch(/never defaults to unlimited|no grant ever defaults to unlimited/i);
  });
});

describe("consent windows bound in time", () => {
  it("opens a window with the user duration and a named boundary that never defaults to unlimited", () => {
    const window = openconsentwindow({
      sessionid: "s1",
      origin,
      duration: 60_000,
      kinds: ["submitform" as actionkind],
      now,
    });
    expect(window.expiresat).toBe(now + 60_000);
    expect(window.boundary).toMatch(/60000 milliseconds the user chose/i);
    expect(() => openconsentwindow({ sessionid: "s1", origin, duration: 0, kinds: [], now })).toThrow(
      /positive user value/i,
    );
    expect(() => openconsentwindow({ sessionid: " ", origin, duration: 60_000, kinds: [], now })).toThrow(
      /session and its exact origin/i,
    );
    const durationgate = consentdurationvalid(60_000);
    expect(durationgate.allowed).toBe(true);
    expect(consentdurationvalid(0).allowed).toBe(false);
    expect(consentdurationvalid(0).reason).toMatch(/defaults to unlimited/i);
  });

  it("scopes the window to one session and one origin and expires it at its boundary", () => {
    const window = openconsentwindow({ sessionid: "s1", origin, duration: 60_000, kinds: [], now });
    expect(windowgatesstep({ window, sessionid: "s1", origin, now: now + 1 }).allowed).toBe(true);
    const otherorigin = windowgatesstep({ window, sessionid: "s1", origin: other, now: now + 1 });
    expect(otherorigin.allowed).toBe(false);
    expect(otherorigin.reason).toMatch(/never widens to another origin/i);
    const othersession = windowgatesstep({ window, sessionid: "s2", origin, now: now + 1 });
    expect(othersession.reason).toMatch(/never widens to another session/i);
    const expired = windowgatesstep({ window, sessionid: "s1", origin, now: now + 60_000 });
    expect(expired.allowed).toBe(false);
    expect(expired.suspended).toBe(true);
    expect(expired.reason).toMatch(/run suspends/i);
    expect(consentwindowstate(window, now + 59_999).remaining).toBe(1);
    expect(consentwindowgate({ window, sessionid: "s1", origin, sensitive: true, now: now + 60_000 }).allowed).toBe(
      false,
    );
    expect(consentwindowgate({ window: undefined, sessionid: "s1", origin, sensitive: true, now }).allowed).toBe(false);
    expect(consentwindowgate({ window, sessionid: "s1", origin, sensitive: false, now: now + 60_000 }).allowed).toBe(
      true,
    );
  });

  it("expires closed windows past their boundary and renews only through a new explicit prompt", () => {
    const windows = [
      openconsentwindow({ sessionid: "s1", origin, duration: 10, kinds: [], now }),
      openconsentwindow({ sessionid: "s1", origin: other, duration: 10_000, kinds: [], now }),
    ];
    const expired = expireconsentwindows(windows, now + 11);
    expect(expired[0]?.state).toBe("closed");
    expect(expired[0]?.closedat).toBe(now + 11);
    expect(expired[1]?.state).toBe("active");
    const { renewed, closed } = renewconsentwindow({
      window: expired[0] as (typeof windows)[0],
      duration: 30_000,
      kinds: [],
      now: now + 12,
    });
    expect(renewed.state).toBe("active");
    expect(renewed.expiresat).toBe(now + 12 + 30_000);
    expect(closed.state).toBe("closed");
    expect(renewed.id).not.toBe(closed.id);
  });
});

describe("revokerun halts the run mid step", () => {
  it("revokes the run as a terminal session event halting the pending and queued steps", () => {
    const revocation = revokerun({
      sessionid: "s1",
      runid: "run1",
      pendingstepid: "s3",
      queuedstepids: ["s4", "s5"],
      actor: "user",
      now,
    });
    expect(revocation.haltedstepids).toEqual(["s3", "s4", "s5"]);
    expect(haltedstepsof(revocation)).toEqual({ pending: "s3", queued: ["s4", "s5"] });
    const gate = revokerungate({ revocation, sessionid: "s1", runid: "run1" });
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toMatch(/halted/i);
    expect(revokerungate({ revocation, sessionid: "s1", runid: "run2" }).allowed).toBe(true);
    expect(revokerungate({ revocation: undefined, sessionid: "s1", runid: "run1" }).allowed).toBe(true);
    expect(() => revokerun({ sessionid: "s1", runid: "run1", actor: "user", now })).toThrow(
      /at least the pending step/i,
    );
    expect(() => revokerun({ sessionid: "s1", runid: "run1", pendingstepid: "s3", actor: " ", now })).toThrow(
      /acting user/i,
    );
  });

  it("writes the consent scope grant and the denied evidence records", () => {
    const scope = scopegrantof({ origin, kinds: ["observe" as actionkind], boundary: "the session expiry", now });
    expect(scope).toEqual({ origin, kinds: ["observe"], boundary: "the session expiry", grantedat: now });
    expect(() => scopegrantof({ origin, kinds: [], boundary: "b", now })).toThrow(/names the kinds/i);
    expect(() => scopegrantof({ origin, kinds: ["observe" as actionkind], boundary: " ", now })).toThrow(/boundary/i);
    const denied = deniedevidenceof({
      origin,
      kind: "submitform",
      reason: "The denydefault posture refuses the origin.",
      now,
    });
    expect(denied).toEqual({
      origin,
      kind: "submitform",
      reason: "The denydefault posture refuses the origin.",
      at: now,
    });
    expect(denydefaultnotice(other)).toMatch(/denydefault posture refuses https:\/\/other\.example/i);
  });

  it("refuses log reads of a chain with a broken link", () => {
    expect(logreadgate({ valid: true }).allowed).toBe(true);
    const broken = logreadgate({ valid: false, brokenat: 2 });
    expect(broken.allowed).toBe(false);
    expect(broken.reason).toMatch(/entry 2/i);
    expect(broken.reason).toMatch(/refuses the read/i);
  });
});

import { safedefaultnotice, safedefaultprofile, safedefaultreadkind } from "../security.js";
import { safedefaultsgate } from "../policy.js";

describe("originpolicy safedefaults", () => {
  it("profiles an unknown origin as reads only with every sensitive class denied", () => {
    const profile = safedefaultprofile({ origin, now });
    expect(profile.origin).toBe(origin);
    expect(profile.grants).toContain("observe");
    expect(profile.grants).toContain("readhtml");
    expect(profile.denials).toContain("fillcard");
    expect(profile.denials).toContain("consentpassword");
    expect(profile.denials).toContain("discardtab");
    expect(profile.denials).toContain("postform");
    expect(() => safedefaultprofile({ origin: " ", now })).toThrow(/exact origin/);
  });

  it("recognises the documented reads only baseline kinds", () => {
    expect(safedefaultreadkind("observe")).toBe(true);
    expect(safedefaultreadkind("readtext")).toBe(true);
    expect(safedefaultreadkind("click")).toBe(false);
    expect(safedefaultreadkind("fillcard")).toBe(false);
  });

  it("renders the safedefaults notice that links to the originprofile editor", () => {
    expect(safedefaultnotice(origin)).toMatch(/reads only/);
    expect(safedefaultnotice(origin)).toMatch(/originprofile editor/);
  });

  it("denies sensitive classes under safedefaults while reads pass", () => {
    expect(safedefaultsgate({ profile: undefined, classes: [], sensitive: false }).allowed).toBe(true);
    expect(safedefaultsgate({ profile: undefined, classes: ["payment"], sensitive: true }).allowed).toBe(false);
    expect(
      safedefaultsgate({ profile: safedefaultprofile({ origin, now }), classes: ["payment"], sensitive: true }).allowed,
    ).toBe(true);
  });
});
