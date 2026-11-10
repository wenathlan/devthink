// # containerarch.ts — the seventeen-seat architecture standard and
// the os distribution catalog of the saddle engine (the pr15 law grown
// by the archos wave, the family platform axis): every container and
// every engine target of the family answers the seventeen standardized
// architecture seats the owner's law names — linux-x64, darwin-arm64,
// windows-x64, linux-arm64, darwin-x64, windows-arm64, linux-x64-musl,
// linux-riscv64, wasm32, darwin-arm64-v8, windows-x64-gnu, the six
// seats the archos expansion appended (linux-ppc64le, linux-s390x,
// linux-armv7, linux-armv6, linux-386 and linux-mips64le) — one
// honest row per seat: the display label, the os family, the cpu
// architecture, the npm-style target triple the binary lanes stamp,
// the docker --platform spec the container drivers pass where a linux
// container seat exists, and the honest availability of that seat
// against the pinned multi-arch base. THE OWNER'S DIRECTIVE (the
// archos law, verbatim): "expanda ali o OS/Arch (restrito a
// linux/arm64 e unknown) para 15+ lanes tanto nos sistemas operacionais
// (Alpine, NixOS, V, Arch Linux e Debian) quanto no respectivo ArchOS
// interno" — the axis grows past fifteen seats on both tables, and
// every new row answers the ground truth the live registries carry:
// the vhe image's pinned node base (node:26.13.0-slim) carries exactly
// four real legs (linux/amd64, linux/arm64/v8, linux/ppc64le and
// linux/s390x — the publish lanes build those four, never a pretended
// fifth), while the container drivers' pinned bash base (bash:5)
// carries eight (amd64, arm/v6, arm/v7, arm64/v8, 386, ppc64le,
// riscv64 and s390x) — so the ppc64le and s390x seats ride both bases,
// the armv7, armv6 and 386 seats ride the bash driver base alone (the
// leg the vhe image's node base never pretends), and the mips64le seat
// answers the honest target class (no pinned base carries a mips64le
// leg — the binary and npm lanes own it, the container drivers answer
// the ARCH_TARGET_NOT_CONTAINER coded absence). beside the standard
// seats the file carries the build architecture table — the sixteen
// go-style arch seats the container build legs stamp (x64, arm64,
// armv7, riscv64, ppc64le, s390x, 386, mips64le, loong64, wasm32,
// wasip1 beside the five the archos expansion appended: armv6, ppc64,
// mipsle, mips64 and mips): the four legs the pinned node base
// honestly carries (the native x64 leg beside the arm64, ppc64le and
// s390x QEMU-emulated legs), the armv6 leg the pinned bash driver base
// carries (the container drivers' own build leg) and the honest coded
// absences (ARCH_LEG_NOT_BUILT) the publish lanes never pretend to
// build. beside both tables the file carries the os distribution
// catalog — the sixteen system seats the saddle container carries
// (the osdistrib law, the owner's sentences: "iniciar distribuição do
// container saddle com por exemplo, grapheneos, omarchy e outros
// sistemas dentro do saddle" and "o saddle nao ta com mais de 15
// devido as disvbriçoe s com sistem aoperacional como graphene os e
// etc" — the more-than-fifteen directive): the seven named law seats
// — grapheneos (a privacy and security hardened version of android),
// omarchy (the arch linux-based distribution created by dhh), vanilla
// os (based on ubuntu), maru os (firmware, not an application), the
// v seat (the v language platform the dependency catalog pins at
// 0.5.2, never a guest distribution), the normal linux baseline and
// android — beside the nine honest additions the directive rides:
// postmarketos (the alpine-based mobile distribution), lineageos
// (the community android continuation), calyxos (the privacy-focused
// android distribution), archlinux (the rolling-release distribution
// omarchy builds on), alpine (the musl-based lightweight
// distribution), debian (the universal operating system), fedora
// (the red-hat-upstream community distribution), nixos (the
// declarative distribution the nix package manager builds) and void
// (the independent source-rolling distribution) — one
// honest row per seat: the true base fact, the package grammar, the
// architecture seats of the seventeen-seat standard the seat rides (the
// amd64 and arm64 legs the pairing derives), the engine plan profiles
// it binds (the max, balanced and lite trio the engineplans table
// owns — reused, never duplicated) and the virtual device presentation
// (vgpu and vcpu — virtual devices the engine presents, never the
// visitor machine's own). the plan-resource law rides the catalog as
// data: the 50 gb per plan example the owner's law names is PLAN CONFIG
// the devthink system plan logic stamps, never an engine cap — the
// engine limits law of engineplans.ts stays the law of record and the
// engines are unlimited.
//
// THE HONEST AVAILABILITY LAW (the same law the pre-pr15 table kept,
// the ground truth the archos wave verified live): a row never claims
// a build the pinned base cannot answer. the linux seats the bases
// carry (linux-x64 through linux/amd64, linux-arm64 through
// linux/arm64, linux-x64-musl through the amd64 musl flavor,
// linux-riscv64 through the bash base's linux/riscv64 leg, the
// darwin-arm64-v8 abi seat through the linux/arm64/v8 leg, the
// linux-ppc64le and linux-s390x seats through the legs both pinned
// bases carry, and the linux-armv7, linux-armv6 and linux-386 seats
// through the container drivers' pinned bash base — the arm/v7, arm/v6
// and 386 legs the vhe image's node base never pretends) declare
// carried; the darwin and windows seats, the wasm32 seat and the
// linux-mips64le seat (no pinned base carries a mips64le leg) are
// target rows — the binary and npm lanes build them, the container
// drivers answer the honest ARCH_TARGET_NOT_CONTAINER coded absence,
// never a pretended pull.
//
// THE VISITOR LAW (the critical law): every seat of the standard and
// every system seat of the os distribution catalog is a TARGET or a
// hosted GUEST the engine builds and drives on its own twenty-four
// hour internet infrastructure — the standard and the catalog never
// describe the visitor machine (no visitor gpu, no visitor cpu, no
// visitor browser, no visitor local storage, no localforage — the
// engine owns every cycle it spends through saddle and vault edge
// processing).
//
// Pure data and pure functions: zero storage, zero node-only imports
// (the one import the catalog takes — engineplans.ts — is itself pure
// data and pure functions), the browser-pure bundle keeps carrying it.

