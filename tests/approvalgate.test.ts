import { describe, expect, it } from "vitest";
import {
  approvalprompt,
  defaultapprovalwindowms,
  expireapprovals,
  listapprovals,
  redactparams,
  requireapproval,
  resolveapproval,
} from "../gates.js";
import { consentmetagrade } from "../policy.js";
import { buildtoolcatalog } from "../tools.js";
import type { approvalrequest } from "../types.js";

const now = 1_800_000_000_000;
const catalog = buildtoolcatalog();

describe("approval gate lifecycle", () => {
  it("raises gates for sensitive tool calls with the full arguments and timeout", () => {
    const gate = requireapproval({
      clientid: "client1",
      tool: "browser.click",
      reason: "The click runs only as the approved plan step it names.",
      params: { stepid: "s1", target: "#go" },
      now,
      timeout: 5000,
      id: "gate-1",
    });
    expect(gate.id).toBe("gate-1");
    expect(gate.state).toBe("pending");
    expect(gate.raisedat).toBe(now);
    expect(gate.timeoutat).toBe(now + 5000);
    expect(gate.params).toEqual({ stepid: "s1", target: "#go" });
    const secretgate = requireapproval({
      clientid: "client1",
      tool: "browser.type",
      reason: "Typing.",
      params: { stepid: "s2", value: "hunter2" },
      now,
      secretfields: ["value"],
    });
    expect(secretgate.secretfields).toEqual(["value"]);
    expect(secretgate.timeoutat).toBeUndefined();
    expect(defaultapprovalwindowms).toBe(120_000);
  });

  it("resolves pending gates with the actor and latency while closed gates stay closed", () => {
    const pending = requireapproval({
      clientid: "client1",
      tool: "browser.click",
      reason: "Click.",
      params: { stepid: "s1" },
      now,
      id: "gate-1",
    });
    const approved = resolveapproval({
      requests: [pending],
      id: "gate-1",
      decision: "approved",
      actor: "user",
      now: now + 4000,
    });
    expect(approved.exec?.decision).toBe("approved");
    expect(approved.exec?.actor).toBe("user");
    expect(approved.exec?.latencyms).toBe(4000);
    expect(approved.requests[0]?.state).toBe("approved");
    expect(approved.requests[0]?.decidedat).toBe(now + 4000);
    const again = resolveapproval({
      requests: approved.requests,
      id: "gate-1",
      decision: "refused",
      actor: "user",
      now: now + 5000,
    });
    expect(again.exec).toBeUndefined();
    expect(again.requests[0]?.state).toBe("approved");
    const refused = resolveapproval({
      requests: [pending],
      id: "gate-1",
      decision: "refused",
      actor: "user",
      now: now + 1500,
    });
    expect(refused.exec?.decision).toBe("refused");
    expect(refused.exec?.latencyms).toBe(1500);
    expect(
      resolveapproval({ requests: [pending], id: "missing", decision: "approved", actor: "user", now }).exec,
    ).toBeUndefined();
  });

  it("expires unanswered gates past their window with the default refusal", () => {
    const short = requireapproval({
      clientid: "client1",
      tool: "browser.click",
      reason: "Click.",
      params: {},
      now,
      timeout: 1000,
      id: "gate-1",
    });
    const endless = requireapproval({
      clientid: "client2",
      tool: "browser.type",
      reason: "Type.",
      params: {},
      now,
      id: "gate-2",
    });
    const swept = expireapprovals([short, endless], now + 1500);
    expect(swept[0]?.state).toBe("expired");
    expect(swept[1]?.state).toBe("pending");
    const resolved = expireapprovals([{ ...short, state: "approved" }], now + 1500);
    expect(resolved[0]?.state).toBe("approved");
    expect(listapprovals([endless, short])[0]?.id).toBe("gate-2");
  });
});

describe("approval prompts and secret redaction", () => {
  it("redacts the fields the user marked secret while the rest stays visible", () => {
    expect(redactparams({ stepid: "s1", value: "hunter2", target: "#go" }, ["value"])).toEqual({
      stepid: "s1",
      value: "[redacted]",
      target: "#go",
    });
    expect(redactparams({ stepid: "s1" }, [])).toEqual({ stepid: "s1" });
    expect(redactparams({ value: "hunter2" }, ["value"]).value).not.toContain("hunter");
  });

  it("carries the client identity, the called tool and the redacted arguments in every prompt", () => {
    const gate = requireapproval({
      clientid: "client1",
      tool: "browser.type",
      reason: "The typing runs only as the approved plan step it names.",
      params: { stepid: "s1", value: "hunter2" },
      now,
      secretfields: ["value"],
    });
    const prompt = approvalprompt(gate, { fingerprint: "fp-1", displayname: "Laptop agent" });
    expect(prompt).toContain("Laptop agent");
    expect(prompt).toContain("fp-1");
    expect(prompt).toContain("browser.type");
    expect(prompt).toContain("[redacted]");
    expect(prompt).not.toContain("hunter2");
    const bare = approvalprompt(gate);
    expect(bare).toContain("client1");
    expect(bare).not.toContain("hunter2");
  });
});

describe("sensitive tool gating", () => {
  it("grades every sensitive tool with the approval gate requirement and passes read tools free", () => {
    for (const tool of catalog.domains.flatMap((domain) => domain.tools)) {
      const grade = consentmetagrade(tool);
      expect(grade.allowed).toBe(true);
      if (tool.risk !== "read") {
        expect(tool.consentmeta?.approvalrequired).toBe(true);
        expect(tool.consentmeta?.originscope).toBe("session");
        expect(tool.consentmeta?.riskclass).toBe(tool.risk);
      }
    }
    const drift = {
      ...catalog.domains[0]!.tools[9]!,
      consentmeta: {
        review: "review",
        riskclass: "read" as const,
        approvalrequired: false,
        originscope: "session" as const,
      },
    };
    expect(consentmetagrade(drift).allowed).toBe(false);
    const { consentmeta: dropped, ...missing } = catalog.domains[0]!.tools[9]!;
    void dropped;
    expect(consentmetagrade(missing).allowed).toBe(false);
  });
});
