import { describe, expect, it } from "vitest";
import {
  type CompactMessage,
  compactConversation,
  FALLBACK_NOTE,
  isCompactionSummary,
  isCompactMessage,
  isCompactMessageList,
  planCompact,
  SUMMARY_MARKER,
  triggerTokens,
} from "../conversationcompact.js";

const system: CompactMessage = { role: "system", content: "You are Sol, the DevThink gateway assistant." };
const goal: CompactMessage = { role: "user", content: "FIRST GOAL: audit the auth flow end to end." };
const filler = (n: number, role: "user" | "assistant" = "user"): CompactMessage => ({
  role,
  content: `turn ${n}: filler conversation content`,
});

/** A conversation long enough that keepRecent leaves a droppable middle. */
function longHistory(turns: number): CompactMessage[] {
  return [system, goal, ...Array.from({ length: turns }, (_, i) => filler(i + 1, i % 2 === 0 ? "user" : "assistant"))];
}

describe("conversationcompact planning", () => {
  it("protects the system head, the first user message and the recent tail", () => {
    const plan = planCompact(longHistory(12), { keepRecent: 4 });
    expect(plan.head).toEqual([system, goal]);
    expect(plan.tail).toHaveLength(4);
    expect(plan.middle.length).toBeGreaterThan(0);
    // the goal and the tail never land in the dropped middle
    expect(plan.middle.some((m) => m.content === goal.content)).toBe(false);
    expect(plan.middle.some((m) => plan.tail.includes(m))).toBe(false);
  });

  it("keeps a previous compaction summary out of the droppable middle", () => {
    const history: CompactMessage[] = [
      system,
      goal,
      { role: "system", content: `${SUMMARY_MARKER} earlier brief` },
      ...Array.from({ length: 10 }, (_, i) => filler(i + 1)),
    ];
    const plan = planCompact(history, { keepRecent: 3 });
    expect(plan.middle.some(isCompactionSummary)).toBe(false);
    expect(plan.head.some(isCompactionSummary)).toBe(true);
  });

  it("answers a no-op plan for a short history", () => {
    const short: CompactMessage[] = [system, goal, filler(1, "assistant"), filler(2)];
    const plan = planCompact(short, { keepRecent: 8 });
    expect(plan.middle).toHaveLength(0); // nothing to drop: everything is protected or tail
    expect(plan.head).toEqual([system, goal]);
    expect(plan.tail).toHaveLength(2);
  });
});

describe("conversationcompact trigger (jan's preflight layer)", () => {
  it("computes the trigger from the window with a clamped ratio", () => {
    expect(triggerTokens(128_000)).toBe(102_400); // 0.8 of the window
    expect(triggerTokens(10_000, 0.05)).toBe(1_000); // ratio clamped up to 0.10
    expect(triggerTokens(10_000, 1.5)).toBe(9_900); // ratio clamped down to 0.99
    expect(triggerTokens(10_000, Number.NaN)).toBe(8_000); // non-finite → default
  });
});

describe("conversationcompact execution", () => {
  it("splices the summary in as a marked system message and reports the budget", async () => {
    const history = longHistory(12);
    const result = await compactConversation(history, {
      keepRecent: 4,
      summarize: async (middle) => `the user worked through ${middle.length} filler turns`,
    });
    expect(result.compacted).toBe(true);
    expect(result.tokensAfter).toBeLessThan(result.tokensBefore);
    expect(result.messages).toHaveLength(2 + 1 + 4); // head + summary + tail
    const summary = result.messages[2];
    expect(summary.role).toBe("system");
    expect(summary.content.startsWith(SUMMARY_MARKER)).toBe(true);
    expect(summary.content).toContain("8 filler turns");
    // the first message of the conversation survives verbatim
    expect(result.messages[0]).toEqual(system);
    expect(result.messages[1]).toEqual(goal);
    // the input is never mutated
    expect(history).toHaveLength(14);
  });

  it("falls back to the omission note when the summarizer fails", async () => {
    const result = await compactConversation(longHistory(12), {
      keepRecent: 4,
      summarize: async () => {
        throw new Error("summarizer down");
      },
    });
    expect(result.compacted).toBe(true);
    expect(result.messages.some((m) => m.content === `${SUMMARY_MARKER} ${FALLBACK_NOTE}`)).toBe(true);
  });

  it("uses the fallback note when no summarizer is wired", async () => {
    const result = await compactConversation(longHistory(12), { keepRecent: 4 });
    expect(result.compacted).toBe(true);
    expect(result.messages[2].content).toBe(`${SUMMARY_MARKER} ${FALLBACK_NOTE}`);
  });

  it("skips compaction while the history fits the context window", async () => {
    const history = longHistory(4);
    const result = await compactConversation(history, {
      keepRecent: 2,
      contextWindow: 128_000,
      summarize: async () => "never",
    });
    expect(result.compacted).toBe(false);
    expect(result.messages).toEqual(history);
    expect(result.tokensAfter).toBe(result.tokensBefore);
  });

  it("stays a no-op when every body message is protected", async () => {
    const result = await compactConversation([system, goal, filler(1), filler(2)], { keepRecent: 8 });
    expect(result.compacted).toBe(false);
    expect(result.messages).toHaveLength(4);
  });

  it("never re-summarizes an existing summary when compacting again", async () => {
    const first = await compactConversation(longHistory(12), { keepRecent: 4, summarize: async () => "brief one" });
    const grown = [...first.messages, ...Array.from({ length: 10 }, (_, i) => filler(100 + i))];
    const second = await compactConversation(grown, { keepRecent: 3, summarize: async () => "brief two" });
    const summaries = second.messages.filter(isCompactionSummary);
    expect(summaries.map((m) => m.content)).toContain(`${SUMMARY_MARKER} brief one`);
    expect(second.messages[0]).toEqual(system);
  });
});

describe("conversationcompact validators (usestoredstate grammar)", () => {
  it("guards single messages and message lists", () => {
    expect(isCompactMessage({ role: "user", content: "hi" })).toBe(true);
    expect(isCompactMessage({ role: "tool", content: "hi" })).toBe(false);
    expect(isCompactMessage({ role: "user" })).toBe(false);
    expect(isCompactMessage("user")).toBe(false);
    expect(isCompactMessageList([{ role: "assistant", content: "ok" }])).toBe(true);
    expect(isCompactMessageList([{ role: "assistant" }])).toBe(false);
    expect(isCompactMessageList("nope")).toBe(false);
  });
});
