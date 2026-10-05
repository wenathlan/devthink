/**
 * real tests for the declarative sandbox spec (sandbox.spec.ts).
 *
 * the suite covers the base vocabulary (max/balanced/lite), the guest
 * operating systems, the arm64/amd64 architectures, the runtime forms,
 * the per-base resource ceilings from the caller supplied limits table
 * (an unknown base and an invalid arch must be rejected with typed,
 * traceable errors) and the timeout bound inherited from the opensandbox
 * server contract.
 *
 * run with plain node (no install): node --test tests/sandbox.spec.test.ts
 * the .ts import specifiers rely on the native type stripping of the
 * supported node versions.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  enginespecfor,
  osfamily,
  resolvesandboxspec,
  sandboxspecerror,
  type sandboxspeclimits,
} from '../sandbox.spec.ts';
import { specenvlimits } from '../sandbox.spec.env.ts';

/** a compact limits table for the tests (max carries a vgpu ceiling). */
const limits: sandboxspeclimits = {
  bases: {
    lite: {
      maxvcpus: 4,
      maxramgb: 8,
      maxvgpus: 0,
      maxdiskgb: 32,
      maxtimeoutseconds: 900,
      defaultvcpus: 2,
      defaultramgb: 4,
    },
    balanced: {
      maxvcpus: 16,
      maxramgb: 32,
      maxvgpus: 1,
      maxdiskgb: 128,
      maxtimeoutseconds: 3600,
      defaultvcpus: 8,
      defaultramgb: 16,
    },
    max: {
      maxvcpus: 64,
      maxramgb: 256,
      maxvgpus: 2,
      maxdiskgb: 512,
      maxtimeoutseconds: 14400,
      defaultvcpus: 32,
      defaultramgb: 64,
    },
  },
  defaulttimeoutseconds: 900,
};

test('a full declaration resolves every vocabulary field', () => {
  const verdict = resolvesandboxspec(
    {
      base: 'max',
      os: 'grapheneos',
      arch: 'arm64',
      form: 'full-docker',
      vcpus: 48,
      ramgb: 128,
      vgpu: true,
      diskgb: 256,
      timeoutseconds: 7200,
      networking: 'bridged',
    },
    limits,
  );
  assert.ok(verdict.ok);
  if (verdict.ok) {
    assert.equal(verdict.value.base, 'max');
    assert.equal(verdict.value.os, 'grapheneos');
    assert.equal(verdict.value.arch, 'arm64');
    assert.equal(verdict.value.form, 'full-docker');
    assert.equal(verdict.value.networking, 'bridged');
    assert.equal(verdict.value.family, 'android');
    assert.equal(verdict.value.vcpus, 48);
    assert.equal(verdict.value.ramgb, 128);
    assert.equal(verdict.value.vgpu, true);
    assert.equal(verdict.value.diskgb, 256);
    assert.equal(verdict.value.timeoutseconds, 7200);
  }
});

test('defaults fill the omitted fields (linux, amd64, runtime-node, nat)', () => {
  const verdict = resolvesandboxspec({ base: 'balanced' }, limits);
  assert.ok(verdict.ok);
  if (verdict.ok) {
    assert.equal(verdict.value.os, 'linux');
    assert.equal(verdict.value.arch, 'amd64');
    assert.equal(verdict.value.form, 'runtime-node');
    assert.equal(verdict.value.networking, 'nat');
    assert.equal(verdict.value.family, 'linux');
    assert.equal(verdict.value.vcpus, 8);
    assert.equal(verdict.value.ramgb, 16);
    assert.equal(verdict.value.vgpu, false);
    assert.equal(verdict.value.diskgb, null);
  }
});

test('an unknown base is rejected with a traceable typed error', () => {
  const verdict = resolvesandboxspec({ base: 'mega' }, limits);
  assert.ok(!verdict.ok);
  if (!verdict.ok) {
    assert.equal(verdict.error.code, 'invalid-base');
    assert.equal(verdict.error.field, 'base');
    assert.equal(verdict.error.value, 'mega');
    assert.match(verdict.error.expected, /max, balanced, lite/);
    assert.ok(verdict.error instanceof sandboxspecerror);
  }
});

test('a missing base is its own error code', () => {
  const verdict = resolvesandboxspec({ os: 'linux' }, limits);
  assert.ok(!verdict.ok);
  if (!verdict.ok) {
    assert.equal(verdict.error.code, 'missing-base');
  }
});

test('an invalid architecture is rejected (only arm64 and amd64 exist)', () => {
  for (const arch of ['x86', 'aarch64', 'riscv', 42]) {
    const verdict = resolvesandboxspec({ base: 'lite', arch }, limits);
    assert.ok(!verdict.ok, `arch ${String(arch)} must not resolve`);
    if (!verdict.ok) {
      assert.equal(verdict.error.code, 'invalid-arch');
      assert.equal(verdict.error.field, 'arch');
      assert.equal(verdict.error.value, arch);
    }
  }
});

test('an invalid guest os is rejected', () => {
  const verdict = resolvesandboxspec({ base: 'lite', os: 'plan9' }, limits);
  assert.ok(!verdict.ok);
  if (!verdict.ok) {
    assert.equal(verdict.error.code, 'invalid-os');
    assert.equal(verdict.error.field, 'os');
  }
});

