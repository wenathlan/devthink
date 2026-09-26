import { describe, expect, it } from "vitest";
import { sessionmemory } from "../memory.js";
import { runsummarytask, summaryrequestof } from "../environments.js";
import {
  addhistoryentry,
  addrecallentry,
  cancelrunactionof,
  classifyfailure,
  consentadvisoryverdict,
  consentmemoryof,
  distillrunsummary,
  editedcorrectionof,
  errorsurfaceof,
  expirnotes,
  expirerecallindex,
  expirecorrections,
  historyqueryof,
  historysearch,
  highlightterms,
  matchingcorrections,
  notebodyof,
  notehistoryentry,
  prunescratchpad,
  rankrecall,
  recallentryof,
  rejectedcorrectionof,
  retryhintof,
  rollbackof,
  rollbacksplit,
  scratchentryof,
  scratchpadof,
  sessiongridrows,
  sessionbundleof,
  sitenoteof,
  summaryhistoryentry,
  tabsessionrefof,
  tabsessionkey,
  emptystatemessage,
  sealnotebody,
  opennotebody,
} from "../session.js";
import {
  cancelrungate,
  consentmemoryadvisorygate,
  memoryreadscopegate,
  retrydispatchgate,
  scratchpadscopegate,
  semanticrecallscopegate,
  sessionretentionvalid,
  sitenotesreadgate,
  sitenoteswritegate,
  summarywindowvalid,
} from "../policy.js";
import type { agentplan, scratchpadentry, storedrunlog } from "../types.js";

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

const plan: agentplan = {
  id: "run1",
  objective: "Collect the pricing table",
  origin: "https://example.com",
  steps: [
    { id: "s1", kind: "readtable", risk: "read", summary: "Read the pricing table." },
    { id: "s2", kind: "click", risk: "interaction", target: "#next", summary: "Open the next page." },
    { id: "s3", kind: "readtable", risk: "read", summary: "Read the second table." },
  ],
  createdat: now - 5000,
  expiresat: now + 5000,
  state: "approved",
};

