import { describe, expect, it } from "vitest";
import {
  foldplannedvisits,
  navdedupeverdict,
  runcachedigest,
  runcachehit,
  runcachesweep,
  resumepointof,
  revalidatefingerprint,
  skipcompletedsteps,
  stepprefetchhints,
} from "../run.js";
import { resumefingerprintgate, sessionreusegate, stepprefetchgate } from "../policy.js";
import { sessioncontainerof, sessionreusegrantof } from "../run.js";
import { sessionmemory } from "../memory.js";

const now = 1_800_000_000_000;

class fakeadapter {
  private readonly data = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | undefined> {
    return this.data.get(key) as T | undefined;
  }
  async set<T>(key: string, value: T): Promise<void> {
    this.data.set(key, value);
  }
}

describe("efficientresume", () => {
  it("checkpoints each step boundary with a cursor and a digest", () => {
    const point = resumepointof({ runid: "run1", stepid: "s1", cursor: 1, digest: "fp1", now });
    expect(point).toEqual({ runid: "run1", stepid: "s1", cursor: 1, digest: "fp1", at: now });
    expect(() => resumepointof({ runid: "run1", stepid: "s1", cursor: 1, digest: " ", now })).toThrow(/digest/i);
  });

  it("skips the completed steps after a restart and resumes at the first open step", () => {
    const checkpoints = [
      resumepointof({ runid: "run1", stepid: "s1", cursor: 1, digest: "fp1", now }),
      resumepointof({ runid: "run1", stepid: "s2", cursor: 2, digest: "fp2", now }),
    ];
    const skip = skipcompletedsteps({ checkpoints, steps: ["s1", "s2", "s3"] });
    expect(skip.skip).toEqual(["s1", "s2"]);
    expect(skip.resumeat).toBe("s3");
    const complete = skipcompletedsteps({ checkpoints, steps: ["s1", "s2"] });
    expect(complete.resumeat).toBeUndefined();
  });

  it("revalidates the page fingerprint before it resumes and refuses a changed page", () => {
    const checkpoint = resumepointof({ runid: "run1", stepid: "s2", cursor: 2, digest: "fp2", now });
    expect(revalidatefingerprint({ checkpoint, fingerprint: "fp2" }).ok).toBe(true);
    const changed = revalidatefingerprint({ checkpoint, fingerprint: "fp9" });
    expect(changed.ok).toBe(false);
    expect(changed.reason).toMatch(/refuses/i);
    expect(resumefingerprintgate({ checkpoint, fingerprint: "fp2" }).allowed).toBe(true);
    expect(resumefingerprintgate({ checkpoint, fingerprint: "fp9" }).allowed).toBe(false);
  });
});

describe("navdedupe", () => {
  it("skips navigations to the already active url", () => {
    expect(navdedupeverdict({ url: "https://example.com/a", activeurl: "https://example.com/a" }).skip).toBe(true);
    expect(navdedupeverdict({ url: "https://example.com/a", activeurl: "https://example.com/b" }).skip).toBe(false);
    expect(navdedupeverdict({ url: "", activeurl: "https://example.com/a" }).skip).toBe(false);
  });

  it("folds repeated planned visits into one navigation per url", () => {
    const folded = foldplannedvisits([
      { id: "s1", url: "https://example.com/a" },
      { id: "s2", url: "https://example.com/b" },
      { id: "s3", url: "https://example.com/a" },
      { id: "s4" },
    ]);
    expect(folded).toHaveLength(2);
    expect(folded.find((entry) => entry.url === "https://example.com/a")?.stepids).toEqual(["s1", "s3"]);
  });
});

