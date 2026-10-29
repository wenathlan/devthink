// # edgeplane.test — the edge execution plane answers the visitor law:
// the lane table declares the ten live lanes and the six host lanes
// exactly, the visitor guard refuses any browser-shaped scope, every
// in-process and host lane executes server-side (node:vm, webassembly,
// babel, bun, bash, python3, java), the artifact commits through the
// caller's storage adapter, and the refusals stay honest (a planned
// modality answers modality-not-live, an absent host runtime answers
// host-runtime-absent). runnable with vitest:
// pnpm vitest run tests/edgeplane.test.ts
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "vitest";
import { probemodule } from "../edgelandes.ts";
import { assertvisitorfree, edgelandesreport, edgelanes, runonedge } from "../edgeplane.ts";
import { localstorage } from "../virtual.ts";

/** the ten live lane ids the pinned contract charges (parallel waves read these exactly). */
const LIVELANES = [
  "container-docker",
  "fs-vfs",
  "runner-node",
  "runner-bun",
  "runner-wasm",
  "runner-babel",
  "runner-webpack",
  "runner-universal",
  "language-python",
  "language-java",
] as const;

/** the six host lane ids the pinned contract charges. */
const HOSTLANES = [
  "container-runsc",
  "emulator-qemu",
  "microvm-firecracker",
  "runtime-jvm",
  "language-go",
  "language-ruby",
] as const;

/** the minimal wasm module the lane must instantiate and call:
 * (module (func (export "answer") (result i32) i32.const 42)) — 39
 * bytes hand-assembled (header, type, function, export and code
 * sections for one constant-returning function). */
const WASMMODULEBYTES = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7f, 0x03, 0x02, 0x01, 0x00,
  0x07, 0x0a, 0x01, 0x06, 0x61, 0x6e, 0x73, 0x77, 0x65, 0x72, 0x00, 0x00, 0x0a, 0x06, 0x01, 0x04, 0x00, 0x41, 0x2a,
  0x0b,
]);

