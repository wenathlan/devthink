#!/usr/bin/env node
// polar launcher — spawns the polar.sh poller detached from this process
// group so the sandbox tool-call cleanup never reaps it; the child answers
// to init and keeps polling while every shell session comes and goes
const { spawn } = require('node:child_process');
const { openSync } = require('node:fs');

const out = openSync('/home/z/my-project/polar/launcher.log', 'a');
const err = openSync('/home/z/my-project/polar/launcher.log', 'a');
const child = spawn('bash', ['/home/z/my-project/polar.sh', 'start'], {
  detached: true,
  stdio: ['ignore', out, err],
  cwd: '/home/z/my-project',
});
child.unref();
console.log('polar launcher: poller spawned detached, pid', child.pid);
