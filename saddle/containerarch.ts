// # containerarch.ts — the 11-architecture standard of the saddle
// engine (the pr15 law, the family platform axis): every container and
// every engine target of the family answers the eleven standardized
// architecture seats the owner's law names — linux-x64, darwin-arm64,
// windows-x64, linux-arm64, darwin-x64, windows-arm64, linux-x64-musl,
// linux-riscv64, wasm32, darwin-arm64-v8 and windows-x64-gnu — one
// honest row per seat: the display label, the os family, the cpu
// architecture, the npm-style target triple the binary lanes stamp,
// the docker --platform spec the container drivers pass where a linux
// container seat exists, and the honest availability of that seat
// against the pinned multi-arch base. beside the standard seats the
// file carries the build architecture table — the eleven go-style arch
// seats the container build legs stamp (x64, arm64, armv7, riscv64,
// ppc64le, s390x, 386, mips64le, loong64, wasm32, wasip1): the four
// legs the pinned base honestly carries (the native x64 leg beside the
// arm64, ppc64le and s390x QEMU-emulated legs) and the seven honest
// coded absences (ARCH_LEG_NOT_BUILT) the publish lanes never pretend
// to build.
//
// THE HONEST AVAILABILITY LAW (the same law the pre-pr15 table kept):
// a row never claims a build the pinned base cannot answer. the linux
// seats the base carries (linux-x64 through linux/amd64, linux-arm64
// through linux/arm64, linux-x64-musl through the amd64 musl flavor,
// linux-riscv64 through linux/riscv64 and the darwin-arm64-v8 abi seat
// through the linux/arm64/v8 leg) declare carried; the darwin and
// windows seats and the wasm32 seat are target rows — the binary and
// npm lanes build them, the container drivers answer the honest
// ARCH_TARGET_NOT_CONTAINER coded absence, never a pretended pull.
//
// THE VISITOR LAW (the critical law): every seat of the standard is a
// TARGET the engine builds and drives on its own twenty-four hour
// internet infrastructure — the standard never describes the visitor
// machine (no visitor gpu, no visitor cpu, no visitor browser, no
// visitor local storage, no localforage — the engine owns every cycle
// it spends through saddle and vault edge processing).
//
// Pure data and pure functions: zero storage, zero node-only imports,
// the browser-pure bundle keeps carrying it.

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the standard table — one honest row per architecture.   */
/* ════════════════════════════════════════════════════════════════════ */

/** the eleven architecture seat ids of the pr15 standard, in the order
 * the owner's law names them (linux-x64 first, windows-x64-gnu last). */
export const CONTAINERARCHIDS: readonly string[] = Object.freeze([
  "linux-x64",
  "darwin-arm64",
  "windows-x64",
  "linux-arm64",
  "darwin-x64",
  "windows-arm64",
  "linux-x64-musl",
  "linux-riscv64",
  "wasm32",
  "darwin-arm64-v8",
  "windows-x64-gnu",
]);

/** the os families the eleven seats group under. */
export type containerarchfamily = "linux" | "darwin" | "windows" | "wasm";

/** the honest availability of one seat: carried — the pinned multi-arch
 * base answers a linux container build leg for the seat; target — the
 * seat is a binary/npm target the container drivers never pretend to
 * pull (the coded ARCH_TARGET_NOT_CONTAINER absence). */
export type containerarchavailability = "carried" | "target";

/** one honest row of the standard: the seat id, the display label, the
 * os family, the cpu architecture, the npm-style target triple, the
 * docker --platform spec where a linux container seat exists (empty
 * for target rows), the arch name the daemon reports for that spec,
 * the multi-arch base the container drivers ride, whether that base
 * honestly carries the seat, and the honest note the report prints. */
