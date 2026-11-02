/**
 * local tests prove the core contract without network or credentials.
 */
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { eventbus } from "../foundation.js";
import { validationerror } from "../foundation.js";
import { localmemory } from "../virtual.js";
import { inprocess } from "../execution.js";
import { scheduler } from "../execution.js";
import { runnerhealth, runnerhealthall } from "../execution.js";
import { heartbeat } from "../execution.js";
import { engine } from "../execution.js";
import { localstorage } from "../virtual.js";
import { chunkedstorage } from "../virtual.js";
import { contentstorage } from "../virtual.js";
import { s3compatible } from "../virtual.js";
import { tieredcache } from "../virtual.js";
import { comparemanifests, objectmanifest, storagecapabilities, syncobject } from "../virtual.js";
import { storagepool } from "../virtual.js";
import { bridgeplan, materializationledger, materializationrecord, workingadmission } from "../virtual.js";
import { cachedecision, cacheeligibility, executeisolated, magicbytes, transformationcache, transformationkey, wasmplan } from "../distribution.js";
import { archiveinspection, extractarchive } from "../distribution.js";
import { executiondecision, executionhandoff, executionrequest, internalapi } from "../isolation.js";
import { virtualbrowserdecision, virtualbrowserhandoff, virtualbrowserreceipt, virtualbrowserrequest } from "../browser.js";
import { artifacthandoff, cancellationplan, providerchain, renderdispatch } from "../execution.js";
import { cdncapabilities, deliverymanifest, pwaplan, verifydelivery } from "../distribution.js";
import { validatesession } from "../foundation.js";
import { sessionstore } from "../execution.js";
import { externalmemory, internalmemory, vectorizedmemory } from "../virtual.js";
import { modeprofile } from "../modes.js";
import { transport } from "../integration.js";
import { githubadapter } from "../integration.js";
import { memorypersistence } from "../virtual.js";
import { prismaschema, schemasql } from "../virtual.js";
import { jobqueue } from "../execution.js";
import { saga } from "../execution.js";
import { workflowdispatch } from "../execution.js";
import { replay } from "../execution.js";
import { distributionmanifest, binaryplan, containerplan } from "../distribution.js";
import { forgejoadapter } from "../integration.js";
import { appregistry } from "../integration.js";
import { jsonencode, jsondecode } from "../communication.js";
import { ndjsonencode, ndjsondecode } from "../communication.js";
import { sseencode, ssedecode } from "../communication.js";
import { blockstream } from "../communication.js";
import { sqlpersistence, mysql2persistence } from "../virtual.js";
import { drizzlepersistence } from "../virtual.js";
import { prismapersistence } from "../virtual.js";
import { memoryengine } from "../virtual.js";
import { targetfactory, targeturi } from "../virtual.js";
import { filesessions } from "../execution.js";
import { mcpserver } from "../integration.js";
import { runtimename, runtimefeatures } from "../execution.js";
import { deadline } from "../execution.js";
import { publishplan, registrymanifest } from "../distribution.js";
import { fingerprintfor, fingerprintvalidate } from "../browser.js";
import { browsersession } from "../browser.js";
import { webhooksig, webhookverify } from "../communication.js";
import { webhookreceiver } from "../communication.js";
import { deliveryqueue } from "../communication.js";
import { browseragent } from "../browser.js";
import { actionbatch, actionfailure, actionresult } from "../browser.js";
import { browsercontext } from "../browser.js";
import { actionrecorder } from "../browser.js";
import { assertfreshsnapshot, pagesnapshot, pagesnapshotdiff, snapshotref, projectcontext } from "../browser.js";
import { operationerror, classifyerror } from "../foundation.js";
import { retrypolicy, circuitbreaker } from "../execution.js";
import { nodeserver } from "../server.js";
import { githubcontents } from "../virtual.js";
import { filehosting } from "../virtual.js";
import { modecatalog, operationmodes, validatemode } from "../modes.js";
import { resolvemode, withmode, capabilityreport } from "../modes.js";
import { portablebinaryplan, binarymanifest, buildbinary } from "../distribution.js";
import { targetcatalog, targetmanifest } from "../modes.js";
import { persistentqueue } from "../execution.js";
import { migrationplan, latestmigration } from "../virtual.js";
import { mcptransport } from "../integration.js";
import { ispublicurl } from "../communication.js";
import { assertredirectchain, assertresolvedpublicurl } from "../communication.js";
import { authorize } from "../communication.js";
import { errorpayload, requestcontext, successpayload } from "../communication.js";
import { browsertools } from "../integration.js";
import { resumablerun, runrecord, transitionrun } from "../execution.js";
import { controlservice } from "../communication.js";
import { hmacsha256, sha256 } from "../foundation.js";
import { workerbridge } from "../execution.js";
import { evaluateevidence, releaseevidence, releasereadiness } from "../distribution.js";

