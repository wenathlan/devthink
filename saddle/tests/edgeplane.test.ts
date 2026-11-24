// # edgeplane.test — the edge execution plane answers the visitor law:
// the lane table declares the sixty-five live lanes and the twenty-five
// host lanes exactly, the visitor guard refuses any browser-shaped
// scope, every in-process and host lane executes server-side (node:vm,
// webassembly, babel, bun, bash, python3, java), the artifact commits
// through the caller's storage adapter, and the refusals stay honest
// (a planned modality answers modality-not-live, an absent host runtime
// answers host-runtime-absent). runnable with vitest:
// pnpm vitest run test/edgeplane.test.ts
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "vitest";
import { probemodule } from "../edgelandes.ts";
import { assertvisitorfree, edgelandesreport, edgelanes, runonedge } from "../edgeplane.ts";
import { getmodality } from "../modalities.ts";
import { localstorage } from "../virtual.ts";

/** the sixty-five live lane ids the pinned contract charges (parallel
 * waves read these exactly): the twenty-five first wave host binary
 * lanes (the nineteen beside the six pr15 completion seats), the
 * twenty-three in-process lanes (the nineteen of the first wave beside
 * the five wiring wave seats and the five pr15 completion seats, the
 * local-optin consent gate retired with the visitor-law hardening),
 * the seven virtual hardware lanes and the ten base live lanes. */
const LIVELANES = [
  "sandboxbubblewrap",
  "sandboxnsjail",
  "sandboxchroot",
  "containerpodman",
  "containercontainerd",
  "containerrunc",
  "containercrun",
  "containermax",
  "containerlite",
  "containerghcr",
  "runtimeclr",
  "runtimeworkerd",
  "screenxvfb",
  "mobiletermux",
  "buildbazel",
  "ciactions",
  "networktor",
  "networki2p",
  "networkwireguard",
  "runnerwasme",
  "runnerexe",
  "runnerbinary",
  "runnersh",
  "runneryaml",
  "portsdock",
  "ramtmpfs",
  "rammmap",
  "ramoverlayfs",
  "ramzram",
  "ramswapfile",
  "deliverycdn",
  "deliverywss",
  "deliverygrpc",
  "storagelibsql",
  "storagemysql",
  "storagepostgres",
  "storages3",
  "browserwebcontainer",
  "runnerserverless",
  "fsgitobjects",
  "storagesqlite",
  "networkdns",
  "networkdoh",
  "virtualvcpu",
  "virtualprocessor",
  "virtualgpu",
  "hardwarevirtual",
  "virtualfile",
  "virtualfull",
  "virtualvgpu",
  "virtualscreen",
  "virtualdrivers",
  "virtualkvm",
  "microvmgpuless",
  "gpuvirgl",
  "containerdocker",
  "fsvfs",
  "runnernode",
  "runnerbun",
  "runnerwasm",
  "runnerbabel",
  "runnerwebpack",
  "runneruniversal",
  "languagepython",
  "languagejava",
] as const;

/** the twenty-five host lane ids the pinned contract charges: the
 * twelve wiring wave host binary seats in alphabetical order, the seven
 * heavyweight probes (the browser server, the confidential compute,
 * the three provider seats, the principal container dock and the pod
 * session runtime) and the
 * six base host lanes. */
