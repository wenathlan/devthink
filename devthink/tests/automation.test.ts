// # automation.test — the workflow automation battery the saddle
// ownership law moved to devthink (wave a, actions 108-112: the master
// virtualization engine keeps only the sandbox/vm/runner/vgpu/vcpu/
// ports/hardware-virtual modalities, and the workflow, bot and surface
// automation domain rides its new owner — the battery answers the same
// contracts the engine suite once pinned: the bot command pair, the
// workflow manifest trio, the packaging surface quartet, the operator
// controls, the operations metrics and the mini app pair). runnable
// with vitest: pnpm vitest run tests/automation.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  applicationbridge,
  backupplan,
  commandguard,
  controlsurface,
  desktopadapter,
  desktopmanifest,
  dnsplan,
  githubworkflow,
  gitlabworkflow,
  miniappplan,
  mobileadapter,
  mobilemanifest,
  n8nactions,
  n8nexecute,
  n8nmatch,
  n8nnode,
  operationsmetrics,
  parsecommand,
  retentionpolicy,
  saddlebot,
  surfacemanifest,
  surfacebundle,
  threatmodel,
  triggermatch,
  triggerregistry,
  validateworkflowinputs,
  workflowmanifest,
  workflowregistry,
  workflowtriggers,
  woodpeckerworkflow,
} from "../automation.js";
import { metricstore } from "../intelligence.js";