describe("the engine contract", () => {
it("keeps the Playwright provider optional and explicit", async () => {
  const { createplaywrightsession } = await import("../browser.js");
  /* the provider stays optional: with the dependency absent the import
     refuses, and with the dependency present but the browser binaries
     uninstalled the launch refuses with the playwright executable error —
     both are the explicit refusal this contract wants, never a fallback. */
  try {
    const session = await createplaywrightsession();
    /* the dependency and the binaries exist in this environment: the launch
       is still the explicit provider behavior, never a silent fallback */
    assert.ok(session, "the playwright session launches when installed");
  } catch (error) {
    assert.ok(
      error.code === "OPTIONAL_DEPENDENCY_MISSING" ||
        error.code === "ERR_MODULE_NOT_FOUND" ||
        /Executable doesn't exist|Playwright was just installed/i.test(String(error.message)),
      "the refusal is the explicit playwright one, never a fallback",
    );
  }
});

it("evaluates release evidence without turning declarations into trust claims", () => {
  const digest = "a".repeat(64);
  const verified = releaseevidence({ kind: "provenance", status: "verified", subjectdigest: digest, producer: "https://github.com/wenathlan/saddle", workflow: "release.yml", verificationmethod: "offline-bundle", verifiedat: 100 });
  const accepted = evaluateevidence({ subjectdigest: digest, evidence: [verified], policy: { requiredkinds: ["provenance"], allowedstatuses: ["verified"], expectedproducer: { provenance: "https://github.com/wenathlan/saddle" }, expectedworkflow: { provenance: "release.yml" } } });
  assert.equal(accepted.decision, "accepted");
  assert.deepEqual(accepted.reasons, []);
  const insufficient = evaluateevidence({ subjectdigest: digest, evidence: [{ kind: "sbom", status: "declared" }], policy: { requiredkinds: ["provenance"] } });
  assert.equal(insufficient.decision, "insufficient");
  assert.deepEqual(insufficient.reasons, ["required-evidence-missing:provenance"]);
});

it("rejects release evidence that mismatches the requested producer or subject", () => {
  const evidence = releaseevidence({ kind: "provenance", status: "verified", subjectdigest: "a".repeat(64), producer: "unexpected", verificationmethod: "fixture", verifiedat: 1 });
  const result = evaluateevidence({ subjectdigest: "b".repeat(64), evidence: [evidence], policy: { requiredkinds: ["provenance"], expectedproducer: { provenance: "expected" } } });
  assert.equal(result.decision, "rejected");
  assert.deepEqual(result.reasons, ["producer-mismatch:provenance", "required-evidence-unsatisfied:provenance", "subject-mismatch:provenance"]);
});

it("creates a release readiness receipt without performing release actions", () => {
  const digest = "c".repeat(64);
  const ready = releasereadiness({ sourcetag: "v1.8.16", manifestversions: { npm: "1.8.16", maven: "1.8.16" }, requiredgates: { tests: "passed", format: "passed" }, artifactplandigest: digest, targets: ["ghcr", "npmjs"], signingstatus: "caller-configured", evaluation: { evidence: [{ kind: "provenance", status: "verified", subjectdigest: digest, producer: "release", verificationmethod: "fixture", verifiedat: 1 }], subjectdigest: digest, policy: { requiredkinds: ["provenance"], expectedproducer: { provenance: "release" } } } });
  assert.equal(ready.ready, true);
  assert.equal(ready.decision, "accepted");
  const incomplete = releasereadiness({ sourcetag: "v1.8.16", manifestversions: { npm: "1.8.15" }, requiredgates: { tests: "failed" }, targets: [], evaluation: {} });
  assert.equal(incomplete.ready, false);
  assert.equal(incomplete.decision, "insufficient");
  assert.deepEqual(incomplete.reasons, ["artifact-plan-digest-missing", "manifest-version-mismatch", "publication-targets-missing", "required-gate-not-passed:tests", "signing-status-unknown"]);
});

it("runs a job through prepare process sync and commit", async () => {
  const root = await mkdtemp(join(tmpdir(), "saddletest"));
  const events = eventbus();
  const run = engine({ storage: localstorage(root), memory: localmemory(), scheduler: scheduler([inprocess()]), events });
  const result = await run.run({ name: "testjob", input: { value: 42 }, outputkey: "results/test.json" }, ({ job }) => ({ job: job.id, result: "ok" }));
  const stored = await localstorage(root).get("results/test.json");
  assert.equal(result.job.status, "completed");
  assert.equal(result.artifact.key, "results/test.json");
  assert.equal(new TextDecoder().decode(stored).includes('"result":"ok"'), true);
  assert.deepEqual(events.all().map((event) => event.type), ["jobqueued", "jobpreparing", "runnerselected", "jobrunning", "jobsyncing", "storagecommitted", "jobcompleted"]);
});

it("selects the first available provider by priority", async () => {
  const first = inprocess({ id: "first", priority: 0 });
  const second = inprocess({ id: "second", priority: 1 });
  first.setavailable(false);
  const selected = await scheduler([second, first]).select({ id: "job1" });
  assert.equal(selected.descriptor().id, "second");
});

it("reports runner health and capacity without selecting infrastructure", async () => {
  const available = inprocess({ id: "available", capabilities: ["node"] });
  const offline = inprocess({ id: "offline", status: "offline" });
  assert.equal((await runnerhealth(available)).healthy, true);
  const report = await runnerhealthall([available, offline]);
  assert.equal(report.total, 2);
  assert.equal(report.available, 1);
});

it("emits cooperative heartbeat signals and stops cleanly", async () => {
  const values = [];
  const signal = heartbeat({ id: "job1", interval: 1000 });
  signal.on((event) => values.push(event));
  const tick = await signal.tick({ status: "running", metadata: { stage: "sync" } });
  assert.equal(tick.sequence, 1);
  assert.equal(values[0].metadata.stage, "sync");
  assert.equal(signal.status().running, false);
});

it("rejects negative session event time", () => {
  assert.throws(() => validatesession({ version: 1, id: "session1", agentname: "test", originurl: "https://example.com", seed: "seed", status: "closed", startedat: 1, events: [{ t: -1, type: "move" }] }), (error) => error.code === "INVALID_INPUT");
});

it("rejects traversal storage keys", async () => {
  const root = await mkdtemp(join(tmpdir(), "saddlestorage"));
  await assert.rejects(() => localstorage(root).put({ key: "../escape", data: new Uint8Array([1]) }), (error) => error.code === "INVALID_INPUT");
});

it("stores and rebuilds chunked artifacts", async () => {
  const root = await mkdtemp(join(tmpdir(), "saddlechunks"));
  const storage = chunkedstorage(localstorage(root), { chunkbytes: 3 });
  const input = new TextEncoder().encode("saddle engine");
  const manifest = await storage.put({ key: "large/data", data: input, contenttype: "text/plain" });
  const rebuilt = await storage.get("large/data");
  assert.equal(manifest.chunks.length, 5);
  assert.equal(new TextDecoder().decode(rebuilt), "saddle engine");
});

it("reads bounded ranges from chunked storage", async () => {
  const root = await mkdtemp(join(tmpdir(), "saddlerange"));
  const storage = chunkedstorage(localstorage(root), { chunkbytes: 3 });
  await storage.put({ key: "range/data", data: new TextEncoder().encode("saddle engine") });
  assert.equal(new TextDecoder().decode(await storage.getrange("range/data", 2, 8)), "ddle e");
});

it("deduplicates immutable bytes while keeping logical content references", async () => {
  const root = await mkdtemp(join(tmpdir(), "saddlecontent"));
  const base = localstorage(root);
  const content = contentstorage(base);
  const first = await content.put({ key: "one", data: new TextEncoder().encode("same") });
  const second = await content.put({ key: "two", data: new TextEncoder().encode("same") });
  assert.equal(first.objectkey, second.objectkey);
  assert.equal(new TextDecoder().decode(await content.get("two")), "same");
  assert.equal((await content.head("one")).sha256, first.sha256);
});

it("serves fresh and stale values through a bounded tiered cache", async () => {
  let clock = 0;
  let loads = 0;
  const cache = tieredcache({ now: () => clock, ttl: 10, stale: 20, maxentries: 2 });
  await cache.set("key", "old");
  clock = 15;
  assert.equal(await cache.getorload("key", async () => { loads += 1; return "new"; }), "old");
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(loads, 1);
  assert.equal(cache.inspect().stalehits, 1);
  clock = 40;
  assert.equal(await cache.get("key"), null);
});

it("classifies manifests and syncs a newer source with explicit conflict policy", async () => {
  const sourcevalues = new Map([["key", new TextEncoder().encode("source")]]);
  const targetvalues = new Map();
  const source = { head: async () => objectmanifest("key", sourcevalues.get("key"), { updatedat: 2 }), get: async (key) => sourcevalues.get(key) };
  const target = { head: async () => null, put: async ({ key, data }) => targetvalues.set(key, data) };
  const result = await syncobject(source, target, "key");
  assert.equal(result.state, "copied");
  assert.equal(new TextDecoder().decode(targetvalues.get("key")), "source");
  assert.equal(comparemanifests({ sha256: "a", updatedat: 1 }, { sha256: "b", updatedat: 2 }).state, "remotenewer");
  assert.equal(storagecapabilities(target).metadata, true);
});

it("persists a session as jsonl", async () => {
  const root = await mkdtemp(join(tmpdir(), "saddlesessions"));
  const store = sessionstore(root);
  const session = { version: 1, id: "session1", agentname: "engine", originurl: "https://example.com", seed: "seed", status: "recording", startedat: 1, events: [{ t: 0, type: "move", x: 1, y: 2 }] };
  await store.append(session);
  const records = await store.read("session1");
  assert.equal(records.length, 1);
  assert.equal(records[0].events[0].type, "move");
});

it("supports internal external vectorized and library memory choices", async () => {
  const internal = internalmemory();
  await internal.put("message", "saddle");
  assert.equal(new TextDecoder().decode(await internal.get("message")), "saddle");
  const external = externalmemory(localstorage(await mkdtemp(join(tmpdir(), "saddleexternal"))));
  await external.put("message.bin", "saddle");
  assert.equal(new TextDecoder().decode(await external.get("message.bin")), "saddle");
  const vector = vectorizedmemory();
  await vector.put("one", [1, 3]);
  await vector.put("two", [3, 5]);
  assert.deepEqual(await vector.average(["one", "two"]), [2, 4]);
});

it("describes paired operation modes", () => {
  const modes = modeprofile({ enabled: ["library", "browser"], paired: ["browser"] });
  assert.equal(modes.library.enabled, true);
  assert.equal(modes.browser.paired, true);
  assert.equal(modes.cli.enabled, false);
});

it("retries transient transport responses", async () => {
  let calls = 0;
  const client = transport({ attempts: 2, backoff: 0, fetcher: async () => { calls += 1; return calls === 1 ? { ok: false, status: 503 } : { ok: true, status: 200 }; } });
  const response = await client.request("https://example.com/health");
  assert.equal(response.status, 200);
  assert.equal(calls, 2);
});

it("github adapter keeps endpoint and token injectable", async () => {
  let request;
  const adapter = githubadapter({ baseurl: "https://api.example.com/", token: async () => "token", fetcher: async (url, init) => { request = { url: String(url), init }; return { ok: true, status: 204, json: async () => ({ ok: true }) }; } });
  const result = await adapter.dispatch("owner", "repo", "workflow", { ref: "main", inputs: { jobid: "job1" } });
  assert.equal(result.accepted, true);
  assert.equal(request.init.headers.authorization, "Bearer token");
  assert.equal(request.url.includes("actions/workflows/workflow/dispatches"), true);
});

it("provides neutral persistence schemas and memory persistence", async () => {
  const persistence = memorypersistence();
  await persistence.savejob({ id: "job1", status: "queued", name: "test", priority: 0 });
  await persistence.updatejob("job1", { status: "running" });
  await persistence.saveevent({ id: "event1", jobid: "job1", type: "jobrunning", at: 1, data: {} });
  assert.equal((await persistence.getjob("job1")).status, "running");
  assert.equal((await persistence.listevents("job1")).length, 1);
  assert.equal(schemasql({ dialect: "mysql" }).length, 6);
  assert.equal(prismaschema().includes("model job"), true);
});

it("queues retryable jobs and keeps idempotent results", async () => {
  let attempts = 0;
  const queue = jobqueue({ concurrency: 1, maxattempts: 2, backoff: 0 });
  const handler = async () => { attempts += 1; if (attempts === 1) throw { retryable: true }; return "done"; };
  const first = await queue.add({ value: 1 }, handler, { key: "same" });
  const second = await queue.add({ value: 1 }, handler, { key: "same" });
  assert.equal(first, "done");
  assert.equal(second, "done");
  assert.equal(attempts, 2);
});

it("runs saga compensations in reverse order", async () => {
  const steps = [];
  await assert.rejects(() => saga([{ run: async () => { steps.push("one"); return 1; }, compensate: async () => steps.push("undoone") }, { run: async () => { steps.push("two"); throw new Error("stop"); }, compensate: async () => steps.push("undotwo") }]), /stop/);
  assert.deepEqual(steps, ["one", "two", "undoone"]);
});

it("dispatches a workflow once for an idempotency key", async () => {
  let calls = 0;
  const dispatch = workflowdispatch({ dispatch: async () => { calls += 1; return { accepted: true, status: 204 }; } });
  const spec = { owner: "owner", repository: "repo", workflow: "ci", ref: "main", inputs: { jobid: "job1" }, requestid: "request1" };
  const first = await dispatch.submit(spec);
  const second = await dispatch.submit(spec);
  assert.equal(first.requestid, second.requestid);
  assert.equal(calls, 1);
});

it("replays validated events through an injected browser adapter", async () => {
  const calls = [];
  const adapter = { move: async () => calls.push("move"), click: async () => calls.push("click"), drag: async () => calls.push("drag"), scroll: async () => calls.push("scroll"), key: async () => calls.push("key") };
  const result = await replay({ events: [{ t: 0, type: "move" }, { t: 0, type: "click" }, { t: 0, type: "key" }] }, adapter);
  assert.deepEqual(calls, ["move", "click", "key"]);
  assert.equal(result.events, 3);
});

it("restores window, tab and frame context before replay actions", async () => {
  const calls = [];
  const adapter = {
    move: async () => undefined,
    click: async () => calls.push("click"),
    async selectwindow(id) { calls.push(["window", id]); },
    async selecttab(id) { calls.push(["tab", id]); },
    async selectframe(id) { calls.push(["frame", id]); }
  };
  const result = await replay({ events: [
    { t: 0, type: "click", context: { windowid: "window1", tabid: "tab1", frameid: "main" } },
    { t: 0, type: "click", context: { windowid: "window1", tabid: "tab1", frameid: "frame2" } },
    { t: 0, type: "click", context: { windowid: "window1", tabid: "tab2", frameid: "main" } }
  ] }, adapter);
  assert.deepEqual(calls, [["window", "window1"], ["tab", "tab1"], ["frame", "main"], "click", ["frame", "frame2"], "click", ["tab", "tab2"], ["frame", "main"], "click"]);
  assert.equal(result.contextswitches, 3);
});

it("validates replay context identifiers and records context provenance", () => {
  const session = validatesession({ version: 1, id: "session1", agentname: "test", originurl: "https://example.com", seed: "seed", status: "closed", startedat: 1, events: [{ t: 0, type: "click", context: { windowid: "window1", tabid: "tab1", frameid: "main" } }] });
  assert.deepEqual(session.events[0].context, { windowid: "window1", tabid: "tab1", frameid: "main" });
  assert.throws(() => validatesession({ version: 1, id: "session1", agentname: "test", originurl: "https://example.com", seed: "seed", status: "closed", startedat: 1, events: [{ t: 0, type: "click", context: { tabid: 7 } }] }), (error) => error.code === "INVALID_INPUT");
});

it("builds open distribution plans", () => {
  const manifest = distributionmanifest({ name: "saddle", version: "0.2.0", entry: "cli/main.js" });
  const binary = binaryplan(manifest, { tool: "node" });
  const container = containerplan(manifest, { base: "node:26.12.0-alpine" });
  assert.equal(binary.entry, "cli/main.js");
  assert.equal(container.dockerfile.includes("from node:26.12.0-alpine"), true);
  assert.equal(container.dockerfile.includes("expose"), false);
});

it("keeps multiforge adapters injectable", async () => {
  const adapter = forgejoadapter({ baseurl: "https://forge.example.com/", token: async () => "token", fetcher: async (_url, init) => ({ ok: true, status: 200, json: async () => ({ authorization: init.headers.authorization }) }) });
  const result = await adapter.dispatch({ path: "/api/workflow", ref: "main", inputs: { jobid: "job1" } });
  assert.equal(result.accepted, true);
  assert.equal(result.body.authorization, "Bearer token");
});

/* the bot command pair (parsecommand/saddlebot, commandguard) moved to
 * devthink with the automation domain (the saddle ownership law, wave a,
 * actions 108-112 — the moved lane keeps its battery at
 * devthink/tests/automation.test.ts). */

it("tracks app installation scopes and revocation", () => {
  const registry = appregistry();
  registry.install({ id: "app1", name: "Forge", scopes: ["read", "write"] });
  assert.equal(registry.authorize("app1", ["read"]).allowed, true);
  assert.equal(registry.authorize("app1", ["admin"]).allowed, false);
  registry.revoke("app1");
  assert.equal(registry.authorize("app1", ["read"]).reason, "app-revoked");
});

it("retries retryable deliveries and records dead letters", async () => {
  let attempts = 0;
  const queue = deliveryqueue({ maxattempts: 2 });
  const delivered = await queue.deliver({ id: "delivery1", event: { type: "push" } }, async () => { attempts += 1; if (attempts === 1) { const error = new Error("temporary"); error.retryable = true; throw error; } return { ok: true }; });
  assert.equal(delivered.status, "delivered");
  assert.equal(delivered.attempts, 2);
  const dead = await queue.deliver({ id: "delivery2", event: {} }, async () => { throw new Error("permanent"); });
  assert.equal(dead.status, "dead");
  assert.equal(queue.deadletters().length, 1);
});

it("serializes json ndjson sse and bounded blocks", async () => {
  assert.deepEqual(jsondecode(jsonencode({ ok: true })), { ok: true });
  const encoded = [];
  for await (const line of ndjsonencode([{ id: 1 }, { id: 2 }])) encoded.push(line);
  const decoded = [];
  for await (const item of ndjsondecode(encoded)) decoded.push(item);
  assert.deepEqual(decoded, [{ id: 1 }, { id: 2 }]);
  const event = sseencode({ id: "event1", event: "job", data: { ok: true } });
  assert.deepEqual(ssedecode(event), { id: "event1", event: "job", data: { ok: true } });
  const blocks = [];
  for await (const block of blockstream(new TextEncoder().encode("abcdef"), { blockbytes: 2 })) blocks.push(block);
  assert.equal(blocks.length, 3);
  assert.equal(blocks.at(-1).final, true);
  assert.equal(new TextDecoder().decode(blocks[1].data), "cd");
});

it("exposes sql and mysql2 persistence through an injected query", async () => {
  const calls = [];
  const query = async (statement, values) => { calls.push({ statement, values }); if (statement.startsWith("select * from jobs where id")) return [[{ id: "job1", name: "test", status: "queued", priority: 0, input: "{}" }], []]; return [{ affectedRows: 1 }, []]; };
  const sql = sqlpersistence({ query });
  await sql.savejob({ id: "job1", name: "test", status: "queued", priority: 0, input: {} });
  assert.equal((await sql.getjob("job1")).id, "job1");
  assert.equal(calls.length, 2);
  const mysql = mysql2persistence({ execute: query });
  await mysql.saveevent({ id: "event1", jobid: "job1", type: "jobqueued", at: 1, data: {} });
  assert.equal(calls.length, 3);
});

it("accepts drizzle repositories and prisma delegates", async () => {
  const names = ["savejob", "getjob", "updatejob", "listjobs", "saveevent", "listevents", "savesession", "readsession", "saveartifact", "getartifact", "savechunk", "getchunks"];
  const repository = Object.fromEntries(names.map((name) => [name, async (...args) => ({ name, args })]));
  assert.equal((await drizzlepersistence(repository).getjob("job1")).name, "getjob");
  const delegate = { upsert: async (value) => value, findUnique: async (value) => value, update: async (value) => value, findMany: async (value) => value, create: async (value) => value };
  const prisma = prismapersistence({ job: delegate, event: delegate, session: delegate, artifact: delegate, chunk: delegate });
  assert.equal((await prisma.getjob("job1")).where.id, "job1");
});

/* the workflow manifest trio (workflowmanifest, the trigger registry and
 * the renderer pair) moved to devthink with the automation domain (the
 * saddle ownership law, wave a, actions 108-112 — the moved lanes keep
 * their battery at devthink/tests/automation.test.ts). */

it("resumes a remote run through legal transitions and preserves history", async () => {
  const calls = [];
  const run = resumablerun({
    async submit() { calls.push("submit"); return { runid: "run1" }; },
    async resume(record) { calls.push(`resume:${record.runid}`); },
    async status() { calls.push("status"); return { status: "running" }; },
    async cancel() { calls.push("cancel"); return { accepted: true }; }
  }, { requestid: "request1", name: "job", compensate: async ({ run: cancelled }) => { calls.push(`compensate:${cancelled.status}`); return { released: true }; } });
  await run.submit();
  const current = await run.resume();
  assert.equal(current.status, "running");
  const cancelled = await run.cancel();
  assert.equal(run.get().status, "cancelled");
  assert.equal(cancelled.compensation.status, "succeeded");
  assert.deepEqual(calls, ["submit", "resume:run1", "status", "cancel", "compensate:cancelled"]);
  await run.cancel();
  assert.deepEqual(calls, ["submit", "resume:run1", "status", "cancel", "compensate:cancelled"]);
  assert.equal(transitionrun(runrecord({ requestid: "r", name: "n" }), "submitted").attempt, 1);
});

it("loads from the first backend and persists to all backends", async () => {
  const first = new Map();
  const second = new Map();
  const backend = (values) => ({ get: async (key) => values.get(key) ?? null, put: async (key, value) => values.set(key, value), delete: async (key) => values.delete(key) });
  first.set("known", { data: new TextEncoder().encode("value"), contenttype: "text/plain" });
  const memory = memoryengine({ backends: [backend(first), backend(second)] });
  const loaded = await memory.load("known");
  assert.equal(new TextDecoder().decode(loaded.buffer), "value");
  await memory.persist("new", "saddle");
  assert.equal(new TextDecoder().decode(second.get("new").data), "saddle");
  assert.equal((await memory.safeload("missing")).success, false);
});

it("lists paginated S3-compatible objects with a caller signer", async () => {
  const calls = [];
  const pages = [
    "<ListBucketResult><IsTruncated>true</IsTruncated><NextContinuationToken>next&amp;token</NextContinuationToken><Contents><Key>folder/a&amp;b.txt</Key><Size>3</Size><ETag>&quot;etag-a&quot;</ETag></Contents></ListBucketResult>",
    "<ListBucketResult><IsTruncated>false</IsTruncated><Contents><Key>folder/c.txt</Key><Size>4</Size><LastModified>2026-08-14T00:00:00Z</LastModified></Contents></ListBucketResult>",
  ];
  const storage = s3compatible({ endpoint: "https://s3.example.test", bucket: "bucket", sign: async (input) => { calls.push(input); return { url: "https://s3.example.test/bucket", headers: {} }; }, fetcher: async () => new Response(pages.shift(), { status: 200 }) });
  const entries = await storage.list("folder/", { maxkeys: 1 });
  assert.deepEqual(entries.map((entry) => entry.key), ["folder/a&b.txt", "folder/c.txt"]);
  assert.equal(entries[0].sha256, "etag-a");
  assert.equal(calls.length, 2);
  assert.equal(calls[0].query["list-type"], "2");
  assert.equal(calls[0].query.prefix, "folder/");
  assert.equal(calls[1].query["continuation-token"], "next&token");
});

it("bounds the hot working set with LRU eviction and byte accounting", async () => {
  const values = new Map();
  const backend = { get: async (key) => values.get(key) ?? null, put: async (key, value) => values.set(key, value), delete: async (key) => values.delete(key) };
  const memory = memoryengine({ backends: [backend], maxentries: 2, maxbytes: 12 });
  await memory.persist("one", "123456");
  await memory.persist("two", "123456");
  await memory.load("one");
  await memory.persist("three", "123456");
  assert.deepEqual(memory.list(), ["one", "three"]);
  assert.equal(memory.stats().entries, 2);
  assert.equal(memory.stats().bytes, 12);
  assert.equal(memory.stats().evictions, 1);
  await memory.load("two");
  assert.equal(memory.stats().misses, 1);
});

it("syncs a working set object between memory backends with explicit capabilities", async () => {
  const first = new Map([["sync", { data: new TextEncoder().encode("source"), contenttype: "text/plain", sha256: "source" }]]);
  const second = new Map();
  const backend = (values) => ({ get: async (key) => values.get(key)?.data ?? values.get(key) ?? null, head: async (key) => values.get(key) ?? null, put: async ({ key, data, contenttype, metadata }) => values.set(key, { data, contenttype, metadata }), delete: async (key) => values.delete(key), list: async () => [...values.keys()] });
  const memory = memoryengine({ backends: [backend(first), backend(second)] });
  const result = await memory.sync("sync");
  assert.equal(result[0].state, "copied");
  assert.equal(new TextDecoder().decode(second.get("sync").data), "source");
  assert.equal(memory.capabilities()[0].capabilities.range, false);
});

it("builds open memory targets and transforms", () => {
  const target = targetfactory("github", { owner: "owner", repo: "repo", path: "file.bin" });
  assert.equal(targeturi(target), "github://owner/repo/file.bin");
  const compute = memoryengine().transformtocompute("saddle");
  const result = memoryengine().transformtostorage(compute);
  assert.equal(result.mimetype, "application/octet-stream");
  assert.equal(result.payload.byteLength, 6);
});

it("keeps API identity and authorization caller-owned", async () => {
  const request = new Request("https://api.example.com/health", { headers: { authorization: "Bearer token", "x-request-id": "req1" } });
  const context = requestcontext(request, { path: "/health" });
  assert.equal(context.requestid, "req1");
  assert.equal((await authorize(request, { verify: async (token) => token === "token" ? { subject: "user1", claims: { role: "agent" } } : null })).subject, "user1");
  assert.equal(successpayload({ ok: true }, context).requestid, "req1");
  assert.equal(errorpayload("BAD", "bad", context).error.code, "BAD");
});

it("blocks unsafe redirect chains and resolved private addresses", async () => {
  assert.deepEqual(assertredirectchain(["https://example.com", "https://example.org/path"]), ["https://example.com/", "https://example.org/path"]);
  assert.throws(() => assertredirectchain(["https://example.com", "https://example.org", "https://example.net", "https://example.dev", "https://example.test", "https://example.invalid"], { maxredirects: 4 }), /redirect chain/);
  await assert.rejects(() => assertresolvedpublicurl("https://example.com", { resolve: async () => ["127.0.0.1"] }), /private/);
});

it("exposes optional browser snapshot and action tools through MCP", async () => {
  const tools = browsertools({ snapshot: async (input) => ({ snapshotid: input.id ?? "snap" }), action: async (input) => ({ action: input.action }) });
  assert.equal((await tools.browser_snapshot({ id: "snap1" })).snapshotid, "snap1");
  assert.equal((await tools.browser_action({ action: "click" })).action, "click");
});

it("saves and loads a validated session file", async () => {
  const root = await mkdtemp(join(tmpdir(), "saddle-session-file"));
  const store = filesessions(root);
  const session = { version: 1, id: "sessionfile", agentname: "test", originurl: "https://example.com", seed: "seed", status: "closed", startedat: 1, events: [] };
  await store.save(session);
  assert.equal((await store.load("sessionfile")).id, "sessionfile");
});

it("serves the transport-neutral MCP tool surface", async () => {
  const server = mcpserver();
  const response = await server.handle({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "serialize", arguments: { value: { ok: true } } } });
  assert.equal(response.result.content[0].type, "text");
  assert.equal(JSON.parse(response.result.content[0].text), '{"ok":true}');
});

it("detects universal runtime capabilities and creates a deadline", () => {
  assert.equal(runtimename({ process: { versions: { node: "22" } } }), "node");
  assert.equal(runtimefeatures({ fetch: () => undefined, ReadableStream, WritableStream }).fetch, true);
  const timer = deadline(1000);
  assert.equal(timer.signal.aborted, false);
  timer.cancel();
});

it("creates registry and CDN publication plans without publishing", () => {
  const manifest = { name: "@wenathlan/saddle", version: "0.2.0" };
  const plan = publishplan(manifest, { repository: "iakadion/saddle" });
  assert.equal(plan.package.command, "npm publish --access public");
  assert.equal(plan.cdn[0].url.includes("jsdelivr"), true);
  assert.equal(registrymanifest(manifest).surfaces.includes("container"), true);
});

it("keeps a coherent browser fingerprint bound to a session", () => {
  const fingerprint = fingerprintfor("session1");
  assert.equal(fingerprintvalidate(fingerprint), true);
  const session = browsersession({ id: "session1", fingerprint, proxy: { id: "proxy1" } });
  session.record({ t: 0, type: "move", x: 1, y: 2 });
  assert.equal(session.manifest().proxy, "proxy1");
  assert.equal(session.events().length, 1);
});

/* the retrieval trio (chunkmarkdown/ragmanifest, the provenance pair and
 * the metrics store) and the token budget trio moved to devthink with the
 * intelligence domain (the saddle ownership law, wave a, actions 108-112 —
 * the moved lanes keep their battery at
 * devthink/tests/intelligence.test.ts). */

it("verifies signed webhooks and drops duplicate deliveries", async () => {
  let calls = 0;
  const body = JSON.stringify({ event: "push" });
  const signature = webhooksig(body, "secret");
  assert.equal(webhookverify(body, signature, "secret"), true);
  const receiver = webhookreceiver({ secret: "secret", handle: async () => { calls += 1; return { ok: true }; } });
  assert.equal((await receiver.receive({ body, signature, deliveryid: "delivery1", event: "push" })).accepted, true);
  assert.equal((await receiver.receive({ body, signature, deliveryid: "delivery1", event: "push" })).duplicate, true);
  assert.equal(calls, 1);
});

/* the packaging surface quartet (surfacemanifest/surfacebundle, the
 * desktop and mobile adapter pair, the n8n quartet) and the operations
 * quartet (controlsurface, operationsmetrics, retentionpolicy,
 * backupplan, threatmodel) moved to devthink with the automation domain
 * (the saddle ownership law, wave a, actions 108-112 — the moved lanes
 * keep their battery at devthink/tests/automation.test.ts). */

it("serves operator controls through web request and response contracts", async () => {
  const service = controlservice({ verify: async (token) => token === "ok" ? { subject: "operator" } : null, adapters: { jobs: { list: async () => [{ id: "job1" }] } } });
  const overview = await service.handle(new Request("https://example.com/v1/control", { headers: { authorization: "Bearer ok", "x-request-id": "req-overview" } }));
  assert.equal(overview.status, 200);
  assert.equal((await overview.json()).resources.includes("jobs"), true);
  const result = await service.handle(new Request("https://example.com/v1/control", { method: "POST", headers: { authorization: "Bearer ok", "content-type": "application/json", "x-request-id": "req-job" }, body: JSON.stringify({ resource: "jobs", operation: "list" }) }));
  assert.equal(result.status, 200);
  assert.equal((await result.json()).data.result[0].id, "job1");
  const denied = await service.handle(new Request("https://example.com/v1/control", { headers: { authorization: "Bearer bad" } }));
  assert.equal(denied.status, 401);
});

it("keeps sha256 and hmac deterministic without node crypto imports", () => {
  assert.equal(sha256("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  assert.equal(hmacsha256("The quick brown fox jumps over the lazy dog", "key"), "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8");
});

it("bridges browser worker messages through an injected dispatcher", async () => {
  let handler;
  const responses = [];
  const scope = { addEventListener(_event, listener) { handler = listener; }, removeEventListener() {}, postMessage(value) { responses.push(value); } };
  const bridge = workerbridge({ scope, dispatch: async (input) => ({ echoed: input.value }) });
  await handler({ data: { requestid: "worker1", value: "ok" } });
  assert.deepEqual(responses[0], { ok: true, requestid: "worker1", data: { echoed: "ok" } });
  bridge.close();
});

it("delegates browser agent methods to an injected adapter", async () => {
  const calls = [];
  const adapter = Object.fromEntries(["navigate", "click", "type", "screenshot", "html", "text", "title", "scrolltobottom", "executecommands"].map((name) => [name, async (value) => { calls.push(name); return value; }]));
  const agent = browseragent(adapter);
  await agent.navigate({ url: "https://example.com" });
  await agent.click("#button");
  assert.deepEqual(calls.slice(0, 2), ["navigate", "click"]);
});

it("classifies errors and retries only transient failures", async () => {
  const error = operationerror("ratelimited", "slow down");
  assert.equal(error.code, "E2001");
  assert.equal(classifyerror(new Error("timeout")).retryable, true);
  let attempts = 0;
  const result = await retrypolicy({ maxattempts: 2, base: 0 }).run(async () => { attempts += 1; if (attempts === 1) throw operationerror("timeout", "retry"); return "ok"; });
  assert.equal(result, "ok");
  assert.equal(attempts, 2);
});

it("opens and resets a circuit breaker", async () => {
  const breaker = circuitbreaker({ failurethreshold: 2, resettimeout: 100000 });
  await assert.rejects(() => breaker.execute(async () => { throw new Error("one"); }));
  await assert.rejects(() => breaker.execute(async () => { throw new Error("two"); }));
  assert.equal(breaker.status().state, "open");
  breaker.reset();
  assert.equal(breaker.status().state, "closed");
});

it("keeps node server host and port explicit", () => {
  assert.throws(() => nodeserver({ handle: async () => new Response("ok") }), /host and port/);
  const server = nodeserver({ host: "127.0.0.1", port: 4123, handle: async () => new Response("ok") });
  assert.equal(typeof server.listen, "function");
  assert.equal(typeof server.close, "function");
});

it("keeps remote storage adapters injectable", async () => {
  const calls = [];
  const responses = new Map();
  const fetcher = async (url, request = {}) => {
    calls.push({ url: String(url), method: request.method });
    if (request.method === "GET") return { ok: true, json: async () => responses.get(String(url)) ?? { content: Buffer.from("data").toString("base64"), size: 4, sha: "sha" } };
    return { ok: true, json: async () => ({ content: { download_url: "https://cdn.example/file" }, commit: { sha: "commit" } }) };
  };
  const github = githubcontents({ baseurl: "https://api.example", owner: "owner", repo: "repo", token: async () => "token", fetcher });
  const stored = await github.put({ key: "file.bin", data: new TextEncoder().encode("data") });
  assert.equal(stored.key, "file.bin");
  assert.equal(calls.some((call) => call.method === "PUT"), true);
  const requested = [];
  const remote = filehosting({ host: "https://files.example/", request: async (request) => { requested.push(request.method); return { data: new Uint8Array([1, 2]) }; } });
  await remote.put({ key: "file.bin", data: new Uint8Array([1, 2]) });
  await remote.get("file.bin");
  assert.deepEqual(requested, ["put", "get"]);
});

it("resolves open library and binary mode profiles", async () => {
  assert.equal(validatemode("execution", "binary"), true);
  assert.equal(operationmodes.includes("librarywithout"), true);
  assert.equal(modecatalog().axes.memory.includes("vectorized"), true);
  const profile = resolvemode({ execution: "browser", runtime: "browser", memory: "external", pair: "with" });
  assert.equal(profile.capabilities.browser, true);
  assert.equal(profile.capabilities.externalmemory, true);
  assert.equal(await withmode({ execution: "cli", memory: "physical" }, (value) => value.execution), "cli");
});

it("reports cross-runtime capabilities without owning infrastructure", () => {
  const report = capabilityreport({ memory: "external", pair: "with" });
  assert.equal(report.profiles.length, report.axes.execution.length);
  assert.equal(report.profiles.find((profile) => profile.mode === "browser").capabilities.browser, true);
  assert.equal(report.profiles.find((profile) => profile.mode === "desktopapp").profile.memory, "external");
  assert.deepEqual(report.infrastructure, { host: "caller-owned", port: "caller-owned", credentials: "caller-owned", provider: "caller-owned" });
});

it("plans binary builds and open platform targets", async () => {
  const plan = portablebinaryplan({ target: "wasm", entry: "index.js", externaldependencies: ["socket"] });
  assert.equal(binarymanifest(plan).reproducible, true);
  assert.equal(await buildbinary(plan, async (manifest) => manifest.target), "wasm");
  assert.equal(targetmanifest("desktopapp").capabilities.includes("file"), true);
  assert.equal(targetcatalog().extension.runtime, "browser");
});

it("restores a persistent queue and maps migration versions", async () => {
  const root = await mkdtemp(join(tmpdir(), "saddlequeue"));
  const path = join(root, "queue.json");
  await writeFile(path, JSON.stringify({ version: 1, items: [{ id: "job1", payload: { ok: true }, status: "running", attempts: 1 }] }));
  const queue = persistentqueue({ path, maxattempts: 3 });
  assert.equal((await queue.list("queued")).length, 1);
  const item = await queue.claim();
  await queue.fail(item.id, { retryable: true, message: "temporary" });
  assert.equal((await queue.list("queued")).length, 1);
  await queue.complete(item.id, { ok: true });
  assert.equal((await queue.list("completed")).length, 1);
  assert.equal(latestmigration(), 3);
  assert.equal(migrationplan({ current: 1, dialect: "postgres" }).length, 2);
});

it("leases persistent queue items and preserves idempotency keys", async () => {
  const root = await mkdtemp(join(tmpdir(), "saddlelease"));
  const path = join(root, "queue.json");
  let now = 1000;
  const queue = persistentqueue({ path, clock: () => now, leasems: 20 });
  const first = await queue.enqueue({ value: 1 }, { idempotencykey: "same" });
  const duplicate = await queue.enqueue({ value: 2 }, { idempotencykey: "same" });
  assert.equal(duplicate.id, first.id);
  const claimed = await queue.claim();
  assert.equal(claimed.leaseexpiresat, 1020);
  now = 1010;
  const renewed = await queue.renew(claimed.id, 20);
  assert.equal(renewed.leaseexpiresat, 1030);
  now = 1031;
  assert.equal((await queue.list("queued")).length, 1);
  const reclaimed = await queue.claim({ leasems: 20 });
  assert.equal(reclaimed.attempts, 2);
});

it("frames MCP JSONL and blocks private network targets", async () => {
  const server = mcpserver();
  const transport = mcptransport(server);
  const line = await transport.handleline(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }));
  assert.equal(JSON.parse(line).result.tools.length > 0, true);
  const response = await transport.handlehttp(new Request("https://service.example/mcp", { method: "POST", body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }) }));
  assert.equal(response.status, 200);
  assert.equal(ispublicurl("https://example.com"), true);
  assert.equal(ispublicurl("http://127.0.0.1"), false);
});

