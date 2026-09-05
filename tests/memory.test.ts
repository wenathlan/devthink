import { describe, expect, it } from "vitest";
import { sessionmemory } from "../memory.js";
import type { bodyrecord, callrecord, costbudget, lessonrecord, plandraft, prompttemplate, providerconfig, reflectnote, replanrecord, usagerecord } from "../types.js";

class fakeadapter {
  private readonly data = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | undefined> { return this.data.get(key) as T | undefined; }
  async set<T>(key: string, value: T): Promise<void> { this.data.set(key, value); }
}

describe("sessionmemory", () => {
  it("keeps an ordered audit trail with unlimited default retention", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addaudi({ id: "one", kind: "observe", at: 1, summary: "first" });
    await store.addaudi({ id: "two", kind: "stop", at: 2, summary: "second" });
    expect((await store.getaudit()).map(event => event.id)).toEqual(["two", "one"]);
  });

  it("applies the user configured audit retention window", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setsettings({ auditretention: 2 });
    for (const id of ["one", "two", "three"]) await store.addaudi({ id, kind: "observe", at: 1, summary: id });
    expect((await store.getaudit()).map(event => event.id)).toEqual(["three", "two"]);
  });

  it("keeps one structured diagnostics record", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setdiagnostic({ id: "health", sessionid: "session", origin: "https://example.com", capturedat: 1, tabid: 2, title: "Example", textlength: 34, interactivecount: 5, formcount: 1, bridgeavailable: true });
    expect((await store.getdiagnostic())?.bridgeavailable).toBe(true);
  });

  it("stores step outcomes with unlimited default retention", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addoutcome({ stepid: "one", ok: true, summary: "Done.", details: { count: 1 }, at: 1 });
    await store.addoutcome({ stepid: "two", ok: false, summary: "Failed.", at: 2 });
    const outcomes = await store.getoutcomes();
    expect(outcomes.map(outcome => outcome.stepid)).toEqual(["two", "one"]);
    expect(outcomes[1]?.details?.count).toBe(1);
  });

  it("stores the negotiated capability report", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setcapabilities({ tabs: true, downloads: false, clipboardread: false, clipboardwrite: false, reportedat: 7 });
    expect((await store.getcapabilities())?.tabs).toBe(true);
  });

  it("stores every clickable map under its observation version", async () => {
    const store = new sessionmemory(new fakeadapter());
    expect(await store.getobservationversion()).toBeUndefined();
    const first = await store.nextobservationversion();
    const second = await store.nextobservationversion();
    expect(first).toBe(1);
    expect(second).toBe(2);
    expect(await store.getobservationversion()).toBe(2);
    await store.setmap({ version: first, builtat: 10, entries: [{ number: 1, selector: "#go", role: "button", label: "Go", mode: "selector" }] });
    await store.setmap({ version: second, builtat: 20, entries: [
      { number: 1, selector: "#go", role: "button", label: "Go", mode: "selector" },
      { number: 2, selector: "a:nth-of-type(1)", role: "link", label: "Home", mode: "selector" },
    ] });
    expect((await store.getmap(first))?.entries).toHaveLength(1);
    expect((await store.getmap(second))?.entries[1]).toMatchObject({ number: 2, selector: "a:nth-of-type(1)", role: "link", label: "Home" });
    expect(await store.getmap(404)).toBeUndefined();
  });

  it("keeps the key hold registry with tab and step provenance across writes", async () => {
    const store = new sessionmemory(new fakeadapter());
    expect(await store.getholds()).toEqual([]);
    await store.setholds([
      { holdid: "shift1", key: "Shift", modifiers: ["shift"], tabid: 4, stepid: "s1", pressedat: 100 },
      { holdid: "ctrl1", key: "Control", tabid: 4, stepid: "s2", pressedat: 200, releasedat: 260 },
    ]);
    const holds = await store.getholds();
    expect(holds).toHaveLength(2);
    expect(holds[0]).toMatchObject({ holdid: "shift1", key: "Shift", tabid: 4, stepid: "s1", pressedat: 100 });
    expect(holds[1]?.releasedat).toBe(260);
  });

  it("records dialog decisions with the reviewed answer for the audit trail", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.adddialog({ id: "d1", dialog: "confirm", text: "Leave the page?", accept: true, sessionid: "session", at: 10 });
    await store.adddialog({ id: "d2", dialog: "prompt", text: "Your name?", accept: true, answer: "devthink", sessionid: "session", at: 20 });
    const dialogs = await store.getdialogs();
    expect(dialogs.map(decision => decision.id)).toEqual(["d2", "d1"]);
    expect(dialogs[0]).toMatchObject({ dialog: "prompt", accept: true, answer: "devthink" });
    expect(dialogs[1]?.accept).toBe(true);
  });

  it("records retry outcomes with attempts and movement deltas", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addretry({ stepid: "wrap", attempts: 3, movement: 12.5, ok: true, at: 30 });
    await store.addretry({ stepid: "wrap", attempts: 1, movement: 0, ok: false, at: 40 });
    const retries = await store.getretries();
    expect(retries.map(outcome => outcome.attempts)).toEqual([1, 3]);
    expect(retries[1]).toMatchObject({ stepid: "wrap", movement: 12.5, ok: true });
  });

  it("records resolution summaries per target mode for later selector derivation", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addresolution({ stepid: "t1", mode: "text", selector: "#signin", label: "Sign in", at: 50 });
    await store.addresolution({ stepid: "a1", mode: "aria", selector: "#submit", label: "Submit", at: 60 });
    const resolutions = await store.getresolutions();
    expect(resolutions.map(summary => summary.mode)).toEqual(["aria", "text"]);
    expect(resolutions[1]).toMatchObject({ stepid: "t1", selector: "#signin", label: "Sign in" });
  });

  it("keeps the reviewed default dialog policy for the session auto handler", async () => {
    const store = new sessionmemory(new fakeadapter());
    expect(await store.getdialogpolicy()).toBeUndefined();
    await store.setdialogpolicy({ accept: true, answer: "devthink" });
    expect(await store.getdialogpolicy()).toEqual({ accept: true, answer: "devthink" });
    await store.setdialogpolicy({ accept: false });
    expect(await store.getdialogpolicy()).toEqual({ accept: false });
  });

  it("stores every observation version with its schema fields", async () => {
    const store = new sessionmemory(new fakeadapter());
    const version = await store.nextobservationversion();
    await store.setobservation({ version, observation: { schemaversion: 3, url: "https://example.com", title: "Example", textpreview: "text", textlength: 4, forms: [], interactive: [], capturedat: 9, mode: "passive" } });
    const record = await store.getobservation(version);
    expect(record?.version).toBe(1);
    expect(record?.observation.schemaversion).toBe(3);
    expect(record?.observation.mode).toBe("passive");
    expect(await store.getobservation(404)).toBeUndefined();
  });

  it("stores a11y trees and reader articles with the user configured retention", async () => {
    const store = new sessionmemory(new fakeadapter());
    expect(await store.geta11ytrees()).toEqual([]);
    expect(await store.getreaderarticles()).toEqual([]);
    const tree = { role: "document", name: "", states: [] as string[], childcount: 0, children: [] };
    const article = { title: "Deep observation", byline: "Ada", blocks: [{ kind: "p", text: "text", words: 1 }], words: 1, characters: 4 };
    await store.adda11ytree({ version: 1, tree, capturedat: 10 });
    await store.adda11ytree({ version: 2, tree, capturedat: 20 });
    await store.adda11ytree({ version: 3, tree, capturedat: 30 });
    await store.addreaderarticle({ version: 1, article, capturedat: 10 });
    await store.addreaderarticle({ version: 2, article, capturedat: 20 });
    expect((await store.geta11ytrees()).map(capture => capture.version)).toEqual([3, 2, 1]);
    expect((await store.getreaderarticles()).map(capture => capture.version)).toEqual([2, 1]);
    await store.setsettings({ observationretention: 1 });
    await store.adda11ytree({ version: 4, tree, capturedat: 40 });
    await store.addreaderarticle({ version: 3, article, capturedat: 40 });
    expect((await store.geta11ytrees()).map(capture => capture.version)).toEqual([4]);
    expect((await store.getreaderarticles()).map(capture => capture.version)).toEqual([3]);
  });

  it("stores mutation, focus and banner event streams per session", async () => {
    const store = new sessionmemory(new fakeadapter());
    expect(await store.getmutationevents()).toEqual([]);
    expect(await store.getfocusevents()).toEqual([]);
    expect(await store.getbanners()).toEqual([]);
    await store.addmutationevent({ watchid: "w1", event: "childList", targetpath: "#feed > li", sessionid: "session", at: 100 });
    await store.addmutationevent({ watchid: "w1", event: "attributes", targetpath: "#feed", sessionid: "session", at: 110 });
    await store.addfocusevent({ watchid: "w2", kind: "focus", targetpath: "#search", sessionid: "session", at: 150 });
    await store.addfocusevent({ watchid: "w2", kind: "blur", targetpath: "#search", sessionid: "session", at: 160 });
    await store.addbanner({ kind: "cookie", selector: "#cookiebar", text: "We use cookies.", controls: ["Accept"], sessionid: "session", at: 200 });
    expect((await store.getmutationevents()).map(event => event.event)).toEqual(["attributes", "childList"]);
    expect((await store.getfocusevents()).map(event => event.kind)).toEqual(["blur", "focus"]);
    expect((await store.getbanners())[0]).toMatchObject({ kind: "cookie", controls: ["Accept"], sessionid: "session" });
  });

  it("stores snapshot diffs with their two observation versions and derived selectors with stability scores", async () => {
    const store = new sessionmemory(new fakeadapter());
    expect(await store.getdiffs()).toEqual([]);
    expect(await store.getselectors()).toEqual([]);
    await store.adddiff({ baseversion: 2, targetversion: 5, added: [{ kind: "added", selector: "#new", summary: "New" }], removed: [], changed: [{ kind: "changed", selector: "#go", summary: "Go became Stop" }], at: 42 });
    await store.addselector({ stepid: "s1", selector: "#checkout", strategy: "id", score: 100, at: 50 });
    await store.addselector({ stepid: "s2", selector: 'button[data-testid="checkout"]', strategy: "attribute", score: 80, at: 60 });
    const diffs = await store.getdiffs();
    expect(diffs[0]).toMatchObject({ baseversion: 2, targetversion: 5 });
    expect(diffs[0]?.added).toHaveLength(1);
    expect(diffs[0]?.changed).toHaveLength(1);
    const selectors = await store.getselectors();
    expect(selectors.map(record => record.score)).toEqual([80, 100]);
    expect(selectors[1]).toMatchObject({ stepid: "s1", selector: "#checkout", strategy: "id", score: 100 });
  });

  it("stores detected templates and section fingerprints per origin", async () => {
    const store = new sessionmemory(new fakeadapter());
    expect(await store.gettemplates()).toEqual([]);
    await store.addtemplate({ origin: "https://example.com", template: "article", fingerprint: "fp1a", at: 10 });
    await store.addtemplate({ origin: "https://example.com", template: "", fingerprint: "fp2b", section: "#prices", at: 20 });
    const templates = await store.gettemplates();
    expect(templates[0]).toMatchObject({ fingerprint: "fp2b", section: "#prices" });
    expect(templates[1]).toMatchObject({ template: "article", fingerprint: "fp1a" });
  });

  it("keeps watch registrations across restarts and closes them by watch id", async () => {
    const store = new sessionmemory(new fakeadapter());
    expect(await store.getwatches()).toEqual([]);
    const watch = { watchid: "w1", kind: "watchmutate" as const, stepid: "s1", sessionid: "session", origin: "https://example.com", scopes: ["#feed"], events: ["childList"], startedat: 1000, lifetime: 2500 };
    await store.addwatch(watch);
    await store.addwatch({ ...watch, watchid: "w2", kind: "watchfocus", lifetime: 60000 });
    await store.closewatch("w1", 3600);
    const watches = await store.getwatches();
    expect(watches.map(registration => registration.watchid)).toEqual(["w2", "w1"]);
    expect(watches[1]?.closedat).toBe(3600);
    expect(watches[0]?.closedat).toBeUndefined();
    await store.closewatch("w1", 9999);
    expect((await store.getwatches())[1]?.closedat).toBe(3600);
    await store.closewatch("w2", 9999);
    expect((await store.getwatches())[0]?.closedat).toBe(9999);
  });

  it("replaces the live page signals after observation steps", async () => {
    const store = new sessionmemory(new fakeadapter());
    expect(await store.getsignals()).toBeUndefined();
    await store.setsignals({ language: "pt-BR", template: "article", refreshedat: 10 });
    expect(await store.getsignals()).toEqual({ language: "pt-BR", template: "article", refreshedat: 10 });
    await store.setsignals({ language: "pt-BR", template: "article", scrolllocked: true, banner: "cookie", refreshedat: 20 });
    expect(await store.getsignals()).toMatchObject({ scrolllocked: true, banner: "cookie", refreshedat: 20 });
  });

  it("keeps the navigation trail of a session with timestamps and step refs", async () => {
    const store = new sessionmemory(new fakeadapter());
    expect(await store.gettrail("session")).toEqual([]);
    await store.addtrailentry("session", { url: "https://example.com/", title: "Home", stepid: "s1", at: 10 });
    await store.addtrailentry("session", { url: "https://example.com/pricing", title: "Pricing", stepid: "s2", at: 20 });
    await store.addtrailentry("other", { url: "https://other.example/", title: "Other", at: 30 });
    const trail = await store.gettrail("session");
    expect(trail).toHaveLength(2);
    expect(trail[1]).toMatchObject({ url: "https://example.com/pricing", title: "Pricing", stepid: "s2", at: 20 });
    expect(await store.gettrail("other")).toHaveLength(1);
  });

  it("stores wait profiles per origin with user configured values", async () => {
    const store = new sessionmemory(new fakeadapter());
    expect(await store.getwaitprofiles()).toEqual([]);
    await store.setwaitprofile({ origin: "https://example.com", profile: { signals: ["load"], idle: 400 }, at: 10 });
    await store.setwaitprofile({ origin: "https://example.com", profile: { signals: ["load", "networkidle"], idle: 900, timeout: 8000 }, at: 20 });
    await store.setwaitprofile({ origin: "https://slow.example", profile: { signals: ["load"], idle: 2000 }, at: 30 });
    const profiles = await store.getwaitprofiles();
    expect(profiles).toHaveLength(2);
    expect(profiles.find(record => record.origin === "https://example.com")?.profile).toMatchObject({ idle: 900, timeout: 8000 });
    expect(profiles.find(record => record.origin === "https://slow.example")?.profile.signals).toEqual(["load"]);
  });

  it("stores redirect chains and final urls per navigation step", async () => {
    const store = new sessionmemory(new fakeadapter());
    expect(await store.getnavrecords()).toEqual([]);
    const chain = { hops: [{ url: "https://example.com/a", status: 302, at: 10 }, { url: "https://example.com/b", status: 200, at: 25 }], startedat: 10, endedat: 25 };
    await store.addnavrecord({ stepid: "s1", sessionid: "session", origin: "https://example.com", finalurl: "https://example.com/b", chain, at: 30 });
    const records = await store.getnavrecords();
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ stepid: "s1", finalurl: "https://example.com/b" });
    expect(records[0]?.chain.hops[0]).toMatchObject({ status: 302, at: 10 });
    await store.setnavstate(4, records[0]!);
    expect((await store.getnavstate(4))?.stepid).toBe("s1");
  });

  it("stores navintent records, rate limit windows, curated lists and safety verdicts", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addnavintent({ id: "i1", intent: "open the pricing page", origin: "https://example.com", sessionid: "session", stepid: "s1", at: 10 });
    expect((await store.getnavintents())[0]).toMatchObject({ intent: "open the pricing page", origin: "https://example.com" });
    await store.setratestate({ domain: "example.com", limit: { domain: "example.com", window: 60000, ceiling: 3 }, openedat: 100, count: 1 });
    await store.setratestate({ domain: "example.com", limit: { domain: "example.com", window: 60000, ceiling: 5 }, openedat: 200, count: 0 });
    await store.setratestate({ domain: "other.example", limit: { domain: "other.example", window: 30000, ceiling: 2 }, openedat: 300, count: 0 });
    const rates = await store.getratestates();
    expect(rates).toHaveLength(2);
    expect(rates.find(state => state.domain === "example.com")).toMatchObject({ count: 0, openedat: 200 });
    await store.addcurated({ id: "c1", links: [{ url: "https://example.com/a", verdict: "safe", reasons: [] }, { url: "http://bad.example", verdict: "unsafe", reasons: ["the url must use HTTPS"] }], at: 10 });
    const curated = await store.getcurateds();
    expect(curated[0]?.links[1]).toMatchObject({ verdict: "unsafe" });
    await store.addcurated({ ...curated[0]!, reviewedat: 20 });
    expect((await store.getcurateds())[0]?.reviewedat).toBe(20);
    await store.addsafety({ url: "https://partner.example", safe: true, reasons: [], at: 40 });
    expect((await store.getsafeties())[0]).toMatchObject({ url: "https://partner.example", safe: true });
  });

  it("stores reviewed auth records, artifacts, nav control, recent tabs and queue counts", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setauth({ origin: "https://example.com", username: "devthink", password: "secret", reviewedat: 10 });
    await store.setauth({ origin: "https://example.com", username: "reviewed", password: "changed", reviewedat: 20 });
    await store.setauth({ origin: "https://other.example", username: "other", password: "pass", reviewedat: 30 });
    const auths = await store.getauths();
    expect(auths).toHaveLength(2);
    expect(auths.find(record => record.origin === "https://example.com")?.username).toBe("reviewed");
    await store.addartifact({ id: "a1", kind: "printpdf", name: "report.pdf", stepid: "s1", at: 40 });
    expect((await store.getartifacts())[0]).toMatchObject({ kind: "printpdf", name: "report.pdf" });
    expect(await store.getnavcontrol()).toBeUndefined();
    await store.setnavcontrol({ pausedat: 50, reason: "a consent banner is open", updatedat: 50 });
    expect(await store.getnavcontrol()).toMatchObject({ pausedat: 50 });
    await store.setnavcontrol({ updatedat: 60 });
    expect((await store.getnavcontrol())?.pausedat).toBeUndefined();
    await store.addrecenttab({ url: "https://example.com/closed", tabid: 4, closedat: 70 });
    expect((await store.getrecenttabs())[0]).toMatchObject({ url: "https://example.com/closed", tabid: 4 });
    await store.setnavqueues({ prefetch: 2, batchopen: 1, updatedat: 80 });
    expect(await store.getnavqueues()).toMatchObject({ prefetch: 2, batchopen: 1 });
  });
});