describe("session interface", () => {
  it("builds site notes per origin with title, body, author provenance and timestamps", () => {
    const note = sitenoteof({
      origin: "https://example.com",
      title: "Pricing flow",
      body: "The pricing table loads under #pricing.",
      author: "user",
      now,
    });
    expect(note.id).toBeTruthy();
    expect(note.body).toBe("The pricing table loads under #pricing.");
    expect(note.sensitive).toBe(false);
    expect(note.createdat).toBe(now);
    expect(() => sitenoteof({ origin: " ", title: "t", body: "b", author: "user", now })).toThrow(/origin/);
  });

  it("seals sensitive note bodies at rest and opens them for the reading surface", () => {
    const note = sitenoteof({
      origin: "https://bank.example",
      title: "Login flow",
      body: "The login asks the card number first.",
      author: "user",
      sensitive: true,
      now,
    });
    expect(note.body).toBeUndefined();
    expect(note.sealedbody).toMatch(/^sealed:/);
    expect(note.sealedbody).not.toContain("card");
    expect(notebodyof(note)).toBe("The login asks the card number first.");
    expect(opennotebody(note.id, "sealed:notbase64")).toBe("");
    expect(sealnotebody("id", "text")).not.toBe("text");
  });

  it("expires site notes only at the user configured window", () => {
    const notes = [
      sitenoteof({ origin: "https://a.example", title: "fresh", body: "fresh note", author: "user", now }),
      sitenoteof({ origin: "https://b.example", title: "old", body: "old note", author: "user", now: now - 10_000 }),
    ];
    expect(expirnotes(notes, 5000, now)).toHaveLength(1);
    expect(expirnotes(notes, undefined, now)).toHaveLength(2);
  });

  it("keeps the scratchpad append only per task with step provenance and prunes at the user window", () => {
    const entry = scratchentryof({
      taskid: "run1",
      sessionid: "sess1",
      text: "The table needs a wait first.",
      stepid: "s1",
      author: "agent",
      now,
    });
    expect(entry.stepid).toBe("s1");
    const usertext = scratchentryof({
      taskid: "run1",
      sessionid: "sess1",
      text: "Remember the vat id.",
      author: "user",
      now: now - 10_000,
    });
    const other: scratchpadentry = { ...usertext, taskid: "run2" };
    expect(scratchpadof([entry, usertext, other], "run1", "sess1")).toHaveLength(2);
    expect(prunescratchpad([entry, usertext], 5000, now)).toEqual([entry]);
    expect(prunescratchpad([entry, usertext], undefined, now)).toHaveLength(2);
    expect(() => scratchentryof({ taskid: "run1", sessionid: "sess1", text: " ", author: "agent", now })).toThrow(
      /text/,
    );
  });

  it("distills a run summary from step outcomes inside the user configured window with no fixed cap", () => {
    const outcomes = [
      { stepid: "s1", ok: true, summary: "Read 12 rows.", at: now },
      { stepid: "s2", ok: true, summary: "Opened the next page.", at: now + 1 },
      { stepid: "s3", ok: false, summary: "The table never loaded.", at: now + 2 },
    ];
    const full = distillrunsummary({
      plan,
      outcomes,
      origins: ["https://example.com"],
      sessionid: "sess1",
      provenance: "offscreenworker",
      now,
    });
    expect(full.steps).toHaveLength(3);
    expect(full.origins).toEqual(["https://example.com"]);
    expect(full.kinds).toEqual(["readtable", "click"]);
    expect(full.task).toBe("runsummary");
    const windowed = distillrunsummary({
      plan,
      outcomes,
      origins: ["https://example.com"],
      sessionid: "sess1",
      window: 2,
      provenance: "inline",
      now,
    });
    expect(windowed.steps).toHaveLength(2);
    expect(windowed.window).toBe(2);
    expect(windowed.steps[0]?.stepid).toBe("s2");
  });

  it("builds the runsummary request as one offscreen worker task", () => {
    expect(runsummarytask).toBe("runsummary");
    const request = summaryrequestof({
      id: "w1",
      runid: "run1",
      sessionid: "sess1",
      payload: JSON.stringify({ steps: 3 }),
      sentat: now,
    });
    expect(request.task).toBe("runsummary");
    expect(request.transferables).toEqual([]);
    expect(() => summaryrequestof({ id: "w2", runid: "run1", sessionid: "sess1", payload: " ", sentat: now })).toThrow(
      /payload/,
    );
  });

  it("indexes extraction records with fingerprint deduplication and ranks them by text similarity with provenance", () => {
    const first = recallentryof({
      origin: "https://example.com",
      runid: "run1",
      stepid: "s1",
      text: "pricing table with monthly and yearly plans",
      at: now,
    });
    const duplicate = recallentryof({
      origin: "https://example.com",
      runid: "run2",
      stepid: "s9",
      text: "pricing  table with monthly and yearly plans",
      at: now + 1,
    });
    let index = addrecallentry([], first);
    index = addrecallentry(index, duplicate);
    expect(index).toHaveLength(1);
    const other = recallentryof({
      origin: "https://shop.example",
      runid: "run1",
      stepid: "s2",
      text: "shipping options and delivery windows",
      at: now,
    });
    index = addrecallentry(index, other);
    const ranked = rankrecall(
      index,
      { text: "pricing plans" },
      { origins: ["https://example.com", "https://shop.example"] },
    );
    expect(ranked[0]?.entry.origin).toBe("https://example.com");
    expect(ranked[0]?.entry.runid).toBe("run1");
    expect(ranked[0]?.entry.stepid).toBe("s1");
    expect(ranked[0]?.reason).toMatch(/run run1/);
    expect(rankrecall(index, { text: "nothing alike" }, { origins: ["https://example.com"] })).toHaveLength(0);
    expect(expirerecallindex(index, 5000, now + 10_000)).toHaveLength(0);
    expect(expirerecallindex(index, undefined, now)).toHaveLength(2);
  });

  it("captures corrections from plan review edits and rejections and feeds matching ones into proposals", () => {
    const edited = editedcorrectionof({
      origin: "https://example.com",
      kind: "click",
      stepid: "s2",
      original: "click #next",
      corrected: "click #next-page",
      reason: "The target changed.",
      now: now - 10_000,
    });
    expect(edited.source).toBe("edited");
    expect(() =>
      editedcorrectionof({
        origin: "https://example.com",
        kind: "click",
        stepid: "s2",
        original: "same",
        corrected: "same",
        reason: "r",
        now,
      }),
    ).toThrow(/changed/);
    const rejected = rejectedcorrectionof({
      origin: "https://example.com",
      kind: "readtable",
      stepid: "s3",
      original: "readtable #t2",
      reason: "The user refused the second table.",
      now: now - 1000,
    });
    expect(rejected.corrected).toBeUndefined();
    const matches = matchingcorrections([edited, rejected], { origin: "https://example.com", kind: "readtable" });
    expect(matches).toEqual([rejected]);
    expect(expirecorrections([edited, rejected], 5000, now)).toEqual([rejected]);
  });

  it("records consent memory decisions per origin with expiry and boundary fields and keeps them advisory", () => {
    const grant = consentmemoryof({
      origin: "https://example.com",
      decision: "grant",
      boundary: "one hour the user chose",
      kinds: ["click"],
      expiresat: now + 3600_000,
      now,
    });
    const denial = consentmemoryof({
      origin: "https://example.com",
      decision: "deny",
      boundary: "the origin profile the user edits",
      kinds: ["fillcard"],
      now,
    });
    expect(grant.expiresat).toBe(now + 3600_000);
    expect(consentadvisoryverdict([grant, denial], "https://example.com", "fillcard").reason).toMatch(/prior denial/);
    expect(consentadvisoryverdict([grant], "https://example.com", "click").reason).toMatch(/never auto grants/);
    expect(consentadvisoryverdict([], "https://example.com", "click").advisory).toBe(false);
    expect(consentadvisoryverdict([grant], "https://example.com", "click").advisory).toBe(true);
  });

  it("derives session grid rows from the session stores with no new state", () => {
    const log: storedrunlog = {
      runid: "run0",
      sessionid: "sess0",
      entries: [
        {
          id: "e1",
          runid: "run0",
          kind: "step",
          summary: "The readtable step completed.",
          origin: "https://old.example",
          stepid: "s0",
          at: now - 1000,
          hash: { previous: "genesis", current: "h1", algorithm: "sha-256" },
        },
      ],
      seal: {
        runid: "run0",
        entries: 1,
        sealhash: { previous: "h1", current: "seal", algorithm: "sha-256" },
        sealedat: now - 500,
      },
      updatedat: now - 500,
    };
    const rows = sessiongridrows({
      session: {
        id: "sess1",
        tabid: 7,
        origin: "https://example.com",
        pausedat: now - 10,
        grants: ["https://example.com"],
      },
      plan,
      progress: { planid: "run1", completedsteps: ["s1"], updatedat: now },
      logs: [log],
      summaries: [
        {
          runid: "run0",
          sessionid: "sess0",
          origins: ["https://old.example"],
          kinds: ["readtable"],
          steps: [{ stepid: "s0", kind: "readtable", ok: true, summary: "done" }],
          task: "runsummary",
          provenance: "inline",
          distilledat: now - 400,
        },
      ],
      locks: [{ runid: "run1" }],
      tabsessions: [
        { tabid: 3, sessionid: "sess0", runid: "run0", origin: "https://old.example", updatedat: now - 1000 },
      ],
    });
    expect(rows).toHaveLength(2);
    const live = rows.find((row) => row.state === "live");
    const saved = rows.find((row) => row.state === "saved");
    expect(live?.runid).toBe("run1");
    expect(live?.steps).toBe(3);
    expect(live?.completed).toBe(1);
    expect(live?.lock).toBe("held");
    expect(live?.actions).toEqual(["cancelrun", "resume"]);
    expect(saved?.runid).toBe("run0");
    expect(saved?.outcome).toBe("completed");
    expect(saved?.sealhash).toBe("seal");
    expect(saved?.actions).toEqual(["reopen"]);
  });

  it("searches sessions, notes and summaries from one box with filters and matched term highlighting", () => {
    let corpus = addhistoryentry([], {
      source: "session",
      id: "sess1",
      origin: "https://example.com",
      title: "Session of https://example.com",
      text: "session started for the pricing work",
      at: now - 3000,
    });
    corpus = addhistoryentry(
      corpus,
      notehistoryentry(
        sitenoteof({
          origin: "https://example.com",
          title: "Pricing notes",
          body: "The yearly plan needs a confirmation dialog.",
          author: "user",
          now: now - 2000,
          id: "note1",
        }),
      ),
    );
    corpus = addhistoryentry(
      corpus,
      summaryhistoryentry(
        distillrunsummary({
          plan,
          outcomes: [{ stepid: "s1", ok: true, summary: "Read the pricing rows.", at: now }],
          origins: ["https://example.com"],
          sessionid: "sess1",
          provenance: "inline",
          now: now - 1000,
        }),
      ),
    );
    const query = historyqueryof({ text: "pricing yearly" });
    expect(query).toBeDefined();
    const hits = historysearch(corpus, query as { text: string });
    expect(hits).toHaveLength(3);
    expect(hits.every((hit) => hit.highlights.length > 0)).toBe(true);
    expect(highlightterms("The pricing table shows yearly plans", "pricing yearly")).toEqual(["pricing", "yearly"]);
    expect(historysearch(corpus, { text: "pricing", origin: "https://other.example" })).toHaveLength(0);
    expect(historysearch(corpus, { text: "pricing", from: now - 1500 })).toHaveLength(1);
    expect(historysearch(corpus, { text: "pricing", outcome: "completed" }).map((hit) => hit.source)).toEqual([
      "summary",
    ]);
    expect(historyqueryof({ text: "pricing", from: now, to: now - 1 })).toBeUndefined();
    expect(historyqueryof({ text: " " })).toBeUndefined();
  });

  it("classifies error causes as page, network, policy or gate and serves retry hints with the policy verdict", () => {
    expect(classifyfailure({ message: "The element never appeared.", policyrefused: false, gatewait: false })).toBe(
      "page",
    );
    expect(
      classifyfailure({ message: "The fetch failed with a network error.", policyrefused: false, gatewait: false }),
    ).toBe("network");
    expect(
      classifyfailure({ message: "The origin never granted the step.", policyrefused: true, gatewait: false }),
    ).toBe("policy");
    expect(
      classifyfailure({ message: "The payment waits for the confirm gate.", policyrefused: false, gatewait: true }),
    ).toBe("gate");
    const surface = errorsurfaceof({
      stepid: "s3",
      runid: "run1",
      message: "The table never loaded.",
      cause: "page",
      retryallowed: true,
      retryreason: "A new reviewed dispatch may retry the read.",
      context: { origin: "https://example.com", kind: "readtable" },
      now,
    });
    expect(retryhintof(surface).reason).toMatch(/new reviewed dispatch/);
    expect(
      retryhintof({ ...surface, retry: { allowed: false, reason: "The step exhausted its retries." } }).allowed,
    ).toBe(false);
    expect(() =>
      errorsurfaceof({
        stepid: "s3",
        runid: "run1",
        message: " ",
        cause: "page",
        retryallowed: true,
        retryreason: "r",
        context: {},
        now,
      }),
    ).toThrow(/message/);
  });

  it("cancels a run with a rollback of the queued steps only while executed steps stay untouched", () => {
    const progress = { planid: "run1", completedsteps: ["s1", "s2"], updatedat: now };
    const split = rollbacksplit(plan, progress);
    expect(split.executedstepids).toEqual(["s1", "s2"]);
    expect(split.queuedstepids).toEqual(["s3"]);
    const action = cancelrunactionof({ runid: "run1", sessionid: "sess1", plan, progress, preference: "queued" });
    expect(action.rollback.scope).toBe("queued");
    expect(action.rollback.queuedstepids).toEqual(["s3"]);
    expect(action.rollback.label).toMatch(/sealed log/);
    const none = rollbackof(plan, progress, "none");
    expect(none.scope).toBe("none");
    expect(none.label).toMatch(/without a rollback/);
    const gate = cancelrungate({
      queuedstepids: action.rollback.queuedstepids,
      executedstepids: split.executedstepids,
      rollbackscope: "queued",
    });
    expect(gate.allowed).toBe(true);
    expect(gate.reason).toMatch(/stay untouched in the sealed log/);
  });

  it("isolates session state per tab so parallel tabs never collide", () => {
    expect(tabsessionkey(12)).toBe("tabsession:12");
    const ref = tabsessionrefof({ tabid: 12, sessionid: "sessA", runid: "runA", origin: "https://a.example", now });
    expect(ref.runid).toBe("runA");
    expect(() => tabsessionrefof({ tabid: -1, sessionid: "sessA", origin: "https://a.example", now })).toThrow(/tab/);
    const other = tabsessionrefof({ tabid: 13, sessionid: "sessB", origin: "https://b.example", now });
    expect(ref.sessionid).not.toBe(other.sessionid);
  });

  it("serves the empty state guidance of the four interface surfaces", () => {
    expect(emptystatemessage("sessiongrid")).toMatch(/first run/);
    expect(emptystatemessage("historysearch")).toMatch(/first query/);
    expect(emptystatemessage("sitenotes", "https://example.com")).toMatch(/for https:\/\/example.com/);
    expect(emptystatemessage("scratchpad")).toMatch(/step provenance/);
  });

  it("exports notes, summaries and corrections as one audit bundle with sealed sensitive bodies", () => {
    const note = sitenoteof({
      origin: "https://bank.example",
      title: "Login",
      body: "card number first",
      author: "user",
      sensitive: true,
      now,
    });
    const bundle = sessionbundleof({ notes: [note], summaries: [], corrections: [], exportedat: now });
    expect(bundle.kind).toBe("sessionbundle");
    expect(bundle.notes[0]?.sealedbody).toMatch(/^sealed:/);
    expect(bundle.notes[0]?.body).toBeUndefined();
  });
});

