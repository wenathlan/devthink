import { describe, expect, it } from "vitest";
import {
  exitedclean,
  normalizeresult,
  PYTHON_DEFAULTS,
  parsejsonstdout,
  type pythonanswer,
  pythonargv,
  type pythonoptions,
  type pythonresult,
  type pythonrunner,
  runpython,
  runpythonjson,
} from "../devthink/pythonscripts.js";

/** Builds a runner seam that answers one canned result and records every call it received. */
function fakerunner(answer: pythonanswer) {
  const calls: { script: string; options: pythonoptions }[] = [];
  const runner: pythonrunner = async (script, options) => {
    calls.push({ script, options });
    return answer;
  };
  return { runner, calls };
}

const sandbox: pythonoptions = {
  cwd: "/sandbox/accounts/one",
  timeoutms: 5_000,
  args: ["--flag"],
  interpreter: "python3",
};

describe("pythonscripts the runner seam", () => {
  it("hands the script and the merged sandbox options to the injected runner", async () => {
    const { runner, calls } = fakerunner({ code: 0, stdout: "{}" });
    const result = await runpython("report.py", sandbox, runner);
    expect(result.code).toBe(0);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.script).toBe("report.py");
    expect(calls[0]?.options.cwd).toBe("/sandbox/accounts/one");
    expect(calls[0]?.options.timeoutms).toBe(5_000);
    expect(calls[0]?.options.args).toEqual(["--flag"]);
    expect(calls[0]?.options.interpreter).toBe("python3");
  });

  it("fills the house defaults the caller did not name", async () => {
    const { runner, calls } = fakerunner({ code: 0, stdout: "ok" });
    await runpython("report.py", { cwd: "/sandbox" }, runner);
    expect(calls[0]?.options.timeoutms).toBe(PYTHON_DEFAULTS.timeoutms);
    expect(calls[0]?.options.args).toEqual([]);
    expect(calls[0]?.options.interpreter).toBe("python3");
  });

  it("refuses an empty script path and an empty sandbox cwd", async () => {
    const { runner } = fakerunner({ code: 0, stdout: "" });
    await expect(runpython("  ", { cwd: "/sandbox" }, runner)).rejects.toThrow("the script path is empty");
    await expect(runpython("report.py", { cwd: " " }, runner)).rejects.toThrow("the sandbox cwd is empty");
    await expect(runpython("report.py", { cwd: "/sandbox", timeoutms: 0 }, runner)).rejects.toThrow(
      "the timeout must be positive",
    );
  });
});

describe("pythonscripts the result normalization", () => {
  it("fills the short form a fake answers: empty streams, inferred reason, zero duration", () => {
    expect(normalizeresult({ code: 0, stdout: "{}" })).toEqual<pythonresult>({
      code: 0,
      stdout: "{}",
      stderr: "",
      reason: "exit",
      durationms: 0,
    });
  });

  it("infers error when the code is null and keeps an explicit reason when given", () => {
    expect(normalizeresult({ code: null }).reason).toBe("error");
    expect(normalizeresult({ code: null, reason: "timeout" }).reason).toBe("timeout");
    expect(normalizeresult({ code: 1, stderr: "boom" }).reason).toBe("exit");
  });
});

describe("pythonscripts timeout, stderr and non-zero codes", () => {
  it("carries a timeout kill as a non-clean failed run", async () => {
    const { runner } = fakerunner({ code: null, stdout: "", stderr: "", reason: "timeout" });
    const result = await runpython("slow.py", sandbox, runner);
    expect(result.reason).toBe("timeout");
    expect(result.code).toBeNull();
    expect(exitedclean(result)).toBe(false);
  });

  it("carries the stderr of a failed script untouched", async () => {
    const { runner } = fakerunner({ code: 1, stderr: "traceback (most recent call last): valueerror" });
    const result = await runpython("broken.py", sandbox, runner);
    expect(result.code).toBe(1);
    expect(result.stderr).toBe("traceback (most recent call last): valueerror");
    expect(result.reason).toBe("exit");
    expect(exitedclean(result)).toBe(false);
  });

  it("gates the maestro on the success code only", () => {
    expect(exitedclean({ code: 0, stdout: "", stderr: "", reason: "exit", durationms: 1 })).toBe(true);
    expect(exitedclean({ code: 2, stdout: "", stderr: "", reason: "exit", durationms: 1 })).toBe(false);
    expect(exitedclean({ code: null, stdout: "", stderr: "", reason: "error", durationms: 1 })).toBe(false);
  });
});

describe("pythonscripts the json lane", () => {
  it("parses a json stdout into a value", () => {
    expect(parsejsonstdout('{"answer": 42}')).toEqual({ ok: true, value: { answer: 42 } });
    expect(parsejsonstdout("  []  ")).toEqual({ ok: true, value: [] });
  });

  it("answers a readable error for empty output and broken json, never a throw", () => {
    expect(parsejsonstdout("")).toEqual({ ok: false, error: "the stdout is empty" });
    expect(parsejsonstdout("not json")).toEqual({ ok: false, error: expect.stringContaining("Unexpected token") });
    const parsed = parsejsonstdout({ code: 0, stdout: "", stderr: "", reason: "exit", durationms: 0 });
    expect(parsed).toEqual({ ok: false, error: "the stdout is empty" });
  });

  it("composes the run and the parse in one json answer", async () => {
    const { runner } = fakerunner({ code: 0, stdout: '{"total": 3}\n' });
    const { result, json } = await runpythonjson("report.py", sandbox, runner);
    expect(result.code).toBe(0);
    expect(json).toEqual({ ok: true, value: { total: 3 } });
  });
});

describe("pythonscripts the command line", () => {
  it("builds the argv the interpreter runs: script first, extra arguments after", () => {
    expect(pythonargv("report.py")).toEqual(["report.py"]);
    expect(pythonargv("report.py", ["--json", "--quiet"])).toEqual(["report.py", "--json", "--quiet"]);
  });
});