describe("sessionmemory tabs and windows command", () => {
  it("stores named tab layouts with their timestamps and window bounds", async () => {
    const store = new sessionmemory(new fakeadapter());
    const layout = { name: "work", tabs: [{ url: "https://example.com/a", title: "A", pinned: true, index: 0, windowid: 10 }], groups: [], windows: [{ windowid: 10, state: { bounds: { left: 0, top: 0, width: 1280, height: 800 }, maximized: false, profile: "normal" as const } }], savedat: 10 };
    await store.setlayout(layout);
    await store.setlayout({ ...layout, savedat: 20 });
    await store.setlayout({ ...layout, name: "research", savedat: 30 });
    expect((await store.getlayout("work"))?.savedat).toBe(20);
    expect((await store.getlayouts()).map(item => item.name)).toEqual(["research", "work"]);
    expect(await store.getlayout("missing")).toBeUndefined();
  });

  it("stores tabgroup definitions with their color choices and member tabs", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.settabgroup({ groupid: "g1", name: "research", color: "blue", tabids: [4, 5], collapsed: false, savedat: 10 });
    await store.settabgroup({ groupid: "g2", name: "research", color: "pink", tabids: [4], collapsed: true, savedat: 20 });
    await store.settabgroup({ groupid: "g3", name: "docs", color: "grey", tabids: [6], collapsed: false, savedat: 30 });
    const groups = await store.gettabgroups();
    expect(groups).toHaveLength(2);
    expect(groups.find(group => group.name === "research")).toMatchObject({ color: "pink", collapsed: true, tabids: [4] });
    expect(groups.find(group => group.name === "docs")?.tabids).toEqual([6]);
  });

  it("stores tabmeta records with task provenance per tab", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.settabmeta({ tabid: 4, taskrefs: ["plan-1"], provenance: "plan step", labels: ["research"], at: 10 });
    await store.settabmeta({ tabid: 4, taskrefs: ["plan-2"], provenance: "user review", labels: ["final"], at: 20 });
    await store.settabmeta({ tabid: 5, taskrefs: [], provenance: "plan step", labels: [], at: 30 });
    const metas = await store.gettabmetas();
    expect(metas).toHaveLength(2);
    expect(metas.find(meta => meta.tabid === 4)).toMatchObject({ taskrefs: ["plan-2"], labels: ["final"], provenance: "user review" });
  });

  it("stores session snapshots and the closed tab history for later restore", async () => {
    const store = new sessionmemory(new fakeadapter());
    const layout = { name: "run", tabs: [{ url: "https://example.com/a", title: "A", pinned: false, index: 0, windowid: 10 }], groups: [], windows: [], savedat: 10 };
    await store.addsnapshot({ id: "s1", sessionid: "run-1", layout, capturedat: 10 });
    await store.addsnapshot({ id: "s2", sessionid: "run-2", layout, capturedat: 20 });
    const snapshots = await store.getsnapshots();
    expect(snapshots.map(snapshot => snapshot.id)).toEqual(["s2", "s1"]);
    expect(snapshots[1]).toMatchObject({ sessionid: "run-1", capturedat: 10 });
    await store.addclosedtab({ url: "https://example.com/older", title: "Older", tabid: 8, windowid: 10, closedat: 25 });
    await store.addclosedtab({ url: "https://example.com/closed", title: "Closed", tabid: 7, windowid: 10, closedat: 30 });
    expect((await store.getclosedtabs())[0]).toMatchObject({ url: "https://example.com/closed", tabid: 7 });
    expect((await store.getclosedtabs())[1]?.url).toBe("https://example.com/older");
  });

  it("stores badge states per task and the watchtab event stream", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setbadge({ tabid: 4, taskid: "plan", label: "2/5", setat: 10 });
    await store.setbadge({ tabid: 5, taskid: "plan", label: "done", setat: 20 });
    await store.setbadge({ tabid: 4, taskid: "plan", label: "done", setat: 30 });
    const badges = await store.getbadges();
    expect(badges).toHaveLength(1);
    expect(badges[0]).toMatchObject({ tabid: 4, taskid: "plan", label: "done" });
    await store.addtabwatchevent({ watchid: "w1", event: "title", tabid: 4, detail: "New title", at: 40 });
    await store.addtabwatchevent({ watchid: "w1", event: "closed", tabid: 5, at: 41 });
    const events = await store.gettabwatchevents();
    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({ watchid: "w1", event: "closed", tabid: 5 });
  });

  it("stores scratch window ids and the pinned control tab state", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setscratchwindows([11]);
    await store.setscratchwindows([11, 12]);
    expect(await store.getscratchwindows()).toEqual([11, 12]);
    await store.setcontroltab({ tabid: 9, enabled: true, updatedat: 10 });
    expect(await store.getcontroltab()).toMatchObject({ tabid: 9, enabled: true });
    await store.setcontroltab({ tabid: 0, enabled: false, updatedat: 20 });
    expect((await store.getcontroltab())?.enabled).toBe(false);
  });

  it("stores form profiles with origin grants, replaces them by name and removes them", async () => {
    const store = new sessionmemory(new fakeadapter());
    const profile = { name: "personal", fields: [{ match: { mode: "label" as const, label: "Full name" }, kind: "text" as const, value: "Ana Alves" }], grants: ["https://example.com"], savedat: 10 };
    await store.setprofile(profile);
    await store.setprofile({ ...profile, name: "work", savedat: 20 });
    expect(await store.getprofile("work")).toMatchObject({ name: "work", savedat: 20 });
    expect((await store.getprofiles()).map(item => item.name)).toEqual(["work", "personal"]);
    await store.setprofile({ ...profile, fields: [...profile.fields, { match: { mode: "name" as const, name: "email" }, kind: "email" as const, value: "a@b.c" }], savedat: 30 });
    expect(await store.getprofiles()).toHaveLength(2);
    expect((await store.getprofile("personal"))?.fields).toHaveLength(2);
    await store.removeprofile("personal");
    expect(await store.getprofile("personal")).toBeUndefined();
    expect((await store.getprofiles()).map(item => item.name)).toEqual(["work"]);
  });

  it("stores wizard states, submission tickets, error reports, picks, captcha handoffs, detections and the reviewed code", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addwizard({ index: 1, steps: 3, completed: [true], at: 1 });
    await store.addwizard({ index: 2, steps: 3, completed: [true, true], at: 2 });
    expect((await store.getwizards())[0]).toMatchObject({ index: 2, steps: 3 });
    await store.setticket({ id: "t1", form: "#checkout", valueshash: "abc", consentref: "ask", at: 3 });
    await store.setticket({ id: "t1", form: "#checkout", valueshash: "abc", consentref: "ask", approved: true, at: 3 });
    expect(await store.gettickets()).toHaveLength(1);
    expect((await store.gettickets())[0]?.approved).toBe(true);
    await store.adderrorreport({ form: "#checkout", errors: [{ field: "#email", message: "Invalid email." }], at: 4 });
    expect((await store.geterrorreports())[0]?.errors).toHaveLength(1);
    await store.addpick({ field: "#city", query: "sao", pick: "São Paulo", at: 5 });
    expect((await store.getpicks())[0]?.pick).toBe("São Paulo");
    await store.addcaptcha({ id: "c1", origin: "https://example.com", resolved: false, openedat: 6 });
    await store.resolvecaptcha("c1", 7);
    expect((await store.getcaptchas())[0]).toMatchObject({ resolved: true, resolvedat: 7 });
    await store.adddetection({ origin: "https://example.com", kind: "login", markers: ["password field"], at: 8 });
    expect((await store.getdetections())[0]?.kind).toBe("login");
    await store.setcodevalue("123456");
    expect(await store.getcodevalue()).toBe("123456");
  });

  it("stores datasets, imports, extract sessions, streams, provenance, task rules and sheet endpoints", async () => {
    const store = new sessionmemory(new fakeadapter());
    const columns = [{ key: "sku", label: "Sku", kind: "text" as const, normalized: "sku" }];
    const rows = [{ sku: "a" }, { sku: "b" }];
    await store.setdataset({ id: "d2", name: "second", columns, rows, sources: [], at: 2 });
    await store.setdataset({ id: "d1", name: "catalog", columns, rows, sources: [{ row: 0, url: "https://example.com", at: 1, stepid: "s1" }], at: 3 });
    expect((await store.getdataset("d1"))?.name).toBe("catalog");
    expect((await store.getdatasets()).map(item => item.id)).toEqual(["d1", "d2"]);
    await store.addimport({ id: "i1", name: "leads", columns, rows, sources: [], at: 4 });
    expect((await store.getimports()).map(item => item.id)).toEqual(["i1"]);
    expect((await store.getdataset("i1"))?.name).toBe("leads");
    await store.setextractsession({ id: "e1", datasetid: "d1", name: "catalog", target: "table", next: "a.next", planned: 3, pages: ["https://example.com/1"], rows: 10, cursor: 1, startedat: 5, updatedat: 6 });
    expect((await store.getextractsessions())[0]).toMatchObject({ id: "e1", cursor: 1, rows: 10, planned: 3 });
    await store.setstream({ datasetid: "d1", name: "catalog", chunk: 1, chunks: 3, written: 4, at: 7 });
    await store.setstream({ datasetid: "d1", name: "catalog", chunk: 2, chunks: 3, written: 8, at: 8 });
    expect((await store.getstreams())[0]).toMatchObject({ chunk: 2, written: 8 });
    await store.addprovenance({ artifact: "a1", name: "catalog.csv", url: "https://example.com", stepid: "s2", rowstart: 1, rowend: 2, checksum: "fnv1a-1", at: 9 });
    expect((await store.getprovenances())[0]).toMatchObject({ artifact: "a1", rowend: 2 });
    await store.settaskrules({ taskid: "plan-1", transforms: [{ expression: "trim", sources: ["sku"], target: "sku" }], dedupekeys: [], at: 10 });
    await store.settaskrules({ taskid: "plan-1", transforms: [{ expression: "trim", sources: ["sku"], target: "sku" }], dedupekeys: ["sku"], at: 11 });
    const rules = (await store.gettaskrules())[0]!;
    expect(rules.dedupekeys).toEqual(["sku"]);
    expect(rules.transforms).toHaveLength(1);
    await store.settaskrules({ taskid: "plan-2", transforms: [], dedupekeys: ["price"], at: 12 });
    expect(await store.gettaskrules()).toHaveLength(2);
    await store.setsheetendpoint({ endpoint: "https://sheets.example/tab", origin: "https://sheets.example", configuredat: 12 });
    expect((await store.getsheetendpoints())[0]?.origin).toBe("https://sheets.example");
  });

  it("applies artifact retention to exported artifacts and keeps everything without the setting", async () => {
    const openstore = new sessionmemory(new fakeadapter());
    await openstore.setsettings({});
    await openstore.addexport({ id: "a1", kind: "csv", name: "one.csv", stepid: "s1", rowcount: 1, content: "x", checksum: "c1", at: 1 });
    await openstore.addexport({ id: "a2", kind: "json", name: "two.json", stepid: "s1", rowcount: 2, content: "y", checksum: "c2", at: 2 });
    expect((await openstore.getexports()).map(item => item.id)).toEqual(["a2", "a1"]);
    await openstore.addexport({ id: "a3", kind: "excel", name: "three.xml", stepid: "s1", rowcount: 3, content: "z", checksum: "c3", at: 3 });
    expect((await openstore.getexports())).toHaveLength(3);
    const bounded = new sessionmemory(new fakeadapter());
    await bounded.setsettings({ artifactretention: 2 });
    await bounded.addexport({ id: "a1", kind: "csv", name: "one.csv", stepid: "s1", rowcount: 1, content: "x", checksum: "c1", at: 1 });
    await bounded.addexport({ id: "a2", kind: "csv", name: "two.csv", stepid: "s1", rowcount: 2, content: "y", checksum: "c2", at: 2 });
    await bounded.addexport({ id: "a3", kind: "csv", name: "three.csv", stepid: "s1", rowcount: 3, content: "z", checksum: "c3", at: 3 });
    expect((await bounded.getexports()).map(item => item.id)).toEqual(["a3", "a2"]);
  });
});

describe("sessionmemory files, clipboard and downloads", () => {
  it("stores downloads, netlogs with retention, clip consents, clips and quarantines", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setdownload({ id: "d1", url: "https://example.com/a.pdf", filename: "a.pdf", state: "running", downloadid: 3, at: 1, updatedat: 1 });
    await store.setdownload({ id: "d2", url: "https://example.com/b.zip", filename: "b.zip", state: "complete", path: "/downloads/b.zip", bytes: 10, checksum: "fnv1a-1", at: 2, updatedat: 3 });
    await store.setdownload({ id: "d1", url: "https://example.com/a.pdf", filename: "a.pdf", state: "paused", downloadid: 3, at: 1, updatedat: 4 });
    expect((await store.getdownloads())[0]).toMatchObject({ id: "d1", state: "paused" });
    await store.addnetlog({ url: "https://example.com/list", method: "GET", status: 200, timing: 10, requestid: "nav-1-1", stepid: "nav-1", at: 5 });
    await store.addnetlog({ url: "https://example.com/cart", method: "GET", status: 200, timing: 20, requestid: "nav-1-2", stepid: "nav-1", at: 6 });
    expect(await store.getnetlog()).toHaveLength(2);
    await store.setclipconsent({ id: "clip-1", prompt: "Read the tracking number.", origin: "https://example.com", stepid: "s1", at: 7 });
    await store.setclipconsent({ id: "clip-1", prompt: "Read the tracking number.", origin: "https://example.com", stepid: "s1", approved: true, at: 7 });
    expect((await store.getclipconsents())[0]).toMatchObject({ id: "clip-1", approved: true });
    await store.addclip({ kind: "read", hash: "fnv1a-9", length: 16, origin: "https://example.com", stepid: "s1", at: 8 });
    expect((await store.getclips())[0]).toMatchObject({ kind: "read", hash: "fnv1a-9", length: 16 });
    await store.setquarantine({ id: "q1", path: "devthink-quarantine/x.pdf", reason: "mime matched", scan: "pending", at: 9, updatedat: 9 });
    await store.setquarantine({ id: "q1", path: "devthink-quarantine/x.pdf", reason: "mime matched", scan: "clean", release: "user-1", at: 9, updatedat: 10 });
    expect((await store.getquarantines())[0]).toMatchObject({ scan: "clean", release: "user-1" });
  });

  it("applies netlog retention and keeps every record without the setting", async () => {
    const openstore = new sessionmemory(new fakeadapter());
    await openstore.setsettings({});
    await openstore.addnetlog({ url: "https://example.com/1", method: "GET", status: 200, timing: 1, stepid: "s1", at: 1 });
    await openstore.addnetlog({ url: "https://example.com/2", method: "GET", status: 200, timing: 2, stepid: "s1", at: 2 });
    await openstore.addnetlog({ url: "https://example.com/3", method: "GET", status: 200, timing: 3, stepid: "s1", at: 3 });
    expect(await openstore.getnetlog()).toHaveLength(3);
    const bounded = new sessionmemory(new fakeadapter());
    await bounded.setsettings({ netlogretention: 2 });
    await bounded.addnetlog({ url: "https://example.com/1", method: "GET", status: 200, timing: 1, stepid: "s1", at: 1 });
    await bounded.addnetlog({ url: "https://example.com/2", method: "GET", status: 200, timing: 2, stepid: "s1", at: 2 });
    await bounded.addnetlog({ url: "https://example.com/3", method: "GET", status: 200, timing: 3, stepid: "s1", at: 3 });
    expect((await bounded.getnetlog()).map(record => record.url)).toEqual(["https://example.com/3", "https://example.com/2"]);
  });

  it("stores cleanup rules, run history, capture counters, inventories, scan hooks and mime filters", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setcleanuprules([{ age: 60000, kind: "any", keep: "latest" }]);
    expect(await store.getcleanuprules()).toEqual([{ age: 60000, kind: "any", keep: "latest" }]);
    await store.addcleanuprun({ id: "r1", rules: 1, removed: 2, kept: 5, at: 1 });
    expect((await store.getcleanupruns())[0]).toMatchObject({ removed: 2, kept: 5 });
    await store.setcapturecounter({ taskid: "task-1", counters: { snap: 2 }, at: 2 });
    await store.setcapturecounter({ taskid: "task-1", counters: { snap: 3 }, at: 3 });
    await store.setcapturecounter({ taskid: "task-2", counters: { peek: 1 }, at: 4 });
    expect((await store.getcapturecounters()).map(counter => counter.taskid)).toEqual(["task-2", "task-1"]);
    expect((await store.getcapturecounters())[1]?.counters).toEqual({ snap: 3 });
    await store.setinventory([{ id: "a1", kind: "export-csv", name: "old.csv", size: 10, at: 5 }]);
    expect((await store.getinventory())[0]).toMatchObject({ name: "old.csv", size: 10 });
    await store.setscanhook({ scanner: "clamav", endpoint: "https://scanner.example/verdict", origin: "https://scanner.example", configuredat: 6 });
    expect((await store.getscanhooks())[0]).toMatchObject({ scanner: "clamav" });
    await store.setscanhook({ scanner: "second", endpoint: "https://other.example/v", origin: "https://other.example", configuredat: 7 });
    await store.setscanhook({ scanner: "clamav", endpoint: "https://scanner.example/v2", origin: "https://scanner.example", configuredat: 8 });
    expect(await store.getscanhooks()).toHaveLength(2);
    await store.setmimefilters([{ include: ["application/pdf*"], exclude: [], default: "deny" }]);
    expect((await store.getmimefilters())[0]?.default).toBe("deny");
  });

  it("removes exported artifacts and run store artifacts for cleanup sweeps", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addexport({ id: "a1", kind: "csv", name: "one.csv", stepid: "s1", rowcount: 1, content: "x", checksum: "c1", at: 1 });
    await store.addexport({ id: "a2", kind: "csv", name: "two.csv", stepid: "s1", rowcount: 2, content: "yy", checksum: "c2", at: 2 });
    expect(await store.removeexport("a1")).toBe(true);
    expect(await store.removeexport("missing")).toBe(false);
    expect((await store.getexports()).map(artifact => artifact.id)).toEqual(["a2"]);
    await store.addartifact({ id: "r1", kind: "printpdf", name: "receipt.pdf", stepid: "s2", at: 3 });
    expect(await store.removeartifact("r1")).toBe(true);
    expect(await store.removeartifact("r1")).toBe(false);
    expect(await store.getartifacts()).toEqual([]);
  });
});

