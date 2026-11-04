/**
 * modalityregistry — the catalog of the ninety sandbox modalities the
 * saddle virtualization engine opens (the exclusive master engine of the
 * family: the vm, the sandbox, the microvm, the runner and the hardware
 * virtual seats — every workload rides the self-hosted edge, nothing
 * touches the visitor machine). One record per modality: the keyword id
 * (no hyphens), the display label, the category block, the driver
 * requirements it mounts, the boot cost class, the hardening gates it
 * carries, the mime contract it answers and the honest state of its
 * wiring. The registry is the spine of the ninety modality plan (the
 * owner's law: the ninety modalities of saddle act for the system,
 * nothing touches the visitor machine): the workload never chooses by
 * name — the join resolver reads the request (isolation, gpu, network,
 * boot budget) and answers the modality set that satisfies it, so the
 * person chooses none and the platform resolves the join of all (the
 * nuclear modality law). Every record declares its binding — live (a
 * platform lane executes through it today), host (the lane probes the
 * host runtime and reports availability) or planned (the documented
 * edge-binding path the catalog promises) — so the report never lies:
 * a lane that does not wire a modality says so instead of pretending.
 * Pure data and pure functions: zero storage, zero node-only imports,
 * the browser-pure bundle keeps carrying it.
 *
 * the fold law of the virtual wave: the orphan modalityregistrytypes.ts —
 * the declare-only mirror of this registry the v2 wave left at the root
 * with zero importers (the devthink os reads its own ambient
 * modalitytypes.ts bridge, never the saddle mirror) — absorbed into this
 * seat: every declaration it carried (BootClass, ModalityFamily,
 * ModalityState, ModalityRecord, BOOTLADDER, MODALITYPLANCOUNT,
 * MODALITIES, ModalityPlanReport, planreport, BaseProfile, JoinRequest,
 * resolvejoin, getmodality) already rides this file with its real
 * implementation, so the mirror retired without one new line of code.
 *
 * @module saddle/modalityregistry
 * @family wave/saddlemod2
 * @token modality
 * @token ninety
 * @flag join-resolver
 * @flag visitor-law
 * @binding MODALITY_COUNT is derived from the records' real length —
 *   never a hardcoded count — and MODALITYPLANCOUNT pins the plan line
 *   the owner charged; the tests assert both stay equal at ninety.
 */

/** The boot cost classes the ladder measures. */
export type BootClass = "hot" | "warm" | "cold";

/** The isolation families the modalities group under. */
export type ModalityFamily =
  | "virtual"
  | "runner"
  | "packages"
  | "container"
  | "microvm"
  | "browser"
  | "mobile"
  | "confidential"
  | "emulator"
  | "pod"
  | "local"
  | "screen"
  | "wasm"
  | "fs"
  | "ram"
  | "delivery"
  | "language"
  | "sandbox"
  | "storage"
  | "network"
  | "build"
  | "ci"
  | "gpu";

/**
 * The honest wiring state of one modality — the truth ladder every record
 * declares and every report reads:
 * - live — the platform lanes drive it today: the run lane executes
 *   through it or the storage lane stores through it;
 * - host — the lane probes the host runtime and reports availability, the
 *   execution wiring is the next rung;
 * - planned — the declared catalog promise, no lane wires it yet and the
 *   record never pretends otherwise.
 */
export type ModalityState = "live" | "host" | "planned";

/** One sandbox modality of the registry. */
export interface ModalityRecord {
  /** The stable id the api and the config rows reference. */
  id: string;
  /** The display label (short, lowercase). */
  label: string;
  /** The isolation family the modality belongs to. */
  family: ModalityFamily;
  /** The isolation depth the family reaches (the capability contract). */
  isolation: "process" | "namespace" | "vm" | "hardware";
  /** The honest wiring state of the modality (the report never lies). */
  state: ModalityState;
  /** The driver modules the modality mounts when it boots. */
  drivers: readonly string[];
  /** The hardening gates the modality enforces by default. */
  hardening: readonly string[];
  /** The boot cost class (the measured budget lives in the boot ladder). */
  boot: BootClass;
  /** The measured boot budget in milliseconds (the ladder answers). */
  bootms: number;
  /** Whether the modality presents a gpu through the virtual drivers. */
  gpu: boolean;
  /** Whether the modality opens a network path (the hardened default is off). */
  network: boolean;
  /** The mime type the modality's api surface answers. */
  mime: string;
}

/** The boot budgets of the ladder, per class: the ceilings the records walk
 * under (firecracker 125 ms and gvisor about 200 ms ride warm, the full
 * machine images ride cold). */
