import { describe, expect, it } from "vitest";
import {
  contextWindowUsagePercent,
  DEFAULT_TOKEN_WEIGHTS,
  estimateHistoryTokens,
  estimateMessageTokens,
  estimateTokens,
  formatCompactTokenCount,
  TOKENS_PER_MESSAGE,
  truncateToTokenBudget,
} from "../token.estimate.js";

describe("token.estimate per-script estimation", () => {
  it("estimates latin text at ~4 chars per token", () => {
    expect(estimateTokens("")).toBe(0);
    expect(estimateTokens("hi")).toBe(1);
    expect(estimateTokens("hello world")).toBe(3); // 11 chars → ceil(11/4)
  });

  it("weights CJK text heavier than a flat chars/4 rule", () => {
    const text = "こんにちは"; // 5 glyphs
    expect(estimateTokens(text)).toBe(4); // ceil(5/1.5) — a flat /4 would answer 1
    expect(estimateTokens("你好世界测试")).toBe(4); // 6 glyphs → ceil(6/1.5)
  });

  it("estimates a mixed-script message between its script bounds", () => {
    const flat = estimateTokens("hello world", DEFAULT_TOKEN_WEIGHTS);
    const mixed = estimateTokens("hello こんにちは", DEFAULT_TOKEN_WEIGHTS);
    expect(mixed).toBeGreaterThan(flat);
  });

  it("accepts custom weights", () => {
    expect(estimateTokens("abcdefgh", { latin: 8, cjk: 1, cyrillic: 1, other: 1 })).toBe(1);
  });
});

describe("token.estimate history budget", () => {
  it("adds the per-message envelope to every message", () => {
    expect(TOKENS_PER_MESSAGE).toBe(4);
    expect(estimateMessageTokens({ role: "user", content: "hi" })).toBe(5);
  });

  it("sums a whole conversation", () => {
    const history = [
      { role: "system", content: "You are Sol." },
      { role: "user", content: "hello world, this is a longer turn" },
      { role: "assistant", content: "hi" },
    ];
    expect(estimateHistoryTokens(history)).toBe(
      estimateMessageTokens(history[0]) + estimateMessageTokens(history[1]) + estimateMessageTokens(history[2]),
    );
  });
});

describe("token.estimate truncation", () => {
  it("returns the text untouched when it fits the budget", () => {
    expect(truncateToTokenBudget("short", 100)).toBe("short");
    expect(truncateToTokenBudget("anything", 0)).toBe("");
  });

  it("cuts the longest prefix that fits and lands on a word boundary", () => {
    const text = "alpha beta gamma delta epsilon zeta eta theta";
    const cut = truncateToTokenBudget(text, 6);
    expect(cut.length).toBeLessThan(text.length);
    expect(estimateTokens(cut)).toBeLessThanOrEqual(6);
    expect(cut.startsWith("alpha beta")).toBe(true);
    expect(cut.endsWith(" ")).toBe(false);
  });
});

describe("token.estimate display helpers (openhands shape)", () => {
  it("formats compact token counts", () => {
    expect(formatCompactTokenCount(940)).toBe("940");
    expect(formatCompactTokenCount(1_000)).toBe("1k");
    expect(formatCompactTokenCount(198_500)).toBe("198.5k");
    expect(formatCompactTokenCount(1_000_000)).toBe("1.0M");
    expect(formatCompactTokenCount(12_000_000)).toBe("12M");
    expect(formatCompactTokenCount(999_999)).toBe("1.0M"); // never "1000.0k"
  });

  it("computes the context window share, clamped and window-safe", () => {
    expect(contextWindowUsagePercent(50, 200)).toBe(25);
    expect(contextWindowUsagePercent(500, 200)).toBe(100);
    expect(contextWindowUsagePercent(100, 0)).toBe(0);
    expect(contextWindowUsagePercent(100, -5)).toBe(0);
  });
});