describe("capture memory", () => {
  it("stores capture records with bytes, filters by run, step and kind, and returns pairs of one run", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addcapture({ id: "c1", runid: "run-1", stepid: "s1", kind: "shotview", format: "png", width: 1280, height: 800, capturedat: 1, bytes: "data:image/png;base64,aaa" });
    await store.addcapture({ id: "c2", runid: "run-1", stepid: "s2", kind: "shotfullpage", format: "png", width: 1280, height: 4000, capturedat: 2, bytes: "data:image/png;base64,bbb" });
    await store.addcapture({ id: "c3", runid: "run-2", stepid: "s1", kind: "shotview", format: "webp", width: 640, height: 400, capturedat: 3, bytes: "data:image/webp;base64,ccc" });
    expect((await store.getcaptures()).map(record => record.id)).toEqual(["c3", "c2", "c1"]);
    expect(await store.getcapture("c2")).toMatchObject({ kind: "shotfullpage", bytes: "data:image/png;base64,bbb" });
    expect(await store.getcapture("missing")).toBeUndefined();
    expect((await store.listcaptures({ runid: "run-1" })).map(record => record.id)).toEqual(["c2", "c1"]);
    expect((await store.listcaptures({ stepid: "s1" })).map(record => record.id)).toEqual(["c3", "c1"]);
    expect((await store.listcaptures({ runid: "run-1", kind: "shotview" })).map(record => record.id)).toEqual(["c1"]);
    expect(await store.listcaptures({})).toHaveLength(3);
    await store.addpair({ id: "p1", beforeid: "c1", afterid: "c2", actionkind: "click", target: "#submit", domsnapshotid: "7", at: 4 });
    await store.addpair({ id: "p2", beforeid: "c3", afterid: "c3", actionkind: "type", at: 5 });
    expect((await store.getpairs()).map(pair => pair.id)).toEqual(["p2", "p1"]);
    expect((await store.getpairs("run-1")).map(pair => pair.id)).toEqual(["p1"]);
    expect((await store.getpairs("run-2")).map(pair => pair.id)).toEqual(["p2"]);
  });

  it("expires capture bytes after the configured retention window while keeping the metadata", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setsettings({ captureretention: 2 });
    await store.addcapture({ id: "c1", runid: "run-1", stepid: "s1", kind: "shotview", format: "png", width: 10, height: 10, capturedat: 1, bytes: "data:1" });
    await store.addcapture({ id: "c2", runid: "run-1", stepid: "s2", kind: "shotview", format: "png", width: 10, height: 10, capturedat: 2, bytes: "data:2" });
    await store.addcapture({ id: "c3", runid: "run-1", stepid: "s3", kind: "shotview", format: "png", width: 10, height: 10, capturedat: 3, bytes: "data:3" });
    const stored = await store.getcaptures();
    expect(stored.map(record => record.id)).toEqual(["c3", "c2", "c1"]);
    expect(stored[0]).toMatchObject({ bytes: "data:3" });
    expect(stored[1]).toMatchObject({ bytes: "data:2" });
    expect(stored[2]).toMatchObject({ bytesexpired: true });
    expect(stored[2]?.bytes).toBeUndefined();
    expect((await store.listcaptures({ runid: "run-1" })).map(record => record.id)).toEqual(["c3", "c2", "c1"]);
    const unbounded = new sessionmemory(new fakeadapter());
    await unbounded.addcapture({ id: "c1", runid: "run-1", stepid: "s1", kind: "shotview", format: "png", width: 10, height: 10, capturedat: 1, bytes: "data:1" });
    await unbounded.addcapture({ id: "c2", runid: "run-1", stepid: "s2", kind: "shotview", format: "png", width: 10, height: 10, capturedat: 2, bytes: "data:2" });
    expect((await unbounded.getcaptures()).every(record => record.bytes !== undefined)).toBe(true);
  });
});

describe("media memory", () => {
  it("stores media records per run, filters by run and kind and returns recordings with their file reference", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addmedia({ id: "pdf-1", runid: "run-1", stepid: "s1", pages: 3, pagewidth: 612, pageheight: 792, margins: { top: 28.8, right: 28.8, bottom: 28.8, left: 28.8 }, landscape: false, scale: 1, bytes: 4200, at: 1, dataurl: "data:application/pdf;base64,aaa", name: "run-1-s1-1-capturepdf.pdf" });
    await store.addmedia({ id: "rec-1", runid: "run-1", stepid: "s2", tabid: 4, kind: "screen", scope: "run", format: "frames", startedat: 2, endedat: 7, duration: 5, fps: 2, frames: ["f1", "f2"], file: "run-1-s2-2-recordscreen.json", bytes: 300, at: 2 });
    await store.addmedia({ id: "frame-1", runid: "run-2", stepid: "s3", source: "video.tutorial", timestamp: 12.5, poster: true, format: "png", width: 1280, height: 720, at: 3, dataurl: "data:image/png;base64,bbb" });
    await store.addmedia({ id: "canvas-1", runid: "run-2", stepid: "s4", element: "canvas.chart", context: "webgl", width: 600, height: 400, format: "png", at: 4, dataurl: "data:image/png;base64,ccc" });
    await store.addmedia({ id: "stream-1", runid: "run-2", stepid: "s5", kind: "webrtc", tracks: 2, label: "stream-1", live: true, at: 5 });
    await store.addmedia({ id: "asset-1", runid: "run-2", stepid: "s6", kind: "favicon", url: "https://example.com/icon.png", bytes: 800, sizes: "32x32", at: 6 });
    expect((await store.getmediarecords()).map(record => record.id)).toEqual(["asset-1", "stream-1", "canvas-1", "frame-1", "rec-1", "pdf-1"]);
    expect((await store.listmedia({ runid: "run-1" })).map(record => record.id)).toEqual(["rec-1", "pdf-1"]);
    expect((await store.listmedia({ kind: "recording" })).map(record => record.id)).toEqual(["rec-1"]);
    expect((await store.listmedia({ kind: "pdf" })).map(record => record.id)).toEqual(["pdf-1"]);
    expect((await store.listmedia({ runid: "run-2", kind: "frame" })).map(record => record.id)).toEqual(["frame-1"]);
    expect(await store.listmedia({})).toHaveLength(6);
    expect(await store.getmediarecord("canvas-1")).toMatchObject({ context: "webgl" });
    expect(await store.getmediarecord("missing")).toBeUndefined();
    expect(await store.getrecording("rec-1")).toMatchObject({ kind: "screen", file: "run-1-s2-2-recordscreen.json", frames: ["f1", "f2"], duration: 5 });
    expect(await store.getrecording("pdf-1")).toBeUndefined();
    await store.removemedia("stream-1");
    expect((await store.getmediarecords()).map(record => record.id)).not.toContain("stream-1");
  });

  it("expires media bytes after the retention window while keeping the recording index and metadata", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setsettings({ mediaretention: 2 });
    await store.addmedia({ id: "pdf-1", runid: "run-1", stepid: "s1", pages: 1, pagewidth: 612, pageheight: 792, margins: { top: 28.8, right: 28.8, bottom: 28.8, left: 28.8 }, landscape: false, scale: 1, bytes: 100, at: 1, dataurl: "data:1" });
    await store.addmedia({ id: "rec-1", runid: "run-1", stepid: "s2", tabid: 4, kind: "audio", scope: "tab", format: "evidence", startedat: 2, frames: ["e1"], file: "rec.json", bytes: 50, at: 2 });
    await store.addmedia({ id: "frame-1", runid: "run-1", stepid: "s3", source: "video", timestamp: 0, poster: false, format: "png", width: 10, height: 10, at: 3, dataurl: "data:3" });
    const stored = await store.getmediarecords();
    expect(stored.map(record => record.id)).toEqual(["frame-1", "rec-1", "pdf-1"]);
    expect(stored[0]).toMatchObject({ dataurl: "data:3" });
    expect(stored[1]).toMatchObject({ bytes: 50 });
    expect(stored[2]).toMatchObject({ bytesexpired: true });
    expect((stored[2] as { dataurl?: string }).dataurl).toBeUndefined();
    await store.addmedia({ id: "frame-2", runid: "run-1", stepid: "s4", source: "video", timestamp: 1, poster: false, format: "png", width: 10, height: 10, at: 4, dataurl: "data:4" });
    const after = await store.getmediarecords();
    expect(after.map(record => record.id)).toEqual(["frame-2", "frame-1", "rec-1", "pdf-1"]);
    expect((after[2] as recordinglike).bytes).toBeUndefined();
    expect((after[2] as recordinglike).bytesexpired).toBe(true);
    expect((after[2] as recordinglike).frames).toEqual(["e1"]);
    expect((after[2] as recordinglike).file).toBe("rec.json");
    const unbounded = new sessionmemory(new fakeadapter());
    await unbounded.addmedia({ id: "pdf-1", runid: "run-1", stepid: "s1", pages: 1, pagewidth: 612, pageheight: 792, margins: { top: 1, right: 1, bottom: 1, left: 1 }, landscape: false, scale: 1, bytes: 100, at: 1, dataurl: "data:1" });
    await unbounded.addmedia({ id: "rec-1", runid: "run-1", stepid: "s2", tabid: 4, kind: "screen", scope: "tab", format: "frames", startedat: 2, bytes: 50, at: 2 });
    expect((await unbounded.getmediarecords()).every(record => (record as { bytesexpired?: boolean }).bytesexpired === undefined)).toBe(true);
  });

  it("stores image batches with match counts and recording consent decisions per origin", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addimagebatch({ id: "batch-1", runid: "run-1", stepid: "s1", images: [{ url: "https://example.com/a.png", alt: "Chart", width: 400, height: 300, bytes: 1200, mime: "image/png" }], matched: 1, downloaded: 1, at: 1 });
    await store.addimagebatch({ id: "batch-2", runid: "run-1", stepid: "s2", images: [], matched: 0, downloaded: 0, at: 2 });
    await store.addimagebatch({ id: "batch-1", runid: "run-1", stepid: "s1", images: [{ url: "https://example.com/b.png", alt: "", width: 50, height: 50, bytes: 10, mime: "image/png" }], matched: 1, downloaded: 0, at: 3 });
    expect((await store.getimagebatches()).map(batch => batch.id)).toEqual(["batch-1", "batch-2"]);
    expect((await store.getimagebatches())[0]).toMatchObject({ matched: 1, downloaded: 0, images: [{ url: "https://example.com/b.png" }] });
    await store.setrecordingconsent({ id: "consent-1", prompt: "Record the checkout flow.", origin: "https://example.com", stepid: "s3", at: 4 });
    await store.setrecordingconsent({ id: "consent-2", prompt: "Record the audio.", origin: "https://other.example", stepid: "s4", at: 5 });
    await store.setrecordingconsent({ id: "consent-1", prompt: "Record the checkout flow.", origin: "https://example.com", stepid: "s3", approved: true, at: 4 });
    const consents = await store.getrecordingconsents();
    expect(consents.map(consent => consent.id)).toEqual(["consent-1", "consent-2"]);
    expect(consents[0]).toMatchObject({ approved: true, origin: "https://example.com" });
  });
});

type recordinglike = { bytes?: number; bytesexpired?: boolean; frames?: string[]; file?: string };

describe("network observation memory", () => {
  const call = (id: string, origin: string, body?: string): callrecord => ({ id, runid: "run-1", stepid: "f1", kind: "fetch", url: `${origin}/data`, origin, method: "GET", status: 200, statusclass: "success", duration: 10, retries: 0, bytes: (body ?? "").length, headernames: ["x-request-id"], ...(body !== undefined ? { body } : {}), at: 1 });

  it("stores call records with bodies and lists them filtered by run and origin", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addcall(call("c1", "https://api.example", "{\"a\":1}"));
    await store.addcall(call("c2", "https://other.example", "{\"b\":2}"));
    await store.addcall({ ...call("c3", "https://api.example"), runid: "run-2" });
    expect((await store.getcalls()).map(record => record.id)).toEqual(["c3", "c2", "c1"]);
    expect((await store.listcalls({ runid: "run-1" })).map(record => record.id)).toEqual(["c2", "c1"]);
    expect((await store.listcalls({ origin: "https://api.example" })).map(record => record.id)).toEqual(["c3", "c1"]);
    expect((await store.listcalls({})).map(record => record.id)).toEqual(["c3", "c2", "c1"]);
    expect((await store.getcall("c2"))?.body).toBe("{\"b\":2}");
  });

  it("expires call bodies after the configured retention window while the metadata survives", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setsettings({ callretention: 2 });
    await store.addcall(call("c1", "https://api.example", "one"));
    await store.addcall(call("c2", "https://api.example", "two"));
    await store.addcall(call("c3", "https://api.example", "three"));
    const records = await store.getcalls();
    expect(records.map(record => record.id)).toEqual(["c3", "c2", "c1"]);
    expect(records[0]?.body).toBe("three");
    expect(records[1]?.body).toBe("two");
    expect(records[2]?.body).toBeUndefined();
    expect(records[2]?.bodyexpired).toBe(true);
    expect(records[2]?.statusclass).toBe("success");
  });

  it("stores endpoint definitions with version history and returns the newest schema", async () => {
    const store = new sessionmemory(new fakeadapter());
    const schema = { fields: [{ name: "owner", kind: "string" as const, required: true }] };
    await store.setendpoint({ name: "issues", method: "GET", url: "https://api.example/issues", schema, version: 1, at: 1 });
    await store.setendpoint({ name: "issues", method: "GET", url: "https://api.example/v2/issues", schema, version: 1, at: 2 });
    const newest = await store.getendpoint("issues");
    expect(newest?.url).toBe("https://api.example/v2/issues");
    expect(newest?.version).toBe(2);
    const endpoints = await store.getendpoints();
    expect(endpoints).toHaveLength(1);
    expect(endpoints[0]?.version).toBe(2);
    expect(await store.getendpoint("missing")).toBeUndefined();
  });

  it("stores fetch consents per origin and api key references without key material", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setfetchconsent({ id: "consent-1", origin: "https://api.example", headers: [{ name: "x-api-key", value: "secret" }], approved: true, expiresat: 99, at: 1 });
    const consents = await store.getfetchconsents();
    expect(consents[0]?.headers[0]).toEqual({ name: "x-api-key", value: "secret" });
    await store.setapikey({ name: "github", origins: ["https://api.example"], header: "authorization", storageid: "apikey-github", createdat: 1 });
    await store.setsecret("apikey-github", "ghp-token");
    expect((await store.getapikeys())[0]).toMatchObject({ name: "github", header: "authorization" });
    expect(await store.getsecret("apikey-github")).toBe("ghp-token");
    await store.removeapikey("github");
    expect(await store.getapikeys()).toHaveLength(0);
    expect(await store.getsecret("apikey-github")).toBeUndefined();
  });
});

