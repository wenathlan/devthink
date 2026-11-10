import { describe, expect, it } from "vitest";
import {
  type BrowserAgentConfig,
  BrowserAgentConfigSchema,
  buildSerializeOptions,
  chunkMarkdown,
  chunkText,
  detectContentType,
  estimateTokens,
  extensionForFormat,
  fitsInContext,
  formatChunksForRAG,
  formatForAgent,
  formatFromExtension,
  generateLlmsFullTxt,
  generateLlmsTxt,
  type ScrapeFormat,
  ScrapeFormatSchema,
  type ScrapeOptions,
  ScrapeOptionsSchema,
  type ScrapeResult,
  SerializeTargetSchema,
  serializeHtml,
  serializeResult,
  resolveFormat,
  slugify,
  tokenCost,
  truncate,
  truncateToTokens,
  isRetryableError,
  isValidUrl,
  isInternalUrl,
  normalizeUrl,
  legacychunktext,
  legacyestimatetokens,
} from "../webscrape.js";

/* the webscrape battery of the scrape-domain restore (wave-restore-8): the
 * verbatim legacy toolkit now rides the devthink root, and these legs walk
 * the pure seats only — the zod schema family, the format and token
 * helpers, the chunking family and the serializer/agent/llms-txt surface.
 * the runtime-bound seats stay out of the battery on purpose: fetchHtml,
 * scrapeUrl, batchScrape and the sitemap walkers speak the network,
 * scrapeWithBrowser/AgentBrowser/BrowserPool launch playwright, the
 * pygame renderer spawns a subprocess, and createServer/startdevserver/
 * runscrapecli bind ports and read argv — none of them belongs in a unit
 * walk. */

function fixtureresult(overrides: Partial<ScrapeResult> = {}): ScrapeResult {
  return {
    url: "https://example.com/page",
    title: "Example",
    content: "the body text",
    format: "markdown",
    text: "the body text",
    links: [
      { href: "https://ext.example/a", text: "a", isInternal: false, isExternal: true },
      { href: "https://example.com/b", text: "b", isInternal: true, isExternal: false },
    ],
    images: [],
    tables: [{ headers: ["a", "b"], rows: [["1", "2"]] }],
    metadata: { title: "Example", description: "d" },
    extractedAt: "2024-01-01T00:00:00.000Z",
    duration: 5,
    size: 13,
    ...overrides,
  };
}

describe("webscrape schema seats", () => {
  it("ScrapeFormatSchema accepts the six formats and rejects anything else", () => {
    for (const format of ["markdown", "html", "text", "json", "xml", "redis"] as const) {
      expect(ScrapeFormatSchema.parse(format)).toBe(format);
    }
    expect(ScrapeFormatSchema.safeParse("bogus").success).toBe(false);
    expect(ScrapeFormatSchema.safeParse(42).success).toBe(false);
  });

  it("SerializeTargetSchema accepts the five serialization targets and rejects anything else", () => {
    for (const target of ["markdown", "xml", "json", "redis", "text"] as const) {
      expect(SerializeTargetSchema.parse(target)).toBe(target);
    }
    expect(SerializeTargetSchema.safeParse("html").success).toBe(false);
  });

  it("ScrapeOptionsSchema answers the full prefault table and stays strict", () => {
    const parsed: ScrapeOptions = ScrapeOptionsSchema.parse({});
    expect(parsed).toMatchObject({
      mode: "auto",
      waitUntil: "networkidle",
      timeout: 30000,
      scroll: false,
      scrollDelay: 300,
      maxScrolls: 50,
      removeSelectors: [],
      extractImages: true,
      extractLinks: true,
      extractTables: true,
      format: "markdown",
      retries: 3,
      retryDelay: 1000,
      headers: {},
      cache: false,
      cacheTtlMs: 300000,
    });
    expect(parsed.url).toBeUndefined();
    /* the strictObject wall: an unknown key fails the parse */
    expect(() => ScrapeOptionsSchema.parse({ bogus: 1 })).toThrowError();
    /* caller values override every prefault */
    expect(ScrapeOptionsSchema.parse({ timeout: 5000, format: "json" })).toMatchObject({ timeout: 5000, format: "json" });
  });

  it("BrowserAgentConfigSchema answers the browser defaults", () => {
    const config: BrowserAgentConfig = BrowserAgentConfigSchema.parse({});
    expect(config).toMatchObject({
      headless: true,
      viewport: { width: 1280, height: 720 },
      locale: "en-US",
      timeout: 30000,
      recordVideo: false,
      blockAds: true,
      stealth: true,
    });
    expect(BrowserAgentConfigSchema.safeParse({ viewport: { width: -1, height: 10 } }).success).toBe(false);
  });
});