import { ENGINELIMITS, ENGINEPLANS, type EngineLimitsLaw, type EngineProfileId } from "./engineplans.ts";

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the standard table — one honest row per architecture.   */
/* ════════════════════════════════════════════════════════════════════ */

/** the seventeen architecture seat ids of the standard (the pr15 law
 * the archos wave grew past the owner's fifteen-seat directive), in
 * the order the owner's law names them (linux-x64 first, the six
 * archos seats last: linux-ppc64le, linux-s390x, linux-armv7,
 * linux-armv6, linux-386 and linux-mips64le). */
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
  "linux-ppc64le",
  "linux-s390x",
  "linux-armv7",
  "linux-armv6",
  "linux-386",
  "linux-mips64le",
]);

/** the os families the seventeen seats group under. */
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
 * (amd64, arm/v6, arm/v7, arm64/v8, 386, ppc64le, riscv64 and s390x —
 * the eight-leg ground truth the archos wave verified live) — the
 * pinned tag the drivers declare. */
export const CONTAINERBASEIMAGE = "docker.io/library/bash:5";

/** the seventeen rows of the standard (the pr15 law the archos wave
 * grew) — every seat the owner's law names, one honest row each: the
 * ten carried linux container legs and the seven target seats the
 * binary and npm lanes own. */
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
  {
    id: "linux-ppc64le",
    label: "linux ppc64le",
    platform: "linux/ppc64le",
    dockerarch: "ppc64le",
    family: "linux",
    arch: "ppc64le",
    target: "linux-ppc64le",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: true,
    availability: "carried",
    note: "the 64-bit powerpc little-endian seat: the ppc64le leg both pinned bases carry (the vhe node base builds it under QEMU, the bash driver base answers it beside) — the archos wave's first appended seat.",
  },
  {
    id: "linux-s390x",
    label: "linux s390x",
    platform: "linux/s390x",
    dockerarch: "s390x",
    family: "linux",
    arch: "s390x",
    target: "linux-s390x",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: true,
    availability: "carried",
    note: "the ibm z seat: the s390x big-endian leg both pinned bases carry — the mainframe-flavored linux seat the archos wave seats beside ppc64le.",
  },
  {
    id: "linux-armv7",
    label: "linux armv7",
    platform: "linux/arm/v7",
    dockerarch: "arm",
    family: "linux",
    arch: "armv7",
    target: "linux-armv7",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: true,
    availability: "carried",
    note: "the 32-bit arm v7 seat: the container drivers' pinned bash base carries the arm/v7 leg the vhe image's node base never pretends — the driver lanes answer it honestly, the vhe publish lanes keep their four build legs.",
  },
  {
    id: "linux-armv6",
    label: "linux armv6",
    platform: "linux/arm/v6",
    dockerarch: "arm",
    family: "linux",
    arch: "armv6",
    target: "linux-armv6",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: true,
    availability: "carried",
    note: "the 32-bit arm v6 seat: the container drivers' pinned bash base carries the arm/v6 leg the vhe image's node base never pretends — the raspberry-pi-flavored seat the armv7 law answers beside.",
  },
  {
    id: "linux-386",
    label: "linux 386",
    platform: "linux/386",
    dockerarch: "386",
    family: "linux",
    arch: "386",
    target: "linux-386",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: true,
    availability: "carried",
    note: "the 32-bit x86 seat: the container drivers' pinned bash base carries the 386 leg the vhe image's node base never pretends — the legacy ia32 seat the archos wave seats.",
  },
  {
    id: "linux-mips64le",
    label: "linux mips64le",
    platform: "",
    dockerarch: "",
    family: "linux",
    arch: "mips64le",
    target: "linux-mips64le",
    baseimage: CONTAINERBASEIMAGE,
    baseimagecarries: false,
    availability: "target",
    note: "the mips64 little-endian seat: no pinned base carries a mips64le leg — the binary and npm lanes own it, the container drivers answer ARCH_TARGET_NOT_CONTAINER.",
  },
]);

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1b: the build architecture seats — the go-style arch        */
/* vocabulary the container build legs stamp.                          */
/* ════════════════════════════════════════════════════════════════════ */

