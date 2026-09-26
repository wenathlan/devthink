import { describe, expect, it } from "vitest";
import {
  dryflowdriver,
  flowgateof,
  flowproposalvalue,
  flowrunexitcodeof,
  flowstepsensitive,
  flowtimelinerowsof,
  parseflowrunrequest,
  parsegrantsfile,
  renderflowevents,
  renderflowtimeline,
  runflow,
  type flowdriver,
} from "../flow.js";
import { verifylogchain } from "../security.js";
import { packageversion } from "../version.js";
import type { flowrunevent, flowrungate, planfile, planfilestep } from "../types.js";

const now = 1_800_000_000_000;

function plan(overrides?: Partial<planfile>): planfile {
  return {
    version: packageversion,
    goal: "digest the changelog of the release",
    origin: "https://example.org",
    steps: [
      { id: "observe", kind: "observe", label: "Observe the page" },
      { id: "read", kind: "readtext", label: "Read the changelog", target: "main" },
    ],
    ...overrides,
  };
}

/** The fixture browser of the suite: one driver that executes the read steps and fails or defers exactly what the test asks. */
function fixturedriver(behavior: Record<string, "done" | "failed"> = {}): flowdriver & { executed: string[] } {
  const executed: string[] = [];
  return {
    executed,
    async execute(step: planfilestep) {
      executed.push(step.id);
      const outcome = behavior[step.id] ?? "done";
      return {
        state: outcome,
        summary:
          outcome === "done"
            ? `The fixture browser executed the step ${step.id} of kind ${step.kind}.`
            : `The fixture browser failed the step ${step.id}.`,
        duration: 5,
      };
    },
  };
}

describe("flowrun requests", () => {
  it("parses terminal arguments into one request with its options", () => {
    const request = parseflowrunrequest([
      "plan.json",
      "--format",
      "json",
      "--output",
      "runs",
      "--grants",
      "grants.json",
    ]);
    expect(request.planpath).toBe("plan.json");
    expect(request.options).toMatchObject({
      format: "json",
      outputdir: "runs",
      grantspath: "grants.json",
      interactive: false,
      dryrun: false,
    });
    const inline = parseflowrunrequest(["plan.json", "--interactive=true"]);
    expect(inline.options.interactive).toBe(true);
    expect(() => parseflowrunrequest([])).toThrow(/needs the plan file path/);
    expect(() => parseflowrunrequest(["plan.json", "--format", "table"])).toThrow(/human or json/);
    expect(() => parseflowrunrequest(["plan.json"])).toThrow(/grants file or the interactive flag/);
  });

  it("parses one grants file of granted HTTPS origins only", () => {
    expect(parsegrantsfile({ origins: ["https://example.org"] })).toEqual(["https://example.org"]);
    expect(() => parsegrantsfile({ origins: [] })).toThrow(/non-empty origins list/);
    expect(() => parsegrantsfile({ origins: ["http://example.org"] })).toThrow(/HTTPS/);
    expect(() => parsegrantsfile([])).toThrow(/json object/);
  });

  it("builds the workflow proposal value the same validation the extension runs", () => {
    const proposal = flowproposalvalue(plan());
    expect(proposal.version).toBe(packageversion);
    expect((proposal.workflow as { origins: string[] }).origins).toEqual(["https://example.org"]);
    expect(() => flowproposalvalue(plan({ origin: "https://elsewhere.org" }))).not.toThrow();
  });

  it("derives the sensitivity of one step the same way the runtime does", () => {
    expect(flowstepsensitive({ id: "s", kind: "observe", label: "l" })).toBe(false);
    expect(flowstepsensitive({ id: "s", kind: "type", label: "l", target: "input" })).toBe(true);
    expect(flowgateof({ id: "s", kind: "type", label: "l" } as never, "https://example.org", "waits").id).toBe(
      "gate:s",
    );
  });

  it("maps run states onto terminal exit codes", () => {
    expect(flowrunexitcodeof("done")).toBe(0);
    expect(flowrunexitcodeof("failed")).toBe(1);
    expect(flowrunexitcodeof("revoked")).toBe(2);
  });
});

