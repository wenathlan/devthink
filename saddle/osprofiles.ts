// # osprofiles.ts — the guest operating system host profiles of the
// saddle engine (the pr15 catalog law grown by the archos wave): the
// operating systems the
// sandbox modalities may host inside the engine, catalogued only — the
// engine never installs a host distribution, the catalog answers the
// profile rows the modality seats and the container lanes stamp (the
// os profile an edge run requests, the guest identity a microvm boots,
// the host vocabulary the console answers). Every row is pure data:
// the id, the display name, the kind, the upstream base, the package
// format the profile answers, the architectures of the seventeen-seat
// standard the profile carries and the honest note the spec pins.
//
// THE CATALOG LAW (pr15): the spec names the guest vocabulary —
// grapheneos (a privacy and security hardened version of android),
// omarchy (the arch linux-based distribution created by dhh), maru os
// (firmware, not an application), vanilla os (based on ubuntu), the v
// seat (the v language engine target, the vlang platform), plain
// linux, windows and android. the catalog carries every one with its
// honest kind: maru os declares firmware (a phone firmware that
// virtualizes the desktop, never an application the engine installs),
// the v seat declares languageos (the v platform target the languagev
// compiler seat of the ninety modalities answers — the owner's law:
// the "v" names no guest distribution, it names the language engine).
//
// THE VISITOR LAW (the critical law of the engine): the catalog is
// read-only data about the machines the ENGINE hosts on the
// self-hosted edge — nothing here ever describes, reads or touches the
// visitor machine (no visitor gpu, no visitor cpu, no visitor browser,
// no visitor local storage, no localforage — the engine owns every
// cycle it spends on its own twenty-four hour internet infrastructure
// via saddle and vault edge processing).
//
// Pure data and pure functions: zero storage, zero node-only imports,
// the browser-pure bundle keeps carrying it.

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the catalog contracts.                                    */
/* ════════════════════════════════════════════════════════════════════ */

/** The kind of host profile one row declares — the honest class the
 * spec pins (a firmware is never an application, a language os seat is
 * never a guest distribution). */
export type OSProfileKind = "distribution" | "firmware" | "languageos" | "desktop" | "mobile";

/** The package format the host profile answers (the installer grammar
 * the modality seats may mount inside the sandbox). */
export type OSProfilePackage = "apk" | "apt" | "pacman" | "abuild" | "exe" | "msi" | "vpm" | "rpm" | "nix" | "xbps" | "none";

