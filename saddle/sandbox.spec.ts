/**
 * sandbox.spec.ts — the declarative sandbox specification of saddle.
 *
 * a saddle sandbox is declared, never assembled: one request names the
 * base (max, balanced or lite), the guest operating system (android,
 * grapheneos, linux, omarchy, windows), the cpu architecture (arm64 or
 * amd64), the runtime form (runtime-node, full-docker, published) and
 * the optional resource wishes (vcpus, ramgb, vgpu, diskgb, timeout,
 * networking). this module owns that vocabulary: it validates one
 * declared spec against a caller supplied limits table and resolves it
 * into concrete values the engine surface consumes.
 *
 * nothing about capacities lives in code: the limits table is a plain
 * parameter (config, environment or database). the environment adapter
 * lives in sandbox.spec.env.ts (SADDLE_SPEC_LIMITS json over a
 * documented bootstrap table).
 *
 * the module is browser-pure like sandbox.ts: zero imports, zero dom,
 * zero node builtins, deterministic verdicts. errors are typed and
 * traceable — every sandboxspecerror carries a machine readable code,
 * the offending field, the received value and the expectation missed.
 *
 * competitor sources shaping the contract: opensandbox-group/
 * opensandbox (declared timeoutSeconds bounded by the server side
 * max_sandbox_timeout_seconds; declared resources on the create
 * request) and daytonaio/daytona (per-sandbox cpu/memory/disk quota
 * fields with min=1 validation; gpu admission before create).
 *
 * wire points (kept honest): web.server.ts createsandbox validates the
 * optional base/os/arch/form fields here before building the engine
 * spec; sandbox.ts createSandboxState stays the hardware identity
 * layer and receives the resolved vcpus/ramgb untouched.
 */

/* ------------------------------------------------------------------ */
/* types: the declared vocabulary                                      */
/* ------------------------------------------------------------------ */

/** the three runtime bases of the saddle fleet. */
export type sandboxbaseid = 'max' | 'balanced' | 'lite';

/** the guest operating systems a sandbox can boot. */
export type sandboxosid = 'android' | 'grapheneos' | 'linux' | 'omarchy' | 'windows';

/** the guest cpu architectures (amd64 == the x86_64 of the engine bank). */
export type sandboxarchid = 'arm64' | 'amd64';

/** the runtime forms of a published sandbox. */
export type sandboxformid = 'runtime-node' | 'full-docker' | 'published';

/** the networking modes of a sandbox. */
export type sandboxnetworkid = 'nat' | 'bridged' | 'isolated';

/** the os family a guest belongs to (android builds on the linux kernel). */
export type sandboxosfamily = 'android' | 'linux' | 'windows';

/** fixed product vocabulary; only the capacities are configuration. */
export const SANDBOXBASES: readonly sandboxbaseid[] = ['max', 'balanced', 'lite'];
export const SANDBOXOSES: readonly sandboxosid[] = [
  'android', 'grapheneos', 'linux', 'omarchy', 'windows',
];
export const SANDBOXARCHES: readonly sandboxarchid[] = ['arm64', 'amd64'];
export const SANDBOXFORMS: readonly sandboxformid[] = [
  'runtime-node', 'full-docker', 'published',
];
export const SANDBOXNETWORKS: readonly sandboxnetworkid[] = ['nat', 'bridged', 'isolated'];

/* ------------------------------------------------------------------ */
/* types: the limits table (pure configuration, never hardcoded)       */
/* ------------------------------------------------------------------ */

/** one base row of the limits table: ceilings and defaults per base. */
export type sandboxbaselimit = {
  readonly maxvcpus: number;
  readonly maxramgb: number;
  readonly maxvgpus: number;
  readonly maxdiskgb: number;
  readonly maxtimeoutseconds: number;
  readonly defaultvcpus: number;
  readonly defaultramgb: number;
};

/** the full limits table handed to the resolver by the caller. */
export type sandboxspeclimits = {
  readonly bases: Readonly<Record<sandboxbaseid, sandboxbaselimit>>;
  readonly defaulttimeoutseconds?: number;
};

/** the declared request shape (every field is optional or unknown). */
export type sandboxspecinput = Record<string, unknown>;

/** the resolved spec: concrete values validated against the limits. */
export type resolvedsandboxspec = {
  readonly base: sandboxbaseid;
  readonly os: sandboxosid;
  readonly arch: sandboxarchid;
  readonly form: sandboxformid;
  readonly networking: sandboxnetworkid;
  readonly family: sandboxosfamily;
  readonly vcpus: number;
  readonly ramgb: number;
  readonly vgpu: boolean;
  readonly diskgb: number | null;
  readonly timeoutseconds: number;
};

