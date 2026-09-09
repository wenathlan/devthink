import { describe, expect, it } from "vitest";
import { composeworkflow, newworkflowrun, workflowstepof } from "../workflow.js";
import {
  applycooldown,
  armrule,
  confirmmanualrun,
  cronnext,
  cronparse,
  defaulttriggercooldown,
  drainqueue,
  evaluatetrigger,
  eventrulematches,
  listdue,
  manualpreview,
  matchurl,
  observeevents,
  pauseall,
  queuefire,
  resumeall,
  ruleoriginsgranted,
  runurllist,
  schedulecron,
  scheduleinterval,
  timezonevalid,
  triggereventcatalog,
  triggerfamilyof,
  triggerkinds,
  triggersummary,
  updaterule,
  verifywebhook,
  visitmatch,
  webhooksecretok,
} from "../workflow.js";
import {
  actionrisk,
  canexecute,
  isworkflowkind,
  istriggeraction,
  triggergate,
  triggerorigins,
  validatestep,
} from "../policy.js";
import { manualrunpreview, outcomeresponse, parseproposal, triggerfired, triggerlist } from "../protocol.js";
import { protocolversion } from "../types.js";
import { recordtrigger, triggerevidences } from "../progress.js";
import { sessionmemory } from "../memory.js";
import type {
  agentplan,
  agentsession,
  manualrun,
  toolstep,
  triggerfire,
  triggerule,
  workflowrecord,
} from "../types.js";

const now = 1_800_000_000_000;
const session: agentsession = {
  id: "sess",
  tabid: 4,
  origin: "https://example.com",
  startedat: now - 1000,
  expiresat: now + 600_000,
  grants: ["https://example.com"],
};
const plan: agentplan = {
  id: "run",
  objective: "Run the reviewed triggers",
  origin: "https://example.com",
  steps: [],
  createdat: now - 2000,
  expiresat: now + 600_000,
  state: "approved",
};

function kindallowed(kind: string): boolean {
  try {
    actionrisk(kind as toolstep["kind"]);
    return true;
  } catch {
    return false;
  }
}
function riskof(kind: string): "read" | "interaction" | "sensitive" {
  return actionrisk(kind as toolstep["kind"]);
}

/** Builds one trigger step of the given family with its reviewed rule payload. */
function triggerstep(kind: string, payload: Record<string, unknown>, extra: Record<string, unknown> = {}): toolstep {
  return {
    id: "t1",
    kind: kind as toolstep["kind"],
    summary: `The reviewed ${kind} step`,
    risk: "sensitive",
    options: JSON.stringify({ workflowid: "wf1", reviewed: true, rule: payload, ...extra }),
  };
}

/** Arms one rule of the given family through the engine normalizer. */
function armedrule(kind: string, payload: Record<string, unknown>, extra: Record<string, unknown> = {}): triggerule {
  const family = triggerfamilyof(kind);
  if (!family) throw new Error(`The ${kind} step is not a trigger kind.`);
  const rule = armrule({ family, workflowid: "wf1", payload, ...extra, now });
  if (!rule) throw new Error(`The ${kind} rule did not arm.`);
  return rule;
}

class fakeadapter {
  private readonly data = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | undefined> {
    return this.data.get(key) as T | undefined;
  }
  async set<T>(key: string, value: T): Promise<void> {
    this.data.set(key, value);
  }
}