/** One guest operating system host profile of the catalog. */
export interface OSProfileRecord {
  /** The stable id the modality seats and the config rows reference. */
  readonly id: string;
  /** The display name (short, lowercase). */
  readonly name: string;
  /** The honest kind of the profile (the catalog law). */
  readonly kind: OSProfileKind;
  /** The upstream base the profile builds on (the spec facts). */
  readonly base: string;
  /** The package format the profile answers. */
  readonly package: OSProfilePackage;
  /** The architecture seats of the seventeen-seat standard the
   * profile carries (the containerarch ids). */
  readonly archs: readonly string[];
  /** Whether the profile presents a gpu path through the virtual drivers. */
  readonly gpu: boolean;
  /** The honest note the spec pins for the profile. */
  readonly note: string;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the catalog rows — the guest vocabulary the spec names.  */
/* ════════════════════════════════════════════════════════════════════ */

/** The guest operating system host profiles of the engine (the pr15
 * catalog): the seventeen profiles the spec names — the eight the first wave stamped beside the nine honest osdistrib additions the owner more-than-fifteen directive rides — every one a catalog row
 * the modality seats may host — the engine presents the profile, the
 * sandbox boots it on the self-hosted edge, the visitor machine never
 * lends its own hardware (the critical law). */
export const OSPROFILES: readonly OSProfileRecord[] = Object.freeze([
  {
    id: "linux",
    name: "linux",
    kind: "distribution",
    base: "the plain linux baseline the engine container rides",
    package: "apt",
    archs: ["linux-x64", "linux-arm64", "linux-x64-musl", "linux-riscv64", "linux-ppc64le", "linux-s390x"],
    gpu: true,
    note: "the normal linux guest: the default host profile the sandbox lanes boot (the seventeen-seat standard carries the linux seats, the ppc64le and s390x legs the archos wave seated beside the riscv64 leg the baseline already answered).",
  },
  {
    id: "grapheneos",
    name: "grapheneos",
    kind: "mobile",
    base: "android",
    package: "apk",
    archs: ["linux-arm64", "linux-arm64-v8"],
    gpu: true,
    note: "grapheneos is a privacy and security hardened version of android: the hardened mobile guest the sandbox may host for android-shaped workloads.",
  },
  {
    id: "omarchy",
    name: "omarchy",
    kind: "desktop",
    base: "arch linux",
    package: "pacman",
    archs: ["linux-x64", "linux-x64-musl", "linux-arm64", "linux-ppc64le", "linux-s390x"],
    gpu: true,
    note: "omarchy is the arch linux-based distribution created by dhh: the desktop guest profile the sandbox may host with the pacman package grammar, the ppc64le and s390x legs the archos wave seated beside the amd64 and arm64 legs the desktop seat already answered.",
  },
  {
    id: "maruos",
    name: "maru os",
    kind: "firmware",
    base: "android firmware with a debian desktop",
    package: "abuild",
    archs: ["linux-arm64", "linux-arm64-v8"],
    gpu: false,
    note: "maru os is firmware, not an application: the catalog carries the profile honestly, the engine never installs it as a guest application.",
  },
  {
    id: "vanillaos",
    name: "vanilla os",
    kind: "distribution",
    base: "ubuntu",
    package: "apt",
    archs: ["linux-x64", "linux-x64-musl", "linux-arm64", "linux-ppc64le", "linux-s390x"],
    gpu: true,
    note: "vanilla os is based on ubuntu: the atomic desktop guest profile the sandbox may host beside the plain linux baseline, the ppc64le and s390x legs the archos wave seated beside the amd64 and arm64 legs.",
  },
  {
    id: "v",
    name: "v",
    kind: "languageos",
    base: "the v language platform (vlang)",
    package: "vpm",
    archs: ["linux-x64", "linux-arm64", "darwin-arm64", "darwin-x64", "windows-x64", "wasm32"],
    gpu: false,
    note: "the v seat names the v language engine target, never a guest distribution: the languagev compiler seat of the ninety modalities answers it (the owner's nickname law).",
  },
  {
    id: "windows",
    name: "windows",
    kind: "distribution",
    base: "the windows guest the exe seats execute",
    package: "exe",
    archs: ["windows-x64", "windows-arm64", "windows-x64-gnu"],
    gpu: true,
    note: "the windows guest profile: the exe execution seats and the windows architecture seats of the standard host it inside the sandbox, never on the visitor machine.",
  },
  {
    id: "android",
    name: "android",
    kind: "mobile",
    base: "the android application platform",
    package: "apk",
    archs: ["linux-arm64", "linux-arm64-v8"],
    gpu: true,
    note: "the android guest profile: the mobile lanes and the grapheneos profile build on it (the sandbox hosts android-shaped workloads on the edge).",
  },
  {
    id: "postmarketos",
    name: "postmarketos",
    kind: "mobile",
    base: "alpine linux",
    package: "apk",
    archs: ["linux-arm64", "linux-arm64-v8", "linux-x64"],
    gpu: false,
    note: "postmarketos is the alpine-based mobile distribution real devices boot: the community mobile seat the catalog carries beside lineageos and calyxos, never a runnable container base — the lane publishes the profile config the engine reads.",
  },
  {
    id: "lineageos",
    name: "lineageos",
    kind: "mobile",
    base: "android",
    package: "apk",
    archs: ["linux-arm64", "linux-arm64-v8"],
    gpu: false,
    note: "lineageos is the community android continuation: the aftermarket mobile seat on the arm64 legs the sandbox hosts on the self-hosted edge.",
  },
  {
    id: "calyxos",
    name: "calyxos",
    kind: "mobile",
    base: "android",
    package: "apk",
    archs: ["linux-arm64", "linux-arm64-v8"],
    gpu: false,
    note: "calyxos is the privacy-focused android distribution: the hardened mobile seat beside grapheneos the sandbox may host, never the visitor machine.",
  },
  {
    id: "archlinux",
    name: "archlinux",
    kind: "desktop",
    base: "arch linux",
    package: "pacman",
    archs: ["linux-x64", "linux-arm64", "linux-ppc64le", "linux-s390x"],
    gpu: true,
    note: "archlinux is the rolling-release distribution omarchy builds on: the pacman desktop seat on the amd64 and arm64 legs the catalog carries, the ppc64le and s390x legs the archos wave seated beside them.",
  },
  {
    id: "alpine",
    name: "alpine",
    kind: "distribution",
    base: "musl libc busybox",
    package: "apk",
    archs: [
      "linux-x64",
      "linux-arm64",
      "linux-x64-musl",
      "linux-arm64-musl",
      "linux-riscv64",
      "linux-ppc64le",
      "linux-s390x",
      "linux-armv7",
      "linux-armv6",
      "linux-386",
    ],
    gpu: false,
    note: "alpine is the musl-based lightweight distribution: the small-footprint seat the musl legs answer, the postmarketos base the mobile seat builds on — the widest arch pairing the catalog carries (the ppc64le, s390x, armv7, armv6 and 386 seats the archos wave seated, the armv7/armv6/386 package grammar the musl distro's apk repositories honestly ship).",
  },
  {
    id: "debian",
    name: "debian",
    kind: "desktop",
    base: "the debian project",
    package: "apt",
    archs: ["linux-x64", "linux-arm64", "linux-riscv64", "linux-ppc64le", "linux-s390x"],
    gpu: true,
    note: "debian is the universal operating system: the apt desktop seat the widest hardware matrix answers, the vanillaos upstream the atomic seat builds on — the s390x leg the archos wave seated beside the ppc64le and riscv64 legs the seat already carried.",
  },
  {
    id: "fedora",
    name: "fedora",
    kind: "desktop",
    base: "red hat linux upstream",
    package: "rpm",
    archs: ["linux-x64", "linux-arm64", "linux-ppc64le", "linux-s390x"],
    gpu: true,
    note: "fedora is the red-hat-upstream community distribution: the rpm desktop seat beside the apt rows the package grammar grows, the ppc64le and s390x legs the archos wave seated beside the amd64 and arm64 legs.",
  },
  {
    id: "nixos",
    name: "nixos",
    kind: "distribution",
    base: "the nix package manager",
    package: "nix",
    archs: ["linux-x64", "linux-arm64", "linux-ppc64le", "linux-s390x"],
    gpu: false,
    note: "nixos is the declarative distribution the nix package manager builds: the reproducible-system seat the catalog carries, the package grammar the nix rows answer — the ppc64le and s390x legs the archos wave seated beside the amd64 and arm64 legs.",
  },
  {
    id: "void",
    name: "void",
    kind: "distribution",
    base: "xbps",
    package: "xbps",
    archs: ["linux-x64", "linux-arm64", "linux-x64-musl", "linux-arm64-musl", "linux-ppc64le", "linux-s390x"],
    gpu: false,
    note: "void is the independent source-rolling distribution: the xbps seat the musl legs answer beside alpine, the package grammar the xbps rows grow — the ppc64le and s390x legs the archos wave seated beside them.",
  }
]);

/** The count of the catalog — derived from the rows' real length. */
export const OSPROFILECOUNT = OSPROFILES.length;

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: the catalog resolvers — pure functions the seats read.   */
/* ════════════════════════════════════════════════════════════════════ */

/**
 * Answers one host profile by id (the modality seats and the config
 * rows carry ids).
 *
 * @param id the host profile id (for example "grapheneos").
 * @returns the profile record, or undefined when the id is unknown.
 */
export function getosprofile(id: string): OSProfileRecord | undefined {
  return OSPROFILES.find((profile) => profile.id === id);
}

/**
 * Answers the host profiles that carry one architecture seat of the
 * seventeen-seat standard (the arch join of the catalog).
 *
 * @param arch the architecture id (a containerarch id).
 * @returns the profile records that carry the seat, catalog order.
 */
export function osprofilesforarch(arch: string): readonly OSProfileRecord[] {
  return OSPROFILES.filter((profile) => profile.archs.includes(arch));
}

/**
 * Answers the host profiles that present a gpu path (the gpu join the
 * vgpu and gpu seats read when they host a guest).
 *
 * @returns the profile records that carry a gpu path.
 */
export function osprofileswithgpu(): readonly OSProfileRecord[] {
  return OSPROFILES.filter((profile) => profile.gpu);
}

/**
 * Validates one host profile request (the catalog gate): unknown ids
 * and unsupported architectures answer the coded refusal, so a lane
 * never boots a profile the catalog does not carry.
 *
 * @param id the host profile id the run requested.
 * @param arch the architecture seat the run requested (optional).
 * @returns the profile record on success.
 * @throws a typed error naming the catalog law when the request does
 *   not resolve (never a silent fallback).
 */
export function resolveosprofile(id: string, arch?: string): OSProfileRecord {
  const profile = getosprofile(id);
  if (profile === undefined) {
    throw Object.assign(new Error(`the host profile ${id} is unknown to the os profile catalog`), {
      code: "OS_PROFILE_UNKNOWN",
    });
  }
  if (arch !== undefined && !profile.archs.includes(arch)) {
    throw Object.assign(
      new Error(`the host profile ${id} carries no ${arch} seat of the seventeen-seat standard`),
      { code: "OS_PROFILE_ARCH_ABSENT" },
    );
  }
  return profile;
}