describe("flowrun execution", () => {
  it("runs one plan through the fixture browser, seals the chain and exits zero", async () => {
    const driver = fixturedriver();
    const run = await runflow({
      request: {
        planpath: "plan.json",
        options: { format: "human", outputdir: "out", grantspath: "grants.json", interactive: false, dryrun: false },
      },
      file: plan(),
      grants: ["https://example.org"],
      driver,
      now,
      clock: () => now,
    });
    expect(driver.executed).toEqual(["observe", "read"]);
    expect(run.outcome).toMatchObject({ state: "done", steps: 2, exitcode: 0 });
    expect(run.outcome.sealhash).toBeDefined();
    const verification = await verifylogchain(run.log.entries);
    expect(verification.valid).toBe(true);
    expect(run.events.map((event) => event.kind)).toEqual(["start", "step", "step", "done"]);
    expect(run.log.seal?.entries).toBe(run.log.entries.length);
  });

  it("passes the proposal validation of the extension before any step runs", async () => {
    const unknownkind = plan({ steps: [{ id: "boom", kind: "explode", label: "Explode" }] });
    await expect(
      runflow({
        request: {
          planpath: "plan.json",
          options: { format: "human", outputdir: "out", grantspath: "grants.json", interactive: false, dryrun: false },
        },
        file: unknownkind,
        grants: ["https://example.org"],
        driver: fixturedriver(),
        now,
      }),
    ).rejects.toThrow(/reviewed action kind|outside the grants/);
    const ungranted = plan({ origin: "https://elsewhere.org" });
    await expect(
      runflow({
        request: {
          planpath: "plan.json",
          options: { format: "human", outputdir: "out", grantspath: "grants.json", interactive: false, dryrun: false },
        },
        file: ungranted,
        grants: ["https://example.org"],
        driver: fixturedriver(),
        now,
      }),
    ).rejects.toThrow(/outside the grants/);
  });

  it("never starts without an origin grant file or an interactive prompt", async () => {
    await expect(
      runflow({
        request: {
          planpath: "plan.json",
          options: { format: "human", outputdir: "out", interactive: false, dryrun: true },
        },
        file: plan(),
        grants: [],
        driver: dryflowdriver(),
        now,
      }),
    ).rejects.toThrow(/never starts/);
  });

  it("routes every sensitive gate wait to the consent provider and counts the approval", async () => {
    const gates: string[] = [];
    const provider = {
      resolvegate: async (gate: flowrungate) => {
        gates.push(gate.id);
        return "approve" as const;
      },
    };
    const typing = plan({ steps: [{ id: "type", kind: "type", label: "Type the query", target: "input" }] });
    const run = await runflow({
      request: {
        planpath: "plan.json",
        options: { format: "human", outputdir: "out", grantspath: "grants.json", interactive: true, dryrun: false },
      },
      file: typing,
      grants: ["https://example.org"],
      provider,
      driver: fixturedriver(),
      now,
      clock: () => now,
    });
    expect(gates).toEqual(["gate:type"]);
    expect(run.outcome.state).toBe("done");
    expect(run.events.some((event) => event.kind === "gate" && event.stepid === "type")).toBe(true);
  });

  it("revokes the run when the consent provider refuses and when no provider resolves the gate", async () => {
    const typing = plan({ steps: [{ id: "type", kind: "type", label: "Type the query", target: "input" }] });
    const request = {
      planpath: "plan.json",
      options: {
        format: "human" as const,
        outputdir: "out",
        grantspath: "grants.json",
        interactive: true,
        dryrun: false,
      },
    };
    const refused = await runflow({
      request,
      file: typing,
      grants: ["https://example.org"],
      provider: { resolvegate: async () => "refuse" as const },
      driver: fixturedriver(),
      now,
      clock: () => now,
    });
    expect(refused.outcome).toMatchObject({ state: "revoked", steps: 0, exitcode: 2 });
    expect(refused.log.entries.some((entry) => entry.kind === "deny")).toBe(true);
    const denydefault = await runflow({
      request,
      file: typing,
      grants: ["https://example.org"],
      driver: fixturedriver(),
      now,
      clock: () => now,
    });
    expect(denydefault.outcome.state).toBe("revoked");
    expect(denydefault.outcome.exitcode).toBe(2);
    expect(denydefault.events.some((event) => event.kind === "revoked")).toBe(true);
  });

  it("fails the run with exit code one when the fixture browser fails a step", async () => {
    const failing = plan({
      steps: [
        { id: "observe", kind: "observe", label: "Observe" },
        { id: "read", kind: "readtext", label: "Read", target: "main" },
      ],
    });
    const run = await runflow({
      request: {
        planpath: "plan.json",
        options: { format: "human", outputdir: "out", grantspath: "grants.json", interactive: false, dryrun: false },
      },
      file: failing,
      grants: ["https://example.org"],
      driver: fixturedriver({ read: "failed" }),
      now,
      clock: () => now,
    });
    expect(run.outcome).toMatchObject({ state: "failed", steps: 2, exitcode: 1 });
    expect(run.events.some((event) => event.kind === "failed" && event.stepid === "read")).toBe(true);
  });

  it("streams the logstream events and renders the stepstimeline for the terminal", () => {
    const events: flowrunevent[] = [
      { kind: "start", summary: "The flowrun started.", at: now },
      { kind: "gate", stepid: "type", summary: "The step waits at its gate.", at: now + 10 },
      { kind: "step", stepid: "type", summary: "The step ran.", at: now + 20 },
      { kind: "done", summary: "The flowrun completed.", at: now + 30 },
    ];
    expect(flowtimelinerowsof(events)).toEqual([
      { stepid: "type", status: "waiting", summary: "The step waits at its gate.", at: now + 10 },
      { stepid: "type", status: "done", summary: "The step ran.", at: now + 20 },
    ]);
    expect(renderflowtimeline(events)).toContain("[done] type");
    expect(renderflowtimeline([{ kind: "start", summary: "none", at: now }])).toContain("no step");
    expect(renderflowevents(events, "json").split("\n")).toHaveLength(4);
    expect(renderflowevents(events, "human")).toContain("GATE type");
  });

  it("walks the plan in dry run mode with no page effects", async () => {
    const run = await runflow({
      request: {
        planpath: "plan.json",
        options: { format: "human", outputdir: "out", grantspath: "grants.json", interactive: false, dryrun: true },
      },
      file: plan(),
      grants: ["https://example.org"],
      now,
      clock: () => now,
    });
    expect(run.outcome.state).toBe("done");
    expect(run.events.some((event) => event.summary.includes("without page effects"))).toBe(true);
    await expect(
      runflow({
        request: {
          planpath: "plan.json",
          options: { format: "human", outputdir: "out", grantspath: "grants.json", interactive: false, dryrun: false },
        },
        file: plan(),
        grants: ["https://example.org"],
        now,
      }),
    ).rejects.toThrow(/remote endpoint.*dry run flag/);
  });
});
