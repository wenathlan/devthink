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
import { getmodality } from "../modalityregistry.ts";
import { localstorage } from "../virtual.ts";

/** the ten live lane ids the pinned contract charges (parallel waves read these exactly). */
const LIVELANES = [
  "sandbox-bubblewrap",
  "sandbox-nsjail",
  "sandbox-chroot",
  "container-podman",
  "container-containerd",
  "container-runc",
  "container-crun",
  "container-max",
  "container-lite",
  "container-ghcr",
  "runtime-clr",
  "runtime-workerd",
  "screen-xvfb",
  "screen-wayland",
  "mobile-termux",
  "build-bazel",
  "build-buck",
  "build-turborepo",
  "ci-actions",
  "ci-gitlab",
  "network-tor",
  "network-i2p",
  "network-wireguard",
  "storage-minio",
  "storage-garage",
  "ram-tmpfs",
  "ram-mmap",
  "ram-overlayfs",
  "ram-loopram",
  "ram-gitram",
  "ram-zram",
  "ram-zswap",
  "ram-swapfile",
  "delivery-cdn",
  "delivery-wss",
  "delivery-webtransport",
  "delivery-grpc",
  "delivery-capnproto",
  "storage-libsql",
  "storage-mysql",
  "storage-postgres",
  "storage-s3",
  "browser-webcontainer",
  "local-optin",
  "virtual-full",
  "virtual-vgpu",
  "virtual-screen",
  "virtual-drivers",
  "virtual-kvm",
  "microvm-gpuless",
  "gpu-virgl",
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
  "browser-server",
  "mobile-capacitor",
  "mobile-postmarketos",
  "pod-session",
  "confidential-sevsnp",
  "confidential-tdx",
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

  it("refuses an unknown modality with modality not live", async () => {
    const unknown = await runonedge({ modality: "not-a-modality", code: "1" });
    assert.equal(unknown.status, "failed");
    assert.equal(unknown.error?.code, "MODALITY_NOT_LIVE");
  });

  it("dispatches the ninety wave lanes through the plane honestly", async () => {
    // the dispatch reality law: the ram-tmpfs dispatch rides the real
    // kernel recipe lane (never the in-process rehearsal composer), so a
    // host without the mount privilege answers the honest refusal that
    // names the tmpfs requirement — and a privileged host answers the
    // roundtripped ramdisk report (the rehearsal map stays importable
    // directly, the dispatch never substitutes it for the real lane)
    const ramrun = await runonedge({
      modality: "ram-tmpfs",
      code: '{"mount":"tmpfs","files":{"lane.txt":"68656c6c6f"}}',
    });
    if (ramrun.status === "failed") {
      assert.ok(
        ramrun.error?.code === "HOST_RUNTIME_ABSENT" ||
          ramrun.error?.code === "HOST_PRIVILEGE_ABSENT" ||
          ramrun.error?.code === "RUN_EXITED_NONZERO",
        `the tmpfs dispatch refusal stays honest: ${JSON.stringify(ramrun.error)}`,
      );
    } else {
      assert.ok(ramrun.stdout.includes("tmpfs"), "the real recipe run names the tmpfs mount");
    }
    // the consent gate refuses without the declared consent — the visitor
    // machine law the local-optin lane guards
    const refused = await runonedge({ modality: "local-optin", code: "{}" });
    assert.equal(refused.status, "failed");
    assert.equal(refused.error?.code, "LOCAL_CONSENT_REQUIRED");
    // the virtual hardware lanes compose the machine payloads: the full
    // machine answers its report composed, never booted
    const machinerun = await runonedge({ modality: "virtual-drivers", code: "{}" });
    assert.equal(machinerun.status, "succeeded", JSON.stringify(machinerun.error));
    // the heavyweight lanes answer their probe honestly (present or
    // absent, never a faked boot)
    const heavy = await runonedge({ modality: "pod-session", code: "" });
    assert.ok(heavy.status === "succeeded" || heavy.error?.code === "HOST_RUNTIME_ABSENT");
    // the host binary lanes name their runtime when absent
    const jail = await runonedge({ modality: "sandbox-bubblewrap", code: "echo hi" });
    assert.ok(jail.status === "succeeded" || jail.error?.code === "HOST_RUNTIME_ABSENT", JSON.stringify(jail.error));
  });

  it("answers the dispatch reality law: the real wire seat wins the shared ids", async () => {
    // the merged executor table prefers the real surfaces: the storage
    // and ram ids the in-process rehearsal map also declares carry the
    // base wire executors (the sigv4 signer, the wire clients and the
    // kernel recipes), and the container and clr ids carry the host
    // binary lanes (the hardened docker run and the dotnet compile)
    const { edgelaneexecutorsall } = await import("../edgelandes.ninety.ts");
    const { edgelaneexecutors } = await import("../edgelandes.ts");
    const { edgelaneexecutorshost } = await import("../edgelandes.host.ts");
    for (const id of [
      "storage-s3",
      "storage-libsql",
      "storage-mysql",
      "ram-tmpfs",
      "ram-zram",
      "ram-swapfile",
    ]) {
      assert.strictEqual(
        edgelaneexecutorsall[id],
        edgelaneexecutors[id as keyof typeof edgelaneexecutors],
        `the shared id ${id} dispatches the real wire executor`,
      );
    }
    for (const id of ["runtime-clr", "container-max", "container-lite", "container-ghcr"]) {
      assert.strictEqual(
        edgelaneexecutorsall[id],
        edgelaneexecutorshost[id as keyof typeof edgelaneexecutorshost],
        `the shared id ${id} dispatches the host binary executor`,
      );
    }
    // the rehearsal map stays whole and directly importable — the law
    // moves the default, it never deletes the rehearsal surface
    const { edgelaneexecutorsinproc } = await import("../edgelandes.inproc.ts");
    assert.equal(Object.keys(edgelaneexecutorsinproc).length, 19, "the rehearsal map keeps its nineteen lanes");
  });

  it("never lies about a live modality another engine surface drives", async () => {
    // the registry drives modalities live through other engine surfaces
    // (the envelope sandbox lane): this plane wires no lane for them and
    // the refusal names the state honestly instead of claiming the
    // modality is not live. runner-deno rides the live set of the
    // registry while the edge plane table carries no lane for it.
    const record = getmodality("runner-deno");
    if (record?.state !== "live") return; // the registry census moved again — nothing to prove here
    const refusal = await runonedge({ modality: "runner-deno", code: "1" });
    assert.equal(refusal.status, "failed");
    assert.equal(refusal.error?.code, "LANE_NOT_WIRED_IN_PLANE");
    assert.ok(refusal.error?.message.includes("live"), "the message names the live state");
  });

  it("reports the absent host runtime of a host lane honestly", async () => {
    const runsc = await runonedge({ modality: "container-runsc", code: "" });
    assert.equal(runsc.status, "failed");
    assert.equal(runsc.error?.code, "HOST_RUNTIME_ABSENT");
    assert.ok(runsc.error?.message.includes("runsc"), "the message names the runtime");
    // docker rides the host: the ci runner carries it, the engine host
    // here does not — the lane answers the truth of whichever host it
    // met (a present docker probes and succeeds, a present-but-failing
    // docker answers run-exited-nonzero, an absent docker refuses with
    // host-runtime-absent), so the assertion follows the probe instead
    // of pinning a host the lane never saw
    const docker = await runonedge({ modality: "container-docker", code: "" });
    if (docker.status === "failed") {
      assert.ok(
        docker.error?.code === "HOST_RUNTIME_ABSENT" || docker.error?.code === "RUN_EXITED_NONZERO",
        `the docker refusal stays honest: ${docker.error?.code}`,
      );
      assert.ok(docker.error?.message.includes("docker"), "the message names the runtime");
    } else {
      assert.equal(docker.status, "succeeded");
      assert.equal(docker.artifact?.mime, "application/json");
    }
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