describe("network observation part two memory", () => {
  it("stores channel records with message counters and stream subscriptions", async () => {
    const memory = new sessionmemory(new fakeadapter());
    const channel = { id: "ch1", runid: "run", stepid: "s1", kind: "websocket" as const, url: "wss://api.example/live", origin: "https://api.example", state: "open" as const, openedat: 1, sent: 0, received: 0, reconnects: 0 };
    await memory.addchannel(channel);
    await memory.addchannel({ ...channel, sent: 2, received: 5 });
    expect((await memory.getchannel("ch1"))?.sent).toBe(2);
    expect((await memory.getchannels())).toHaveLength(1);
    const subscription = { id: "sub1", runid: "run", stepid: "s2", url: "https://api.example/stream", origin: "https://api.example", state: "open" as const, events: 0, names: [] as string[], cancel: { kind: "stop" as const, value: "done" }, openedat: 1 };
    await memory.setsubscription(subscription);
    await memory.setsubscription({ ...subscription, events: 9, names: ["userjoin"], lasteventid: "41" });
    expect((await memory.getsubscriptions())[0]).toMatchObject({ events: 9, lasteventid: "41" });
  });

  it("queues message envelopes with sequence integrity and drains consumed matches", async () => {
    const memory = new sessionmemory(new fakeadapter());
    await memory.addmessage({ channelid: "ch1", stream: "orders", payload: "{\"id\":1}", sequence: 1, at: 1 });
    await memory.addmessage({ channelid: "ch1", stream: "orders", payload: "{\"id\":2}", sequence: 2, at: 2 });
    await memory.addmessage({ channelid: "ch1", stream: "ticks", payload: "{}", sequence: 3, at: 3 });
    expect((await memory.getmessages()).map(envelope => envelope.sequence)).toEqual([1, 2, 3]);
    expect((await memory.getmessages("ch1", "orders")).map(envelope => envelope.payload)).toEqual(["{\"id\":1}", "{\"id\":2}"]);
    await memory.addmessage({ channelid: "ch1", stream: "orders", payload: "{\"id\":1}", sequence: 1, at: 1 });
    expect(await memory.getmessages()).toHaveLength(3);
    await memory.drainmessages([{ channelid: "ch1", sequence: 1 }, { channelid: "ch1", sequence: 3 }]);
    expect((await memory.getmessages()).map(envelope => envelope.sequence)).toEqual([2]);
  });

  it("stores exchanges with correlation ids and filters by run, origin and status", async () => {
    const memory = new sessionmemory(new fakeadapter());
    const exchange = { id: "e1", runid: "run", stepid: "s1", correlationid: "run-1", url: "https://api.example/items", origin: "https://api.example", method: "GET", status: 200, statusclass: "success", source: "extension" as const, timing: 10, bytes: 20, at: 1 };
    await memory.addexchange(exchange);
    await memory.addexchange({ ...exchange, id: "e2", correlationid: "run-2", url: "https://api.example/gone", status: 0, statusclass: "unknown", errorclass: "networkerror" });
    await memory.addexchange({ ...exchange, id: "e3", correlationid: "run-3", runid: "other" });
    expect((await memory.getexchange("e2"))?.errorclass).toBe("networkerror");
    expect(await memory.listexchanges({ runid: "run" })).toHaveLength(2);
    expect(await memory.listexchanges({ runid: "run", origin: "https://api.example" })).toHaveLength(2);
    expect(await memory.listexchanges({ runid: "run", status: 200 })).toHaveLength(1);
    expect(await memory.listexchanges({ runid: "run", status: "failed" })).toHaveLength(1);
  });

  it("expires captured bodies after the configured retention window while the metadata survives", async () => {
    const memory = new sessionmemory(new fakeadapter());
    const body = (ref: string, correlationid: string): bodyrecord => ({ ref, runid: "run", correlationid, url: "https://api.example/items", mime: "application/json", bytes: 8, body: "{\"id\":1}", at: 1 });
    await memory.addbody(body("b1", "run-1"));
    await memory.addbody(body("b2", "run-2"));
    expect((await memory.getbody("b1"))?.body).toBe("{\"id\":1}");
    await memory.setsettings({ bodyretention: 2 });
    await memory.addbody(body("b3", "run-3"));
    expect((await memory.getbodies()).map(record => record.ref)).toEqual(["b3", "b2", "b1"]);
    expect((await memory.getbodies())[2]?.bodyexpired).toBe(true);
    await memory.addbody(body("b4", "run-4"));
    const stored = await memory.getbodies();
    expect(stored.map(record => record.ref)).toEqual(["b4", "b3", "b2", "b1"]);
    expect(stored[1]?.body).toBe("{\"id\":1}");
    expect(stored[1]?.bodyexpired).toBeUndefined();
    expect(stored[2]?.body).toBeUndefined();
    expect(stored[2]?.bodyexpired).toBe(true);
    expect(stored[2]?.bytes).toBe(8);
    expect(stored[2]?.mime).toBe("application/json");
    expect(stored[2]?.correlationid).toBe("run-2");
  });

  it("stores the page api map per origin", async () => {
    const memory = new sessionmemory(new fakeadapter());
    const entry = { endpoint: "https://api.example/items", method: "GET", mime: "application/json", frequency: 3, payloadshape: ["id"], jsonshare: 1, stability: 1, origin: "https://api.example", correlationids: ["run-1"] };
    await memory.setapimap("https://api.example", [entry]);
    await memory.setapimap("https://api.example", [{ ...entry, frequency: 7 }]);
    await memory.setapimap("https://other.example", [{ ...entry, origin: "https://other.example", endpoint: "https://other.example/x" }]);
    const stored = await memory.getapimap();
    expect(stored).toHaveLength(2);
    expect(stored.find(item => item.origin === "https://api.example")?.frequency).toBe(7);
  });
});

describe("network control storage", () => {
  it("stores block, mock and rewrite rule sets per run with hit counters and reverts", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addblockrule({ id: "b1", runid: "run1", stepid: "s1", urlpattern: "https://ads.example/*", hits: 2, registeredat: 1 });
    await store.addblockrule({ id: "b1", runid: "run1", stepid: "s1", urlpattern: "https://ads.example/*", hits: 3, revertedat: 9, registeredat: 1 });
    expect((await store.getblockrules())[0]).toMatchObject({ id: "b1", hits: 3, revertedat: 9 });
    await store.addmockspec({ id: "m1", runid: "run1", stepid: "s1", urlpattern: "https://api.example/status", status: 204, body: "fixture", reviewed: true, hits: 1, registeredat: 1 });
    expect((await store.getmockspecs())[0]?.body).toBe("fixture");
    await store.addheaderule({ id: "h1", runid: "run1", stepid: "s1", urlpattern: "https://api.example/*", name: "accept", operation: "set", value: "json", hits: 4, registeredat: 1 });
    expect((await store.getheaderules())[0]).toMatchObject({ operation: "set", hits: 4 });
  });

  it("stores cookie operations per domain with timestamps and no values", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addcookieop({ id: "c1", runid: "run1", stepid: "s1", kind: "write", domain: "example.com", names: ["session"], at: 1 });
    await store.addcookieop({ id: "c2", runid: "run1", stepid: "s2", kind: "clear", domain: "api.example.com", names: [], at: 2 });
    expect((await store.getcookieops()).map(op => op.kind)).toEqual(["clear", "write"]);
    expect((await store.getcookieops("example.com")).map(op => op.id)).toEqual(["c1"]);
    expect(JSON.stringify(await store.getcookieops())).not.toContain("value");
  });

  it("stores token metadata per provider without token values and lists per provider", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addtoken({ id: "t1", provider: "providerco", origin: "https://api.example", scopes: ["read"], accessstorageid: "token-t1-access", refreshstorageid: "token-t1-refresh", expiresat: 99, at: 1 });
    await store.addtoken({ id: "t2", provider: "otherco", origin: "https://other.example", scopes: ["write"], accessstorageid: "token-t2-access", expiresat: 99, at: 2 });
    expect((await store.listtokens()).map(token => token.provider)).toEqual(["otherco", "providerco"]);
    expect((await store.listtokens("providerco")).map(token => token.id)).toEqual(["t1"]);
    await store.addtoken({ id: "t1", provider: "providerco", origin: "https://api.example", scopes: ["read"], accessstorageid: "token-t1-access", refreshstorageid: "token-t1-refresh", expiresat: 99, refreshedat: 5, at: 1 });
    expect((await store.listtokens("providerco"))[0]?.refreshedat).toBe(5);
  });

  it("stores api key entries with last use timestamps and proxy route history with apply and revert times", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setapikey({ name: "k", origins: ["https://api.example"], header: "authorization", storageid: "apikey-k", createdat: 1 });
    expect((await store.getapikeys())[0]?.lastuse).toBeUndefined();
    await store.touchapikey("k", 42);
    expect((await store.getapikeys())[0]?.lastuse).toBe(42);
    await store.addproxyroute({ id: "p1", runid: "run1", stepid: "s1", scheme: "socks5", host: "proxy.example", port: 1080, bypass: ["https://api.example"], appliedat: 1 });
    await store.addproxyroute({ id: "p1", runid: "run1", stepid: "s1", scheme: "socks5", host: "proxy.example", port: 1080, bypass: ["https://api.example"], appliedat: 1, revertedat: 7 });
    expect((await store.getproxyroutes())[0]).toMatchObject({ appliedat: 1, revertedat: 7 });
  });

  it("expires rate limit states at their reset windows", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setratelimit({ origin: "https://api.example", remaining: 3, limit: 10, resetat: 100, at: 1 });
    await store.setratelimit({ origin: "https://slow.example", remaining: 0, resetat: 1000, at: 1 });
    expect((await store.getratelimits(150)).map(read => read.origin)).toEqual(["https://slow.example"]);
    expect((await store.getratelimits(2000))).toEqual([]);
  });
});

describe("run timeline storage", () => {
  it("stores timeline entries filtered by run, level and step id", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addtimelineentry({ id: "t1", runid: "run1", stepid: "s1", time: 3, level: "error", source: "error", message: "boom" });
    await store.addtimelineentry({ id: "t2", runid: "run1", stepid: "s2", time: 4, level: "info", source: "console", message: "hello" });
    await store.addtimelineentry({ id: "t3", runid: "run2", stepid: "s1", time: 5, level: "error", source: "network", message: "failed request" });
    expect((await store.gettimeline()).map(entry => entry.id)).toEqual(["t3", "t2", "t1"]);
    expect((await store.listtimeline({ runid: "run1" })).map(entry => entry.id)).toEqual(["t2", "t1"]);
    expect((await store.listtimeline({ level: "error" })).map(entry => entry.id)).toEqual(["t3", "t1"]);
    expect((await store.listtimeline({ runid: "run1", stepid: "s2" })).map(entry => entry.id)).toEqual(["t2"]);
  });

  it("expires timeline entries into level count summaries under the retention window", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setsettings({ timelineretention: 2 });
    await store.addtimelineentry({ id: "t1", runid: "run1", stepid: "s1", time: 1, level: "error", source: "error", message: "one" });
    await store.addtimelineentry({ id: "t2", runid: "run1", stepid: "s1", time: 2, level: "warn", source: "console", message: "two" });
    await store.addtimelineentry({ id: "t3", runid: "run1", stepid: "s1", time: 3, level: "error", source: "error", message: "three" });
    expect((await store.gettimeline()).map(entry => entry.id)).toEqual(["t3", "t2"]);
    const summaries = await store.getlevelsummaries();
    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({ runid: "run1", counts: { error: 1 } });
  });

  it("stores error and rejection records with stack frames and long tasks with attributions", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.adderrorrecord({ id: "e1", runid: "run1", stepid: "s1", message: "boom", frames: [{ functionname: "load", url: "https://example.com/app.js", line: 42, column: 7 }], sourceurl: "https://example.com/app.js", line: 42, at: 1 });
    await store.addrejectionrecord({ id: "r1", runid: "run1", stepid: "s1", reason: "TypeError: failed", frames: [], at: 2 });
    await store.addlongtask({ id: "l1", runid: "run1", stepid: "s1", duration: 90, starttime: 10, attributions: ["same-origin"], at: 3 });
    expect((await store.geterrorrecords())[0]?.frames[0]).toMatchObject({ functionname: "load", line: 42 });
    expect((await store.getrejectionrecords())[0]?.reason).toBe("TypeError: failed");
    expect((await store.getlongtasks())[0]).toMatchObject({ duration: 90, attributions: ["same-origin"] });
  });

  it("stores the console diff result, rotation targets and per origin console consents", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addconsolediff({ base: "run1", target: "run2", lines: [{ kind: "added", text: "fresh" }], added: 1, removed: 0, repeated: 0, at: 9 });
    expect((await store.getdiff())?.base).toBe("run1");
    await store.addrotationtarget({ target: "overflow1", runid: "run1", entries: 12, at: 9 });
    await store.addrotationtarget({ target: "overflow1", runid: "run2", entries: 3, at: 10 });
    expect((await store.getrotationtargets()).map(record => record.runid)).toEqual(["run2", "run1"]);
    await store.setconsoleconsent({ id: "c1", prompt: "Console capture on https://example.com", origin: "https://example.com", stepid: "s1", approved: true, at: 1 });
    expect((await store.getconsoleconsents())[0]).toMatchObject({ origin: "https://example.com", approved: true });
  });
});

