/**
 * sandboxlane — the server-side sandbox of the run and storage lane
 * real filesystem round trips inside the session jail: write, list, read,
 * removal, the containment refusal, the invalid session gate, the honest
 * pending answers, the modalities report and the once-only welcome page,
 * and the vendored registry mirror pinned byte-identical to the engine
 * source (the single-source law of the catalog). every test drives a
 * unique session id so the .sandboxrun root under the package cwd stays
 * isolated per run.
 */

import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { createsandboxsession, hostmodalityreport, runsandboxline } from "../sandboxlane.js";
import type { SandboxAnswer } from "../sandboxlane.js";
import { MODALITIES, MODALITYPLANCOUNT, planreport } from "../modalities.js";

let counter = 0;

function newsessionid(): string {
  counter += 1;
  return ["test-", String(Date.now()), "-", String(counter)].join("");
}

function jailpath(sessionid: string): string {
  return path.join(process.cwd(), ".sandboxrun", sessionid);
}

function joinedrows(answer: SandboxAnswer): string {
  return answer.rows.map((row) => row.line).join("\n");
}

describe("sandboxlane", () => {
  it("writes, lists and reads a real file inside the session jail", async () => {
    const sessionid = newsessionid();
    const written = await runsandboxline(sessionid, "write hello.txt hello from the sandbox lane");
    expect(written.exitcode).toBe(0);
    expect(joinedrows(written)).toContain("wrote ");
    const listed = await runsandboxline(sessionid, "ls");
    expect(joinedrows(listed)).toContain("hello.txt");
    const read = await runsandboxline(sessionid, "cat hello.txt");
    expect(joinedrows(read)).toContain("hello from the sandbox lane");
    const ondisk = await readFile(path.join(jailpath(sessionid), "hello.txt"), "utf8");
    expect(ondisk).toBe("hello from the sandbox lane");
  });

  it("refuses a target that escapes the jail and creates nothing outside", async () => {
    const sessionid = newsessionid();
    // the forward-slash traversal resolves outside the jail on every platform
    // (a backslash form is a legal file NAME on posix, so it stays inside)
    const answer = await runsandboxline(sessionid, "write ../../escape.txt escaped payload");
    expect(joinedrows(answer)).toContain("path escapes the session jail");
    let outside = "";
    try {
      outside = await readFile(path.join(process.cwd(), "escape.txt"), "utf8");
    } catch {
      outside = "";
    }
    expect(outside).not.toContain("escaped payload");
  });

  it("refuses an invalid session id", async () => {
    const answer = await runsandboxline("bad id with spaces", "ls");
    expect(joinedrows(answer)).toContain("invalid session");
  });

  it("answers the run line through the container modality — executing when the host carries docker, refusing honestly otherwise", async () => {
    const sessionid = newsessionid();
    // a real jailed script: the write lands in the session jail, the run
    // executes it inside the container when the runtime answers
    const placed = await runsandboxline(
      sessionid,
      "write hello.js console.log(process.version)",
    );
    expect(placed.exitcode).toBe(0);
    const answer = await runsandboxline(sessionid, "run hello.js");
    expect(answer.exitcode).toBe(0);
    const text = joinedrows(answer);
    if (text.includes("no docker runtime")) {
      // the honest refusal: the host carries no container runtime, nothing
      // executed, and the modality report rides along
      expect(text).toContain("nothing executed");
      expect(text).toContain("container-docker");
    } else {
      // the container executed the jailed script: the node version row and
      // the exit row answer
      expect(text).toContain("exit 0");
      expect(text).toMatch(/v\d+\.\d+\.\d+/);
    }
  }, 120_000);

  it("refuses a run line whose arguments carry a rejected character", async () => {
    const sessionid = newsessionid();
    const answer = await runsandboxline(sessionid, ["run", "hello.js", "a;rm"].join(" "));
    expect(answer.exitcode).toBe(1);
    expect(joinedrows(answer)).toContain("rejected character");
  });

  it("answers 127 with an honest row for an unknown tool", async () => {
    const sessionid = newsessionid();
    const answer = await runsandboxline(sessionid, "frobnicate everything");
    expect(answer.exitcode).toBe(127);
    expect(joinedrows(answer)).toContain("does not carry this tool");
  });

  it("removes a file and shows the removal in the listing", async () => {
    const sessionid = newsessionid();
    await runsandboxline(sessionid, "write rmme.txt temporary payload");
    const before = await runsandboxline(sessionid, "ls");
    expect(joinedrows(before)).toContain("rmme.txt");
    await runsandboxline(sessionid, "rm -rf rmme.txt");
    const after = await runsandboxline(sessionid, "ls");
    expect(joinedrows(after)).not.toContain("rmme.txt");
  });

  it("writes the welcome page once and keeps it on the second call", async () => {
    const sessionid = newsessionid();
    const first = await createsandboxsession(sessionid);
    expect(first).toContain("session ready");
    const welcome = path.join(jailpath(sessionid), "welcome.md");
    const content = await readFile(welcome, "utf8");
    expect(content).toContain("family infrastructure");
    expect(content).toContain("visitor browser");
    const beforestat = await stat(welcome);
    const second = await createsandboxsession(sessionid);
    expect(second).toContain("type help for the tool surface");
    const afterstat = await stat(welcome);
    expect(afterstat.mtimeMs).toBe(beforestat.mtimeMs);
    const contentafter = await readFile(welcome, "utf8");
    expect(contentafter).toBe(content);
  });

  it("reports the host modalities honestly from the registry (the single source)", async () => {
    const rows = await hostmodalityreport();
    // the summary row plus one honest row per registry record of the ninety plan
    expect(rows.length).toBe(91);
    expect(rows[0]).toBe("the modality registry answers the ninety plan: 90 records — 21 live, 3 host, 66 planned");
    const text = rows.join("\n");
    // the live lanes name the surfaces the platform drives
    expect(text).toContain("container-docker: live lane — docker ");
    expect(text).toContain("runner-node: live lane — the node runtime the run lane executes inside the container");
    expect(text).toContain("fs-vfs: live lane — the session jail the storage lane drives");
    expect(text).toContain("runner-serverless: live lane — the v8 isolate the exec lane drives in process");
    // the polyglot live lanes probe their host runtime (python names the binary)
    expect(text).toContain("language-python: live lane — python3 ");
    expect(text).toContain("build-make: live lane — make ");
    // the host runtimes name their binary and the probe verdict of this host
    expect(text).toContain("emulator-qemu: host runtime qemu-system-x86_64 ");
    expect(text).toContain("microvm-firecracker: host runtime firecracker ");
    expect(text).toContain("container-runsc: host runtime runsc ");
    // the planned records declare themselves planned — no row pretends
    expect(text).toContain("virtual-full: planned — the catalog promise, no lane wires it yet");
    expect(text).toContain("pod-session: planned — the catalog promise, no lane wires it yet");
    // every record row after the summary carries one of the three state words
    for (const row of rows.slice(1)) {
      expect(row).toMatch(/: (live lane — |host runtime |planned — )/);
    }
  });

  it("executes a jailed python script through the polyglot lane when the host carries python", async () => {
    const sessionid = newsessionid();
    const placed = await runsandboxline(
      sessionid,
      "write hello.py print(40 + 2)",
    );
    expect(placed.exitcode).toBe(0);
    const answer = await runsandboxline(sessionid, "exec python hello.py");
    expect(answer.exitcode).toBe(0);
    const text = joinedrows(answer);
    if (text.includes("no python3 runtime")) {
      // the honest refusal: this host carries no cpython, nothing executed
      expect(text).toContain("nothing executed");
      expect(text).toContain("language-python");
    } else {
      expect(text).toContain("42");
      expect(text).toContain("exit 0");
    }
  }, 120_000);

  it("executes a jailed script inside the v8 isolate of the serverless modality", async () => {
    const sessionid = newsessionid();
    await runsandboxline(
      sessionid,
      "write iso.js console.log(6 * 7)",
    );
    const answer = await runsandboxline(sessionid, "exec isolate iso.js");
    expect(answer.exitcode).toBe(0);
    const text = joinedrows(answer);
    expect(text).toContain("42");
    expect(text).toContain("exit 0");
  });

  it("answers the honest refusal with the modality report when the host carries no runtime of the language", async () => {
    const sessionid = newsessionid();
    await runsandboxline(
      sessionid,
      "write hello.lua print(42)",
    );
    const answer = await runsandboxline(sessionid, "exec lua hello.lua");
    expect(answer.exitcode).toBe(0);
    const text = joinedrows(answer);
    if (text.includes("no lua runtime")) {
      expect(text).toContain("nothing executed");
      expect(text).toContain("language-lua");
      expect(text).toContain("the modality registry answers the ninety plan");
    } else {
      expect(text).toContain("42");
      expect(text).toContain("exit 0");
    }
  }, 120_000);

  it("refuses an exec line whose arguments carry a rejected character and answers the known languages for an unknown word", async () => {
    const sessionid = newsessionid();
    const refused = await runsandboxline(sessionid, "exec python hello.py a;rm");
    expect(refused.exitcode).toBe(1);
    expect(joinedrows(refused)).toContain("rejected character");
    const unknown = await runsandboxline(sessionid, "exec klingon hello.k");
    expect(unknown.exitcode).toBe(0);
    const text = joinedrows(unknown);
    expect(text).toContain("carries no lane");
    expect(text).toContain("the polyglot lane answers:");
  });
});

