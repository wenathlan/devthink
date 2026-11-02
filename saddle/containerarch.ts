// # containerarch.ts — the 11-architecture container standard of the
// saddle engine (the ownership law, wave a, actions 91-101): the
// container lanes — the max and light drivers (container-max and
// container-lite) — must honestly cover all eleven architectures the
// owner's law names: x64, arm64, armv7, riscv64, ppc64le, s390x, 386,
// mips64le, loong64, wasm32 and wasip1. The standard is pure data and
// pure functions: one row per architecture (the docker platform spec,
// the arch name the daemon reports, the cpu family, the multi-arch base
// the drivers ride and the honest availability of that base per arch),
// the resolver the drivers read (an unknown arch answers the coded
// refusal naming the standard) and the coverage report the drivers
// stamp on every run. The honesty law the table keeps: a row never
// claims a base image the pinned multi-arch base does not carry — the
// three archs the bash base does not ship (loong64, wasm32 and wasip1)
// declare baseimagecarries false, and a driver run under one of them
// answers the coded ARCH_IMAGE_ABSENT before any spawn, never a
// pretended pull. The wasm pair rides the oci artifact shapes
// (wasm32/wasip1 and wasip1/wasm) the wasm runtimes (wasmedge and the
// wasi preview lanes) consume — the standard covers them, the base
// availability stays honest.

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the standard table — one honest row per architecture.   */
/* ════════════════════════════════════════════════════════════════════ */

/** the eleven architecture ids of the container standard, in the order
 * the owner's law names them (x64 first, the wasm pair last). */