describe("devtools session storage", () => {
  it("stores session records with domains and command outcomes with durations and error classes", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setcdpsession({ id: "cdp1", runid: "plan", stepid: "a1", tabid: 4, origin: "https://example.com", attachedat: 1, domains: ["Runtime", "Debugger"], debuggerversion: "devthink instrumented harness 1.1.46 (no chrome.debugger permission)" });
    await store.setcdpsession({ id: "cdp2", runid: "plan", stepid: "a2", tabid: 4, origin: "https://example.com", attachedat: 2, domains: ["Log"], debuggerversion: "harness", detachedat: 30 });
    expect((await store.getcdpsessions()).map(session => session.id)).toEqual(["cdp2", "cdp1"]);
    expect((await store.getcdpsessions())[0]?.domains).toEqual(["Log"]);
    await store.addcdpcommand({ id: "cmd1", sessionid: "cdp1", runid: "plan", stepid: "c1", method: "Runtime.evaluate", domain: "Runtime", duration: 12, at: 3 });
    await store.addcdpcommand({ id: "cmd2", sessionid: "cdp1", runid: "plan", stepid: "c2", method: "DOM.getSnapshot", domain: "DOM", duration: 4, errorclass: "uninstrumented", at: 4 });
    const commands = await store.getcdpcommands();
    expect(commands[0]).toMatchObject({ method: "DOM.getSnapshot", errorclass: "uninstrumented" });
    expect(commands[1]).toMatchObject({ method: "Runtime.evaluate", duration: 12 });
  });

  it("stores event rules, breakpoints with hit counts, watch expressions and overrides with provenance", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setcdpeventrule({ id: "r1", sessionid: "cdp1", runid: "plan", stepid: "w1", domain: "Log", event: "entryAdded", match: "fixture", events: 4, registeredat: 1 });
    await store.setcdpeventrule({ id: "r1", sessionid: "cdp1", runid: "plan", stepid: "w1", domain: "Log", event: "entryAdded", match: "fixture", events: 6, registeredat: 1, closedat: 9 });
    expect((await store.getcdpeventrules())).toHaveLength(1);
    expect((await store.getcdpeventrules())[0]).toMatchObject({ events: 6, closedat: 9 });
    await store.addbreakpoint({ id: "bp1", runid: "plan", stepid: "b1", url: "https://example.com/app.js", line: 5, condition: "items.length > 0", hits: 1, registeredat: 1 });
    await store.addbreakpoint({ id: "bp1", runid: "plan", stepid: "b1", url: "https://example.com/app.js", line: 5, condition: "items.length > 0", hits: 4, registeredat: 1, revertedat: 8 });
    expect((await store.getbreakpoints())).toHaveLength(1);
    expect((await store.getbreakpoints())[0]).toMatchObject({ hits: 4, revertedat: 8 });
    await store.setwatchexpression({ id: "we1", runid: "plan", stepid: "w1", expression: "items.length", scope: "topframe", reviewed: true, values: [{ pauseid: "p1", value: "3", at: 4 }], at: 2 });
    await store.setwatchexpression({ id: "we1", runid: "plan", stepid: "w1", expression: "items.length", scope: "topframe", reviewed: true, values: [{ pauseid: "p1", value: "3", at: 4 }, { pauseid: "p2", value: "8", at: 6 }], at: 2 });
    expect((await store.getwatchexpressions())[0]?.values).toHaveLength(2);
    await store.addscriptoverride({ id: "ov1", runid: "plan", stepid: "o1", urlpattern: "https://cdn.example/vendor.js", source: "window.fixture = true;", reviewed: true, reviewedat: 3, hits: 2, appliedat: 3 });
    expect((await store.getscriptoverrides())[0]).toMatchObject({ reviewed: true, hits: 2 });
  });

  it("stores pause states per run and expires the call frames under the retention window", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addpause({ id: "p1", runid: "plan", stepid: "b1", reason: "breakpoint", callframes: [{ url: "https://example.com/app.js", line: 5 }], hitbreakpoint: "bp1", domsnapshotid: "dom-1", at: 1 });
    await store.addpause({ id: "p2", runid: "plan", stepid: "b1", reason: "step", callframes: [{ url: "https://example.com/app.js", line: 6 }], at: 2 });
    await store.addpause({ id: "p3", runid: "other", stepid: "b1", reason: "breakpoint", callframes: [], at: 3 });
    expect((await store.listpauses("plan")).map(pause => pause.id)).toEqual(["p2", "p1"]);
    expect((await store.listpauses("other")).map(pause => pause.id)).toEqual(["p3"]);
    const retained = new sessionmemory(new fakeadapter());
    await retained.setsettings({ pauseretention: 2 });
    await retained.addpause({ id: "p1", runid: "plan", stepid: "b1", reason: "breakpoint", callframes: [{ url: "https://example.com/app.js", line: 5 }], hitbreakpoint: "bp1", domsnapshotid: "dom-1", at: 1 });
    await retained.addpause({ id: "p2", runid: "plan", stepid: "b1", reason: "step", callframes: [{ url: "https://example.com/app.js", line: 6 }], at: 2 });
    await retained.addpause({ id: "p3", runid: "plan", stepid: "b1", reason: "step", callframes: [{ url: "https://example.com/app.js", line: 7 }], at: 3 });
    const pauses = await retained.getpauses();
    expect(pauses).toHaveLength(3);
    const expired = pauses.find(pause => pause.id === "p1");
    if (!expired) throw new Error("The expired pause must stay stored.");
    expect(expired.framesexpired).toBe(true);
    expect(expired.callframes).toEqual([]);
    expect(expired.domsnapshotid).toBeUndefined();
    expect(expired.reason).toBe("breakpoint");
    expect(expired.hitbreakpoint).toBe("bp1");
    const kept = pauses.find(pause => pause.id === "p3");
    expect(kept?.framesexpired).toBeUndefined();
    expect(kept?.callframes).toHaveLength(1);
  });

  it("stores debugger consents per origin and revokes every approved record of one origin", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setdebuggergrant({ id: "g1", prompt: "Debugger attach on https://example.com", origin: "https://example.com", domains: ["Runtime"], approved: true, consentedat: 1 });
    await store.setdebuggergrant({ id: "g2", prompt: "Debugger attach on https://api.example", origin: "https://api.example", domains: ["Network"], approved: true, consentedat: 2 });
    expect((await store.getdebuggergrants())).toHaveLength(2);
    const revoked = await store.revokedebuggergrants("https://example.com", 9);
    expect(revoked).toBe(1);
    const grants = await store.getdebuggergrants();
    expect(grants.find(grant => grant.id === "g1")?.revokedat).toBe(9);
    expect(grants.find(grant => grant.id === "g2")?.revokedat).toBeUndefined();
    expect(await store.revokedebuggergrants("https://example.com", 10)).toBe(0);
  });
});

describe("profiler storage", () => {
  const now = 1_800_000_000_000;

  it("stores flow metric series per run and heap records with byte and node counts", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addflowmetric({ id: "f1", runid: "plan", stepid: "m1", name: "navigation", start: 0, end: 800, duration: 800, steps: ["s1"], at: now });
    await store.addflowmetric({ id: "f2", runid: "plan", stepid: "m1", name: "blocking", start: 0, end: 100, duration: 70, steps: ["s1"], at: now });
    await store.addflowmetric({ id: "f3", runid: "other", stepid: "m1", name: "navigation", start: 0, end: 10, duration: 10, steps: [], at: now });
    expect((await store.listflowmetrics("plan")).map(metric => metric.name)).toEqual(["blocking", "navigation"]);
    expect(await store.getflowmetrics()).toHaveLength(3);
    await store.setheaprecord({ id: "h1", runid: "plan", stepid: "hs", origin: "https://example.com", bytesize: 12_000_000, nodecount: 1450, capturedat: now });
    expect((await store.getheaprecords())[0]).toMatchObject({ bytesize: 12_000_000, nodecount: 1450 });
    expect((await store.getheaprecords())[0]?.bytesexpired).toBeUndefined();
  });

  it("stores growth samples with computed trends and cpu profiles with hot functions", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addgrowsample({ id: "g1", runid: "plan", stepid: "s1", usedbytes: 1_000_000, limitbytes: 4_000_000, at: now });
    await store.addgrowsample({ id: "g2", runid: "plan", stepid: "s2", usedbytes: 3_000_000, limitbytes: 4_000_000, at: now + 1000 });
    expect((await store.listgrowsamples("plan"))).toHaveLength(2);
    await store.settrend({ runid: "plan", slope: 2000, samples: 2, flaggedsteps: ["s2"], at: now + 2000 });
    await store.settrend({ runid: "plan", slope: 2000, samples: 2, flaggedsteps: ["s2", "s3"], at: now + 3000 });
    expect((await store.gettrends())).toHaveLength(1);
    expect((await store.gettrends())[0]?.flaggedsteps).toEqual(["s2", "s3"]);
    await store.setcpuprofile({ id: "c1", runid: "plan", stepid: "cpu", origin: "https://example.com", duration: 500, samplecount: 3, hotfunctions: ["render", "parse"], at: now });
    expect((await store.getcpuprofiles())[0]).toMatchObject({ duration: 500, samplecount: 3, hotfunctions: ["render", "parse"] });
  });

  it("stores shift entries, traces with annotations and source map references with per origin consents", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addshiftentry({ id: "sh1", runid: "plan", stepid: "ws", score: 0.12, starttime: 40, selectors: ["img#hero"], at: now });
    expect((await store.getshiftentries())[0]).toMatchObject({ score: 0.12, selectors: ["img#hero"] });
    await store.settracerecord({ id: "t1", runid: "plan", stepid: "tl", origin: "https://example.com", categories: ["scripting", "network"], bytesize: 400, events: 2, annotations: [{ stepid: "s1", label: "open", offset: 100 }], startedat: now, endedat: now + 500 });
    await store.settracerecord({ id: "t2", runid: "other", stepid: "tl", origin: "https://example.com", categories: ["scripting"], bytesize: 40, events: 1, annotations: [], startedat: now, endedat: now + 500 });
    expect((await store.listtraces({ runid: "plan" })).map(trace => trace.id)).toEqual(["t1"]);
    expect((await store.listtraces({ categories: ["scripting"] })).map(trace => trace.id)).toEqual(["t2", "t1"]);
    expect((await store.listtraces({ runid: "plan", categories: ["scripting", "network"] })).map(trace => trace.id)).toEqual(["t1"]);
    await store.settracefile("t1", "{\"devthinktrace\":\"1.1.47\"}");
    expect(await store.gettracefile("t1")).toBe("{\"devthinktrace\":\"1.1.47\"}");
    expect(await store.gettracefile("t2")).toBeUndefined();
    await store.setsourcemapref({ id: "sm1", runid: "plan", stepid: "sm", origin: "https://example.com", scripturl: "https://example.com/app.js", mapurl: "https://example.com/app.js.map", parsed: true, at: now });
    expect((await store.getsourcemaps())[0]).toMatchObject({ parsed: true });
    await store.setsourcemapconsent({ id: "c1", prompt: "Source map capture prompt", origin: "https://example.com", consentedat: now });
    await store.setsourcemapconsent({ id: "c1", prompt: "Source map capture prompt", origin: "https://example.com", approved: true, consentedat: now, usedat: now + 1 });
    expect((await store.getsourcemapconsents())[0]?.approved).toBe(true);
    expect(await store.revokesourcemapconsents("https://example.com", now + 2)).toBe(1);
    expect((await store.getsourcemapconsents())[0]?.revokedat).toBe(now + 2);
  });

  it("expires the heavy profile bytes after the configured retention window while the metadata survives", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setsettings({ profileretention: 1000 });
    const stale = Date.now() - 2000;
    await store.setheaprecord({ id: "h1", runid: "plan", stepid: "hs", origin: "https://example.com", bytesize: 12_000_000, nodecount: 1450, capturedat: stale });
    expect((await store.getheaprecords())[0]?.bytesexpired).toBe(true);
    expect((await store.getheaprecords())[0]).toMatchObject({ bytesize: 12_000_000, nodecount: 1450 });
    await store.setcpuprofile({ id: "c1", runid: "plan", stepid: "cpu", origin: "https://example.com", duration: 500, samplecount: 3, hotfunctions: ["render"], at: stale });
    expect((await store.getcpuprofiles())[0]?.samplesexpired).toBe(true);
    await store.settracerecord({ id: "t1", runid: "plan", stepid: "tl", origin: "https://example.com", categories: ["scripting"], bytesize: 400, events: 2, annotations: [{ stepid: "s1", label: "open", offset: 100 }], startedat: stale, endedat: stale + 500 });
    const trace = (await store.gettracerecords())[0];
    expect(trace?.bytesexpired).toBe(true);
    expect(trace?.annotations).toHaveLength(1);
    await store.settracefile("t1", "{\"devthinktrace\":\"1.1.47\"}");
    expect(await store.gettracefile("t1")).toBeUndefined();
  });
});

describe("emulation memory", () => {
  it("stores the emulation state per run with the layer history and expires reverted prior states after the retention window", async () => {
    const store = new sessionmemory(new fakeadapter());
    const layer = { id: "l1", runid: "run", stepid: "s1", family: "device" as const, name: "phone", originscope: "https://example.com", appliedat: 1, prior: { pixelratio: 2 }, revertplan: ["restore"] };
    await store.setemulationstate({ runid: "run", tabid: 4, origin: "https://example.com", layers: [layer], updatedat: 2 });
    expect((await store.getemulationstate("run"))?.layers[0]?.name).toBe("phone");
    expect((await store.listlayers("run"))[0]?.revertplan).toEqual(["restore"]);
    expect((await store.listlayers("other"))).toEqual([]);
    await store.setsettings({ emulationretention: 1 });
    await store.setemulationstate({ runid: "run", tabid: 4, origin: "https://example.com", layers: [{ ...layer, revertedat: Date.now() - 5 }], updatedat: 3 });
    const expired = await store.listlayers("run");
    expect(expired[0]?.prior).toBeUndefined();
    expect(expired[0]?.priorexpired).toBe(true);
    expect(expired[0]?.name).toBe("phone");
  });

  it("stores the user curated device, network, location and agent preset libraries", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setdevicepreset({ name: "phone", width: 390, height: 844, pixelratio: 3, mobile: true });
    await store.setdevicepreset({ name: "tablet", width: 820, height: 1180, pixelratio: 2, mobile: true });
    await store.setdevicepreset({ name: "phone", width: 391, height: 845, pixelratio: 3, mobile: true });
    expect((await store.getdevicepresets()).map(preset => preset.name).sort()).toEqual(["phone", "tablet"]);
    expect((await store.getdevicepresets()).find(preset => preset.name === "phone")?.width).toBe(391);
    await store.setnetworkpreset({ name: "slow3g", latency: 400, download: 400, upload: 400, offline: true });
    await store.setlocationpreset({ name: "lisbon", latitude: 38.7223, longitude: -9.1393, accuracy: 100 });
    await store.setagentpreset({ name: "desktopmask", useragent: "Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0 Safari/537.36", platform: "Linux x86_64", brands: ["Chromium"] });
    expect((await store.getnetworkpresets())[0]?.offline).toBe(true);
    expect((await store.getlocationpresets())[0]?.latitude).toBe(38.7223);
    expect((await store.getagentpresets())[0]?.brands).toEqual(["Chromium"]);
  });

  it("stores blackbox rule sets per origin, permission override history and location consents", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setblackboxrules("https://example.com", [{ urlpatterns: ["https://cdn.example/**"], tracescope: "both" }]);
    await store.setblackboxrules("https://example.com", [{ urlpatterns: ["https://vendor.example/*"], tracescope: "traces" }]);
    const rules = await store.getblackboxrules();
    expect(rules).toHaveLength(1);
    expect(rules[0]?.rules[0]?.urlpatterns).toEqual(["https://vendor.example/*"]);
    await store.addpermissionoverride({ id: "p1", runid: "run", stepid: "s1", origin: "https://example.com", name: "geolocation", state: "granted", priorstate: "prompt", appliedat: 1 });
    await store.addpermissionoverride({ id: "p1", runid: "run", stepid: "s1", origin: "https://example.com", name: "geolocation", state: "granted", priorstate: "prompt", appliedat: 1, restoredat: 2 });
    const overrides = await store.getpermissionoverrides();
    expect(overrides).toHaveLength(1);
    expect(overrides[0]?.restoredat).toBe(2);
    await store.setlocationconsent({ id: "c1", prompt: "Where?", origin: "https://example.com", latitude: 38.7223, longitude: -9.1393, consentedat: 1 });
    await store.setlocationconsent({ id: "c1", prompt: "Where?", origin: "https://example.com", latitude: 38.7223, longitude: -9.1393, approved: true, consentedat: 1 });
    const consents = await store.getlocationconsents();
    expect(consents).toHaveLength(1);
    expect(consents[0]?.approved).toBe(true);
  });
});

describe("workflow editor memory", () => {
  it("stores workflow versions and version diffs for the timeline", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addworkflowversion({ workflowid: "wf1", version: 1, createdat: 1, note: "first", steps: 2, risk: "read" });
    await store.addworkflowversion({ workflowid: "wf1", version: 2, createdat: 2, note: "second", steps: 3, risk: "read" });
    await store.addworkflowversion({ workflowid: "wf1", version: 2, createdat: 3, note: "second again", steps: 3, risk: "read" });
    const versions = await store.listworkflowversions("wf1");
    expect(versions.map(version => version.note)).toEqual(["second again", "first"]);
    expect(await store.listworkflowversions("wf2")).toEqual([]);
    await store.addversiondiff({ workflowid: "wf1", from: 1, to: 2, added: [{ stepid: "s3", kind: "wait", label: "Fresh" }], removed: [], changed: [], at: 4 });
    await store.addversiondiff({ workflowid: "wf1", from: 1, to: 2, added: [], removed: [], changed: [{ stepid: "s1", kind: "readtext", label: "Open", changes: ["label"] }], at: 5 });
    const diffs = await store.listversiondiffs("wf1");
    expect(diffs).toHaveLength(1);
    expect(diffs[0]?.changed[0]?.changes).toEqual(["label"]);
  });

  it("stores run history with retention and answers the filters", async () => {
    const store = new sessionmemory(new fakeadapter());
    for (const [index, outcome] of ["done", "failed", "done", "paused"].entries()) {
      await store.addrunhistory({ runid: `r${index}`, workflowid: index % 2 === 0 ? "wf1" : "wf2", outcome, steps: index, total: 4, duration: index, cause: "manual", startedat: 10 + index, endedat: 20 + index });
    }
    expect((await store.gethistory()).map(entry => entry.runid)).toEqual(["r3", "r2", "r1", "r0"]);
    expect((await store.gethistory({ workflowid: "wf1" })).map(entry => entry.runid)).toEqual(["r2", "r0"]);
    expect((await store.gethistory({ outcome: "done", limit: 1 })).map(entry => entry.runid)).toEqual(["r2"]);
    expect((await store.gethistory({ since: 23 })).map(entry => entry.runid)).toEqual(["r3"]);
    await store.setsettings({ runhistoryretention: 2 });
    await store.addrunhistory({ runid: "r4", workflowid: "wf1", outcome: "done", steps: 4, total: 4, duration: 1, cause: "cron", startedat: 30, endedat: 31, dryrun: true });
    const kept = await store.gethistory();
    expect(kept.map(entry => entry.runid)).toEqual(["r4", "r3"]);
    expect(kept[0]?.dryrun).toBe(true);
    expect(kept[0]?.cause).toBe("cron");
  });

  it("stores editor layouts, breakpoints, overrides, watchdog events, imports and background flags", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.seteditorlayout("wf1", { width: 900, height: 700, viewportx: 12, viewporty: 34, zoom: 1.5 });
    expect(await store.geteditorlayout("wf1")).toEqual({ width: 900, height: 700, viewportx: 12, viewporty: 34, zoom: 1.5 });
    expect(await store.geteditorlayout("wf2")).toBeUndefined();
    await store.setworkflowbreakpoints("wf1", ["s1", "s3"]);
    await store.setworkflowbreakpoints("wf1", ["s2"]);
    expect(await store.getworkflowbreakpoints("wf1")).toEqual(["s2"]);
    await store.addsiteoverride({ id: "o1", workflowid: "wf1", pattern: "https://example.com", deltas: { waitms: 500 }, createdat: 1 });
    await store.addsiteoverride({ id: "o1", workflowid: "wf1", pattern: "https://example.com", deltas: { delaybase: 250 }, createdat: 2 });
    await store.addsiteoverride({ id: "o2", workflowid: "wf2", pattern: "https://other.example", deltas: {}, createdat: 3 });
    expect((await store.listsiteoverrides("wf1")).map(override => override.deltas)).toEqual([{ delaybase: 250 }]);
    await store.removesiteoverride("o2");
    expect(await store.listsiteoverrides()).toHaveLength(1);
    await store.addwatchdogevent({ id: "w1", runid: "r1", verdict: "stalled", action: "pause", outcome: "Paused.", at: 1 });
    await store.addwatchdogevent({ id: "w2", runid: "r2", verdict: "zombie", action: "reap", outcome: "Reaped.", at: 2 });
    expect((await store.listwatchdogevents()).map(event => event.verdict)).toEqual(["zombie", "stalled"]);
    const record = { id: "wf9", name: "imported", version: 1, origins: ["https://example.com"], steps: [], blocks: [], risk: "read" as const, createdat: 1 };
    await store.addworkflowimport({ id: "imp1", record, importedat: 5, filename: "flow.json" });
    expect((await store.listworkflowimports()).map(entry => entry.filename)).toEqual(["flow.json"]);
    await store.removeworkflowimport("imp1");
    expect(await store.listworkflowimports()).toEqual([]);
    await store.setbackgroundruns({ wf1: true });
    expect(await store.getbackgroundruns()).toEqual({ wf1: true });
    await store.addworkflowrecord(record);
    await store.removeworkflowversion("wf9", 1);
    expect(await store.listworkflows()).toEqual([]);
  });
});

