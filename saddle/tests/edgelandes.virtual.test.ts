// # edgelandes.virtual.test — the virtual hardware composition lanes
// answer the composition law: the seven lane ids, the executor keys and
// the spec ids stay in exact agreement (unique and frozen), every lane
// composes the engine's own payloads deterministically (the same manifest
// answers the same bytes twice), the machine manifest law answers its
// typed errors (invalid-machine-manifest, catalog-entry-absent,
// kvm-composition-failed) and every artifact mime equals its registry
// record's mime. runnable with vitest:
// npx vitest run tests/edgelandes.virtual.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { edgelaneexecutorsvirtual, virtuallaneids, virtuallanespecs } from "../edgelandesvirtual.ts";
import { getmodality } from "../modalityregistry.ts";
import { kvmcapnames } from "../virtualization.ts";

/** the manifest fixture the full-machine runs ride: a reviewed model, the
 * first gpu, 32 gb and the boot sequence on. */
const FULLMANIFEST = JSON.stringify({ model: "AMD EPYC 9965", gpu: "rtx5090", ramgb: 32, boot: true });

/** the deadline every lane run rides (the compositions are fast, the
 * budget stays generous — the deadline law is honored after composing). */
const DEADLINEMS = 5000;

/** one lane run output as the tests read it. */
interface lanerun {
  stdout: string;
  artifact?: { mime: string; bytes: Uint8Array };
}

/** runs one virtual lane under test and answers its output. */
async function runlane(id: string, code: string, inputs?: unknown): Promise<lanerun> {
  const executor = edgelaneexecutorsvirtual[id];
  assert.ok(executor !== undefined, `the lane ${id} is wired`);
  return executor(code, inputs ?? {}, DEADLINEMS);
}

/** parses one run's artifact as json (the artifact law: the bytes carry
 * the machine manifest). */
function readartifact(run: lanerun): Record<string, unknown> {
  assert.ok(run.artifact !== undefined, "the run committed an artifact");
  return JSON.parse(Buffer.from(run.artifact?.bytes ?? new Uint8Array()).toString("utf8")) as Record<string, unknown>;
}

/** the assert.rejects predicate for one lane error code. */
const codeis =
  (expected: string) =>
  (error: unknown): boolean => {
    assert.equal((error as { code?: string }).code, expected);
    assert.equal((error as Error).name, "edgelaneerror");
    return true;
  };

