// # modalityregistry — the catalog of the sandbox modalities the saddle
// engine opens (root layer, wave SV1). One record per modality: the
// isolation family, the driver requirements it mounts, the boot cost class,
// the hardening gates it carries and the mime contract it answers. The
// registry is the spine of the "fifty modalities" promise: the workload
// never chooses by name — the join resolver reads the request (isolation,
// gpu, network, boot budget) and answers the modality set that satisfies
// it, so the person chooses none and the platform resolves the join of all
// (the nuclear modality law). Pure data and pure functions: zero storage,
// zero node-only imports, the browser-pure bundle keeps carrying it.

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
  | "delivery";

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

/** The modality records: the catalog the join resolver reads. */
export const MODALITIES: readonly ModalityRecord[] = Object.freeze([
  // the virtual family: the full machine with the virtual drivers
  { id: "virtual-full", label: "complete virtual", family: "virtual", isolation: "hardware", drivers: ["virtualcpu", "virtualgpu", "virtualmemory"], hardening: ["profile-lock"], boot: "cold", bootms: BOOTLADDER.cold, gpu: true, network: true, mime: "application/vnd.devthink.sandbox+json" },
  { id: "virtual-vgpu", label: "vgpu slice", family: "virtual", isolation: "hardware", drivers: ["virtualgpu", "nvml-shim", "vfio"], hardening: ["mig-profile"], boot: "warm", bootms: 600, gpu: true, network: true, mime: "application/vnd.devthink.sandbox+json" },
  { id: "virtual-screen", label: "vm plus vnc", family: "screen", isolation: "vm", drivers: ["virtualcpu", "virtualgpu", "xvfb", "looking-glass"], hardening: ["session-otp"], boot: "warm", bootms: 700, gpu: true, network: true, mime: "application/vnd.devthink.screen+json" },
  // the runner family: the universal binary runner
  { id: "runner-universal", label: "universal runner", family: "runner", isolation: "namespace", drivers: ["binfmt"], hardening: ["read-only-root", "dropped-caps"], boot: "warm", bootms: BOOTLADDER.warm, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "runner-node", label: "node packages", family: "packages", isolation: "process", drivers: ["node", "babel", "swc"], hardening: ["package-allowlist"], boot: "hot", bootms: BOOTLADDER.hot, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "runner-wasm", label: "wasm and wasi", family: "wasm", isolation: "process", drivers: ["wasmer", "wasmedge"], hardening: ["capability-imports"], boot: "hot", bootms: 15, gpu: false, network: false, mime: "application/wasm" },
  { id: "runner-serverless", label: "v8 isolates", family: "runner", isolation: "process", drivers: ["v8"], hardening: ["no-fs", "cpu-quota"], boot: "hot", bootms: 8, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  // the container family: docker hardened and ghcr immutable
  { id: "container-docker", label: "docker hardened", family: "container", isolation: "namespace", drivers: ["docker"], hardening: ["no-network", "dropped-caps", "read-only-root", "pid-limit"], boot: "warm", bootms: 400, gpu: false, network: false, mime: "application/vnd.devthink.container+json" },
  { id: "container-ghcr", label: "ghcr immutable", family: "container", isolation: "namespace", drivers: ["docker", "ghcr"], hardening: ["immutable-root", "uuid-instance"], boot: "warm", bootms: 450, gpu: false, network: true, mime: "application/vnd.devthink.container+json" },
  { id: "container-runsc", label: "gvisor sandboxed", family: "container", isolation: "namespace", drivers: ["runsc"], hardening: ["user-kernel"], boot: "warm", bootms: BOOTLADDER.warm, gpu: false, network: true, mime: "application/vnd.devthink.container+json" },
  // the microvm family: per workflow, the e2b form
  { id: "microvm-firecracker", label: "firecracker microvm", family: "microvm", isolation: "vm", drivers: ["firecracker", "virtualcpu"], hardening: ["clean-rootfs", "injected-vcpu"], boot: "warm", bootms: 125, gpu: false, network: true, mime: "application/vnd.devthink.microvm+json" },
  { id: "microvm-gpuless", label: "gpuless render", family: "microvm", isolation: "vm", drivers: ["mesa-llvmpipe", "lavapipe", "rusticl", "xvfb"], hardening: ["clean-rootfs"], boot: "warm", bootms: 500, gpu: true, network: true, mime: "application/vnd.devthink.microvm+json" },
  // the pod family: one pod per session (the competitor recipe)
  { id: "pod-session", label: "pod per session", family: "pod", isolation: "namespace", drivers: ["k8s"], hardening: ["quota-check"], boot: "warm", bootms: 800, gpu: false, network: true, mime: "application/vnd.devthink.pod+json" },
  // the confidential family: attested compute
  { id: "confidential-sevsnp", label: "sev snp", family: "confidential", isolation: "hardware", drivers: ["sev-snp", "tpm"], hardening: ["attestation"], boot: "cold", bootms: 1200, gpu: false, network: true, mime: "application/vnd.devthink.confidential+json" },
  { id: "confidential-tdx", label: "tdx", family: "confidential", isolation: "hardware", drivers: ["tdx", "tpm"], hardening: ["attestation"], boot: "cold", bootms: 1200, gpu: false, network: true, mime: "application/vnd.devthink.confidential+json" },
  // the emulator family: qemu full emulation
  { id: "emulator-qemu", label: "qemu", family: "emulator", isolation: "vm", drivers: ["qemu"], hardening: ["tcg"], boot: "cold", bootms: 900, gpu: false, network: true, mime: "application/vnd.devthink.emulator+json" },
  // the browser family: the sandbox-side browser (never the person's)
  { id: "browser-server", label: "virtual browser", family: "browser", isolation: "namespace", drivers: ["chromium-headless", "playwright"], hardening: ["sandboxed-tabs"], boot: "warm", bootms: 300, gpu: false, network: true, mime: "application/vnd.devthink.browser+json" },
  { id: "browser-webcontainer", label: "webcontainer server side", family: "browser", isolation: "namespace", drivers: ["node", "wasm"], hardening: ["opt-in"], boot: "warm", bootms: 350, gpu: false, network: true, mime: "application/vnd.devthink.browser+json" },
  // the mobile family: the os images of the mobile lane
  { id: "mobile-capacitor", label: "capacitor", family: "mobile", isolation: "namespace", drivers: ["capacitor"], hardening: ["emulated-device"], boot: "warm", bootms: 600, gpu: false, network: true, mime: "application/vnd.devthink.mobile+json" },
  { id: "mobile-termux", label: "termux", family: "mobile", isolation: "namespace", drivers: ["termux"], hardening: ["emulated-device"], boot: "warm", bootms: 550, gpu: false, network: true, mime: "application/vnd.devthink.mobile+json" },
  { id: "mobile-postmarketos", label: "postmarketos", family: "mobile", isolation: "vm", drivers: ["qemu"], hardening: ["emulated-device"], boot: "cold", bootms: 1000, gpu: false, network: true, mime: "application/vnd.devthink.mobile+json" },
  // the fs and delivery families: the vfs and the cdn lane
  { id: "fs-vfs", label: "vfs", family: "fs", isolation: "process", drivers: ["vfs"], hardening: ["chunk-catalog"], boot: "hot", bootms: 5, gpu: false, network: false, mime: "application/vnd.devthink.vfs+json" },
  { id: "delivery-cdn", label: "cdn mirror", family: "delivery", isolation: "process", drivers: ["vfs", "cdn"], hardening: ["inside-sandbox-fetch"], boot: "hot", bootms: 5, gpu: false, network: true, mime: "application/vnd.devthink.cdn+json" },
  { id: "local-optin", label: "local opt in", family: "local", isolation: "process", drivers: [], hardening: ["explicit-consent"], boot: "hot", bootms: 10, gpu: false, network: false, mime: "application/vnd.devthink.local+json" },
]);

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