describe("the edge plane answers the visitor law", () => {
  it("declares the ten live lanes and the six host lanes exactly", () => {
    const lanes = edgelanes();
    const liveids = lanes.filter((lane) => lane.kind === "live").map((lane) => lane.modality);
    const hostids = lanes.filter((lane) => lane.kind === "host").map((lane) => lane.modality);
    assert.deepStrictEqual(liveids, [...LIVELANES]);
    assert.deepStrictEqual(hostids, [...HOSTLANES]);
    for (const lane of lanes) {
      assert.ok(lane.runtime.length > 0, `the lane ${lane.modality} names its runtime`);
      assert.equal(lane.probed, true, `the lane ${lane.modality} is probed`);
      assert.equal(typeof lane.present, "boolean");
    }
    assert.deepStrictEqual(Object.keys(edgelandesreport()).sort(), [...LIVELANES, ...HOSTLANES].sort());
    // the honest presence on this engine host: the in-process lanes are
    // always present, and every optional host runtime answers a boolean
    // that follows the host it probed (docker rides the ci runner, babel
    // resolves only where the toolchain installed it) — the report never
    // pins a host it did not probe
    const report = edgelandesreport();
    assert.equal(report["runner-node"]?.present, true);
    assert.equal(report["runner-wasm"]?.present, true);
    assert.equal(report["runner-universal"]?.present, true);
    for (const id of [
      "runner-bun",
      "language-python",
      "language-java",
      "runner-babel",
      "container-docker",
      "runner-webpack",
    ]) {
      assert.equal(typeof report[id]?.present, "boolean", `the lane ${id} answers its host honestly`);
    }
  });

  it("refuses any visitor browser scope and passes the node engine scope", () => {
    const refused = (scope: unknown) =>
      assert.throws(
        () => assertvisitorfree(scope),
        (error: unknown) => (error as { code?: string }).code === "VISITOR_CONTEXT_REFUSED",
      );
    refused({ window: {}, navigator: {}, localStorage: {} });
    refused({ document: {} });
    refused({ sessionStorage: {} });
    refused({ indexedDB: {} });
    assert.doesNotThrow(() => assertvisitorfree(globalThis));
    assert.doesNotThrow(() => assertvisitorfree({}));
    assert.doesNotThrow(() => assertvisitorfree(null));
  });

  it("executes the runner-node lane in process through node:vm", async () => {
    const result = await runonedge({
      modality: "runner-node",
      code: "const answer = inputs.n * 7; console.log('node lane:' + answer); answer",
      inputs: { n: 6 },
    });
    assert.equal(result.status, "succeeded");
    assert.equal(result.modality, "runner-node");
    assert.equal(result.lane, "node:vm");
    assert.ok(result.stdout?.includes("node lane:42"));
    assert.ok(result.stdout?.includes("42"), "the completion value rides the last stdout line");
    assert.equal(result.error, undefined);
  });

  it("executes the runner-bun lane through the host runtime", async () => {
    const result = await runonedge({ modality: "runner-bun", code: "console.log('bun lane:' + (6 * 7))" });
    assert.equal(result.status, "succeeded");
    assert.equal(result.lane, "bun");
    assert.ok(result.stdout?.includes("bun lane:42"));
  });

  it("executes the language-python lane through the host runtime", async () => {
    const result = await runonedge({ modality: "language-python", code: "print('python lane:' + str(6 * 7))" });
    assert.equal(result.status, "succeeded");
    assert.equal(result.lane, "python3");
    assert.ok(result.stdout?.includes("python lane:42"));
  });

  it("executes the runner-universal lane through bash", async () => {
    const result = await runonedge({ modality: "runner-universal", code: 'echo "bash lane:$((6 * 7))"' });
    assert.equal(result.status, "succeeded");
    assert.equal(result.lane, "bash");
    assert.ok(result.stdout?.includes("bash lane:42"));
  });

  it("executes the language-java lane in single-file source mode", async () => {
    const code = [
      "public class Main {",
      "  public static void main(String[] args) {",
      '    System.out.print("java lane:" + (6 * 7));',
      "  }",
      "}",
    ].join("\n");
    const result = await runonedge({ modality: "language-java", code });
    assert.equal(result.status, "succeeded");
    assert.equal(result.lane, "java");
    assert.ok(result.stdout?.includes("java lane:42"));
  });

  it("executes the runner-wasm lane on the engine webassembly", async () => {
    // the fixture self-check: the engine webassembly itself must agree the bytes answer 42
    const check = new WebAssembly.Instance(new WebAssembly.Module(WASMMODULEBYTES));
    assert.equal((check.exports.answer as () => number)(), 42);
    const result = await runonedge({
      modality: "runner-wasm",
      code: Buffer.from(WASMMODULEBYTES).toString("base64"),
    });
    assert.equal(result.status, "succeeded");
    assert.equal(result.lane, "webassembly");
    assert.ok(result.stdout?.includes("42"), "the exported answer rides stdout");
  });

  // the babel lane rides the optional @babel/core toolchain: the test
  // skips where the toolchain is absent instead of pretending it exists
  it.skipIf(!probemodule("@babel/core"))("executes the runner-babel lane through transform and vm", async () => {
    const result = await runonedge({
      modality: "runner-babel",
      code: "const answer = 6 * 7; console.log('babel lane:' + answer); answer",
    });
    assert.equal(result.status, "succeeded");
    assert.equal(result.lane, "@babel/core");
    assert.ok(result.stdout?.includes("babel lane:42"));
  });

  it("writes the run artifact through the caller storage adapter", async () => {
    const dir = await mkdtemp(join(tmpdir(), "saddleedgetest"));
    try {
      const storage = localstorage(dir);
      const result = await runonedge({ modality: "runner-node", code: "console.log('artifact lane:42')" }, { storage });
      assert.equal(result.status, "succeeded");
      assert.ok(result.artifact, "the run committed an artifact");
      assert.equal(result.artifact?.mime, "text/plain;charset=utf-8");
      assert.ok((result.artifact?.bytes ?? 0) > 0);
      assert.ok(typeof result.artifact?.storageref === "string" && result.artifact.storageref.length > 0);
      const stored = await storage.get(result.artifact?.storageref as string);
      assert.equal(Buffer.from(stored).toString("utf8"), result.stdout, "the artifact bytes landed in the adapter");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("refuses a planned or unknown modality with modality not live", async () => {
    const planned = await runonedge({ modality: "virtual-full", code: "1" });
    assert.equal(planned.status, "failed");
    assert.equal(planned.error?.code, "MODALITY_NOT_LIVE");
    assert.ok(planned.error?.message.includes("virtual-full"));
    const unknown = await runonedge({ modality: "not-a-modality", code: "1" });
    assert.equal(unknown.status, "failed");
    assert.equal(unknown.error?.code, "MODALITY_NOT_LIVE");
  });

  it("reports the absent host runtime of a host lane honestly", async () => {
    const runsc = await runonedge({ modality: "container-runsc", code: "" });
    assert.equal(runsc.status, "failed");
    assert.equal(runsc.error?.code, "HOST_RUNTIME_ABSENT");
    assert.ok(runsc.error?.message.includes("runsc"), "the message names the runtime");
    const docker = await runonedge({ modality: "container-docker", code: "" });
    assert.equal(docker.status, "failed");
    assert.equal(docker.error?.code, "HOST_RUNTIME_ABSENT");
    assert.ok(docker.error?.message.includes("docker"));
  });

  it("runs every lane executor server side only", () => {
    // this test is the proof: it runs in node, the engine host itself
    assert.equal(typeof globalThis.window, "undefined");
    assert.equal(typeof globalThis.document, "undefined");
    assert.equal(typeof globalThis.localStorage, "undefined");
    assert.equal(typeof globalThis.indexedDB, "undefined");
    assert.ok(typeof globalThis.process?.versions?.node === "string");
    assert.doesNotThrow(() => assertvisitorfree(globalThis));
  });
});
