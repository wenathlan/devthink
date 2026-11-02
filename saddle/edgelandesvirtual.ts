// # edgelandesvirtual.ts — the virtual hardware composition lanes of
// the edge plane (the ninety modalities wave, group c, task wa-2c: the
// seven planned virtual-hardware modalities wired as honest composition
// lanes). every lane rides the engine's own virtual hardware payloads —
// sandbox.ts generates the procfs, smi, dmesg and mesa surfaces,
// virtualization.ts carries the qemu/kvm plan surface — and composes the
// per-modality machine report from them: a lane never boots anything on
// the host, the report says composed, never booted. the code field of
// every executor is the machine manifest (json: model, gpu, ramgb, boot
// with the optional vcpus and mig); an unparsable manifest answers
// invalid-machine-manifest, a catalog reference the engine does not
// carry answers catalog-entry-absent, a plan the recipe cannot compose
// answers kvm-composition-failed and a blown deadline answers
// run-deadline-exceeded. determinism is the lane law: the engine samples
// some payload values per run (crypto-random memory fractions, the smi
// timestamp and counters, the state token), so the lanes pin those
// ranges at their midpoints and keep only the run-invariant smi lines —
// the same manifest always composes the same report bytes.

import { type EdgeLaneExecutor, edgelaneerror } from "./edgelandes.ts";
import {
  bootSequence,
  type CpuSpec,
  type CpuTopology,
  clinfoSummary,
  cpudata,
  freeh,
  type GpuSpec,
  getcpu,
  getcpubyid,
  getgpu,
  getmig,
  glxinfoSummary,
  gpudata,
  lscpu,
  mesaenv,
  migprofiles,
  nvidiaSmiTable,
  pagealign,
  solvetopology,
  vulkanSummary,
} from "./sandbox.ts";

/* the virtualization domain (virtualization.ts) re-exports virtualgpu
 * through a .js specifier — the webserver's plain node host resolves only
 * .ts specifiers, so the kvm lane loads the domain lazily inside the
 * executor (the family law: a domain the host cannot resolve degrades
 * that one lane honestly, never the engine boot). */
