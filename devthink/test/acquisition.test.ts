import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  captchaguard,
  captchacontract,
  captchatypes,
  createCache,
  crawlfrontier,
  detectcontenttype,
  evidence,
  extractContent,
  extracthtml,
  extractReadable,
  extractsemantic,
  extractstructured,
  extractwithschema,
  getCrawlDelay,
  getSitemaps,
  isAllowed,
  normalizeresponse,
  normalizeresult,
  normalizeurl,
  persistentqueue,
  robotsallowed,
  robotsdelay,
  robotsrules,
  sameorigin,
  ttlcache,
} from "../acquisition.js";

/* the acquisition battery of the scrape-domain restore (wave-restore-8): the
 * verbatim saddle engine now rides the devthink root, and these legs walk the
 * real behavior of every pure seat — robots policy parsing and enforcement,
 * the stale-aware caches, response normalization, the dependency-free
 * extraction family, crawl url hygiene, the bounded frontier, the durable
 * queue over a real temp-dir file store and the captcha contract family. the
 * network-bound seats (fetchRobotsTxt, crawl, scraper) stay out of the
 * battery — they walk only through a caller-injected fetcher at runtime. */

const temporary: string[] = [];

afterEach(() => {
  for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true });
});

const robotstext = [
  "User-agent: *",
  "Disallow: /private/",
  "Allow: /private/public",
  "Crawl-delay: 2",
  "",
  "User-agent: devthink",
  "Disallow: /",
  "",
  "Sitemap: https://example.com/sitemap.xml",
].join("\n");

describe("robots policy seat", () => {
  it("parses directives, groups, sitemaps and the crawl delay from robots text", () => {
    const rules = robotsrules(robotstext);
    expect(rules.directives).toHaveLength(2);
    expect(rules.groups).toHaveLength(2);
    expect(rules.sitemaps).toEqual(["https://example.com/sitemap.xml"]);
    expect(rules.crawlDelay).toBe(2);
    expect(rules.directives[0]).toMatchObject({ userAgent: "*", allow: ["/private/public"], disallow: ["/private/"], crawlDelay: 2 });
    expect(rules.groups[1].agents).toEqual(["devthink"]);
  });

  it("enforces allow and disallow patterns per agent through isAllowed and robotsallowed", () => {
    const rules = robotsrules(robotstext);
    expect(isAllowed("https://example.com/page", rules)).toBe(true);
    expect(isAllowed("https://example.com/private/x", rules)).toBe(false);
    expect(isAllowed("https://example.com/private/public", rules)).toBe(true);
    expect(isAllowed("https://example.com/", rules, "devthink")).toBe(false);
    expect(robotsallowed(rules, "https://example.com/open")).toBe(true);
    expect(robotsallowed(rules, "https://example.com/private/x")).toBe(false);
    /* an unparsable url stays allowed — the policy never fails the caller */
    expect(isAllowed("not a url", rules)).toBe(true);
  });

  it("answers the crawl delay and the sitemap list per agent", () => {
    const rules = robotsrules(robotstext);
    expect(getCrawlDelay(rules)).toBe(2);
    expect(robotsdelay(rules)).toBe(2);
    expect(robotsdelay(robotsrules(""))).toBe(0);
    expect(getSitemaps(rules)).toEqual(["https://example.com/sitemap.xml"]);
    expect(getSitemaps(robotsrules(""))).toEqual([]);
  });
});