/** the sixteen build architecture seat ids of the container build
 * index — the go-style arch names the docker --platform axis and the
 * publish lanes stamp (x64, arm64, armv7, riscv64, ppc64le, s390x,
 * 386, mips64le, loong64, wasm32, wasip1 beside the five the archos
 * expansion appended: armv6, ppc64, mipsle, mips64 and mips), the
 * vocabulary the build legs and the base-carried coverage report
 * answer through. */
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
  "armv6",
  "ppc64",
  "mipsle",
  "mips64",
  "mips",
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

/** the sixteen build architecture rows of the container build index: the
 * four legs the pinned node base honestly carries (the native x64
 * amd64 leg beside the arm64, ppc64le and s390x QEMU-emulated legs),
 * the armv6 leg the pinned bash driver base carries (the container
 * drivers' own build leg — the archos wave's bash-carriage row) and
 * the eleven seats the bases do not ship a vhe build leg for — every
 * one of those answers the honest ARCH_LEG_NOT_BUILT coded absence,
 * never a pretended build leg (the node engine family index adds the
 * riscv64 leg beside the four; the vhe container index answers the
 * coded absence for it). */
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
  {
    arch: "armv6",
    platform: "linux/arm/v6",
    baseimagecarries: true,
    note: "the 32-bit arm v6 seat rides the arm/v6 leg the pinned bash driver base carries (the container drivers' own build leg) — the vhe node index builds no arm/v6 leg, the publish lanes' build legs stay the honest four.",
  },
  {
    arch: "ppc64",
    platform: "linux/ppc64",
    baseimagecarries: false,
    note: "the 32-bit-compatible powerpc big-endian seat answers ARCH_LEG_NOT_BUILT — the publish lanes carry no ppc64 leg (the little-endian ppc64le twin is the leg the bases carry).",
  },
  {
    arch: "mipsle",
    platform: "linux/mipsle",
    baseimagecarries: false,
    note: "the mips little-endian seat answers ARCH_LEG_NOT_BUILT — the publish lanes carry no mipsle leg.",
  },
  {
    arch: "mips64",
    platform: "linux/mips64",
    baseimagecarries: false,
    note: "the mips64 big-endian seat answers ARCH_LEG_NOT_BUILT — the publish lanes carry no mips64 leg (the little-endian mips64le twin stays the target-row seat of the standard).",
  },
  {
    arch: "mips",
    platform: "linux/mips",
    baseimagecarries: false,
    note: "the plain mips seat answers ARCH_LEG_NOT_BUILT — the publish lanes carry no mips leg.",
  },
]);

/** answers one build architecture row by its go-style arch seat id —
 * undefined when the id is not one of the sixteen the build index names.
 *
 * @param arch the go-style arch seat id (x64, arm64, armv7, ...).
 * @returns the build row, or undefined for an unknown arch.
 */
export function getcontainerbuildarch(arch: string): containerbuildarchrow | undefined {
  return CONTAINERBUILDARCHES.find((row) => row.arch === arch);
}