describe("webscrape format and token seats", () => {
  it("resolveFormat, formatFromExtension and extensionForFormat walk the alias maps", () => {
    expect(resolveFormat("md")).toBe<ScrapeFormat>("markdown");
    expect(resolveFormat(" MD ")).toBe<ScrapeFormat>("markdown");
    expect(resolveFormat("json")).toBe<ScrapeFormat>("json");
    expect(formatFromExtension(".md")).toBe<ScrapeFormat>("markdown");
    expect(formatFromExtension(".zz")).toBeNull();
    expect(extensionForFormat("markdown")).toBe(".md");
    expect(extensionForFormat("redis")).toBe(".redis");
  });

  it("detectContentType classifies article and page shapes", () => {
    expect(detectContentType("<article>body</article>")).toBe("article");
    expect(detectContentType('<main role="main">x</main>')).toBe("article");
    expect(detectContentType("<div>plain</div>")).toBe("page");
  });

  it("buildSerializeOptions maps every format onto its serialization target", () => {
    expect(buildSerializeOptions("html")).toEqual({ format: "markdown", pretty: true, includeMetadata: true });
    expect(buildSerializeOptions("json", false)).toEqual({ format: "json", pretty: false, includeMetadata: true });
    expect(buildSerializeOptions("redis")).toEqual({ format: "redis", pretty: true, includeMetadata: true });
  });

  it("the token family estimates, fits, truncates and prices", () => {
    expect(estimateTokens("12345678")).toBe(2);
    expect(estimateTokens("12345678", "gpt-4o")).toBe(3);
    expect(fitsInContext("1234", 1)).toBe(true);
    expect(fitsInContext("12345", 1)).toBe(false);
    expect(truncateToTokens("x".repeat(100), 5)).toHaveLength(23);
    expect(tokenCost("x".repeat(4000), "default", 0.001)).toBe(0.001);
    expect(legacyestimatetokens("12345678")).toBe(2);
  });

  it("slugify and truncate shape text for output lanes", () => {
    expect(slugify("Hello, World! 2024")).toBe("hello-world-2024");
    expect(truncate("abcdefghij", 8)).toBe("abcde...");
    expect(truncate("short", 10)).toBe("short");
  });

  it("the url helpers validate, normalize and classify origins", () => {
    expect(isValidUrl("https://example.com/")).toBe(true);
    expect(isValidUrl("not a url")).toBe(false);
    expect(normalizeUrl("/x", "https://example.com/")).toBe("https://example.com/x");
    expect(normalizeUrl("not a url")).toBe("not a url");
    expect(isInternalUrl("/x", "https://example.com/")).toBe(true);
    expect(isInternalUrl("https://other.example/x", "https://example.com/")).toBe(false);
  });

  it("isRetryableError answers the network-code and retryable-status tables only", () => {
    const refused = Object.assign(new Error("refused"), { code: "ECONNREFUSED" });
    const throttled = Object.assign(new Error("throttled"), { statusCode: 429 });
    expect(isRetryableError(refused)).toBe(true);
    expect(isRetryableError(throttled)).toBe(true);
    expect(isRetryableError(new Error("plain"))).toBe(false);
    expect(isRetryableError(Object.assign(new Error("abort"), { name: "AbortError" }))).toBe(false);
  });
});