describe("trigger kinds, families and rule arming", () => {
  it("lists the ten trigger kinds and grades every automatic launcher sensitive", () => {
    expect(triggerkinds).toEqual([
      "visitrule",
      "urlrule",
      "menurule",
      "keyrule",
      "buttonrule",
      "cronrule",
      "intervalrule",
      "urllistrule",
      "webhookrule",
      "eventrule",
    ]);
    for (const kind of triggerkinds) {
      expect(istriggeraction(kind as toolstep["kind"])).toBe(true);
      expect(isworkflowkind(kind as toolstep["kind"])).toBe(false);
      expect(kindallowed(kind)).toBe(true);
      expect(actionrisk(kind as toolstep["kind"])).toBe("sensitive");
      expect(triggerfamilyof(kind)).toBeDefined();
    }
    expect(istriggeraction("runworkflow")).toBe(false);
    expect(triggerfamilyof("click")).toBeUndefined();
  });

  it("arms every family behind its grammar and applies the documented webhook and event cooldown defaults", () => {
    expect(armedrule("visitrule", { origins: ["https://example.com"] }).state.cooldown).toBe(0);
    expect(armedrule("urlrule", { pattern: "https://example.com/*/detail" }).pattern).toBe(
      "https://example.com/*/detail",
    );
    expect(armedrule("menurule", { title: "Run the reader" }).title).toBe("Run the reader");
    expect(armedrule("keyrule", { command: "run-reader", key: "Ctrl+Shift+R" }).command).toBe("run-reader");
    expect(armedrule("buttonrule", {}).kind).toBe("button");
    expect(armedrule("cronrule", { cron: "*/15 * * * *", timezone: "America/New_York" }).timezone).toBe(
      "America/New_York",
    );
    expect(armedrule("intervalrule", { period: 60_000, jitter: 10_000 }).jitter).toBe(10_000);
    expect(armedrule("urllistrule", { urls: ["https://example.com/a", "https://example.com/b"] }).urls).toHaveLength(2);
    expect(
      armedrule("webhookrule", {
        secret: "devthink-secret-2026-abc123",
        schema: [{ name: "task", kind: "string", required: true }],
      }).state.cooldown,
    ).toBe(defaulttriggercooldown);
    expect(armedrule("eventrule", { events: ["mutate", "navigate"] }).state.cooldown).toBe(defaulttriggercooldown);
    expect(armedrule("eventrule", { events: ["mutate"] }, { cooldown: 60_000 }).state.cooldown).toBe(60_000);
  });

  it("refuses malformed family payloads and cooldown windows", () => {
    expect(
      armrule({ family: "visit", workflowid: "wf1", payload: { origins: ["http://insecure.example"] }, now }),
    ).toBeUndefined();
    expect(armrule({ family: "visit", workflowid: "wf1", payload: { origins: [] }, now })).toBeUndefined();
    expect(armrule({ family: "url", workflowid: "wf1", payload: { pattern: "example.com/*" }, now })).toBeUndefined();
    expect(armrule({ family: "cron", workflowid: "wf1", payload: { cron: "not a cron" }, now })).toBeUndefined();
    expect(
      armrule({ family: "cron", workflowid: "wf1", payload: { cron: "* * * * *", timezone: "Not/AZone" }, now }),
    ).toBeUndefined();
    expect(armrule({ family: "interval", workflowid: "wf1", payload: { period: 0 }, now })).toBeUndefined();
    expect(
      armrule({ family: "interval", workflowid: "wf1", payload: { period: 1000, jitter: -1 }, now }),
    ).toBeUndefined();
    expect(
      armrule({ family: "urllist", workflowid: "wf1", payload: { urls: ["https://example.com/a", "nope"] }, now }),
    ).toBeUndefined();
    expect(
      armrule({
        family: "webhook",
        workflowid: "wf1",
        payload: { secret: "short", schema: [{ name: "task", kind: "string" }] },
        now,
      }),
    ).toBeUndefined();
    expect(
      armrule({
        family: "webhook",
        workflowid: "wf1",
        payload: { secret: "devthink-secret-2026-abc123", schema: [] },
        now,
      }),
    ).toBeUndefined();
    expect(armrule({ family: "event", workflowid: "wf1", payload: { events: ["nope"] }, now })).toBeUndefined();
    expect(
      armrule({ family: "event", workflowid: "wf1", payload: { events: ["mutate"] }, cooldown: 0, now }),
    ).toBeUndefined();
    expect(armrule({ family: "event", workflowid: "", payload: { events: ["mutate"] }, now })).toBeUndefined();
    expect(timezonevalid("America/New_York")).toBe(true);
    expect(timezonevalid("Mars/Olympus")).toBe(false);
  });

  it("summarizes every family for the review panel and checks the rule origins against the workflow grants", () => {
    expect(triggersummary(armedrule("cronrule", { cron: "0 9 * * *" })).cron).toBe("0 9 * * *");
    expect(
      triggersummary(
        armedrule("webhookrule", { secret: "devthink-secret-2026-abc123", schema: [{ name: "task", kind: "string" }] }),
      ).fields,
    ).toBe(1);
    const visit = armedrule("visitrule", { origins: ["https://example.com"] });
    expect(ruleoriginsgranted(visit, ["https://example.com"])).toBe(true);
    expect(ruleoriginsgranted(visit, ["https://other.example"])).toBe(false);
    const list = armedrule("urllistrule", { urls: ["https://example.com/a", "https://elsewhere.example/b"] });
    expect(ruleoriginsgranted(list, ["https://example.com"])).toBe(false);
    const pattern = armedrule("urlrule", { pattern: "https://example.com/*" });
    expect(ruleoriginsgranted(pattern, ["https://example.com"])).toBe(true);
    expect(ruleoriginsgranted(armedrule("buttonrule", {}), [])).toBe(true);
  });
});

describe("trigger url matching", () => {
  it("matches glob patterns across segments and honors explicit ports", () => {
    expect(matchurl("https://example.com/*/detail", "https://example.com/a/detail")).toBe(true);
    expect(matchurl("https://example.com/*/detail", "https://example.com/a/b/detail")).toBe(false);
    expect(matchurl("https://example.com/**/detail", "https://example.com/a/b/detail")).toBe(true);
    expect(matchurl("https://example.com/articles/*?id=*", "https://example.com/articles/one?id=7")).toBe(true);
    expect(matchurl("https://example.com/*", "https://other.example/x")).toBe(false);
    expect(matchurl("https://example.com/*", "http://example.com/x")).toBe(false);
    expect(matchurl("https://example.com:8443/*", "https://example.com:8443/x")).toBe(true);
    expect(matchurl("https://example.com:8443/*", "https://example.com/x")).toBe(false);
    expect(matchurl("https://example.com/*", "https://example.com:8443/x")).toBe(true);
    expect(matchurl("https://example.com/*", "not a url")).toBe(false);
  });

  it("fires visit rules when a navigation lands on a reviewed origin", () => {
    const rule = armedrule("visitrule", { origins: ["https://example.com", "https://docs.example.com"] });
    expect(visitmatch(rule.origins as string[], "https://example.com/articles/one")).toBe(true);
    expect(visitmatch(rule.origins as string[], "https://docs.example.com/guide")).toBe(true);
    expect(visitmatch(rule.origins as string[], "https://other.example/articles/one")).toBe(false);
    expect(visitmatch(rule.origins as string[], "about:blank")).toBe(false);
    const decision = evaluatetrigger({
      rule,
      now,
      cause: "visit",
      url: "https://example.com/articles/one",
      title: "One",
      runactive: false,
      workflowreviewed: true,
    });
    expect(decision.fired).toBe(true);
    expect(decision.fire?.url).toBe("https://example.com/articles/one");
    expect(decision.fire?.title).toBe("One");
    expect(decision.fire?.ruleid).toBe(rule.id);
  });
});