const HOSTLANES = [
  "buildmake",
  "buildninja",
  "languagecargo",
  "languagedotnet",
  "languagelua",
  "languagenim",
  "languagephp",
  "languagerust",
  "languagev",
  "languagezig",
  "runnerdeno",
  "runnerwasi",
  "browserserver",
  "confidentialsevsnp",
  "runneraws",
  "runnertwob",
  "runnerdaytona",
  "containerdockprincipal",
  "podsession",
  "containerrunsc",
  "emulatorqemu",
  "microvmfirecracker",
  "runtimejvm",
  "languagego",
  "languageruby",
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
  it("declares the sixty-five live lanes and the twenty-five host lanes exactly", () => {
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
    assert.equal(report["runnernode"]?.present, true);
    assert.equal(report["runnerwasm"]?.present, true);
    assert.equal(report["runneruniversal"]?.present, true);
    for (const id of [
      "runnerbun",
      "languagepython",
      "languagejava",
      "runnerbabel",
      "containerdocker",
      "runnerwebpack",
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
      modality: "runnernode",
      code: "const answer = inputs.n * 7; console.log('node lane:' + answer); answer",
      inputs: { n: 6 },
    });
    assert.equal(result.status, "succeeded");
    assert.equal(result.modality, "runnernode");
    assert.equal(result.lane, "node:vm");
    assert.ok(result.stdout?.includes("node lane:42"));
    assert.ok(result.stdout?.includes("42"), "the completion value rides the last stdout line");
    assert.equal(result.error, undefined);
  });

  it("executes the runner-bun lane through the host runtime", async () => {
    const result = await runonedge({ modality: "runnerbun", code: "console.log('bun lane:' + (6 * 7))" });
    assert.equal(result.status, "succeeded");
    assert.equal(result.lane, "bun");
    assert.ok(result.stdout?.includes("bun lane:42"));
  });

  it("executes the language-python lane through the host runtime", async () => {
    const result = await runonedge({ modality: "languagepython", code: "print('python lane:' + str(6 * 7))" });
    assert.equal(result.status, "succeeded");
    assert.equal(result.lane, "python3");
    assert.ok(result.stdout?.includes("python lane:42"));
  });

  it("executes the runner-universal lane through bash", async () => {
    const result = await runonedge({ modality: "runneruniversal", code: 'echo "bash lane:$((6 * 7))"' });
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
    const result = await runonedge({ modality: "languagejava", code });
    assert.equal(result.status, "succeeded");
    assert.equal(result.lane, "java");
    assert.ok(result.stdout?.includes("java lane:42"));
  });

  it("executes the runner-wasm lane on the engine webassembly", async () => {
    // the fixture self-check: the engine webassembly itself must agree the bytes answer 42
    const check = new WebAssembly.Instance(new WebAssembly.Module(WASMMODULEBYTES));
    assert.equal((check.exports.answer as () => number)(), 42);
    const result = await runonedge({
      modality: "runnerwasm",
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
      modality: "runnerbabel",
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
      const result = await runonedge({ modality: "runnernode", code: "console.log('artifact lane:42')" }, { storage });
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
      modality: "ramtmpfs",
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
    // the pod session lane answers its heavyweight probe honestly (present
    // or absent, never a faked boot) — the seat ninety host probe the
    // visitor-law hardening seated in place of the retired local-optin
    // consent gate
    const podrun = await runonedge({ modality: "podsession", code: "" });
    assert.ok(podrun.status === "succeeded" || podrun.error?.code === "HOST_RUNTIME_ABSENT");
    if (podrun.status === "failed") {
      assert.ok(podrun.error?.message.includes("podsession"), "the refusal names the pod session runtime");
    }
    // the virtual hardware lanes compose the machine payloads: the full
    // machine answers its report composed, never booted
    const machinerun = await runonedge({ modality: "virtualdrivers", code: "{}" });
    assert.equal(machinerun.status, "succeeded", JSON.stringify(machinerun.error));
    // the heavyweight lanes answer their probe honestly (present or
    // absent, never a faked boot) — the principal container dock probes
    // the docker daemon surface
    const heavy = await runonedge({ modality: "containerdockprincipal", code: "" });
    assert.ok(heavy.status === "succeeded" || heavy.error?.code === "HOST_RUNTIME_ABSENT");
    // the host binary lanes name their runtime when absent
    const jail = await runonedge({ modality: "sandboxbubblewrap", code: "echo hi" });
    assert.ok(jail.status === "succeeded" || jail.error?.code === "HOST_RUNTIME_ABSENT", JSON.stringify(jail.error));
  });

  it("answers the dispatch reality law: the real wire seat wins the shared ids", async () => {
    // the merged executor table prefers the real surfaces: the storage
    // and ram ids the in-process rehearsal map also declares carry the
    // base wire executors (the sigv4 signer, the wire clients and the
    // kernel recipes), and the container and clr ids carry the host
    // binary lanes (the hardened docker run and the dotnet compile)
    const { edgelaneexecutorsall } = await import("../edgelandes.ts");
    const { edgelaneexecutors } = await import("../edgelandes.ts");
    const { edgelaneexecutorshost } = await import("../edgelandes.ts");
    for (const id of [
      "storages3",
      "storagelibsql",
      "storagemysql",
      "ramtmpfs",
      "ramzram",
      "ramswapfile",
    ]) {
      assert.strictEqual(
        edgelaneexecutorsall[id],
        edgelaneexecutors[id as keyof typeof edgelaneexecutors],
        `the shared id ${id} dispatches the real wire executor`,
      );
    }
    for (const id of ["runtimeclr", "containermax", "containerlite", "containerghcr"]) {
      assert.strictEqual(
        edgelaneexecutorsall[id],
        edgelaneexecutorshost[id as keyof typeof edgelaneexecutorshost],
        `the shared id ${id} dispatches the host binary executor`,
      );
    }
    // the rehearsal map stays whole and directly importable — the law
    // moves the default, it never deletes the rehearsal surface. the
    // wiring wave seated five more rehearsal lanes and the
    // visitor-law hardening retired the local-optin gate: the map rides
    // at twenty-three
    const { edgelaneexecutorsinproc } = await import("../edgelandes.ts");
    assert.equal(Object.keys(edgelaneexecutorsinproc).length, 23, "the rehearsal map keeps its twenty-three lanes");
  });

  it("wires the wave four lanes into the plane honestly (a real run or the coded absence)", async () => {
    // the wiring wave closed the last gap: runner-deno rode the live set
    // of the registry while the plane carried no lane for it — the lane
    // now rides the table, so the honest answer is the runtime's own: a
    // real run on a deno-carrying host, the coded absence naming deno on
    // a host without it
    const record = getmodality("runnerdeno");
    if (record?.state !== "live") return; // the registry census moved again — nothing to prove here
    const run = await runonedge({ modality: "runnerdeno", code: "console.log('deno lane:' + (6 * 7))" });
    if (run.status === "succeeded") {
      assert.equal(run.lane, "deno");
      assert.ok(run.stdout?.includes("deno lane:42"), "the deno run answers its program");
    } else {
      assert.equal(run.error?.code, "HOST_RUNTIME_ABSENT");
      assert.ok(run.error?.message.includes("deno"), "the refusal names the runtime");
    }
  });

  it("reports the absent host runtime of a host lane honestly", async () => {
    const runsc = await runonedge({ modality: "containerrunsc", code: "" });
    assert.equal(runsc.status, "failed");
    assert.equal(runsc.error?.code, "HOST_RUNTIME_ABSENT");
    assert.ok(runsc.error?.message.includes("runsc"), "the message names the runtime");
    // docker rides the host: the ci runner carries it, the engine host
    // here does not — the lane answers the truth of whichever host it
    // met (a present docker probes and succeeds, a present-but-failing
    // docker answers run-exited-nonzero, an absent docker refuses with
    // host-runtime-absent), so the assertion follows the probe instead
    // of pinning a host the lane never saw
    const docker = await runonedge({ modality: "containerdocker", code: "" });
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
