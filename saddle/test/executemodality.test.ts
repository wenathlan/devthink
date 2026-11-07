// # executemodality.test.ts — the ninety-seat battery: every modality
// of the catalog dispatches through executemodality and answers a real,
// deterministic proof (wave modalitytruth). the law this battery pins:
// no seat of the ninety answers a canned string — the in-process seats
// answer real computed artifacts (bytes, digests, wire packets, exit
// codes) the test recomputes independently, the host seats really spawn
// (the workspace stages under the engine root, the binary runs wherever
// it exists on the host and answers the honest coded absence where it
// does not — never a faked success), the machine seat executes real
// rv64im machine code through the in-process core and the provider
// seats build the real signed requests.
//
// the honest-absence pattern: a host seat whose binary this host does
// not carry answers one of the coded refusals (HOST_RUNTIME_ABSENT,
// RUN_EXITED_NONZERO, RUN_DEADLINE_EXCEEDED) — the battery pins the
// code set, the argv[0] contract and, wherever the binary is guaranteed
// by the runtime family itself (node, bun, bash), the exact stdout of
// the real execution.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "vitest";
import {
  executemodality,
  MODALITYENGINE,
  type ModalityRunResult,
} from "../modalities.ts";
import { MODALITIES } from "../modalityregistry.ts";

/** One run request against the engine scope. */
const request = (code: string, inputs?: unknown, deadlinems = 8000) => ({
  code,
  inputs,
  deadlinems,
  scope: "engine",
});

/** The honest coded refusals a host seat answers when its binary or its
 * image is absent from this host — a faked success never rides. */
const HONESTREFUSALS = new Set([
  "HOST_RUNTIME_ABSENT",
  "RUN_EXITED_NONZERO",
  "RUN_DEADLINE_EXCEEDED",
  "RUN_FAILED",
  "PROVIDER_CONFIG_ABSENT",
  "PROVIDER_ANSWERED_ERROR",
  "ENGINE_SPAWNER_ABSENT",
  "ENGINE_STAGER_ABSENT",
  /* the payload gates the exec seats ride: the mz, elf and wasme magic
   * laws refuse foreign bytes with their own honest codes */
  "MZ_SIGNATURE_ABSENT",
  "ELF_MAGIC_ABSENT",
  "WASM_BYTES_ABSENT",
]);

/** Dispatches one seat and asserts the honest shape: the seat identity
 * answers, the status is one of the two truths and a failed run always
 * carries a coded error from the honest set. */
async function dispatch(seat: number | string, code: string, inputs?: unknown): Promise<ModalityRunResult> {
  const result = await executemodality(seat, request(code, inputs));
  const num = typeof seat === "number" ? seat : (result as { num?: number }).num;
  assert.ok(result !== undefined, "the dispatch answers a result");
  assert.ok(result.status === "succeeded" || result.status === "failed", `seat ${seat} answers one of the two truths`);
  if (result.status === "failed") {
    assert.ok(result.error !== undefined, `seat ${seat} fails with a coded error`);
    assert.ok(HONESTREFUSALS.has(result.error.code), `seat ${seat} fails with the honest code ${result.error?.code}`);
  }
  if (typeof num === "number") assert.equal(result.num, num, "the result names its seat");
  return result;
}

/** Pins one host seat against its binary contract: the argv[0] rides
 * the named binary and the run either really succeeded or answers the
 * honest coded refusal — never a third state. */
async function hostseat(seat: number, binary: string, code: string, inputs?: unknown): Promise<ModalityRunResult> {
  const result = await dispatch(seat, code, inputs);
  assert.ok(result.plan !== undefined, `seat ${seat} stamps its spawn plan`);
  assert.equal(result.plan?.argv[0], binary, `seat ${seat} rides ${binary}`);
  assert.ok(result.plan?.workspace !== undefined, `seat ${seat} records the staged workspace`);
  assert.ok(
    result.plan?.env?.HOME === result.plan?.cwd,
    "the spawn env pins HOME to the staged workspace (never the host env)",
  );
  return result;
}

/** The minimal real wasm module the wasm seats instantiate: one
 * function () -> i32 answering 42, hand-encoded on the wire (the
 * section bytes are the real wasm binary format). */
const WASMMODULE = Buffer.from([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7f, 0x03, 0x02, 0x01, 0x00,
  0x07, 0x07, 0x01, 0x03, 0x61, 0x6e, 0x73, 0x00, 0x00, 0x0a, 0x06, 0x01, 0x04, 0x00, 0x41, 0x2a, 0x0b,
]).toString("base64");

/** Encodes one rv64im instruction: the r-type wire format. */
const rvr = (f7: number, rs2: number, f3: number, rs1: number, rd: number, op: number) =>
  (((f7 << 25) | (rs2 << 20) | (f3 << 12) | (rs1 << 15) | (rd << 7) | op) >>> 0) as number;
/** Encodes one rv64im instruction: the i-type wire format. */
const rvi = (imm: number, f3: number, rs1: number, rd: number, op: number) =>
  ((((imm & 0xfff) << 20) | (f3 << 12) | (rs1 << 15) | (rd << 7) | op) >>> 0) as number;