describe("webscrape chunking seats", () => {
  it("chunkMarkdown splits sections under the token budget with heading paths", () => {
    const chunks = chunkMarkdown("# H\n\npara one here\n\npara two here", { maxTokens: 5, includeHeadingPath: true });
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks[0]).toMatchObject({ content: "# H\n\npara one here", tokenCount: 5 });
    expect(chunks.every((chunk) => chunk.tokenCount <= 5)).toBe(true);
    expect(chunks.map((chunk) => chunk.index)).toEqual(chunks.map((_, index) => index));
  });

  it("chunkText and legacychunktext split plain text", () => {
    expect(chunkText("a\n\nb", { maxTokens: 1 })).toHaveLength(1);
    expect(legacychunktext("abcdef", 3)).toEqual(["abc", "def"]);
  });

  it("formatChunksForRAG renders a chunk list into a context string", () => {
    const rendered = formatChunksForRAG([{ content: "x", headingPath: [], tokenCount: 1, index: 0 }]);
    expect(rendered).toContain("x");
  });
});

describe("webscrape serializer seats", () => {
  it("serializeResult renders markdown with the metadata header and the table appendix", () => {
    const output = serializeResult(fixtureresult(), { format: "markdown" });
    expect(output.format).toBe("markdown");
    expect(output.content.startsWith("# Example")).toBe(true);
    expect(output.content).toContain("- **URL:** https://example.com/page");
    expect(output.content).toContain("## Tables");
    expect(output.content).toContain("the body text");
    expect(output.size).toBe(output.content.length);
  });

  it("serializeResult renders json the caller can parse back", () => {
    const output = serializeResult(fixtureresult(), { format: "json", pretty: false });
    const parsed = JSON.parse(output.content) as { title: string; url: string; tables: unknown[] };
    expect(parsed.title).toBe("Example");
    expect(parsed.url).toBe("https://example.com/page");
    expect(parsed.tables).toHaveLength(1);
  });

  it("serializeResult renders text and xml targets", () => {
    const text = serializeResult(fixtureresult(), { format: "text" });
    expect(text.content).toContain("the body text");
    /* the xml target walks htmlToXml over the body children: element
     * content serializes under the configured root, the declaration rides
     * ahead — the verbatim serializer drops non-element body children */
    const xml = serializeResult(fixtureresult({ content: "<p>the body text</p>" }), { format: "xml" });
    expect(xml.content.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml.content).toContain("<document>");
    expect(xml.content).toContain("<p>the body text</p>");
  });

  it("serializeResult chunks the content when maxChunkSize is set", () => {
    const output = serializeResult(fixtureresult(), { format: "text", maxChunkSize: 20 });
    expect(output.chunks?.length).toBeGreaterThan(1);
    expect(output.chunks?.every((chunk) => chunk.length <= 20)).toBe(true);
  });

  it("serializeHtml renders text and json targets from a raw html string", () => {
    const text = serializeHtml("<h1>Hi</h1><p>World</p>", { format: "text" });
    expect(text.content).toBe("Hi\nWorld");
    expect(text.size).toBe(8);
    const json = serializeHtml("<p>x</p>", { format: "json" });
    expect(JSON.parse(json.content)).toEqual({ html: "<p>x</p>" });
  });
});

describe("webscrape agent and llms-txt seats", () => {
  it("formatForAgent answers the summary, key points, external urls and the token count", () => {
    const output = formatForAgent(fixtureresult());
    expect(output.summary).toContain("Example");
    expect(Array.isArray(output.keyPoints)).toBe(true);
    expect(output.relevantUrls).toEqual(["https://ext.example/a"]);
    expect(output.content).toContain("## Summary");
    expect(output.tokens).toBeGreaterThan(0);
  });

  it("generateLlmsTxt groups pages and documentation with the site header", () => {
    const generated = generateLlmsTxt(
      [fixtureresult(), fixtureresult({ url: "https://example.com/docs/api", metadata: { title: "API", description: "d" } })],
      { siteName: "S", description: "D" },
    );
    expect(generated.startsWith("# S\n\n> D")).toBe(true);
    expect(generated).toContain("## Pages");
    expect(generated).toContain("## Documentation");
    expect(generated).toContain("- Example: d");
    expect(generated).toContain("- API: d");
  });

  it("generateLlmsFullTxt renders every page with its source url", () => {
    const full = generateLlmsFullTxt([fixtureresult()]);
    expect(full.startsWith("# Example\n\nSource: https://example.com/page")).toBe(true);
    expect(full).toContain("the body text");
  });
});
