import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { sessionmemory } from "../memory.js";
import {
  broadcastchannelof, broadcastframeof, busrouteaction, focusorderof, onboardingcomplete, onboardingstart, onboardingsteps,
  palettecommandsof, palettequery, paletteuseafter, reviewdialogorder, surfacepalette, taskhistoryafter, taskinputof,
} from "../views.js";
import { onboardingconsentgate, paletteactiongate, planreviewgate, taskinputproposalgate } from "../policy.js";
import type { paletteuserecord } from "../types.js";

const now = 1_800_000_000_000;

class fakeadapter {
  private readonly data = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | undefined> { return this.data.get(key) as T | undefined; }
  async set<T>(key: string, value: T): Promise<void> { this.data.set(key, value); }
}

describe("interface surfaces", () => {
  it("registers the commandpalette catalog from every module at startup", () => {
    const entries = surfacepalette();
    expect(entries.length).toBeGreaterThanOrEqual(12);
    expect(entries.map(entry => entry.id)).toContain("starttask");
    expect(entries.map(entry => entry.id)).toContain("resumesession");
    expect(entries.map(entry => entry.id)).toContain("revokeconsent");
    expect(entries.map(entry => entry.id)).toContain("opentransparencypage");
    expect(entries.map(entry => entry.id)).toContain("opendashboardpage");
    expect(entries.map(entry => entry.id)).toContain("openoptionspage");
    for (const entry of entries) expect(entry.keywords.length).toBeGreaterThan(0);
  });

  it("lists only the palette actions the current capability set and session state allow", () => {
    const entries = surfacepalette();
    expect(palettecommandsof(entries, { granted: ["activeTab", "storage"], sessionactive: false }).map(entry => entry.id)).not.toContain("cancelrun");
    expect(palettecommandsof(entries, { granted: ["activeTab", "storage"], sessionactive: true }).map(entry => entry.id)).toContain("cancelrun");
    expect(palettecommandsof(entries, { granted: ["activeTab", "storage", "tabs"], sessionactive: true }).map(entry => entry.id)).toContain("historysearch");
    const gate = paletteactiongate({ action: { command: "x", permission: "tabs", session: true }, granted: ["tabs"], sessionactive: false });
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toMatch(/active browser session/);
  });

  it("fuzzy searches ids, labels and keywords and ranks the recent commands first", () => {
    const entries = surfacepalette();
    const usage: paletteuserecord[] = [
      { command: "openoptionspage", count: 3, lastusedat: now - 100 },
      { command: "cancelrun", count: 1, lastusedat: now - 50_000 },
    ];
    const exact = palettequery(entries, { text: "cancelrun", usage });
    expect(exact[0]?.entry.id).toBe("cancelrun");
    expect(exact[0]?.score).toBeGreaterThanOrEqual(100);
    const fuzzy = palettequery(entries, { text: "opts", usage });
    expect(fuzzy.map(match => match.entry.id)).toContain("openoptionspage");
    const settings = palettequery(entries, { text: "options", usage, recentwindow: 5 });
    expect(settings[0]?.entry.id).toBe("openoptionspage");
    expect(settings[0]?.reason).toMatch(/rank it first/);
    expect(palettequery(entries, { text: "zzzznope", usage })).toHaveLength(0);
    expect(palettequery(entries, { text: "", usage }).length).toBe(entries.length);
  });

  it("records palette usage counts so the recent first ranking reads both count and recency", () => {
    let usage: paletteuserecord[] = [];
    usage = paletteuseafter(usage, "starttask", now);
    usage = paletteuseafter(usage, "starttask", now + 1000);
    expect(usage).toHaveLength(1);
    expect(usage[0]?.count).toBe(2);
    expect(usage[0]?.lastusedat).toBe(now + 1000);
    usage = paletteuseafter(usage, "cancelrun", now + 2000);
    expect(usage).toHaveLength(2);
  });

  it("routes taskinput submissions through the same proposal flow as the api", () => {
    const submission = taskinputof({ text: "  Collect the pricing table  ", context: "Pricing: the table loads under #pricing", origin: "https://example.com", surface: "popup", at: now });
    expect(submission.text).toBe("Collect the pricing table");
    expect(submission.origin).toBe("https://example.com");
    expect(submission.surface).toBe("popup");
    expect(() => taskinputof({ text: "  ", origin: "https://example.com", surface: "popup", at: now })).toThrow(/goal/);
    expect(() => taskinputof({ text: "goal", origin: " ", surface: "popup", at: now })).toThrow(/origin/);
    expect(taskinputproposalgate({ text: "goal", origin: "https://example.com", direct: false }).allowed).toBe(true);
    expect(taskinputproposalgate({ text: "goal", origin: "https://example.com", direct: true }).reason).toMatch(/same proposal flow/);
    expect(taskinputproposalgate({ text: "", origin: "https://example.com", direct: false }).allowed).toBe(false);
  });

  it("keeps the taskinput history per profile with the user retention window only", () => {
    const first = taskinputof({ text: "first goal", origin: "https://a.example", surface: "popup", at: now - 10_000 });
    const second = taskinputof({ text: "second goal", origin: "https://a.example", surface: "sidepanel", at: now });
    expect(taskhistoryafter([first], second, undefined, now)).toHaveLength(2);
    expect(taskhistoryafter([first], second, 5000, now)).toEqual([second]);
  });

  it("stores the taskinput history and the palette usage through the memory seam", async () => {
    const store = new sessionmemory(new fakeadapter());
    const submission = taskinputof({ text: "gather the invoices", origin: "https://shop.example", surface: "popup", at: now });
    await store.addtaskinput(submission);
    expect((await store.gettaskinputs())[0]?.text).toBe("gather the invoices");
    const usage = paletteuseafter(await store.getpaletteusage(), "starttask", now);
    await store.setpaletteusage(usage);
    expect((await store.getpaletteusage())[0]?.command).toBe("starttask");
  });

  it("sequences the onboarding walkthrough and writes one consent scoped event on full completion", () => {
    const steps = onboardingsteps();
    expect(steps.map(step => step.id)).toEqual(["origingrants", "planreview", "runcontrol", "logaudit", "library", "performance"]);
    expect(steps.every(step => step.completion !== "")).toBe(true);
    expect(steps.filter(step => step.optional === true).map(step => step.id)).toEqual(["library", "performance"]);
    let state = onboardingstart(undefined, now);
    expect(state.done).toBe(false);
    state = onboardingcomplete(state, "origingrants", now + 1).state;
    state = onboardingcomplete(state, "planreview", now + 2).state;
    state = onboardingcomplete(state, "runcontrol", now + 3).state;
    expect(state.done).toBe(false);
    const finished = onboardingcomplete(state, "logaudit", now + 4);
    expect(finished.state.done).toBe(true);
    expect(finished.consentevent).toBe("onboardingconsentgranted");
    const withoptional = onboardingcomplete({ stepscompleted: ["origingrants", "planreview", "runcontrol", "logaudit", "library"], done: false, startedat: now }, "library", now + 5);
    expect(withoptional.state.done).toBe(true);
    expect(withoptional.state.stepscompleted).toContain("library");
    expect(() => onboardingcomplete(state, "unknown", now)).toThrow(/onboarding knows no/);
    expect(onboardingconsentgate({ consentevents: [] }).allowed).toBe(true);
    expect(onboardingconsentgate({ consentevents: ["onboardingconsentgranted"] }).allowed).toBe(false);
    const replayed = onboardingstart(finished.state, now + 5);
    expect(replayed.stepscompleted).toEqual([]);
    expect(replayed.done).toBe(false);
    expect(replayed.consentevent).toBeUndefined();
  });

  it("stores the onboarding completion state and the surface layout preferences through the memory seam", async () => {
    const store = new sessionmemory(new fakeadapter());
    expect(await store.getonboardingstate()).toBeUndefined();
    await store.setonboardingstate({ stepscompleted: ["origingrants"], done: false, startedat: now });
    expect((await store.getonboardingstate())?.stepscompleted).toEqual(["origingrants"]);
    await store.setsurfacelayout({ surface: "sidepanel", preferences: { tab: "review" }, updatedat: now });
    expect((await store.getsurfacelayout("sidepanel"))?.preferences.tab).toBe("review");
    await store.setlogstreamfilters({ level: "warn" });
    expect((await store.getlogstreamfilters())?.level).toBe("warn");
    await store.addstepapproveresolution({ stepid: "s2", planid: "run1", origin: "https://example.com", resolution: "approve", surface: "sidepanel", at: now });
    expect((await store.getstepapproveresolutions())[0]?.resolution).toBe("approve");
  });

  it("routes every surface action through the same policy gates in the command bus", () => {
    const granted = ["activeTab", "storage", "scripting", "sidePanel"];
    expect(busrouteaction({ surface: "popup", command: "starttask" }, { sessionactive: true, granted, planreviewed: false, planstate: "pending", text: "goal", origin: "https://example.com" }).dispatched).toBe(true);
    const unknown = busrouteaction({ surface: "popup", command: "maketea" }, { sessionactive: true, granted, planreviewed: false, planstate: "pending" });
    expect(unknown.dispatched).toBe(false);
    expect(unknown.gate).toBe("commandbus");
    const nosession = busrouteaction({ surface: "popup", command: "cancelrun" }, { sessionactive: false, granted, planreviewed: false, planstate: "pending" });
    expect(nosession.dispatched).toBe(false);
    expect(nosession.gate).toBe("paletteactiongate");
    const unreviewed = busrouteaction({ surface: "sidepanel", command: "diffpreview" }, { sessionactive: true, granted, planreviewed: false, planstate: "pending" });
    expect(unreviewed.dispatched).toBe(false);
    expect(unreviewed.gate).toBe("planreviewgate");
    expect(planreviewgate({ reviewed: false, state: "pending" }).reason).toMatch(/plancard review/);
    expect(planreviewgate({ reviewed: true, state: "pending" }).allowed).toBe(true);
    expect(planreviewgate({ reviewed: false, state: "approved" }).allowed).toBe(true);
  });

  it("frames every run state, session store and settings change on the single broadcast channel", () => {
    const frame = broadcastframeof({ channel: "runstate", surface: "background", summary: "The plan approved.", at: now });
    expect(frame.channel).toBe("runstate");
    expect(() => broadcastframeof({ channel: "logstream", surface: "popup", summary: " ", at: now })).toThrow(/summary/);
    expect(broadcastchannelof("action")).toBe("runstate");
    expect(broadcastchannelof("notes")).toBe("sessions");
    expect(broadcastchannelof("configure")).toBe("settings");
    expect(broadcastchannelof("phish")).toBe("logstream");
  });

  it("computes the fixed keyboard focus order of the review dialog and the sidepanel renders it", async () => {
    /* the 2.0.2 focus order fix of the rc.2 final polish: the review dialog walks the step summary read first, then the approve, revise and reject controls, with the tabindex sequence the focusorderof helper computes and the first control as the focus target */
    expect(reviewdialogorder).toEqual(["readsummary", "approve", "revise", "reject"]);
    const order = focusorderof();
    expect(order.order).toEqual([
      { control: "readsummary", tabindex: 1 },
      { control: "approve", tabindex: 2 },
      { control: "revise", tabindex: 3 },
      { control: "reject", tabindex: 4 },
    ]);
    expect(order.focusfirst).toBe("readsummary");
    expect(() => focusorderof(["approve", "approve", "reject"])).toThrow(/twice/);
    expect(() => focusorderof(["approve", " ", "reject"])).toThrow(/named/);
    expect(() => focusorderof([])).toThrow(/needs its controls/);
    /* the sidepanel renders the ordered tabindex sequence on the review dialog controls and moves focus to the first control when the dialog opens: the read summary carries tabindex 1 while the approve, revise and reject buttons carry their ordered values, and the review tab opens the dialog that focuses the first control */
    const sidepanel = await readFile("web/extension/sidepanel.ts", "utf8");
    expect(sidepanel).toContain("const reviewfocus = focusorderof();");
    for (const control of ["readsummary", "approve", "revise", "reject"]) {
      expect(sidepanel).toContain(`tabindexof("${control}")`);
      expect(sidepanel).toContain(`dataset.focusorder = "${control}"`);
    }
    expect(sidepanel).toContain('if (active === "review") { reviewdialogopens = true; focusreviewdialog(); }');
    expect(sidepanel).toContain("if (reviewdialogopens) { reviewdialogopens = false; focusreviewdialog(); }");
    expect(sidepanel).toContain('querySelector<HTMLElement>(`[data-focusorder="${reviewfocus.focusfirst}"]`)?.focus()');
  });
});