export const CONTAINERARCHIDS: readonly string[] = Object.freeze([
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

/** the cpu families the eleven architectures group under. */
export type containerarchfamily = "x86" | "arm" | "riscv" | "power" | "mainframe" | "mips" | "loong" | "wasm";

/** one honest row of the container standard: the architecture id, the
 * docker platform spec the drivers pass (--platform), the arch name the
 * daemon reports, the cpu family, the multi-arch base image both
 * drivers ride, whether that base honestly carries the architecture,
 * and the note the coverage report prints. */
export interface containerarchrow {
  /** the architecture id of the standard (the resolver reads it). */
  readonly id: string;
  /** the short display label. */
  readonly label: string;
  /** the docker --platform spec the drivers pass. */
  readonly platform: string;
  /** the architecture name the daemon reports for the spec. */
  readonly dockerarch: string;
  /** the cpu family the architecture groups under. */
  readonly family: containerarchfamily;
  /** the multi-arch base image the max and light drivers ride. */
  readonly baseimage: string;
  /** whether the pinned base image honestly carries the architecture. */
  readonly baseimagecarries: boolean;
  /** the honest note the coverage report prints for the row. */
  readonly note: string;
}

/** the multi-arch base both container drivers ride: the official bash
 * image carries nine of the eleven architectures (amd64, arm/v7,
 * arm64/v8, riscv64, ppc64le, s390x, 386, mips64le and the armv5 seat
 * beside them) — the pinned digest-class tag the drivers declare. */
export const CONTAINERBASEIMAGE = "docker.io/library/bash:5";

/** the eleven rows of the container standard — the max and light
 * drivers honestly cover every one: the eight architectures the pinned
 * base carries run through --platform, and the three it does not carry
 * (loong64, wasm32, wasip1) declare the honest absence the drivers
 * answer with the coded ARCH_IMAGE_ABSENT refusal. */
export const CONTAINERARCHES: readonly containerarchrow[] = Object.freeze([
  {
    id: "x64",
    label: "amd64 / x86_64",
    platform: "linux/amd64",
    dockerarch: "amd64",
    family: "x86",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: true,
    note: "the native 64-bit x86 seat (the daemon default on x64 hosts)",
  },
  {
    id: "arm64",
    label: "arm64 / aarch64",
    platform: "linux/arm64",
    dockerarch: "arm64",
    family: "arm",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: true,
    note: "the 64-bit arm seat (arm64/v8 of the multi-arch base)",
  },
  {
    id: "armv7",
    label: "armv7 / armhf",
    platform: "linux/arm/v7",
    dockerarch: "arm",
    family: "arm",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: true,
    note: "the 32-bit arm hard-float seat (arm/v7 of the multi-arch base)",
  },
  {
    id: "riscv64",
    label: "riscv64",
    platform: "linux/riscv64",
    dockerarch: "riscv64",
    family: "riscv",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: true,
    note: "the risc-v 64-bit seat the multi-arch base carries",
  },
  {
    id: "ppc64le",
    label: "powerpc64 little endian",
    platform: "linux/ppc64le",
    dockerarch: "ppc64le",
    family: "power",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: true,
    note: "the little-endian powerpc seat (the openpower hosts)",
  },
  {
    id: "s390x",
    label: "ibm z s390x",
    platform: "linux/s390x",
    dockerarch: "s390x",
    family: "mainframe",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: true,
    note: "the ibm z mainframe seat (the s390x hosts)",
  },
  {
    id: "386",
    label: "i386 / 386",
    platform: "linux/386",
    dockerarch: "386",
    family: "x86",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: true,
    note: "the 32-bit x86 seat (the i386 rows of the multi-arch base)",
  },
  {
    id: "mips64le",
    label: "mips64 little endian",
    platform: "linux/mips64le",
    dockerarch: "mips64le",
    family: "mips",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: true,
    note: "the little-endian mips64 seat the multi-arch base carries",
  },
  {
    id: "loong64",
    label: "loongarch64",
    platform: "linux/loong64",
    dockerarch: "loong64",
    family: "loong",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: false,
    note: "the loongarch seat: the pinned bash base ships no loong64 rows — the driver answers ARCH_IMAGE_ABSENT, never a pretended pull",
  },
  {
    id: "wasm32",
    label: "webassembly 32",
    platform: "wasm32/wasip1",
    dockerarch: "wasm32",
    family: "wasm",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: false,
    note: "the wasm seat: the oci wasm artifact shape the wasm runtimes consume — the bash base carries no wasm rows, the driver answers ARCH_IMAGE_ABSENT",
  },
  {
    id: "wasip1",
    label: "wasi preview1",
    platform: "wasip1/wasm",
    dockerarch: "wasip1",
    family: "wasm",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: false,
    note: "the wasi preview1 seat: the companion wasm artifact shape — the bash base carries no wasip1 rows, the driver answers ARCH_IMAGE_ABSENT",
  },
]);

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the resolver and the coverage report the drivers read.  */
/* ════════════════════════════════════════════════════════════════════ */

/** answers one row of the standard by architecture id — undefined when
 * the id is not one of the eleven the owner's law names.
 *
 * @param id the architecture id (x64, arm64, armv7, ...).
 * @returns the row, or undefined for an unknown id.
 */
export function getcontainerarch(id: string): containerarchrow | undefined {
  return CONTAINERARCHES.find((row) => row.id === id);
}

/** the coded refusal of the resolver: an architecture the standard does
 * not carry. The name carries the standard's shape so the message names
 * the law (the eleven ids), never a bare invalid-input. */
export function containerarcherror(id: string): Error & { code: string } {
  const error = new Error(
    `the container standard carries no architecture "${id}": the eleven architectures the max and light drivers cover are ${CONTAINERARCHIDS.join(", ")}`,
  ) as Error & { code: string };
  error.name = "containerarcherror";
  error.code = "CONTAINER_ARCH_UNKNOWN";
  return error;
}

/** resolves the architecture the caller asked for against the standard:
 * an undefined or null input answers the x64 default row (the daemon
 * default), a known id answers its row, and anything else throws the
 * coded CONTAINER_ARCH_UNKNOWN refusal naming the eleven ids — the
 * resolver never silently rewrites the caller's architecture.
 *
 * @param input the caller architecture id (inputs.arch of the drivers).
 * @returns the honest row of the standard.
 */
export function resolvecontainerarch(input: unknown): containerarchrow {
  if (input === undefined || input === null) return getcontainerarch("x64") as containerarchrow;
  if (typeof input !== "string") throw containerarcherror(String(input));
  const row = getcontainerarch(input.trim().toLowerCase());
  if (row === undefined) throw containerarcherror(input);
  return row;
}

/** the honest coverage report of the standard: the count the owner's
 * law charges (eleven), the count the pinned base carries (eight), the
 * per-arch rows with their platform specs and availability, and the
 * driver pair the rows serve (max and light). Pure data, frozen — the
 * report the drivers stamp on every profile run. */
export interface containerarchreport {
  /** the architectures the standard covers (eleven). */
  count: number;
  /** the architectures the pinned multi-arch base carries. */
  carries: number;
  /** the driver pair the standard serves. */
  drivers: readonly string[];
  /** the per-arch coverage rows (id, platform, dockerarch, family,
   * baseimagecarries, note). */
  rows: readonly {
    id: string;
    label: string;
    platform: string;
    dockerarch: string;
    family: containerarchfamily;
    baseimagecarries: boolean;
    note: string;
  }[];
}

/** answers the honest coverage report of the 11-architecture container
 * standard — the table the drivers stamp on every run and the tests
 * pin: eleven rows, every id exactly once, the platform specs honest
 * per arch and the availability following the pinned base. */
export function containerarchcoverage(): containerarchreport {
  return {
    count: CONTAINERARCHES.length,
    carries: CONTAINERARCHES.filter((row) => row.baseimagecarries).length,
    drivers: Object.freeze(["container-max", "container-lite"]),
    rows: Object.freeze(
      CONTAINERARCHES.map((row) => ({
        id: row.id,
        label: row.label,
        platform: row.platform,
        dockerarch: row.dockerarch,
        family: row.family,
        baseimagecarries: row.baseimagecarries,
        note: row.note,
      })),
    ),
  };
}

/** renders the coverage table as report lines (the drivers append these
 * under their profile line so every run answers the eleven-arch law). */
export function containerarchlines(): string[] {
  const coverage = containerarchcoverage();
  return [
    `  arch standard: ${coverage.count} architectures covered by the ${coverage.drivers.join(" and ")} drivers (${coverage.carries} carried by the pinned base, ${coverage.count - coverage.carries} answered with the honest coded absence)`,
    ...coverage.rows.map(
      (row) =>
        `    ${row.id.padEnd(8)} ${row.platform.padEnd(16)} dockerarch ${row.dockerarch.padEnd(8)} ${row.baseimagecarries ? "base carries" : "ARCH_IMAGE_ABSENT"}`,
    ),
  ];
}