/** the honest coverage report of the build index: the sixteen go-style
 * arch seats, the legs the pinned bases carry (five — the native x64
 * leg beside the three QEMU-emulated seats the node base answers and
 * the armv6 leg the bash driver base carries) and the eleven honest
 * coded absences — the table the publish lanes and the coverage lines
 * read. */
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
/* Section 1c: the os distribution seats — the sixteen system seats */
/* the saddle container carries (the osdistrib law).             */
/* ════════════════════════════════════════════════════════════════════ */

/** the sixteen os distribution seat ids the catalog carries, in the
 * law order: the seven named law seats first — grapheneos and
 * omarchy (the named examples), vanilla os, maru os and the v seat
 * beside them, then the normal linux baseline and android — followed
 * by the nine honest additions the more-than-fifteen directive
 * rides: postmarketos, lineageos, calyxos, archlinux, alpine,
 * debian, fedora, nixos and void. */
export const OSDISTRIBUTIONIDS: readonly string[] = Object.freeze([
  "grapheneos",
  "omarchy",
  "vanillaos",
  "maruos",
  "v",
  "linux",
  "android",
  "postmarketos",
  "lineageos",
  "calyxos",
  "archlinux",
  "alpine",
  "debian",
  "fedora",
  "nixos",
  "void",
]);

/** the honest class of one os distribution seat (the catalog law): a
 * firmware is never an application, a language os seat is never a
 * guest distribution, a mobile seat builds on android and a desktop
 * seat is a desktop distribution. */
export type osdistributionkind = "distribution" | "firmware" | "languageos" | "desktop" | "mobile";

/** the package format grammar one os distribution seat answers (the
 * installer vocabulary the seats mount inside the sandbox): the apk,
 * apt, pacman, abuild and vpm grammars the seven named seats ride
 * beside the rpm, nix and xbps grammars the nine honest additions
 * carry (fedora the rpm seat, nixos the nix seat, void the xbps
 * seat). */
export type osdistributionpackage = "apk" | "apt" | "pacman" | "abuild" | "vpm" | "rpm" | "nix" | "xbps";

/** one honest row of the os distribution catalog: the seat id, the
 * display label, the honest kind, the upstream base (the true fact the
 * owner's law pins), the package grammar, the architecture seats of
 * the seventeen-seat standard the seat rides, the engine plan
 * profiles it binds, the virtual device presentation and the honest
 * note the catalog prints. */
export interface osdistributionrow {
  /** the seat id of the catalog (the resolver reads it). */
  readonly id: string;
  /** the short display label. */
  readonly label: string;
  /** the honest class of the seat (the catalog law). */
  readonly kind: osdistributionkind;
  /** the upstream base the distribution builds on (the true fact). */
  readonly base: string;
  /** the package format grammar the seat answers. */
  readonly package: osdistributionpackage;
  /** the architecture seats of the seventeen-seat standard the
   * seat rides (the arch pairing the container matrix reads). */
  readonly archs: readonly string[];
  /** the engine plan profiles the seat binds (the tier law — the ids
   * reuse the engineplans table, never a duplicated tier list). */
  readonly profiles: readonly EngineProfileId[];
  /** whether the seat presents a vgpu path through the virtual drivers
   * (the vgpu law: a virtual device the engine presents, never the
   * visitor machine's own gpu). */
  readonly vgpu: boolean;
  /** whether the seat rides the virtual cpu bank (the vcpu law: the
   * engine presents the virtual cpus the plan allocates — the count
   * arrives from the engine plan profile, never hardcoded here). */
  readonly vcpu: boolean;
  /** the honest note the catalog prints for the row. */
  readonly note: string;
}

/** the engine plan profile ids the os distribution seats bind — derived
 * from the engineplans table itself (the reuse law: the max, balanced
 * and lite tier ids stay the engineplans table's own, the catalog never
 * duplicates a tier list). */
export const OSDISTRIBUTIONPROFILEIDS: readonly EngineProfileId[] = Object.freeze(ENGINEPLANS.map((row) => row.id));

/** the sixteen rows of the os distribution catalog — every system the
 * owner's law names inside the saddle container plus the nine honest
 * additions the more-than-fifteen directive rides, one honest row
 * each with its true fact, its arch pairing and its tier binding:
 * the mobile seats (grapheneos, android, postmarketos, lineageos,
 * calyxos) and the firmware seat (maru os) ride the arm64 legs, the
 * desktop and baseline seats (omarchy, vanilla os, archlinux,
 * debian, fedora, nixos, linux) ride the amd64 and arm64 legs, the
 * musl seats (alpine, void) answer the musl legs beside them, the
 * v seat rides the amd64 and arm64 legs beside its binary targets,
 * and every seat binds the full engine plan trio (the tier axis
 * scales the virtual hardware plan, never the catalog). */