describe("cron parsing and scheduling", () => {
  it("parses five field expressions with lists, ranges, steps and named weekdays and months", () => {
    expect(cronparse("*/15 * * * *")?.minutes).toEqual([0, 15, 30, 45]);
    expect(cronparse("0,30 9-17 * * *")?.hours).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17]);
    expect(cronparse("0 0 1 jan *")?.months).toEqual([1]);
    expect(cronparse("0 9 * * mon-fri")?.daysofweek).toEqual([1, 2, 3, 4, 5]);
    expect(cronparse("0 0 * * 7")?.daysofweek).toEqual([0]);
    expect(cronparse("5 4 * * sun,sat")?.daysofweek).toEqual([0, 6]);
    expect(cronparse("1-10/3 * * * *")?.minutes).toEqual([1, 4, 7, 10]);
    expect(cronparse("* * * * *")?.minutes).toHaveLength(60);
    expect(cronparse("61 * * * *")).toBeUndefined();
    expect(cronparse("* 24 * * *")).toBeUndefined();
    expect(cronparse("* * 0 * *")).toBeUndefined();
    expect(cronparse("* * * 13 *")).toBeUndefined();
    expect(cronparse("not a cron")).toBeUndefined();
    expect(cronparse("* * * *")).toBeUndefined();
    expect(cronparse("60 * * * *")).toBeUndefined();
    expect(cronparse("5-1 * * * *")).toBeUndefined();
  });

  it("computes the next fire time on minute boundaries and walks sparse schedules", () => {
    const from = Date.UTC(2026, 0, 15, 8, 59, 30);
    expect(cronnext("*/15 * * * *", from)).toBe(Date.UTC(2026, 0, 15, 9, 0));
    expect(cronnext("30,45 * * * *", Date.UTC(2026, 0, 15, 9, 10))).toBe(Date.UTC(2026, 0, 15, 9, 30));
    expect(cronnext("0 9 * * *", Date.UTC(2026, 0, 15, 9, 0))).toBe(Date.UTC(2026, 0, 16, 9, 0));
    expect(cronnext("0 9 * * mon", Date.UTC(2026, 0, 15, 10, 0))).toBe(Date.UTC(2026, 0, 19, 9, 0));
    expect(cronnext("0 0 1 jan *", Date.UTC(2026, 5, 1))).toBe(Date.UTC(2027, 0, 1, 0, 0));
    expect(cronnext("0 0 29 2 *", Date.UTC(2026, 0, 1))).toBe(Date.UTC(2028, 1, 29, 0, 0));
    expect(cronnext("0 0 30 2 *", Date.UTC(2026, 0, 1))).toBeUndefined();
    expect(cronnext("bad", Date.UTC(2026, 0, 1))).toBeUndefined();
  });

  it("honors the classic day of month and day of week or semantics", () => {
    expect(cronnext("0 0 1 * 1", Date.UTC(2025, 11, 31, 12, 0))).toBe(Date.UTC(2026, 0, 1, 0, 0));
    expect(cronnext("0 0 1 * 1", Date.UTC(2026, 0, 1, 1, 0))).toBe(Date.UTC(2026, 0, 5, 0, 0));
  });

  it("computes cron fire times inside the reviewed timezone through the runtime timezone database", () => {
    const utcfrom = Date.UTC(2026, 0, 15, 13, 0, 0);
    expect(cronnext("0 9 * * *", utcfrom, "America/New_York")).toBe(Date.UTC(2026, 0, 15, 14, 0));
    expect(cronnext("0 9 * * *", Date.UTC(2026, 0, 15, 14, 0), "America/New_York")).toBe(Date.UTC(2026, 0, 16, 14, 0));
    expect(schedulecron({ cron: "0 9 * * *", timezone: "America/New_York" }, utcfrom)).toBe(
      Date.UTC(2026, 0, 15, 14, 0),
    );
  });

  it("spreads interval fires inside the reviewed jitter window with the seeded random source", () => {
    const samples = new Set<number>();
    for (let seed = 0; seed < 200; seed += 1)
      samples.add(scheduleinterval({ period: 60_000, jitter: 20_000 }, 1_000_000, 500_000, seed));
    expect(samples.size).toBeGreaterThan(100);
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(1_060_000 - 10_000);
      expect(sample).toBeLessThanOrEqual(1_060_000 + 10_000);
    }
    expect(scheduleinterval({ period: 60_000 }, 1_000_000, 500_000, 1)).toBe(1_060_000);
    expect(scheduleinterval({ period: 60_000, jitter: 0 }, 1_000_000, 500_000, 1)).toBe(1_060_000);
  });

  it("returns the scheduled rules whose next fire time has passed", () => {
    const due = armedrule("cronrule", { cron: "* * * * *" });
    const later = armedrule("cronrule", { cron: "0 0 1 1 *" });
    const interval = armedrule("intervalrule", { period: 1000 });
    const disabled = updaterule(armedrule("cronrule", { cron: "* * * * *" }), { state: { enabled: false } });
    const paused = updaterule(armedrule("cronrule", { cron: "* * * * *" }), { state: { pausedat: now } });
    const listed = listdue(
      [
        { ...due, state: { ...due.state, nextfireat: now - 5000 } },
        { ...later, state: { ...later.state, nextfireat: now + 500_000 } },
        { ...interval, state: { ...interval.state, nextfireat: now - 1 } },
        { ...disabled, state: { ...disabled.state, nextfireat: now - 1 } },
        { ...paused, state: { ...paused.state, nextfireat: now - 1 } },
      ],
      now,
    );
    expect(listed.map((entry) => entry.rule.kind)).toEqual(["cron", "interval"]);
    expect(listed[0]?.overdueby).toBe(5000);
  });
});