/* ------------------------------------------------------------------ */
/* errors: typed and traceable                                         */
/* ------------------------------------------------------------------ */

/** every failure code the resolver can produce. */
export type sandboxspecerrorcode =
  | 'invalid-spec'
  | 'missing-base'
  | 'invalid-base'
  | 'invalid-os'
  | 'invalid-arch'
  | 'invalid-form'
  | 'invalid-networking'
  | 'invalid-vcpus'
  | 'invalid-ramgb'
  | 'invalid-vgpu'
  | 'invalid-diskgb'
  | 'invalid-timeout'
  | 'timeout-above-limit'
  | 'vgpu-not-available'
  | 'unknown-base-limits';

/** the typed spec failure: code, field, received value and expectation. */
export class sandboxspecerror extends Error {
  /** machine readable failure code. */
  readonly code: sandboxspecerrorcode;
  /** the declared field that failed (or 'spec' for envelope failures). */
  readonly field: string;
  /** the received value, json-safe. */
  readonly value: unknown;
  /** the expectation the value missed. */
  readonly expected: string;

  constructor(
    code: sandboxspecerrorcode,
    field: string,
    value: unknown,
    expected: string,
    message?: string,
  ) {
    super(message ?? `sandbox spec field "${field}" ${expected} (received ${show(value)})`);
    this.name = 'sandboxspecerror';
    this.code = code;
    this.field = field;
    this.value = value;
    this.expected = expected;
  }
}

/** renders a json-safe preview of any received value for error messages. */
function show(value: unknown): string {
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
    return String(value);
  }
  if (value === undefined) {
    return 'undefined';
  }
  return Array.isArray(value) ? 'an array' : typeof value;
}

/** picks the matching member of a fixed vocabulary; undefined otherwise. */
function memberof<t extends string>(vocabulary: readonly t[], value: unknown): t | undefined {
  return typeof value === 'string'
    ? (vocabulary.find((item) => item === value) as t | undefined)
    : undefined;
}

/** validates a positive integer wish; null when the shape is wrong. */
function positiveinteger(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 ? value : null;
}

/* ------------------------------------------------------------------ */
/* the resolver                                                        */
/* ------------------------------------------------------------------ */

/**
 * validates one declared spec against the limits table and resolves it
 * into concrete values. the verdict is a discriminated result so
 * callers surface the typed error without try/catch.
 *
 * @param input the declared spec (unknown json is tolerated).
 * @param limits the limits table (config, env or database sourced).
 * @returns the resolved spec or the typed, traceable error.
 */