it("binds browser action references to fresh snapshots and reports diffs", () => {
  const first = pagesnapshot({ snapshotid: "snap1", tabid: "tab1", frameid: "main", url: "https://example.com", elements: [{ ref: "e1", role: "button", name: "Run" }] });
  const second = pagesnapshot({ snapshotid: "snap2", tabid: "tab1", frameid: "main", url: "https://example.com", elements: [{ ref: "e1", role: "button", name: "Running" }, { ref: "e2", role: "link", name: "Docs" }] });
  const reference = snapshotref(first, { ref: "e1" });
  assert.equal(assertfreshsnapshot(first, reference), true);
  assert.throws(() => assertfreshsnapshot(second, reference), (error) => error.code === "STALE_SNAPSHOT");
  const diff = pagesnapshotdiff(first, second);
  assert.equal(diff.added[0].ref, "e2");
  assert.equal(diff.changed[0].name, "Running");
});

it("projects browser snapshots through an allowlist and byte budget", () => {
  const snapshot = pagesnapshot({ snapshotid: "budget1", url: "https://example.com", title: "Saddle", text: "x".repeat(500), elements: [{ ref: "e1", role: "button", name: "Run" }, { ref: "e2", role: "link", name: "Docs" }] });
  const projected = projectcontext(snapshot, { fields: ["snapshotid", "title", "elements", "text"], maxbytes: 220 });
  assert.equal(projected.context.snapshotid, "budget1");
  assert.equal(projected.bytes <= 220, true);
  assert.equal(projected.context.elements[0].ref, "e1");
  assert.equal(projected.truncated.length > 0, true);
});