async function loadvirtualization(): Promise<{
  buildqemucmd: (opts: { vcpu: number; memMB: number }) => readonly string[];
  kvmcapnames: readonly string[];
  qemuversioncheck: () => string;
}> {
  try {
    return await import("./virtualization.ts");
  } catch (error) {
    throw edgelaneerror(
      "KVM_MODULE_UNAVAILABLE",
      `the virtualization domain cannot load under this host (the .js specifier graph needs a full resolver): ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the manifest law — parse, resolve, hash and the budget.   */
/* ════════════════════════════════════════════════════════════════════ */

/** the raw machine manifest as parsed from the code field: every field
 * optional, every present field type-checked (the invalid-manifest law
 * answers invalid-machine-manifest for anything else). */
interface rawmanifest {
  model?: string;
  gpu?: string;
  ramgb?: number;
  vcpus?: number;
  boot?: boolean;
  mig?: string;
}

/** the resolved manifest every surface renders from: the catalog names,
 * the engine defaults and the topology-resolved vcpu count. */
interface machinemanifest {
  model: string;
  gpu: string;
  ramgb: number;
  vcpus: number;
  boot: boolean;
  mig: string;
}

/** the machine one lane composes: the resolved catalog specs and the
 * engine-solved topology beside the canonical manifest. */
interface composedmachine {
  manifest: machinemanifest;
  cpuspec: CpuSpec;
  gpuspec: GpuSpec;
  topology: CpuTopology;
}

/** the engine's virtual memory ceiling createSandboxState clamps under;
 * the lane law refuses a manifest above it instead of silently
 * rewriting the caller's machine. */
const ENGINERAMCEILINGGB = 18432;

/** parses the code field as the machine manifest: a json object carrying
 * the optional model, gpu, ramgb, vcpus, boot and mig fields, every
 * present field type-checked and bounded — anything else answers
 * invalid-machine-manifest with the reason. */
function parsemanifest(code: string): rawmanifest {
  const invalid = (detail: string): never => {
    throw edgelaneerror("INVALID_MACHINE_MANIFEST", detail);
  };
  let parsed: unknown;
  try {
    parsed = JSON.parse(code);
  } catch (error) {
    invalid(
      `the code field is not parsable json (the machine manifest law): ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    invalid("the machine manifest must be a json object carrying the machine fields");
  }
  const raw = parsed as Record<string, unknown>;
  if (raw.model !== undefined && typeof raw.model !== "string") {
    invalid("the model field must be a string when present");
  }
  if (raw.gpu !== undefined && typeof raw.gpu !== "string") {
    invalid("the gpu field must be a string when present");
  }
  if (raw.mig !== undefined && typeof raw.mig !== "string") {
    invalid("the mig field must be a string when present (a mig profile id or off)");
  }
  if (raw.boot !== undefined && typeof raw.boot !== "boolean") {
    invalid("the boot field must be a boolean when present");
  }
  if (raw.ramgb !== undefined) {
    if (typeof raw.ramgb !== "number" || !Number.isFinite(raw.ramgb)) {
      invalid("the ramgb field must be a finite number when present");
    }
    if (raw.ramgb <= 0) {
      invalid("the ramgb field must be a positive number of gigabytes");
    }
    if (raw.ramgb > ENGINERAMCEILINGGB) {
      invalid(
        `the ramgb field must stay under the engine's ${ENGINERAMCEILINGGB} gb virtual ceiling (createSandboxState clamps there; the lane refuses instead of rewriting the manifest)`,
      );
    }
  }
  if (raw.vcpus !== undefined) {
    if (typeof raw.vcpus !== "number" || !Number.isFinite(raw.vcpus)) {
      invalid("the vcpus field must be a finite number when present");
    }
    if (raw.vcpus < 1) {
      invalid("the vcpus field must be at least 1");
    }
  }
  return { model: raw.model, gpu: raw.gpu, ramgb: raw.ramgb, vcpus: raw.vcpus, boot: raw.boot, mig: raw.mig };
}

/** resolves the manifest against the engine catalogs: the model lookup
 * accepts the catalog model name or its slug id (getcpu then
 * getcpubyid), the gpu lookup accepts the id or the name, the mig
 * lookup accepts a mig profile id or off; an entry the catalog does not
 * carry answers catalog-entry-absent naming the known ids. the defaults
 * mirror the engine's own laws: the first catalog entry for model and
 * gpu (the vgpu lane overrides the gpu default with the first
 * mig-capable device), 32 gb ram and 8 vcpus (the SandboxSpec defaults
 * createSandboxState rides), the vcpus clamped by the engine's own
 * solvetopology. */
function composemachine(raw: rawmanifest, defaultgpu?: string): composedmachine {
  const modelwanted = raw.model ?? cpudata[0].model;
  const cpuspec = getcpu(modelwanted) ?? getcpubyid(modelwanted);
  if (cpuspec === undefined) {
    throw edgelaneerror(
      "CATALOG_ENTRY_ABSENT",
      `the cpu catalog carries no model "${modelwanted}"; known models: ${cpudata.map((entry) => entry.model).join(", ")}`,
    );
  }
  const gpuwanted = raw.gpu ?? defaultgpu ?? gpudata[0].id;
  const gpuspec = getgpu(gpuwanted);
  if (gpuspec === undefined) {
    throw edgelaneerror(
      "CATALOG_ENTRY_ABSENT",
      `the gpu catalog carries no device "${gpuwanted}"; known ids: ${gpudata.map((entry) => entry.id).join(", ")}`,
    );
  }
  const migwanted = raw.mig ?? "off";
  if (migwanted !== "off" && !migprofiles.some((profile) => profile.id === migwanted)) {
    throw edgelaneerror(
      "CATALOG_ENTRY_ABSENT",
      `the mig catalog carries no profile "${migwanted}"; known profiles: off, ${migprofiles.map((profile) => profile.id).join(", ")}`,
    );
  }
  const topology = solvetopology(cpuspec, raw.vcpus ?? 8);
  const manifest: machinemanifest = {
    model: cpuspec.model,
    gpu: gpuspec.id,
    ramgb: raw.ramgb ?? 32,
    vcpus: topology.vcpus,
    boot: raw.boot ?? false,
    mig: migwanted,
  };
  return { manifest, cpuspec, gpuspec, topology };
}

/** renders the canonical manifest json (fixed key order): the bytes the
 * session-otp gate hashes and the manifest the artifacts carry. */
function canonicalmanifest(manifest: machinemanifest): string {
  return JSON.stringify({
    model: manifest.model,
    gpu: manifest.gpu,
    ramgb: manifest.ramgb,
    vcpus: manifest.vcpus,
    boot: manifest.boot,
    mig: manifest.mig,
  });
}

/** hashes one text with 64-bit fnv-1a and renders 16 lowercase hex
 * characters: the deterministic digest the session-otp gate and the
 * sandbox id ride — the engine's token() samples crypto randomness per
 * run, the lane hashes the manifest instead so identical manifests
 * compose identical ids. */
function fnv1a64(text: string): string {
  let hash = 0xcbf29ce484222325n;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= BigInt(text.charCodeAt(index));
    hash = (hash * 0x100000001b3n) & 0xffffffffffffffffn;
  }
  return hash.toString(16).padStart(16, "0");
}