describe("agent protocol memory", () => {
  it("stores client records with pairing state, negotiated capability sets and the server config and state", async () => {
    const store = new sessionmemory(new fakeadapter());
    const client = { id: "client1", transport: "stdio" as const, paired: false, connectedat: 10 };
    await store.setclient(client);
    await store.setclient({ ...client, id: "client2", transport: "http" as const, connectedat: 11 });
    expect((await store.listclients()).map(entry => entry.id)).toEqual(["client2", "client1"]);
    await store.setclient({ ...client, paired: true, pairedat: 12 });
    expect((await store.listclients()).find(entry => entry.id === "client1")?.paired).toBe(true);
    const capabilities = { protocolversion: "1.1.54", name: "devthink", version: "1.1.54", toolversion: 1, tools: 30, namespaces: ["browser" as const], transports: ["stdio" as const] };
    await store.setclientcapabilities("client1", capabilities);
    expect((await store.getclients()).find(entry => entry.id === "client1")?.capabilities?.toolversion).toBe(1);
    await store.setclient({ ...client, id: "client2", transport: "http" as const, connectedat: 11, disconnectedat: 13 });
    expect((await store.listclients()).map(entry => entry.id)).toEqual(["client1"]);
    await store.clearclients();
    expect(await store.listclients()).toEqual([]);
    await store.setmcpconfig({ port: 7436, transports: ["stdio"], enabled: true, framesize: 50_000, queuedepth: 20, callretention: 10 });
    expect((await store.getmcpconfig())?.framesize).toBe(50_000);
    await store.setmcpstate({ state: "running", startedat: 20, bridge: { id: "bridge1", host: "com.wenathlan.devthink", connected: true, pid: 4242, startedat: 20, restarts: 0, received: 0, sent: 0 } });
    expect((await store.getmcpstate())?.bridge?.pid).toBe(4242);
    expect(await store.getmcpstate()).toMatchObject({ state: "running" });
  });

  it("stores bridge launch events with process ids and tool call records under the user configured retention", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addbridgelaunch({ id: "l1", host: "com.wenathlan.devthink", pid: 4242, restart: false, at: 30 });
    await store.addbridgelaunch({ id: "l2", host: "com.wenathlan.devthink", pid: 5252, restart: true, at: 31 });
    expect((await store.listbridgelaunches()).map(launch => launch.pid)).toEqual([5252, 4242]);
    await store.addtoolcall({ id: "t1", clientid: "client1", tool: "browser.click", origin: "https://example.com", ok: true, at: 40 });
    await store.addtoolcall({ id: "t2", clientid: "client1", tool: "browser.readtext", origin: "https://example.com", ok: false, code: "consentrefused", at: 41 });
    expect((await store.listtoolcalls()).map(call => call.id)).toEqual(["t2", "t1"]);
    await store.setmcpconfig({ port: 7436, transports: ["stdio"], enabled: true, callretention: 1 });
    await store.addtoolcall({ id: "t3", clientid: "client2", tool: "browser.snapshot", origin: "https://example.com", ok: true, at: 42 });
    expect((await store.listtoolcalls()).map(call => call.id)).toEqual(["t3"]);
  });

  it("records tool list, negotiate, connect and tool call audit events", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addaudi({ id: "a1", kind: "protocol", at: 50, summary: "A new mcp client client1 connected on the stdio transport and waits for the pairing approval." });
    await store.addaudi({ id: "a2", kind: "protocol", at: 51, summary: "The mcp client client1 listed the tool catalog of 30 tools." });
    await store.addaudi({ id: "a3", kind: "protocol", at: 52, summary: "The mcp client client1 negotiated its capability set with the server." });
    await store.addaudi({ id: "a4", kind: "tool", at: 53, summary: "The mcp client client1 called the browser.click tool on https://example.com and it ran behind the consent gates.", sessionid: "sess" });
    const audit = await store.getaudit();
    expect(audit.map(event => event.kind)).toEqual(["tool", "protocol", "protocol", "protocol"]);
    expect(audit[0]?.summary).toContain("browser.click");
    expect(audit[3]?.summary).toContain("pairing approval");
  });
});

describe("sessionmemory agent protocol part two", () => {
  const now = 1_800_000_000_000;

  it("stores session tokens only in their tokenhash form", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setsessiontokens([{ id: "t1", clientid: "client1", hash: "sha256:abc", scopes: ["browser"], issuedat: now, expiresat: now + 1000 }]);
    const tokens = await store.getsessiontokens();
    expect(tokens[0]?.hash).toBe("sha256:abc");
    expect(JSON.stringify(tokens)).not.toContain("rawtoken");
    await store.setsessiontokens([...tokens, { id: "t2", clientid: "client2", hash: "sha256:def", scopes: ["memory"], issuedat: now, expiresat: now + 1000 }]);
    expect((await store.getsessiontokens()).map(token => token.id)).toEqual(["t1", "t2"]);
  });

  it("stores pairing codes with their single use state", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addpairingcode({ code: "DT-ONE", scopes: ["browser"], issuedat: now, expiresat: now + 1000 });
    await store.addpairingcode({ code: "DT-TWO", scopes: ["memory"], issuedat: now, expiresat: now + 1000 });
    expect((await store.getpairingcodes()).map(code => code.code)).toEqual(["DT-TWO", "DT-ONE"]);
    await store.addpairingcode({ code: "DT-TWO", scopes: ["system"], issuedat: now, expiresat: now + 1000 });
    expect((await store.getpairingcodes()).filter(code => code.code === "DT-TWO")).toHaveLength(1);
    await store.usepairingcode("DT-ONE", now + 500);
    expect((await store.getpairingcodes()).find(code => code.code === "DT-ONE")?.usedat).toBe(now + 500);
    await store.usepairingcode("DT-MISSING", now);
    expect((await store.getpairingcodes()).find(code => code.code === "DT-ONE")?.usedat).toBe(now + 500);
  });

  it("stores allowlist entries, client identities and stream channels", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setclientidentity({ fingerprint: "aa11", displayname: "Laptop agent" });
    await store.setallowlistentry({ fingerprint: "aa11", displayname: "Laptop agent", namespaces: ["browser"], grantedat: now, history: [{ at: now, actor: "user", change: "Granted." }] });
    await store.setallowlistentry({ fingerprint: "bb22", displayname: "Desk agent", namespaces: ["memory"], grantedat: now, history: [] });
    expect((await store.getallowlist()).map(entry => entry.fingerprint)).toEqual(["bb22", "aa11"]);
    await store.setallowlistentry({ fingerprint: "aa11", displayname: "Laptop agent", namespaces: ["system"], grantedat: now, history: [{ at: now + 1, actor: "user", change: "Rescoped." }] });
    expect((await store.getallowlist()).find(entry => entry.fingerprint === "aa11")?.namespaces).toEqual(["system"]);
    await store.removeallowlistentry("bb22");
    expect((await store.getallowlist()).map(entry => entry.fingerprint)).toEqual(["aa11"]);
    expect((await store.getclientidentities())[0]?.displayname).toBe("Laptop agent");
    await store.setstreamchannels([{ id: "c1", clientid: "client1", openedat: now, lastbeatat: now }]);
    await store.setstreamchannels([{ id: "c1", clientid: "client1", openedat: now, lastbeatat: now, closedat: now + 5 }]);
    expect((await store.getstreamchannels())[0]?.closedat).toBe(now + 5);
  });

  it("stores approval gates with their decisions and auth handshake events", async () => {
    const store = new sessionmemory(new fakeadapter());
    const gate = { id: "gate-1", clientid: "client1", tool: "browser.click", reason: "Click.", params: { stepid: "s1" }, state: "pending" as const, raisedat: now };
    await store.setapproval(gate);
    await store.setapproval({ ...gate, state: "approved", decidedat: now + 1000, actor: "user" });
    const approvals = await store.listapprovals();
    expect(approvals).toHaveLength(1);
    expect(approvals[0]?.state).toBe("approved");
    await store.addapprovalexec({ requestid: "gate-1", decision: "approved", actor: "user", at: now + 1000, latencyms: 1000 });
    expect((await store.listapprovalexecs())[0]?.latencyms).toBe(1000);
    await store.addauthhandshake({ id: "h1", clientid: "client1", method: "pairingcode", outcome: "verified", at: now });
    await store.addauthhandshake({ id: "h2", clientid: "new", method: "token", outcome: "refused", at: now + 1 });
    expect((await store.listauthhandshakes()).map(event => event.outcome)).toEqual(["refused", "verified"]);
  });
});

describe("sessionmemory agent protocol part three", () => {
  const now = 1_800_000_000_000;

  it("stores subscriptions, watches and sampling requests with their provenance", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.seteventsubscriptions([{ id: "sub1", clientid: "client1", kinds: ["callresult"], createdat: now }]);
    expect((await store.geteventsubscriptions()).map(subscription => subscription.id)).toEqual(["sub1"]);
    await store.seteventsubscriptions([{ id: "sub2", clientid: "client2", kinds: ["progress"], createdat: now + 1 }]);
    expect((await store.geteventsubscriptions()).map(subscription => subscription.id)).toEqual(["sub2"]);
    await store.setresourcewatches([{ id: "watch1", clientid: "client1", resource: "page", baseline: { url: "https://example.com" }, createdat: now }]);
    expect((await store.getresourcewatches())[0]?.baseline).toEqual({ url: "https://example.com" });
    const sampling = { id: "sample1", clientid: "client1", prompt: "Summarize.", state: "pending" as const, requestedat: now };
    await store.setsamplingrequests([sampling]);
    await store.setsamplingrequests([{ ...sampling, state: "answered" as const, answeredat: now + 1, answer: "the model answer" }]);
    expect((await store.getsamplingrequests())[0]?.answer).toBe("the model answer");
  });

  it("stores idempotency records, rate limit counters and batch outcomes", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setidempotencyrecords([{ key: "key-1", clientid: "client1", tool: "browser.readtext", result: { content: "stored", iserror: false }, createdat: now, expiresat: now + 5000 }]);
    expect((await store.getidempotencyrecords())[0]?.key).toBe("key-1");
    await store.setcallratelimits([{ clientid: "client1", windowms: 60_000, budget: 5, windowstartedat: now, used: 3 }]);
    expect((await store.getcallratelimits())[0]?.used).toBe(3);
    const batch = { id: "batch1", clientid: "client1", calls: [{ id: "m1", name: "browser.readtext", params: {} }], stoponerror: true, state: "running" as const, createdat: now, outcomes: [] };
    await store.setbatchcall(batch);
    await store.setbatchcall({ ...batch, state: "done" as const, finishedat: now + 1, outcomes: [{ callid: "m1", tool: "browser.readtext", ok: true, at: now + 1 }] });
    const stored = await store.getbatchcalls();
    expect(stored).toHaveLength(1);
    expect(stored[0]?.outcomes[0]?.ok).toBe(true);
  });

  it("stores call contexts, chunks, progress notices, mocks and the dry run toggle", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setcallcontexts([{ callid: "call1", clientid: "client1", tool: "browser.readtext", state: "inflight", startedat: now, chunks: 0 }]);
    expect((await store.getcallcontexts())[0]?.state).toBe("inflight");
    for (let index = 0; index < 30; index += 1) await store.addstreamchunk({ callid: "call1", seq: index + 1, content: "x", done: index === 29, at: now + index });
    expect(await store.getstreamchunks()).toHaveLength(25);
    for (let index = 0; index < 30; index += 1) await store.addprogressnotice({ callid: "call1", message: "working", cancellable: true, at: now + index });
    expect(await store.getprogressnotices()).toHaveLength(25);
    await store.settoolmock({ tool: "browser.readtext", result: { content: "canned", iserror: false }, testcontext: true, createdat: now });
    expect((await store.gettoolmocks())[0]?.tool).toBe("browser.readtext");
    await store.removetoolmock("browser.readtext");
    expect(await store.gettoolmocks()).toHaveLength(0);
    await store.setdryruntoggle(true);
    expect(await store.getdryruntoggle()).toBe(true);
    await store.setdryruntoggle(false);
    expect(await store.getdryruntoggle()).toBe(false);
  });

  it("returns the audited call log under the requested filters", async () => {
    const store = new sessionmemory(new fakeadapter());
    const one = { id: "call1", clientid: "client1", tool: "browser.readtext", origin: "https://example.com", ok: true, at: now, idempotencykey: "key-1" };
    const two = { id: "call2", clientid: "client2", tool: "memory.list", origin: "https://example.com", ok: false, code: "consentrefused" as const, at: now + 1 };
    const three = { id: "call3", clientid: "client1", tool: "browser.click", origin: "https://example.com", ok: true, at: now + 2, dryrun: true };
    await store.addtoolcall(one);
    await store.addtoolcall(two);
    await store.addtoolcall(three);
    expect((await store.getcalllog()).map(record => record.id)).toEqual(["call3", "call2", "call1"]);
    expect((await store.getcalllog({ clientid: "client1" })).map(record => record.id)).toEqual(["call3", "call1"]);
    expect((await store.getcalllog({ tool: "memory.list" })).map(record => record.id)).toEqual(["call2"]);
    expect((await store.getcalllog({ ok: true })).map(record => record.id)).toEqual(["call3", "call1"]);
    expect((await store.getcalllog({ since: now + 1 })).map(record => record.id)).toEqual(["call3", "call2"]);
    expect((await store.getcalllog({ limit: 1 })).map(record => record.id)).toEqual(["call3"]);
    expect((await store.getcalllog())[2]?.idempotencykey).toBe("key-1");
    expect((await store.getcalllog())[0]?.dryrun).toBe(true);
  });
});

