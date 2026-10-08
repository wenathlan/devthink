/**
 * real tests for the sandbox lifecycle queue (sandboxqueue.ts).
 *
 * the suite exercises the single linear machine (creating -> starting ->
 * running -> stopping -> stopped): valid transitions, invalid
 * transitions, per-state timeout reaping through the health-check tick,
 * cancellation from every cancellable phase and the terminal locks —
 * the daytona/opensandbox -ing intermediate semantics with the 409
 * style conflict rendered as a typed sandboxqueueerror.
 *
 * run with plain node (no install): node --test tests/sandboxqueue.test.ts
 * the .ts import specifiers rely on the native type stripping of the
 * supported node versions.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  cansandboxstep,
  createsandboxqueue,
  issandboxterminal,
  sandboxqueueerror,
  type sandboxphase,
} from '../sandboxqueue.ts';

/** walks the full happy path of the machine. */
function happywalk(now: number): void {
  const queue = createsandboxqueue({ budgets: { creating: 125, starting: 125, stopping: 30000 } });
  queue.add('sb-happy', now);
  queue.step('sb-happy', 'starting', now + 10);
  queue.step('sb-happy', 'running', now + 20);
  queue.step('sb-happy', 'stopping', now + 30);
  queue.step('sb-happy', 'stopped', now + 40);
  assert.equal(queue.status('sb-happy', now + 41).state, 'stopped');
}

test('the happy path walks creating to stopped with stamped deadlines', () => {
  const queue = createsandboxqueue({ budgets: { creating: 125, starting: 125, stopping: 30000 } });
  const entry = queue.add('sb-1', 1000);
  assert.equal(entry.state, 'creating');
  assert.equal(entry.deadline, 1125);
  const starting = queue.step('sb-1', 'starting', 1100);
  assert.equal(starting.state, 'starting');
  assert.equal(starting.deadline, 1225);
  const running = queue.step('sb-1', 'running', 1150);
  assert.equal(running.deadline, null);
  const stopping = queue.step('sb-1', 'stopping', 1200);
  assert.equal(stopping.deadline, 31200);
  const stopped = queue.step('sb-1', 'stopped', 1300);
  assert.equal(stopped.deadline, null);
  assert.equal(queue.size(), 1);
});

test('every invalid transition is rejected with a typed error', () => {
  const queue = createsandboxqueue();
  queue.add('sb-2', 1000);
  assert.throws(() => queue.step('sb-2', 'running', 1001), sandboxqueueerror);
  assert.throws(() => queue.step('sb-2', 'stopping', 1001), sandboxqueueerror);
  assert.throws(() => queue.step('sb-2', 'stopped', 1001), sandboxqueueerror);
  // skipping running is illegal even from starting.
  queue.step('sb-2', 'starting', 1010);
  assert.throws(() => queue.step('sb-2', 'stopped', 1011), sandboxqueueerror);
  try {
    queue.step('sb-2', 'stopped', 1012);
  } catch (error) {
    assert.ok(error instanceof sandboxqueueerror);
    if (error instanceof sandboxqueueerror) {
      assert.equal(error.code, 'invalid-transition');
      assert.equal(error.id, 'sb-2');
      assert.equal(error.from, 'starting');
      assert.equal(error.to, 'stopped');
    }
  }
});

test('unknown and duplicate entries carry their own codes', () => {
  const queue = createsandboxqueue();
  assert.throws(() => queue.step('ghost', 'running'), sandboxqueueerror);
  assert.throws(() => queue.cancel('ghost'), sandboxqueueerror);
  assert.throws(() => queue.status('ghost'), sandboxqueueerror);
  queue.add('sb-3', 1000);
  assert.throws(() => queue.add('sb-3', 1001), sandboxqueueerror);
  try {
    queue.add('sb-3', 1002);
  } catch (error) {
    assert.ok(error instanceof sandboxqueueerror);
    if (error instanceof sandboxqueueerror) {
      assert.equal(error.code, 'duplicate-sandbox');
    }
  }
});