it("tracks browser tabs and frames without owning a browser", () => {
  const context = browsercontext({ sessionid: "session1" });
  context.opentab({ id: "tab1", url: "https://example.com", active: true });
  context.opentab({ id: "tab2", url: "https://example.org" });
  context.openframe("tab1", { id: "frame1", url: "https://example.com/frame" });
  assert.equal(context.activetab().id, "tab1");
  assert.equal(context.describe().tabs[0].frames[0].id, "frame1");
  context.setactive("tab2");
  assert.equal(context.activetab().id, "tab2");
  assert.equal(context.closetab("tab1"), true);
});

it("normalizes action results and continues or stops bounded batches", async () => {
  const adapter = { click: async (value) => `clicked:${value}`, type: async (value) => `typed:${value}` };
  const results = await actionbatch(adapter, [{ action: "click", value: "e1" }, { action: "missing", value: "e2" }, { action: "type", value: "ok" }]);
  assert.equal(results[0].ok, true);
  assert.equal(results[1].code, "UNSUPPORTED_ACTION");
  assert.equal(results[2].value, "typed:ok");
  assert.equal(actionresult("click", { value: "e1" }).ok, true);
  assert.equal(actionfailure("click", new Error("covered")).ok, false);
});

it("records snapshot boundaries and action provenance", () => {
  const recorder = actionrecorder({ startedat: 100 });
  recorder.snapshot({ snapshotid: "snap1", tabid: "tab1", frameid: "main" });
  recorder.action({ action: "click", payload: { ref: "e1" }, tabid: "tab1" });
  const manifest = recorder.manifest();
  assert.equal(manifest.eventcount, 2);
  assert.equal(manifest.events[1].snapshotid, "snap1");
  assert.equal(manifest.events[1].payload.ref, "e1");
});