describe("trigger evaluation, cooldown, dedupe and the queue", () => {
  it("suppresses fires inside the cooldown window and reports the remaining window", () => {
    const rule = armedrule("eventrule", { events: ["mutate"] }, { cooldown: 60_000 });
    const cooled = { ...rule, state: { ...rule.state, lastfireat: now - 10_000 } };
    expect(applycooldown(cooled, now).suppressed).toBe(true);
    expect(applycooldown(cooled, now).remaining).toBe(50_000);
    const decision = evaluatetrigger({ rule: cooled, now, cause: "event", runactive: false, workflowreviewed: true });
    expect(decision.fired).toBe(false);
    expect(decision.suppressed).toBe("cooldown");
    expect(decision.remaining).toBe(50_000);
    expect(
      evaluatetrigger({
        rule: { ...cooled, state: { ...cooled.state, lastfireat: now - 60_000 } },
        now,
        cause: "event",
        runactive: false,
        workflowreviewed: true,
      }).fired,
    ).toBe(true);
  });

  it("never fires disabled, paused or unreviewed rules and dedupes while a run is active", () => {
    const rule = armedrule("visitrule", { origins: ["https://example.com"] });
    expect(
      evaluatetrigger({
        rule: updaterule(rule, { state: { enabled: false } }),
        now,
        cause: "visit",
        runactive: false,
        workflowreviewed: true,
      }).suppressed,
    ).toBe("disabled");
    expect(
      evaluatetrigger({
        rule: updaterule(rule, { state: { pausedat: now } }),
        now,
        cause: "visit",
        runactive: false,
        workflowreviewed: true,
      }).suppressed,
    ).toBe("paused");
    expect(evaluatetrigger({ rule, now, cause: "visit", runactive: false, workflowreviewed: false }).suppressed).toBe(
      "unreviewed",
    );
    expect(evaluatetrigger({ rule, now, cause: "visit", runactive: true, workflowreviewed: true }).suppressed).toBe(
      "dedupe",
    );
  });

  it("keeps one pending fire per rule in the queue while a run is active", () => {
    const first: triggerfire = { id: "f1", ruleid: "r1", at: now, cause: "visit", url: "https://example.com/a" };
    const second: triggerfire = { id: "f2", ruleid: "r1", at: now + 1, cause: "visit", url: "https://example.com/b" };
    const other: triggerfire = { id: "f3", ruleid: "r2", at: now + 2, cause: "visit" };
    const queued = queuefire([], first);
    expect(queued.queued).toBe(true);
    const deduped = queuefire(queued.queue, second);
    expect(deduped.deduped).toBe(true);
    expect(deduped.queue).toHaveLength(1);
    const both = queuefire(deduped.queue, other);
    expect(both.queue).toHaveLength(2);
    expect(both.queued).toBe(true);
  });

  it("drains the queued fires in arrival order and keeps the rest when a launch fails", async () => {
    const fires: triggerfire[] = [
      { id: "f1", ruleid: "r1", at: now, cause: "visit" },
      { id: "f2", ruleid: "r2", at: now + 1, cause: "url" },
    ];
    const launched: string[] = [];
    const drained = await drainqueue(fires, async (fire) => {
      launched.push(fire.id);
    });
    expect(launched).toEqual(["f1", "f2"]);
    expect(drained).toEqual({ launched: 2, remaining: [] });
    const failing = await drainqueue(fires, async (fire) => {
      if (fire.id === "f1") throw new Error("the run refused the launch");
      launched.push(fire.id);
    });
    expect(failing.launched).toBe(0);
    expect(failing.remaining).toHaveLength(2);
  });

  it("suspends every enabled rule on session pause and releases them on resume", () => {
    const rules = [
      armedrule("visitrule", { origins: ["https://example.com"] }),
      armedrule("cronrule", { cron: "* * * * *" }),
      updaterule(armedrule("eventrule", { events: ["mutate"] }), { state: { enabled: false } }),
    ];
    const paused = pauseall(rules, now);
    expect(paused.filter((rule) => rule.state.pausedat !== undefined)).toHaveLength(2);
    const resumed = resumeall(paused);
    expect(resumed.every((rule) => rule.state.pausedat === undefined)).toBe(true);
    expect(resumed[2]?.state.enabled).toBe(false);
  });

  it("plans one run per url of a url list rule", () => {
    const rule = armedrule("urllistrule", {
      urls: ["https://example.com/a", "https://example.com/b", "https://example.com/c"],
    });
    const fires = runurllist(rule, now);
    expect(fires).toHaveLength(3);
    expect(fires.every((fire) => fire.ruleid === rule.id && fire.cause === "urllist")).toBe(true);
    expect(fires.map((fire) => fire.url)).toEqual([
      "https://example.com/a",
      "https://example.com/b",
      "https://example.com/c",
    ]);
  });
});