export function resolvesandboxspec(
  input: unknown,
  limits: sandboxspeclimits,
): { ok: true; value: resolvedsandboxspec } | { ok: false; error: sandboxspecerror } {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return {
      ok: false,
      error: new sandboxspecerror('invalid-spec', 'spec', input, 'a plain object'),
    };
  }
  const declared = input as sandboxspecinput;
  const base = memberof(SANDBOXBASES, declared.base);
  if (base === undefined) {
    return {
      ok: false,
      error:
        declared.base === undefined
          ? new sandboxspecerror('missing-base', 'base', undefined, `one of ${SANDBOXBASES.join(', ')}`)
          : new sandboxspecerror('invalid-base', 'base', declared.base, `one of ${SANDBOXBASES.join(', ')}`),
    };
  }
  const row: sandboxbaselimit | undefined = limits.bases[base];
  if (row === undefined) {
    return {
      ok: false,
      error: new sandboxspecerror(
        'unknown-base-limits', 'base', base, 'a base present in the limits table',
      ),
    };
  }
  // fixed vocabularies: a present but unknown member is a typed error.
  const words: Array<readonly [string, readonly string[], sandboxspecerrorcode]> = [
    ['os', SANDBOXOSES, 'invalid-os'],
    ['arch', SANDBOXARCHES, 'invalid-arch'],
    ['form', SANDBOXFORMS, 'invalid-form'],
    ['networking', SANDBOXNETWORKS, 'invalid-networking'],
  ];
  for (const [field, vocabulary, code] of words) {
    if (declared[field] !== undefined && !memberof(vocabulary, declared[field])) {
      return {
        ok: false,
        error: new sandboxspecerror(
          code, field, declared[field], `one of ${vocabulary.join(', ')}`,
        ),
      };
    }
  }
  // resource wishes: positive integers bounded by the base ceiling.
  const ceilings: Array<readonly [string, sandboxspecerrorcode, number]> = [
    ['vcpus', 'invalid-vcpus', row.maxvcpus],
    ['ramgb', 'invalid-ramgb', row.maxramgb],
    ['diskgb', 'invalid-diskgb', row.maxdiskgb],
  ];
  for (const [field, code, ceiling] of ceilings) {
    if (declared[field] === undefined) {
      continue;
    }
    const wish = positiveinteger(declared[field]);
    if (wish === null) {
      return {
        ok: false,
        error: new sandboxspecerror(code, field, declared[field], 'a positive integer'),
      };
    }
    if (wish > ceiling) {
      return {
        ok: false,
        error: new sandboxspecerror(
          code, field, declared[field], `an integer between 1 and ${ceiling} on the ${base} base`,
        ),
      };
    }
  }
  let vgpu = false;
  if (declared.vgpu !== undefined && typeof declared.vgpu !== 'boolean') {
    return {
      ok: false,
      error: new sandboxspecerror('invalid-vgpu', 'vgpu', declared.vgpu, 'a boolean'),
    };
  }
  vgpu = declared.vgpu === true;
  if (vgpu && row.maxvgpus < 1) {
    return {
      ok: false,
      error: new sandboxspecerror(
        'vgpu-not-available', 'vgpu', true, `a base with vgpu slices (the ${base} base exposes none)`,
      ),
    };
  }
  const defaulttimeout = limits.defaulttimeoutseconds ?? 900;
  let timeoutseconds = defaulttimeout;
  if (declared.timeoutseconds !== undefined) {
    const wish = positiveinteger(declared.timeoutseconds);
    if (wish === null) {
      return {
        ok: false,
        error: new sandboxspecerror(
          'invalid-timeout', 'timeoutseconds', declared.timeoutseconds, 'a positive integer of seconds',
        ),
      };
    }
    if (wish > row.maxtimeoutseconds) {
      return {
        ok: false,
        error: new sandboxspecerror(
          'timeout-above-limit', 'timeoutseconds', declared.timeoutseconds,
          `at most ${row.maxtimeoutseconds} seconds on the ${base} base`,
        ),
      };
    }
    timeoutseconds = wish;
  }
  const os = (memberof(SANDBOXOSES, declared.os) ?? 'linux') as sandboxosid;
  return {
    ok: true,
    value: {
      base,
      os,
      arch: (memberof(SANDBOXARCHES, declared.arch) ?? 'amd64') as sandboxarchid,
      form: (memberof(SANDBOXFORMS, declared.form) ?? 'runtime-node') as sandboxformid,
      networking: (memberof(SANDBOXNETWORKS, declared.networking) ?? 'nat') as sandboxnetworkid,
      family: osfamily(os),
      vcpus: (declared.vcpus as number | undefined) ?? row.defaultvcpus,
      ramgb: (declared.ramgb as number | undefined) ?? row.defaultramgb,
      vgpu,
      diskgb: (declared.diskgb as number | undefined) ?? null,
      timeoutseconds,
    },
  };
}

/* ------------------------------------------------------------------ */
/* helpers and bridges                                                 */
/* ------------------------------------------------------------------ */

/** maps a guest os onto its kernel family (grapheneos builds on aosp). */
export function osfamily(os: sandboxosid): sandboxosfamily {
  if (os === 'android' || os === 'grapheneos') {
    return 'android';
  }
  return os === 'windows' ? 'windows' : 'linux';
}

/** the structural shape consumed by sandbox.ts createSandboxState. */
export type sandboxenginespec = {
  readonly model: string;
  readonly vcpus: number;
  readonly ramgb: number;
  readonly gpu: string;
  readonly mig: string;
};

/**
 * bridges a resolved spec onto the engine surface: vcpus and ramgb come
 * from the resolved spec, the cpu model and gpu identity stay caller
 * choices (the reviewed catalog of sandbox.ts remains the only source
 * of processor and gpu identity).
 *
 * @param resolved the resolved spec produced by resolvesandboxspec.
 * @param options the caller picked engine identities (model, gpu, mig).
 * @returns the engine spec object.
 */
export function enginespecfor(
  resolved: resolvedsandboxspec,
  options?: { model?: string; gpu?: string; mig?: string },
): sandboxenginespec {
  return {
    model: options?.model ?? '',
    vcpus: resolved.vcpus,
    ramgb: resolved.ramgb,
    gpu: resolved.vgpu ? (options?.gpu ?? '') : '',
    mig: options?.mig ?? 'off',
  };
}