export interface containerarchrow {
  /** the seat id of the standard (the resolver reads it). */
  readonly id: string;
  /** the short display label. */
  readonly label: string;
  /** the docker --platform spec the drivers pass (empty for target rows). */
  readonly platform: string;
  /** the arch name the daemon reports for the spec (empty for target rows). */
  readonly dockerarch: string;
  /** the os family the seat groups under. */
  readonly family: containerarchfamily;
  /** the cpu architecture of the seat. */
  readonly arch: string;
  /** the npm-style target triple the binary lanes stamp. */
  readonly target: string;
  /** the multi-arch base image the container drivers ride. */
  readonly baseimage: string;
  /** whether the pinned base honestly carries the seat's build leg. */
  readonly baseimagecarries: boolean;
  /** the honest availability class of the seat. */
  readonly availability: containerarchavailability;
  /** the honest note the coverage report prints for the row. */
  readonly note: string;
}

/** the multi-arch base the container drivers ride: the official bash
 * image carries the linux legs the standard's carried seats map to
 * (amd64, arm64/v8 and riscv64) — the pinned tag the drivers declare. */
export const CONTAINERBASEIMAGE = "docker.io/library/bash:5";

/** the eleven rows of the pr15 standard — every seat the owner's law
 * names, one honest row each: the five carried linux container legs
 * and the six target seats the binary and npm lanes own. */
export const CONTAINERARCHES: readonly containerarchrow[] = Object.freeze([
  {
    id: "linux-x64",
    label: "linux x64",
    platform: "linux/amd64",
    dockerarch: "amd64",
    family: "linux",
    arch: "x64",
    target: "linux-x64",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: true,
    availability: "carried",
    note: "the native 64-bit x86 linux seat (the amd64 leg of the pinned base, the standard's first seat).",
  },
  {
    id: "darwin-arm64",
    label: "darwin arm64",
    platform: "",
    dockerarch: "",
    family: "darwin",
    arch: "arm64",
    target: "darwin-arm64",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: false,
    availability: "target",
    note: "the apple silicon seat: a binary and npm target the family lanes build — the container drivers answer ARCH_TARGET_NOT_CONTAINER, never a pretended darwin pull.",
  },
  {
    id: "windows-x64",
    label: "windows x64",
    platform: "",
    dockerarch: "",
    family: "windows",
    arch: "x64",
    target: "win32-x64",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: false,
    availability: "target",
    note: "the 64-bit windows seat: the exe execution lanes target it — the container drivers answer ARCH_TARGET_NOT_CONTAINER.",
  },
  {
    id: "linux-arm64",
    label: "linux arm64",
    platform: "linux/arm64",
    dockerarch: "arm64",
    family: "linux",
    arch: "arm64",
    target: "linux-arm64",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: true,
    availability: "carried",
    note: "the 64-bit arm linux seat (the arm64 leg of the pinned base).",
  },
  {
    id: "darwin-x64",
    label: "darwin x64",
    platform: "",
    dockerarch: "",
    family: "darwin",
    arch: "x64",
    target: "darwin-x64",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: false,
    availability: "target",
    note: "the intel mac seat: a binary and npm target — the container drivers answer ARCH_TARGET_NOT_CONTAINER.",
  },
  {
    id: "windows-arm64",
    label: "windows arm64",
    platform: "",
    dockerarch: "",
    family: "windows",
    arch: "arm64",
    target: "win32-arm64",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: false,
    availability: "target",
    note: "the arm windows seat: a binary and npm target — the container drivers answer ARCH_TARGET_NOT_CONTAINER.",
  },
  {
    id: "linux-x64-musl",
    label: "linux x64 musl",
    platform: "linux/amd64",
    dockerarch: "amd64",
    family: "linux",
    arch: "x64",
    target: "linux-x64-musl",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: true,
    availability: "carried",
    note: "the musl abi seat: the amd64 build leg with the alpine musl flavor the driver switches to — the seat rides the same leg as linux-x64.",
  },
  {
    id: "linux-riscv64",
    label: "linux riscv64",
    platform: "linux/riscv64",
    dockerarch: "riscv64",
    family: "linux",
    arch: "riscv64",
    target: "linux-riscv64",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: true,
    availability: "carried",
    note: "the risc-v 64-bit linux seat (the riscv64 leg the pinned base carries).",
  },
  {
    id: "wasm32",
    label: "webassembly 32",
    platform: "",
    dockerarch: "",
    family: "wasm",
    arch: "wasm32",
    target: "wasm32-wasip1",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: false,
    availability: "target",
    note: "the wasm seat: the oci artifact shapes (wasm32/wasip1) the wasm runtimes consume — a target row, the container drivers answer ARCH_TARGET_NOT_CONTAINER.",
  },
  {
    id: "darwin-arm64-v8",
    label: "darwin arm64 v8",
    platform: "linux/arm64/v8",
    dockerarch: "arm64",
    family: "darwin",
    arch: "arm64",
    target: "darwin-arm64-v8",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: true,
    availability: "carried",
    note: "the arm64 v8 abi seat: the darwin v8 target rides the linux/arm64/v8 container leg the pinned base carries (the abi-qualified seat of the standard).",
  },
  {
    id: "windows-x64-gnu",
    label: "windows x64 gnu",
    platform: "",
    dockerarch: "",
    family: "windows",
    arch: "x64",
    target: "win32-x64-gnu",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: false,
    availability: "target",
    note: "the gnu abi seat of the windows x64 target: the mingw grammar the binary lanes build — the container drivers answer ARCH_TARGET_NOT_CONTAINER.",
  },
]);

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1b: the build architecture seats — the go-style arch        */
/* vocabulary the container build legs stamp.                          */
/* ════════════════════════════════════════════════════════════════════ */