describe("session interface gates", () => {
  it("gates sitenotes reads to granted origins and writes behind explicit consent", () => {
    expect(sitenotesreadgate({ origin: "https://example.com", grants: ["https://example.com"] }).allowed).toBe(true);
    expect(sitenotesreadgate({ origin: "https://other.example", grants: ["https://example.com"] }).reason).toMatch(
      /never granted/,
    );
    expect(sitenoteswritegate({ consent: false, origin: "https://example.com" }).allowed).toBe(false);
    expect(sitenoteswritegate({ consent: true, origin: "https://example.com" }).reason).toMatch(/author provenance/);
  });

  it("scopes scratchpad access to the owning task session and memory reads to planning and prompting", () => {
    expect(
      scratchpadscopegate({ taskid: "run1", sessionid: "sess1", entrytaskid: "run1", entrysessionid: "sess1" }).allowed,
    ).toBe(true);
    expect(
      scratchpadscopegate({ taskid: "run2", sessionid: "sess1", entrytaskid: "run1", entrysessionid: "sess1" }).reason,
    ).toMatch(/never crosses/);
    expect(memoryreadscopegate({ phase: "planning" }).allowed).toBe(true);
    expect(memoryreadscopegate({ phase: "prompting" }).allowed).toBe(true);
    expect(memoryreadscopegate({ phase: "execution" }).allowed).toBe(false);
    expect(memoryreadscopegate({ phase: "idle" }).reason).toMatch(/planning and the prompting alone/);
  });

  it("refuses semantic recall across origins outside the run scope", () => {
    expect(semanticrecallscopegate({ origin: undefined, scope: ["https://example.com"] }).allowed).toBe(true);
    expect(semanticrecallscopegate({ origin: "https://example.com", scope: ["https://example.com"] }).allowed).toBe(
      true,
    );
    expect(semanticrecallscopegate({ origin: "https://other.example", scope: ["https://example.com"] }).reason).toMatch(
      /outside the run scope/,
    );
  });

  it("validates the summary window and the retention windows as user choices with no engine cap", () => {
    expect(summarywindowvalid(undefined).reason).toMatch(/no fixed cap/);
    expect(summarywindowvalid(5).allowed).toBe(true);
    expect(summarywindowvalid(-1).allowed).toBe(false);
    expect(summarywindowvalid(1.5).allowed).toBe(false);
    expect(sessionretentionvalid(undefined).allowed).toBe(true);
    expect(sessionretentionvalid(1000).allowed).toBe(true);
    expect(sessionretentionvalid(0).reason).toMatch(/positive user value/);
  });

  it("keeps consent memory advisory with denials carrying the same weight as grants", () => {
    expect(
      consentmemoryadvisorygate({ auto: true, latest: { decision: "grant", origin: "https://example.com" } }).allowed,
    ).toBe(false);
    expect(
      consentmemoryadvisorygate({ auto: false, latest: { decision: "deny", origin: "https://example.com" } }).reason,
    ).toMatch(/same weight/);
    expect(consentmemoryadvisorygate({ auto: false }).reason).toMatch(/advisory/);
  });

  it("lets a retry pass only through a new reviewed dispatch", () => {
    expect(retrydispatchgate({ reviewed: false, stepid: "s3" }).allowed).toBe(false);
    expect(retrydispatchgate({ reviewed: true, stepid: "s3" }).reason).toMatch(/full consent gate chain/);
  });
});