describe("the virtual hardware composition lanes answer the composition law", () => {
  it("declares the seven lane ids, executor keys and spec ids in exact agreement", () => {
    const specids = virtuallanespecs.map((spec) => spec.modality);
    assert.deepStrictEqual(virtuallaneids, specids);
    assert.deepStrictEqual(Object.keys(edgelaneexecutorsvirtual), specids);
    assert.equal(virtuallaneids.length, 7);
    assert.equal(new Set(virtuallaneids).size, virtuallaneids.length, "the ids are unique");
    assert.ok(Object.isFrozen(virtuallaneids), "the ids are frozen");
    assert.ok(Object.isFrozen(virtuallanespecs), "the specs are frozen");
    assert.ok(Object.isFrozen(edgelaneexecutorsvirtual), "the executor table is frozen");
    for (const spec of virtuallanespecs) {
      assert.equal(spec.kind, "live", `the lane ${spec.modality} is live`);
      assert.ok(spec.runtime.length > 0, `the lane ${spec.modality} names its runtime`);
      assert.equal(spec.present(), true, `the lane ${spec.modality} probes its composed surface`);
      assert.ok(getmodality(spec.modality) !== undefined, `the registry carries ${spec.modality}`);
    }
  });

  it("composes the virtual-full machine report from the engine payloads", async () => {
    const run = await runlane("virtual-full", FULLMANIFEST);
    assert.ok(run.stdout.includes("AMD EPYC 9965"), "the model string rides the report");
    assert.ok(run.stdout.includes("192 cores / 384 threads"), "the cores and threads ride the report");
    assert.ok(run.stdout.includes("NVIDIA-SMI"), "the smi summary line rides the report");
    assert.ok(run.stdout.includes("MemTotal"), "the memory report rides the report");
    assert.ok(run.stdout.includes("free -h"), "the engine free table rides the report");
    assert.ok(run.stdout.includes("Linux version 6.12.0-saddle"), "the boot sequence rides the report");
    const artifact = readartifact(run);
    assert.equal(artifact.manifest?.model, "AMD EPYC 9965");
    assert.equal(artifact.manifest?.gpu, "rtx5090");
    assert.equal(artifact.manifest?.ramgb, 32);
    assert.equal(artifact.manifest?.boot, true);
    assert.equal(artifact.manifest?.vcpus, 8);
    assert.equal(artifact.machine?.cores, 192);
    assert.ok(Array.isArray(artifact.boot) && artifact.boot.length > 0, "the artifact carries the full boot sequence");
    const quiet = await runlane(
      "virtual-full",
      JSON.stringify({ model: "AMD EPYC 9965", gpu: "rtx5090", ramgb: 32, boot: false }),
    );
    assert.ok(quiet.stdout.includes("the manifest asks for no boot sequence"), "boot false answers no dmesg");
    assert.ok(!quiet.stdout.includes("Linux version"), "no boot sequence rides a quiet manifest");
  });

  it("composes the virtual-vgpu slice report from the mig catalog", async () => {
    const run = await runlane(
      "virtual-vgpu",
      JSON.stringify({ gpu: "rtxpro6000", mig: "1g.24gb", ramgb: 64, vcpus: 16 }),
    );
    for (const profileid of ["1g.24gb", "2g.48gb", "4g.96gb"]) {
      assert.ok(run.stdout.includes(profileid), `the slice table carries ${profileid}`);
    }
    assert.ok(run.stdout.includes("24 gb"), "the slice sizes ride the table");
    assert.ok(run.stdout.includes("max 4 instances"), "the instance bounds ride the table");
    assert.ok(run.stdout.includes("NVIDIA-SMI"), "the smi summary line is present");
    assert.ok(run.stdout.includes("MIG: enabled, profile 1g.24gb"), "the sliced device rides the smi surface");
    assert.ok(run.stdout.includes("FAKE_MODEL=NVIDIA RTX PRO 6000 Blackwell"), "the nvml shim answers the model");
    assert.ok(run.stdout.includes("FAKE_VRAM=24576"), "the nvml shim answers the slice vram");
    const defaulted = await runlane("virtual-vgpu", "{}");
    assert.ok(defaulted.stdout.includes("NVIDIA RTX PRO 6000 Blackwell"), "the default device is the mig-capable one");
    await assert.rejects(
      () => runlane("virtual-vgpu", JSON.stringify({ gpu: "rtx5090" })),
      codeis("CATALOG_ENTRY_ABSENT"),
    );
  });

  it("composes the virtual-screen display tree with the deterministic otp gate", async () => {
    const manifest = JSON.stringify({ model: "AMD EPYC 9965", gpu: "rtx5090", ramgb: 32 });
    const otpof = (stdout: string): string => /otp: ([0-9a-f]+)/.exec(stdout)?.[1] ?? "";
    const first = await runlane("virtual-screen", manifest);
    assert.ok(first.stdout.includes("1280x800"), "the display tree answers the geometry");
    assert.ok(first.stdout.includes("vnc://saddle-display:5900"), "the display tree answers the vnc law");
    const otp = otpof(first.stdout);
    assert.ok(otp.length >= 8, "the otp is at least 8 characters");
    const second = await runlane("virtual-screen", manifest);
    assert.equal(otpof(second.stdout), otp, "the same manifest answers the same otp");
    const other = await runlane(
      "virtual-screen",
      JSON.stringify({ model: "AMD EPYC 9965", gpu: "rtx5090", ramgb: 64 }),
    );
    assert.notEqual(otpof(other.stdout), otp, "a different manifest answers a different otp");
  });

  it("composes the virtual-drivers table under the driver-quota gate", async () => {
    const countdevices = (stdout: string): number => (stdout.match(/FAKE_MODEL=/g) ?? []).length;
    const defaulted = await runlane("virtual-drivers", "{}");
    assert.ok(defaulted.stdout.includes("virtualcpu"), "the cpu driver row rides the table");
    assert.ok(defaulted.stdout.includes("virtualgpu"), "the gpu driver row rides the table");
    assert.ok(defaulted.stdout.includes("virtualmemory"), "the memory driver row rides the table");
    assert.ok(defaulted.stdout.includes("6.12.0-saddle"), "the kernel banner rides the cpu row");
    assert.ok(defaulted.stdout.includes("575.57.08"), "the nvml driver rides the gpu row");
    assert.ok(defaulted.stdout.includes("2.0.127"), "the engine version rides the memory row");
    assert.equal(countdevices(defaulted.stdout), 4, "the quota defaults to 4 devices");
    const two = await runlane("virtual-drivers", "{}", { quota: 2 });
    assert.equal(countdevices(two.stdout), 2, "the quota law bounds the devices");
    const bounded = await runlane("virtual-drivers", "{}", { quota: 99 });
    assert.equal(countdevices(bounded.stdout), 16, "the quota clamps at 16");
  });

  it("composes the virtual-kvm plan with the qemu argv and the caps", async () => {
    const run = await runlane(
      "virtual-kvm",
      JSON.stringify({ model: "AMD EPYC 9965", gpu: "rtx5090", ramgb: 32, vcpus: 8 }),
    );
    assert.ok(run.stdout.includes("/usr/bin/qemu-system-x86_64"), "the argv starts with the qemu binary name");
    assert.ok(run.stdout.includes("-enable-kvm"), "the argv carries the kvm accel");
    assert.ok(kvmcapnames.length > 0, "the engine carries kvm capability names");
    assert.ok(run.stdout.includes(`kvm caps: ${kvmcapnames.length} (`), "the caps count rides the report");
    assert.ok(run.stdout.includes("clean-rootfs"), "the clean-rootfs law rides the report");
    assert.ok(run.stdout.includes("never this one"), "the report answers a plan, never a booted machine");
    await assert.rejects(
      () => runlane("virtual-kvm", JSON.stringify({ model: "Intel Core Ultra 9 285K", ramgb: 512 })),
      codeis("KVM_COMPOSITION_FAILED"),
    );
  });

  it("composes the microvm-gpuless software-render machine", async () => {
    const run = await runlane("microvm-gpuless", JSON.stringify({ model: "AMD EPYC 9965", ramgb: 32, vcpus: 8 }));
    assert.ok(run.stdout.includes("OpenGL core profile version string: 4.6"), "llvmpipe answers opengl 4.6");
    assert.ok(run.stdout.includes("API Version: 1.4.313"), "lavapipe answers vulkan 1.4");
    assert.ok(run.stdout.includes("OpenCL 3.1"), "rusticl answers opencl 3.1");
    assert.ok(run.stdout.includes("llvmpipe (CPU)"), "the llvmpipe device rides the clinfo surface");
    assert.ok(run.stdout.includes("GALLIUM_DRIVER=llvmpipe"), "the mesa env rides the report");
    assert.ok(run.stdout.includes("RUSTICL_ENABLE=llvmpipe"), "the rusticl env rides the report");
    assert.ok(run.stdout.includes("LP_NUM_THREADS=8"), "the thread law follows the vcpus");
    assert.ok(run.stdout.includes("1280x800"), "the virtual display rides the report");
  });

  it("composes the gpu-virgl slice under the context-quota law", async () => {
    const defaulted = await runlane("gpu-virgl", "{}");
    assert.ok(defaulted.stdout.includes("context quota: 8"), "the context quota defaults to 8");
    assert.ok(defaulted.stdout.includes("ctx 0-7"), "the default contexts render their range");
    const three = await runlane("gpu-virgl", "{}", { contexts: 3 });
    assert.ok(three.stdout.includes("context quota: 3"), "the quota honors inputs.contexts");
    assert.ok(three.stdout.includes("ctx 0-2"), "the overriden contexts render their range");
    assert.equal(three.artifact?.mime, "application/vnd.devthink.gpu+json");
    assert.ok(three.stdout.includes("virgl"), "the virgl bridge rides the capability report");
  });

  it("composes identical bytes for identical manifests on every lane", async () => {
    const fixtures: Record<string, { code: string; inputs?: unknown }> = {
      "virtual-full": { code: FULLMANIFEST },
      "virtual-vgpu": { code: JSON.stringify({ gpu: "b200", mig: "2g.48gb", ramgb: 96 }) },
      "virtual-screen": { code: JSON.stringify({ model: "AMD EPYC 9965", gpu: "h100", ramgb: 64 }) },
      "virtual-drivers": { code: "{}", inputs: { quota: 3 } },
      "virtual-kvm": { code: JSON.stringify({ model: "AMD EPYC 9955", ramgb: 128, vcpus: 16 }) },
      "microvm-gpuless": { code: JSON.stringify({ model: "Apple M3 Ultra", ramgb: 16, vcpus: 4 }) },
      "gpu-virgl": { code: JSON.stringify({ gpu: "rx9070xt" }), inputs: { contexts: 5 } },
    };
    for (const id of virtuallaneids) {
      const fixture = fixtures[id];
      assert.ok(fixture !== undefined, `the fixture for ${id} is pinned`);
      const first = await runlane(id, fixture.code, fixture.inputs);
      const second = await runlane(id, fixture.code, fixture.inputs);
      assert.equal(second.stdout, first.stdout, `${id} composes identical stdout bytes`);
      assert.ok(first.artifact !== undefined && second.artifact !== undefined);
      assert.equal(
        Buffer.compare(
          Buffer.from(second.artifact?.bytes ?? new Uint8Array()),
          Buffer.from(first.artifact?.bytes ?? new Uint8Array()),
        ),
        0,
        `${id} composes identical artifact bytes`,
      );
      assert.equal(second.artifact?.mime, first.artifact?.mime);
    }
  });

  it("answers the typed manifest law honestly", async () => {
    for (const id of virtuallaneids) {
      await assert.rejects(() => runlane(id, "not json at all"), codeis("INVALID_MACHINE_MANIFEST"));
    }
    await assert.rejects(() => runlane("virtual-full", '{"ramgb": 0}'), codeis("INVALID_MACHINE_MANIFEST"));
    await assert.rejects(() => runlane("virtual-full", '{"ramgb": 20000}'), codeis("INVALID_MACHINE_MANIFEST"));
    await assert.rejects(() => runlane("virtual-full", '{"ramgb": "lots"}'), codeis("INVALID_MACHINE_MANIFEST"));
    await assert.rejects(() => runlane("virtual-full", '{"model": "Intel Pentium 4"}'), codeis("CATALOG_ENTRY_ABSENT"));
    await assert.rejects(() => runlane("virtual-kvm", '{"gpu": "voodoo 3"}'), codeis("CATALOG_ENTRY_ABSENT"));
    await assert.rejects(() => runlane("virtual-vgpu", '{"mig": "9g.999gb"}'), codeis("CATALOG_ENTRY_ABSENT"));
  });

  it("answers the artifact mime its registry record declares", async () => {
    for (const id of virtuallaneids) {
      const run = await runlane(id, "{}");
      const record = getmodality(id);
      assert.ok(record !== undefined, `the registry carries ${id}`);
      assert.ok(run.artifact !== undefined, `${id} committed an artifact`);
      assert.equal(run.artifact?.mime, record?.mime, `${id} answers its registry record's mime`);
      assert.doesNotThrow(() => JSON.parse(Buffer.from(run.artifact?.bytes ?? new Uint8Array()).toString("utf8")));
    }
  });
});