describe("runcache", () => {
  it("stores fetched resources per run keyed by digest and serves the repeat fetches of the same run", () => {
    const digest = runcachedigest({ runid: "run1", resource: "https://example.com/data" });
    expect(digest).toBe("run1:https://example.com/data");
    expect(() => runcachedigest({ runid: " ", resource: "https://example.com/data" })).toThrow(/run id/i);
    const entry = { runid: "run1", digest, resource: "https://example.com/data", storedat: now, pinned: false };
    expect(runcachehit([entry], { runid: "run1", resource: "https://example.com/data" })).toEqual(entry);
    expect(runcachehit([entry], { runid: "run2", resource: "https://example.com/data" })).toBeUndefined();
  });

  it("clears at the run end unless the user pins the profile cache", () => {
    const entries = [
      { runid: "run1", digest: "run1:a", resource: "a", storedat: now, pinned: false },
      { runid: "run2", digest: "run2:b", resource: "b", storedat: now, pinned: false },
      { runid: "run1", digest: "run1:c", resource: "c", storedat: now, pinned: true },
    ];
    const swept = runcachesweep(entries, { runid: "run1", pin: false });
    expect(swept.cleared).toBe(1);
    expect(swept.kept).toHaveLength(2);
    const pinned = runcachesweep(entries, { runid: "run1", pin: true });
    expect(pinned.cleared).toBe(0);
    expect(pinned.kept).toHaveLength(3);
  });

  it("sweeps the stored runcache entries through the memory store", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addruncacheentry({ runid: "run1", digest: "run1:a", resource: "a", storedat: now, pinned: false });
    await store.addruncacheentry({ runid: "run2", digest: "run2:b", resource: "b", storedat: now, pinned: false });
    const sweep = await store.sweepruncache("run1", false);
    expect(sweep.cleared).toBe(1);
    expect(await store.getruncache()).toHaveLength(1);
    const held = await store.sweepruncache("run2", true);
    expect(held.cleared).toBe(0);
  });
});

describe("stepprefetch", () => {
  it("warms the likely next pages and selectors from the plan structure alone", () => {
    const hints = stepprefetchhints({
      steps: [
        { id: "s1", kind: "navigate", value: "https://example.com/a" },
        { id: "s2", kind: "click", target: "#button" },
        { id: "s3", kind: "navigate", value: "https://example.com/b" },
        { id: "s4", kind: "click", target: "#button" },
      ],
    });
    expect(hints[0]?.page).toBe("https://example.com/b");
    expect(hints[0]?.selectors).toEqual(["#button"]);
    expect(hints[1]?.page).toBe("https://example.com/b");
    expect(hints[3]?.page).toBeUndefined();
    const plannedpages = ["https://example.com/a", "https://example.com/b"];
    const plannedselectors = ["#button"];
    expect(stepprefetchgate({ hint: hints[1]!, plannedpages, plannedselectors }).allowed).toBe(true);
    expect(
      stepprefetchgate({ hint: { page: "https://evil.example/x", selectors: [] }, plannedpages, plannedselectors })
        .allowed,
    ).toBe(false);
    expect(stepprefetchgate({ hint: { selectors: ["#secret"] }, plannedpages, plannedselectors }).allowed).toBe(false);
  });
});

describe("sessionreuse", () => {
  it("attaches an authenticated profile to a run only through its explicit per profile consent prompt", () => {
    const grant = sessionreusegrantof({
      profile: "work",
      container: "work:run1",
      promptid: "prompt1",
      consentedat: now,
      runid: "run1",
    });
    expect(grant.profile).toBe("work");
    expect(
      sessionreusegate({
        grant: {
          profile: grant.profile,
          promptid: grant.promptid,
          consentedat: grant.consentedat,
          ...(grant.runid !== undefined ? { runid: grant.runid } : {}),
        },
      }).allowed,
    ).toBe(true);
    expect(sessionreusegate({ grant: { profile: "work", promptid: "", consentedat: now } }).allowed).toBe(false);
    expect(sessionreusegate({ grant: { profile: "work", promptid: "prompt1", consentedat: 0 } }).allowed).toBe(false);
    expect(() => sessionreusegrantof({ profile: " ", container: "c", promptid: "p", consentedat: now })).toThrow(
      /profile/i,
    );
  });

  it("isolates the cookies per task through separate containers", () => {
    expect(sessioncontainerof({ profile: "work", taskid: "run1" })).toBe("work:run1");
    expect(sessioncontainerof({ profile: "work", taskid: "run2" })).not.toBe(
      sessioncontainerof({ profile: "work", taskid: "run1" }),
    );
    expect(() => sessioncontainerof({ profile: "work", taskid: " " })).toThrow(/task id/i);
  });

  it("stores the sessionreuse grants of the profile workspace", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addsessionreusegrant(
      sessionreusegrantof({ profile: "work", container: "work:run1", promptid: "prompt1", consentedat: now }),
    );
    await store.addsessionreusegrant(
      sessionreusegrantof({ profile: "work", container: "work:run2", promptid: "prompt1", consentedat: now }),
    );
    expect(await store.getsessionreusegrants()).toHaveLength(1);
  });
});