export const OSDISTRIBUTIONS: readonly osdistributionrow[] = Object.freeze([
  {
    id: "grapheneos",
    label: "grapheneos",
    kind: "mobile",
    base: "android",
    package: "apk",
    archs: ["linux-arm64", "darwin-arm64-v8"],
    profiles: OSDISTRIBUTIONPROFILEIDS,
    vgpu: true,
    vcpu: true,
    note: "grapheneos is a privacy and security hardened version of android: the hardened mobile seat the catalog carries on the arm64 legs the standard answers.",
  },
  {
    id: "omarchy",
    label: "omarchy",
    kind: "desktop",
    base: "arch linux",
    package: "pacman",
    archs: ["linux-x64", "linux-x64-musl", "linux-arm64"],
    profiles: OSDISTRIBUTIONPROFILEIDS,
    vgpu: true,
    vcpu: true,
    note: "omarchy is the arch linux-based distribution created by dhh: the desktop seat the catalog carries with the pacman package grammar on the amd64 and arm64 legs.",
  },
  {
    id: "vanillaos",
    label: "vanilla os",
    kind: "distribution",
    base: "ubuntu",
    package: "apt",
    archs: ["linux-x64", "linux-x64-musl", "linux-arm64"],
    profiles: OSDISTRIBUTIONPROFILEIDS,
    vgpu: true,
    vcpu: true,
    note: "vanilla os is based on ubuntu: the atomic desktop seat the catalog carries beside the plain linux baseline on the amd64 and arm64 legs.",
  },
  {
    id: "maruos",
    label: "maru os",
    kind: "firmware",
    base: "android firmware with a debian desktop",
    package: "abuild",
    archs: ["linux-arm64", "darwin-arm64-v8"],
    profiles: OSDISTRIBUTIONPROFILEIDS,
    vgpu: false,
    vcpu: true,
    note: "maru os is firmware, not an application: the catalog carries the seat honestly on the arm64 legs, the engine never installs it as a guest application.",
  },
  {
    id: "v",
    label: "v",
    kind: "languageos",
    base: "the v language platform (vlang, the 0.5.2 catalog seat)",
    package: "vpm",
    archs: ["linux-x64", "linux-arm64", "darwin-arm64", "darwin-x64", "windows-x64", "wasm32"],
    profiles: OSDISTRIBUTIONPROFILEIDS,
    vgpu: false,
    vcpu: true,
    note: "the v seat names the v language platform the dependency catalog pins at 0.5.2, never a guest distribution: the languagev compiler seat of the ninety modalities answers it (the owner's nickname law).",
  },
  {
    id: "linux",
    label: "linux",
    kind: "distribution",
    base: "the plain linux baseline the engine container rides",
    package: "apt",
    archs: ["linux-x64", "linux-x64-musl", "linux-arm64", "linux-riscv64"],
    profiles: OSDISTRIBUTIONPROFILEIDS,
    vgpu: true,
    vcpu: true,
    note: "the normal linux seat: the default distribution the saddle container itself rides (the container lane law), every linux seat the standard carries answers it.",
  },
  {
    id: "android",
    label: "android",
    kind: "mobile",
    base: "the android application platform",
    package: "apk",
    archs: ["linux-arm64", "darwin-arm64-v8"],
    profiles: OSDISTRIBUTIONPROFILEIDS,
    vgpu: true,
    vcpu: true,
    note: "the android seat: the mobile platform the grapheneos hardening builds on, the catalog carries it on the arm64 legs the standard answers.",
  },
  {
    id: "postmarketos",
    label: "postmarketos",
    kind: "mobile",
    base: "alpine linux",
    package: "apk",
    archs: ["linux-arm64", "darwin-arm64-v8"],
    profiles: OSDISTRIBUTIONPROFILEIDS,
    vgpu: true,
    vcpu: true,
    note: "postmarketos is the alpine-based mobile distribution real devices boot: the community mobile seat the catalog carries on the arm64 legs.",
  },
  {
    id: "lineageos",
    label: "lineageos",
    kind: "mobile",
    base: "android",
    package: "apk",
    archs: ["linux-arm64", "darwin-arm64-v8"],
    profiles: OSDISTRIBUTIONPROFILEIDS,
    vgpu: true,
    vcpu: true,
    note: "lineageos is the community android continuation: the aftermarket mobile seat on the arm64 legs.",
  },
  {
    id: "calyxos",
    label: "calyxos",
    kind: "mobile",
    base: "android",
    package: "apk",
    archs: ["linux-arm64", "darwin-arm64-v8"],
    profiles: OSDISTRIBUTIONPROFILEIDS,
    vgpu: true,
    vcpu: true,
    note: "calyxos is the privacy-focused android distribution: the hardened mobile seat beside grapheneos.",
  },
  {
    id: "archlinux",
    label: "archlinux",
    kind: "desktop",
    base: "arch linux",
    package: "pacman",
    archs: ["linux-x64", "linux-arm64"],
    profiles: OSDISTRIBUTIONPROFILEIDS,
    vgpu: true,
    vcpu: true,
    note: "archlinux is the rolling-release distribution omarchy builds on: the pacman desktop seat on the amd64 and arm64 legs.",
  },
  {
    id: "alpine",
    label: "alpine",
    kind: "distribution",
    base: "musl libc busybox",
    package: "apk",
    archs: ["linux-x64", "linux-arm64", "linux-x64-musl", "linux-riscv64"],
    profiles: OSDISTRIBUTIONPROFILEIDS,
    vgpu: true,
    vcpu: true,
    note: "alpine is the musl-based lightweight distribution: the small-footprint seat the musl legs answer.",
  },
  {
    id: "debian",
    label: "debian",
    kind: "desktop",
    base: "the debian project",
    package: "apt",
    archs: ["linux-x64", "linux-arm64"],
    profiles: OSDISTRIBUTIONPROFILEIDS,
    vgpu: true,
    vcpu: true,
    note: "debian is the universal operating system: the apt desktop seat the widest hardware matrix answers.",
  },
  {
    id: "fedora",
    label: "fedora",
    kind: "desktop",
    base: "red hat linux upstream",
    package: "rpm",
    archs: ["linux-x64", "linux-arm64"],
    profiles: OSDISTRIBUTIONPROFILEIDS,
    vgpu: true,
    vcpu: true,
    note: "fedora is the red-hat-upstream community distribution: the rpm desktop seat beside the apt rows.",
  },
  {
    id: "nixos",
    label: "nixos",
    kind: "distribution",
    base: "the nix package manager",
    package: "nix",
    archs: ["linux-x64", "linux-arm64"],
    profiles: OSDISTRIBUTIONPROFILEIDS,
    vgpu: true,
    vcpu: true,
    note: "nixos is the declarative distribution the nix package manager builds: the reproducible-system seat the catalog carries.",
  },
  {
    id: "void",
    label: "void",
    kind: "distribution",
    base: "xbps",
    package: "xbps",
    archs: ["linux-x64", "linux-arm64", "linux-x64-musl"],
    profiles: OSDISTRIBUTIONPROFILEIDS,
    vgpu: true,
    vcpu: true,
    note: "void is the independent source-rolling distribution: the xbps seat the musl legs answer beside alpine.",
  },
]);