/** the eleven build architecture seat ids of the container build index
 * — the go-style arch names the docker --platform axis and the publish
 * lanes stamp (x64, arm64, armv7, riscv64, ppc64le, s390x, 386,
 * mips64le, loong64, wasm32, wasip1), the vocabulary the build legs
 * and the base-carried coverage report answer through. */
export const CONTAINERBUILDARCHIDS: readonly string[] = Object.freeze([
  "x64",
  "arm64",
  "armv7",
  "riscv64",
  "ppc64le",
  "s390x",
  "386",
  "mips64le",
  "loong64",
  "wasm32",
  "wasip1",
]);

/** one honest row of the build architecture table: the go-style arch
 * seat, the docker --platform spec the build legs stamp for it, whether
 * the pinned multi-arch base honestly carries the leg (the vhe build
 * index the publish lanes carry) and the honest note the coverage
 * report prints. */
export interface containerbuildarchrow {
  /** the go-style arch seat id of the build index. */
  readonly arch: string;
  /** the docker --platform spec the build legs stamp for the seat. */
  readonly platform: string;
  /** whether the pinned base honestly carries the build leg. */
  readonly baseimagecarries: boolean;
  /** the honest note the coverage report prints for the row. */
  readonly note: string;
}

/** the eleven build architecture rows of the container build index: the
 * four legs the pinned multi-arch base honestly carries (the native x64
 * amd64 leg beside the arm64, ppc64le and s390x QEMU-emulated legs) and
 * the seven seats the base does not ship — every one of those answers
 * the honest ARCH_LEG_NOT_BUILT coded absence, never a pretended build
 * leg (the node engine family index adds the riscv64 leg beside the
 * four; the vhe container index answers the coded absence for it). */