test('the health-check tick reaps entries past their per-state budget', () => {
  const queue = createsandboxqueue({ budgets: { creating: 100, starting: 200, stopping: 50 } });
  queue.add('slow-create', 1000);
  queue.add('sb-ok', 1150);
  const reaped = queue.healthcheck(1200);
  assert.deepEqual(reaped, ['slow-create']);
  assert.equal(queue.status('slow-create', 1200).state, 'timedout');
  assert.equal(issandboxterminal('timedout'), true);
  // a terminal entry is never reaped twice.
  assert.deepEqual(queue.healthcheck(1240), []);
  // the creating budget holds until 1250; the starting budget of 200 ms
  // armed at 1245 expires at 1445.
  queue.step('sb-ok', 'starting', 1245);
  assert.deepEqual(queue.healthcheck(1444), []);
  assert.deepEqual(queue.healthcheck(1446), ['sb-ok']);
});

test('a stuck stopping sandbox times out into the reaper list', () => {
  const queue = createsandboxqueue({ budgets: { stopping: 10 } });
  queue.add('sb-4', 1000);
  queue.step('sb-4', 'starting', 1001);
  queue.step('sb-4', 'running', 1002);
  queue.step('sb-4', 'stopping', 1003);
  const reaped = queue.healthcheck(1020);
  assert.deepEqual(reaped, ['sb-4']);
  assert.equal(queue.status('sb-4', 1020).state, 'timedout');
});

test('cancellation works from the pending and running phases only', () => {
  const queue = createsandboxqueue();
  queue.add('sb-5', 1000);
  assert.equal(queue.cancel('sb-5', 1001).state, 'cancelled');
  happywalk(2000);
  const second = createsandboxqueue();
  second.add('sb-6', 3000);
  second.step('sb-6', 'starting', 3001);
  second.step('sb-6', 'running', 3002);
  assert.equal(second.cancel('sb-6', 3003).state, 'cancelled');
  // a terminal entry refuses cancellation as an invalid transition.
  assert.throws(() => second.cancel('sb-6', 3004), sandboxqueueerror);
  try {
    second.cancel('sb-6', 3005);
  } catch (error) {
    assert.ok(error instanceof sandboxqueueerror);
    if (error instanceof sandboxqueueerror) {
      assert.equal(error.code, 'terminal-phase');
    }
  }
});

test('terminal phases lock the entry against every transition', () => {
  for (const terminal of ['stopped', 'cancelled', 'failed', 'timedout'] as const) {
    for (const target of ['starting', 'running', 'stopping', 'stopped'] as const) {
      assert.equal(
        cansandboxstep(terminal, target as sandboxphase),
        false,
        `${terminal} must be terminal against ${target}`,
      );
    }
    assert.equal(issandboxterminal(terminal), true);
  }
});

test('the transition table admits exactly the linear machine edges', () => {
  assert.equal(cansandboxstep('creating', 'starting'), true);
  assert.equal(cansandboxstep('starting', 'running'), true);
  assert.equal(cansandboxstep('running', 'stopping'), true);
  assert.equal(cansandboxstep('stopping', 'stopped'), true);
  assert.equal(cansandboxstep('creating', 'running'), false);
  assert.equal(cansandboxstep('starting', 'stopping'), false);
  assert.equal(cansandboxstep('running', 'creating'), false);
  assert.equal(cansandboxstep('stopped', 'starting'), false);
});

test('the event ring records every phase change newest last', () => {
  const queue = createsandboxqueue({ eventcap: 3 });
  queue.add('sb-7', 1000);
  queue.step('sb-7', 'starting', 1001);
  queue.step('sb-7', 'running', 1002);
  queue.step('sb-7', 'stopping', 1003);
  queue.step('sb-7', 'stopped', 1004);
  const events = queue.events();
  // the ring holds the last three of the five recorded transitions.
  assert.equal(events.length, 3);
  assert.deepEqual(
    events.map((event) => [event.from, event.to]),
    [
      ['starting', 'running'],
      ['running', 'stopping'],
      ['stopping', 'stopped'],
    ],
  );
  assert.equal(events[events.length - 1]?.at, 1004);
});

test('status exposes age, deadline and terminality', () => {
  const queue = createsandboxqueue({ budgets: { creating: 50 } });
  queue.add('sb-8', 1000);
  const status = queue.status('sb-8', 1020);
  assert.equal(status.state, 'creating');
  assert.equal(status.age, 20);
  assert.equal(status.deadline, 1050);
  assert.equal(status.terminal, false);
});

test('the default budgets mirror the 125 ms api ramp', () => {
  const queue = createsandboxqueue();
  const entry = queue.add('sb-9', 5000);
  assert.equal(entry.deadline, 5125);
});