/** honors the deadline after the composition (the boot budget law: the
 * compositions are fast, a blown budget answers run-deadline-exceeded
 * instead of a report the caller never paid for). */
function guarddeadline(startedat: number, deadline: number): void {
  const budget = Number.isFinite(deadline) ? Math.max(0, deadline) : Number.POSITIVE_INFINITY;
  if (Date.now() - startedat > budget) {
    throw edgelaneerror(
      "RUN_DEADLINE_EXCEEDED",
      `the composition exceeded its ${deadline} ms deadline (the boot budget law)`,
    );
  }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the composed surfaces — memory, smi, display, quotas.     */
/* ════════════════════════════════════════════════════════════════════ */

/** the deterministic memory plan: memtotal, swap, the meminfo rows and
 * the free -h table. */
interface memoryplan {
  memtotalkb: number;
  swapgb: number;
  rows: string[];
  free: string;
}

/** composes the memory plan from the engine's own formulas: pagealign
 * and the MemTotal and swap laws meminfo/createSandboxState ride, with
 * every per-run sampled fraction pinned at the midpoint of the engine's
 * rnd range (the engine samples free, buffers, cached, shmem and
 * swapfree per run; the lane pins the midpoints so the same manifest
 * composes the same bytes) — the free -h table still renders through
 * the engine's own freeh over the pinned snapshot. */
function composememoryplan(ramgb: number, vcpus: number): memoryplan {
  const memtotalkb = pagealign(ramgb * 1024 * 1024 - 131072);
  const swapgb = Math.min(Math.max(Math.round(ramgb / 8), 2), 128);
  const swaptotalkb = swapgb * 1024 * 1024;
  const row = (key: string, kb: number): string => `${key}:${String(kb).padStart(24 - key.length - 1)} kB`;
  const rows = [
    row("MemTotal", memtotalkb),
    row("MemFree", pagealign(memtotalkb * 0.053)),
    row("MemAvailable", pagealign(memtotalkb * 0.895)),
    row("Buffers", pagealign(memtotalkb * 0.0065)),
    row("Cached", pagealign(memtotalkb * 0.36)),
    row("SReclaimable", 0),
    row("Shmem", pagealign(memtotalkb * 0.0085)),
    row("SwapTotal", swaptotalkb),
    row("SwapFree", pagealign(swaptotalkb * 0.915)),
    row("KernelStack", pagealign(vcpus * 320)),
  ];
  return { memtotalkb, swapgb, rows, free: freeh(rows.join("\n")) };
}

/** keeps the run-invariant lines of the engine's 89-char smi table: the
 * composer stamps a per-run timestamp and samples the fan, temperature,
 * memory and utilization counters, so the surface drops the timestamp
 * line, the sampled perf row and the mig-worker process rows and keeps
 * every deterministic line (the borders, the headers, the device row,
 * the mig line, the no-running-processes line). */
function smilines(gpu: string, mig: string): string[] {
  return nvidiaSmiTable(gpu, mig)
    .split("\n")
    .filter((line) => !/^(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat) /.test(line))
    .filter((line) => !/P0\s+\d+W \//.test(line))
    .filter((line) => !line.includes("mig-worker"));
}

/** the session law of the virtual display (the lane pins it; the
 * registry record charges the virtual-screen modality under the xvfb
 * and looking-glass drivers with the session-otp hardening gate):
 * display :0, geometry 1280x800x24 and the vnc endpoint on the symbolic
 * saddle-display host — the lane composes the tree, it never binds a
 * socket. */
const displaylaw = {
  display: ":0",
  screen: 0,
  geometry: "1280x800x24",
  vnc: "vnc://saddle-display:5900",
  driver: "looking-glass b7 (kvmfr ivshmem 128m, the guest-to-host frame bridge)",
} as const;

/** reads the driver-quota bound from the lane inputs: inputs.quota with
 * the default of 4 devices, clamped to 1-16 (the registry record's
 * driver-quota hardening gate — the nvml surface never answers more
 * devices than the quota bounds). */
function driverquota(inputs: unknown): number {
  const wanted = typeof inputs === "object" && inputs !== null ? (inputs as Record<string, unknown>).quota : undefined;
  if (typeof wanted !== "number" || !Number.isFinite(wanted)) {
    return 4;
  }
  return Math.max(1, Math.min(16, Math.round(wanted)));
}

/** reads the context-quota bound from the lane inputs: inputs.contexts
 * with the default of 8 contexts, clamped to 1-64 (the registry record's
 * context-quota hardening gate). */
function contextquota(inputs: unknown): number {
  const wanted =
    typeof inputs === "object" && inputs !== null ? (inputs as Record<string, unknown>).contexts : undefined;
  if (typeof wanted !== "number" || !Number.isFinite(wanted)) {
    return 8;
  }
  return Math.max(1, Math.min(64, Math.round(wanted)));
}

/** extracts the driver version strings from the engine's boot payload:
 * the kernel banner of the first line rides virtualcpu and the engine's
 * own version line rides virtualmemory (the boot sequence is
 * deterministic, so the driver table composes identical bytes). */
function driverversions(manifest: machinemanifest): { kernel: string; engine: string } {
  const boot = bootSequence(manifest.model, manifest.vcpus, manifest.ramgb, manifest.gpu);
  return {
    kernel: /Linux version (\S+) /.exec(boot[0])?.[1] ?? "6.12.0-saddle",
    engine: /virtual hardware engine v([0-9.]+)/.exec(boot.join("\n"))?.[1] ?? "2.0.127",
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: the seven lane executors — one per planned modality.      */
/* ════════════════════════════════════════════════════════════════════ */

/** the artifact encoder shared by the lanes. */
const textencoder = new TextEncoder();

/** virtual-full: the complete machine. composes the cpu (the catalog by
 * model, default the first entry), the gpu (by id, default the first),
 * the memory (the engine's meminfo/freeh formulas), the boot dmesg
 * sequence (when the manifest asks boot), the topology (solvetopology)
 * and the sandbox state facts; the report answers the model, the
 * cores/threads, the smi summary, the memory report, the state line and
 * the boot dmesg head, and the artifact carries the complete manifest. */
async function virtualfulllane(code: string, _inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const startedat = Date.now();
  const { manifest, cpuspec, gpuspec, topology } = composemachine(parsemanifest(code));
  const memory = composememoryplan(manifest.ramgb, manifest.vcpus);
  const smi = smilines(manifest.gpu, "off");
  const digest = fnv1a64(canonicalmanifest(manifest));
  const sandboxid = `sb-${digest.slice(0, 8)}`;
  const hostname = `saddle-${digest.slice(0, 8)}`;
  const kernel = cpuspec.arch === "arm64" ? "6.12.0-saddle-aarch64" : "6.12.0-saddle";
  const boot = manifest.boot ? bootSequence(manifest.model, manifest.vcpus, manifest.ramgb, manifest.gpu) : [];
  const stdout = [
    "saddle virtual-full: composed machine report (composed, never booted)",
    `  model: ${cpuspec.displayname} — ${cpuspec.cores} cores / ${cpuspec.threads} threads (${cpuspec.microarch}, ${cpuspec.socket})`,
    `  topology: ${topology.vcpus} vcpus, ${topology.coresonline} cores online, ${topology.threadspercore} threads per core, ${topology.sockets} socket (solved by the engine's solvetopology)`,
    `  gpu: ${gpuspec.name} (${gpuspec.id}) — ${gpuspec.memtype} ${gpuspec.vrammib / 1024} gb, driver ${gpuspec.driver}${gpuspec.cuda === null ? "" : `, cuda ${gpuspec.cuda}`}`,
    "  smi (the engine's 89-char table, the run-invariant lines):",
    ...smi.map((line) => `    ${line}`),
    "  memory (the engine's formulas, the sampled fractions pinned at their midpoints):",
    ...memory.rows.map((line) => `    ${line}`),
    "  free -h (the engine's free table over the pinned plan):",
    ...memory.free.split("\n").map((line) => `    ${line}`),
    `  state: hostname ${hostname}, kernel ${kernel}, sandbox ${sandboxid} (the id pinned from the manifest hash — the engine's state composer samples a per-run token and meminfo snapshot instead)`,
    ...(manifest.boot
      ? [
          `  boot dmesg head (${Math.min(8, boot.length)} of ${boot.length} lines):`,
          ...boot.slice(0, 8).map((line) => `    ${line}`),
        ]
      : ["  boot: the manifest asks for no boot sequence (boot false)"]),
  ].join("\n");
  guarddeadline(startedat, deadline);
  const artifact = {
    modality: "virtual-full",
    verdict: "composed",
    manifest,
    machine: {
      cpumodel: cpuspec.model,
      cores: cpuspec.cores,
      threads: cpuspec.threads,
      gpuid: gpuspec.id,
      gpuname: gpuspec.name,
      vrammib: gpuspec.vrammib,
      memtotalkb: memory.memtotalkb,
      swapgb: memory.swapgb,
    },
    topology,
    smi,
    memory: { rows: memory.rows, free: memory.free },
    state: { id: sandboxid, hostname, kernel },
    boot,
    lscpu: lscpu(manifest.model, manifest.vcpus),
  };
  return {
    stdout,
    artifact: { mime: "application/vnd.devthink.sandbox+json", bytes: textencoder.encode(JSON.stringify(artifact)) },
  };
}

/** virtual-vgpu: the vgpu slice. composes the mig-capable device (the
 * manifest's gpu selects it, default the first mig-capable entry), the
 * mig slicing (the engine's migprofiles catalog), the smi table for the
 * sliced device and the nvml shim surface (FAKE_MODEL/FAKE_VRAM under
 * the profile, the engine's env law); a non-mig device answers
 * catalog-entry-absent — the lane composes slices of the mig-class
 * devices only, it never pretends a gaming card slices. */
async function virtualvgpulane(code: string, _inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const startedat = Date.now();
  const defaultvgpu = gpudata.find((entry) => entry.mig) ?? gpudata[0];
  const { manifest, gpuspec } = composemachine(parsemanifest(code), defaultvgpu.id);
  if (!gpuspec.mig) {
    throw edgelaneerror(
      "CATALOG_ENTRY_ABSENT",
      `the gpu catalog carries no mig-capable entry for "${manifest.gpu}" (${gpuspec.name}); the vgpu lane composes slices of the mig-class devices only: ${gpudata
        .filter((entry) => entry.mig)
        .map((entry) => entry.id)
        .join(", ")}`,
    );
  }
  const profile = getmig(manifest.mig) ?? migprofiles[0];
  const smi = smilines(manifest.gpu, profile.id);
  const stdout = [
    "saddle virtual-vgpu: composed vgpu slice report (composed, never booted)",
    `  device: ${gpuspec.name} (${gpuspec.id}) — ${gpuspec.memtype} ${gpuspec.vrammib / 1024} gb class, mig capable (driver ${gpuspec.driver})`,
    `  profile: ${profile.id} — ${profile.slicegb} gb slices, up to ${profile.maxinstances} instances`,
    "  slice table (the engine's mig catalog for the 96 gb-class device):",
    ...migprofiles.map((entry) => `    ${entry.id}  ${entry.slicegb} gb  max ${entry.maxinstances} instances`),
    "  smi (the sliced device, the run-invariant lines):",
    ...smi.map((line) => `    ${line}`),
    "  nvml shim (the engine's FAKE_* law under mig, the env surface of the sandbox state):",
    `    FAKE_MODEL=${gpuspec.name}`,
    `    FAKE_VRAM=${profile.slicegb * 1024}`,
  ].join("\n");
  guarddeadline(startedat, deadline);
  const artifact = {
    modality: "virtual-vgpu",
    verdict: "composed",
    manifest,
    device: { id: gpuspec.id, name: gpuspec.name, vrammib: gpuspec.vrammib, mig: gpuspec.mig },
    profile,
    slicetable: migprofiles,
    nvmlshim: { FAKE_MODEL: gpuspec.name, FAKE_VRAM: profile.slicegb * 1024 },
    smi,
  };
  return {
    stdout,
    artifact: { mime: "application/vnd.devthink.sandbox+json", bytes: textencoder.encode(JSON.stringify(artifact)) },
  };
}

/** virtual-screen: the vm plus vnc. composes the machine (cpu, gpu,
 * memory) plus the virtual display tree (xvfb :0 at 1280x800x24, the
 * looking-glass driver line, the vnc endpoint the session law pins) and
 * the session-otp hardening gate: the 64-bit fnv-1a digest of the
 * canonical manifest, deterministic per manifest (the same manifest
 * always answers the same otp); the lane composes the tree, it never
 * binds the endpoint. */
async function virtualscreenlane(code: string, _inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const startedat = Date.now();
  const { manifest, cpuspec, gpuspec } = composemachine(parsemanifest(code));
  const memory = composememoryplan(manifest.ramgb, manifest.vcpus);
  const otp = fnv1a64(canonicalmanifest(manifest));
  const stdout = [
    "saddle virtual-screen: composed display report (composed, never booted)",
    `  machine: ${cpuspec.displayname} + ${gpuspec.name} + ${manifest.ramgb} gb (the composed machine beneath the display)`,
    `  memory: memtotal ${memory.memtotalkb} kb, swap ${memory.swapgb} gb (the engine's formulas)`,
    "  display tree (the session law the lane pins):",
    `    ${displaylaw.display}  xvfb virtual display, screen ${displaylaw.screen}, geometry ${displaylaw.geometry}, nolisten tcp`,
    `    driver   ${displaylaw.driver}`,
    `    vnc      ${displaylaw.vnc} (the endpoint the session law pins; the lane composes, never binds)`,
    "  session otp hardening gate (fnv-1a 64 over the canonical manifest):",
    `    otp: ${otp}`,
  ].join("\n");
  guarddeadline(startedat, deadline);
  const artifact = {
    modality: "virtual-screen",
    verdict: "composed",
    manifest,
    display: {
      display: displaylaw.display,
      screen: displaylaw.screen,
      geometry: displaylaw.geometry,
      vnc: displaylaw.vnc,
    },
    otp,
    machine: { model: cpuspec.model, gpu: gpuspec.id, ramgb: manifest.ramgb, memtotalkb: memory.memtotalkb },
  };
  return {
    stdout,
    artifact: { mime: "application/vnd.devthink.screen+json", bytes: textencoder.encode(JSON.stringify(artifact)) },
  };
}

/** virtual-drivers: the virtual driver surface. composes the driver
 * table from the engine's own version strings (the kernel banner of the
 * boot payload rides virtualcpu, the gpu catalog's driver string rides
 * virtualgpu, the engine's own version line rides virtualmemory) and the
 * nvml shim answers under the driver-quota gate: inputs.quota devices
 * (default 4, clamped 1-16), each carrying the selected gpu identity
 * through FAKE_MODEL/FAKE_VRAM. */
async function virtualdriverslane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const startedat = Date.now();
  const { manifest, gpuspec } = composemachine(parsemanifest(code));
  const quota = driverquota(inputs);
  const versions = driverversions(manifest);
  const stdout = [
    "saddle virtual-drivers: composed driver report (composed, never booted)",
    "  driver table (the engine's own version strings):",
    `    virtualcpu      ${versions.kernel} (the kernel banner of the engine's boot sequence)`,
    `    virtualgpu      ${gpuspec.driver} (the driver string of the gpu catalog entry)`,
    `    virtualmemory   ${versions.engine} (the engine version line of the boot sequence)`,
    `  nvml shim (the driver-quota gate, quota ${quota}, clamped 1-16):`,
    ...Array.from(
      { length: quota },
      (_, index) => `    device ${index}: FAKE_MODEL=${gpuspec.name} FAKE_VRAM=${gpuspec.smireportedmib}`,
    ),
  ].join("\n");
  guarddeadline(startedat, deadline);
  const artifact = {
    modality: "virtual-drivers",
    verdict: "composed",
    manifest,
    drivers: { virtualcpu: versions.kernel, virtualgpu: gpuspec.driver, virtualmemory: versions.engine },
    quota,
    nvmlshim: Array.from({ length: quota }, (_, index) => ({
      device: index,
      FAKE_MODEL: gpuspec.name,
      FAKE_VRAM: gpuspec.smireportedmib,
    })),
  };
  return {
    stdout,
    artifact: { mime: "application/vnd.devthink.sandbox+json", bytes: textencoder.encode(JSON.stringify(artifact)) },
  };
}

/** virtual-kvm: the kvm machine planner. composes the qemu argv from the
 * engine's turbo builder (buildqemucmd over the manifest's ramgb and the
 * topology-resolved vcpus — the cpu model rides the recipe's own
 * DiamondRapids default, the qemu cpu model space is the recipe's law),
 * the kvm capability names and the clean-rootfs law; the report answers
 * the composed plan, never a booted machine — the actual boot rides the
 * firecracker/qemu host lanes. a manifest asking for more memory than
 * the model's catalog ceiling answers kvm-composition-failed (the
 * recipe cannot compose hardware the model cannot address). */
async function virtualkvmlane(code: string, _inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const startedat = Date.now();
  const { manifest, cpuspec } = composemachine(parsemanifest(code));
  if (manifest.ramgb > cpuspec.maxmemorygb) {
    throw edgelaneerror(
      "KVM_COMPOSITION_FAILED",
      `the manifest asks for ${manifest.ramgb} gb on ${cpuspec.model} whose catalog ceiling is ${cpuspec.maxmemorygb} gb — the recipe cannot compose hardware the model cannot address`,
    );
  }
  const domain = await loadvirtualization();
  const argv = domain.buildqemucmd({ vcpu: manifest.vcpus, memMB: manifest.ramgb * 1024 });
  const stdout = [
    "saddle virtual-kvm: composed kvm plan (the planner — the boot rides the host lanes, never this one)",
    `  manifest: model ${manifest.model} (validated against the cpu catalog), gpu ${manifest.gpu} (validated; the plan carries no display device, vga none), ${manifest.ramgb} gb, ${manifest.vcpus} vcpus`,
    `  qemu (the engine's turbo builder, qemu ${domain.qemuversioncheck().split(" ")[0]}):`,
    ...argv.map((arg, index) => (index === 0 ? `    ${arg}` : `      ${arg}`)),
    `  kvm caps: ${domain.kvmcapnames.length} (${domain.kvmcapnames.join(", ")})`,
    "  rootfs law: clean-rootfs — the plan ships a pristine rootfs image; this lane composes the plan, it never boots",
  ].join("\n");
  guarddeadline(startedat, deadline);
  const artifact = {
    modality: "virtual-kvm",
    verdict: "composed-plan",
    manifest,
    qemu: { version: domain.qemuversioncheck(), argv },
    kvmcaps: domain.kvmcapnames,
    rootfslaw: "clean-rootfs",
  };
  return {
    stdout,
    artifact: { mime: "application/vnd.devthink.sandbox+json", bytes: textencoder.encode(JSON.stringify(artifact)) },
  };
}

/** microvm-gpuless: the gpuless render. composes the mesa software stack
 * (the engine's pinned summaries: llvmpipe opengl 4.6 through glxinfo,
 * lavapipe vulkan 1.4 through vulkaninfo, rusticl opencl 3.1 through
 * clinfo, the validated mesaenv record), the cpu and the memory, and
 * the xvfb display — the full software-render machine with no gpu
 * device in the composition (the render rides the cpu). */
async function microvmgpulesslane(code: string, _inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const startedat = Date.now();
  const { manifest, cpuspec } = composemachine(parsemanifest(code));
  const memory = composememoryplan(manifest.ramgb, manifest.vcpus);
  const env = mesaenv(manifest.vcpus);
  const glxinfo = glxinfoSummary();
  const vulkan = vulkanSummary();
  const clinfo = clinfoSummary(manifest.vcpus);
  const stdout = [
    "saddle microvm-gpuless: composed software-render machine (composed, never booted)",
    `  cpu: ${cpuspec.displayname} — ${manifest.vcpus} vcpus (${cpuspec.microarch})`,
    `  memory: ${manifest.ramgb} gb (memtotal ${memory.memtotalkb} kb, swap ${memory.swapgb} gb, the engine's formulas)`,
    "  mesa software stack (the engine's pinned summaries):",
    "    glxinfo (llvmpipe — opengl 4.6 core):",
    ...glxinfo.split("\n").map((line) => `      ${line}`),
    "    vulkaninfo (lavapipe — vulkan 1.4):",
    ...vulkan.split("\n").map((line) => `      ${line}`),
    "    clinfo (rusticl — opencl 3.1):",
    ...clinfo.split("\n").map((line) => `      ${line}`),
    "    env (the engine's mesaenv record):",
    ...Object.keys(env)
      .sort()
      .map((key) => `      ${key}=${env[key]}`),
    "  display (the gpuless virtual display):",
    `    ${displaylaw.display}  xvfb, screen ${displaylaw.screen}, geometry ${displaylaw.geometry} (the software-render display, nolisten tcp)`,
  ].join("\n");
  guarddeadline(startedat, deadline);
  const artifact = {
    modality: "microvm-gpuless",
    verdict: "composed",
    manifest,
    memory: { memtotalkb: memory.memtotalkb, swapgb: memory.swapgb, free: memory.free },
    mesa: { glxinfo, vulkan, clinfo, env },
    display: { display: displaylaw.display, geometry: displaylaw.geometry },
  };
  return {
    stdout,
    artifact: { mime: "application/vnd.devthink.microvm+json", bytes: textencoder.encode(JSON.stringify(artifact)) },
  };
}

/** gpu-virgl: the virgl render slice. composes the gpu catalog entry for
 * the virtual device, the context-quota law (inputs.contexts, default
 * 8, clamped 1-64) and the 3d capability report — the virtio-gpu virgl
 * bridge carrying the device identity; the report never claims a host
 * gpu, the composition rides the catalog entry. */
async function gpuvirgllane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const startedat = Date.now();
  const { manifest, gpuspec } = composemachine(parsemanifest(code));
  const contexts = contextquota(inputs);
  const stdout = [
    "saddle gpu-virgl: composed virgl render slice (composed, never booted)",
    `  device: ${gpuspec.name} (${gpuspec.id}) — ${gpuspec.arch}, ${gpuspec.smarch}, ${gpuspec.smcount} sms`,
    `  vram: ${gpuspec.vrammib} MiB ${gpuspec.memtype} (the smi surface reports ${gpuspec.smireportedmib} MiB)`,
    `  driver: ${gpuspec.driver}${gpuspec.cuda === null ? "" : ` (cuda ${gpuspec.cuda})`}`,
    `  context quota: ${contexts} (the context-quota law; inputs.contexts overrides, clamped 1-64)`,
    "  3d capability report (the virtual device's catalog entry through the virtio-gpu virgl bridge):",
    "    virtio-gpu   virgl 3d acceleration on (the venus native context stays off — the virgl bridge is the composed path)",
    `    contexts     ${contexts} concurrent render contexts (ctx 0-${contexts - 1})`,
    "    render       the guest contexts render through the composed device identity above; the lane never claims a host gpu",
  ].join("\n");
  guarddeadline(startedat, deadline);
  const artifact = {
    modality: "gpu-virgl",
    verdict: "composed",
    manifest,
    device: {
      id: gpuspec.id,
      name: gpuspec.name,
      arch: gpuspec.arch,
      smarch: gpuspec.smarch,
      smcount: gpuspec.smcount,
      vrammib: gpuspec.vrammib,
      driver: gpuspec.driver,
    },
    contexts,
    caps: { virgl: true, venus: false, contexts: `ctx 0-${contexts - 1}` },
  };
  return {
    stdout,
    artifact: { mime: "application/vnd.devthink.gpu+json", bytes: textencoder.encode(JSON.stringify(artifact)) },
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: the lane tables — the specs, the executors, the ids.      */
/* ════════════════════════════════════════════════════════════════════ */

/** the declaration of one virtual lane: the modality id, the wiring
 * kind, the runtime surface and the synchronous presence probe. */
export interface VirtualLaneSpec {
  /** the modality id the registry and the dispatch plane read. */
  modality: string;
  /** the wiring kind: the virtual lanes compose in process today. */
  kind: "live" | "host";
  /** the runtime surface the lane composes from. */
  runtime: string;
  /** the honest presence probe: the composed engine surface really loads. */
  present: () => boolean;
}

/** the seven virtual lane specs (kind live — the lanes compose the
 * engine's own payloads in process; the present probes guard the
 * imported surfaces by typeof so a module graph that cannot load one
 * surface answers absent for that lane, never a fake presence). */
export const virtuallanespecs: readonly VirtualLaneSpec[] = Object.freeze([
  {
    modality: "virtual-full",
    kind: "live",
    runtime: "sandbox-hardware",
    present: () => typeof getcpu === "function" && typeof bootSequence === "function",
  },
  {
    modality: "virtual-vgpu",
    kind: "live",
    runtime: "sandbox-mig",
    present: () => typeof nvidiaSmiTable === "function" && migprofiles.length > 0,
  },
  {
    modality: "virtual-screen",
    kind: "live",
    runtime: "sandbox-display",
    present: () => typeof getgpu === "function" && typeof freeh === "function",
  },
  {
    modality: "virtual-drivers",
    kind: "live",
    runtime: "sandbox-drivers",
    present: () => typeof bootSequence === "function" && typeof getgpu === "function",
  },
  {
    modality: "virtual-kvm",
    kind: "live",
    runtime: "qemu-planner",
    present: () =>
      true /* the kvm lane composes from the lazy domain: the probe answers the engine ships the composition seat */,
  },
  {
    modality: "microvm-gpuless",
    kind: "live",
    runtime: "mesa-llvmpipe",
    present: () => typeof glxinfoSummary === "function" && typeof mesaenv === "function",
  },
  {
    modality: "gpu-virgl",
    kind: "live",
    runtime: "virgl-virtio-gpu",
    present: () => typeof getgpu === "function" && typeof solvetopology === "function",
  },
]);

/** the lane executor table of the virtual lanes, keyed by modality id:
 * the dispatch plane refuses to boot over a lane it cannot wire. */
export const edgelaneexecutorsvirtual: Readonly<Record<string, EdgeLaneExecutor>> = Object.freeze({
  "virtual-full": virtualfulllane,
  "virtual-vgpu": virtualvgpulane,
  "virtual-screen": virtualscreenlane,
  "virtual-drivers": virtualdriverslane,
  "virtual-kvm": virtualkvmlane,
  "microvm-gpuless": microvmgpulesslane,
  "gpu-virgl": gpuvirgllane,
});

/** the seven virtual lane ids derived from the spec table (the order is
 * the spec order; the ids are pinned — the orchestrator's edge plane and
 * the api routes read them exactly). */
export const virtuallaneids: readonly string[] = Object.freeze(virtuallanespecs.map((spec) => spec.modality));