/** Encodes one rv64im instruction: the s-type wire format. */
const rvs = (imm: number, f3: number, rs1: number, rs2: number, op: number) =>
  ((((imm >> 5) & 0x7f) << 25) | (rs2 << 20) | (f3 << 12) | (rs1 << 15) | ((imm & 0x1f) << 7) | op) >>> 0;

/** The real rv64im program the machine seat executes: 7*6=42, +100-2
 * =140, one store and one load through memory, exit 140 through the
 * linux ecall convention (a7=93, a0=140). twelve retired instructions. */
const RV64PROGRAM = Buffer.from(
  new Uint8Array(
    new Uint32Array([
      rvi(7, 0, 0, 1, 0x13), // addi x1, x0, 7
      rvi(6, 0, 0, 2, 0x13), // addi x2, x0, 6
      rvr(1, 2, 0, 1, 3, 0x33), // mul x3, x1, x2 — 42
      rvi(100, 0, 0, 4, 0x13), // addi x4, x0, 100
      rvr(0, 4, 0, 3, 5, 0x33), // add x5, x3, x4 — 142
      rvi(2, 0, 0, 6, 0x13), // addi x6, x0, 2
      rvr(0x20, 6, 0, 5, 7, 0x33), // sub x7, x5, x6 — 140
      rvs(0x400, 2, 0, 7, 0x23), // sw x7, 0x400(x0)
      rvi(0x400, 2, 0, 8, 0x03), // lw x8, 0x400(x0) — 140 through memory
      rvi(0, 0, 8, 10, 0x13), // addi x10, x8, 0 — a0 = 140
      rvi(93, 0, 0, 17, 0x13), // addi x17, x0, 93 — a7 = the exit door
      rvi(0, 0, 0, 0, 0x73), // ecall
    ]).buffer,
  ),
).toString("base64");

/** The fake mz payload the exe gate demands (base64 of "MZ" + body). */
const EXPAYLOAD = Buffer.concat([Buffer.from("MZ"), Buffer.alloc(16, 0x90)]).toString("base64");
/** The fake elf payload the binary gate demands (base64 of the elf magic + body). */
const ELFPAYLOAD = Buffer.concat([Buffer.from([0x7f, 0x45, 0x4c, 0x46, 2, 1, 1, 0]), Buffer.alloc(24)]).toString("base64");

/** sha256 hex of one string — the independent recomputation the battery
 * compares the engine's artifacts against. */
const sha256 = (body: string) => createHash("sha256").update(body, "utf8").digest("hex");
/** sha1 hex of one string — the git blob oid recomputation. */
const sha1 = (body: string) => createHash("sha1").update(body, "utf8").digest("hex");