export const BOOTLADDER: Readonly<Record<BootClass, number>> = Object.freeze({
  hot: 25,
  warm: 800,
  cold: 1500,
});

/** The ninety modality plan: the count the owner charged (the ninety
 * modalities of saddle acting for the system) and the registry answers —
 * the catalog walked from twenty through forty to the ninety law, and
 * this constant is the line the plan pins. */
export const MODALITYPLANCOUNT = 90;

/** The modality records: the catalog the join resolver reads. */
export const MODALITIES: readonly ModalityRecord[] = Object.freeze([
  /* ===== block: vm modalities — the virtual family (5) ===== */
  // the full machine with the virtual drivers
  {
    id: "virtualfull",
    label: "complete virtual",
    family: "virtual",
    isolation: "hardware",
    state: "live",
    drivers: ["virtualcpu", "virtualgpu", "virtualmemory"],
    hardening: ["profile-lock"],
    boot: "cold",
    bootms: BOOTLADDER.cold,
    gpu: true,
    network: true,
    mime: "application/vnd.devthink.sandbox+json",
  },
  {
    id: "virtualvgpu",
    label: "vgpu slice",
    family: "virtual",
    isolation: "hardware",
    state: "live",
    drivers: ["virtualgpu", "nvml-shim", "vfio"],
    hardening: ["mig-profile"],
    boot: "warm",
    bootms: 600,
    gpu: true,
    network: true,
    mime: "application/vnd.devthink.sandbox+json",
  },
  {
    id: "virtualscreen",
    label: "vm plus vnc",
    family: "screen",
    isolation: "vm",
    state: "live",
    drivers: ["virtualcpu", "virtualgpu", "xvfb", "looking-glass"],
    hardening: ["session-otp"],
    boot: "warm",
    bootms: 700,
    gpu: true,
    network: true,
    mime: "application/vnd.devthink.screen+json",
  },
  {
    id: "virtualdrivers",
    label: "virtual drivers",
    family: "virtual",
    isolation: "vm",
    state: "live",
    drivers: ["virtualcpu", "virtualgpu", "virtualmemory", "nvml-shim"],
    hardening: ["driver-quota"],
    boot: "warm",
    bootms: 250,
    gpu: true,
    network: false,
    mime: "application/vnd.devthink.sandbox+json",
  },
  {
    id: "virtualkvm",
    label: "kvm machine",
    family: "virtual",
    isolation: "hardware",
    state: "live",
    drivers: ["kvm", "virtualcpu"],
    hardening: ["clean-rootfs"],
    boot: "warm",
    bootms: 150,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.sandbox+json",
  },
  /* ===== block: runner modalities — the universal binary and the package runtimes (8) ===== */
  // the universal binary runner
  {
    id: "runneruniversal",
    label: "universal runner",
    family: "runner",
    isolation: "namespace",
    state: "live",
    drivers: ["binfmt", "bash"],
    hardening: ["read-only-root", "dropped-caps"],
    boot: "warm",
    bootms: BOOTLADDER.warm,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "runnernode",
    label: "node packages",
    family: "packages",
    isolation: "process",
    state: "live",
    drivers: ["node", "babel", "swc"],
    hardening: ["package-allowlist"],
    boot: "hot",
    bootms: BOOTLADDER.hot,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "runnerbun",
    label: "bun runtime",
    family: "packages",
    isolation: "process",
    state: "live",
    drivers: ["bun"],
    hardening: ["package-allowlist"],
    boot: "hot",
    bootms: 20,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "runnerdeno",
    label: "deno runtime",
    family: "packages",
    isolation: "process",
    state: "live",
    drivers: ["deno"],
    hardening: ["permission-map"],
    boot: "hot",
    bootms: 20,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "runnerwebpack",
    label: "webpack bundle",
    family: "packages",
    isolation: "process",
    state: "live",
    drivers: ["webpack", "swc"],
    hardening: ["bundle-allowlist"],
    boot: "hot",
    bootms: 18,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "runnerbabel",
    label: "babel transpile",
    family: "packages",
    isolation: "process",
    state: "live",
    drivers: ["babel"],
    hardening: ["plugin-allowlist"],
    boot: "hot",
    bootms: 15,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "runnerwasm",
    label: "wasm and wasi",
    family: "wasm",
    isolation: "process",
    state: "live",
    drivers: ["wasmer", "wasmedge"],
    hardening: ["capability-imports"],
    boot: "hot",
    bootms: 15,
    gpu: false,
    network: false,
    mime: "application/wasm",
  },
  {
    id: "runnerserverless",
    label: "v8 isolates",
    family: "runner",
    isolation: "process",
    state: "live",
    drivers: ["v8"],
    hardening: ["no-fs", "cpu-quota"],
    boot: "hot",
    bootms: 8,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  /* ===== block: runner modalities — the language toolchains (12) ===== */
  // the polyglot toolchains the engine mounts inside the sandbox (every
  // runner documented by its driver set — the exec lane drives each
  // through the host runtime, the honest probe answers per host)
  {
    id: "languagepython",
    label: "cpython runtime",
    family: "language",
    isolation: "process",
    state: "live",
    drivers: ["python3"],
    hardening: ["package-allowlist"],
    boot: "hot",
    bootms: 12,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "languagego",
    label: "golang toolchain",
    family: "language",
    isolation: "process",
    state: "live",
    drivers: ["go"],
    hardening: ["gopath-jail"],
    boot: "hot",
    bootms: 15,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "languagerust",
    label: "rustc toolchain",
    family: "language",
    isolation: "process",
    state: "live",
    drivers: ["rustc"],
    hardening: ["crate-allowlist"],
    boot: "hot",
    bootms: 18,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "languagecargo",
    label: "cargo builds",
    family: "language",
    isolation: "process",
    state: "live",
    drivers: ["cargo"],
    hardening: ["crate-allowlist"],
    boot: "hot",
    bootms: 20,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "languagev",
    label: "v compiler",
    family: "language",
    isolation: "process",
    state: "live",
    drivers: ["v"],
    hardening: ["package-allowlist"],
    boot: "hot",
    bootms: 15,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "languagejava",
    label: "jdk runtime",
    family: "language",
    isolation: "process",
    state: "live",
    drivers: ["java", "javac"],
    hardening: ["security-manager"],
    boot: "warm",
    bootms: 200,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "languagedotnet",
    label: "dotnet runtime",
    family: "language",
    isolation: "process",
    state: "live",
    drivers: ["dotnet"],
    hardening: ["assembly-allowlist"],
    boot: "warm",
    bootms: 150,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "languageruby",
    label: "ruby interpreter",
    family: "language",
    isolation: "process",
    state: "live",
    drivers: ["ruby"],
    hardening: ["gem-allowlist"],
    boot: "hot",
    bootms: 12,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "languagephp",
    label: "php interpreter",
    family: "language",
    isolation: "process",
    state: "live",
    drivers: ["php"],
    hardening: ["ini-lockdown"],
    boot: "hot",
    bootms: 12,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "languagelua",
    label: "lua interpreter",
    family: "language",
    isolation: "process",
    state: "live",
    drivers: ["lua"],
    hardening: ["sandbox-env"],
    boot: "hot",
    bootms: 8,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "languagezig",
    label: "zig toolchain",
    family: "language",
    isolation: "process",
    state: "live",
    drivers: ["zig"],
    hardening: ["package-allowlist"],
    boot: "hot",
    bootms: 15,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "languagenim",
    label: "nim compiler",
    family: "language",
    isolation: "process",
    state: "live",
    drivers: ["nim"],
    hardening: ["package-allowlist"],
    boot: "hot",
    bootms: 15,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  /* ===== block: runner modalities — the heavyweight runtimes and wasi (4) ===== */
  // the runtime extensions of the runner family: the heavyweight virtual
  // machines and the edge runtimes the join resolves beside the v8 isolate
  {
    id: "runtimejvm",
    label: "jvm hotspot",
    family: "runner",
    isolation: "process",
    state: "live",
    drivers: ["jvm", "jlink"],
    hardening: ["security-manager"],
    boot: "warm",
    bootms: 250,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "runtimeclr",
    label: "clr runtime",
    family: "runner",
    isolation: "process",
    state: "live",
    drivers: ["clr"],
    hardening: ["assembly-allowlist"],
    boot: "warm",
    bootms: 200,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "runtimeworkerd",
    label: "workerd runtime",
    family: "runner",
    isolation: "process",
    state: "live",
    drivers: ["workerd"],
    hardening: ["no-fs", "cpu-quota"],
    boot: "hot",
    bootms: 10,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
  },
  {
    id: "runnerwasi",
    label: "wasi preview",
    family: "wasm",
    isolation: "process",
    state: "live",
    drivers: ["wasmtime"],
    hardening: ["capability-imports"],
    boot: "hot",
    bootms: 15,
    gpu: false,
    network: false,
    mime: "application/wasm",
  },
  /* ===== block: sandbox modalities — the container family, docker hardened (5) ===== */
  // the profile pair and ghcr immutable
  {
    id: "containerdocker",
    label: "docker hardened",
    family: "container",
    isolation: "namespace",
    state: "live",
    drivers: ["docker"],
    hardening: ["no-network", "dropped-caps", "read-only-root", "pid-limit"],
    boot: "warm",
    bootms: 400,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.container+json",
  },
  {
    id: "containermax",
    label: "docker max profile",
    family: "container",
    isolation: "namespace",
    state: "live",
    drivers: ["docker"],
    hardening: ["no-network", "dropped-caps", "read-only-root"],
    boot: "warm",
    bootms: 600,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.container+json",
  },
  {
    id: "containerlite",
    label: "docker lite profile",
    family: "container",
    isolation: "namespace",
    state: "live",
    drivers: ["docker"],
    hardening: ["no-network", "dropped-caps", "read-only-root", "pid-limit", "memory-cap"],
    boot: "warm",
    bootms: 300,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.container+json",
  },
  {
    id: "containerghcr",
    label: "ghcr immutable",
    family: "container",
    isolation: "namespace",
    state: "live",
    drivers: ["docker", "ghcr"],
    hardening: ["immutable-root", "uuid-instance"],
    boot: "warm",
    bootms: 450,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.container+json",
  },
  {
    id: "containerrunsc",
    label: "gvisor sandboxed",
    family: "container",
    isolation: "namespace",
    state: "host",
    drivers: ["runsc"],
    hardening: ["user-kernel"],
    boot: "warm",
    bootms: BOOTLADDER.warm,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.container+json",
  },
  /* ===== block: sandbox modalities — the os jails (3) ===== */
  // the isolation ladder the engine walks below the container daemon,
  // short of a container daemon and below the microvm
  {
    id: "sandboxbubblewrap",
    label: "bubblewrap jail",
    family: "sandbox",
    isolation: "namespace",
    state: "live",
    drivers: ["bwrap"],
    hardening: ["user-namespace"],
    boot: "warm",
    bootms: 40,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.sandbox+json",
  },
  {
    id: "sandboxnsjail",
    label: "nsjail cell",
    family: "sandbox",
    isolation: "namespace",
    state: "live",
    drivers: ["nsjail"],
    hardening: ["cgroup-limit", "seccomp"],
    boot: "warm",
    bootms: 60,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.sandbox+json",
  },
  {
    id: "sandboxchroot",
    label: "chroot root",
    family: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["chroot"],
    hardening: ["read-only-root"],
    boot: "hot",
    bootms: 10,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.sandbox+json",
  },
  /* ===== block: sandbox modalities — the rootless and oci container extensions (4) ===== */
  // the rootless and the oci runtimes the lane can drive beside the docker
  // daemon
  {
    id: "containerpodman",
    label: "podman rootless",
    family: "container",
    isolation: "namespace",
    state: "live",
    drivers: ["podman"],
    hardening: ["rootless", "no-network", "dropped-caps"],
    boot: "warm",
    bootms: 350,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.container+json",
  },
  {
    id: "containercontainerd",
    label: "containerd supervisor",
    family: "container",
    isolation: "namespace",
    state: "live",
    drivers: ["containerd"],
    hardening: ["no-network", "dropped-caps"],
    boot: "warm",
    bootms: 300,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.container+json",
  },
  {
    id: "containerrunc",
    label: "runc process",
    family: "container",
    isolation: "namespace",
    state: "live",
    drivers: ["runc"],
    hardening: ["no-network", "dropped-caps", "read-only-root"],
    boot: "warm",
    bootms: 100,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.container+json",
  },
  {
    id: "containercrun",
    label: "crun process",
    family: "container",
    isolation: "namespace",
    state: "live",
    drivers: ["crun"],
    hardening: ["no-network", "dropped-caps", "read-only-root"],
    boot: "warm",
    bootms: 90,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.container+json",
  },
  /* ===== block: microvm modalities — per workflow, the e2b form (2) ===== */
  {
    id: "microvmfirecracker",
    label: "firecracker microvm",
    family: "microvm",
    isolation: "vm",
    state: "host",
    drivers: ["firecracker", "virtualcpu"],
    hardening: ["clean-rootfs", "injected-vcpu"],
    boot: "warm",
    bootms: 125,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.microvm+json",
  },
  {
    id: "microvmgpuless",
    label: "gpuless render",
    family: "microvm",
    isolation: "vm",
    state: "live",
    drivers: ["mesa-llvmpipe", "lavapipe", "rusticl", "xvfb"],
    hardening: ["clean-rootfs"],
    boot: "warm",
    bootms: 500,
    gpu: true,
    network: true,
    mime: "application/vnd.devthink.microvm+json",
  },
  /* ===== block: sandbox modalities — the pod family, one pod per session (1) ===== */
  // the competitor recipe
  {
    id: "podsession",
    label: "pod per session",
    family: "pod",
    isolation: "namespace",
    state: "host",
    drivers: ["k8s"],
    hardening: ["quota-check"],
    boot: "warm",
    bootms: 800,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.pod+json",
  },
  /* ===== block: hardware modalities — the confidential compute (2) ===== */
  // attested compute
  {
    id: "confidentialsevsnp",
    label: "sev snp",
    family: "confidential",
    isolation: "hardware",
    state: "host",
    drivers: ["sev-snp", "tpm"],
    hardening: ["attestation"],
    boot: "cold",
    bootms: 1200,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.confidential+json",
  },
  {
    id: "confidentialtdx",
    label: "tdx",
    family: "confidential",
    isolation: "hardware",
    state: "host",
    drivers: ["tdx", "tpm"],
    hardening: ["attestation"],
    boot: "cold",
    bootms: 1200,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.confidential+json",
  },
  /* ===== block: vm modalities — the emulator family, qemu full emulation (1) ===== */
  {
    id: "emulatorqemu",
    label: "qemu",
    family: "emulator",
    isolation: "vm",
    state: "host",
    drivers: ["qemu"],
    hardening: ["tcg"],
    boot: "cold",
    bootms: 900,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.emulator+json",
  },
  /* ===== block: browser modalities — the sandbox-side browser, never the person's (2) ===== */
  {
    id: "browserserver",
    label: "virtual browser",
    family: "browser",
    isolation: "namespace",
    state: "host",
    drivers: ["chromium-headless", "playwright"],
    hardening: ["sandboxed-tabs"],
    boot: "warm",
    bootms: 300,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.browser+json",
  },
  {
    id: "browserwebcontainer",
    label: "webcontainer server side",
    family: "browser",
    isolation: "namespace",
    state: "live",
    drivers: ["node", "wasm"],
    hardening: ["opt-in"],
    boot: "warm",
    bootms: 350,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.browser+json",
  },
  /* ===== block: hardware modalities — the virtual displays (2) ===== */
  // the displays the sandboxed ui renders through (never the visitor display)
  {
    id: "screenxvfb",
    label: "xvfb display",
    family: "screen",
    isolation: "process",
    state: "live",
    drivers: ["xvfb"],
    hardening: ["headless-only"],
    boot: "hot",
    bootms: 20,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.screen+json",
  },
  {
    id: "screenwayland",
    label: "wayland compositor",
    family: "screen",
    isolation: "process",
    state: "live",
    drivers: ["wayland", "wlroots"],
    hardening: ["headless-only"],
    boot: "warm",
    bootms: 150,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.screen+json",
  },
  /* ===== block: mobile modalities — the os images of the mobile lane (3) ===== */
  {
    id: "mobilecapacitor",
    label: "capacitor",
    family: "mobile",
    isolation: "namespace",
    state: "host",
    drivers: ["capacitor"],
    hardening: ["emulated-device"],
    boot: "warm",
    bootms: 600,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.mobile+json",
  },
  {
    id: "mobiletermux",
    label: "termux",
    family: "mobile",
    isolation: "namespace",
    state: "live",
    drivers: ["termux"],
    hardening: ["emulated-device"],
    boot: "warm",
    bootms: 550,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.mobile+json",
  },
  {
    id: "mobilepostmarketos",
    label: "postmarketos",
    family: "mobile",
    isolation: "vm",
    state: "host",
    drivers: ["qemu"],
    hardening: ["emulated-device"],
    boot: "cold",
    bootms: 1000,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.mobile+json",
  },
  /* ===== block: fs modalities — the vfs, the git objects and the cdn lane (3) ===== */
  {
    id: "fsvfs",
    label: "vfs",
    family: "fs",
    isolation: "process",
    state: "live",
    drivers: ["vfs"],
    hardening: ["chunk-catalog"],
    boot: "hot",
    bootms: 5,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.vfs+json",
  },
  {
    id: "fsgitobjects",
    label: "git objects vfs",
    family: "fs",
    isolation: "process",
    state: "live",
    drivers: ["git", "vfs"],
    hardening: ["content-hash", "chunk-catalog"],
    boot: "hot",
    bootms: 10,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.vfs+json",
  },
  {
    id: "deliverycdn",
    label: "cdn mirror",
    family: "delivery",
    isolation: "process",
    state: "live",
    drivers: ["vfs", "cdn"],
    hardening: ["inside-sandbox-fetch"],
    boot: "hot",
    bootms: 5,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.cdn+json",
  },
  /* ===== block: delivery modalities — the wire protocols (4) ===== */
  // the socket surface the self-hosted engine speaks, the lanes the
  // streamed answer rides
  {
    id: "deliverywss",
    label: "websocket streams",
    family: "delivery",
    isolation: "process",
    state: "live",
    drivers: ["wss"],
    hardening: ["origin-pin"],
    boot: "hot",
    bootms: 5,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.cdn+json",
  },
  {
    id: "deliverywebtransport",
    label: "webtransport lane",
    family: "delivery",
    isolation: "process",
    state: "live",
    drivers: ["webtransport", "http3"],
    hardening: ["origin-pin"],
    boot: "hot",
    bootms: 8,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.cdn+json",
  },
  {
    id: "deliverygrpc",
    label: "grpc lane",
    family: "delivery",
    isolation: "process",
    state: "live",
    drivers: ["grpc"],
    hardening: ["auth-token"],
    boot: "hot",
    bootms: 8,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.cdn+json",
  },
  {
    id: "deliverycapnproto",
    label: "capnproto lane",
    family: "delivery",
    isolation: "process",
    state: "live",
    drivers: ["capnproto"],
    hardening: ["auth-token"],
    boot: "hot",
    bootms: 6,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.cdn+json",
  },
  /* ===== block: storage modalities — the self-hosted vault backends (7) ===== */
  // the competitor recipe of the hosted buckets — sqlite and the wire
  // protocols and the s3-compatible daemons, every one a lane may mount
  // behind the vault
  {
    id: "storagesqlite",
    label: "sqlite vault",
    family: "storage",
    isolation: "process",
    state: "live",
    drivers: ["sqlite"],
    hardening: ["file-quota"],
    boot: "hot",
    bootms: 8,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.storage+json",
  },
  {
    id: "storagelibsql",
    label: "libsql vault",
    family: "storage",
    isolation: "process",
    state: "live",
    drivers: ["libsql"],
    hardening: ["file-quota"],
    boot: "hot",
    bootms: 10,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.storage+json",
  },
  {
    id: "storagemysql",
    label: "mysql wire vault",
    family: "storage",
    isolation: "process",
    state: "live",
    drivers: ["mysql-wire"],
    hardening: ["auth-token", "row-quota"],
    boot: "warm",
    bootms: 200,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.storage+json",
  },
  {
    id: "storagepostgres",
    label: "postgres wire vault",
    family: "storage",
    isolation: "process",
    state: "live",
    drivers: ["postgres-wire"],
    hardening: ["auth-token", "row-quota"],
    boot: "warm",
    bootms: 200,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.storage+json",
  },
  {
    id: "storages3",
    label: "s3 compatible vault",
    family: "storage",
    isolation: "process",
    state: "live",
    drivers: ["s3-api"],
    hardening: ["bucket-quota"],
    boot: "warm",
    bootms: 100,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.storage+json",
  },
  {
    id: "storageminio",
    label: "minio vault",
    family: "storage",
    isolation: "process",
    state: "live",
    drivers: ["minio"],
    hardening: ["bucket-quota"],
    boot: "warm",
    bootms: 300,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.storage+json",
  },
  {
    id: "storagegarage",
    label: "garage vault",
    family: "storage",
    isolation: "process",
    state: "live",
    drivers: ["garage"],
    hardening: ["bucket-quota"],
    boot: "warm",
    bootms: 300,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.storage+json",
  },
  /* ===== block: network modalities — the resolvers and the private tunnels (5) ===== */
  // the hardened default stays off until a lane asks
  {
    id: "networkdns",
    label: "dns resolver",
    family: "network",
    isolation: "process",
    state: "live",
    drivers: ["dns"],
    hardening: ["resolver-allowlist"],
    boot: "hot",
    bootms: 5,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.net+json",
  },
  {
    id: "networkdoh",
    label: "dns over https",
    family: "network",
    isolation: "process",
    state: "live",
    drivers: ["doh"],
    hardening: ["resolver-allowlist"],
    boot: "hot",
    bootms: 8,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.net+json",
  },
  {
    id: "networktor",
    label: "tor onion lane",
    family: "network",
    isolation: "process",
    state: "live",
    drivers: ["tor"],
    hardening: ["circuit-limit"],
    boot: "warm",
    bootms: 800,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.net+json",
  },
  {
    id: "networki2p",
    label: "i2p tunnel",
    family: "network",
    isolation: "process",
    state: "live",
    drivers: ["i2p"],
    hardening: ["tunnel-limit"],
    boot: "warm",
    bootms: 700,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.net+json",
  },
  {
    id: "networkwireguard",
    label: "wireguard tunnel",
    family: "network",
    isolation: "process",
    state: "live",
    drivers: ["wireguard"],
    hardening: ["peer-allowlist"],
    boot: "warm",
    bootms: 100,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.net+json",
  },
  /* ===== block: ram modalities — the storage-to-ram bridge (8) ===== */
  // the kernel recipes that swap, map and overlay the same bytes between
  // use flags (the memory ladder the corpus records: the tmpfs at the
  // microsecond, the memory map at five, the compressed ram at five hundred)
  {
    id: "ramtmpfs",
    label: "tmpfs",
    family: "ram",
    isolation: "process",
    state: "live",
    drivers: ["tmpfs"],
    hardening: ["oom-guard"],
    boot: "hot",
    bootms: 5,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.ram+json",
  },
  {
    id: "rammmap",
    label: "zero copy map",
    family: "ram",
    isolation: "process",
    state: "live",
    drivers: ["mmap"],
    hardening: ["oom-guard"],
    boot: "hot",
    bootms: 5,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.ram+json",
  },
  {
    id: "ramoverlayfs",
    label: "overlayfs",
    family: "ram",
    isolation: "process",
    state: "live",
    drivers: ["overlayfs"],
    hardening: ["oom-guard"],
    boot: "hot",
    bootms: 10,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.ram+json",
  },
  {
    id: "ramloopram",
    label: "loop ram disk",
    family: "ram",
    isolation: "process",
    state: "live",
    drivers: ["loop", "tmpfs"],
    hardening: ["oom-guard"],
    boot: "hot",
    bootms: 15,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.ram+json",
  },
  {
    id: "ramgitram",
    label: "git in ram",
    family: "ram",
    isolation: "process",
    state: "live",
    drivers: ["git", "mmap"],
    hardening: ["oom-guard"],
    boot: "hot",
    bootms: 20,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.ram+json",
  },
  {
    id: "ramzram",
    label: "zram zstd",
    family: "ram",
    isolation: "process",
    state: "live",
    drivers: ["zram", "zstd"],
    hardening: ["oom-guard"],
    boot: "hot",
    bootms: 25,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.ram+json",
  },
  {
    id: "ramzswap",
    label: "zswap",
    family: "ram",
    isolation: "process",
    state: "live",
    drivers: ["zswap"],
    hardening: ["oom-guard"],
    boot: "hot",
    bootms: 25,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.ram+json",
  },
  {
    id: "ramswapfile",
    label: "swapfile",
    family: "ram",
    isolation: "process",
    state: "live",
    drivers: ["swapfile"],
    hardening: ["oom-guard"],
    boot: "hot",
    bootms: 25,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.ram+json",
  },
  /* ===== block: build modalities — the build graphs (5) ===== */
  // the artifact lane the repositories compile through, inside the sandbox
  {
    id: "buildmake",
    label: "make builds",
    family: "build",
    isolation: "process",
    state: "live",
    drivers: ["make"],
    hardening: ["recipe-allowlist"],
    boot: "hot",
    bootms: 10,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.build+json",
  },
  {
    id: "buildbazel",
    label: "bazel builds",
    family: "build",
    isolation: "process",
    state: "live",
    drivers: ["bazel"],
    hardening: ["remote-cache-pin"],
    boot: "warm",
    bootms: 500,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.build+json",
  },
  {
    id: "buildbuck",
    label: "buck builds",
    family: "build",
    isolation: "process",
    state: "live",
    drivers: ["buck"],
    hardening: ["remote-cache-pin"],
    boot: "warm",
    bootms: 400,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.build+json",
  },
  {
    id: "buildninja",
    label: "ninja builds",
    family: "build",
    isolation: "process",
    state: "live",
    drivers: ["ninja"],
    hardening: ["recipe-allowlist"],
    boot: "hot",
    bootms: 15,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.build+json",
  },
  {
    id: "buildturborepo",
    label: "turborepo builds",
    family: "build",
    isolation: "process",
    state: "live",
    drivers: ["turbo"],
    hardening: ["remote-cache-pin"],
    boot: "warm",
    bootms: 300,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.build+json",
  },
  /* ===== block: ci modalities — the self-hosted runners (2) ===== */
  // the repository pipelines the engine drives (no hosted ci dependency —
  // the runner rides the same self-hosted law)
  {
    id: "ciactions",
    label: "actions runner",
    family: "ci",
    isolation: "process",
    state: "live",
    drivers: ["actions-runner"],
    hardening: ["workflow-allowlist"],
    boot: "warm",
    bootms: 400,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.ci+json",
  },
  {
    id: "cigitlab",
    label: "gitlab runner",
    family: "ci",
    isolation: "process",
    state: "live",
    drivers: ["gitlab-runner"],
    hardening: ["workflow-allowlist"],
    boot: "warm",
    bootms: 400,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.ci+json",
  },
  /* ===== block: hardware modalities — the virtual graphics (1) ===== */
  // the declared slice — the record never claims a host gpu it does not mount
  {
    id: "gpuvirgl",
    label: "virgl render",
    family: "gpu",
    isolation: "vm",
    state: "live",
    drivers: ["virgl", "virtio-gpu"],
    hardening: ["context-quota"],
    boot: "warm",
    bootms: 400,
    gpu: true,
    network: true,
    mime: "application/vnd.devthink.gpu+json",
  },
  /* ===== block: local modalities — the explicit opt-in (1) ===== */
  // the only lane that may touch the visitor machine, and only under
  // declared consent
  {
    id: "localoptin",
    label: "local opt in",
    family: "local",
    isolation: "process",
    state: "live",
    drivers: [],
    hardening: ["explicit-consent"],
    boot: "hot",
    bootms: 10,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.local+json",
  },
]);

/** The count the catalog answers — derived from the records' real length
 * (never a hardcoded line, so the count cannot drift from the array) and
 * the line the tests pin against the plan the owner charged. */
export const MODALITY_COUNT = MODALITIES.length;

/** The honest plan report: what the catalog holds against the ninety
 * plan —
 * the counts per state and whether the plan is answered. The report is the
 * truth surface the lanes and the tests read; it never counts a record as
 * more than its state declares. */
export interface ModalityPlanReport {
  /** The plan line the owner charged (the ninety modalities). */
  plancount: number;
  /** The records the catalog holds. */
  catalogcount: number;
  /** The records the platform lanes drive today. */
  live: number;
  /** The records whose host runtime the lane probes. */
  host: number;
  /** The declared promises no lane wires yet. */
  planned: number;
  /** Whether the catalog answers the plan count. */
  plananswered: boolean;
}

/** planreport — the honest census of the registry against the ninety plan:
 * the counts per state and the plan verdict, computed from the records
 * (never hardcoded, so the report cannot drift from the catalog). */
export function planreport(): ModalityPlanReport {
  const counts: Record<ModalityState, number> = { live: 0, host: 0, planned: 0 };
  for (const modality of MODALITIES) counts[modality.state] += 1;
  return {
    plancount: MODALITYPLANCOUNT,
    catalogcount: MODALITIES.length,
    live: counts.live,
    host: counts.host,
    planned: counts.planned,
    plananswered: MODALITIES.length >= MODALITYPLANCOUNT,
  };
}

/** The base profiles the owner names (the config wave makes them editable). */
export type BaseProfile = "max" | "balanced" | "lite";

/** The join request: what the workload asks, never a modality name. */
export interface JoinRequest {
  /** The base profile the sandbox boots under. */
  base: BaseProfile;
  /** Whether the workload needs a gpu path through the virtual drivers. */
  gpu: boolean;
  /** Whether the workload needs a network path. */
  network: boolean;
  /** The isolation depth the workload demands at minimum. */
  isolation?: ModalityRecord["isolation"];
  /** The boot budget the workload tolerates, in milliseconds. */
  bootbudget?: number;
  /** The family the workload prefers (the first filter when given). */
  family?: ModalityFamily;
}

/**
 * Resolves the modality join for a request: the records that satisfy every
 * demand, ordered by boot cost then isolation depth — the platform answers
 * the join, the person never names a modality (the nuclear law).
 *
 * @param request the workload demands.
 * @returns the modality records that satisfy the join, best candidate first.
 */
export function resolvejoin(request: JoinRequest): readonly ModalityRecord[] {
  const budget = request.bootbudget ?? BOOTLADDER.cold;
  const order: Record<ModalityRecord["isolation"], number> = { process: 0, namespace: 1, vm: 2, hardware: 3 };
  return MODALITIES.filter((modality) => {
    if (request.family && modality.family !== request.family) return false;
    if (request.gpu && !modality.gpu) return false;
    if (request.network && !modality.network) return false;
    if (request.isolation && order[modality.isolation] < order[request.isolation]) return false;
    if (modality.bootms > budget) return false;
    // the lite base keeps the heavy machine images out of the answer
    if (request.base === "lite" && modality.isolation === "hardware") return false;
    return true;
  }).sort((a, b) => a.bootms - b.bootms || order[a.isolation] - order[b.isolation]);
}

/**
 * Answers one modality by id (the config rows and the api carry ids).
 *
 * @param id the modality id.
 * @returns the record, or undefined when the id is unknown.
 */
export function getmodality(id: string): ModalityRecord | undefined {
  return MODALITIES.find((modality) => modality.id === id);
}
