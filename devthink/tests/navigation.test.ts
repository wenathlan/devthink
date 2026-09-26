import { describe, expect, it } from "vitest";
import {
  batchopenlinks,
  checksafeurl,
  deeplinkapp,
  navintent,
  navratelimit,
  pausenavconsent,
  preconnectorigin,
  prefetchpage,
  reopentab,
  resumenavconsent,
  restoretrail,
} from "../commands.js";
import {
  batchsizelimitgate,
  clipboardgate,
  deeplinkgate,
  navigationobservationgrade,
  pausenavconsentgate,
  preconnectgate,
  prefetchgate,
  reopentabgate,
  safetygate,
  trailorigingate,
} from "../policy.js";
import type { closedtabrecord, toolstep, urlvisit } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one reviewed step fixture with a url value. */
function navstep(over: Partial<toolstep> = {}): toolstep {
  return { id: "s1", kind: "openlink", summary: "Open the reviewed page.", risk: "sensitive", ...over };
}

/** Builds one urlvisit fixture of a run. */
function visit(url: string, at: number, runid = "run1"): urlvisit {
  return { url, at, runid };
}

describe("navigation navintent predictions and prefetch warming", () => {
  it("ranks the predicted urls by step order and urlhistory frequency while prefetchpage drops the stale predictions of a changed plan", () => {
    const steps = [
      navstep({ id: "s1", value: "https://example.com/pricing" }),
      navstep({ id: "s2", value: "https://example.com/docs" }),
      navstep({ id: "s3", value: "https://example.com/pricing" }),
    ];
    const history = [
      visit("https://example.com/docs", now - 5000),
      visit("https://example.com/docs", now - 4000),
      visit("https://example.com/docs", now - 3000),
    ];
    const plan = navintent({ id: "p1", steps, visits: history, now });
    expect(plan.predictedurls.map((entry) => entry.url)).toEqual([
      "https://example.com/docs",
      "https://example.com/pricing",
    ]);
    expect(plan.predictedurls[0]?.confidence).toBeGreaterThan(plan.predictedurls[1]?.confidence ?? 0);
    const plain = navintent({ id: "p2", steps, now });
    expect(plain.predictedurls.map((entry) => entry.url)).toEqual([
      "https://example.com/pricing",
      "https://example.com/docs",
    ]);
    expect(navigationobservationgrade("navintent").allowed).toBe(true);
    expect(navigationobservationgrade("prefetchpage").allowed).toBe(true);
    expect(navigationobservationgrade("batchopenlinks").allowed).toBe(false);
    const stored = {
      id: "p1",
      planid: "plan-old",
      predictedurls: [{ url: "https://example.com/legacy", confidence: 0.9 }],
      createdat: now - 1000,
    };
    const warmed = prefetchpage({
      id: "p3",
      planid: "plan-new",
      urls: ["https://example.com/pricing", "https://outside.example/page"],
      grants: ["https://example.com"],
      stored,
      now,
    });
    expect(warmed.allowed).toEqual(["https://example.com/pricing"]);
    expect(warmed.refused).toEqual(["https://outside.example/page"]);
    expect(warmed.dropped).toEqual(["https://example.com/legacy"]);
    expect(warmed.plan.planid).toBe("plan-new");
    expect(prefetchgate({ urls: warmed.allowed, grants: ["https://example.com"] }).allowed).toBe(true);
    expect(prefetchgate({ urls: ["https://outside.example/page"], grants: ["https://example.com"] }).allowed).toBe(
      false,
    );
  });
});