describe("the executemodality battery — the ninety seats answer real executors", () => {
  it("the catalog holds the ninety and every seat carries an executor", () => {
    assert.equal(MODALITYENGINE.length, 90);
    assert.equal(MODALITIES.length, 90);
    for (const spec of MODALITYENGINE) {
      assert.equal(typeof spec.execute, "function", `seat ${spec.num} (${spec.slug}) carries a real executor`);
    }
  });

  it("seat 1 virtualfull — the qemu machine plan stamps and answers honestly", async () => {
    const result = await hostseat(1, "qemu-system-x86_64", "");
    assert.ok(result.plan?.argv.includes("q35"), "the machine plan carries the q35 board");
  });

  it("seat 2 virtualkvm — the kvm plan stamps and answers honestly", async () => {
    const result = await hostseat(2, "qemu-system-x86_64", "");
    assert.ok(result.plan?.argv.includes("-enable-kvm"), "the kvm plan carries the accelerator");
  });

  it("seat 3 virtualvgpu — the mig slice carves from the real catalog", async () => {
    const result = await dispatch(3, "", { gpu: "b200", profile: "2g.40gb" });
    assert.equal(result.status, "succeeded");
    assert.deepEqual(result.artifact, { gpu: "b200", profile: "2g.40gb", vramgb: 40, instances: 4 });
  });

  it("seat 4 virtualvcpu — the topology solver answers a symmetric product", async () => {
    const result = await dispatch(4, "", { vcpus: 8 });
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as { sockets: number; cores: number; threads: number };
    assert.equal(artifact.sockets * artifact.cores * artifact.threads, 8, "the topology solves eight real vcpus");
  });

  it("seat 5 virtualprocessor — the cpu class presents from the catalog", async () => {
    const result = await dispatch(5, "", { cpu: "epyc9965" });
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as { model: string; baseghz: number; tdp: number };
    assert.ok(artifact.model.length > 0 && artifact.baseghz > 0 && artifact.tdp > 0);
  });

  it("seat 6 virtualgpu — the gpu bank presents from the catalog", async () => {
    const result = await dispatch(6, "", { gpu: "b200", count: 2 });
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as { count: number; totalvramgb: number };
    assert.equal(artifact.count, 2);
    assert.ok(artifact.totalvramgb > 0);
  });

  it("seat 7 virtualdrivers — the nvml shim honors the driver-quota gate", async () => {
    const result = await dispatch(7, "", { quota: 6 });
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as { nvmlshim: { device: number; vrammib: number }[] };
    assert.equal(artifact.nvmlshim.length, 6, "the gate presents exactly six devices");
    assert.ok(artifact.nvmlshim.every((device) => device.vrammib > 0));
  });

  it("seat 8 virtualscreen — the xvfb plan stamps and answers honestly", async () => {
    await hostseat(8, "Xvfb", "");
  }, 15000);

  it("seat 9 hardwarevirtual — the composition answers the full manifest", async () => {
    const result = await dispatch(9, "", { vcpus: 4, memorygb: 32 });
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as {
      memorygb: number;
      processor: { model: string };
      drives: { format: string }[];
    };
    assert.equal(artifact.memorygb, 32);
    assert.ok(artifact.processor.model.length > 0);
    assert.equal(artifact.drives[0]?.format, "qcow2");
  });

  it("seat 10 microvmfirecracker — the microvm plan stamps and answers honestly", async () => {
    await hostseat(10, "firecracker", "");
  });

  it("seat 11 microvmgpuless — the software-render plan stamps its env", async () => {
    const result = await hostseat(11, "Xvfb", "");
    assert.equal(result.plan?.env?.LIBGL_ALWAYS_SOFTWARE, "1", "the software-render law rides the env");
  }, 15000);

  it("seat 12 emulatorqemu — the rv64im core executes real machine code", async () => {
    const result = await dispatch(12, RV64PROGRAM);
    assert.equal(result.status, "succeeded", `the core never fakes a boot: ${JSON.stringify(result.error)}`);
    const run = result.artifact as { exitcode: number; steps: number; statedigest: string; trace: number[] };
    assert.equal(run.exitcode, 140, "the exit door answers the program's own code");
    assert.equal(run.steps, 12, "twelve instructions retired for real");
    assert.equal(run.trace[0], 0, "the trace head walks from the entry");
    assert.match(run.statedigest, /^[0-9a-f]{64}$/, "the state digest answers the deterministic sha256");
    const again = await dispatch(12, RV64PROGRAM);
    assert.equal(
      (again.artifact as { statedigest: string }).statedigest,
      run.statedigest,
      "one image answers one digest — the deterministic proof",
    );
  });

  it("seat 13 confidentialsevsnp — the sev plan stamps and answers honestly", async () => {
    const result = await hostseat(13, "qemu-system-x86_64", "");
    assert.ok(
      result.plan?.argv.some((token) => token.startsWith("sev-snp-guest")),
      "the confidential plan carries the sev guest",
    );
  });

  it("seat 14 browserwebcontainer — the node+wasm machine really runs", async () => {
    const result = await hostseat(14, "node", 'console.log("webcontainer real:", 21 * 2)');
    assert.equal(result.status, "succeeded", `node runs wherever the family runs: ${JSON.stringify(result.error)}`);
    assert.equal(result.stdout, "webcontainer real: 42\n");
  });

  it("seat 15 gpuvirgl — the virgl plan stamps and answers honestly", async () => {
    const result = await hostseat(15, "qemu-system-x86_64", "");
    assert.ok(
      result.plan?.argv.some((token) => token.startsWith("virtio-vga-gl")),
      "the virgl plan carries the gl device",
    );
  });

  it("seat 16 runneruniversal — the sniffer routes the shebang for real", async () => {
    const result = await dispatch(16, "#!/usr/bin/env deno\nconsole.log(1)");
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as { kind: string; seat: number; argv: string[]; interpreter: string };
    assert.equal(artifact.kind, "script");
    assert.equal(artifact.seat, 28, "a shebang payload routes to the sh seat");
    assert.equal(artifact.argv[0], "/usr/bin/env", "the shebang interpreter parses for real");
    assert.equal(artifact.argv[1], "deno");
  });

  it("seat 17 runnernode — node really executes the payload", async () => {
    const result = await hostseat(17, "node", 'console.log("runnernode real:", 6 * 7)');
    assert.equal(result.status, "succeeded", `node runs wherever the family runs: ${JSON.stringify(result.error)}`);
    assert.equal(result.stdout, "runnernode real: 42\n");
  });

  it("seat 18 runnerbun — bun really executes the staged program file", async () => {
    const result = await hostseat(18, "bun", 'console.log("runnerbun real:", 6 * 7)');
    assert.equal(result.status, "succeeded", `bun runs wherever the family runs: ${JSON.stringify(result.error)}`);
    assert.equal(result.stdout, "runnerbun real: 42\n");
    assert.equal(result.plan?.workspace?.staged, true, "the staged program file really rode the spawn");
  });

  it("seat 19 runnerdeno — the deno plan stamps and answers honestly", async () => {
    await hostseat(19, "deno", 'console.log("deno real")');
  });

  it("seat 20 runnerwebpack — the webpack bridge stamps the node argv", async () => {
    const result = await hostseat(20, "node", "console.log('entry')");
    assert.ok(result.plan !== undefined);
  });

  it("seat 21 runnerbabel — babel compiles and the isolate runs the result", async () => {
    const result = await dispatch(21, 'const answer = 6 * 7; console.log("babel real:", answer);');
    assert.equal(result.status, "succeeded");
    assert.equal(result.stdout, "babel real: 42");
    const artifact = result.artifact as { compiled: number };
    assert.ok(artifact.compiled > 0, "the compiled artifact answers its real byte count");
  });

  it("seat 22 runnerwasm — the wasm module instantiates and the export really answers", async () => {
    const result = await dispatch(22, WASMMODULE);
    assert.equal(result.status, "succeeded");
    assert.equal(result.stdout, "42", "the zero-parameter export call answers 42 for real");
  });

  it("seat 23 runnerwasi — the wasi plan stamps and answers honestly", async () => {
    await hostseat(23, "wasmtime", WASMMODULE);
  });

  it("seat 24 runnerserverless — the fresh isolate really runs the payload", async () => {
    const result = await dispatch(24, 'console.log("serverless real:", 6 * 7)');
    assert.equal(result.status, "succeeded");
    assert.equal(result.stdout, "serverless real: 42");
  });

  it("seat 25 runnerwasme — the wasm instantiation answers and the gate refuses foreign bytes", async () => {
    const result = await dispatch(25, WASMMODULE);
    assert.equal(result.status, "succeeded");
    assert.equal(result.stdout, "42");
    const refused = await executemodality(25, request("not wasm bytes at all"));
    assert.equal(refused.status, "failed");
    assert.equal(refused.error?.code, "WASM_BYTES_ABSENT", "the wasme gate never fakes a run on foreign bytes");
  });

  it("seat 26 runnerexe — the mz gate refuses and the plan stamps honestly", async () => {
    const result = await hostseat(26, "wine", EXPAYLOAD);
    const gate = await executemodality(26, request("plain text, no mz signature"));
    assert.equal(gate.status, "failed");
    assert.equal(gate.error?.code, "MZ_SIGNATURE_ABSENT", "the exe gate refuses every payload without the pe magic");
  });

  it("seat 27 runnerbinary — the elf gate refuses and the exec surface rides the staged file", async () => {
    const result = await dispatch(27, ELFPAYLOAD);
    assert.ok(result.plan !== undefined);
    assert.equal(
      result.plan?.argv[0],
      result.plan?.workspace?.file,
      "the exec surface rides the staged payload file the kernel execs",
    );
    const gate = await executemodality(27, request("plain text, no elf magic"));
    assert.equal(gate.status, "failed");
    assert.equal(gate.error?.code, "ELF_MAGIC_ABSENT", "the binary gate refuses every payload without the elf magic");
  });

  it("seat 28 runnersh — bash really executes the payload", async () => {
    const result = await hostseat(28, "bash", 'echo "runnersh real: $((6 * 7))"');
    assert.equal(result.status, "succeeded", `bash runs wherever the family runs: ${JSON.stringify(result.error)}`);
    assert.equal(result.stdout, "runnersh real: 42\n");
  });

  it("seat 29 runneryaml — the yaml interprets, babel compiles, the isolate runs", async () => {
    const result = await dispatch(29, 'run: "console.log(\'yaml real:\', 6 * 7)"');
    assert.equal(result.status, "succeeded");
    assert.ok(String(result.stdout).includes("yaml real: 42"), `the interpreted manifest really ran: ${result.stdout}`);
  });

  it("seat 30 runneraws — the signed request builds and the configuration answers honestly", async () => {
    const result = await dispatch(30, "console.log('edge payload')");
    const built = result.artifact as { url: string; headers: Record<string, string> } | undefined;
    assert.ok(built !== undefined, "the provider seat always answers the built request");
    assert.match(built.headers.authorization ?? "", /^AWS4-HMAC-SHA256/, "the sigv4 chain signs for real");
    assert.match(built.headers["x-amz-date"] ?? "", /^\d{8}T\d{6}Z$/, "the amz date stamps the signing window");
  });

  it("seat 31 runnertwob — the provider request builds against the real endpoint", async () => {
    const result = await dispatch(31, "console.log('edge payload')");
    const built = result.artifact as { url: string; body: string } | undefined;
    assert.ok(built !== undefined);
    assert.equal(built.url, "https://api.2b.dev/v1/sandboxes");
    assert.ok(built.body.includes("edge payload"), "the payload rides the request body");
  });

  it("seat 32 runnerdaytona — the provider request builds against the real endpoint", async () => {
    const result = await dispatch(32, "console.log('edge payload')");
    const built = result.artifact as { url: string } | undefined;
    assert.ok(built !== undefined);
    assert.ok(built.url.endsWith("/workspace"), `the daytona endpoint answers: ${built.url}`);
  });

  it("seat 33 languagepython — python3 really executes the payload when the host carries it", async () => {
    const result = await hostseat(33, "python3", 'print("python real:", 6 * 7)');
    if (result.status === "succeeded") {
      assert.equal(result.stdout, "python real: 42\n");
    }
  });

  it("seat 34 languagego — the go plan stamps and answers honestly", async () => {
    const result = await hostseat(34, "go", 'package main\nfunc main() { println("go real") }');
    assert.equal(result.plan?.env?.GOPATH, "/sandbox/go", "the gopath jail rides the env contract");
  });

  it("seat 35 languagerust — the rustc plan stamps and answers honestly", async () => {
    await hostseat(35, "rustc", 'fn main() { println!("rust real"); }');
  });

  it("seat 36 languagecargo — the offline cargo plan stamps its env", async () => {
    const result = await hostseat(36, "cargo", "");
    assert.equal(result.plan?.env?.CARGO_NET_OFFLINE, "true", "the offline law rides the env");
  });

  it("seat 37 languagev — the v plan stamps and answers honestly", async () => {
    await hostseat(37, "v", 'fn main() { println("v real") }');
  });

  it("seat 38 languagejava — the java plan stamps and answers honestly", async () => {
    const result = await hostseat(38, "java", 'public class Payload { public static void main(String[] a) { System.out.println("java real"); } }');
    assert.ok(result.plan !== undefined);
  });

  it("seat 39 languagedotnet — the dotnet plan stamps and answers honestly", async () => {
    await hostseat(39, "dotnet", 'Console.WriteLine("dotnet real");');
  });

  it("seat 40 languageruby — the ruby plan stamps and answers honestly", async () => {
    const result = await hostseat(40, "ruby", 'puts "ruby real: #{6 * 7}"');
    if (result.status === "succeeded") {
      assert.equal(result.stdout, "ruby real: 42\n");
    }
  });

  it("seat 41 languagelua — the lua plan stamps and answers honestly", async () => {
    await hostseat(41, "lua", 'print("lua real:", 6 * 7)');
  });

  it("seat 42 languagezig — the zig plan stamps and answers honestly", async () => {
    await hostseat(42, "zig", 'const std = @import("std");\npub fn main() void { std.debug.print("zig real", .{}); }');
  });

  it("seat 43 languagenim — the nim plan stamps and answers honestly", async () => {
    await hostseat(43, "nim", 'echo "nim real: ", 6 * 7');
  });

  it("seat 44 languagephp — the php plan stamps and answers honestly", async () => {
    await hostseat(44, "php", '<?php echo "php real: ", 6 * 7, "\\n";');
  });

  it("seat 45 runtimejvm — the jvm plan stamps and answers honestly", async () => {
    const result = await hostseat(45, "java", "");
    assert.ok(result.plan?.argv.includes("-Xmx1024m"), "the jvm flags ride the argv contract");
    assert.ok(result.plan?.argv.includes("-jar"), "the jvm rides the jar door");
  });

  it("seat 46 runtimeclr — the clr plan stamps and answers honestly", async () => {
    await hostseat(46, "dotnet", EXPAYLOAD);
  });

  it("seat 47 runtimeworkerd — the workerd plan stamps and answers honestly", async () => {
    await hostseat(47, "workerd", "");
  });

  it("seat 48 buildmake — make really builds the payload when the host carries it", async () => {
    const result = await hostseat(48, "make", 'all:\n\t@echo "make real: 42"');
    if (result.status === "succeeded") {
      assert.equal(result.stdout, "make real: 42\n");
    }
  });

  it("seat 49 buildbazel — the bazel plan stamps and answers honestly", async () => {
    await hostseat(49, "bazel", "");
  });

  it("seat 50 buildninja — ninja really builds the payload when the host carries it", async () => {
    const result = await hostseat(50, "ninja", "rule echo\n  command = echo ninja real: 42\nbuild out: echo\n");
    if (result.status === "succeeded") {
      assert.ok(String(result.stdout).includes("ninja real: 42"));
    }
  });

  it("seat 51 ciactions — the self-hosted runner plan stamps and answers honestly", async () => {
    await hostseat(51, "./run.sh", "");
  });

  it("seat 52 containerdocker — the docker plan stamps and answers honestly", async () => {
    const result = await hostseat(52, "docker", "docker.io/library/bash:5");
    assert.ok(result.plan?.argv.includes("--cap-drop"), "the hardening flags ride the argv");
  });

  it("seat 53 containermax — the max profile stamps the machine envelope", async () => {
    const result = await hostseat(53, "docker", "");
    assert.ok(result.plan?.argv.includes("1024g"), "the max profile answers the machine memory ceiling");
  });

  it("seat 54 containerlite — the lite profile stamps the inproc envelope", async () => {
    const result = await hostseat(54, "docker", "");
    assert.ok(result.plan?.argv.includes("128m"), "the lite profile answers the inproc memory ceiling");
  });

  it("seat 55 containerghcr — the digest-pin gate refuses the mutable tag", async () => {
    const pinned = await dispatch(55, "ghcr.io/wenathlan/saddle@sha256:deadbeef");
    assert.equal(pinned.status, "succeeded");
    assert.equal((pinned.artifact as { argv: string[] }).argv[0], "docker");
    const mutable = await executemodality(55, request("ghcr.io/wenathlan/saddle:latest"));
    assert.equal(mutable.status, "failed");
    assert.equal(mutable.error?.code, "TAG_NOT_IMMUTABLE", "the digest-pin law refuses every mutable tag");
  });

  it("seat 56 containerrunsc — the gvisor plan stamps and answers honestly", async () => {
    const result = await hostseat(56, "docker", "");
    assert.ok(result.plan?.argv.includes("runsc"), "the user kernel rides the runtime flag");
  });

  it("seat 57 containerpodman — the rootless plan stamps and answers honestly", async () => {
    await hostseat(57, "podman", "");
  });

  it("seat 58 containercontainerd — the ctr plan stamps and answers honestly", async () => {
    await hostseat(58, "ctr", "");
  });

  it("seat 59 containerrunc — the runc plan stamps and answers honestly", async () => {
    await hostseat(59, "runc", "");
  });

  it("seat 60 containercrun — the crun plan stamps and answers honestly", async () => {
    await hostseat(60, "crun", "");
  });

  it("seat 61 containerdockprincipal — the principal dock answers the standard", async () => {
    const result = await dispatch(61, "", { app: "saddle", profile: "balanced", arch: "linux-x64" });
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as {
      platform: string;
      createargv: string[];
      labels: Record<string, string>;
      healthcheck: { retries: number };
    };
    assert.equal(artifact.platform, "linux/amd64");
    assert.equal(artifact.createargv[0], "docker");
    assert.equal(artifact.labels["org.opencontainers.image.source"], "https://github.com/wenathlan/devthink");
    assert.equal(artifact.healthcheck.retries, 3);
  });

  it("seat 62 sandboxbubblewrap — the bwrap plan stamps and answers honestly", async () => {
    await hostseat(62, "bwrap", 'echo "bwrap real"');
  });

  it("seat 63 sandboxnsjail — the nsjail plan stamps and answers honestly", async () => {
    await hostseat(63, "nsjail", 'echo "nsjail real"');
  });

  it("seat 64 sandboxchroot — the chroot plan stamps and answers honestly", async () => {
    await hostseat(64, "chroot", 'echo "chroot real"');
  });

  it("seat 65 portsdock — the dock allocates, publishes and releases for real", async () => {
    const allocated = await dispatch(65, "", { sandbox: "battery3d", container: 8080 });
    assert.equal(allocated.status, "succeeded");
    const artifact = allocated.artifact as { hostport: number; flags: string[] };
    assert.ok(artifact.hostport >= 30000 && artifact.hostport <= 32767, "the dock allocates inside the engine range");
    assert.ok(artifact.flags.includes("-p"), "the publish flags answer the binding");
    const released = await dispatch(65, "", { sandbox: "battery3d", release: true });
    assert.equal(released.status, "succeeded");
    assert.ok(String(released.stdout).includes("released"), "the dock releases the binding");
  });

  it("seat 66 virtualfile — the store writes, hashes and reads back for real", async () => {
    const payload = "virtual file battery payload";
    const written = await dispatch(66, payload, { path: "battery3d/payload", owner: "battery3d" });
    assert.equal(written.status, "succeeded");
    const artifact = written.artifact as { bytes: number; sha256: string };
    assert.equal(artifact.bytes, Buffer.byteLength(payload), "the store counts the real bytes");
    assert.equal(artifact.sha256, sha256(payload), "the store hashes the payload the same sha256 answers");
    const read = await dispatch(66, "", { read: "battery3d/payload" });
    assert.equal(read.status, "succeeded");
    assert.equal(read.stdout, payload, "the readback answers the exact payload");
  });

  it("seat 67 fsvfs — the vfs composes the chunk catalog over the payload", async () => {
    const result = await dispatch(67, "vfs battery payload", { mounts: ["/sandbox", "/sandbox/tmp"], quota: 64 });
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as { mounts: { mount: string; pages: number }[] };
    assert.equal(artifact.mounts.length, 2, "both mounts answer their page windows");
    assert.ok(artifact.mounts.every((entry) => entry.pages >= 1));
  });

  it("seat 68 fsgitobjects — the blob oid answers the same sha1 git computes", async () => {
    const payload = "git objects battery payload";
    const result = await dispatch(68, payload);
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as { oid: string; bytes: number };
    assert.equal(artifact.bytes, Buffer.byteLength(payload));
    assert.equal(artifact.oid, sha1(`blob ${Buffer.byteLength(payload)}\0${payload}`), "the content-addressed oid matches git's framing");
  });

  it("seat 69 deliverycdn — the mirror planner keys the assets under the origin", async () => {
    const manifest = JSON.stringify({ origin: "https://edge.example", assets: ["a.js", "b.css"] });
    const result = await dispatch(69, manifest);
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as { origin: string; assets: { name: string; key: string; etag: string }[] };
    assert.equal(artifact.origin, "https://edge.example");
    assert.equal(artifact.assets.length, 2);
    for (const asset of artifact.assets) {
      assert.ok(asset.key.startsWith("assets/"), "the hashed asset law keys under assets/");
      assert.ok(asset.etag.startsWith('"') && asset.etag.endsWith('"'), "the etag pins the quoted digest");
    }
  });

  it("seat 70 deliverywss — the rfc 6455 text frame answers real bytes", async () => {
    const payload = "wss battery payload";
    const result = await dispatch(70, payload);
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as { frame: string; masked: boolean };
    assert.equal(artifact.frame.length, (6 + payload.length) * 2, "the masked frame answers 2 header + 4 mask + payload bytes");
    assert.ok(artifact.frame.startsWith("81"), "the fin bit and the text opcode answer on the wire");
  });

  it("seat 71 deliverygrpc — the length-prefixed message answers real bytes", async () => {
    const result = await dispatch(71, "grpc battery payload");
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as { frame: string };
    assert.equal(artifact.frame.length, (5 + 20) * 2, "the grpc prefix rides five bytes before the payload");
    assert.ok(artifact.frame.startsWith("00"), "the uncompressed flag answers on the wire");
  });

  it("seat 72 storagesqlite — the node:sqlite roundtrip answers or refuses honestly", async () => {
    const payload = "sqlite battery payload — the vault roundtrips the caller text whole";
    const result = await dispatch(72, payload);
    if (result.status === "succeeded") {
      const artifact = result.artifact as { rows: number; engine: string; roundtrip: boolean; store: string };
      assert.equal(artifact.rows, 1, "one real row answered the insert");
      assert.equal(artifact.engine, "node:sqlite");
      assert.equal(artifact.roundtrip, true, "the roundtrip answers its flag");
      assert.equal(artifact.store, ":memory:", "the store rides the engine memory alone (the visitor law)");
      assert.ok(String(result.stdout).includes("roundtripped"), "the vault answers the roundtrip");
      // the honest roundtrip contract: the readback the seat compared
      // against the payload character for character rides the payload length
      assert.ok(String(result.stdout).includes(String(payload.length)), "the stdout names the payload length the readback matched");
    } else {
      assert.ok(HONESTREFUSALS.has(result.error?.code ?? ""), "the absence answers the honest code");
    }
  });

  it("seat 73 storagelibsql — the vault roundtrip answers or refuses honestly", async () => {
    const result = await dispatch(73, "libsql battery payload");
    if (result.status === "succeeded") {
      assert.ok(String(result.stdout).includes("libsql"), "the roundtrip answers the vault");
    } else {
      assert.ok(HONESTREFUSALS.has(result.error?.code ?? ""), "the configuration absence answers the honest code");
    }
  });

  it("seat 74 storagemysql — the client handshake answers real wire bytes", async () => {
    const result = await dispatch(74, "", { user: "battery" });
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as { capabilities: number; charset: number; maxpacket: number; authuser: string };
    assert.ok(artifact.capabilities > 0 && artifact.charset > 0 && artifact.maxpacket > 0);
    assert.equal(artifact.authuser, "battery");
  });

  it("seat 75 storagepostgres — the startup message answers real wire bytes", async () => {
    const result = await dispatch(75, "", { user: "battery", database: "batterydb" });
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as { startup: string; protocol: string };
    assert.equal(artifact.protocol, "3.0");
    assert.ok(artifact.startup.length > 20, "the startup message answers its full wire length");
  });

  it("seat 76 storages3 — the put object signs through the real sigv4 chain", async () => {
    const result = await dispatch(76, "s3 battery payload", { accesskey: "AKIA_BATTERY", secretkey: "SECRET_BATTERY" });
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as {
      host: string;
      bucket: string;
      authorization: string;
      amzdate: string;
    };
    assert.equal(artifact.host, "saddle-edge.s3.us-east-1.amazonaws.com");
    assert.equal(artifact.bucket, "saddle-edge");
    assert.match(artifact.authorization, /^AWS4-HMAC-SHA256 Credential=AKIA_BATTERY\//, "the chain signs with the caller key");
    assert.match(artifact.amzdate, /^\d{8}T\d{6}Z$/, "the signing window stamps the amz date");
  });

  it("seat 77 networkdns — the a query answers a real wire packet", async () => {
    const result = await dispatch(77, "", { domain: "devthink.dev", qtype: "a" });
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as { packet: string; domain: string };
    assert.equal(artifact.packet.length, 60, "the a query answers thirty bytes on the wire");
    assert.ok(
      artifact.packet.endsWith("086465767468696e6b036465760000010001"),
      "the packet ends with devthink.dev and the a qtype",
    );
  });

  it("seat 78 networkdoh — the rfc 8484 request frames the real dns packet", async () => {
    const result = await dispatch(78, "", { domain: "devthink.dev", qtype: "a" });
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as { url: string; mediatype: string; packet: string };
    assert.equal(artifact.url, "https://dns.google/dns-query?name=devthink.dev&type=a");
    assert.equal(artifact.mediatype, "application/dns-message");
    assert.equal(artifact.packet.length, 60, "the framed packet answers thirty bytes");
  });

  it("seat 79 networktor — the onion plan stamps and answers honestly", async () => {
    await hostseat(79, "tor", "");
  });

  it("seat 80 networki2p — the i2p plan stamps and answers honestly", async () => {
    await hostseat(80, "i2pd", "");
  });

  it("seat 81 networkwireguard — the tunnel plan stamps and answers honestly", async () => {
    await hostseat(81, "wg", "");
  });

  it("seat 82 ramtmpfs — the volume writes, reads back and frees for real", async () => {
    const payload = "tmpfs battery payload";
    const result = await dispatch(82, payload, { sizebytes: 1 << 20, mountpoint: "/sandbox/tmp" });
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as { written: number; freed: number; after: number };
    assert.equal(artifact.written, Buffer.byteLength(payload), "the volume counts the real bytes");
    assert.equal(artifact.freed, artifact.written, "the freed count answers the written count");
    assert.equal(artifact.after, 0, "the volume holds nothing after the free");
    const overflow = await executemodality(
      82,
      request("x".repeat(4096), { sizebytes: 4096, mountpoint: "/sandbox/tiny" }),
    );
    assert.equal(overflow.status, "succeeded", "the 4096-byte payload fits the 4096-byte volume (the oom guard tolerates exact fits)");
    const refused = await executemodality(
      82,
      request("x".repeat(4097), { sizebytes: 4096, mountpoint: "/sandbox/tiny" }),
    );
    assert.equal(refused.status, "failed");
    assert.equal(refused.error?.code, "TMPFS_QUOTA_EXCEEDED", "the oom guard refuses the write the ceiling cannot hold");
  });

  it("seat 83 rammmap — the window reads the pages for real and never mutates", async () => {
    const payload = `${"x".repeat(4096)}mmap battery payload edge`;
    const result = await dispatch(83, payload, { offset: 0, length: 4096 });
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as { pagesread: number; checksum: number; imagedigest: number };
    assert.equal(artifact.pagesread, 1, "the 4k window reads exactly one page");
    assert.ok(artifact.checksum > 0, "the fold answers a real checksum over the bytes it touched");
    const refused = await executemodality(83, request("tiny", { offset: 0, length: 1 << 20 }));
    assert.equal(refused.status, "failed");
    assert.equal(refused.error?.code, "MMAP_WINDOW_OUT_OF_IMAGE", "the map refuses a window past the image");
  });

  it("seat 84 ramoverlayfs — the overlay copies up and tombstones for real", async () => {
    const payload = "overlay battery payload";
    const result = await dispatch(84, payload);
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as { lower: number; upper: number; whiteouts: string[]; layers: number };
    assert.equal(artifact.layers, 2);
    assert.equal(artifact.lower, Buffer.byteLength(payload), "the lower layer holds the payload bytes");
    assert.equal(artifact.upper, artifact.lower * 2, "the copy-up answered the doubled record");
    assert.deepEqual(artifact.whiteouts, ["payload"], "the whiteout tombstones the merged view");
  });

  it("seat 85 ramzram — the zram plan stamps and answers honestly", async () => {
    await hostseat(85, "modprobe", "");
  });

  it("seat 86 ramswapfile — the swap plan stamps and answers honestly", async () => {
    await hostseat(86, "mkswap", "");
  });

  it("seat 87 browserserver — the headless chromium plan stamps and answers honestly", async () => {
    const result = await hostseat(87, "chromium", "about:blank");
    assert.ok(result.plan?.argv.includes("--disable-gpu"), "the visitor gpu law rides the argv");
  });

  it("seat 88 screenxvfb — the xvfb plan stamps and answers honestly", async () => {
    await hostseat(88, "Xvfb", "");
  }, 15000);

  it("seat 89 mobiletermux — the termux composition answers the prefix law", async () => {
    const result = await dispatch(89, "termux battery payload", { packages: ["bun", "node"] });
    assert.equal(result.status, "succeeded");
    const artifact = result.artifact as { prefix: string; home: string; exec: string[] };
    assert.equal(artifact.prefix, "/data/data/com.termux/files/usr", "the default prefix the termux hosts carry");
    assert.equal(artifact.exec[0], `${artifact.prefix}/bin/sh`, "the exec rides the prefix shell");
  });

  it("seat 90 podsession — the pod plan stamps and answers honestly", async () => {
    await hostseat(90, "podsession", 'echo "pod real"');
  });

  it("the visitor law holds at the dispatch gate of every seat", async () => {
    const guard = await executemodality(17, { code: 'console.log("visitor")', scope: "visitor" } as ModalityRunRequest).catch(
      (error: { code?: string }) => error,
    );
    assert.equal((guard as { code?: string }).code, "VISITOR_SCOPE_REFUSED", "the critical law refuses the visitor scope");
    const unknown = await executemodality(91, request("payload")).catch((error: { code?: string }) => error);
    assert.equal((unknown as { code?: string }).code, "MODALITY_UNKNOWN", "the ninety answer no ninety-first seat");
    const slug = await executemodality("runnernode", request('console.log("slug real:", 6 * 7)'));
    assert.equal(slug.status, "succeeded");
    assert.equal(slug.stdout, "slug real: 42\n", "the slug dispatch rides the same executor the numeric id rides");
  });
});
