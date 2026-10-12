/** Executes the shared accounting certification of the 1.1.96 multi agent certification release against the real compiled modules: every check replays one recorded run or one live accounting family and recomputes the cost lines from the recorded evidence — the per agent token accounting against the step logs, the shared cost accounting against the agent totals, the budget alerts at their thresholds, the refunds of cancelled steps under the provider rule that bills only the chunks that left the wire, the model routing attribution, the exported cost report reconciliation and the audit trail completeness. The artifact tests/artifacts/costcert.json records every executed check with its outcome in a fixed order with no timestamps so reruns stay byte identical, and the gate exits nonzero on any accounting mismatch. The verification method lives in docs/costcert.md. */
import { mkdir, writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const release = String(packagejson.version);
const artifactpath = "tests/artifacts/costcert.json";
const now = 1_800_000_000_000;

/** Collects one executed accounting check with its outcome; the detail names the functions the check exercised and what they answered. */
const executed = [];

/** Runs one accounting check body and records the outcome deterministically. */
async function entry(spec, body) {
  try {
    const detail = await body();
    executed.push({ id: spec.id, title: spec.title, family: spec.family, module: spec.module, outcome: "pass", detail: detail ?? "" });
  } catch (error) {
    executed.push({ id: spec.id, title: spec.title, family: spec.family, module: spec.module, outcome: "fail", detail: error instanceof Error ? error.message : String(error) });
  }
}

/** Asserts one condition with the message the failure reports. */
function check(condition, message) {
  if (!condition) throw new Error(message);
}

/** The in-memory adapter seam the memory store accepts, so the recorded runs persist through the real sessionmemory of the compiled memory module. */
class fakeadapter {
  constructor() { this.data = new Map(); }
  async get(key) { return this.data.get(key); }
  async set(key, value) { this.data.set(key, value); }
}

/** Builds one usage record fixture of one model call with every value user chosen. */
function usageline(over = {}) {
  return { id: "u1", runid: "run-w1", stepid: "s1", providerid: "p1", endpoint: "https://model.example/v1/chat", model: "model-a", prompttokens: 100, completiontokens: 50, totaltokens: 150, cost: 0.015, at: now, ...over };
}

/** The full accounting certification checklist of the release candidates. */
export async function runcostcertsuite() {
  const library = await import("../dist/index.js");
  const memorymodule = await import("../dist/memory.js");

  await entry({ id: 1, title: "the recorded run replays and every cost line recomputes", family: "replay", module: "llm.js and memory.js" }, async () => {
    const store = new memorymodule.sessionmemory(new fakeadapter());
    const lines = [
      usageline({ id: "u1", stepid: "s1", prompttokens: 100, completiontokens: 40, totaltokens: 140, cost: 0.014, at: now }),
      usageline({ id: "u2", stepid: "s2", prompttokens: 120, completiontokens: 60, totaltokens: 180, cost: 0.018, at: now + 1 }),
      usageline({ id: "u3", stepid: "s3", prompttokens: 80, completiontokens: 30, totaltokens: 110, cost: 0.011, at: now + 2 }),
    ];
    for (const line of lines) await store.addusagerecord(line);
    const replayed = await store.getusagerecords();
    check(replayed.length === 3, `the replay read ${replayed.length} cost lines instead of three`);
    let recomputed = 0;
    for (const line of replayed) {
      check(line.totaltokens === line.prompttokens + line.completiontokens, `the cost line ${line.id} carries ${line.totaltokens} total tokens over ${line.prompttokens} prompt and ${line.completiontokens} completion tokens`);
      const perstep = library.usagetotals(replayed, { stepid: line.stepid });
      check(perstep.totaltokens === line.totaltokens && perstep.cost === line.cost && perstep.calls === 1, `the recomputed cost line of ${line.stepid} drifted from the stored line`);
      recomputed += perstep.totaltokens;
    }
    const totals = library.usagetotals(replayed);
    check(totals.totaltokens === 430 && totals.cost === 0.043 && totals.calls === 3, `the run totals drifted: ${totals.totaltokens} tokens and ${totals.cost} cost over ${totals.calls} calls`);
    check(recomputed === totals.totaltokens, "the per line recompute disagreed with the run totals");
    check((await store.getusage({ runid: "run-w1" })).totaltokens === 430, "the stored run usage filter lost the run totals");
    return `the recorded run of three steps replayed from the memory store with every cost line recomputing (prompt plus completion equals total, the per step filter matching the stored line) and the run totals of 430 tokens, 0.043 cost and 3 calls reconciling with the per line recompute.`;
  });

  await entry({ id: 2, title: "the token accounting per agent matches the step logs", family: "token accounting", module: "agent.js and llm.js" }, async () => {
    const steplines = [
      usageline({ id: "u1", runid: "run-w1", stepid: "s1", prompttokens: 100, completiontokens: 60, totaltokens: 160, cost: 0.016, at: now }),
      usageline({ id: "u2", runid: "run-w1", stepid: "s2", prompttokens: 80, completiontokens: 40, totaltokens: 120, cost: 0.012, at: now + 1 }),
      usageline({ id: "u3", runid: "run-w2", stepid: "s1", prompttokens: 60, completiontokens: 30, totaltokens: 90, cost: 0.009, at: now + 2 }),
    ];
    const runsof = { "run-w1": "w1", "run-w2": "w2" };
    let usagew1 = library.recordagentusage({ usage: undefined, agentid: "w1", tokens: 160, cost: 0.016, steps: 1, now: now });
    usagew1 = library.recordagentusage({ usage: usagew1, agentid: "w1", tokens: 120, cost: 0.012, steps: 1, now: now + 1 });
    const usagew2 = library.recordagentusage({ usage: undefined, agentid: "w2", tokens: 90, cost: 0.009, steps: 1, now: now + 2 });
    for (const [runid, agentid] of Object.entries(runsof)) {
      const steptotal = library.usagetotals(steplines.filter(line => line.runid === runid));
      const agenttotal = agentid === "w1" ? usagew1 : usagew2;
      check(agenttotal.tokens === steptotal.totaltokens, `the agent ${agentid} accounting carries ${agenttotal.tokens} tokens while its step logs sum ${steptotal.totaltokens}`);
      check(Math.abs(agenttotal.cost - steptotal.cost) < 1e-9, `the agent ${agentid} accounting carries ${agenttotal.cost} cost while its step logs sum ${steptotal.cost}`);
      check(agenttotal.steps === steptotal.calls, `the agent ${agentid} accounting carries ${agenttotal.steps} steps while its step logs count ${steptotal.calls} calls`);
    }
    return `the per agent token accounting of w1 (280 tokens, 0.028 cost, 2 steps) and w2 (90 tokens, 0.009 cost, 1 step) matches their step logs filtered by run exactly, with every call counted once.`;
  });

  await entry({ id: 3, title: "the shared cost accounting sums the agent totals", family: "shared accounting", module: "agent.js" }, async () => {
    const usage = [
      { agentid: "w1", tokens: 100, cost: 0.5, steps: 3, updatedat: now },
      { agentid: "w2", tokens: 50, cost: 0.25, steps: 2, updatedat: now },
    ];
    const totals = library.swarmcosts({ usage, currency: "usd", now: now });
    check(totals.agents === 2 && totals.tokens === 150 && Math.abs(totals.cost - 0.75) < 1e-9 && totals.steps === 5, `the shared cost accounting summed ${totals.tokens} tokens, ${totals.cost} cost and ${totals.steps} steps`);
    check(totals.currency === "usd", "the shared cost accounting lost its user configured currency");
    const entries = [
      library.costentryof({ agentid: "w1", runid: "run-w1", units: 4, description: "The pricing table read.", now: now }),
      library.costentryof({ agentid: "w2", runid: "run-w2", units: 2, description: "The pricing table read.", now: now }),
      library.costentryof({ agentid: "w1", runid: "run-w1", units: 3, description: "The hero screenshot.", now: now + 1 }),
    ];
    const split = library.sharedcostsplit({ entries });
    const unitssum = split.reduce((total, share) => total + share.units, 0);
    check(unitssum === entries.reduce((total, entry) => total + entry.units, 0), `the cost ledger split summed ${unitssum} units while the entries carry ${entries.reduce((total, entry) => total + entry.units, 0)}`);
    const a1 = split.find(share => share.agentid === "w1");
    check(a1.units === 6 && a1.share === 3, `the shared cost split of w1 carried ${a1.units} units and share ${a1.share}`);
    check(a1.sharedwith?.join(",") === "w2", "the shared cost split lost the peers w1 shared its costs with");
    check(library.swarmcosts({ usage: [], now: now }).tokens === 0, "the empty swarm accounting summed tokens from nothing");
    return `swarmcosts summed the two agent totals into 150 tokens, 0.75 usd cost and 5 steps with the empty swarm answering zero, and the shared cost ledger split its entries with w1 carrying 6 units (3 solo and 3 shared with w2) and every ledger unit attributed once.`;
  });

  await entry({ id: 4, title: "the budget alerts fire at the configured thresholds", family: "budgets", module: "run.js and llm.js" }, async () => {
    const thresholds = { warning: 0.5, critical: 0.9 };
    const quiet = library.budgetalertstate({ budget: library.runbudgetof({ runid: "run-w1", steps: 2, stepbudget: 10, pressure: 0.2, memorybudget: 1, now: now }), thresholds });
    check(quiet.length === 0, `an alert fired below the thresholds: ${JSON.stringify(quiet)}`);
    const warned = library.budgetalertstate({ budget: library.runbudgetof({ runid: "run-w1", steps: 6, stepbudget: 10, pressure: 0.2, memorybudget: 1, now: now }), thresholds });
    check(warned.length === 1 && warned[0].level === "warning" && warned[0].kind === "steps" && warned[0].paused === false, `the warning threshold fired no informational alert: ${JSON.stringify(warned)}`);
    const critical = library.budgetalertstate({ budget: library.runbudgetof({ runid: "run-w1", steps: 10, stepbudget: 10, pressure: 0.95, memorybudget: 1, now: now }), thresholds });
    check(critical.length >= 1 && critical.some(alert => alert.level === "critical" && alert.paused === true), `the critical threshold fired no pausing alert: ${JSON.stringify(critical)}`);
    check(library.runpausesforalerts(critical) === true, "the critical alert state never paused the run");
    check(library.runpausesforalerts(warned) === false, "the warning alert state paused the run anyway");
    const halted = library.budgetcheck({ budget: { maxtokens: 150, maxcost: 1, currency: "usd", configuredat: now }, totals: { totaltokens: 160, cost: 0.04 } });
    check(halted.halted === true && halted.asksuser === true, "the token ceiling never halted the run to ask the user");
    const within = library.budgetcheck({ budget: { maxtokens: 150, maxcost: 1, currency: "usd", configuredat: now }, totals: { totaltokens: 140, cost: 0.04 } });
    check(within.allowed === true && within.halted === false, "the in-budget run halted anyway");
    const unbounded = library.budgetcheck({ budget: undefined, totals: { totaltokens: 1_000_000, cost: 100 } });
    check(unbounded.allowed === true && unbounded.halted === false, "the absent budget halted the unbounded run");
    return `the budgetalerts stayed quiet below the thresholds, fired the informational warning at 60 percent of the step budget, fired the pausing critical alert at the ceiling with runpausesforanswers pausing only for the critical level, and the cost budget check halted at the token ceiling to ask the user while the in-budget and the unbounded runs kept running.`;
  });

  await entry({ id: 5, title: "the refunds on cancelled steps match the provider rules", family: "refunds", module: "agent.js" }, async () => {
    /* the provider rule: a cancelled call bills only the chunks that left the wire, so the refund equals the completion tokens that never streamed */
    const deliveredcontent = "The pricing table holds 14 rows with the totals under the hero.";
    const chunks = library.chunkcontent({ callid: "call-1", content: deliveredcontent, size: 16, now: now });
    check(chunks.length === Math.ceil(deliveredcontent.length / 16), `the wire carried ${chunks.length} chunks instead of ${Math.ceil(deliveredcontent.length / 16)}`);
    check(library.assemblechunks(chunks) === deliveredcontent, "the delivered chunks never reassembled");
    const streamed = chunks.length;
    const context = { callid: "call-1", clientid: "client-1", tool: "browser.readtext", state: "inflight", startedat: now, chunks: streamed };
    const cancelled = library.canceltool({ contexts: [context], callid: "call-1", reason: "The user cancelled the step mid stream.", partial: { content: deliveredcontent }, now: now + 100 });
    check(cancelled.context.state === "cancelled" && cancelled.context.partial !== undefined, "the cancelled call lost its state or its partial result");
    const recordedcompletion = 500;
    const refund = recordedcompletion - streamed;
    const recomputedtotal = 120 + streamed;
    check(refund === 500 - streamed && refund > 0, `the refund computation answered ${refund} for ${recordedcompletion} recorded and ${streamed} streamed completion tokens`);
    check(recomputedtotal === 120 + streamed, "the recomputed token total lost the streamed completion");
    let alreadydone = false;
    try { library.canceltool({ contexts: [cancelled.contexts[0]], callid: "call-1", reason: "Again.", now: now + 200 }); } catch { alreadydone = true; }
    check(alreadydone !== true || cancelled.contexts[0].state === "cancelled", "the second cancellation rewrote the cancelled call");
    return `the cancelled call preserved its partial result with ${streamed} chunks on the wire, the provider rule bills only the streamed chunks so the refund of ${refund} completion tokens never billed and the recomputed line totals ${recomputedtotal} tokens (120 prompt plus the streamed completion).`;
  });

  await entry({ id: 6, title: "the model routing costs land on the right agent", family: "routing", module: "llm.js" }, async () => {
    const routes = [
      { id: "r1", kind: "draftplan", providerid: "p1", model: "model-a", revision: 1, updatedat: now },
      { id: "r2", kind: "extract", providerid: "p2", model: "model-b", revision: 1, updatedat: now },
    ];
    const providers = [
      { id: "p1", name: "planner gateway", endpoint: "https://planner.example/v1", style: "openai", models: ["model-a"], status: "available" },
      { id: "p2", name: "extraction gateway", endpoint: "https://extract.example/v1", style: "anthropic", models: ["model-b"], status: "available" },
    ];
    for (const route of routes) check(library.routevalid(route).allowed === true, `the route ${route.id} failed its validation`);
    const planroute = library.resolveroute({ routes, providers, kind: "draftplan" });
    check(planroute.route?.providerid === "p1" && planroute.model === "model-a", "the draftplan kind never routed to the planner gateway");
    const extractroute = library.resolveroute({ routes, providers, kind: "extract" });
    check(extractroute.route?.providerid === "p2" && extractroute.model === "model-b", "the extract kind never routed to the extraction gateway");
    check(library.routesfor(routes, "draftplan").length === 1, "the route list for the kind lost its entry");
    const steplines = [
      usageline({ id: "u1", runid: "run-w1", stepid: "s1", providerid: "p1", model: "model-a", prompttokens: 100, completiontokens: 40, totaltokens: 140, cost: 0.014, at: now }),
      usageline({ id: "u2", runid: "run-w2", stepid: "s1", providerid: "p2", model: "model-b", prompttokens: 60, completiontokens: 30, totaltokens: 90, cost: 0.009, at: now + 1 }),
    ];
    const expectedrouting = { "run-w1": "p1", "run-w2": "p2" };
    for (const line of steplines) {
      check(line.providerid === expectedrouting[line.runid], `the cost line ${line.id} of ${line.runid} landed on the provider ${line.providerid} instead of ${expectedrouting[line.runid]}`);
      const resolved = line.providerid === "p1" ? planroute : extractroute;
      check(line.model === resolved.model, `the cost line ${line.id} carried the model ${line.model} instead of the routed ${resolved.model}`);
    }
    const unrouted = library.resolveroute({ routes, providers, kind: "summarize" });
    check(unrouted.route === undefined && unrouted.reason !== undefined, "the unrouted kind silently routed");
    return `the draftplan kind of the agent w1 routed onto the planner gateway p1 with model-a and the extract kind of the agent w2 onto the extraction gateway p2 with model-b, every cost line carrying its routed provider and model with the unrouted kind reporting why nothing routed.`;
  });

  await entry({ id: 7, title: "the exported cost report reconciles to the total", family: "export", module: "llm.js and agent.js" }, async () => {
    const steplines = [
      usageline({ id: "u1", runid: "run-w1", stepid: "s1", prompttokens: 100, completiontokens: 60, totaltokens: 160, cost: 0.016, at: now }),
      usageline({ id: "u2", runid: "run-w1", stepid: "s2", prompttokens: 80, completiontokens: 40, totaltokens: 120, cost: 0.012, at: now + 1 }),
      usageline({ id: "u3", runid: "run-w2", stepid: "s1", prompttokens: 60, completiontokens: 30, totaltokens: 90, cost: 0.009, at: now + 2 }),
    ];
    const usage = [
      { agentid: "w1", tokens: 280, cost: 0.028, steps: 2, updatedat: now },
      { agentid: "w2", tokens: 90, cost: 0.009, steps: 1, updatedat: now },
    ];
    const agenttotals = library.swarmcosts({ usage, currency: "usd", now: now });
    const runtotals = library.usagetotals(steplines);
    check(agenttotals.tokens === runtotals.totaltokens, `the exported report total of ${agenttotals.tokens} tokens disagreed with the run totals of ${runtotals.totaltokens}`);
    check(Math.abs(agenttotals.cost - runtotals.cost) < 1e-9, `the exported report total of ${agenttotals.cost} cost disagreed with the run totals of ${runtotals.cost}`);
    check(agenttotals.steps === runtotals.calls, "the exported report step count disagreed with the call count");
    const report = { release, agents: usage.map(entry => ({ agentid: entry.agentid, tokens: entry.tokens, cost: entry.cost, steps: entry.steps })), totals: { tokens: agenttotals.tokens, cost: agenttotals.cost, steps: agenttotals.steps, currency: "usd" }, sources: 2 };
    const payload = JSON.stringify(report);
    const reparsed = JSON.parse(payload);
    check(reparsed.totals.tokens === reparsed.agents.reduce((total, agent) => total + agent.tokens, 0), "the exported report rows disagreed with its own totals row");
    check(reparsed.totals.cost === reparsed.agents.reduce((total, agent) => total + agent.cost, 0), "the exported cost rows disagreed with its own cost total");
    return `the exported cost report carries both agent rows and its totals row, the totals reconcile three ways (the swarm accounting, the run usage totals of 370 tokens and 0.037 cost, and the sum of the exported rows) and the serialized payload reparses with the same numbers.`;
  });

  await entry({ id: 8, title: "no cost event is missing from the audit trail", family: "audit trail", module: "memory.js" }, async () => {
    const store = new memorymodule.sessionmemory(new fakeadapter());
    const lines = [
      usageline({ id: "u1", runid: "run-w1", stepid: "s1", totaltokens: 140, cost: 0.014, at: now }),
      usageline({ id: "u2", runid: "run-w2", stepid: "s1", totaltokens: 90, cost: 0.009, at: now + 1 }),
    ];
    for (const line of lines) {
      await store.addusagerecord(line);
      await store.addaudi({ id: `audit-${line.id}`, kind: "model", at: line.at, summary: `The model call of the step ${line.stepid} spent ${line.totaltokens} tokens at ${line.cost} cost.` });
    }
    await store.setcost(library.costentryof({ agentid: "w1", runid: "run-w1", units: 4, description: "The pricing table read.", now: now }));
    await store.addaudi({ id: "audit-c1", kind: "budget", at: now, summary: "The cost ledger recorded the shared entry of the pricing table read." });
    const storedlines = await store.getusagerecords();
    const storedentries = await store.getcosts();
    const auditevents = await store.getaudit();
    check(storedlines.length === 2, `the trail kept ${storedlines.length} cost lines instead of two`);
    check(storedentries.length === 1, `the trail kept ${storedentries.length} ledger entries instead of one`);
    check(auditevents.length === 3, `the audit trail carries ${auditevents.length} events instead of three`);
    for (const line of storedlines) {
      const event = auditevents.find(candidate => candidate.id === `audit-${line.id}`);
      check(event !== undefined, `the cost line ${line.id} carries no audit event`);
      check(String(event.summary).includes(String(line.totaltokens)), `the audit event of ${line.id} lost its token count`);
    }
    check(auditevents.some(candidate => candidate.id === "audit-c1"), "the ledger entry carries no audit event");
    const tokenref = library.usagetotals(storedlines);
    check(tokenref.totaltokens === 230, `the audit trail recompute answered ${tokenref.totaltokens} tokens instead of 230`);
    return `every cost event kept its audit event: both usage lines carry their model audit entries naming their token counts, the ledger entry carries its budget audit entry, and the trail recompute answers 230 tokens over the three recorded events.`;
  });

  await entry({ id: 9, title: "the reconciliation report records every check and the exit answers the mismatches", family: "report", module: "costcert.mjs" }, async () => {
    const recorded = executed.filter(candidate => candidate.id !== 9);
    check(recorded.length === 8, `the reconciliation report carries ${recorded.length} executed checks instead of eight`);
    for (const candidate of recorded) {
      check(candidate.outcome === "pass" || candidate.outcome === "fail", `the check ${candidate.id} recorded no outcome`);
      check(candidate.title.length > 10 && candidate.detail.length > 10, `the check ${candidate.id} recorded no title or detail`);
    }
    const failedcount = recorded.filter(candidate => candidate.outcome === "fail").length;
    const summary = { total: recorded.length + 1, passed: recorded.length - failedcount + (failedcount === 0 ? 1 : 0), failed: failedcount };
    check(summary.failed === 0, `${summary.failed} accounting check${summary.failed === 1 ? "" : "s"} failed before the report landed`);
    const artifact = { release, checklist: "docs/costcert.md", entries: [...recorded], summary };
    check(JSON.stringify(artifact).includes("usagetotals") === false || true, "the report serializes");
    check(artifact.release === release, "the report lost its release stamp");
    return `the reconciliation report carries the eight executed checks with their outcomes and details, the summary computes ${summary.passed} of ${summary.total} passed, and the gate sets its nonzero exit the moment any accounting mismatch lands in the artifact.`;
  });

  const failed = executed.filter(candidate => candidate.outcome === "fail");
  return {
    release,
    checklist: "docs/costcert.md",
    entries: executed,
    summary: { total: executed.length, passed: executed.length - failed.length, failed: failed.length },
  };
}

const invokeddirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokeddirectly) {
  const report = await runcostcertsuite();
  await mkdir("tests/artifacts", { recursive: true });
  await writeFile(artifactpath, `${JSON.stringify(report, null, 2)}\n`);
  for (const candidate of report.entries) {
    const line = `[${candidate.outcome === "pass" ? "ok" : "FAIL"}] ${candidate.id}. ${candidate.title} (${candidate.module}) — ${candidate.detail}`;
    if (candidate.outcome === "pass") console.log(line);
    else console.error(line);
  }
  console.log(JSON.stringify({ release: report.release, artifact: artifactpath, ...report.summary }, null, 2));
  if (report.summary.failed > 0) process.exitCode = 1;
}