describe("navigation preconnect and deep links", () => {
  it("filters the preconnect targets through the host grants and marks every socket read only and revocable", () => {
    const expected = preconnectorigin({
      origins: ["https://example.com", "https://shop.example", "https://outside.example", "https://example.com"],
      grants: ["https://example.com", "https://shop.example"],
      now,
    });
    expect(expected.targets.map((target) => target.origin)).toEqual(["https://example.com", "https://shop.example"]);
    expect(expected.targets.every((target) => target.connected === true && target.expectedat === now)).toBe(true);
    expect(expected.refused).toEqual(["https://outside.example"]);
    expect(
      preconnectgate({ targets: expected.targets, grants: ["https://example.com", "https://shop.example"] }).allowed,
    ).toBe(true);
    expect(preconnectgate({ targets: expected.targets, grants: ["https://example.com"] }).allowed).toBe(false);
    expect(
      preconnectgate({
        targets: [{ origin: "https://example.com", expectedat: now, connected: true, revokedat: now }],
        grants: ["https://example.com"],
      }).allowed,
    ).toBe(false);
  });

  it("builds the deep link url from its pattern and the reviewed parameters while the gate requires the pattern origin grant", () => {
    const built = deeplinkapp({ app: "github", params: { owner: "wenathlan", repo: "extension" } });
    expect(built.url).toBe("https://github.com/wenathlan/extension");
    expect(built.pattern).toEqual({
      app: "github",
      origin: "https://github.com",
      route: "/{owner}/{repo}",
      params: ["owner", "repo"],
    });
    const search = deeplinkapp({ app: "youtube", params: { search: "browser agent" } });
    expect(search.url).toBe("https://www.youtube.com/results?search_query=browser%20agent");
    const custom = deeplinkapp({
      app: "github",
      params: { owner: "wenathlan", repo: "other" },
      patterns: [
        { app: "github", origin: "https://github.com", route: "/{owner}/{repo}/tree/main", params: ["owner", "repo"] },
      ],
    });
    expect(custom.url).toBe("https://github.com/wenathlan/other/tree/main");
    expect(() => deeplinkapp({ app: "unknownapp", params: {} })).toThrow(/not a known web app/i);
    expect(() => deeplinkapp({ app: "youtube", params: {} })).toThrow(/reviewed parameters/i);
    expect(deeplinkgate({ pattern: built.pattern, grants: ["https://github.com"] }).allowed).toBe(true);
    expect(deeplinkgate({ pattern: built.pattern, grants: ["https://example.com"] }).allowed).toBe(false);
  });
});

describe("navigation reopentab and restoretrail", () => {
  it("reopens the most recent closed tab record after the grant recheck and refuses a lost grant while the trail restores from the urlhistory with duplicates folded", () => {
    const records: closedtabrecord[] = [
      { id: "c1", url: "https://example.com/pricing", title: "Pricing", tabid: 1, windowid: 1, closedat: now - 1000 },
      { id: "c2", url: "https://shop.example/cart", title: "Cart", tabid: 2, windowid: 1, closedat: now - 500 },
    ];
    const restored = reopentab({ records, grants: ["https://example.com", "https://shop.example"], now });
    expect(restored.id).toBe("c2");
    expect(restored.reopenedat).toBe(now);
    expect(reopentabgate({ record: restored, grants: ["https://example.com", "https://shop.example"] }).allowed).toBe(
      true,
    );
    expect(() =>
      reopentab({
        records: records.map((record) => ({ ...record, reopenedat: now })),
        grants: ["https://example.com", "https://shop.example"],
        now,
      }),
    ).toThrow(/already came back/i);
    const grantedonly = reopentab({ records, grants: ["https://example.com"], now });
    expect(grantedonly.id).toBe("c1");
    expect(() =>
      reopentab({ records, grants: ["https://example.com"], url: "https://shop.example/cart", now }),
    ).toThrow(/lost its grant/i);
    const visits = [
      visit("https://example.com", now - 3000),
      visit("https://example.com/pricing", now - 2000),
      visit("https://example.com/pricing", now - 1500),
      visit("https://example.com/docs", now - 1000),
      visit("https://other.example", now - 500, "run2"),
    ];
    const trail = restoretrail({ visits, runid: "run1" });
    expect(trail.map((entry) => entry.url)).toEqual([
      "https://example.com",
      "https://example.com/pricing",
      "https://example.com/docs",
    ]);
    expect(trail.every((entry) => entry.runid === "run1")).toBe(true);
    expect(restoretrail({ visits: [...visits, ...visits], runid: "run1" })).toEqual(trail);
    expect(trailorigingate({ entries: trail, origins: ["https://example.com"] }).allowed).toBe(true);
    expect(trailorigingate({ entries: trail, origins: ["https://shop.example"] }).allowed).toBe(false);
  });
});

