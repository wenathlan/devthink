import { describe, expect, it } from "vitest";
import { attentioncountof, attentiondeeplinkof, attentionentryof, attentionnotifications, collectattention, dedupeattention, dismissattention, pruneattention, rankattention, attentionseverityof } from "../views.js";

const now = 1_800_000_000_000;

describe("attentionfeed collection and ranking", () => {
  it("collects gate waits, phishguard blocks, deferrals and failures with their deep links", () => {
    const entries = collectattention({
      gatewaits: [{ runid: "run1", stepid: "step1", gateid: "gate1", kind: "confirmpay", origin: "https://example.com", waitedms: 5000 }],
      phishblocks: [{ runid: "run1", origin: "https://lookalike.test", matchedorigin: "https://example.com", reason: "distance 0.9 over the threshold" }],
      deferrals: [{ runid: "run2", origin: "https://example.com", reason: "the bucket reset waits" }],
      failures: [{ runid: "run3", stepid: "step9", origin: "https://example.com", message: "the selector matched nothing" }],
      now,
    });
    expect(entries.map(entry => entry.cause)).toEqual(["gatewait", "phishguard", "deferral", "failure"]);
    expect(entries[0]?.deeplink).toBe("devthink://gate/gate1?run=run1");
    expect(entries[1]?.deeplink).toBe("devthink://phishguard?run=run1");
    expect(entries[2]?.deeplink).toBe("devthink://deferred?run=run2");
    expect(entries[3]?.deeplink).toBe("devthink://error?run=run3");
    expect(() => attentionentryof({ cause: "gatewait", runid: " ", origin: "https://example.com", summary: "waits", at: now })).toThrow(/run ref/);
    expect(() => attentionentryof({ cause: "gatewait", runid: "run1", origin: "https://example.com", summary: " ", at: now })).toThrow(/summary/);
  });

  it("ranks the causes by severity first and time second", () => {
    const entries = [
      attentionentryof({ cause: "failure", runid: "r", origin: "https://example.com", summary: "failed late", at: now + 5000 }),
      attentionentryof({ cause: "deferral", runid: "r", origin: "https://example.com", summary: "deferred", at: now + 1000 }),
      attentionentryof({ cause: "gatewait", runid: "r", origin: "https://example.com", summary: "waits", gateref: "g1", at: now }),
      attentionentryof({ cause: "phishguard", runid: "r", origin: "https://example.com", summary: "blocked", at: now + 2000 }),
    ];
    const ranked = rankattention(entries);
    expect(ranked.map(entry => entry.cause)).toEqual(["phishguard", "gatewait", "deferral", "failure"]);
    expect(attentionseverityof("gatewait")).toBe("critical");
    expect(attentionseverityof("phishguard")).toBe("critical");
    expect(attentionseverityof("deferral")).toBe("warning");
    expect(attentionseverityof("failure")).toBe("info");
  });

  it("deduplicates repeated causes per run while the first occurrence keeps its time", () => {
    const first = attentionentryof({ cause: "gatewait", runid: "r", origin: "https://example.com", summary: "waits", gateref: "g1", at: now });
    const second = attentionentryof({ cause: "gatewait", runid: "r", origin: "https://example.com", summary: "still waits", gateref: "g1", at: now + 9000 });
    const othergate = attentionentryof({ cause: "gatewait", runid: "r", origin: "https://example.com", summary: "waits", gateref: "g2", at: now + 1000 });
    const deduped = dedupeattention([second, first, othergate]);
    expect(deduped).toHaveLength(2);
    expect(deduped[0]?.at).toBe(now);
    expect(attentioncountof([first, second])).toBe(1);
  });

  it("dismisses entries and prunes past the retention window", () => {
    const entry = attentionentryof({ cause: "failure", runid: "r", origin: "https://example.com", summary: "failed", at: now });
    expect(dismissattention([entry], entry.id)).toHaveLength(0);
    const pruned = pruneattention([entry], 1000, now + 2000);
    expect(pruned.kept).toHaveLength(0);
    expect(pruned.pruned).toEqual([entry.id]);
    expect(pruneattention([entry], undefined, now + 2000).kept).toHaveLength(1);
    expect(pruneattention([entry], 1000, now + 500).kept).toHaveLength(1);
  });

  it("renders the entries as content free system notifications with their deep links", () => {
    const entries = [attentionentryof({ cause: "gatewait", runid: "r", origin: "https://example.com", summary: "waits", gateref: "g1", at: now })];
    const notifications = attentionnotifications(entries, now);
    expect(notifications).toHaveLength(1);
    expect(notifications[0]?.kind).toBe("attention");
    expect(notifications[0]?.title).toBe("A gate waits for you");
    expect(notifications[0]?.content).toBe(false);
    expect(notifications[0]?.deeplink).toBe("devthink://gate/g1?run=r");
    expect(attentiondeeplinkof("deferral", "r")).toBe("devthink://deferred?run=r");
  });
});