describe("cache seat", () => {
  it("ttlcache sets, gets, dedupes by key and answers null after expiry", async () => {
    const store = ttlcache<string>({ ttl: 50 });
    expect(store.set("k", "v")).toBe("v");
    expect(store.get("k")).toBe("v");
    expect(store.size()).toBe(1);
    store.delete("k");
    expect(store.get("k")).toBeNull();
    store.set("gone", "x", { ttl: 10 });
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(store.get("gone")).toBeNull();
    store.clear();
    expect(store.size()).toBe(0);
  });

  it("ttlcache serves the stale value inside the stale window when stale is opted in", async () => {
    const store = ttlcache<string>({ stale: true });
    store.set("s", "sv", { ttl: 10, stale: 200 });
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(store.get("s")).toBe("sv");
  });

  it("the typed cache facade expires entries on the default ttl", async () => {
    const cache = createCache({ defaultTtlMs: 20 });
    cache.set("a", 1);
    expect(cache.get("a")).toBe(1);
    expect(cache.has("a")).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(cache.get("a")).toBeUndefined();
    expect(cache.has("a")).toBe(false);
    cache.set("b", 2);
    expect(cache.delete("b")).toBe(true);
    expect(cache.size()).toBe(0);
    expect(await cache.getOrSet("c", async () => 3)).toBe(3);
    expect(cache.get("c")).toBe(3);
  });
});

describe("normalization seat", () => {
  it("classifies html and json content with the decoded text and parsed data", () => {
    const html = normalizeresult("<p>hello</p>", { contenttype: "text/html" });
    expect(html.kind).toBe("html");
    expect(html.content).toBe("<p>hello</p>");
    expect(html.size).toBe(12);
    const json = normalizeresult('{"a":1}', { contenttype: "application/json" });
    expect(json.kind).toBe("json");
    expect(json.data).toMatchObject({ a: 1 });
  });

  it("rejects content past the byte budget with the CONTENT_TOO_LARGE code", () => {
    expect(() => normalizeresult("x".repeat(10), { maxbytes: 5 })).toThrowError(/content exceeds 5 bytes/);
    try {
      normalizeresult("x".repeat(10), { maxbytes: 5 });
    } catch (error) {
      expect((error as NodeJS.ErrnoException).code).toBe("CONTENT_TOO_LARGE");
    }
  });

  it("reads a response body through normalizeresponse with the header content type", async () => {
    const normalized = await normalizeresponse(new Response("<p>hello</p>", { headers: { "content-type": "text/html" } }));
    expect(normalized.kind).toBe("html");
    expect(normalized.content).toBe("<p>hello</p>");
  });

  it("detects the content type from the header, the url suffix and the fallback", () => {
    expect(detectcontenttype("application/json; charset=utf-8", "https://x/y.md")).toBe("application/json");
    expect(detectcontenttype(undefined, "https://x/y.md")).toBe("text/markdown");
    expect(detectcontenttype(undefined, "not a url")).toBe("application/octet-stream");
  });
});

describe("extraction seat", () => {
  const page = [
    "<html><head><title>Test Page</title>",
    '<meta name="description" content="A test page">',
    "</head><body>",
    '<a href="/about">About</a>',
    '<a href="https://ext.example/x">Ext</a>',
    "<script>evil()</script><style>.x{}</style>words",
    "</body></html>",
  ].join("");
  const rich = [
    "<html><head><title>Rich</title></head><body><h1>Heading</h1>",
    '<a href="https://a.example/1">one</a>',
    '<img src="pic.png" alt="pic" width="10">',
    "<table><tr><th>H1</th><th>H2</th></tr><tr><td>a</td><td>b</td></tr></table>",
    '<script type="application/ld+json">{"@type":"WebPage"}</script>',
    "</body></html>",
  ].join("");

  it("extracthtml answers title, description, resolved links and the tag-stripped text", () => {
    const result = extracthtml(page, "https://example.com/");
    expect(result.title).toBe("Test Page");
    expect(result.description).toBe("A test page");
    expect(result.links).toEqual(["https://example.com/about", "https://ext.example/x"]);
    expect(result.text).toBe("Test Page About Ext words");
  });

  it("extractContent answers links, images, tables, metadata and the json-ld payload", async () => {
    const content = await extractContent(rich);
    expect(content.metadata.title).toBe("Rich");
    expect(content.links.map((link) => link.href)).toEqual(["https://a.example/1"]);
    expect(content.images).toEqual([{ src: "pic.png", alt: "pic", width: 10 }]);
    expect(content.tables).toEqual([{ headers: ["H1", "H2"], rows: [["a", "b"]] }]);
    expect(content.jsonLd).toEqual([{ "@type": "WebPage" }]);
    expect(content.content).toContain("Heading");
  });

  it("extractReadable answers the article segment over the surrounding body", async () => {
    expect(await extractReadable("<html><body><article>article words</article><p>outside words</p></body></html>")).toBe("article words");
  });

  it("the schema seats walk selector extraction, bounded provenance and the semantic facts", () => {
    expect(extractwithschema(rich, { title: { selector: "title" }, heading: { selector: "h1" } })).toEqual({ title: "Rich", heading: "Heading" });
    const structured = extractstructured(rich, { title: { selector: "title" } }, { url: "https://x/" });
    expect(structured.version).toBe(1);
    expect(structured.sourceurl).toBe("https://x/");
    expect(structured.values).toEqual({ title: "Rich" });
    expect(structured.provenance.title).toMatchObject({ sourceurl: "https://x/", selector: "title", truncated: false });
    const semantic = extractsemantic(rich, "https://example.com/");
    expect(semantic.title).toBe("Rich");
    expect(semantic.headings).toEqual([{ level: 1, text: "Heading" }]);
    expect(semantic.links.map((link) => link.url)).toEqual(["https://a.example/1"]);
  });
});