describe("the vendored registry mirror (the single-source law)", () => {
  it("pins the devthink vendor byte-identical to the saddle engine source", async () => {
    // the registry of record lives in the engine (saddle/modalityregistry.ts);
    // the devthink tree carries the vendored mirror because the container
    // build installs the published envelope (sources only, the stale
    // catalog) and never sees the workspace — the byte pin is the law that
    // keeps the vendor a mirror instead of a second author. the day the
    // published envelope carries the built registry, the vendor retires and
    // the lane returns to the library specifier. the tests village keeps
    // this suite inside the devthink app folder, so the paths resolve by
    // depth: the engine through the saddle owner folder two levels up,
    // the vendor through the devthink application root one level up.
    const enginepath = path.join(import.meta.dirname, "..", "..", "saddle", "modalityregistry.ts");
    if (!existsSync(enginepath)) {
      // the container builder runs this suite from the devthink context
      // alone (the saddle workspace never enters the image) — the byte pin
      // answers everywhere the engine source rides (the workspace, the ci
      // checkout) and the census below keeps pinning the vendor itself
      return;
    }
    const engine = await readFile(enginepath, "utf8");
    const vendor = await readFile(path.join(import.meta.dirname, "..", "modalities.ts"), "utf8");
    expect(vendor).toBe(engine);
  });

  it("answers the ninety plan from the vendored registry the lane reads", () => {
    // the vendor the lane imports answers the same census the engine
    // battery pins — the two suites hold the same truth from both ends
    expect(MODALITYPLANCOUNT).toBe(90);
    expect(MODALITIES).toHaveLength(90);
    const report = planreport();
    expect(report).toEqual({
      plancount: 90,
      catalogcount: 90,
      live: 21,
      host: 3,
      planned: 66,
      plananswered: true,
    });
  });
});