/** the count of the os distribution catalog — derived from the rows'
 * real length, never a hardcoded count. */
export const OSDISTRIBUTIONCOUNT = OSDISTRIBUTIONS.length;

/** the plan-resource law the os distribution catalog answers (the
 * owner's law: "por exemplo, 50gb por plano via config") — the storage
 * quota is PLAN CONFIG data the devthink system plan logic owns (the
 * example row names 50), never an engine cap: the engine limits law of
 * engineplans.ts rides the row verbatim (the reuse law — the engines
 * stay unlimited on every axis). */
export interface osdistributionplanlaw {
  /** the example per-plan storage quota the owner's law names (50 gb)
   * — plan config data a plan row stamps, never an engine cap. */
  readonly examplestoragegb: 50;
  /** where the quota lives: the devthink system plan logic (config). */
  readonly quotaowner: "devthink";
  /** the engine side of the law — the engineplans limits law verbatim:
   * unlimited on every axis, no ceiling ever bakes into the catalog. */
  readonly enginelimits: EngineLimitsLaw;
}

/** the plan-resource law of record (the osdistrib law): the 50 gb per
 * plan example is config data the plan rows stamp, the engine itself
 * stays unlimited. */
export const OSDISTRIBUTIONPLANLAW: osdistributionplanlaw = Object.freeze({
  examplestoragegb: 50,
  quotaowner: "devthink",
  enginelimits: ENGINELIMITS,
});

/** answers one os distribution row by seat id — undefined when the id
 * is not one of the sixteen the catalog carries.
 *
 * @param id the seat id (grapheneos, omarchy, vanillaos, maruos, v,
 *   linux, android, postmarketos, lineageos, calyxos, archlinux,
 *   alpine, debian, fedora, nixos, void).
 * @returns the row, or undefined for an unknown id.
 */