describe("crawl hygiene seat", () => {
  it("normalizeurl drops fragments, tracking parameters and trailing slashes", () => {
    expect(normalizeurl("https://example.com/path/?utm_source=x&id=2")).toBe("https://example.com/path?id=2");
    expect(normalizeurl("https://example.com/a#frag")).toBe("https://example.com/a");
  });

  it("sameorigin compares two crawl targets by origin", () => {
    expect(sameorigin("https://a.example/1", "https://a.example/2")).toBe(true);
    expect(sameorigin("https://a.example/1", "https://b.example/2")).toBe(false);
  });

  it("crawlfrontier dedupes, orders by priority and enforces the page and per-domain budgets", () => {
    const frontier = crawlfrontier({ maxpages: 3, maxperdomain: 1 });
    expect(frontier.add({ url: "https://a.example/1" })).toBe(true);
    expect(frontier.add({ url: "https://a.example/1" })).toBe(false);
    expect(frontier.add({ url: "https://a.example/2", priority: 5 })).toBe(true);
    expect(frontier.add({ url: "https://b.example/1" })).toBe(true);
    expect(frontier.add({ url: "https://c.example/1" })).toBe(false);
    expect(frontier.next()).toMatchObject({ url: "https://a.example/2", priority: 5 });
    /* the per-domain budget skips the second a.example target */
    expect(frontier.next()).toMatchObject({ url: "https://b.example/1" });
    expect(frontier.next()).toBeNull();
    frontier.complete("https://a.example/2");
    expect(frontier.state()).toMatchObject({ maxpages: 3, maxperdomain: 1, discovered: 3, completed: 1, domains: { "a.example": 1, "b.example": 1 } });
  });

  it("persistentqueue persists through a real file-backed store in a temp dir and restores unfinished records", async () => {
    const dir = mkdtempSync(join(tmpdir(), "acquisition-"));
    temporary.push(dir);
    const file = join(dir, "queue.json");
    const filestore = {
      async save(value: { url: string }) {
        const all = JSON.parse(readFileSync(file, "utf-8")) as unknown[];
        all.push(value);
        writeFileSync(file, JSON.stringify(all));
      },
      async update(url: string, item: unknown) {
        const all = JSON.parse(readFileSync(file, "utf-8")) as Record<string, unknown>[];
        const index = all.findIndex((entry) => entry.url === url);
        if (index >= 0) all[index] = item as Record<string, unknown>;
        writeFileSync(file, JSON.stringify(all));
      },
      async list() {
        return JSON.parse(readFileSync(file, "utf-8")) as { url: string; status: string }[];
      },
    };
    writeFileSync(file, "[]");
    const queue = persistentqueue({ store: filestore });
    expect(await queue.add({ url: "https://a.example/1" })).toBe(true);
    expect(await queue.add({ url: "https://a.example/1" })).toBe(false);
    expect(await queue.add({ url: "https://a.example/2" })).toBe(true);
    const claimed = await queue.next();
    expect(claimed).toMatchObject({ url: "https://a.example/1", status: "running" });
    expect(await queue.complete("https://a.example/1", {})).toMatchObject({ url: "https://a.example/1", status: "done" });
    expect(await queue.next()).toMatchObject({ url: "https://a.example/2", status: "running" });
    /* a fresh queue over the same store restores the unfinished record only */
    const restored = persistentqueue({ store: filestore });
    await restored.restore();
    expect(restored.list().map((item) => item.url)).toEqual(["https://a.example/2"]);
  });

  it("persistentqueue walks the in-memory contract when no store is injected", async () => {
    const queue = persistentqueue();
    expect(await queue.add({ url: "https://x.example/1" })).toBe(true);
    expect(await queue.next()).toMatchObject({ url: "https://x.example/1", status: "running" });
    expect(await queue.complete("https://x.example/1", {})).toMatchObject({ status: "done" });
    expect(await queue.next()).toBeNull();
  });
});

