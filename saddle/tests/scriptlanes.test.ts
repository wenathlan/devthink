/** scriptlanes.test — the script lanes contract: the sh wrap and the
 * house yaml subset interpretation, the babel compile roundtrip guarded
 * on the optional @babel/core runtime (the lane refuses honestly
 * without it), the sequential server-side bash execution with enforced
 * deadlines, the detached background lane with observable runstatuses,
 * and the docker-ready descriptor on the house node base. runnable with
 * vitest: bunx vitest run tests/scriptlanes.test.ts */
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  assertservercontext,
  compilewithbabel,
  dockerdescriptor,
  interpretsh,
  interpretyaml,
  interpretyml,
  runscript,
  runscriptbackground,
  SCRIPTLANES_NODE_BASE,
  scriptRunStatus,
} from "../scriptlanes.js";

/** the runtime probes: the babel compile lane rides the optional
 * @babel/core and the cross-check rides the optional yaml package —
 * both refuse honestly when absent, so the tests skip the same way
 * instead of pretending the runtimes exist. */
const babelavailable = await (async () => {
  try {
    await import("@babel/core");
    return true;
  } catch {
    return false;
  }
})();

const yamlavailable = await (async () => {
  try {
    await import("yaml");
    return true;
  } catch {
    return false;
  }
})();

/** the honest pause the background poll waits with. */
const pause = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

/** the three-step descriptor the interpretation tests read: plain and
 * quoted strings, numeric timeoutms values and a trailing comment. */
const THREESTEPS = [
  "steps:",
  "  - name: alpha",
  "    run: echo one",
  "    timeoutms: 120",
  '  - name: "beta two"',
  "    run: 'echo \"two\"'",
  "    timeoutms: 250",
  "  - name: gamma",
  "    run: echo three # the trailing comment rides outside the quotes",
].join("\n");