describe("the automation contract (the saddle ownership transfer, wave a)", () => {
  it("parses bot commands and executes through a platform adapter", async () => {
    const parsed = parsecommand("deploy --platform forge --ref main");
    assert.deepEqual(parsed, { command: "deploy", flags: { platform: "forge", ref: "main" } });
    const bot = saddlebot({ adapters: { forge: { executebot: async (input) => input } } });
    await bot.start();
    const result = await bot.executecommand("deploy --platform forge --ref main");
    assert.equal(result.command, "deploy");
    assert.equal(bot.getstatus().status, "running");
    await bot.stop();
  });

  it("enforces bot command scopes and keeps idempotent results", async () => {
    let calls = 0;
    const bot = saddlebot({
      guard: commandguard({ policies: { deploy: { scopes: ["deploy"] } } }),
      adapters: { forge: { executebot: async () => { calls += 1; return { ok: true }; } } },
    });
    await assert.rejects(
      () => bot.executecommand("deploy --platform forge", { scopes: [] }),
      (error) => error.code === "BOT_COMMAND_UNAUTHORIZED",
    );
    const first = await bot.executecommand("deploy --platform forge", { scopes: ["deploy"], idempotencykey: "cmd1" });
    const second = await bot.executecommand("deploy --platform forge", { scopes: ["deploy"], idempotencykey: "cmd1" });
    assert.deepEqual(second, first);
    assert.equal(calls, 1);
  });

  it("renders multiforge workflow manifests", () => {
    const manifest = workflowmanifest({ name: "process", command: "npm test", platforms: ["github", "gitlab"] });
    const registry = workflowregistry();
    registry.register(manifest);
    assert.equal(registry.render("process", "github").includes("workflow_dispatch"), true);
    assert.equal(gitlabworkflow(manifest).includes("image: node:26.12.0"), true);
    assert.equal(woodpeckerworkflow(manifest).includes("npm test"), true);
  });

  it("normalizes workflow triggers and matches due events", () => {
    assert.deepEqual(workflowtriggers(["manual", "webhook", "manual"]), ["manual", "webhook"]);
    const manifest = workflowmanifest({ name: "triggered", command: "npm test", trigger: ["webhook", "schedule"] });
    assert.equal(triggermatch(manifest, { type: "webhook", requestid: "event1" }).matched, true);
    assert.equal(triggermatch(manifest, { type: "schedule", at: Date.now() + 10000 }).reason, "not-due");
    const registry = triggerregistry();
    registry.register(manifest);
    assert.equal(registry.match("triggered", { type: "webhook" }).matched, true);
  });

  it("validates workflow inputs and produces deterministic trigger identities", () => {
    const manifest = workflowmanifest({
      name: "typed",
      command: "npm test",
      trigger: "dispatch",
      inputs: {
        count: { type: "number", required: true },
        dryrun: { type: "boolean", default: false },
        mode: { type: "string", choices: ["safe", "fast"] },
      },
    });
    const valid = validateworkflowinputs(manifest, { count: "2", mode: "safe" });
    assert.deepEqual(valid.values, { count: 2, dryrun: false, mode: "safe" });
    assert.equal(valid.valid, true);
    assert.equal(validateworkflowinputs(manifest, { count: "invalid", mode: "unsafe" }).valid, false);
    const first = triggermatch(manifest, { type: "dispatch", inputs: { count: "2", mode: "safe" } });
    const second = triggermatch(manifest, { type: "dispatch", inputs: { mode: "safe", count: "2" } });
    assert.equal(first.matched, true);
    assert.equal(first.requestid, second.requestid);
  });

  it("creates packaging surfaces for n8n and browser targets", async () => {
    const manifest = surfacemanifest({ target: "n8n", capabilities: ["memory"] });
    assert.equal(surfacebundle(manifest).install, "n8n import");
    const node = n8nnode({ name: "saddle" });
    const output = await n8nexecute(node, { command: "status" }, async ({ input }) => input.command);
    assert.equal(output, "status");
  });

  it("defines caller-owned desktop mobile and n8n surface contracts", async () => {
    const desktop = desktopmanifest({ formats: ["custom"] });
    const mobile = mobilemanifest();
    assert.deepEqual(desktop.formats, ["custom"]);
    assert.equal(mobile.formats.includes("apk"), true);
    assert.equal(surfacebundle(desktop).install, "caller desktop bundle");
    const adapter = desktopadapter({ handlers: { status: async () => ({ ready: true }) } });
    assert.deepEqual((await adapter.invoke("status")).result, { ready: true });
    assert.equal((await mobileadapter().invoke("status")).supported, false);
    const node = n8nnode({ triggers: ["webhook"], actions: ["browser"] });
    assert.equal(n8nmatch(node, { type: "webhook" }).matched, true);
    assert.equal(n8nactions.includes("scrape"), false);
    assert.equal(n8nactions.includes("crawl"), false);
    assert.equal(n8nactions.includes("browser"), true);
    await assert.rejects(() => n8nexecute(node, { command: "status" }, async () => "no"), /unsupported n8n action/);
  });

  it("exposes auditable operator controls for core resources", async () => {
    const events = [];
    const controls = controlsurface({
      adapters: {
        jobs: { list: async () => [{ id: "job1" }] },
        permissions: { check: async (input) => ({ allowed: input.scope === "read" }) },
      },
      audit: async (event) => events.push(event),
    });
    assert.equal((await controls.execute({ resource: "jobs", operation: "list", requestid: "req1" })).result[0].id, "job1");
    assert.equal((await controls.execute({ resource: "permissions", operation: "check", input: { scope: "read" } })).result.allowed, true);
    assert.equal((await controls.execute({ resource: "logs", operation: "list" })).code, "UNSUPPORTED_CONTROL");
    assert.equal(events.length, 3);
    assert.equal(controls.describe().resources.includes("artifacts"), true);
  });

  it("defines bounded operational metrics recovery and policy boundaries", async () => {
    const metrics = operationsmetrics({ collector: metricstore() });
    metrics.record("queuedepth", 2, { queue: "sandbox" });
    metrics.record("latency", 12, { operation: "boot" });
    assert.equal(metrics.snapshot().counters['queuedepth|[["queue","sandbox"]]'], 2);
    const policy = retentionpolicy({ days: 1, maxbytes: 100 });
    assert.equal(policy.keeps({ updatedat: Date.now(), bytes: 50 }), true);
    assert.equal(policy.keeps({ updatedat: Date.now(), bytes: 101 }), false);
    const plan = backupplan({
      backup: async (input) => ({ saved: input.id }),
      restore: async (input) => ({ restored: input.id }),
    });
    assert.deepEqual(await plan.backup({ id: "snapshot1" }), { saved: "snapshot1" });
    assert.equal(threatmodel({ controls: ["url validation"] }).owner, "caller");
    await assert.rejects(() => backupplan().restore({}), /restore handler is not configured/);
  });

  it("keeps Mini App validation and DNS mutation caller-owned", () => {
    const miniapp = miniappplan({ origin: "https://app.example/", validation: "signed-init-data", capabilities: ["open-link"] });
    assert.equal(miniapp.state, "caller-validates");
    assert.throws(() => miniappplan({ origin: "https://app.example/", validation: "signed-init-data", token: "forbidden" }), /credentials/);
    assert.equal(dnsplan({ hostname: "app.example", owner: "team", dnssec: true, https: true }).state, "caller-configures");
    const bridge = applicationbridge({
      surfaces: [
        { id: "web", target: "browser", capabilities: ["fetch"] },
        { id: "mobile", target: "mobile", capabilities: ["storage"] },
      ],
    });
    assert.equal(bridge.surfaces.length, 2);
  });
});