describe("webhook verification and page event subscription", () => {
  it("verifies the shared secret and the payload schema before anything persists", () => {
    const rule = armedrule("webhookrule", {
      secret: "devthink-secret-2026-abc123",
      schema: [
        { name: "task", kind: "string", required: true },
        { name: "count", kind: "number" },
        { name: "urgent", kind: "boolean" },
      ],
    });
    expect(
      verifywebhook({ rule, secret: "devthink-secret-2026-abc123", payload: { task: "read", count: 3 } }).verified,
    ).toBe(true);
    expect(verifywebhook({ rule, secret: "wrong-secret-2026-abc1234", payload: { task: "read" } }).reason).toContain(
      "secret",
    );
    expect(verifywebhook({ rule, secret: "devthink-secret-2026-abc123", payload: { count: 3 } }).reason).toContain(
      "task",
    );
    expect(verifywebhook({ rule, secret: "devthink-secret-2026-abc123", payload: { task: 7 } }).reason).toContain(
      "task",
    );
    expect(
      verifywebhook({ rule, secret: "devthink-secret-2026-abc123", payload: { task: "read", urgent: "yes" } }).reason,
    ).toContain("urgent");
    expect(verifywebhook({ rule, secret: "devthink-secret-2026-abc123", payload: "not an object" }).reason).toContain(
      "object",
    );
    expect(
      verifywebhook({ rule: { ...rule, secret: undefined } as unknown as triggerule, secret: "", payload: {} })
        .verified,
    ).toBe(false);
    expect(webhooksecretok("devthink-secret-2026-abc123")).toBe(true);
    expect(webhooksecretok("short")).toBe(false);
    expect(webhooksecretok("aaaaaaaaaaaaaaaaaaaaaaaa")).toBe(false);
    expect(webhooksecretok("123456789012345678901234")).toBe(false);
  });

  it("subscribes event rules to the observed event catalog only", () => {
    expect(triggereventcatalog).toEqual(["mutate", "focus", "banner", "console", "error", "navigate"]);
    const rule = armedrule("eventrule", { events: ["mutate", "navigate"] });
    expect(eventrulematches(rule, "mutate")).toBe(true);
    expect(eventrulematches(rule, "focus")).toBe(false);
    const decision = evaluatetrigger({
      rule,
      now,
      cause: "event",
      payload: { event: "mutate" },
      runactive: false,
      workflowreviewed: true,
    });
    expect(decision.fire?.payload).toEqual({ event: "mutate" });
    expect(observeevents([rule], "mutate")).toEqual([rule]);
    expect(observeevents([rule], "focus")).toEqual([]);
    expect(observeevents([rule], "unknown")).toEqual([]);
    const disabled = updaterule(rule, { state: { enabled: false } });
    expect(observeevents([disabled], "mutate")).toEqual([]);
    const paused = updaterule(rule, { state: { pausedat: now } });
    expect(observeevents([paused], "mutate")).toEqual([]);
    const visitrule = armedrule("visitrule", { origins: ["https://example.com"] });
    expect(observeevents([visitrule], "navigate")).toEqual([]);
  });
});

describe("manual runs with the step preview", () => {
  it("renders the expanded step preview with control summaries before anything runs", () => {
    const record: workflowrecord = composeworkflow({
      id: "wf1",
      name: "reader",
      version: 1,
      origins: ["https://example.com"],
      steps: [
        workflowstepof({ id: "s1", kind: "readtext", label: "Read the heading", target: "h1" }) as never,
        {
          id: "s2",
          kind: "branch",
          label: "Branch by title",
          options: JSON.stringify({
            branch: {
              paths: [
                {
                  name: "short",
                  when: {
                    left: { ref: "title" },
                    right: { literal: "x" },
                    operator: "contains",
                    result: "match",
                    resultkind: "boolean",
                  },
                  steps: [{ id: "s3", kind: "wait", label: "Wait a beat", value: "10" }],
                },
              ],
              else: { name: "else", steps: [{ id: "s4", kind: "wait", label: "Wait longer", value: "20" }] },
            },
          }),
        } as never,
      ],
      now,
      kindallowed,
      riskof,
    });
    const preview = manualpreview(record, now);
    expect(preview.workflowid).toBe("wf1");
    expect(preview.preview).toHaveLength(2);
    expect(preview.preview[1]?.control?.paths).toEqual(["short"]);
    expect(preview.preview[1]?.control?.elsepath).toBe("else");
    expect(preview.confirmed).toBeUndefined();
    const confirmed = confirmmanualrun(preview, true, now + 5);
    expect(confirmed.confirmed).toBe(true);
    expect(confirmed.decidedat).toBe(now + 5);
    expect(confirmmanualrun(preview, false, now + 6).confirmed).toBe(false);
    const envelope = manualrunpreview({ preview: confirmed, workflowname: record.name });
    expect(envelope.workflowname).toBe("reader");
    expect(envelope.manualrun.preview).toHaveLength(2);
  });
});