describe("sessionmemory llm integration", () => {
  const now = 1_800_000_000_000;

  it("stores provider configs with references, never secrets, and the routing tables with revision history", async () => {
    const store = new sessionmemory(new fakeadapter());
    const provider: providerconfig = { id: "prov1", name: "The gateway", endpoint: "https://gateway.example/v1", style: "chatcompletions", models: ["model-a"], status: "available", authref: { name: "gateway key", origins: ["https://gateway.example"], header: "authorization", storageid: "key-store-1", configuredat: now }, createdat: now };
    await store.setproviders([provider]);
    const stored = (await store.getproviders())[0];
    expect(stored?.authref?.storageid).toBe("key-store-1");
    expect(JSON.stringify(stored)).not.toContain("the key material");
    const route = { id: "route1", kind: "draftplan", providerid: "prov1", model: "model-a", revision: 2, updatedat: now };
    await store.setmodelroutes([route]);
    await store.addmodelrouterevision(route);
    expect((await store.getmodelroutes())[0]?.revision).toBe(2);
    expect((await store.getmodelroutehistory())[0]?.kind).toBe("draftplan");
  });

  it("stores every usage record with run and step ids and answers the period totals", async () => {
    const store = new sessionmemory(new fakeadapter());
    const record: usagerecord = { id: "u1", runid: "run1", stepid: "s1", providerid: "prov1", endpoint: "https://gateway.example/v1", model: "model-a", prompttokens: 10, completiontokens: 5, totaltokens: 15, cost: 0.01, at: now };
    const other: usagerecord = { id: "u2", runid: "run2", providerid: "prov1", endpoint: "https://gateway.example/v1", model: "model-a", prompttokens: 100, completiontokens: 50, totaltokens: 150, cost: 0.1, at: now + 1000 };
    await store.addusagerecord(record);
    await store.addusagerecord(other);
    expect((await store.getusagerecords())[0]?.id).toBe("u2");
    expect(await store.getusage()).toEqual({ prompttokens: 110, completiontokens: 55, totaltokens: 165, cost: 0.11, calls: 2 });
    expect((await store.getusage({ runid: "run1" })).calls).toBe(1);
    expect((await store.getusage({ since: now + 1 })).totaltokens).toBe(150);
  });

  it("stores plandrafts, replans and reflectnotes for the audit history", async () => {
    const store = new sessionmemory(new fakeadapter());
    const draft: plandraft = { id: "d1", goal: "Read the page", steps: [{ id: "s1", kind: "observe", summary: "Observe." }], openquestions: [], providerid: "prov1", model: "model-a", state: "approved", lintfindings: [], createdat: now };
    await store.addplandraft(draft);
    expect((await store.getplandrafts())[0]?.goal).toBe("Read the page");
    await store.setplandrafts([{ ...draft, state: "rejected" }]);
    expect((await store.getplandrafts())[0]?.state).toBe("rejected");
    const replan: replanrecord = { id: "r1", draftid: "d1", completedstepids: ["s1"], failedstepids: [], tail: [{ id: "t1", kind: "reload", summary: "Reload.", freshreview: true }], reason: "The step timed out.", providerid: "prov1", model: "model-a", state: "pending", createdat: now };
    await store.addreplan(replan);
    expect((await store.getreplans())[0]?.tail[0]?.freshreview).toBe(true);
    const note: reflectnote = { id: "n1", runid: "run1", stepid: "s1", outcome: "The step landed.", lesson: "Wait before the click.", advice: "Add a settle window.", providerid: "prov1", model: "model-a", createdat: now };
    await store.addreflectnote(note);
    expect((await store.getreflectnotes())[0]?.lesson).toMatch(/Wait before the click/);
  });

  it("stores prompt template versions with change notes and the cost budgets", async () => {
    const store = new sessionmemory(new fakeadapter());
    const template: prompttemplate = { id: "t1", name: "pagesummary", body: "Summarize {{url}}.", variables: ["url"], version: 1, notes: "first version", createdat: now };
    await store.setprompttemplates([template]);
    expect((await store.getprompttemplates())[0]?.notes).toBe("first version");
    const budget: costbudget = { maxtokens: 5000, configuredat: now };
    await store.setcostbudget(budget);
    expect((await store.getcostbudget())?.maxtokens).toBe(5000);
    await store.setcostbudget({ runid: "run1", maxcost: 1, currency: "usd", configuredat: now });
    expect((await store.getcostbudget("run1"))?.maxcost).toBe(1);
    expect((await store.getcostbudget("run2"))?.maxtokens).toBe(5000);
  });

  it("stores the parsed command and the guard refusal notices with their reasons", async () => {
    const store = new sessionmemory(new fakeadapter());
    const parse = { text: "open the docs", intent: "navigate" as const, entities: [{ name: "url", value: "https://docs.example" }], confidence: 0.9, model: "model-a", providerid: "prov1", parsedat: now };
    await store.setcommandparse(parse);
    expect((await store.getcommandparse())?.intent).toBe("navigate");
    await store.addguardnotice({ raw: "nope", verdict: "invalid", reason: "The model answer is not json.", attempts: 3 });
    await store.addguardnotice({ raw: "{}", parsed: {}, verdict: "valid", attempts: 1 });
    const notices = await store.getguardnotices();
    expect(notices).toHaveLength(1);
    expect(notices[0]?.reason).toMatch(/not json/i);
  });
});

describe("sessionmemory swarm persistence", () => {
  const now = 1_800_000_000_000;
  it("stores the agent identities, the task queue and the blackboard as first class records", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setagents([{ id: "a1", name: "Scout", role: "worker", depth: 0, state: "active", tabid: 7, registeredat: now }]);
    expect((await store.getagents())[0]).toMatchObject({ name: "Scout", tabid: 7, role: "worker" });
    await store.settaskqueue({ lanes: ["extraction"], priorities: [1], completionpolicy: "all", items: [{ id: "t1", lane: "extraction", priority: 1, payload: "Read the table", state: "queued", enqueuedat: now }], claims: [] });
    expect((await store.gettaskqueue())?.items).toHaveLength(1);
    await store.setblackboard({ sections: ["goals", "facts", "findings", "scratch"], entries: [{ id: "e1", key: "goal", valuekind: "text", value: "Extract", author: "user", section: "goals", consentclass: "read", postedat: now }] });
    expect((await store.getblackboard())?.entries[0]?.key).toBe("goal");
    await store.setkillswitch({ engaged: true, engagedat: now, reason: "Halted." });
    expect((await store.getkillswitch())?.engaged).toBe(true);
  });

  it("stores the lessons learned of the fleet with one row per lesson id", async () => {
    /* the lessons store of the 1.1.96 multi agent certification: a rewritten lesson replaces its row instead of duplicating it, so the store deduplicates and the reuse count survives the rewrite */
    const store = new sessionmemory(new fakeadapter());
    const first: lessonrecord = { id: "l1", agentid: "w1", finding: "The pricing table loads only after the hero settles.", origin: "https://example.com", reusecount: 0, recordedat: now };
    const second: lessonrecord = { id: "l2", agentid: "w2", finding: "The login form refuses pasted passwords.", origin: "https://shop.example", reusecount: 0, recordedat: now };
    await store.setlesson(first);
    await store.setlesson(second);
    expect((await store.getlessons()).map(lesson => lesson.id).sort()).toEqual(["l1", "l2"]);
    const rewritten: lessonrecord = { ...first, reusecount: 1, lastusedat: now + 1_000 };
    await store.setlesson(rewritten);
    const stored = await store.getlessons();
    expect(stored).toHaveLength(2);
    expect(stored.find(lesson => lesson.id === "l1")).toMatchObject({ reusecount: 1, lastusedat: now + 1_000 });
    expect(stored.find(lesson => lesson.id === "l1")?.finding).toBe("The pricing table loads only after the hero settles.");
  });

  it("stores the mailbox contents with the user configured retention", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setmailboxes([{ agentid: "a1", inbox: [{ id: "m1", senderid: "a2", recipient: "a1", routing: "direct", payload: "One", sentat: now }, { id: "m2", senderid: "a2", recipient: "a1", routing: "direct", payload: "Two", sentat: now + 1 }], outbox: [], unread: 2 }]);
    expect((await store.getmailboxes())[0]?.inbox).toHaveLength(2);
    await store.setsettings({ mailboxretention: 1 });
    await store.setmailboxes((await store.getmailboxes()).map(mailbox => ({ ...mailbox })));
    expect((await store.getmailboxes())[0]?.inbox).toHaveLength(1);
  });

  it("stores the spawn history, the per agent usage and the lifecycle events", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addspawnrecord({ id: "s1", parentid: "a1", childid: "a2", role: "planner", depth: 1, at: now });
    await store.addspawnrecord({ id: "s2", parentid: "a2", childid: "a3", role: "worker", depth: 2, at: now + 1 });
    expect((await store.getspawnrecords()).map(record => record.childid)).toEqual(["a3", "a2"]);
    await store.setagentusage([{ agentid: "a1", tokens: 120, cost: 0.02, steps: 3, updatedat: now }]);
    expect((await store.getagentusage())[0]).toMatchObject({ tokens: 120, steps: 3 });
    await store.addagentevent({ id: "e1", kind: "register", agentid: "a1", summary: "The user registered the agent Scout.", at: now });
    expect((await store.getagentevents())[0]?.kind).toBe("register");
  });

  it("returns the swarm overview at a glance from the stored records", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setagents([
      { id: "a1", name: "Scout", role: "worker", depth: 0, state: "active", registeredat: now },
      { id: "a2", name: "Scribe", role: "planner", depth: 0, state: "paused", registeredat: now }
    ]);
    await store.settaskqueue({ lanes: ["extraction"], priorities: [], completionpolicy: "all", items: [
      { id: "t1", lane: "extraction", priority: 1, payload: "Read the table", state: "claimed", enqueuedat: now },
      { id: "t2", lane: "extraction", priority: 1, payload: "Read the footer", state: "queued", enqueuedat: now }
    ], claims: [{ agentid: "a1", taskid: "t1", claimedat: now, heartbeatat: now }] });
    await store.setmailboxes([{ agentid: "a2", inbox: [{ id: "m1", senderid: "a1", recipient: "a2", routing: "direct", payload: "Hi.", sentat: now }], outbox: [], unread: 1 }]);
    const overview = await store.swarmoverview();
    expect(overview).toMatchObject({ agents: 2, active: 1, paused: 1, tasks: 2, queued: 1, claimed: 1, messages: 1, unread: 1 });
    const empty = await new sessionmemory(new fakeadapter()).swarmoverview();
    expect(empty).toMatchObject({ agents: 0, tasks: 0, messages: 0 });
  });
});

describe("sessionmemory orchestration persistence", () => {
  const now = 1_800_000_000_000;
  it("stores the topology, splits, reviews and verifier checks of the 1.1.59 family", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.settopology({ id: "top1", leaderid: "a1", workerids: ["a2"], criticids: ["a3"], verifierids: ["a4"], assignments: [{ workerid: "a2", taskid: "t1", slice: "Read the table", assignedat: now }], rule: { kind: "first" }, electedat: now });
    expect((await store.gettopology())?.leaderid).toBe("a1");
    await store.setplannersplits([{ id: "s1", planownerid: "a1", runownerid: "a2", taskid: "t1", stepreports: [{ stepid: "step1", outcome: "done", detail: "Done.", reportedat: now }], splitat: now }]);
    expect((await store.getplannersplits())[0]?.stepreports).toHaveLength(1);
    await store.addcriticreview({ id: "r1", reviewerid: "a3", subjectagentid: "a2", verdict: "changes", issues: [], requiredchanges: ["Re-read the footer."], reviewedat: now });
    expect((await store.getcriticreviews())[0]?.verdict).toBe("changes");
    await store.addverifiercheck({ id: "v1", verifierid: "a4", claimagentid: "a2", claim: "The table holds 42 rows.", method: "re-read", outcome: "pass", checkedat: now });
    expect((await store.getverifierchecks())[0]?.outcome).toBe("pass");
    await store.setreviewrequests([{ id: "rq1", fromagentid: "a2", toagentid: "a3", subject: "The output", payload: "The rows", state: "open", requestedat: now }]);
    expect((await store.getreviewrequests())[0]?.state).toBe("open");
  });

  it("stores the handoff log with the resumed state, the locks and the conflict scans", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addhandoff({ id: "h1", fromagentid: "a1", toagentid: "a2", tabid: 7, taskstate: "Halfway.", state: "prepared", createdat: now });
    await store.updatehandoff({ id: "h1", fromagentid: "a1", toagentid: "a2", tabid: 7, taskstate: "Halfway.", state: "resumed", createdat: now, transferredat: now + 1, resumedat: now + 2 });
    const handoffs = await store.gethandoffs();
    expect(handoffs).toHaveLength(1);
    expect(handoffs[0]).toMatchObject({ state: "resumed", resumedat: now + 2 });
    await store.setlocks([{ key: "https://example.com|#form", holder: "a1", kind: "exclusive", origin: "https://example.com", selector: "#form", acquiredat: now, expiresat: now + 1000 }]);
    expect((await store.getlocks())[0]?.holder).toBe("a1");
    await store.addconflictscan({ id: "s1", writers: [{ agentid: "a1", origin: "https://example.com", selector: "#form" }], overlaps: [], suggestedorder: [], clean: true, scannedat: now });
    expect((await store.getconflictscans())[0]?.clean).toBe(true);
  });

  it("stores the merged report with provenance, the board snapshots with retention, the escalations, the consensus rounds, the shared costs and the interleaved timeline", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setreport({ id: "rep1", title: "The extraction", sections: [{ title: "Task t1", entries: [{ id: "m1", agentid: "a1", taskid: "t1", key: "rowcount", value: "42", mergedat: now }], sources: ["a1"] }], sources: ["a1"], createdat: now });
    expect((await store.getreport())?.sections[0]?.entries[0]?.agentid).toBe("a1");
    await store.addboardsnapshot({ id: "b1", builtat: now, lanes: [] });
    await store.addboardsnapshot({ id: "b2", builtat: now + 1, lanes: [] });
    expect((await store.getboardsnapshots()).map(board => board.id)).toEqual(["b2", "b1"]);
    await store.setsettings({ boardretention: 1 });
    await store.addboardsnapshot({ id: "b3", builtat: now + 2, lanes: [] });
    expect(await store.getboardsnapshots()).toHaveLength(1);
    await store.addescalation({ id: "e1", agentid: "a1", subject: "Which origin", context: "Both hold half.", state: "open", raisedat: now });
    await store.updateescalation({ id: "e1", agentid: "a1", subject: "Which origin", context: "Both hold half.", state: "decided", decision: "The second origin.", raisedat: now, decidedat: now + 1 });
    expect((await store.getescalations())[0]?.decision).toBe("The second origin.");
    await store.setconsensusround({ id: "c1", subject: "The lane order", votes: [], quorum: 2, state: "open", openedat: now });
    await store.setconsensusround({ id: "c1", subject: "The lane order", votes: [{ agentid: "a1", vote: "yes", votedat: now + 1 }], quorum: 2, state: "open", openedat: now });
    const rounds = await store.getconsensusrounds();
    expect(rounds).toHaveLength(1);
    expect(rounds[0]?.votes).toHaveLength(1);
    await store.setconsensusround({ id: "c2", subject: "Abort", votes: [], quorum: 1, state: "open", openedat: now });
    expect(await store.getconsensusrounds()).toHaveLength(2);
    await store.addswarmcost({ agents: 2, tokens: 150, cost: 0.75, steps: 5, computedat: now });
    expect((await store.getswarmcosts())[0]).toMatchObject({ tokens: 150, steps: 5 });
    await store.addswarmaction({ id: "t1", kind: "claim", agentid: "a1", summary: "The claim.", at: now });
    await store.addswarmaction({ id: "t2", kind: "lock", agentid: "a2", summary: "The lock.", at: now + 1 });
    await store.addswarmaction({ id: "t3", kind: "merge", summary: "The merge.", at: now + 2 });
    expect((await store.getswarmtimeline()).map(action => action.id)).toEqual(["t1", "t2", "t3"]);
    expect((await store.getswarmtimeline({ agentid: "a1" })).map(action => action.id)).toEqual(["t1"]);
    expect((await store.getswarmtimeline({ kind: "lock" })).map(action => action.id)).toEqual(["t2"]);
    expect((await store.getswarmtimeline({ since: now + 1 })).map(action => action.id)).toEqual(["t2", "t3"]);
  });
});