it("bounds recorder events and exports immutable manifests", () => {
  const recorder = actionrecorder({ startedat: 100, maxevents: 2 });
  recorder.snapshot({ snapshotid: "snap1", tabid: "tab1" });
  recorder.action({ action: "click", payload: { ref: "e1" }, tabid: "tab1" });
  recorder.action({ action: "type", payload: { value: "safe" }, tabid: "tab1" });
  const manifest = recorder.manifest();
  assert.equal(manifest.eventcount, 2);
  assert.equal(manifest.dropped, 1);
  assert.equal(manifest.events[0].type, "action");
  const exported = JSON.parse(recorder.exportjson());
  exported.events[1].payload.value = "mutated outside";
  assert.equal(recorder.manifest().events[1].payload.value, "safe");
  recorder.clear();
  assert.deepEqual(recorder.manifest().events, []);
});

it("reads a verified object from the next healthy storage-pool member", async () => {
  const good = new TextEncoder().encode("verified replica");
  const primary = await import("../virtual.js").then(({ memorystorage }) => memorystorage());
  const secondary = await import("../virtual.js").then(({ memorystorage }) => memorystorage());
  await primary.put({ key: "shared.bin", data: new TextEncoder().encode("corrupt replica") });
  await secondary.put({ key: "shared.bin", data: good });
  const pool = storagepool({ members: [{ id: "primary", priority: 0, storage: primary }, { id: "secondary", priority: 1, storage: secondary }], clock: () => 100 });
  const output = await pool.read("shared.bin", { sha256: sha256(good) });
  assert.equal(output.memberid, "secondary");
  assert.equal(new TextDecoder().decode(output.data), "verified replica");
  assert.equal(output.verified, true);
  assert.equal(pool.metrics().mismatches, 1);
});