describe("trigger policy validation and sensitivity grading", () => {
  it("validates the grammar of every trigger kind", () => {
    expect(
      validatestep(triggerstep("visitrule", { origins: ["https://example.com"] }), "https://example.com").allowed,
    ).toBe(true);
    expect(
      validatestep(triggerstep("urlrule", { pattern: "https://example.com/*" }), "https://example.com").allowed,
    ).toBe(true);
    expect(validatestep(triggerstep("menurule", { title: "Run the reader" }), "https://example.com").allowed).toBe(
      true,
    );
    expect(validatestep(triggerstep("keyrule", { command: "run-reader" }), "https://example.com").allowed).toBe(true);
    expect(validatestep(triggerstep("buttonrule", {}), "https://example.com").allowed).toBe(true);
    expect(validatestep(triggerstep("cronrule", { cron: "*/15 * * * *" }), "https://example.com").allowed).toBe(true);
    expect(
      validatestep(triggerstep("intervalrule", { period: 60_000, jitter: 5_000 }), "https://example.com").allowed,
    ).toBe(true);
    expect(
      validatestep(triggerstep("urllistrule", { urls: ["https://example.com/a"] }), "https://example.com").allowed,
    ).toBe(true);
    expect(
      validatestep(
        triggerstep("webhookrule", {
          secret: "devthink-secret-2026-abc123",
          schema: [{ name: "task", kind: "string", required: true }],
        }),
        "https://example.com",
      ).allowed,
    ).toBe(true);
    expect(validatestep(triggerstep("eventrule", { events: ["mutate"] }), "https://example.com").allowed).toBe(true);
    expect(
      validatestep(triggerstep("eventrule", { events: ["mutate"] }, { label: "Panel rule" }), "https://example.com")
        .allowed,
    ).toBe(true);
  });

  it("refuses rules without the arm review, weak secrets, unparseable crons and unknown events", () => {
    expect(
      validatestep(
        triggerstep("visitrule", { origins: ["https://example.com"] }, { reviewed: false }),
        "https://example.com",
      ).reason,
    ).toContain("arm review");
    expect(
      validatestep(
        triggerstep("visitrule", { origins: ["https://example.com"] }, { workflowid: "" }),
        "https://example.com",
      ).reason,
    ).toContain("workflow");
    expect(validatestep(triggerstep("cronrule", { cron: "99 * * * *" }), "https://example.com").reason).toContain(
      "cron",
    );
    expect(
      validatestep(
        triggerstep("webhookrule", { secret: "short", schema: [{ name: "task", kind: "string" }] }),
        "https://example.com",
      ).reason,
    ).toContain("secret");
    expect(validatestep(triggerstep("eventrule", { events: ["nope"] }), "https://example.com").reason).toContain(
      "event",
    );
    expect(validatestep(triggerstep("intervalrule", { period: -1 }), "https://example.com").reason).toContain("period");
    expect(validatestep(triggerstep("urllistrule", { urls: [] }), "https://example.com").reason).toContain("url list");
    expect(validatestep(triggerstep("menurule", { title: "" }), "https://example.com").reason).toContain("menu");
    expect(validatestep(triggerstep("keyrule", { command: "Bad Command" }), "https://example.com").reason).toContain(
      "keyboard",
    );
    expect(
      validatestep(triggerstep("visitrule", { origins: ["http://insecure.example"] }), "https://example.com").reason,
    ).toContain("visit");
    expect(validatestep(triggerstep("urlrule", { pattern: "no-scheme/*" }), "https://example.com").reason).toContain(
      "url rule",
    );
    expect(
      validatestep(triggerstep("eventrule", { events: ["mutate"] }, { cooldown: 0 }), "https://example.com").reason,
    ).toContain("cooldown");
    expect(
      validatestep(triggerstep("eventrule", { events: ["mutate"] }, { label: "" }), "https://example.com").reason,
    ).toContain("label");
    expect(
      validatestep({ ...triggerstep("buttonrule", {}), kind: "nope" as toolstep["kind"] }, "https://example.com")
        .reason,
    ).toContain("Unsupported");
  });

  it("gates every trigger kind behind the live session, the approved plan and the arm review", () => {
    const step = triggerstep("visitrule", { origins: ["https://example.com"] });
    expect(triggergate({ session, plan, step, tabid: 4, origin: "https://example.com", now }).allowed).toBe(true);
    expect(triggergate({ session: undefined, plan, step, tabid: 4, origin: "https://example.com", now }).allowed).toBe(
      false,
    );
    expect(
      triggergate({ session: { ...session, stoppedat: now }, plan, step, tabid: 4, origin: "https://example.com", now })
        .allowed,
    ).toBe(false);
    expect(
      triggergate({ session, plan: { ...plan, state: "pending" }, step, tabid: 4, origin: "https://example.com", now })
        .reason,
    ).toContain("approved plan");
    expect(
      triggergate({
        session,
        plan,
        step: triggerstep("visitrule", { origins: ["https://example.com"] }, { reviewed: false }),
        tabid: 4,
        origin: "https://example.com",
        now,
      }).reason,
    ).toContain("arm review");
    expect(canexecute({ session: undefined, plan, step, tabid: 4, origin: "https://example.com", now }).allowed).toBe(
      false,
    );
    expect(canexecute({ session, plan, step, tabid: 4, origin: "https://example.com", now }).allowed).toBe(true);
  });

  it("extracts the match origins of a rule so proposals stay inside the grants", () => {
    expect(
      triggerorigins(triggerstep("visitrule", { origins: ["https://example.com", "https://example.com"] })),
    ).toEqual(["https://example.com"]);
    expect(triggerorigins(triggerstep("urlrule", { pattern: "https://example.com/*" }))).toEqual([
      "https://example.com",
    ]);
    expect(
      triggerorigins(triggerstep("urllistrule", { urls: ["https://example.com/a", "https://other.example/b"] })),
    ).toEqual(["https://example.com", "https://other.example"]);
    expect(triggerorigins(triggerstep("buttonrule", {}))).toEqual([]);
    expect(triggerorigins(triggerstep("visitrule", { origins: ["https://example.com"] }, { reviewed: false }))).toEqual(
      ["https://example.com"],
    );
  });
});

