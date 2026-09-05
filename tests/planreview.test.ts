import { describe, expect, it } from "vitest";
import {
  activetimelineanchor, appendlogstreamevent, auditexcerptof, diffpreviewof, filterlogstream, livebufferof,
  loglevelof, logstreameventof, logstreamgenesis, maskverdictsof, plancardgroups, plancardsof,
  resolutionhistoryafter, resolutionlogeventof, stepresolutionof, stepstimelinenodes, verifylogstream,
} from "../plan.js";
import { diffpreviewgate, logbufferboundvalid, logstreamegressgate, stepapprovegate } from "../policy.js";
import type { agentplan, correctionentry, planprogress } from "../types.js";

const now = 1_800_000_000_000;

const plan: agentplan = { id: "run1", objective: "Fill the checkout form", origin: "https://shop.example", steps: [
  { id: "s1", kind: "readtable", risk: "read", summary: "Read the pricing table." },
  { id: "s2", kind: "click", risk: "interaction", target: "#buy", summary: "Open the checkout." },
  { id: "s3", kind: "type", risk: "sensitive", target: "#card", value: "vault:card1", summary: "Type the card number from the vault." },
  { id: "s4", kind: "submit", risk: "sensitive", target: "#pay", summary: "Submit the payment." },
], createdat: now - 5000, expiresat: now + 5000, state: "approved" };

const corrections: correctionentry[] = [
  { id: "c1", origin: "https://shop.example", kind: "type", stepid: "s3", source: "edited", original: "{kind:type,value:plain}", corrected: "{kind:type,value:vault:card1}", reason: "The vault marker replaced the raw value.", at: now - 1000 },
  { id: "c2", origin: "https://other.example", kind: "click", stepid: "s2", source: "rejected", original: "{kind:click}", reason: "Other origin never matches.", at: now - 1000 },
];

