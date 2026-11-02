// # intelligence.test — the AI intelligence battery the saddle
// ownership law moved to devthink (wave a, actions 108-112: the master
// virtualization engine keeps only the sandbox/vm/runner/vgpu/vcpu/
// ports/hardware-virtual modalities, and the AI planning, retrieval,
// provenance and metrics domain rides its new owner — the battery
// answers the same contracts the engine suite once pinned: the rag
// chunking, the retrieval provenance and the token budget trio).
// runnable with vitest: pnpm vitest run tests/intelligence.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  chunkmarkdown,
  estimatetokens,
  fitscontext,
  llmsfull,
  llmstxt,
  mergeprovenance,
  metricstore,
  provenance,
  ragmanifest,
  tokenbudget,
  vectorrecord,
} from "../intelligence.js";

describe("the intelligence contract (the saddle ownership transfer, wave a)", () => {
  it("chunks markdown and builds a deduplicated rag manifest", async () => {
    const markdown = "# Intro\n\nSaddle engine content.\n\n## Detail\n\nMore content.";
    const chunks = chunkmarkdown(markdown, { maxtokens: 20 });
    assert.equal(chunks[0]?.headingpath[0], "Intro");
    const manifest = await ragmanifest({
      source: "https://example.com/doc",
      chunks: [...chunks, ...chunks],
      embeddingmodel: "test",
    });
    assert.equal(manifest.chunks.length, chunks.length);
    assert.equal(vectorrecord(manifest.chunks[0], [0.1, 0.2]).vector.length, 2);
  });

  it("keeps retrieval provenance and low-cardinality metrics", () => {
    const first = provenance({ sourceurl: "https://example.com/a", documentid: "a", chunks: [{ id: "1", score: 0.9 }] });
    const second = provenance({ sourceurl: "https://example.com/b", documentid: "b", chunks: [{ id: "1", score: 0.8 }] });
    const merged = mergeprovenance([first, second, first]);
    assert.equal(merged.sources.length, 2);
    assert.equal(merged.chunks.length, 2);
    const metrics = metricstore();
    metrics.count("engine.completed", 1, { source: "test" });
    metrics.observe("engine.latency", 4, { source: "test" });
    assert.equal(metrics.snapshot().counters['engine.completed|[["source","test"]]'], 1);
  });

  it("estimates token budgets and generates llms text", () => {
    assert.equal(estimatetokens("1234"), 1);
    assert.equal(fitscontext("1234", 1), true);
    assert.equal(tokenbudget("12345678", { context: 1 }).fits, false);
    const pages = [{ title: "Docs", url: "https://example.com/docs", description: "API docs", content: "Saddle API" }];
    assert.match(
      llmstxt({ title: "Saddle", pages }),
      /^# Saddle\n> [^\n]*\n\n## pages\n\n- \[Docs\]\(https:\/\/example\.com\/docs\): API docs\n$/,
    );
    assert.match(llmsfull({ pages }), /^# Docs\n\nsource: https:\/\/example\.com\/docs\n\nSaddle API$/);
  });
});
