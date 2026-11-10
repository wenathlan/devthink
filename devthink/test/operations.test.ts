import { describe, expect, it } from "vitest";
import { extractcontent, formatforagent, scrapehtml, serializehtml, serializeresult } from "../operations.js";

/* the operations battery of the scrape-domain restore (wave-restore-8): the
 * verbatim public library surface now rides the devthink root, and these
 * legs walk the pure seats only — scrapehtml and extractcontent over inline
 * html, serializeresult across every supported output format, formatforagent
 * (which walks the getry intelligence bridge for chunkmarkdown and
 * estimatetokens) and serializehtml. the network and browser seats stay out
 * of the battery on purpose: scrapeurl, batchscrape and crawlurl speak the
 * network through the caller's fetcher, scrapewithbrowser and saddleurl's
 * browser lane launch the saddle browser agent — none of them belongs in a
 * unit walk. */

const page = [
  "<html><head><title>Test Page</title>",
  '<meta name="description" content="A test page">',
  "</head><body>",
  '<a href="/about">About</a>',
  '<a href="https://ext.example/x">Ext</a>',
  "words",
  "</body></html>",
].join("");

describe("operations pure scrape seats", () => {
  it("scrapehtml extracts the serializable result from inline html without network access", () => {
    const result = scrapehtml(page, "https://example.com/");
    expect(result.metadata).toMatchObject({
      url: "https://example.com/",
      title: "Test Page",
      description: "A test page",
      links: ["https://example.com/about", "https://ext.example/x"],
    });
    expect(result.content).toBe("Test Page About Ext words");
    /* the raw html rides along only when the caller asks for it */
    expect(result.html).toBeUndefined();
    expect(scrapehtml(page, "https://example.com/", { includehtml: true }).html).toBe(page);
  });

  it("extractcontent exposes the structured extraction for callers that skip formatting", () => {
    const content = extractcontent(page, { url: "https://example.com/" });
    expect(content.title).toBe("Test Page");
    expect(content.description).toBe("A test page");
    expect(content.links).toEqual(["https://example.com/about", "https://ext.example/x"]);
    expect(content.text).toBe("Test Page About Ext words");
  });
});

describe("operations serialization seats", () => {
  it("serializeresult defaults to compact json", () => {
    const serialized = serializeresult(scrapehtml(page, "https://example.com/"));
    const parsed = JSON.parse(serialized) as { content: string; metadata: { title: string } };
    expect(parsed.content).toBe("Test Page About Ext words");
    expect(parsed.metadata.title).toBe("Test Page");
  });

  it("serializeresult renders markdown, text, xml and redis targets", () => {
    const result = scrapehtml(page, "https://example.com/");
    expect(serializeresult(result, { format: "markdown" })).toBe("# Test Page\n\nTest Page About Ext words");
    expect(serializeresult(result, { format: "text" })).toBe("Test Page About Ext words");
    expect(serializeresult(result, { format: "xml" })).toBe("<result><title>Test Page</title><content>Test Page About Ext words</content></result>");
    const redis = serializeresult(result, { format: "redis" });
    expect(JSON.parse(redis).content).toBe("Test Page About Ext words");
    expect(JSON.parse(redis).metadata.url).toBe("https://example.com/");
  });

  it("serializeresult answers pretty json and refuses unsupported formats", () => {
    const result = scrapehtml(page, "https://example.com/");
    expect(serializeresult(result, { format: "json", pretty: true })).toContain('\n  "content"');
    expect(() => serializeresult(result, { format: "bogus" as never })).toThrowError(TypeError);
    expect(() => serializeresult(result, { format: "bogus" as never })).toThrowError(/unsupported format: bogus/);
  });

  it("serializehtml converts inline html to markdown", () => {
    expect(serializehtml(page, { url: "https://example.com/" })).toBe("# Test Page\n\nTest Page About Ext words");
  });
});

describe("operations agent seat", () => {
  it("formatforagent answers the summary, key points, urls, chunks and the token count through the getry intelligence bridge", () => {
    const result = scrapehtml(page, "https://example.com/");
    const agent = formatforagent(result);
    expect(agent.summary).toBe("Test Page About Ext words");
    expect(agent.keypoints.length).toBeGreaterThan(0);
    expect(agent.relevanturls).toEqual(["https://example.com/about", "https://ext.example/x"]);
    expect(Array.isArray(agent.chunks)).toBe(true);
    expect(agent.tokencount).toBeGreaterThan(0);
    /* a tight chunk budget splits multi-line content across several
     * chunks — the getry chunkmarkdown seat never splits a single line */
    const multiline = { content: "First sentence here. Second one. Third.\n\nline two words\n\nline three words", metadata: { links: [] } };
    const chunked = formatforagent(multiline, { maxchunksize: 4 });
    expect(chunked.chunks.length).toBe(3);
    expect(chunked.chunks[0]).toMatchObject({ content: "First sentence here. Second one. Third.", tokencount: 10 });
  });
});