export function getosdistribution(id: string): osdistributionrow | undefined {
  return OSDISTRIBUTIONS.find((row) => row.id === id);
}

/** the coded refusal of the catalog resolver: a system seat the
 * catalog does not carry. The name carries the catalog's shape so the
 * message names the law (the sixteen seats), never a bare invalid-input. */
export function osdistributionerror(id: string): Error & { code: string } {
  const error = new Error(
    `the os distribution catalog carries no system seat "${id}": the sixteen seats the owner's law names are ${OSDISTRIBUTIONIDS.join(", ")}`,
  ) as Error & { code: string };
  error.name = "osdistributionerror";
  error.code = "OS_DISTRIBUTION_UNKNOWN";
  return error;
}

/** resolves the distribution the caller asked for against the catalog:
 * an undefined or null input answers the linux row (the normal baseline
 * the container lane itself rides), a known id answers its row, and
 * anything else throws the coded OS_DISTRIBUTION_UNKNOWN refusal naming
 * the sixteen seats — the resolver never silently rewrites the caller's
 * distribution.
 *
 * @param input the caller system seat id (the drivers and the modality
 *   seats hand it through).
 * @returns the honest row of the catalog.
 */
export function resolveosdistribution(input: unknown): osdistributionrow {
  if (input === undefined || input === null) return getosdistribution("linux") as osdistributionrow;
  if (typeof input !== "string") throw osdistributionerror(String(input));
  const row = getosdistribution(input.trim().toLowerCase());
  if (row === undefined) throw osdistributionerror(input);
  return row;
}

/** answers the os distribution seats that ride one architecture seat
 * of the seventeen-seat standard (the arch join the modality
 * system reads when it hosts a distribution on a seat).
 *
 * @param arch the architecture seat id (a containerarch id).
 * @returns the distribution rows that carry the seat, catalog order.
 */
export function osdistributionsforarch(arch: string): readonly osdistributionrow[] {
  return OSDISTRIBUTIONS.filter((row) => row.archs.includes(arch));
}

/** answers the os distribution seats that ride one engine plan profile
 * of the tier axis (the profile join — every seat binds the full trio
 * the engineplans table names: the tier scales the virtual hardware
 * plan, never the catalog).
 *
 * @param profile the engine plan profile id (max, balanced or lite).
 * @returns the distribution rows that bind the profile, catalog order.
 * @throws the coded refusal when the profile is not one of the trio
 *   the engineplans table owns.
 */
export function osdistributionsforprofile(profile: string): readonly osdistributionrow[] {
  if (!OSDISTRIBUTIONPROFILEIDS.includes(profile as EngineProfileId)) {
    throw Object.assign(
      new Error(
        `the engine plan trio carries no profile "${profile}": the profiles the engineplans table names are ${OSDISTRIBUTIONPROFILEIDS.join(", ")}`,
      ),
      { code: "OS_DISTRIBUTION_PROFILE_UNKNOWN" },
    );
  }
  return OSDISTRIBUTIONS.filter((row) => row.profiles.includes(profile as EngineProfileId));
}

/** answers the docker arch legs one os distribution seat rides — the
 * honest join of the seat's architecture pairings against the standard
 * (the amd64 and arm64 legs the owner's law names): every carried seat
 * the row pairs contributes its dockerarch leg, the target seats the
 * row pairs contribute none (the binary and npm lanes own them).
 *
 * @param id the seat id of the catalog.
 * @returns the distinct docker arch legs the seat rides in the
 *   standard's own row order, empty for an unknown id.
 */
export function osdistributiondockerarchs(id: string): readonly string[] {
  const row = getosdistribution(id);
  if (row === undefined) return Object.freeze([]);
  const legs = CONTAINERARCHES.filter(
    (seat) => seat.availability === "carried" && seat.dockerarch.length > 0 && row.archs.includes(seat.id),
  ).map((seat) => seat.dockerarch);
  return Object.freeze([...new Set(legs)]);
}

/** the honest coverage report of the os distribution catalog: the count
 * the owner's law charges (sixteen), the architecture seats of the
 * standard the catalog pairs, the engine plan trio every seat binds,
 * the plan-resource law of record and the per-seat rows with their
 * derived docker legs — the report the container lanes stamp and the
 * tests pin. */