describe("trigger protocol envelopes", () => {
  it("builds the trigger list with workflow names, counters and the queue depth", () => {
    const cronrule = {
      ...armedrule("cronrule", { cron: "0 9 * * *" }),
      state: { ...armedrule("cronrule", { cron: "0 9 * * *" }).state, nextfireat: now + 3600_000 },
    };
    const unbound = armrule({ family: "button", workflowid: "wfmissing", payload: {}, now });
    if (!unbound) throw new Error("The button rule did not arm.");
    const list = triggerlist({
      rules: [cronrule, unbound],
      workflows: [
        {
          id: "wf1",
          name: "reader",
          version: 1,
          origins: ["https://example.com"],
          steps: [],
          blocks: [],
          risk: "read",
          createdat: now,
        },
      ],
      queue: [{ id: "f1", ruleid: "r1", at: now, cause: "visit" }],
    });
    expect(list.version).toBe(protocolversion);
    expect(list.queued).toBe(1);
    expect(list.rules[0]?.workflowname).toBe("reader");
    expect(list.rules[0]?.nextfireat).toBe(now + 3600_000);
    expect(list.rules[0]?.summary.cron).toBe("0 9 * * *");
    expect(list.rules[1]?.workflowname).toBeUndefined();
  });

  it("builds the trigger fired notification with the run binding and returns the next fire time per rule", () => {
    const fired = triggerfired({
      fire: {
        id: "f1",
        ruleid: "r1",
        at: now,
        cause: "webhook",
        url: "https://example.com",
        payload: { task: "read" },
      },
      workflowid: "wf1",
      runid: "run1",
    });
    expect(fired.triggerfired).toEqual({
      fireid: "f1",
      ruleid: "r1",
      workflowid: "wf1",
      at: now,
      cause: "webhook",
      url: "https://example.com",
      runid: "run1",
    });
    const body = JSON.parse(
      outcomeresponse({
        outcome: { stepid: "t1", ok: true, summary: "Armed.", at: now },
        plan,
        trigger: { ruleid: "r1", kind: "cron", enabled: true, nextfireat: now + 60_000 },
      }),
    );
    expect(body.trigger).toEqual({ ruleid: "r1", kind: "cron", enabled: true, nextfireat: now + 60_000 });
    const without = JSON.parse(
      outcomeresponse({ outcome: { stepid: "t1", ok: true, summary: "Armed.", at: now }, plan }),
    );
    expect(without.trigger).toBeUndefined();
  });

  it("refuses trigger proposals without the arm review or with origins outside the grants", () => {
    const proposal = parseproposal(
      {
        version: protocolversion,
        plan: {
          objective: "Arm triggers",
          steps: [
            {
              kind: "visitrule",
              options: JSON.stringify({
                workflowid: "wf1",
                reviewed: true,
                rule: { origins: ["https://example.com"] },
              }),
              summary: "Arm the visit rule.",
            },
          ],
        },
      },
      "https://example.com",
    );
    expect(proposal.plan.steps[0]?.kind).toBe("visitrule");
    expect(() =>
      parseproposal(
        {
          version: protocolversion,
          plan: {
            objective: "Unreviewed arm",
            steps: [
              {
                kind: "visitrule",
                options: JSON.stringify({ workflowid: "wf1", rule: { origins: ["https://example.com"] } }),
                summary: "Arm without review.",
              },
            ],
          },
        },
        "https://example.com",
      ),
    ).toThrow("arm review");
    expect(() =>
      parseproposal(
        {
          version: protocolversion,
          plan: {
            objective: "Outside grants",
            steps: [
              {
                kind: "visitrule",
                options: JSON.stringify({
                  workflowid: "wf1",
                  reviewed: true,
                  rule: { origins: ["https://other.example"] },
                }),
                summary: "Arm outside the grants.",
              },
            ],
          },
        },
        "https://example.com",
      ),
    ).toThrow("outside the grants");
    expect(() =>
      parseproposal(
        {
          version: protocolversion,
          plan: {
            objective: "Url list outside grants",
            steps: [
              {
                kind: "urllistrule",
                options: JSON.stringify({
                  workflowid: "wf1",
                  reviewed: true,
                  rule: { urls: ["https://elsewhere.example/a"] },
                }),
                summary: "Arm the url list.",
              },
            ],
          },
        },
        "https://example.com",
      ),
    ).toThrow("outside the grants");
  });
});