export const CONTAINERBUILDARCHES: readonly containerbuildarchrow[] = Object.freeze([
  {
    arch: "x64",
    platform: "linux/amd64",
    baseimagecarries: true,
    note: "the native 64-bit x86 build leg the amd64 runner executes (the base's amd64 manifest).",
  },
  {
    arch: "arm64",
    platform: "linux/arm64",
    baseimagecarries: true,
    note: "the 64-bit arm build leg under QEMU emulation (the base's arm64 manifest).",
  },
  {
    arch: "armv7",
    platform: "linux/arm/v7",
    baseimagecarries: false,
    note: "the 32-bit arm v7 seat answers ARCH_LEG_NOT_BUILT — the publish lanes carry no armv7 leg.",
  },
  {
    arch: "riscv64",
    platform: "linux/riscv64",
    baseimagecarries: false,
    note: "the risc-v seat answers ARCH_LEG_NOT_BUILT on the vhe container index (the node engine family index builds the riscv64 leg beside the four).",
  },
  {
    arch: "ppc64le",
    platform: "linux/ppc64le",
    baseimagecarries: true,
    note: "the powerpc little-endian build leg under QEMU emulation (the base's ppc64le manifest).",
  },
  {
    arch: "s390x",
    platform: "linux/s390x",
    baseimagecarries: true,
    note: "the ibm z big-endian build leg under QEMU emulation (the base's s390x manifest).",
  },
  {
    arch: "386",
    platform: "linux/386",
    baseimagecarries: false,
    note: "the 32-bit x86 seat answers ARCH_LEG_NOT_BUILT — the publish lanes carry no 386 leg.",
  },
  {
    arch: "mips64le",
    platform: "linux/mips64le",
    baseimagecarries: false,
    note: "the mips64 little-endian seat answers ARCH_LEG_NOT_BUILT — the publish lanes carry no mips64le leg.",
  },
  {
    arch: "loong64",
    platform: "linux/loong64",
    baseimagecarries: false,
    note: "the loongarch 64-bit seat answers ARCH_LEG_NOT_BUILT — the publish lanes carry no loong64 leg.",
  },
  {
    arch: "wasm32",
    platform: "wasm32",
    baseimagecarries: false,
    note: "the webassembly seat answers ARCH_LEG_NOT_BUILT on the container index — the wasm runtimes own it as an oci artifact target.",
  },
  {
    arch: "wasip1",
    platform: "wasm32-wasip1",
    baseimagecarries: false,
    note: "the wasi preview 1 seat answers ARCH_LEG_NOT_BUILT on the container index — the wasm lanes build the wasip1 target.",
  },
]);

/** answers one build architecture row by its go-style arch seat id —
 * undefined when the id is not one of the eleven the build index names.
 *
 * @param arch the go-style arch seat id (x64, arm64, armv7, ...).
 * @returns the build row, or undefined for an unknown arch.
 */
export function getcontainerbuildarch(arch: string): containerbuildarchrow | undefined {
  return CONTAINERBUILDARCHES.find((row) => row.arch === arch);
}

/** the honest coverage report of the build index: the eleven go-style
 * arch seats, the legs the pinned base carries (four — the native x64
 * leg beside the three QEMU-emulated seats) and the seven honest coded
 * absences — the table the publish lanes and the coverage lines read. */