export interface osdistributionreport {
  /** the system seats the catalog covers (sixteen). */
  count: number;
  /** the distinct architecture seats of the standard the catalog pairs,
   * in the standard's own order. */
  arches: readonly string[];
  /** the engine plan profiles every seat binds (the engineplans trio). */
  profiles: readonly EngineProfileId[];
  /** the plan-resource law of record (the 50 gb example as plan config,
   * the engine unlimited). */
  planlaw: osdistributionplanlaw;
  /** the per-seat coverage rows (id, label, kind, base, package, archs,
   * docker legs, profiles, vgpu, vcpu, note). */
  rows: readonly {
    id: string;
    label: string;
    kind: osdistributionkind;
    base: string;
    package: osdistributionpackage;
    archs: readonly string[];
    dockerarchs: readonly string[];
    profiles: readonly EngineProfileId[];
    vgpu: boolean;
    vcpu: boolean;
    note: string;
  }[];
}

/** answers the honest coverage report of the os distribution catalog —
 * the sixteen system seats with their arch pairings joined to the docker
 * legs, the tier binding reused from the engineplans table and the
 * plan-resource law riding as config data. */
export function osdistributioncoverage(): osdistributionreport {
  const arches = CONTAINERARCHIDS.filter((id) => OSDISTRIBUTIONS.some((row) => row.archs.includes(id)));
  return {
    count: OSDISTRIBUTIONS.length,
    arches: Object.freeze(arches),
    profiles: OSDISTRIBUTIONPROFILEIDS,
    planlaw: OSDISTRIBUTIONPLANLAW,
    rows: Object.freeze(
      OSDISTRIBUTIONS.map((row) => ({
        id: row.id,
        label: row.label,
        kind: row.kind,
        base: row.base,
        package: row.package,
        archs: row.archs,
        dockerarchs: osdistributiondockerarchs(row.id),
        profiles: row.profiles,
        vgpu: row.vgpu,
        vcpu: row.vcpu,
        note: row.note,
      })),
    ),
  };
}

/** renders the os distribution catalog as report lines (the container
 * lanes append these under their profile line so every run answers the
 * sixteen system seats the owner's law names inside the saddle). */
export function osdistributionlines(): string[] {
  const coverage = osdistributioncoverage();
  return [
    `  os distributions: ${coverage.count} system seats the saddle container carries (every seat binds the ${coverage.profiles.join("/")} engine plan trio, the plan law keeps 50gb an example of plan config — the engine unlimited)`,
    ...coverage.rows.map(
      (row) =>
        `    ${row.id.padEnd(11)} ${row.kind.padEnd(13)} ${row.dockerarchs.join("+").padEnd(15)} ${row.vgpu ? "vgpu" : "no vgpu"}  ${row.note}`,
    ),
  ];
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the resolver and the coverage report the drivers read.  */
/* ════════════════════════════════════════════════════════════════════ */

/** answers one row of the standard by seat id — undefined when the id
 * is not one of the seventeen the owner's law names.
 *
 * @param id the seat id (linux-x64, darwin-arm64, ...).
 * @returns the row, or undefined for an unknown id.
 */
export function getcontainerarch(id: string): containerarchrow | undefined {
  return CONTAINERARCHES.find((row) => row.id === id);
}

/** the coded refusal of the resolver: an architecture the standard does
 * not carry. The name carries the standard's shape so the message names
 * the law (the seventeen seats), never a bare invalid-input. */
export function containerarcherror(id: string): Error & { code: string } {
  const error = new Error(
    `the seventeen-seat architecture standard carries no seat "${id}": the seventeen seats the owner's law names are ${CONTAINERARCHIDS.join(", ")}`,
  ) as Error & { code: string };
  error.name = "containerarcherror";
  error.code = "CONTAINER_ARCH_UNKNOWN";
  return error;
}

/** resolves the architecture the caller asked for against the standard:
 * an undefined or null input answers the linux-x64 default row (the
 * standard's first seat), a known id answers its row, and anything
 * else throws the coded CONTAINER_ARCH_UNKNOWN refusal naming the
 * seventeen seats — the resolver never silently rewrites the caller's
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
 * law charges (seventeen), the count the pinned base carries, the
 * per-seat rows with their platform specs and availability, and the
 * driver pair the rows serve. Pure data, frozen — the report the
 * drivers stamp on every profile run. */
export interface containerarchreport {
  /** the architecture seats the standard covers (seventeen). */
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

/** answers the honest coverage report of the seventeen-seat architecture
 * standard — the table the drivers stamp on every run and the tests pin:
 * seventeen rows, every seat exactly once, the platform specs honest per
 * seat and the availability following the pinned bases. */
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
 * under their profile line so every run answers the seventeen-seat law
 * of the archos-grown standard). */
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