it("records quorum writes and keeps repair planning side-effect free", async () => {
  const { memorystorage } = await import("../virtual.js");
  const first = memorystorage();
  const failure = { async get() { throw new Error("missing"); }, async put() { throw new Error("offline"); } };
  const pool = storagepool({ members: [{ id: "first", storage: first }, { id: "offline", storage: failure }] });
  const output = await pool.put({ key: "result.bin", data: new Uint8Array([1, 2, 3]) });
  assert.equal(output.state, "partial");
  assert.equal(output.written, 1);
  assert.deepEqual(pool.repairplan("result.bin", { sourceid: "first", sha256: output.sha256 }).targets, ["offline"]);
  assert.deepEqual(pool.restoreplan("result.bin", { replicas: [{ memberid: "offline", verified: true }] }).candidates.map((candidate) => candidate.memberid), ["offline", "first"]);
  assert.equal(await first.get("result.bin").then((value) => value.byteLength), 3);
  await assert.rejects(() => pool.put({ key: "next.bin", data: new Uint8Array([4]) }, { quorum: 2 }), (error) => error.code === "STORAGE_POOL_QUORUM_FAILED");
});

it("selects primary, mirror, or fan-out storage writes explicitly", async () => {
  const { memorystorage } = await import("../virtual.js");
  const primary = memorystorage();
  const secondary = memorystorage();
  const pool = storagepool({ members: [{ id: "primary", storage: primary }, { id: "secondary", storage: secondary }] });
  const primaryonly = await pool.put({ key: "primary.bin", data: new Uint8Array([1]) }, { mode: "primary" });
  assert.equal(primaryonly.mode, "primary");
  assert.equal(await primary.get("primary.bin").then((data) => data.byteLength), 1);
  await assert.rejects(() => secondary.get("primary.bin"));
  assert.equal((await pool.put({ key: "fanout.bin", data: new Uint8Array([2]) }, { mode: "fanout" })).written, 2);
});