describe("navigation pause queueing and rate windows", () => {
  it("queues the pending navigation behind the open consent prompt until the resume while the sliding window delays a full domain and never drops it silently", () => {
    const armed = pausenavconsent({ reason: "a consent prompt is open", now });
    expect(armed.pausedat).toBe(now);
    expect(armed.pendingurl).toBeUndefined();
    const queued = pausenavconsent({ url: "https://example.com/next", stepid: "s9", stored: armed, now: now + 1000 });
    expect(queued.pendingurl).toBe("https://example.com/next");
    expect(queued.pendingstepid).toBe("s9");
    expect(queued.pausedat).toBe(now);
    expect(pausenavconsentgate({ pause: queued, kind: "openlink" }).allowed).toBe(false);
    expect(pausenavconsentgate({ pause: queued, kind: "observe" }).allowed).toBe(true);
    expect(pausenavconsentgate({ kind: "openlink" }).allowed).toBe(true);
    const resumed = resumenavconsent({ stored: queued, now: now + 2000 });
    expect(resumed.resumed).toBe(true);
    expect(resumed.queued?.pendingurl).toBe("https://example.com/next");
    expect(resumenavconsent({ now }).resumed).toBe(false);
    const first = navratelimit({ url: "https://example.com/page", now, window: 1000, ceiling: 2 });
    expect(first.allowed).toBe(true);
    expect(first.window.count).toBe(1);
    const second = navratelimit({
      stored: first.window,
      url: "https://example.com/other",
      now: now + 100,
      window: 1000,
      ceiling: 2,
    });
    expect(second.allowed).toBe(true);
    expect(second.window.count).toBe(2);
    const third = navratelimit({
      stored: second.window,
      url: "https://example.com/third",
      now: now + 200,
      window: 1000,
      ceiling: 2,
    });
    expect(third.allowed).toBe(false);
    expect(third.waitms).toBe(800);
    const aged = navratelimit({
      stored: second.window,
      url: "https://example.com/third",
      now: now + 1000,
      window: 1000,
      ceiling: 2,
    });
    expect(aged.allowed).toBe(true);
    expect(aged.window.hits).toEqual([now + 100, now + 1000]);
    expect(navratelimit({ url: "https://example.com/page", now }).allowed).toBe(true);
  });
});

describe("navigation safety verdicts and batch opening", () => {
  it("refuses the lookalike hosts that imitate the granted origins while the batch verifies every url and orders the opens across the rate windows", () => {
    const grants = ["https://example.com", "https://shop.example"];
    expect(checksafeurl({ url: "https://example.com/pricing", granted: grants, now }).safe).toBe(true);
    expect(checksafeurl({ url: "https://docs.example.com/guide", granted: grants, now }).safe).toBe(true);
    const lookalike = checksafeurl({ url: "https://example.com.evil.io/login", granted: grants, now });
    expect(lookalike.safe).toBe(false);
    expect(lookalike.reasons.join(" ")).toContain("imitates the granted origin example.com");
    const hyphen = checksafeurl({ url: "https://example-com.evil.net/login", granted: grants, now });
    expect(hyphen.safe).toBe(false);
    expect(checksafeurl({ url: "http://example.com/pricing", granted: grants, now }).reasons).toContain(
      "the url must use HTTPS",
    );
    expect(checksafeurl({ url: "https://user:pass@example.com/", granted: grants, now }).safe).toBe(false);
    expect(safetygate({ verdict: lookalike }).allowed).toBe(false);
    expect(clipboardgate({ usergesture: true, url: "https://example.com/next", grants }).allowed).toBe(true);
    expect(clipboardgate({ usergesture: false, url: "https://example.com/next", grants }).allowed).toBe(false);
    expect(clipboardgate({ usergesture: true, url: "https://outside.example/next", grants }).allowed).toBe(false);
    const refused = batchopenlinks({
      id: "b1",
      urls: ["https://example.com/a", "https://example.com.evil.io/b"],
      grants,
      windows: [],
      now,
    });
    expect(refused.open).toEqual([]);
    expect(refused.refused.map((entry) => entry.url)).toEqual(["https://example.com.evil.io/b"]);
    const ordered = batchopenlinks({
      id: "b2",
      urls: ["https://example.com/a", "https://shop.example/b", "https://example.com/c"],
      grants,
      windows: [{ domain: "example.com", count: 1, resetat: now + 900, hits: [now - 100], window: 1000, ceiling: 2 }],
      now,
    });
    expect(ordered.ordered).toEqual(["https://example.com/a", "https://shop.example/b"]);
    expect(ordered.waits.map((wait) => wait.url)).toEqual(["https://example.com/c"]);
    expect(ordered.waits[0]?.waitms).toBe(900);
    expect(batchsizelimitgate({ size: 3, limit: 2 }).allowed).toBe(false);
    expect(batchsizelimitgate({ size: 3 }).allowed).toBe(true);
    expect(() =>
      batchopenlinks({
        id: "b3",
        urls: ["https://example.com/a", "https://example.com/b", "https://example.com/c"],
        grants,
        windows: [],
        now,
        sizelimit: 2,
      }),
    ).toThrow(/user configured ceiling/i);
  });
});
