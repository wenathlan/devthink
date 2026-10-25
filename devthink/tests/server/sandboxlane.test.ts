/**
 * sandboxlane — the server-side sandbox of the run and storage lane
 * real filesystem round trips inside the session jail: write, list, read,
 * removal, the containment refusal, the invalid session gate, the honest
 * pending answers, the modalities report and the once-only welcome page.
 * every test drives a unique session id so the .sandboxrun root under the
 * package cwd stays isolated per run.
 */

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { SandboxAnswer } from "../../sandboxlane.js";
import { createsandboxsession, hostmodalityreport, runsandboxline } from "../../sandboxlane.js";

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

  it("answers the run line through the saddle vm modalities honestly", async () => {
    const sessionid = newsessionid();
    const answer = await runsandboxline(sessionid, "run");
    expect(answer.exitcode).toBe(0);
    const text = joinedrows(answer);
    expect(text).toContain("vm modalities");
    expect(text).toContain("runner-node: available on this host");
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

  it("reports the host modalities honestly", async () => {
    const rows = await hostmodalityreport();
    const text = rows.join("\n");
    expect(text).toContain("container-docker: ");
    expect(text).toContain("emulator-qemu: ");
    expect(text).toContain("microvm-firecracker: ");
    expect(text).toContain("container-runsc: ");
    expect(text).toContain("runner-node: available on this host (the node runtime itself)");
  });
});