it("enforces storage-pool operation budgets without background retries", async () => {
  const { memorystorage } = await import("../virtual.js");
  const storage = memorystorage();
  await storage.put({ key: "large.bin", data: new Uint8Array([1, 2, 3]) });
  const pool = storagepool({ members: [{ id: "only", storage }] });
  await assert.rejects(() => pool.read("large.bin", { budget: { maxbytes: 2 } }), (error) => error.code === "STORAGE_POOL_READ_FAILED" && error.detail.attempts[0].code === "STORAGE_POOL_BYTE_BUDGET");
  await assert.rejects(() => pool.put({ key: "large.bin", data: new Uint8Array([1, 2, 3]) }, { budget: { maxbytes: 2 } }), (error) => error.code === "STORAGE_POOL_BYTE_BUDGET");
  assert.equal(pool.metrics().attempts, 1);
});

it("reads verified storage ranges only from members that declare range support", async () => {
  const data = new Uint8Array([1, 2, 3, 4]);
  const primary = { async get() { throw new Error("unused"); }, async put() {} };
  const secondary = { async get() { return data; }, async put() {}, async getrange(_key, start, end) { return data.slice(start, end); } };
  const pool = storagepool({ members: [{ id: "primary", storage: primary }, { id: "secondary", storage: secondary }] });
  const output = await pool.readrange("range.bin", 1, 3, { sha256: sha256(new Uint8Array([2, 3])) });
  assert.equal(output.memberid, "secondary");
  assert.deepEqual([...output.data], [2, 3]);
  await assert.rejects(() => pool.readrange("range.bin", 3, 2), /range/);
});

it("rejects ambiguous storage-pool membership and exposes capability evidence", () => {
  const storage = { async get() {}, async put() {} };
  assert.throws(() => storagepool({ members: [] }), /non-empty/);
  assert.throws(() => storagepool({ members: [{ id: "same", storage }, { id: "same", storage }] }), /duplicated/);
  const pool = storagepool({ members: [{ id: "only", storage }] });
  assert.deepEqual(pool.members(), [{ id: "only", priority: 0 }]);
  assert.deepEqual(pool.capabilities(), [{ id: "only", priority: 0, capabilities: { range: false, conditional: false, metadata: false, delete: false } }]);
});

it("plans bounded working-set admission without materializing data", () => {
  const plan = workingadmission([
    { id: "old", sizebytes: 4, lastusedat: 1 },
    { id: "recent", sizebytes: 5, lastusedat: 9 },
    { id: "expired", sizebytes: 1, expiresat: 10 }
  ], { budget: { maxbytes: 6, maxentries: 2 }, now: 10, policy: "lru" });
  assert.deepEqual(plan.admitted.map((item) => item.id), ["recent"]);
  assert.deepEqual(plan.deferred.map((item) => item.reason), ["bytebudget", "expired"]);
  assert.equal(plan.usedbytes, 5);
});

it("keeps host-memory bridge operations declarative and capability gated", () => {
  assert.equal(bridgeplan({ operation: "tmpfs", sizebytes: 1024 }).state, "unsupported");
  const plan = bridgeplan({ operation: "tmpfs", sizebytes: 1024, capabilities: ["tmpfs"] });
  assert.equal(plan.state, "caller-executes");
  assert.equal(plan.preconditions.includes("rollback-plan"), true);
  const record = materializationrecord({ id: "object1", sha256: "a".repeat(64), sizebytes: 1, tier: "l3" });
  assert.equal(record.state, "planned");
  assert.throws(() => workingadmission([{ id: "same", sizebytes: 1 }, { id: "same", sizebytes: 1 }]), /unique/);
});

it("tracks materialization transitions and emits cleanup plans without deletion", () => {
  let now = 10;
  const ledger = materializationledger({ clock: () => now });
  ledger.add({ id: "object1", sha256: "a".repeat(64), sizebytes: 1, tier: "l3", createdat: 1 });
  assert.equal(ledger.transition("object1", "prepared").state, "prepared");
  now = 11;
  assert.equal(ledger.transition("object1", "verified").updatedat, 11);
  assert.equal(ledger.cleanupplan("object1").state, "caller-cleans");
  assert.throws(() => ledger.transition("object1", "cleaned"), /transition/);
});

it("plans WASM transformations from magic bytes with reproducible cache identity", () => {
  const source = sha256(new Uint8Array([0, 97, 115, 109]));
  const compiler = "b".repeat(64);
  const plan = wasmplan({ source, imports: ["env.log"], budget: { maxbytes: 1024, maxoutputbytes: 512, maxmilliseconds: 20 } });
  assert.deepEqual(magicbytes(new Uint8Array([0, 97, 115, 109])).format, "wasm");
  assert.equal(magicbytes(new Uint8Array([77, 90])).format, "pe");
  const key = transformationkey({ plan, compiler });
  const manifest = transformationcache({ key, source, compiler, policyversion: 1, verified: true, outputs: [{ name: "module.wasm", sha256: source, sizebytes: 4 }] });
  assert.equal(cachedecision(manifest, manifest).reusable, true);
  assert.deepEqual(cachedecision(manifest, { ...manifest, policyversion: 2 }).reasons, ["policyversion"]);
  assert.deepEqual(cacheeligibility({ verified: true, containssecrets: true, partial: true }).reasons, ["secrets", "partial"]);
});

it("executes transformations only through injected isolated adapters and verifies outputs", async () => {
  const data = new Uint8Array([0, 97, 115, 109]);
  const plan = { source: sha256(data), imports: [], budget: { maxbytes: 8, maxoutputbytes: 8, maxmilliseconds: 10 } };
  const output = await executeisolated(plan, { execute: async () => ({ outputs: [{ name: "module.wasm", data, sha256: sha256(data) }] }) });
  assert.equal(output.outputs[0].sizebytes, 4);
  await assert.rejects(() => executeisolated(plan), (error) => error.code === "ISOLATED_EXECUTION_UNAVAILABLE");
  await assert.rejects(() => executeisolated(plan, { execute: async () => ({ outputs: [{ name: "wrong", data, sha256: "f".repeat(64) }] }) }), (error) => error.code === "ISOLATED_EXECUTION_DIGEST_MISMATCH");
});

it("denies execution effects until policy, approval, and caller adapter declarations agree", () => {
  const request = executionrequest({ id: "binary1", effect: "binary-execution", target: "remote", source: "d".repeat(64), budget: { maxbytes: 8, maxmilliseconds: 10 } });
  const denied = executiondecision(request);
  assert.equal(denied.state, "denied");
  assert.deepEqual(denied.effects, []);
  assert.equal(denied.reasons.includes("adapter-capability"), true);
  const delegated = executiondecision(request, { policy: { alloweffects: ["binary-execution"], allowtargets: ["remote"] }, approval: { effects: ["binary-execution"], targets: ["remote"] }, adapter: { owner: "operator", capabilities: ["binary-execution"] } });
  assert.equal(delegated.state, "caller-delegates");
  assert.equal(executionhandoff({ request }).state, "execution-disabled");
  assert.equal(executionhandoff({ request, configuration: { policy: { alloweffects: ["binary-execution"], allowtargets: ["remote"] }, approval: { effects: ["binary-execution"], targets: ["remote"] }, adapter: { owner: "operator", capabilities: ["binary-execution"] } } }).state, "caller-delegates");
});

it("projects unified internal API boundaries without transport, persistence, or execution side effects", () => {
  const api = internalapi();
  const request = { id: "binary2", effect: "binary-execution", target: "remote", source: "e".repeat(64), budget: { maxbytes: 8, maxmilliseconds: 10 } };
  const policy = api.handle({ boundary: "policy", requestid: "request1", payload: { request } });
  assert.equal(policy.data.decision.state, "denied");
  const execution = api.handle({ boundary: "execution", requestid: "request2", payload: { request } });
  assert.equal(execution.data.handoff.code, "EXECUTION_POLICY_DENIED");
  assert.deepEqual(execution.effects, []);
  assert.equal(api.handle({ boundary: "persistence", requestid: "request3", payload: {} }).data.state, "ephemeral-fixture");
  assert.throws(() => api.handle({ boundary: "unknown", requestid: "request4", payload: {} }), /boundary/);
});