export function containerbuildarchcoverage(): {
  count: number;
  carries: number;
  absences: number;
  carriedplatforms: readonly string[];
  rows: readonly { arch: string; platform: string; baseimagecarries: boolean; note: string }[];
} {
  const carried = CONTAINERBUILDARCHES.filter((row) => row.baseimagecarries);
  return {
    count: CONTAINERBUILDARCHES.length,
    carries: carried.length,
    absences: CONTAINERBUILDARCHES.length - carried.length,
    carriedplatforms: Object.freeze(carried.map((row) => row.platform)),
    rows: Object.freeze(
      CONTAINERBUILDARCHES.map((row) => ({
        arch: row.arch,
        platform: row.platform,
        baseimagecarries: row.baseimagecarries,
        note: row.note,
      })),
    ),
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the resolver and the coverage report the drivers read.  */
/* ════════════════════════════════════════════════════════════════════ */

/** answers one row of the standard by seat id — undefined when the id
 * is not one of the eleven the owner's law names.
 *
 * @param id the seat id (linux-x64, darwin-arm64, ...).
 * @returns the row, or undefined for an unknown id.
 */
export function getcontainerarch(id: string): containerarchrow | undefined {
  return CONTAINERARCHES.find((row) => row.id === id);
}

/** the coded refusal of the resolver: an architecture the standard does
 * not carry. The name carries the standard's shape so the message names
 * the law (the eleven seats), never a bare invalid-input. */
export function containerarcherror(id: string): Error & { code: string } {
  const error = new Error(
    `the 11-architecture standard carries no seat "${id}": the eleven seats the owner's law names are ${CONTAINERARCHIDS.join(", ")}`,
  ) as Error & { code: string };
  error.name = "containerarcherror";
  error.code = "CONTAINER_ARCH_UNKNOWN";
  return error;
}

/** resolves the architecture the caller asked for against the standard:
 * an undefined or null input answers the linux-x64 default row (the
 * standard's first seat), a known id answers its row, and anything
 * else throws the coded CONTAINER_ARCH_UNKNOWN refusal naming the
 * eleven seats — the resolver never silently rewrites the caller's
 * architecture.
 *
 * @param input the caller architecture seat id (inputs.arch of the drivers).
 * @returns the honest row of the standard.
 */
export function resolvecontainerarch(input: unknown): containerarchrow {
  if (input === undefined || input === null) return getcontainerarch("linux-x64") as containerarchrow;
  if (typeof input !== "string") throw containerarcherror(String(input));
  const row = getcontainerarch(input.trim().toLowerCase());
  if (row === undefined) throw containerarcherror(input);
  return row;
}

/** the honest coverage report of the standard: the count the owner's
 * law charges (eleven), the count the pinned base carries, the
 * per-seat rows with their platform specs and availability, and the
 * driver pair the rows serve. Pure data, frozen — the report the
 * drivers stamp on every profile run. */
export interface containerarchreport {
  /** the architecture seats the standard covers (eleven). */
  count: number;
  /** the seats the pinned multi-arch base carries. */
  carries: number;
  /** the target seats the binary and npm lanes own. */
  targets: number;
  /** the driver pair the standard serves. */
  drivers: readonly string[];
  /** the per-seat coverage rows (id, platform, dockerarch, family,
   * target, availability, note). */
  rows: readonly {
    id: string;
    label: string;
    platform: string;
    dockerarch: string;
    family: containerarchfamily;
    target: string;
    availability: containerarchavailability;
    note: string;
  }[];
}

/** answers the honest coverage report of the 11-architecture standard —
 * the table the drivers stamp on every run and the tests pin: eleven
 * rows, every seat exactly once, the platform specs honest per seat
 * and the availability following the pinned base. */
export function containerarchcoverage(): containerarchreport {
  return {
    count: CONTAINERARCHES.length,
    carries: CONTAINERARCHES.filter((row) => row.availability === "carried").length,
    targets: CONTAINERARCHES.filter((row) => row.availability === "target").length,
    drivers: Object.freeze(["containermax", "containerlite"]),
    rows: Object.freeze(
      CONTAINERARCHES.map((row) => ({
        id: row.id,
        label: row.label,
        platform: row.platform,
        dockerarch: row.dockerarch,
        family: row.family,
        target: row.target,
        availability: row.availability,
        note: row.note,
      })),
    ),
  };
}

/** the display names of the two container drivers (the hyphen law the
 * coverage table prints: the driver ids stay unhyphenated inside the
 * registry, the rendered line answers the hyphenated family names). */
const DRIVERDISPLAY: Readonly<Record<string, string>> = Object.freeze({
  containermax: "container-max",
  containerlite: "container-lite",
});

/** renders the coverage table as report lines (the drivers append these
 * under their profile line so every run answers the eleven-seat law of
 * the pr15 standard). */
export function containerarchlines(): string[] {
  const coverage = containerarchcoverage();
  return [
    `  arch standard: ${coverage.count} seats covered by the ${coverage.drivers.map((driver) => DRIVERDISPLAY[driver] ?? driver).join(" and ")} drivers (${coverage.carries} carried by the pinned base, ${coverage.targets} answered as binary/npm targets with the honest coded absence)`,
    ...coverage.rows.map(
      (row) =>
        `    ${row.id.padEnd(17)} ${(row.platform || "target").padEnd(15)} ${(row.dockerarch || "-").padEnd(8)} ${row.target.padEnd(17)} ${row.availability === "carried" ? "base carries" : "ARCH_TARGET_NOT_CONTAINER"}`,
    ),
  ];
}