describe("session interface memory accessors", () => {
  it("stores site notes with read, write, list and expiry per origin", async () => {
    const store = new sessionmemory(new fakeadapter());
    const note = sitenoteof({
      origin: "https://example.com",
      title: "Pricing",
      body: "Table under #pricing.",
      author: "user",
      now,
    });
    await store.writesitenote(note);
    await store.writesitenote(editnoteof(note, "Pricing", "Table under #pricing-table.", "user", now + 1));
    expect((await store.readsitenotes("https://example.com"))[0]?.title).toBe("Pricing");
    expect(await store.getsitenotes()).toHaveLength(1);
    await store.writesitenote(
      sitenoteof({ origin: "https://old.example", title: "Old", body: "old", author: "user", now: now - 10_000 }),
    );
    expect(await store.expiresitenotes(5000, now)).toHaveLength(1);
    await store.removesitenote(note.id);
    expect(await store.getsitenotes()).toHaveLength(0);
  });

  it("appends and reads the scratchpad per task and prunes at the user window", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.appendscratchentry(
      scratchentryof({ taskid: "run1", sessionid: "sess1", text: "first", author: "agent", now }),
    );
    await store.appendscratchentry(
      scratchentryof({ taskid: "run1", sessionid: "sess1", text: "second", author: "agent", now: now + 1 }),
    );
    await store.appendscratchentry(
      scratchentryof({ taskid: "run2", sessionid: "sess1", text: "other task", author: "agent", now }),
    );
    expect(await store.readscratchpad("run1", "sess1")).toHaveLength(2);
    expect(await store.prunescratchentries(5000, now + 10_000)).toHaveLength(0);
  });

  it("stores run summaries per run and lists them per origin", async () => {
    const store = new sessionmemory(new fakeadapter());
    const summary = distillrunsummary({
      plan,
      outcomes: [{ stepid: "s1", ok: true, summary: "Read 12 rows.", at: now }],
      origins: ["https://example.com"],
      sessionid: "sess1",
      provenance: "offscreenworker",
      now,
    });
    await store.setrunsummary(summary);
    await store.trackrunsummary(summary.runid);
    expect(await store.listrunsummaries("https://example.com")).toHaveLength(1);
    expect((await store.getrunsummary("run1"))?.provenance).toBe("offscreenworker");
    expect(await store.getrunsummary("missing")).toBeUndefined();
    expect(await store.expirerunsummaries(5000, now + 10_000)).toHaveLength(0);
    expect((await store.getrunsummary("run1"))?.steps).toEqual([]);
  });

  it("answers semantic recall queries across the extraction store with deduplication and expiry", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addrecallentry(
      recallentryof({
        origin: "https://example.com",
        runid: "run1",
        stepid: "s1",
        text: "pricing table plans",
        at: now,
      }),
    );
    await store.addrecallentry(
      recallentryof({
        origin: "https://example.com",
        runid: "run1",
        stepid: "s1",
        text: "pricing table plans",
        at: now + 1,
      }),
    );
    expect(await store.getrecallindex()).toHaveLength(1);
    const matches = await store.semanticrecall({ text: "pricing" }, { origins: ["https://example.com"] }, rankrecall);
    expect(matches[0]?.entry.stepid).toBe("s1");
    expect(await store.expirerecallentries(5000, now + 10_000)).toHaveLength(0);
  });

  it("records and queries correction memory and consent memory per origin", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addcorrection(
      rejectedcorrectionof({
        origin: "https://example.com",
        kind: "readtable",
        stepid: "s3",
        original: "readtable #t2",
        reason: "Refused.",
        now,
      }),
    );
    await store.addcorrection(
      editedcorrectionof({
        origin: "https://shop.example",
        kind: "click",
        stepid: "s2",
        original: "click #a",
        corrected: "click #b",
        reason: "Target moved.",
        now,
      }),
    );
    expect(await store.getcorrections({ origin: "https://example.com" })).toHaveLength(1);
    expect(await store.getcorrections({ kind: "click" })).toHaveLength(1);
    expect(await store.expirecorrectionentries(5000, now + 10_000)).toHaveLength(0);
    await store.addconsentmemoryentry(
      consentmemoryof({
        origin: "https://example.com",
        decision: "grant",
        boundary: "one hour",
        kinds: ["click"],
        expiresat: now + 3600_000,
        now,
      }),
    );
    await store.addconsentmemoryentry(
      consentmemoryof({
        origin: "https://example.com",
        decision: "deny",
        boundary: "profile edit",
        kinds: ["fillcard"],
        now,
      }),
    );
    expect(await store.getconsentmemory("https://example.com")).toHaveLength(2);
    expect(await store.getconsentmemory()).toHaveLength(2);
  });

  it("records error surfaces per failed step with their retry hints", async () => {
    const store = new sessionmemory(new fakeadapter());
    const surface = errorsurfaceof({
      stepid: "s3",
      runid: "run1",
      message: "The table never loaded.",
      cause: "page",
      retryallowed: true,
      retryreason: "A new reviewed dispatch may retry.",
      context: { kind: "readtable" },
      now,
    });
    await store.adderrorsurface(surface);
    expect(await store.geterrorsurfaces("s3")).toHaveLength(1);
    expect((await store.geterrorsurfaces())[0]?.retry.allowed).toBe(true);
  });

  it("builds the history index incrementally and answers one search across the corpus", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addhistoryentry({
      source: "note",
      id: "n1",
      origin: "https://example.com",
      title: "Pricing notes",
      text: "yearly plan details",
      at: now,
    });
    await store.addhistoryentry({
      source: "note",
      id: "n1",
      origin: "https://example.com",
      title: "Pricing notes edited",
      text: "yearly plan details",
      at: now + 1,
    });
    expect(await store.gethistoryindex()).toHaveLength(1);
    const hits = await store.historysearch({ text: "yearly" }, historysearch);
    expect(hits[0]?.title).toBe("Pricing notes edited");
  });

  it("isolates per tab session references and lists them for the session grid", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.settabsession(
      tabsessionrefof({ tabid: 1, sessionid: "sessA", runid: "runA", origin: "https://a.example", now }),
    );
    await store.settabsession(tabsessionrefof({ tabid: 2, sessionid: "sessB", origin: "https://b.example", now }));
    await store.tracktabsession(1);
    await store.tracktabsession(2);
    await store.tracktabsession(1);
    const refs = await store.listtabsessions();
    expect(refs).toHaveLength(2);
    expect((await store.gettabsession(1))?.runid).toBe("runA");
    expect(await store.gettabsession(9)).toBeUndefined();
  });

  it("exports notes, summaries and corrections as one audit bundle", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.writesitenote(
      sitenoteof({
        origin: "https://example.com",
        title: "Pricing",
        body: "Table under #pricing.",
        author: "user",
        now,
      }),
    );
    await store.addcorrection(
      rejectedcorrectionof({
        origin: "https://example.com",
        kind: "click",
        stepid: "s1",
        original: "click #a",
        reason: "Refused.",
        now,
      }),
    );
    const bundle = await store.exportsessionbundle(now);
    expect(bundle.kind).toBe("sessionbundle");
    expect(bundle.notes).toHaveLength(1);
    expect(bundle.corrections).toHaveLength(1);
  });
});

/** Local helper mirroring the panel note edit for the accessor test. */
function editnoteof(
  note: ReturnType<typeof sitenoteof>,
  title: string,
  body: string,
  author: string,
  at: number,
): ReturnType<typeof sitenoteof> {
  return note.sensitive
    ? { ...note, title, sealedbody: sealnotebody(note.id, body), updatedat: at, author }
    : { ...note, title, body, updatedat: at, author };
}