describe("plan review surface", () => {
  it("builds one plancard per proposed step with kind, risk class, environment and options", () => {
    const cards = plancardsof({ plan, corrections });
    expect(cards).toHaveLength(4);
    const card = cards[2];
    expect(card?.stepid).toBe("s3");
    expect(card?.kind).toBe("type");
    expect(card?.risk).toBe("sensitive");
    expect(card?.environment).toBe("pagecontext");
    expect(card?.corrections.map(entry => entry.id)).toEqual(["c1"]);
    expect(card?.editable).toBe(false);
    const pending: agentplan = { ...plan, state: "pending" };
    expect(plancardsof({ plan: pending, corrections: [] })[0]?.editable).toBe(true);
  });

  it("groups the plancards by risk class with the sensitive classes expanded by default", () => {
    const groups = plancardgroups(plancardsof({ plan, corrections }));
    expect(groups.map(group => group.risk)).toEqual(["sensitive", "interaction", "read"]);
    expect(groups[0]?.cards).toHaveLength(2);
    expect(groups[0]?.expanded).toBe(true);
    expect(groups[1]?.expanded).toBe(false);
    expect(groups[2]?.expanded).toBe(false);
  });

  it("resolves one step per distinct human action with approve, reject and edit provenance", () => {
    const approve = stepresolutionof({ stepid: "s2", planid: plan.id, origin: plan.origin, resolution: "approve", surface: "sidepanel", at: now });
    expect(approve.resolution).toBe("approve");
    const edit = stepresolutionof({ stepid: "s3", planid: plan.id, origin: plan.origin, resolution: "edit", surface: "sidepanel", edited: "{kind:type,value:vault:card1}", at: now });
    expect(edit.edited).toBe("{kind:type,value:vault:card1}");
    expect(() => stepresolutionof({ stepid: "s3", planid: plan.id, origin: plan.origin, resolution: "edit", surface: "sidepanel", at: now })).toThrow(/corrected step shape/);
    expect(() => stepresolutionof({ stepid: " ", planid: plan.id, origin: plan.origin, resolution: "approve", surface: "sidepanel", at: now })).toThrow(/step/);
    const history = resolutionhistoryafter([approve], edit);
    expect(history[0]?.stepid).toBe("s3");
    const logentry = resolutionlogeventof(edit);
    expect(logentry.kind).toBe("review");
    expect(logentry.stepid).toBe("s3");
    expect(logentry.summary).toMatch(/edited the step s3/);
    expect(resolutionlogeventof(approve).summary).toMatch(/approved the step s2/);
  });

  it("binds each stepapprove action to one step with no batch approval and no background provenance", () => {
    expect(stepapprovegate({ stepids: ["s2"], resolution: "approve", surface: "sidepanel" }).allowed).toBe(true);
    expect(stepapprovegate({ stepids: ["s2", "s3"], resolution: "approve", surface: "sidepanel" }).reason).toMatch(/batch of 2/);
    expect(stepapprovegate({ stepids: [], resolution: "approve", surface: "sidepanel" }).allowed).toBe(false);
    expect(stepapprovegate({ stepids: ["s2"], resolution: "reject", surface: "background" }).reason).toMatch(/distinct human action/);
  });

  it("compares the observed before state with the predicted after state of write class steps only", () => {
    expect(diffpreviewgate({ risk: "sensitive" }).allowed).toBe(true);
    expect(diffpreviewgate({ risk: "read" }).reason).toMatch(/write class steps only/);
    expect(diffpreviewgate({ risk: "interaction" }).allowed).toBe(false);
    const preview = diffpreviewof({ stepid: "s3", before: { card: "vault:card1", holder: "Ada", city: "Lisbon" }, after: { card: "vault:card1", holder: "Ada Lovelace", zip: "1000" }, maskverdicts: { card: "The card value stays masked (11 characters) and never renders in the clear." }, provenance: "inline" });
    expect(preview.changes.map(change => `${change.kind}:${change.field}`).sort()).toEqual(["added:zip", "changed:holder", "removed:city"]);
    expect(preview.maskverdicts.card).toMatch(/masked/);
    expect(preview.provenance).toBe("inline");
    const verdicts = maskverdictsof({ password: "hunter2", title: "Pricing" }, ["password"]);
    expect(verdicts.password).toMatch(/password value stays masked/);
    expect(verdicts.title).toBeUndefined();
  });

  it("derives the stepstimeline nodes from progress records with no new state", () => {
    const progress: planprogress = { planid: plan.id, completedsteps: ["s1", "s2"], outcomes: [{ stepid: "s2", ok: true, summary: "Checkout opened.", at: now - 500 }], environments: { s1: "offscreenworker" }, turnarounds: { s1: 120 }, gatewaits: { s3: { gateid: "g1", kind: "confirmpay", openedat: now - 100, resolvedat: now, waitedms: 100 } }, updatedat: now };
    const nodes = stepstimelinenodes({ plan, progress, now });
    expect(nodes.map(node => node.status)).toEqual(["done", "done", "waiting", "pending"]);
    expect(nodes[0]?.environment).toBe("offscreenworker");
    expect(nodes[0]?.durationms).toBe(120);
    expect(nodes[0]?.resultsummary).toBeUndefined();
    expect(nodes[1]?.resultsummary).toBe("Checkout opened.");
    expect(nodes[2]?.status).toBe("waiting");
    expect(activetimelineanchor(nodes)).toBeUndefined();
    const cancelled: agentplan = { ...plan, state: "cancelled" };
    expect(stepstimelinenodes({ plan: cancelled, now }).map(node => node.status)).toEqual(["halted", "halted", "halted", "halted"]);
    const approvednodes = stepstimelinenodes({ plan, now });
    expect(approvednodes[0]?.status).toBe("running");
    expect(approvednodes[0]?.active).toBe(true);
    expect(activetimelineanchor(approvednodes)).toBe("#step-s1");
    expect(approvednodes[3]?.anchor).toBe("#step-s4");
    const failed: planprogress = { planid: plan.id, completedsteps: [], outcomes: [{ stepid: "s1", ok: false, summary: "The table never loaded.", at: now }], updatedat: now };
    expect(stepstimelinenodes({ plan, progress: failed, now })[0]?.status).toBe("failed");
  });

  it("appends logstream events behind the hash chain with level, source and step ref", async () => {
    const first = await logstreameventof({ level: "info", source: "background", origin: plan.origin, summary: "The session started.", masked: false, maskverdict: "The source payload carries no masked value.", previous: logstreamgenesis, at: now });
    expect(first.hash.previous).toBe(logstreamgenesis);
    expect(first.level).toBe("info");
    const second = await logstreameventof({ level: "warn", source: "background", origin: plan.origin, summary: "The step waited at its gate.", stepid: "s3", masked: true, maskverdict: "The card value stayed masked.", previous: first.hash.current, at: now + 10 });
    expect(second.hash.previous).toBe(first.hash.current);
    const events = appendlogstreamevent(appendlogstreamevent([], first), second);
    expect(events).toHaveLength(2);
    await expect(logstreameventof({ level: "info", source: "background", origin: plan.origin, summary: " ", masked: false, maskverdict: "The source payload carries no masked value.", previous: logstreamgenesis, at: now })).rejects.toThrow(/summary/);
  });

  it("verifies the logstream hash chain live and names the broken link", async () => {
    const first = await logstreameventof({ level: "info", source: "background", origin: plan.origin, summary: "First event.", masked: false, maskverdict: "The source payload carries no masked value.", previous: logstreamgenesis, at: now });
    const second = await logstreameventof({ level: "error", source: "background", origin: plan.origin, summary: "Second event.", masked: false, maskverdict: "The source payload carries no masked value.", previous: first.hash.current, at: now + 1 });
    expect((await verifylogstream([first, second])).valid).toBe(true);
    const tampered = { ...second, summary: "Tampered summary." };
    const broken = await verifylogstream([first, tampered]);
    expect(broken.valid).toBe(false);
    expect(broken.brokenat).toBe(1);
    expect(broken.reason).toMatch(/hash does not reproduce/);
    const relinked = { ...second, hash: { ...second.hash, previous: logstreamgenesis } };
    expect((await verifylogstream([first, relinked])).reason).toMatch(/does not link/);
  });

  it("filters the logstream by level, origin and step ref and keeps the bounded live window only", async () => {
    const first = await logstreameventof({ level: "info", source: "background", origin: "https://a.example", summary: "Info of a.", masked: false, maskverdict: "The source payload carries no masked value.", previous: logstreamgenesis, at: now });
    const second = await logstreameventof({ level: "warn", source: "background", origin: "https://b.example", summary: "Warn of b.", stepid: "s3", masked: false, maskverdict: "The source payload carries no masked value.", previous: first.hash.current, at: now + 1 });
    const third = await logstreameventof({ level: "warn", source: "background", origin: "https://a.example", summary: "Warn of a.", masked: false, maskverdict: "The source payload carries no masked value.", previous: second.hash.current, at: now + 2 });
    const events = [first, second, third];
    expect(filterlogstream(events, {})).toHaveLength(3);
    expect(filterlogstream(events, { level: "warn" })).toHaveLength(2);
    expect(filterlogstream(events, { origin: "https://a.example" })).toHaveLength(2);
    expect(filterlogstream(events, { stepid: "s3" })).toHaveLength(1);
    expect(filterlogstream(events, { level: "warn", origin: "https://a.example" })).toHaveLength(1);
    expect(livebufferof(events, undefined)).toHaveLength(3);
    expect(livebufferof(events, 2)).toEqual([second, third]);
    expect(livebufferof(events, 1)).toEqual([third]);
    expect(livebufferof(events, 0)).toHaveLength(3);
    expect(logbufferboundvalid(undefined).allowed).toBe(true);
    expect(logbufferboundvalid(10).reason).toMatch(/user configured choice/);
    expect(logbufferboundvalid(0).allowed).toBe(false);
    expect(logbufferboundvalid(2.5).allowed).toBe(false);
  });

  it("copies a verified range as an audit excerpt and refuses an unverified chain", async () => {
    const first = await logstreameventof({ level: "info", source: "background", origin: plan.origin, summary: "First event.", masked: false, maskverdict: "The source payload carries no masked value.", previous: logstreamgenesis, at: now });
    const second = await logstreameventof({ level: "warn", source: "background", origin: plan.origin, summary: "Second event.", stepid: "s1", masked: true, maskverdict: "The typed value stayed masked.", previous: first.hash.current, at: now + 1 });
    const excerpt = await auditexcerptof([first, second], { from: 0, to: 2 });
    expect(excerpt.ok).toBe(true);
    expect(excerpt.text).toContain("First event.");
    expect(excerpt.text).toContain("step s1");
    expect(excerpt.text).toContain("The typed value stayed masked.");
    const gate = logstreamegressgate({ verified: excerpt.ok, entries: 2 });
    expect(gate.allowed).toBe(true);
    expect(logstreamegressgate({ verified: false, entries: 2 }).reason).toMatch(/refuses the copy/);
    expect(logstreamegressgate({ verified: true, entries: 0 }).allowed).toBe(false);
    const tampered = { ...second, summary: "Tampered." };
    const refused = await auditexcerptof([first, tampered], { from: 0, to: 2 });
    expect(refused.ok).toBe(false);
    expect(refused.reason).toMatch(/refuses the copy/);
    expect((await auditexcerptof([first, second], { from: 5, to: 9 })).ok).toBe(false);
  });

  it("maps audit kinds onto the logstream levels their events carry", () => {
    expect(loglevelof("error")).toBe("error");
    expect(loglevelof("deny")).toBe("warn");
    expect(loglevelof("revoke")).toBe("warn");
    expect(loglevelof("approval")).toBe("info");
    expect(loglevelof("action")).toBe("info");
  });
});