it("keeps local, provider, browser, and undeclared URL requests denied and effect-free", () => {
  const source = "f".repeat(64);
  const requests = [
    { id: "local1", effect: "host-bridge", target: "local", source },
    { id: "provider1", effect: "provider-access", target: "provider", source },
    { id: "browser1", effect: "browser-session", target: "browser", source },
  ];
  for (const input of requests) {
    const decision = executiondecision({ ...input, budget: { maxbytes: 1, maxmilliseconds: 1 } });
    assert.equal(decision.state, "denied");
    assert.deepEqual(decision.effects, []);
  }
  const normalized = executionrequest({ id: "remote1", effect: "remote-dispatch", target: "remote", source, endpoint: "https://example.invalid", budget: { maxbytes: 1, maxmilliseconds: 1 } });
  assert.equal("endpoint" in normalized, false);
});

it("plans a virtual browser session without launching or reading a user browser", () => {
  const request = virtualbrowserrequest({ id: "virtualbrowser1", source: "a".repeat(64), engine: "chromium", distribution: "chromium", display: "webrtc", storage: "ephemeral", budget: { maxbytes: 8, maxmilliseconds: 10 } });
  assert.deepEqual(request.localaccess, { browser: false, filesystem: false, storage: false, process: false });
  assert.deepEqual(request.effects, []);
  const denied = virtualbrowserdecision(request);
  assert.equal(denied.state, "denied");
  assert.equal(denied.reasons.includes("adapter-engine"), true);
  const configuration = { policy: { alloweffects: ["browser-session"], allowtargets: ["remote"] }, approval: { effects: ["browser-session"], targets: ["remote"] }, adapter: { owner: "operator", capabilities: ["browser-session"], engines: ["chromium"], distributions: ["chromium"] } };
  const delegated = virtualbrowserdecision(request, configuration);
  assert.equal(delegated.state, "caller-delegates");
  assert.equal(virtualbrowserhandoff({ request, configuration }).code, "REMOTE_BROWSER_ADAPTER_REQUIRED");
  assert.equal(virtualbrowserhandoff({ request }).code, "VIRTUAL_BROWSER_POLICY_DENIED");
  const receipt = virtualbrowserreceipt({ request, adapterid: "fixture-remote-browser", image: "registry.example/saddle/chromium@sha256:fixture", capabilities: ["navigate", "screenshot"] });
  assert.equal(receipt.state, "declared");
  assert.deepEqual(receipt.effects, []);
  assert.throws(() => virtualbrowserrequest({ id: "invalidbrowser", source: "b".repeat(64), engine: "gecko", distribution: "chrome", budget: { maxbytes: 1, maxmilliseconds: 1 } }), /does not match/);
});

it("inspects archive metadata before a caller-owned extraction adapter runs", async () => {
  const accepted = archiveinspection({ limits: { maxentries: 2, maxdepth: 2, maxoutputbytes: 10, maxratio: 4 }, entries: [{ path: "safe/file.txt", sizebytes: 3, compressedbytes: 2 }] });
  assert.equal(accepted.state, "accepted");
  assert.equal(await extractarchive(accepted, { extract: async (value) => value.entries.length }), 1);
  const denied = archiveinspection({ limits: { maxentries: 2, maxdepth: 2, maxoutputbytes: 10, maxratio: 4 }, entries: [{ path: "../unsafe", sizebytes: 9, compressedbytes: 1 }] });
  assert.equal(denied.state, "denied");
  await assert.rejects(() => extractarchive(denied, { extract: async () => {} }), (error) => error.code === "ARCHIVE_POLICY_DENIED");
});

it("selects an eligible provider deterministically and leaves dispatch caller-owned", () => {
  const chain = providerchain({ providers: [
    { id: "small", priority: 0, status: "available", capabilities: ["wasm"], architecture: "x64", operatingSystem: "linux", networkpolicy: "restricted", cpu: 1, memorybytes: 2, maxmilliseconds: 5 },
    { id: "worker", priority: 1, status: "available", capabilities: ["wasm", "container"], architecture: "x64", operatingSystem: "linux", networkpolicy: "restricted", cpu: 2, memorybytes: 10, maxmilliseconds: 20 },
    { id: "offline", priority: 2, status: "offline", capabilities: ["wasm", "container"], architecture: "arm64", operatingSystem: "linux", networkpolicy: "none", cpu: 4, memorybytes: 20, maxmilliseconds: 30 }
  ] });
  const plan = chain.dispatchplan({ capabilities: ["container"], architecture: "x64", operatingSystem: "linux", networkpolicy: "restricted", mincpu: 2, minmemorybytes: 8, minmilliseconds: 10 });
  assert.equal(plan.state, "caller-dispatches");
  assert.equal(plan.provider.id, "worker");
  assert.equal(plan.rejected[0].id, "small");
  assert.equal(plan.provider.architecture, "x64");
  assert.throws(() => chain.select({ capabilities: ["gpu"] }), (error) => error.code === "PROVIDER_CHAIN_UNAVAILABLE");
});

it("applies provider preferences only after eligibility filtering", () => {
  const chain = providerchain({ providers: [
    { id: "first", priority: 0, status: "available", capabilities: ["wasm"] },
    { id: "preferred", priority: 1, status: "available", capabilities: ["wasm"] },
    { id: "ineligible", priority: 2, status: "available", capabilities: [] }
  ] });
  assert.equal(chain.select({ capabilities: ["wasm"], preferredids: ["preferred"] }).selected.id, "preferred");
  assert.equal(chain.select({ capabilities: ["wasm"], preferredids: ["ineligible"] }).selected.id, "first");
});

it("renders provider dispatch plans only through injected adapters", async () => {
  const plan = { state: "caller-dispatches", provider: { id: "worker" }, request: {} };
  assert.deepEqual(await renderdispatch(plan, { render: async (value) => ({ provider: value.provider.id }) }), { provider: "worker" });
  await assert.rejects(() => renderdispatch(plan), (error) => error.code === "PROVIDER_DISPATCH_RENDER_UNAVAILABLE");
});

it("requires verified evidence before an artifact handoff can be transferred", () => {
  const handoff = artifacthandoff({ key: "artifact.bin", sha256: "c".repeat(64), sizebytes: 3, providerid: "worker", retention: "release" });
  assert.equal(handoff.state, "caller-transfers");
  assert.throws(() => artifacthandoff({ key: "artifact.bin", sha256: "invalid", sizebytes: 3, providerid: "worker", retention: "release" }), /sha256/);
});

it("preserves unknown remote state in provider cancellation plans", () => {
  const plan = cancellationplan({ runid: "run1", providerid: "worker", compensation: true });
  assert.equal(plan.state, "caller-cancels");
  assert.equal(plan.remotestate, "unknown");
  assert.equal(plan.compensation, "caller-evaluates");
});

it("verifies immutable delivery chunks without evaluating their content", () => {
  const data = new Uint8Array([0, 97, 115, 109]);
  const manifest = deliverymanifest({ id: "runtime", chunks: [{ id: "part0", index: 0, sha256: sha256(data), sizebytes: 4, contenttype: "application/wasm" }] });
  assert.equal(verifydelivery(manifest, [{ id: "part0", data }]).valid, true);
  assert.equal(verifydelivery(manifest, [{ id: "part0", data: new Uint8Array([1]) }]).results[0].state, "mismatch");
  assert.throws(() => deliverymanifest({ id: "invalid", chunks: [{ id: "part0", index: 1, sha256: sha256(data), sizebytes: 4 }] }), /contiguous/);
});

it("keeps PWA registration declarative and capability gated", () => {
  assert.equal(pwaplan({ scope: "/saddle/", offline: true }).state, "unsupported");
  const plan = pwaplan({ scope: "/saddle/", offline: true, capabilities: { serviceworker: true } });
  assert.equal(plan.state, "caller-registers");
  assert.equal(plan.cache, "caller-configures");
  assert.deepEqual(cdncapabilities({ immutable: true, range: true, integrityheaders: true, cors: true }), { version: 1, immutable: true, purge: false, range: true, integrityheaders: true, cors: true, visibility: "public", state: "caller-reports" });
});

/* the mini app surface pair (miniappplan, dnsplan) and the application
 * bridge moved to devthink with the automation domain (the saddle
 * ownership law, wave a, actions 108-112 — the moved lanes keep their
 * battery at devthink/tests/automation.test.ts). */
});