describe("captcha contract seat", () => {
  it("captchatypes is the frozen four-kind list", () => {
    expect(Object.isFrozen(captchatypes)).toBe(true);
    expect([...captchatypes]).toEqual(["hcaptcha", "turnstile", "recaptcha", "unknown"]);
  });

  it("captchacontract normalizes detection, demands review, solves and asserts", async () => {
    const contract = captchacontract({
      detect: async () => ({ kind: "hcaptcha", detected: true, sitekey: "k" }),
      solve: async () => ({ passed: true, token: "t" }),
    });
    await expect(contract.detect({})).resolves.toMatchObject({ kind: "hcaptcha", detected: true, sitekey: "k" });
    await expect(contract.request({ kind: "hcaptcha" })).resolves.toMatchObject({ status: "reviewrequired" });
    const solved = await contract.solve({});
    expect(solved).toMatchObject({ status: "passed", passed: true, token: "t" });
    expect(contract.assert(solved)).toBe(solved);
    expect(() => contract.assert({ passed: false })).toThrowError("captcha assertion failed");
    /* an unknown detector kind normalizes to "unknown" and an absent solver answers unavailable */
    const stub = captchacontract({ detect: async () => ({ kind: "bogus", detected: false }) });
    await expect(stub.detect({})).resolves.toMatchObject({ kind: "unknown", detected: false });
    await expect(captchacontract().solve({})).resolves.toMatchObject({ status: "unavailable", reason: "no external solver configured" });
  });

  it("captchaguard blocks detected captchas with a review event and allows clean passes", async () => {
    const contract = captchacontract({ detect: async () => ({ kind: "recaptcha", detected: true }) });
    const guard = captchaguard({ contract });
    const blocked = await guard.check({});
    expect(blocked.allowed).toBe(false);
    expect(blocked.action).toBe("reviewrequired");
    expect(guard.events()).toHaveLength(1);
    expect(guard.events()[0]).toMatchObject({ type: "captcha.detected", kind: "recaptcha" });
    const cleanguard = captchaguard({ contract: captchacontract({ detect: async () => ({ kind: "unknown", detected: false }) }) });
    await expect(cleanguard.check({})).resolves.toMatchObject({ allowed: true });
  });

  it("evidence hashes the payload with the saddle foundation sha256 seat through the family bridge", () => {
    const record = evidence({ data: "hello", kind: "hcaptcha", passed: true });
    expect(record.kind).toBe("hcaptcha");
    expect(record.passed).toBe(true);
    expect(record.sha256).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
    expect(evidence({ data: new TextEncoder().encode("hello") }).sha256).toBe(record.sha256);
    expect(evidence({ data: "hello", metadata: { origin: "x" } }).metadata).toEqual({ origin: "x" });
  });
});