describe("trigger memory persistence", () => {
  it("stores rules with their workflow names, replaces state and removes disarmed rules", async () => {
    const store = new sessionmemory(new fakeadapter());
    const rule = armedrule("visitrule", { origins: ["https://example.com"] });
    await store.addtriggerule(rule);
    await store.addworkflowrecord({
      id: "wf1",
      name: "reader",
      version: 1,
      origins: ["https://example.com"],
      steps: [],
      blocks: [],
      risk: "read",
      createdat: now,
    });
    const listed = await store.listtriggers();
    expect(listed[0]?.workflowname).toBe("reader");
    expect((await store.gettriggerule(rule.id))?.id).toBe(rule.id);
    await store.settriggerule(updaterule(rule, { state: { enabled: false } }));
    expect((await store.gettriggerule(rule.id))?.state.enabled).toBe(false);
    await store.removetriggerule(rule.id);
    expect(await store.gettriggerules()).toHaveLength(0);
    expect(await store.listtriggers()).toHaveLength(0);
  });

  it("stores fire records under the reviewed retention and keeps the queue", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setsettings({ triggerretention: 2 });
    await store.addtriggerfire({ id: "f1", ruleid: "r1", at: now, cause: "visit" });
    await store.addtriggerfire({ id: "f2", ruleid: "r1", at: now + 1, cause: "url" });
    await store.addtriggerfire({ id: "f3", ruleid: "r2", at: now + 2, cause: "schedule" });
    expect((await store.listtriggerfires()).map((fire) => fire.id)).toEqual(["f3", "f2"]);
    expect((await store.listtriggerfires("r1")).map((fire) => fire.id)).toEqual(["f2"]);
    await store.settriggerqueue([{ id: "f4", ruleid: "r1", at: now + 3, cause: "menu" }]);
    expect((await store.gettriggerqueue()).map((fire) => fire.cause)).toEqual(["menu"]);
  });

  it("stores webhook payloads and manual run previews with their confirmation outcomes", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addwebhookpayload("r1", { task: "read" }, now);
    await store.addwebhookpayload("r1", { task: "extract" }, now + 1);
    expect((await store.listwebhookpayloads("r1")).map((entry) => entry.payload.task)).toEqual(["extract", "read"]);
    expect(await store.listwebhookpayloads("r2")).toHaveLength(0);
    const preview: manualrun = {
      id: "m1",
      workflowid: "wf1",
      preview: [{ stepid: "s1", kind: "readtext", label: "Read the heading" }],
      at: now,
    };
    await store.addmanualrun(preview);
    await store.addmanualrun({ ...preview, confirmed: true, decidedat: now + 1 });
    const stored = await store.listmanualruns();
    expect(stored[0]?.confirmed).toBe(true);
    expect(stored[0]?.preview[0]?.stepid).toBe("s1");
    await store.settriggerules([armedrule("buttonrule", {}), armedrule("keyrule", { command: "run" })]);
    expect(await store.gettriggerules()).toHaveLength(2);
  });

  it("records trigger evidence with the fire, launch and suppression counts", () => {
    let progress = recordtrigger(
      undefined,
      plan.id,
      "t1",
      { family: "arm", detail: "Armed the visit rule", ruleid: "r1", nextfireat: now + 60_000 },
      now,
    );
    progress = recordtrigger(
      progress,
      plan.id,
      "t1",
      { family: "fire", detail: "The visit rule fired", ruleid: "r1", fires: 1, launches: 1 },
      now + 1,
    );
    progress = recordtrigger(
      progress,
      plan.id,
      "t1",
      { family: "suppress", detail: "The visit rule suppressed a fire", ruleid: "r1", suppressions: 1, queued: 0 },
      now + 2,
    );
    const evidence = triggerevidences(progress, plan.id, "t1");
    expect(evidence.map((entry) => entry.family)).toEqual(["arm", "fire", "suppress"]);
    expect(evidence[1]?.fires).toBe(1);
    expect(triggerevidences(progress, "other", "t1")).toHaveLength(0);
  });
});