describe("the script lanes contract", () => {
  it("wraps an sh script as one direct step", () => {
    const plan = interpretsh("echo hello");
    assert.equal(plan.steps.length, 1);
    assert.equal(plan.steps[0].name, "script");
    assert.equal(plan.steps[0].run, "echo hello");
    assert.equal(plan.steps[0].timeoutms, undefined);
    assert.equal(plan.source, "sh");
    assert.equal(plan.compiledvia, "direct");
    assert.throws(
      () => interpretsh(""),
      (error: Error) => error.code === "INVALID_INPUT",
    );
  });

  it("interprets a yml workflow with three timed steps", () => {
    const plan = interpretyml(THREESTEPS);
    assert.equal(plan.source, "yml");
    assert.equal(plan.compiledvia, "babel");
    assert.equal(plan.steps.length, 3);
    assert.deepEqual(plan.steps[0], { name: "alpha", run: "echo one", timeoutms: 120 });
    assert.equal(plan.steps[1].name, "beta two");
    assert.equal(plan.steps[1].run, 'echo "two"');
    assert.equal(typeof plan.steps[0].timeoutms, "number");
    assert.equal(plan.steps[2].run, "echo three");
    assert.equal(plan.steps[2].timeoutms, undefined);
    const yamllane = interpretyaml(THREESTEPS);
    assert.equal(yamllane.source, "yaml");
    assert.equal(yamllane.steps.length, 3);
  });

  it("speaks the subset scalars honestly: strings, numbers, booleans", () => {
    const plan = interpretyml("steps:\n  - name: counter\n    run: echo count\n    timeoutms: 120");
    assert.equal(typeof plan.steps[0].timeoutms, "number");
    assert.equal(plan.steps[0].timeoutms, 120);
    /* a boolean scalar parses as a boolean, so it refuses the numeric
       slot instead of riding as the string "true" */
    assert.throws(
      () => interpretyml("steps:\n  - name: liar\n    run: echo no\n    timeoutms: true"),
      (error: Error) =>
        error.code === "YAML_INTERPRET_FAILED" && String(error.message).includes("timeoutms must be a positive number"),
    );
    /* a decimal rides the number lane too — the subset speaks integers
       and decimals, and never coerces what is neither */
    const decimal = interpretyml("steps:\n  - name: counter\n    run: echo count\n    timeoutms: 250.5");
    assert.equal(decimal.steps[0].timeoutms, 250.5);
    assert.throws(
      () => interpretyml("steps:\n  - name: liar\n    run: echo no\n    timeoutms: 250.5.5"),
      (error: Error) =>
        error.code === "YAML_INTERPRET_FAILED" && String(error.message).includes("timeoutms must be a positive number"),
    );
  });

  it("refuses broken yml with the honest code", () => {
    const broken = [
      { text: "steps:\n  - name: alpha\n    run: echo one\n   timeoutms: 100", detail: "bad indentation" },
      { text: "steps:\n  - name: alpha\n    run: echo one\n    engine: docker", detail: "unknown key" },
      { text: "steps:\n  - name: alpha\n    run: echo one\n    name: again", detail: "twice" },
      { text: "steps:\n  - name: alpha\n    run: echo one\nversion: 2", detail: "second top-level key" },
      { text: "steps:\n  - name: alpha\n    run:", detail: "missing" },
      { text: "name: workflow\nsteps:\n  - name: a\n    run: b", detail: "exactly one top-level key" },
      { text: "steps:\n    badline: 1", detail: "list dash" },
      { text: "steps:\n- name: a\n  run: b", detail: "indented under the steps key" },
      { text: "steps:", detail: "empty" },
      { text: "", detail: "never carries the top-level steps key" },
    ];
    for (const { text, detail } of broken) {
      assert.throws(
        () => interpretyml(text),
        (error: Error) => error.code === "YAML_INTERPRET_FAILED" && String(error.message).includes(detail),
        `the descriptor refusing ${detail}`,
      );
    }
  });

  it.skipIf(!babelavailable)("compiles a yml plan through the babel roundtrip without losing a step", async () => {
    const plan = interpretyml(THREESTEPS);
    const compiled = await compilewithbabel(plan);
    assert.equal(compiled.compiledvia, "babel");
    assert.equal(compiled.source, "yml");
    assert.deepEqual(compiled.steps, plan.steps);
    assert.deepEqual(compiled.steps[1], { name: "beta two", run: 'echo "two"', timeoutms: 250 });
  });

  it("executes a two-step bash plan server-side and captures the streams", async () => {
    const plan = {
      steps: [
        { name: "greet", run: 'echo "script lanes"' },
        { name: "trivial", run: "true" },
      ],
      source: "sh",
      compiledvia: "direct",
    };
    const result = await runscript(plan);
    assert.equal(result.status, "succeeded");
    assert.equal(result.error, undefined);
    assert.equal(result.steps.length, 2);
    assert.equal(result.steps[0].exitcode, 0);
    assert.equal(result.steps[0].stdout.trim(), "script lanes");
    assert.equal(result.steps[1].exitcode, 0);
    assert.ok(result.steps[0].durationms >= 0);
  });

  it("fails the plan honestly on a nonzero exit and skips the later steps", async () => {
    const plan = {
      steps: [
        { name: "ok", run: "echo before" },
        { name: "boom", run: "exit 3" },
        { name: "never", run: "echo never" },
      ],
      source: "sh",
      compiledvia: "direct",
    };
    const result = await runscript(plan);
    assert.equal(result.status, "failed");
    assert.equal(result.steps[0].exitcode, 0);
    assert.equal(result.steps[1].exitcode, 3);
    assert.equal(result.steps[1].error?.code, "SCRIPT_STEP_FAILED");
    assert.equal(result.steps[2].skipped, true);
    assert.equal(result.steps[2].exitcode, null);
    assert.equal(result.error?.code, "SCRIPT_STEP_FAILED");
  });

  it("enforces the step deadline with an honest kill", async () => {
    const plan = {
      steps: [{ name: "sleepy", run: "sleep 5", timeoutms: 150 }],
      source: "sh",
      compiledvia: "direct",
    };
    const result = await runscript(plan);
    assert.equal(result.status, "failed");
    assert.equal(result.error?.code, "STEP_DEADLINE_EXCEEDED");
    assert.equal(result.steps[0].timedout, true);
    assert.equal(result.steps[0].exitcode, null);
    assert.equal(result.steps[0].signal, "SIGKILL");
    assert.ok(result.steps[0].durationms < 3000, "the deadline killed the sleep long before five seconds");
  });

  it("runs a plan detached in the background lane with observable statuses", async () => {
    const plan = {
      steps: [
        { name: "wait", run: "sleep 0.2" },
        { name: "greet", run: "echo detached hello" },
      ],
      source: "sh",
      compiledvia: "direct",
    };
    const launch = runscriptbackground(plan);
    assert.equal(typeof launch.runid, "string");
    assert.ok(["created", "running"].includes(launch.status), `the lane answers an early status (${launch.status})`);
    const immediate = scriptRunStatus(launch.runid);
    assert.equal(immediate.status, "running", "the run is detached — the caller is free while the steps ride");
    assert.ok(Array.isArray(immediate.history));

    let settled = scriptRunStatus(launch.runid);
    const deadlineat = Date.now() + 5000;
    while (settled.status !== "succeeded" && settled.status !== "failed" && Date.now() < deadlineat) {
      await pause(50);
      settled = scriptRunStatus(launch.runid);
    }
    assert.equal(settled.status, "succeeded");
    assert.equal(settled.result?.status, "succeeded");
    assert.equal(settled.result?.steps.length, 2);
    assert.equal(settled.result?.steps[1].stdout.trim(), "detached hello");

    assert.throws(
      () => scriptRunStatus("scriptrun-unknown"),
      (error: Error) => error.code === "SCRIPT_RUN_NOT_FOUND",
    );
  });

  it("refuses the visitor browser context and passes in node", () => {
    assert.doesNotThrow(() => assertservercontext());
    assert.throws(
      () => assertservercontext({ window: {} }),
      (error: Error) => error.code === "VISITOR_CONTEXT_REFUSED",
    );
    assert.throws(
      () => assertservercontext({ document: {} }),
      (error: Error) => error.code === "VISITOR_CONTEXT_REFUSED",
    );
  });

  it("emits the docker-ready descriptor for the container lane", () => {
    const plan = {
      steps: [
        { name: "quote-step", run: 'echo "quoted $dollar"' },
        { name: "plain-step", run: "true" },
      ],
      source: "sh",
      compiledvia: "direct",
    };
    const descriptor = dockerdescriptor(plan);
    assert.ok(descriptor.dockerfile.includes(`FROM ${SCRIPTLANES_NODE_BASE}`), "the house node base is pinned");
    assert.ok(/^FROM node:26\.\d+/m.test(descriptor.dockerfile), "the base rides the node 26 line the house pins");
    assert.ok(
      descriptor.dockerfile.includes('RUN bash -c "echo \\"quoted \\$dollar\\""'),
      "the quotes and dollars are escaped in the RUN line",
    );
    assert.ok(descriptor.dockerfile.includes('RUN bash -c "true"'), "every step rides a RUN line");
    assert.ok(
      descriptor.dockerfile.includes('echo "quoted $dollar"\n'),
      "the plan script carries the raw command verbatim in the heredoc block",
    );
    assert.ok(
      descriptor.dockerfile.includes('ENTRYPOINT ["bash", "/app/plan.sh"]'),
      "the entrypoint line rides the dockerfile",
    );
    assert.equal(descriptor.entrypoint, "bash /app/plan.sh");
  });

  it.skipIf(!yamlavailable)("agrees with the real yaml parser on the shared subset surface", async () => {
    const { parse } = await import("yaml");
    const plan = interpretyml(THREESTEPS);
    const reference = parse(THREESTEPS);
    assert.deepEqual(plan.steps, reference.steps);
  });
});