describe("execution environment persistence", () => {
  it("joins the environment grants to the session record and reads them back", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setsession({ id: "s1", tabid: 1, origin: "https://example.com", startedat: 1, expiresat: 2 });
    expect(await store.getenvironmentgrants()).toBeUndefined();
    await store.setenvironmentgrants(["pagecontext", "isolatedworld"]);
    expect(await store.getenvironmentgrants()).toEqual(["pagecontext", "isolatedworld"]);
    expect((await store.getsession())?.environmentgrants).toEqual(["pagecontext", "isolatedworld"]);
    await expect(store.setenvironmentgrants([])).resolves.toBeUndefined();
  });

  it("seals the run state per profile so parallel profiles never share it and tampered seals never load", async () => {
    const store = new sessionmemory(new fakeadapter());
    const state = { runid: "run1", sessionid: "s1", planid: "p1", profileid: "profile1", state: "active" as const, urlhistory: [], environments: {}, turnarounds: {}, keepalive: { runid: "run1", sessionid: "s1", state: "active" as const, startedat: 1, interval: 30_000, beats: 1, lastbeatat: 2, portopen: true, events: [] }, updatedat: 2 };
    await store.setrunstate("profile1", state);
    await store.setrunstate("profile2", { ...state, profileid: "profile2", runid: "run2" });
    expect((await store.getrunstate("profile1"))?.runid).toBe("run1");
    expect((await store.getrunstate("profile2"))?.runid).toBe("run2");
    expect((await store.listrunstates()).map(entry => entry.runid).sort()).toEqual(["run1", "run2"]);
    await store.removerunstate("profile2");
    expect(await store.getrunstate("profile2")).toBeUndefined();
    expect((await store.listrunstates()).map(entry => entry.runid)).toEqual(["run1"]);
  });

  it("expires the stale stopped run states past the user configured window while the keepalive summaries survive", async () => {
    const store = new sessionmemory(new fakeadapter());
    const stopped = { runid: "run1", sessionid: "s1", planid: "p1", profileid: "default", state: "completed" as const, urlhistory: [{ url: "https://example.com/a", stepid: "s1", at: 1 }], environments: { s1: "pagecontext" as const }, turnarounds: {}, keepalive: { runid: "run1", sessionid: "s1", state: "stopped" as const, startedat: 1, interval: 30_000, beats: 4, lastbeatat: 2, portopen: false, events: [], stoppedat: 3 }, updatedat: 3 };
    const active = { ...stopped, runid: "run2", keepalive: { ...stopped.keepalive, runid: "run2", state: "active" as const, portopen: true }, updatedat: 100 };
    await store.setrunstate("default", stopped);
    await store.setrunstate("live", active);
    const kept = await store.expirerunstates(1_000, 5_000);
    expect(kept.map(entry => entry.runid)).toEqual(["run2"]);
    const summary = await store.getrunstate("default");
    expect(summary?.state).toBe("expired");
    expect(summary?.urlhistory).toEqual([]);
    expect(summary?.keepalive.beats).toBe(4);
    expect(await store.expirerunstates(undefined, 9_000)).toHaveLength(2);
  });

  it("stores worker events with provenance, the offscreen registry, sandbox renders and the run locks", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addworkerevent({ id: "w1", runid: "run1", kind: "spawn", workers: 2, reason: "Two parses waited.", provenance: { origin: "https://example.com", stepid: "s1", environment: "offscreenworker" }, at: 1 });
    await store.addworkerevent({ id: "w2", runid: "run1", kind: "teardown", workers: 0, reason: "The run completed.", provenance: { origin: "https://example.com", stepid: "s1", environment: "offscreenworker" }, at: 2 });
    expect((await store.getworkerevents()).map(event => event.kind)).toEqual(["teardown", "spawn"]);
    await store.addoffscreenentry({ document: "offscreen.html", runid: "run1", reasons: ["DOM_PARSER", "WORKERS"], justification: "Heavy parsing of reviewed snapshots.", createdat: 1 });
    await store.updateoffscreenentry({ document: "offscreen.html", runid: "run1", reasons: ["DOM_PARSER", "WORKERS"], justification: "Heavy parsing of reviewed snapshots.", createdat: 1, closedat: 9 });
    expect((await store.getoffscreenentries())[0]?.closedat).toBe(9);
    await store.addsandboxrender({ id: "r1", nonce: "abc123def456ghi7", markup: "<p>ok</p>", sourceorigin: "https://example.com", stepid: "s1", renderedat: 1 });
    expect((await store.getsandboxrenders())[0]?.nonce).toBe("abc123def456ghi7");
    await store.setrunlocks([{ sessionid: "s1", runid: "run1", holder: "executor", acquiredat: 1 }]);
    expect((await store.getrunlocks())[0]?.runid).toBe("run1");
  });

  it("tracks the storage quota usage of the run state and exports every run state as one record", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setsettings({ runstatebytes: 500 });
    await store.trackrunstatequota(1_200);
    const quota = await store.getrunstatequota();
    expect(quota).toMatchObject({ used: 1_200, ceiling: 500 });
    const state = { runid: "run1", sessionid: "s1", planid: "p1", profileid: "default", state: "active" as const, urlhistory: [], environments: { s1: "offscreenworker" as const }, turnarounds: { s1: 8 }, keepalive: { runid: "run1", sessionid: "s1", state: "active" as const, startedat: 1, interval: 30_000, beats: 2, lastbeatat: 2, portopen: true, events: [] }, updatedat: 2 };
    await store.setrunstate("default", state);
    const exported = await store.exportrunstates();
    expect(exported).toMatchObject({ runs: 1, environments: 1, offloaded: 1, beats: 2 });
  });

  it("stores the automation allowlist, the origin profiles, the consent windows and the class consents of the security family", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addallowlistorigin({ origin: "https://example.com", profileid: "default", grantedat: 1 });
    await store.addallowlistorigin({ origin: "https://example.com", profileid: "default", grantedat: 2 });
    await store.addallowlistorigin({ origin: "https://other.example", profileid: "default", grantedat: 3 });
    expect((await store.getautomationallowlist()).map(entry => entry.origin)).toEqual(["https://example.com", "https://other.example"]);
    await store.removeallowlistorigin("https://other.example", "default");
    expect((await store.getautomationallowlist())).toHaveLength(1);
    await store.saveoriginprofile({ profileid: "p1", origin: "https://example.com", grants: ["fillcard" as const], denials: [], createdat: 1, updatedat: 1 });
    await store.saveoriginprofile({ profileid: "p1", origin: "https://example.com", grants: [], denials: ["fillcard" as const], createdat: 1, updatedat: 2 });
    await store.saveoriginprofile({ profileid: "p2", origin: "https://other.example", grants: [], denials: [], createdat: 1, updatedat: 1 });
    const profiles = await store.getoriginprofiles();
    expect(profiles).toHaveLength(2);
    expect(profiles.find(profile => profile.origin === "https://example.com")?.denials).toEqual(["fillcard"]);
    await store.setconsentwindows([{ id: "w1", sessionid: "s1", origin: "https://example.com", startedat: 1, duration: 10, expiresat: 11, boundary: "10 milliseconds", kinds: [], state: "active" }]);
    const expired = await store.expireconsentwindows(12);
    expect(expired[0]?.state).toBe("closed");
    expect(expired[0]?.closedat).toBe(12);
    await store.addclassconsent({ id: "c1", origin: "https://example.com", sensitiveclass: "payment", grantedat: 1 });
    await store.addclassconsent({ id: "c2", origin: "https://example.com", sensitiveclass: "payment", grantedat: 2 });
    expect((await store.getclassconsents()).filter(consent => consent.sensitiveclass === "payment")).toHaveLength(1);
    await store.addrevocation({ id: "r1", sessionid: "s1", runid: "run1", haltedstepids: ["s1", "s2"], actor: "user", reason: "The user revoked the consent mid run.", at: 3 });
    expect((await store.getrevocations())[0]?.haltedstepids).toEqual(["s1", "s2"]);
  });

  it("stores the mask rules per origin with add and remove", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addmaskrule({ id: "m1", shapes: ["iban"], createdat: 1 });
    await store.addmaskrule({ id: "m2", origin: "https://example.com", shapes: ["routing"], createdat: 2 });
    expect((await store.getmaskrules()).map(rule => rule.id)).toEqual(["m1", "m2"]);
    await store.removemaskrule("m1");
    expect((await store.getmaskrules()).map(rule => rule.id)).toEqual(["m2"]);
  });

  it("stores the immutable run log and exports only the verified chain", async () => {
    const store = new sessionmemory(new fakeadapter());
    let log = { runid: "run1", sessionid: "s1", entries: [] as never[], updatedat: 1 } as Parameters<sessionmemory["setimmutablelog"]>[0];
    const { appendlogentry, sealrunlog } = await import("../security.js");
    log = await appendlogentry({ log, kind: "grant", summary: "The session started.", origin: "https://example.com", at: 2 });
    log = await appendlogentry({ log, kind: "step", summary: "The click step completed.", origin: "https://example.com", stepid: "s1", at: 3 });
    await store.trackimmutablelog("run1");
    await store.setimmutablelog(log);
    const stored = await store.getimmutablelog("run1");
    expect(stored?.entries).toHaveLength(2);
    expect((await store.listimmutablelogs())).toHaveLength(1);
    const sealed = await sealrunlog(log, 4);
    await store.setimmutablelog(sealed.log);
    const exported = await store.exportverifiedrunlog("run1");
    expect(exported.chainvalid).toBe(true);
    expect(exported.entries).toBe(2);
    expect(exported.sealhash).toMatch(/^[0-9a-f]{64}$/);
    await expect(store.exportverifiedrunlog("missing")).rejects.toThrow(/no run log exists/i);
    const expired = await store.expireimmutablelogs(10, 100);
    expect(expired).toHaveLength(0);
    const pruned = await store.getimmutablelog("run1");
    expect(pruned?.entries).toEqual([]);
    expect(pruned?.seal?.sealhash.current).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("sessionmemory security part two", () => {
  it("stores secretvault metadata with labels and scopes only and never values", async () => {
    const store = new sessionmemory(new fakeadapter());
    const entry = { vaultid: "v1", label: "Bank login", scope: "https://bank.example", profileid: "profile", provenance: "user" as const, algorithm: "sha-256" as const, digest: "sha256:abc", createdat: 1 };
    await store.addsecret(entry);
    await store.addsecret({ ...entry, label: "duplicate id keeps first" });
    expect((await store.getsecretvault())).toHaveLength(1);
    await store.stampsecretuse("v1", 9);
    expect((await store.getsecretvault())[0]?.lastusedat).toBe(9);
    await store.removesecret("v1");
    expect(await store.getsecretvault()).toEqual([]);
  });

  it("stores connectallow entries with their senders and drops them on removal", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addconnectallow({ senderid: "sender", displayname: "Bridge", addedat: 1 });
    await store.addconnectallow({ senderid: "sender", displayname: "duplicate keeps first", addedat: 2 });
    expect((await store.getconnectallow())[0]?.displayname).toBe("Bridge");
    await store.removeconnectallow("sender");
    expect(await store.getconnectallow()).toEqual([]);
  });

  it("stores ratelimit bucket state per origin and per session", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.saveratelimitbucket({ origin: "https://example.com", sessionid: "s", limit: 5, window: 1000, used: 1, windowstartedat: 1, resetsat: 1001 });
    await store.saveratelimitbucket({ origin: "https://example.com", sessionid: "s", limit: 5, window: 1000, used: 2, windowstartedat: 1, resetsat: 1001 });
    expect(await store.getratelimitbuckets()).toHaveLength(1);
    await store.saveratelimitbucket({ origin: "https://other.example", sessionid: "s", limit: 5, window: 1000, used: 0, windowstartedat: 1, resetsat: 1001 });
    expect(await store.getratelimitbuckets()).toHaveLength(2);
    await store.removeratelimitbucket("https://example.com", "s");
    expect((await store.getratelimitbuckets()).map(bucket => bucket.origin)).toEqual(["https://other.example"]);
  });

  it("stores confirm gates with their resolution events and human action provenance", async () => {
    const store = new sessionmemory(new fakeadapter());
    const gate = { gateid: "g1", kind: "confirmpay" as const, stepid: "step", runid: "run", origin: "https://shop.example", payload: { amount: "10.00" }, state: "open" as const, openedat: 1 };
    await store.savegate(gate);
    await store.savegate({ ...gate, state: "resolved", resolvedat: 3, actor: "user" });
    expect((await store.getgates())[0]?.state).toBe("resolved");
    await store.savegate({ ...gate, gateid: "g2", kind: "confirmdelete" as const });
    expect((await store.getgates()).map(candidate => candidate.gateid)).toEqual(["g2", "g1"]);
    await store.addgateresolution({ gateid: "g1", kind: "confirmpay", stepid: "step", decision: "resolved", actor: "user", at: 3 });
    expect((await store.getgateresolutions())[0]).toMatchObject({ gateid: "g1", actor: "user" });
  });

  it("stores redactshot regions per origin and page template", async () => {
    const store = new sessionmemory(new fakeadapter());
    const region = { id: "r1", origin: "https://bank.example", template: "login", x: 0, y: 0, width: 10, height: 10, reason: "the card field", source: "userdrawn" as const, createdat: 1 };
    await store.addredactregion(region);
    expect((await store.getredactregions())).toHaveLength(1);
    await store.removeredactregion("r1");
    expect(await store.getredactregions()).toEqual([]);
  });

  it("stores phishguard verdicts and expires the ones past the freshness window", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addphishverdict({ origin: "https://pay.example.com", matchedorigin: "https://pay.example.com", distance: 0.2, threshold: 0.4, blocked: false, reason: "under the threshold", at: 1 });
    await store.addphishverdict({ origin: "https://pay.example.com", distance: 0.3, threshold: 0.4, blocked: true, reason: "crossed the threshold", at: 5 });
    expect((await store.getphishverdicts())).toHaveLength(1);
    expect((await store.getphishverdicts())[0]?.at).toBe(5);
    expect(await store.expirephishverdicts(undefined, 100)).toHaveLength(1);
    expect(await store.expirephishverdicts(10, 100)).toEqual([]);
  });

  it("stores permdiff records of each installed version with the last permission set", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addpermdiff({ fromversion: "1.1.61", toversion: "1.1.62", added: ["optional:downloads"], removed: [], computedat: 1 });
    expect((await store.getpermdiffs())[0]?.added).toEqual(["optional:downloads"]);
    await store.setlastpermissions(["required:storage"], "1.1.62");
    expect(await store.getlastpermissions()).toEqual({ permissions: ["required:storage"], version: "1.1.62" });
  });

  it("records safedefaults applications with their first seen origins and deferred command events", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addsafedefaultapplication({ origin: "https://first.example", firstseenat: 1 });
    await store.addsafedefaultapplication({ origin: "https://first.example", firstseenat: 2 });
    expect(await store.getsafedefaultapplications()).toEqual([{ origin: "https://first.example", firstseenat: 1 }]);
    await store.adddeferredevent({ id: "d1", stepid: "step", kind: "click", origin: "https://example.com", reason: "bucket full", resetsat: 10, at: 1 });
    expect((await store.getdeferredevents())[0]?.resetsat).toBe(10);
  });

  it("serves the transparency data of the transparencypage in one read", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addallowlistorigin({ origin: "https://example.com", profileid: "profile", grantedat: 1 });
    await store.addconnectallow({ senderid: "sender", displayname: "Bridge", addedat: 1 });
    await store.addsecret({ vaultid: "v1", label: "Bank login", scope: "https://bank.example", profileid: "profile", provenance: "user", algorithm: "sha-256", digest: "sha256:abc", createdat: 1 });
    await store.addpermdiff({ fromversion: "1.1.61", toversion: "1.1.62", added: [], removed: [], computedat: 1 });
    await store.addsafedefaultapplication({ origin: "https://first.example", firstseenat: 1 });
    await store.savegate({ gateid: "g1", kind: "confirmpay", stepid: "step", runid: "run", origin: "https://shop.example", payload: {}, state: "open", openedat: 1 });
    await store.adddeferredevent({ id: "d1", stepid: "step", kind: "click", origin: "https://example.com", reason: "bucket full", resetsat: 10, at: 1 });
    await store.addphishverdict({ origin: "https://pay.example.com", distance: 0.2, threshold: 0.4, blocked: false, reason: "under", at: 1 });
    const view = await store.gettransparencyview();
    expect(view.allowlist).toHaveLength(1);
    expect(view.profiles).toEqual([]);
    expect(view.connectallow).toHaveLength(1);
    expect(view.permdiffs).toHaveLength(1);
    expect(view.safedefaults).toHaveLength(1);
    expect(view.vault[0]?.label).toBe("Bank login");
    expect(view.gates[0]?.gateid).toBe("g1");
    expect(view.resolutions).toEqual([]);
    expect(view.deferred).toHaveLength(1);
    expect(view.phishverdicts).toHaveLength(1);
  });
});

/* ── The 1.1.95 purge and export completeness of the stored families. ── */

describe("sessionmemory purge and export completeness", () => {
  it("lists the stored keys of every run trace and session trail the families wrote", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setrunrecord({ runid: "run-one", planid: "plan", sessionid: "session", state: "completed", createdat: 1, updatedat: 2 });
    await store.setrunrecord({ runid: "run-two", planid: "plan", sessionid: "session", state: "running", createdat: 3, updatedat: 4 });
    await store.addsessionrecord({ id: "session", name: "workspace", createdat: 1, tabs: [], captures: [], storage: [], cookies: [], tags: [] });
    const keys = await store.storedkeys();
    expect(keys).toContain("runs");
    expect(keys).toContain("runlogrun-one");
    expect(keys).toContain("runscopesrun-one");
    expect(keys).toContain("runtimeline:run-one");
    expect(keys).toContain("provlog:run-one");
    expect(keys).toContain("runlogrun-two");
    expect(keys).toContain("trailsession");
    expect(keys).toContain("audit");
  });

  it("purges every trace key of one run while the other runs and the audit family survive", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setrunrecord({ runid: "run-one", planid: "plan", sessionid: "session", state: "completed", createdat: 1, updatedat: 2 });
    await store.setrunrecord({ runid: "run-two", planid: "plan", sessionid: "session", state: "running", createdat: 3, updatedat: 4 });
    await store.setrunscopes("run-one", []);
    await store.setrunscopes("run-two", []);
    const keys = await store.storedkeys();
    const trace = keys.filter(key => key.includes("run-one"));
    expect(trace.length).toBeGreaterThan(0);
    await store.purgekeys(trace);
    expect(await store.getrunscopes("run-one")).toEqual([]);
    expect(keys.filter(key => key.includes("run-two")).length).toBeGreaterThan(0);
    expect(keys).toContain("runs");
    expect(keys).toContain("audit");
  });
});