test('per-base ceilings bound the resource wishes', () => {
  const litecpu = resolvesandboxspec({ base: 'lite', vcpus: 5 }, limits);
  assert.ok(!litecpu.ok);
  if (!litecpu.ok) {
    assert.equal(litecpu.error.code, 'invalid-vcpus');
    assert.match(litecpu.error.expected, /1 and 4 on the lite base/);
  }
  const balram = resolvesandboxspec({ base: 'balanced', ramgb: 33 }, limits);
  assert.ok(!balram.ok);
  if (!balram.ok) {
    assert.equal(balram.error.code, 'invalid-ramgb');
  }
  const litevgpu = resolvesandboxspec({ base: 'lite', vgpu: true }, limits);
  assert.ok(!litevgpu.ok);
  if (!litevgpu.ok) {
    assert.equal(litevgpu.error.code, 'vgpu-not-available');
  }
});

test('non positive integer wishes are rejected before the ceiling check', () => {
  const verdict = resolvesandboxspec({ base: 'lite', vcpus: 0 }, limits);
  assert.ok(!verdict.ok);
  if (!verdict.ok) {
    assert.equal(verdict.error.code, 'invalid-vcpus');
    assert.equal(verdict.error.expected, 'a positive integer');
  }
  const fractional = resolvesandboxspec({ base: 'lite', ramgb: 2.5 }, limits);
  assert.ok(!fractional.ok);
  if (!fractional.ok) {
    assert.equal(fractional.error.code, 'invalid-ramgb');
  }
});

test('the declared timeout is bounded by the base maximum', () => {
  const verdict = resolvesandboxspec({ base: 'lite', timeoutseconds: 901 }, limits);
  assert.ok(!verdict.ok);
  if (!verdict.ok) {
    assert.equal(verdict.error.code, 'timeout-above-limit');
    assert.equal(verdict.error.field, 'timeoutseconds');
  }
  const ok = resolvesandboxspec({ base: 'lite', timeoutseconds: 600 }, limits);
  assert.ok(ok);
  if (ok) {
    assert.equal(ok.value.timeoutseconds, 600);
  }
});

test('the limits table is a parameter: the resolver never invents capacities', () => {
  const strict: sandboxspeclimits = {
    bases: {
      lite: {
        maxvcpus: 1,
        maxramgb: 1,
        maxvgpus: 0,
        maxdiskgb: 1,
        maxtimeoutseconds: 60,
        defaultvcpus: 1,
        defaultramgb: 1,
      },
      balanced: limits.bases.balanced,
      max: limits.bases.max,
    },
  };
  const verdict = resolvesandboxspec({ base: 'lite', vcpus: 2 }, strict);
  assert.ok(!verdict.ok);
  if (!verdict.ok) {
    assert.match(verdict.error.expected, /1 and 1 on the lite base/);
  }
});

test('a non object declaration fails at the envelope', () => {
  for (const bad of [null, 'max', 7, [1, 2]]) {
    const verdict = resolvesandboxspec(bad, limits);
    assert.ok(!verdict.ok);
    if (!verdict.ok) {
      assert.equal(verdict.error.code, 'invalid-spec');
    }
  }
});

test('the limits table must know every base it validates', () => {
  const partial: sandboxspeclimits = {
    bases: { balanced: limits.bases.balanced, max: limits.bases.max, lite: undefined as never },
  };
  const verdict = resolvesandboxspec({ base: 'lite' }, partial);
  assert.ok(!verdict.ok);
  if (!verdict.ok) {
    assert.equal(verdict.error.code, 'unknown-base-limits');
  }
});

test('osfamily groups the guests into android, linux and windows', () => {
  assert.equal(osfamily('android'), 'android');
  assert.equal(osfamily('grapheneos'), 'android');
  assert.equal(osfamily('linux'), 'linux');
  assert.equal(osfamily('omarchy'), 'linux');
  assert.equal(osfamily('windows'), 'windows');
});

test('enginespecfor bridges onto the createSandboxState surface', () => {
  const verdict = resolvesandboxspec({ base: 'max', vcpus: 32, ramgb: 64, vgpu: true }, limits);
  assert.ok(verdict.ok);
  if (verdict.ok) {
    const engine = enginespecfor(verdict.value, { model: 'AMD EPYC 9965', gpu: 'rtx5090' });
    assert.deepEqual(engine, {
      model: 'AMD EPYC 9965',
      vcpus: 32,
      ramgb: 64,
      gpu: 'rtx5090',
      mig: 'off',
    });
    const nogpu = enginespecfor(verdict.value);
    assert.equal(nogpu.gpu, '');
  }
});

test('specenvlimits reads the SADDLE_SPEC_LIMITS json and keeps the fallback', () => {
  const fallback = specenvlimits({});
  assert.equal(fallback.bases.lite?.maxvcpus, 4);
  const merged = specenvlimits({
    SADDLE_SPEC_LIMITS: JSON.stringify({
      bases: { lite: { maxvcpus: 2, maxramgb: 4, maxvgpus: 0, maxdiskgb: 8, maxtimeoutseconds: 300 } },
    }),
  });
  assert.equal(merged.bases.lite?.maxvcpus, 2);
  assert.equal(merged.bases.lite?.defaultvcpus, 2);
  assert.equal(merged.bases.balanced?.maxvcpus, 16);
  const broken = specenvlimits({ SADDLE_SPEC_LIMITS: '{not json' });
  assert.equal(broken.bases.lite?.maxvcpus, 4);
});
