// # modalityregistry — the catalog of the sandbox modalities the saddle
// engine opens (root layer, wave SV1). One record per modality: the
// isolation family, the driver requirements it mounts, the boot cost class,
// the hardening gates it carries, the mime contract it answers and the
// honest state of its wiring. The registry is the spine of the ninety
// modality plan (the owner's law: the ninety modalities of saddle act for
// the system, nothing touches the visitor machine): the workload never
// chooses by name — the join resolver reads the request (isolation, gpu,
// network, boot budget) and answers the modality set that satisfies it, so
// the person chooses none and the platform resolves the join of all (the
// nuclear modality law). Every record declares its state — live, host or
// planned — so the report never lies: a lane that does not wire a modality
// says so instead of pretending. Pure data and pure functions: zero
// storage, zero node-only imports, the browser-pure bundle keeps carrying
// it.

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
  // the virtual family: the full machine with the virtual drivers
  { id: "virtual-full", label: "complete virtual", family: "virtual", isolation: "hardware", state: "planned", drivers: ["virtualcpu", "virtualgpu", "virtualmemory"], hardening: ["profile-lock"], boot: "cold", bootms: BOOTLADDER.cold, gpu: true, network: true, mime: "application/vnd.devthink.sandbox+json" },
  { id: "virtual-vgpu", label: "vgpu slice", family: "virtual", isolation: "hardware", state: "planned", drivers: ["virtualgpu", "nvml-shim", "vfio"], hardening: ["mig-profile"], boot: "warm", bootms: 600, gpu: true, network: true, mime: "application/vnd.devthink.sandbox+json" },
  { id: "virtual-screen", label: "vm plus vnc", family: "screen", isolation: "vm", state: "planned", drivers: ["virtualcpu", "virtualgpu", "xvfb", "looking-glass"], hardening: ["session-otp"], boot: "warm", bootms: 700, gpu: true, network: true, mime: "application/vnd.devthink.screen+json" },
  { id: "virtual-drivers", label: "virtual drivers", family: "virtual", isolation: "vm", state: "planned", drivers: ["virtualcpu", "virtualgpu", "virtualmemory", "nvml-shim"], hardening: ["driver-quota"], boot: "warm", bootms: 250, gpu: true, network: false, mime: "application/vnd.devthink.sandbox+json" },
  { id: "virtual-kvm", label: "kvm machine", family: "virtual", isolation: "hardware", state: "planned", drivers: ["kvm", "virtualcpu"], hardening: ["clean-rootfs"], boot: "warm", bootms: 150, gpu: false, network: true, mime: "application/vnd.devthink.sandbox+json" },
  // the runner family: the universal binary runner
  { id: "runner-universal", label: "universal runner", family: "runner", isolation: "namespace", state: "live", drivers: ["binfmt", "bash"], hardening: ["read-only-root", "dropped-caps"], boot: "warm", bootms: BOOTLADDER.warm, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "runner-node", label: "node packages", family: "packages", isolation: "process", state: "live", drivers: ["node", "babel", "swc"], hardening: ["package-allowlist"], boot: "hot", bootms: BOOTLADDER.hot, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "runner-bun", label: "bun runtime", family: "packages", isolation: "process", state: "live", drivers: ["bun"], hardening: ["package-allowlist"], boot: "hot", bootms: 20, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "runner-deno", label: "deno runtime", family: "packages", isolation: "process", state: "live", drivers: ["deno"], hardening: ["permission-map"], boot: "hot", bootms: 20, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "runner-webpack", label: "webpack bundle", family: "packages", isolation: "process", state: "live", drivers: ["webpack", "swc"], hardening: ["bundle-allowlist"], boot: "hot", bootms: 18, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "runner-babel", label: "babel transpile", family: "packages", isolation: "process", state: "live", drivers: ["babel"], hardening: ["plugin-allowlist"], boot: "hot", bootms: 15, gpu: false, network: false, mime: "application/vnd.devthink.run+json" },
  { id: "runner-wasm", label: "wasm and wasi", family: "wasm", isolation: "process", state: "live", drivers: ["wasmer", "wasmedge"], hardening: ["capability-imports"], boot: "hot", bootms: 15, gpu: false, network: false, mime: "application/wasm" },
  { id: "runner-serverless", label: "v8 isolates", family: "runner", isolation: "process", state: "live", drivers: ["v8"], hardening: ["no-fs", "cpu-quota"], boot: "hot", bootms: 8, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  // the language family: the polyglot toolchains the engine mounts inside
  // the sandbox (every runner documented by its driver set — the exec lane
  // drives each through the host runtime, the honest probe answers per host)
  { id: "language-python", label: "cpython runtime", family: "language", isolation: "process", state: "live", drivers: ["python3"], hardening: ["package-allowlist"], boot: "hot", bootms: 12, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "language-go", label: "golang toolchain", family: "language", isolation: "process", state: "live", drivers: ["go"], hardening: ["gopath-jail"], boot: "hot", bootms: 15, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "language-rust", label: "rustc toolchain", family: "language", isolation: "process", state: "live", drivers: ["rustc"], hardening: ["crate-allowlist"], boot: "hot", bootms: 18, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "language-cargo", label: "cargo builds", family: "language", isolation: "process", state: "live", drivers: ["cargo"], hardening: ["crate-allowlist"], boot: "hot", bootms: 20, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "language-v", label: "v compiler", family: "language", isolation: "process", state: "live", drivers: ["v"], hardening: ["package-allowlist"], boot: "hot", bootms: 15, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "language-java", label: "jdk runtime", family: "language", isolation: "process", state: "live", drivers: ["java", "javac"], hardening: ["security-manager"], boot: "warm", bootms: 200, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "language-dotnet", label: "dotnet runtime", family: "language", isolation: "process", state: "live", drivers: ["dotnet"], hardening: ["assembly-allowlist"], boot: "warm", bootms: 150, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "language-ruby", label: "ruby interpreter", family: "language", isolation: "process", state: "live", drivers: ["ruby"], hardening: ["gem-allowlist"], boot: "hot", bootms: 12, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "language-php", label: "php interpreter", family: "language", isolation: "process", state: "live", drivers: ["php"], hardening: ["ini-lockdown"], boot: "hot", bootms: 12, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "language-lua", label: "lua interpreter", family: "language", isolation: "process", state: "live", drivers: ["lua"], hardening: ["sandbox-env"], boot: "hot", bootms: 8, gpu: false, network: false, mime: "application/vnd.devthink.run+json" },
  { id: "language-zig", label: "zig toolchain", family: "language", isolation: "process", state: "live", drivers: ["zig"], hardening: ["package-allowlist"], boot: "hot", bootms: 15, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "language-nim", label: "nim compiler", family: "language", isolation: "process", state: "live", drivers: ["nim"], hardening: ["package-allowlist"], boot: "hot", bootms: 15, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  // the runtime extensions of the runner family: the heavyweight virtual
  // machines and the edge runtimes the join resolves beside the v8 isolate
  { id: "runtime-jvm", label: "jvm hotspot", family: "runner", isolation: "process", state: "live", drivers: ["jvm", "jlink"], hardening: ["security-manager"], boot: "warm", bootms: 250, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "runtime-clr", label: "clr runtime", family: "runner", isolation: "process", state: "planned", drivers: ["clr"], hardening: ["assembly-allowlist"], boot: "warm", bootms: 200, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "runtime-workerd", label: "workerd runtime", family: "runner", isolation: "process", state: "planned", drivers: ["workerd"], hardening: ["no-fs", "cpu-quota"], boot: "hot", bootms: 10, gpu: false, network: true, mime: "application/vnd.devthink.run+json" },
  { id: "runner-wasi", label: "wasi preview", family: "wasm", isolation: "process", state: "live", drivers: ["wasmtime"], hardening: ["capability-imports"], boot: "hot", bootms: 15, gpu: false, network: false, mime: "application/wasm" },
  // the container family: docker hardened, the profile pair and ghcr immutable
  { id: "container-docker", label: "docker hardened", family: "container", isolation: "namespace", state: "live", drivers: ["docker"], hardening: ["no-network", "dropped-caps", "read-only-root", "pid-limit"], boot: "warm", bootms: 400, gpu: false, network: false, mime: "application/vnd.devthink.container+json" },
  { id: "container-max", label: "docker max profile", family: "container", isolation: "namespace", state: "planned", drivers: ["docker"], hardening: ["no-network", "dropped-caps", "read-only-root"], boot: "warm", bootms: 600, gpu: false, network: false, mime: "application/vnd.devthink.container+json" },
  { id: "container-lite", label: "docker lite profile", family: "container", isolation: "namespace", state: "planned", drivers: ["docker"], hardening: ["no-network", "dropped-caps", "read-only-root", "pid-limit", "memory-cap"], boot: "warm", bootms: 300, gpu: false, network: false, mime: "application/vnd.devthink.container+json" },
  { id: "container-ghcr", label: "ghcr immutable", family: "container", isolation: "namespace", state: "planned", drivers: ["docker", "ghcr"], hardening: ["immutable-root", "uuid-instance"], boot: "warm", bootms: 450, gpu: false, network: true, mime: "application/vnd.devthink.container+json" },
  { id: "container-runsc", label: "gvisor sandboxed", family: "container", isolation: "namespace", state: "host", drivers: ["runsc"], hardening: ["user-kernel"], boot: "warm", bootms: BOOTLADDER.warm, gpu: false, network: true, mime: "application/vnd.devthink.container+json" },
  // the sandbox family: the os jails short of a container daemon (the
  // isolation ladder the engine walks below the microvm)
  { id: "sandbox-bubblewrap", label: "bubblewrap jail", family: "sandbox", isolation: "namespace", state: "planned", drivers: ["bwrap"], hardening: ["user-namespace"], boot: "warm", bootms: 40, gpu: false, network: false, mime: "application/vnd.devthink.sandbox+json" },
  { id: "sandbox-nsjail", label: "nsjail cell", family: "sandbox", isolation: "namespace", state: "planned", drivers: ["nsjail"], hardening: ["cgroup-limit", "seccomp"], boot: "warm", bootms: 60, gpu: false, network: false, mime: "application/vnd.devthink.sandbox+json" },
  { id: "sandbox-chroot", label: "chroot root", family: "sandbox", isolation: "process", state: "planned", drivers: ["chroot"], hardening: ["read-only-root"], boot: "hot", bootms: 10, gpu: false, network: false, mime: "application/vnd.devthink.sandbox+json" },
  // the container extensions: the rootless and the oci runtimes the lane
  // can drive beside the docker daemon
  { id: "container-podman", label: "podman rootless", family: "container", isolation: "namespace", state: "planned", drivers: ["podman"], hardening: ["rootless", "no-network", "dropped-caps"], boot: "warm", bootms: 350, gpu: false, network: false, mime: "application/vnd.devthink.container+json" },
  { id: "container-containerd", label: "containerd supervisor", family: "container", isolation: "namespace", state: "planned", drivers: ["containerd"], hardening: ["no-network", "dropped-caps"], boot: "warm", bootms: 300, gpu: false, network: false, mime: "application/vnd.devthink.container+json" },
  { id: "container-runc", label: "runc process", family: "container", isolation: "namespace", state: "planned", drivers: ["runc"], hardening: ["no-network", "dropped-caps", "read-only-root"], boot: "warm", bootms: 100, gpu: false, network: false, mime: "application/vnd.devthink.container+json" },
  { id: "container-crun", label: "crun process", family: "container", isolation: "namespace", state: "planned", drivers: ["crun"], hardening: ["no-network", "dropped-caps", "read-only-root"], boot: "warm", bootms: 90, gpu: false, network: false, mime: "application/vnd.devthink.container+json" },
  // the microvm family: per workflow, the e2b form
  { id: "microvm-firecracker", label: "firecracker microvm", family: "microvm", isolation: "vm", state: "host", drivers: ["firecracker", "virtualcpu"], hardening: ["clean-rootfs", "injected-vcpu"], boot: "warm", bootms: 125, gpu: false, network: true, mime: "application/vnd.devthink.microvm+json" },
  { id: "microvm-gpuless", label: "gpuless render", family: "microvm", isolation: "vm", state: "planned", drivers: ["mesa-llvmpipe", "lavapipe", "rusticl", "xvfb"], hardening: ["clean-rootfs"], boot: "warm", bootms: 500, gpu: true, network: true, mime: "application/vnd.devthink.microvm+json" },
  // the pod family: one pod per session (the competitor recipe)
  { id: "pod-session", label: "pod per session", family: "pod", isolation: "namespace", state: "planned", drivers: ["k8s"], hardening: ["quota-check"], boot: "warm", bootms: 800, gpu: false, network: true, mime: "application/vnd.devthink.pod+json" },
  // the confidential family: attested compute
  { id: "confidential-sevsnp", label: "sev snp", family: "confidential", isolation: "hardware", state: "planned", drivers: ["sev-snp", "tpm"], hardening: ["attestation"], boot: "cold", bootms: 1200, gpu: false, network: true, mime: "application/vnd.devthink.confidential+json" },
  { id: "confidential-tdx", label: "tdx", family: "confidential", isolation: "hardware", state: "planned", drivers: ["tdx", "tpm"], hardening: ["attestation"], boot: "cold", bootms: 1200, gpu: false, network: true, mime: "application/vnd.devthink.confidential+json" },
  // the emulator family: qemu full emulation
  { id: "emulator-qemu", label: "qemu", family: "emulator", isolation: "vm", state: "host", drivers: ["qemu"], hardening: ["tcg"], boot: "cold", bootms: 900, gpu: false, network: true, mime: "application/vnd.devthink.emulator+json" },
  // the browser family: the sandbox-side browser (never the person's)
  { id: "browser-server", label: "virtual browser", family: "browser", isolation: "namespace", state: "planned", drivers: ["chromium-headless", "playwright"], hardening: ["sandboxed-tabs"], boot: "warm", bootms: 300, gpu: false, network: true, mime: "application/vnd.devthink.browser+json" },
  { id: "browser-webcontainer", label: "webcontainer server side", family: "browser", isolation: "namespace", state: "planned", drivers: ["node", "wasm"], hardening: ["opt-in"], boot: "warm", bootms: 350, gpu: false, network: true, mime: "application/vnd.devthink.browser+json" },
  // the screen family extensions: the virtual displays the sandboxed ui
  // renders through (never the visitor display)
  { id: "screen-xvfb", label: "xvfb display", family: "screen", isolation: "process", state: "planned", drivers: ["xvfb"], hardening: ["headless-only"], boot: "hot", bootms: 20, gpu: false, network: false, mime: "application/vnd.devthink.screen+json" },
  { id: "screen-wayland", label: "wayland compositor", family: "screen", isolation: "process", state: "planned", drivers: ["wayland", "wlroots"], hardening: ["headless-only"], boot: "warm", bootms: 150, gpu: false, network: false, mime: "application/vnd.devthink.screen+json" },
  // the mobile family: the os images of the mobile lane
  { id: "mobile-capacitor", label: "capacitor", family: "mobile", isolation: "namespace", state: "planned", drivers: ["capacitor"], hardening: ["emulated-device"], boot: "warm", bootms: 600, gpu: false, network: true, mime: "application/vnd.devthink.mobile+json" },
  { id: "mobile-termux", label: "termux", family: "mobile", isolation: "namespace", state: "planned", drivers: ["termux"], hardening: ["emulated-device"], boot: "warm", bootms: 550, gpu: false, network: true, mime: "application/vnd.devthink.mobile+json" },
  { id: "mobile-postmarketos", label: "postmarketos", family: "mobile", isolation: "vm", state: "planned", drivers: ["qemu"], hardening: ["emulated-device"], boot: "cold", bootms: 1000, gpu: false, network: true, mime: "application/vnd.devthink.mobile+json" },
  // the fs and delivery families: the vfs, the git objects and the cdn lane
  { id: "fs-vfs", label: "vfs", family: "fs", isolation: "process", state: "live", drivers: ["vfs"], hardening: ["chunk-catalog"], boot: "hot", bootms: 5, gpu: false, network: false, mime: "application/vnd.devthink.vfs+json" },
  { id: "fs-gitobjects", label: "git objects vfs", family: "fs", isolation: "process", state: "live", drivers: ["git", "vfs"], hardening: ["content-hash", "chunk-catalog"], boot: "hot", bootms: 10, gpu: false, network: true, mime: "application/vnd.devthink.vfs+json" },
  { id: "delivery-cdn", label: "cdn mirror", family: "delivery", isolation: "process", state: "planned", drivers: ["vfs", "cdn"], hardening: ["inside-sandbox-fetch"], boot: "hot", bootms: 5, gpu: false, network: true, mime: "application/vnd.devthink.cdn+json" },
  // the delivery protocol extensions: the wire lanes the streamed answer
  // rides (the socket surface the self-hosted engine speaks)
  { id: "delivery-wss", label: "websocket streams", family: "delivery", isolation: "process", state: "planned", drivers: ["wss"], hardening: ["origin-pin"], boot: "hot", bootms: 5, gpu: false, network: true, mime: "application/vnd.devthink.cdn+json" },
  { id: "delivery-webtransport", label: "webtransport lane", family: "delivery", isolation: "process", state: "planned", drivers: ["webtransport", "http3"], hardening: ["origin-pin"], boot: "hot", bootms: 8, gpu: false, network: true, mime: "application/vnd.devthink.cdn+json" },
  { id: "delivery-grpc", label: "grpc lane", family: "delivery", isolation: "process", state: "planned", drivers: ["grpc"], hardening: ["auth-token"], boot: "hot", bootms: 8, gpu: false, network: true, mime: "application/vnd.devthink.cdn+json" },
  { id: "delivery-capnproto", label: "capnproto lane", family: "delivery", isolation: "process", state: "planned", drivers: ["capnproto"], hardening: ["auth-token"], boot: "hot", bootms: 6, gpu: false, network: true, mime: "application/vnd.devthink.cdn+json" },
  // the storage family: the self-hosted vault backends (the competitor
  // recipe of the hosted buckets — sqlite and the wire protocols and the
  // s3-compatible daemons, every one a lane may mount behind the vault)
  { id: "storage-sqlite", label: "sqlite vault", family: "storage", isolation: "process", state: "live", drivers: ["sqlite"], hardening: ["file-quota"], boot: "hot", bootms: 8, gpu: false, network: false, mime: "application/vnd.devthink.storage+json" },
  { id: "storage-libsql", label: "libsql vault", family: "storage", isolation: "process", state: "planned", drivers: ["libsql"], hardening: ["file-quota"], boot: "hot", bootms: 10, gpu: false, network: true, mime: "application/vnd.devthink.storage+json" },
  { id: "storage-mysql", label: "mysql wire vault", family: "storage", isolation: "process", state: "planned", drivers: ["mysql-wire"], hardening: ["auth-token", "row-quota"], boot: "warm", bootms: 200, gpu: false, network: true, mime: "application/vnd.devthink.storage+json" },
  { id: "storage-postgres", label: "postgres wire vault", family: "storage", isolation: "process", state: "planned", drivers: ["postgres-wire"], hardening: ["auth-token", "row-quota"], boot: "warm", bootms: 200, gpu: false, network: true, mime: "application/vnd.devthink.storage+json" },
  { id: "storage-s3", label: "s3 compatible vault", family: "storage", isolation: "process", state: "planned", drivers: ["s3-api"], hardening: ["bucket-quota"], boot: "warm", bootms: 100, gpu: false, network: true, mime: "application/vnd.devthink.storage+json" },
  { id: "storage-minio", label: "minio vault", family: "storage", isolation: "process", state: "planned", drivers: ["minio"], hardening: ["bucket-quota"], boot: "warm", bootms: 300, gpu: false, network: true, mime: "application/vnd.devthink.storage+json" },
  { id: "storage-garage", label: "garage vault", family: "storage", isolation: "process", state: "planned", drivers: ["garage"], hardening: ["bucket-quota"], boot: "warm", bootms: 300, gpu: false, network: true, mime: "application/vnd.devthink.storage+json" },
  // the network family: the resolution and the private tunnels the engine
  // opens for the sandbox (the hardened default stays off until a lane
  // asks)
  { id: "network-dns", label: "dns resolver", family: "network", isolation: "process", state: "live", drivers: ["dns"], hardening: ["resolver-allowlist"], boot: "hot", bootms: 5, gpu: false, network: true, mime: "application/vnd.devthink.net+json" },
  { id: "network-doh", label: "dns over https", family: "network", isolation: "process", state: "live", drivers: ["doh"], hardening: ["resolver-allowlist"], boot: "hot", bootms: 8, gpu: false, network: true, mime: "application/vnd.devthink.net+json" },
  { id: "network-tor", label: "tor onion lane", family: "network", isolation: "process", state: "planned", drivers: ["tor"], hardening: ["circuit-limit"], boot: "warm", bootms: 800, gpu: false, network: true, mime: "application/vnd.devthink.net+json" },
  { id: "network-i2p", label: "i2p tunnel", family: "network", isolation: "process", state: "planned", drivers: ["i2p"], hardening: ["tunnel-limit"], boot: "warm", bootms: 700, gpu: false, network: true, mime: "application/vnd.devthink.net+json" },
  { id: "network-wireguard", label: "wireguard tunnel", family: "network", isolation: "process", state: "planned", drivers: ["wireguard"], hardening: ["peer-allowlist"], boot: "warm", bootms: 100, gpu: false, network: true, mime: "application/vnd.devthink.net+json" },
  // the ram family: the storage-to-ram bridge, the kernel recipes that swap,
  // map and overlay the same bytes between use flags (the memory ladder the
  // corpus records: the tmpfs at the microsecond, the memory map at five,
  // the compressed ram at five hundred)
  { id: "ram-tmpfs", label: "tmpfs", family: "ram", isolation: "process", state: "planned", drivers: ["tmpfs"], hardening: ["oom-guard"], boot: "hot", bootms: 5, gpu: false, network: false, mime: "application/vnd.devthink.ram+json" },
  { id: "ram-mmap", label: "zero copy map", family: "ram", isolation: "process", state: "planned", drivers: ["mmap"], hardening: ["oom-guard"], boot: "hot", bootms: 5, gpu: false, network: false, mime: "application/vnd.devthink.ram+json" },
  { id: "ram-overlayfs", label: "overlayfs", family: "ram", isolation: "process", state: "planned", drivers: ["overlayfs"], hardening: ["oom-guard"], boot: "hot", bootms: 10, gpu: false, network: false, mime: "application/vnd.devthink.ram+json" },
  { id: "ram-loopram", label: "loop ram disk", family: "ram", isolation: "process", state: "planned", drivers: ["loop", "tmpfs"], hardening: ["oom-guard"], boot: "hot", bootms: 15, gpu: false, network: false, mime: "application/vnd.devthink.ram+json" },
  { id: "ram-gitram", label: "git in ram", family: "ram", isolation: "process", state: "planned", drivers: ["git", "mmap"], hardening: ["oom-guard"], boot: "hot", bootms: 20, gpu: false, network: false, mime: "application/vnd.devthink.ram+json" },
  { id: "ram-zram", label: "zram zstd", family: "ram", isolation: "process", state: "planned", drivers: ["zram", "zstd"], hardening: ["oom-guard"], boot: "hot", bootms: 25, gpu: false, network: false, mime: "application/vnd.devthink.ram+json" },
  { id: "ram-zswap", label: "zswap", family: "ram", isolation: "process", state: "planned", drivers: ["zswap"], hardening: ["oom-guard"], boot: "hot", bootms: 25, gpu: false, network: false, mime: "application/vnd.devthink.ram+json" },
  { id: "ram-swapfile", label: "swapfile", family: "ram", isolation: "process", state: "planned", drivers: ["swapfile"], hardening: ["oom-guard"], boot: "hot", bootms: 25, gpu: false, network: false, mime: "application/vnd.devthink.ram+json" },
  // the build family: the build graphs the engine runs inside the sandbox
  // (the artifact lane the repositories compile through)
  { id: "build-make", label: "make builds", family: "build", isolation: "process", state: "live", drivers: ["make"], hardening: ["recipe-allowlist"], boot: "hot", bootms: 10, gpu: false, network: false, mime: "application/vnd.devthink.build+json" },
  { id: "build-bazel", label: "bazel builds", family: "build", isolation: "process", state: "planned", drivers: ["bazel"], hardening: ["remote-cache-pin"], boot: "warm", bootms: 500, gpu: false, network: true, mime: "application/vnd.devthink.build+json" },
  { id: "build-buck", label: "buck builds", family: "build", isolation: "process", state: "planned", drivers: ["buck"], hardening: ["remote-cache-pin"], boot: "warm", bootms: 400, gpu: false, network: true, mime: "application/vnd.devthink.build+json" },
  { id: "build-ninja", label: "ninja builds", family: "build", isolation: "process", state: "live", drivers: ["ninja"], hardening: ["recipe-allowlist"], boot: "hot", bootms: 15, gpu: false, network: false, mime: "application/vnd.devthink.build+json" },
  { id: "build-turborepo", label: "turborepo builds", family: "build", isolation: "process", state: "planned", drivers: ["turbo"], hardening: ["remote-cache-pin"], boot: "warm", bootms: 300, gpu: false, network: true, mime: "application/vnd.devthink.build+json" },
  // the ci family: the self-hosted runners the engine drives for the
  // repository pipelines (no hosted ci dependency — the runner rides the
  // same self-hosted law)
  { id: "ci-actions", label: "actions runner", family: "ci", isolation: "process", state: "planned", drivers: ["actions-runner"], hardening: ["workflow-allowlist"], boot: "warm", bootms: 400, gpu: false, network: true, mime: "application/vnd.devthink.ci+json" },
  { id: "ci-gitlab", label: "gitlab runner", family: "ci", isolation: "process", state: "planned", drivers: ["gitlab-runner"], hardening: ["workflow-allowlist"], boot: "warm", bootms: 400, gpu: false, network: true, mime: "application/vnd.devthink.ci+json" },
  // the gpu family: the virtual graphics the machine may present (the
  // declared slice — the record never claims a host gpu it does not mount)
  { id: "gpu-virgl", label: "virgl render", family: "gpu", isolation: "vm", state: "planned", drivers: ["virgl", "virtio-gpu"], hardening: ["context-quota"], boot: "warm", bootms: 400, gpu: true, network: true, mime: "application/vnd.devthink.gpu+json" },
  // the local family: the explicit opt-in (the only lane that may touch the
  // visitor machine, and only under declared consent)
  { id: "local-optin", label: "local opt in", family: "local", isolation: "process", state: "planned", drivers: [], hardening: ["explicit-consent"], boot: "hot", bootms: 10, gpu: false, network: false, mime: "application/vnd.devthink.local+json" },
]);

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
