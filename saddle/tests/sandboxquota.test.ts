/**
 * real tests for the per-account resource quota ledger (sandboxquota.ts).
 *
 * the suite exercises reserve/release bookkeeping, the admit dry-run,
 * the per-resource limit walk (sandbox count, vcpus, ramgb, vgpus,
 * diskgb), unlimited fields, the typed quotaexceeded error trace and
 * the simple reconciliation that overwrites the counters from the
 * authoritative rows (usagefromrows over the sqlite sandboxes rows).
 * the limits table is always a parameter — the suite proves the ledger
 * never invents capacities.
 *
 * run with plain node (no install): node --test tests/sandboxquota.test.ts
 * the .ts import specifiers rely on the native type stripping of the
 * supported node versions.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  accountlimitsfromenv,
  createaccountledger,
  quotaerror,
  usagefromrows,
} from '../sandboxquota.ts';

test('reserve and release keep the counters in balance', () => {
  const ledger = createaccountledger({ sandboxes: 3, vcpus: 16, ramgb: 64 });
  const reserved = ledger.reserve('acct-1', { sandboxes: 1, vcpus: 8, ramgb: 32 });
  assert.equal(reserved.used.sandboxes, 1);
  assert.equal(reserved.used.vcpus, 8);
  assert.equal(reserved.used.ramgb, 32);
  assert.equal(reserved.remaining.vcpus, 8);
  const released = ledger.release('acct-1', { sandboxes: 1, vcpus: 8, ramgb: 32 });
  assert.equal(released.used.sandboxes, 0);
  assert.equal(released.used.vcpus, 0);
  assert.equal(released.remaining.vcpus, 16);
});

test('reserve throws a traceable typed error when a limit is exceeded', () => {
  const ledger = createaccountledger({ vcpus: 8 });
  ledger.reserve('acct-2', { vcpus: 6 });
  assert.throws(() => ledger.reserve('acct-2', { vcpus: 4 }), quotaerror);
  try {
    ledger.reserve('acct-2', { vcpus: 4 });
  } catch (error) {
    assert.ok(error instanceof quotaerror);
    if (error instanceof quotaerror) {
      assert.equal(error.code, 'quota-exceeded');
      assert.equal(error.accountid, 'acct-2');
      assert.equal(error.resource, 'vcpus');
      assert.equal(error.requested, 4);
      assert.equal(error.limit, 8);
      assert.equal(error.available, 2);
    }
  }
});

test('admits is the dry-run that never mutates the counters', () => {
  const ledger = createaccountledger({ sandboxes: 1 });
  assert.equal(ledger.admits('acct-3', { sandboxes: 1 }), true);
  ledger.reserve('acct-3', { sandboxes: 1 });
  assert.equal(ledger.admits('acct-3', { sandboxes: 1 }), false);
  assert.equal(ledger.usage('acct-3').used.sandboxes, 1);
  assert.equal(ledger.admits('acct-3', { vcpus: 1000 }), true);
});

test('the plan table is a parameter: the ledger never invents limits', () => {
  const generous = createaccountledger({});
  for (let index = 0; index < 50; index += 1) {
    generous.reserve('acct-4', { sandboxes: 1, vcpus: 192, ramgb: 1024 });
  }
  const snapshot = generous.usage('acct-4');
  assert.equal(snapshot.used.sandboxes, 50);
  assert.equal(snapshot.remaining.vcpus, null);
  assert.equal(snapshot.remaining.ramgb, null);
  assert.equal(snapshot.remaining.sandboxes, null);
});

test('absent, zero and negative limits all mean unlimited', () => {
  const ledger = createaccountledger({ sandboxes: 0, vcpus: -5 });
  assert.equal(ledger.admits('acct-5', { sandboxes: 99, vcpus: 99 }), true);
  assert.equal(ledger.usage('acct-5').remaining.sandboxes, null);
  assert.equal(ledger.usage('acct-5').remaining.vcpus, null);
});

test('each account keeps its own book', () => {
  const ledger = createaccountledger({ sandboxes: 2 });
  ledger.reserve('acct-a', { sandboxes: 2 });
  assert.equal(ledger.admits('acct-b', { sandboxes: 1 }), true);
  assert.equal(ledger.usage('acct-a').used.sandboxes, 2);
  assert.equal(ledger.usage('acct-b').used.sandboxes, 0);
});

test('release floors at zero and ignores stale releases', () => {
  const ledger = createaccountledger({ sandboxes: 5 });
  ledger.release('acct-6', { sandboxes: 3, vcpus: 10 });
  assert.equal(ledger.usage('acct-6').used.sandboxes, 0);
  ledger.reserve('acct-6', { sandboxes: 1 });
  ledger.release('acct-6', { sandboxes: 4 });
  assert.equal(ledger.usage('acct-6').used.sandboxes, 0);
});

test('malformed wishes are rejected with the invalid-wish code', () => {
  const ledger = createaccountledger({ vcpus: 8 });
  assert.throws(() => ledger.reserve('acct-7', { vcpus: 0 }), quotaerror);
  assert.throws(() => ledger.reserve('acct-7', { vcpus: -1 }), quotaerror);
  assert.throws(() => ledger.reserve('acct-7', { vcpus: Number.NaN }), quotaerror);
  try {
    ledger.reserve('acct-7', { vcpus: -1 });
  } catch (error) {
    assert.ok(error instanceof quotaerror);
    if (error instanceof quotaerror) {
      assert.equal(error.code, 'invalid-wish');
      assert.equal(error.resource, 'vcpus');
    }
  }
});

test('reconcile overwrites the counters from the authoritative rows', () => {
  const ledger = createaccountledger({ sandboxes: 3, vcpus: 16 });
  ledger.reserve('acct-8', { sandboxes: 1, vcpus: 4 });
  const observed = usagefromrows([
    { vcpus: 4, ramgb: 16, state: 'running' },
    { vcpus: 2, ramgb: 8, state: 'created' },
    { vcpus: 8, ramgb: 32, state: 'destroyed' },
  ]);
  const report = ledger.reconcile('acct-8', observed);
  assert.equal(report.before.used.sandboxes, 1);
  assert.equal(report.after.used.sandboxes, 2);
  assert.equal(report.after.used.vcpus, 6);
  assert.equal(report.after.used.ramgb, 24);
  assert.equal(ledger.usage('acct-8').used.sandboxes, 2);
});

test('usagefromrows counts every non destroyed row like the api cap', () => {
  const usage = usagefromrows([
    { vcpus: 4, ramgb: 16, state: 'running' },
    { vcpus: 2, ramgb: 8, state: 'expired' },
    { vcpus: null, ramgb: null, state: 'created' },
    { vcpus: 8, ramgb: 32, state: 'destroyed' },
  ]);
  assert.deepEqual(usage, { sandboxes: 3, vcpus: 6, ramgb: 24, vgpus: 0, diskgb: 0 });
});

test('reset clears one account or the whole book', () => {
  const ledger = createaccountledger({});
  ledger.reserve('acct-9', { sandboxes: 1 });
  ledger.reserve('acct-10', { sandboxes: 1 });
  ledger.reset('acct-9');
  assert.equal(ledger.usage('acct-9').used.sandboxes, 0);
  assert.equal(ledger.usage('acct-10').used.sandboxes, 1);
  ledger.reset();
  assert.equal(ledger.usage('acct-10').used.sandboxes, 0);
});

test('accountlimitsfromenv maps the environment onto the plan table', () => {
  const limits = accountlimitsfromenv({
    SADDLE_MAX_SANDBOXES: '5',
    SADDLE_ACCOUNT_MAX_VCPUS: '32',
    SADDLE_ACCOUNT_MAX_RAM_GB: '128',
    SADDLE_ACCOUNT_MAX_VGPUS: '2',
    SADDLE_ACCOUNT_MAX_DISK_GB: '500',
  });
  assert.deepEqual(limits, { sandboxes: 5, vcpus: 32, ramgb: 128, vgpus: 2, diskgb: 500 });
  const unset = accountlimitsfromenv({});
  assert.deepEqual(unset, { sandboxes: undefined, vcpus: undefined, ramgb: undefined, vgpus: undefined, diskgb: undefined });
  const relaxed = accountlimitsfromenv({ SADDLE_MAX_SANDBOXES: '0' });
  assert.equal(relaxed.sandboxes, undefined);
});

test('the ledger walks every resource family of the plan table', () => {
  const ledger = createaccountledger({ sandboxes: 2, vcpus: 8, ramgb: 32, vgpus: 1, diskgb: 100 });
  const verdict = ledger.reserve('acct-11', { sandboxes: 2, vcpus: 8, ramgb: 32, vgpus: 1, diskgb: 100 });
  assert.equal(verdict.remaining.vgpus, 0);
  assert.equal(verdict.remaining.diskgb, 0);
  assert.equal(ledger.admits('acct-11', { vgpus: 1 }), false);
  assert.equal(ledger.admits('acct-11', { diskgb: 1 }), false);
});
