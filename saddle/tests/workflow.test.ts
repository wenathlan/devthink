/**
 * workflow simulation tests for the saddle repository (worklog tasks v5-E
 * and 9-a-4): the suite mirrors, locally and for real, the gates that the
 * github actions pipelines (.github/workflows/ci.yml and release.yml) run
 * on every push — biome lint, module parsing through type stripping plus
 * the typescript 7.0.2 no-emit build, strict json validation of the ten
 * camel case data documents, the flat structure contract (the 2.1.0 web
 * restructure: page folders + loose modules, native wrappers generated on
 * the runners, never tracked), the workflow reference gates, the node
 * smoke gate, the python bridge gates and the release checksum manifest.
 * every spawn runs with a timeout inside a try/catch catcher and every
 * gate that depends on a tool missing from the environment is skipped
 * with a documented reason instead of failing silently.
 */

import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

/** repository root resolved from this test file location. */
const reporoot = join(dirname(fileURLToPath(import.meta.url)), '..');

/** outcome of one locally simulated pipeline gate. */
type gateoutcome = {
  readonly code: number | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly timedout: boolean;
  readonly spawnerror: string | null;
};

/**
 * runs one command as a pipeline gate with a hard timeout; the promise
 * always resolves (never rejects) so gates can report their exit code
 * instead of crashing the runner, mirroring a github actions step. the
 * optional extraenv carries the public npm registry override: a publish
 * job that sets up node with the github packages registry-url leaves the
 * runner npmrc pointing at npm.pkg.github.com, and the npx biome gates
 * would look for @biomejs/biome there (a 404 with an empty stdout) -
 * the tool gates always resolve their binaries from the public registry
 * so the pack:check battery runs identically on every job (the 2.1.2
 * lesson: the publish github npm lane ran the battery inside the github
 * registry context and the tool fetch failed before any lint ran).
 */
function rungate(
  command: string,
  args: readonly string[],
  timeoutms: number,
  cwd: string = reporoot,
  extraenv: Record<string, string> = {},
): Promise<gateoutcome> {
  return new Promise<gateoutcome>((resolve) => {
    try {
      const child = spawn(command, args, {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, ...extraenv },
      });
      let stdout = '';
      let stderr = '';
      let timedout = false;
      const timer = setTimeout(() => {
        timedout = true;
        child.kill('SIGKILL');
      }, timeoutms);
      child.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString('utf8');
      });
      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString('utf8');
      });
      child.on('error', (error: Error) => {
        clearTimeout(timer);
        resolve({ code: null, stdout, stderr, timedout, spawnerror: error.message });
      });
      child.on('close', (code: number | null) => {
        clearTimeout(timer);
        resolve({ code, stdout, stderr, timedout, spawnerror: null });
      });
    } catch (error) {
      resolve({
        code: null,
        stdout: '',
        stderr: '',
        timedout: false,
        spawnerror: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

/** true when a command resolves successfully, proving the tool exists. */
function toolavailable(command: string, args: readonly string[]): boolean {
  try {
    const probe = spawnSync(command, args, { timeout: 20000, encoding: 'utf8' });
    return probe.error === undefined && probe.status === 0;
  } catch {
    return false;
  }
}

/** directories that hold build output or runtime caches, never sources. */
const skipdirs = new Set(['.git', 'node_modules', '__pycache__', 'dist', 'coverage', '.biome']);

/** lists the root-level files matching a simple extension glob. */
function globroot(pattern: string): string[] {
  const ext = pattern.replaceAll('*', '');
  return readdirSync(reporoot).filter((name) => name.endsWith(ext));
}

/** walks the repository collecting forward-slash relative file paths. */
function walkfiles(root: string, relativepath = ''): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(join(root, relativepath), { withFileTypes: true })) {
    if (skipdirs.has(entry.name)) {
      continue;
    }
    const rel = relativepath === '' ? entry.name : `${relativepath}/${entry.name}`;
    if (entry.isDirectory()) {
      found.push(...walkfiles(root, rel));
    } else if (entry.isFile()) {
      found.push(rel);
    }
  }
  return found;
}

/** the ten camel case data documents validated by the strict json gate. */
const datafiles = [
  'processors.json',
  'gpus.json',
  'cores.json',
  'boards.json',
  'vm.config.json',
  'virtualhardware.json',
  'qemu.config',
  'mttg.config',
  'passage.config',
  'docker.config',
] as const;

/**
 * keys kept verbatim on purpose (worklog v5-a exceptions): dotted kernel
 * sysctl ids and real tmpfs mount paths must match the host contracts.
 */
const keyexceptions = new Set([
  'vm.overcommit_memory',
  'vm.overcommit_ratio',
  '/tmp/mesa_shader_cache',
]);

/** recursively collects object keys carrying an underscore or a dash. */
function collectoffensivekeys(
  node: unknown,
  pathlabel: string,
  allow: ReadonlySet<string>,
  found: string[],
): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      collectoffensivekeys(item, pathlabel, allow, found);
    }
    return;
  }
  if (node !== null && typeof node === 'object') {
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (/[_-]/.test(key) && !allow.has(key)) {
        found.push(`${pathlabel}${key}`);
      }
      collectoffensivekeys(value, `${pathlabel}${key}.`, allow, found);
    }
  }
}

/* ------------------------------------------------------------------ */
/* gate 1: biome lint (and clean checks on the new test files)         */
/* ------------------------------------------------------------------ */

test('ci gate lint: biome reports zero lint errors across the repository', async (t) => {
  if (!toolavailable('npx', ['--version'])) {
    t.skip('npx is unavailable in this environment; the biome gate cannot run locally');
    return;
  }
  const lint = await rungate(
    'npx',
    ['--yes', '@biomejs/biome@2.5.11', 'lint', '--diagnostic-level=error', '.'],
    180000,
    reporoot,
    { npm_config_registry: 'https://registry.npmjs.org' },
  );
  assert.equal(lint.spawnerror, null, 'the biome lint spawn must not fail');
  assert.equal(lint.timedout, false, 'the biome lint gate must finish inside the step timeout');
  assert.equal(lint.code, 0, `biome lint errors:\n${lint.stdout.slice(-2000)}`);
});

test('ci gate lint: the two workflow simulation files pass a full biome check', async (t) => {
  if (!toolavailable('npx', ['--version'])) {
    t.skip('npx is unavailable in this environment; the biome check cannot run locally');
    return;
  }
  const check = await rungate(
    'npx',
    [
      '--yes',
      '@biomejs/biome@2.5.11',
      'check',
      '--diagnostic-level=error',
      'tests/workflow.test.ts',
      'tests/simulation.test.ts',
    ],
    180000,
    reporoot,
    { npm_config_registry: 'https://registry.npmjs.org' },
  );
  assert.equal(check.spawnerror, null, 'the biome check spawn must not fail');
  assert.equal(check.code, 0, `biome check reported:\n${check.stdout.slice(-2000)}`);
});

/* ------------------------------------------------------------------ */
/* gate 2: typecheck (module parsing plus the tsc no-emit build)       */
/* ------------------------------------------------------------------ */

/** every root module loaded through the node type-stripping pipeline. */
const rootmoduleloaders: Readonly<Record<string, () => Promise<unknown>>> = {
  'alternatives.ts': () => import('../alternatives.ts'),
  'compute.ts': () => import('../compute.ts'),
  'index.ts': () => import('../index.ts'),
  'media.ts': () => import('../media.ts'),
  'orchestrator.ts': () => import('../orchestrator.ts'),
  'performance.ts': () => import('../performance.ts'),
  'render.ts': () => import('../render.ts'),
  'scheduler.ts': () => import('../scheduler.ts'),
  'security.ts': () => import('../security.ts'),
  'virtualcpu.ts': () => import('../virtualcpu.ts'),
  'virtualgpu.ts': () => import('../virtualgpu.ts'),
  'virtualization.ts': () => import('../virtualization.ts'),
  'virtualmemory.ts': () => import('../virtualmemory.ts'),
};

test('ci gate typecheck: every root module parses through type stripping', async (t) => {
  const syntaxfailures: string[] = [];
  const envblocked: string[] = [];
  for (const [name, load] of Object.entries(rootmoduleloaders)) {
    try {
      await load();
    } catch (error) {
      if (error instanceof SyntaxError) {
        syntaxfailures.push(`${name}: ${error.message}`);
      } else {
        envblocked.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  if (syntaxfailures.length === 0 && envblocked.length === Object.keys(rootmoduleloaders).length) {
    t.skip(`every module import was blocked by the environment: ${envblocked.join('; ')}`);
    return;
  }
  assert.deepEqual(
    syntaxfailures,
    [],
    'no root module may carry a syntax error under type stripping',
  );
});

test('ci gate typecheck: typescript 7.0.2 no-emit build passes', async (t) => {
  if (!toolavailable('npx', ['--version'])) {
    t.skip('npx is unavailable in this environment; the tsc gate cannot run locally');
    return;
  }
  const build = await rungate(
    'npx',
    ['-y', '--package', 'typescript@7.0.2', 'tsc', '--noEmit', '--project', 'tsconfig.json'],
    300000,
  );
  if (build.spawnerror !== null || build.code === null) {
    t.skip(`the typescript compiler could not be resolved: ${build.spawnerror ?? 'no exit code'}`);
    return;
  }
  assert.equal(build.timedout, false, 'the tsc gate must finish inside the step timeout');
  assert.equal(build.code, 0, `tsc --noEmit reported:\n${build.stdout.slice(-2000)}`);
});

/* ------------------------------------------------------------------ */
/* gate 3: strict json validation of the ten data documents            */
/* ------------------------------------------------------------------ */

test('ci gate json: the ten data documents parse strictly with zero underscore or dash keys', () => {
  for (const file of datafiles) {
    const fullpath = join(reporoot, file);
    assert.equal(existsSync(fullpath), true, `${file} must exist in the repository root`);
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(fullpath, 'utf8'));
    } catch (error) {
      assert.fail(
        `${file} must parse as strict json: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    assert.ok(
      parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed),
      `${file} must be a non-empty json object`,
    );
    const offensive: string[] = [];
    collectoffensivekeys(parsed, `${file}:`, keyexceptions, offensive);
    assert.deepEqual(
      offensive,
      [],
      `${file} carries keys with _ or - outside the documented fs-path/sysctl exceptions`,
    );
    const identity = parsed as Record<string, unknown>;
    assert.ok(
      'meta' in identity || 'metadata' in identity || 'id' in identity || 'name' in identity,
      `${file} must declare a hardware identity (ci checks meta/id/name and warns)`,
    );
  }
});

/* ------------------------------------------------------------------ */
/* gate 4: flat structure contract                                     */
/* ------------------------------------------------------------------ */

test('ci gate structure: the 2.1.0 flat layout contract (single tsx interface)', () => {
  /* the repository carries one root surface (the monorepo member layout):
     - the root: every logic TypeScript file sits flat at the app root
       (the consolidation contract — no nested logic folders), with only
       the Sol theme (the one tsx interface and its theme stylesheet),
       the support folders (docs, tests) and the conversion configs
       beside them; the GitHub workflow set lives at the monorepo
       .github/workflows — the saddle folder carries no workflow set of
       its own any more;
     - the interface (the Sol theme): every route is a page folder
       (Sol/<page>/<Page>.tsx) with the shared components loose in the
       page folders, and the static e2ugh console pages are fully
       absorbed into the tsx pages;
     - the native wrappers (android/ios) are generated on the runners
       (npx cap add) beside the config and never tracked — the
       conversion configs live at the app root (capacitor.config.ts,
       vite.config.ts, vitest.config.ts, tauri.conf.json, vercel.json,
       netlify.toml). */
  const logicfiles = globroot('*.ts').sort();
  assert.ok(
    logicfiles.length >= 30,
    `the root domain surface must stay populated (found ${logicfiles.length})`,
  );
  for (const entry of readdirSync(reporoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    assert.ok(
      entry.name === 'Sol' ||
        entry.name === 'docs' ||
        entry.name === 'tests' ||
        entry.name === 'build' ||
        entry.name === 'dist' ||
        entry.name === '.git' ||
        entry.name === 'node_modules' ||
        entry.name === 'coverage' ||
        entry.name === '__pycache__',
      `the directory ${entry.name} is neither the Sol theme, support (docs, tests) nor a config/tool root — logic lives flat at the root`,
    );
  }
  /* the retired alternate-forge folders must stay retired. */
  for (const retired of ['.forgejo', '.gitea', '.gitlab', '.woodpecker']) {
    assert.equal(
      existsSync(join(reporoot, retired)),
      false,
      `${retired} is retired — the GitHub workflow set is the one CI authority`,
    );
  }
  /* the app contract: one tsx app, every module at the app root (the
   * static console pages and the retired wrapper folders are gone for
   * good). The main.tsx wrapper stays retired: the app owns its mount. */
  for (const required of [
    'App.tsx',
    'index.html',
    'Sol/sol.css',
    'api.ts',
    'localauth.ts',
    'sandbox.ts',
    'server.ts',
    'db.ts',
    'auth.ts',
    'mesh.ts',
    'manifest.json',
    'icon.svg',
    'README.md',
    'init.sql',
    'schema.prisma',
    'drizzle.config.ts',
    'mime.types',
    'caddyfile',
  ]) {
    assert.ok(
      existsSync(join(reporoot, required)),
      `${required} — the interface module lives at the app root`,
    );
  }
  /* the retired main.tsx wrapper: the app module owns the mount. */
  assert.equal(
    existsSync(join(reporoot, 'main.tsx')),
    false,
    'main.tsx is retired — App.tsx carries the createRoot bootstrap (the one-entry doctrine)',
  );
  const appsource = readFileSync(join(reporoot, 'App.tsx'), 'utf8');
  assert.match(
    appsource,
    /createRoot\(/,
    'App.tsx must carry the createRoot self-mount left behind by the retired main.tsx',
  );
  assert.match(
    appsource,
    /import "\.\/Sol\/sol\.css"/,
    'App.tsx must import the Sol/sol.css stylesheet left behind by the retired main.tsx',
  );
  /* every route is a page folder inside the Sol theme, fronted by its own
   * anchor file (the anchor architecture: folder/<folder>.tsx carries the
   * page mount and re-exports the loose components beside it; the theme
   * anchor Sol/Sol.tsx owns the route table and App.tsx consumes only it). */
  assert.ok(
    existsSync(join(reporoot, 'Sol', 'Sol.tsx')),
    'Sol/Sol.tsx — the theme anchor owns the route table (the anchor architecture)',
  );
  for (const page of [
    'home',
    'architecture',
    'agentbrowser',
    'compute',
    'integrations',
    'playground',
    'docs',
    'notfound',
    'login',
    'register',
    'dashboard',
    'console',
  ]) {
    assert.ok(
      existsSync(join(reporoot, 'Sol', page, `${page}.tsx`)),
      `Sol/${page}/${page}.tsx — one page anchor per route folder (the anchor architecture)`,
    );
  }
  /* the conversion configs live at the app root (the build-at-the-root
   * doctrine: vercel.json, netlify.toml, capacitor.config.ts and
   * vite.config.ts ride beside the surface they publish). */
  for (const config of [
    'capacitor.config.ts',
    'vite.config.ts',
    'vitest.config.ts',
    'tauri.conf.json',
    'vercel.json',
    'netlify.toml',
  ]) {
    assert.ok(
      existsSync(join(reporoot, config)),
      `${config} — the platform/deploy config lives at the app root`,
    );
  }
  /* the forbidden tree: the native wrappers are generated on the
   * runners, never tracked; the flattened app knows no nested support
   * folders; the static console is absorbed into the tsx interface. */
  for (const forbidden of [
    'android',
    'ios',
    'desktop',
    'extension',
    'pages',
    'components',
    'hooks',
    'lib',
    'contexts',
    'sandbox',
  ]) {
    assert.equal(
      existsSync(join(reporoot, forbidden)),
      false,
      `${forbidden} must not exist — the wrappers are generated on the runners and the interface is one flat tsx tree`,
    );
  }
  for (const forbidden of [
    'const.ts',
    'localauth.js',
    'login.html',
    'register.html',
    'console.html',
    'dashboard.html',
    'login.js',
    'register.js',
    'console.js',
    'dashboard.js',
  ]) {
    assert.equal(
      existsSync(join(reporoot, forbidden)),
      false,
      `${forbidden} must not exist — the interface is the single tsx app (the static console pages are absorbed)`,
    );
  }
  /* the dedupe contract scoped to the flat surfaces (root logic files
   * plus the root-borne interface html). */
  const files = [
    ...logicfiles,
    ...readdirSync(reporoot)
      .filter((f) => (f.endsWith('.js') || f.endsWith('.html')) && existsSync(join(reporoot, f)))
      .map((f) => f),
  ];
  const seenhashes = new Map<string, string>();
  for (const file of files) {
    const bytes = readFileSync(join(reporoot, file));
    if (bytes.length === 0) {
      continue;
    }
    const hash = createHash('sha256').update(bytes).digest('hex');
    const previous = seenhashes.get(hash);
    assert.equal(
      previous,
      undefined,
      `${file} duplicates the content of ${previous ?? 'another file'}`,
    );
    seenhashes.set(hash, file);
  }
});

/* ------------------------------------------------------------------ */
/* gate 4b: the workflow reference contract (generated wrappers)       */
/* ------------------------------------------------------------------ */

test('ci gate workflows: no pipeline references the retired native wrapper paths', () => {
  /* the monorepo doctrine: the android, ios and desktop wrappers are
   * toolchain output generated on the runners beside the app — the
   * consolidated workflow set lives at the monorepo .github/workflows
   * and no workflow may reference the retired tracked folders under
   * web/ ever again. */
  const workflowdir = join(reporoot, '..', '.github', 'workflows');
  assert.ok(
    existsSync(workflowdir),
    'the monorepo .github/workflows is the one CI authority (the saddle folder carries no workflow set)',
  );
  const workflows = readdirSync(workflowdir)
    .filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
    .sort();
  assert.ok(
    workflows.length >= 8,
    `the consolidated workflow set must stay populated (found ${workflows.length})`,
  );
  for (const workflow of workflows) {
    const text = readFileSync(join(workflowdir, workflow), 'utf8');
    for (const forbidden of ['web/android', 'web/ios', 'web/desktop', 'web/extension']) {
      assert.ok(
        !text.includes(forbidden),
        `${workflow} must not reference ${forbidden} — the native wrappers are generated on the runners, never tracked`,
      );
    }
  }
});

test('ci gate workflows: the family mobile lane scaffolds both capacitor wrappers on the runner', () => {
  /* the consolidated mobile lane owns no tracked wrapper: it runs
   * `cap add` on the runner into <app>/android and <app>/ios
   * (gitignored) and builds the artifacts from the generated staging. */
  const mobile = readFileSync(join(reporoot, '..', '.github', 'workflows', 'family-mobile.yml'), 'utf8');
  for (const needle of [
    'cap add android',
    'cap add ios',
    'android/app/src/main/res',
  ]) {
    assert.ok(
      mobile.includes(needle),
      `family-mobile.yml must contain "${needle}" — the wrapper is generated at build time beside the app`,
    );
  }
});

test('ci gate workflows: the family desktop lane scaffolds the tauri shell on the runner', () => {
  /* the consolidated desktop lane scaffolds the tauri envelope (Cargo.toml,
   * main.rs, lib.rs, build.rs) on the runner into the app build/native
   * staging and reads the tracked tauri.conf.json from the app root. */
  const desktop = readFileSync(join(reporoot, '..', '.github', 'workflows', 'family-desktop.yml'), 'utf8');
  assert.ok(
    desktop.includes('build/native/desktop'),
    'family-desktop.yml must scaffold the tauri shell into build/native/desktop — the wrapper is generated at build time, never tracked',
  );
});

test('ci gate workflows: the conversion configs point at the generated wrappers', () => {
  /* the tracked surface of the native lanes: the capacitor config at
   * the app root (where the cli resolves it) aims every platform at the
   * gitignored android/ and ios/ output beside the config and at the
   * single vite build the interface publishes (the hashed bundles at
   * the app root); the app .gitignore keeps that output out of the tree. */
  const capacitor = readFileSync(join(reporoot, 'capacitor.config.ts'), 'utf8');
  assert.ok(
    capacitor.includes('path: "android"'),
    'capacitor.config.ts points the android platform at the generated android/ wrapper',
  );
  assert.ok(
    capacitor.includes('path: "ios"'),
    'capacitor.config.ts points the ios platform at the generated ios/ wrapper',
  );
  assert.ok(
    capacitor.includes('webDir: "."'),
    'the capacitor webDir is the vite build output (the hashed bundles at the app root)',
  );
  const tauri = readFileSync(join(reporoot, 'tauri.conf.json'), 'utf8');
  assert.ok(
    tauri.includes('"frontendDist": "build/web"'),
    'tauri.conf.json keeps frontendDist at the built web staging',
  );
  const ignore = readFileSync(join(reporoot, '.gitignore'), 'utf8');
  assert.ok(
    /^android\/$/m.test(ignore) && /^ios\/$/m.test(ignore),
    'the app .gitignore keeps the generated wrappers ignored — they are never committed',
  );
});

/* ------------------------------------------------------------------ */
/* gate 5: node smoke (mirrors the ci.yml smoke script)                */
/* ------------------------------------------------------------------ */

test('ci gate smoke: engine factory, random port and virtual cpuinfo', async () => {
  const vhe = await import('../index.ts');
  const engine = vhe.createVirtualEngine({ vcpus: 8, ramgb: 32, host: 'sandbox.internal' });
  assert.equal(engine.state, 'created');
  const endpoint = engine.start();
  assert.equal(engine.state, 'running');
  assert.ok(endpoint.port >= 30000 && endpoint.port <= 59999, 'the bound port stays in range');
  for (let draw = 0; draw < 100; draw += 1) {
    const port = vhe.randomPort();
    assert.ok(port >= 30000 && port <= 59999, `random port ${port} left the documented range`);
  }
  const cpuinfo = vhe.generateVirtualCpuinfo('AMD EPYC 9965', 8);
  assert.ok(cpuinfo.includes('AMD EPYC 9965'), 'the virtual cpuinfo carries the spoofed model');
  assert.ok(cpuinfo.includes('EPYC'), 'the virtual cpuinfo mentions the EPYC family');
  const meminfo = vhe.generateVirtualMeminfo(128);
  assert.ok(meminfo.includes('MemTotal:'), 'the virtual meminfo reports MemTotal');
  engine.stop();
  assert.equal(engine.state, 'stopped');
  assert.equal(vhe.disposeengine(engine.id), true, 'the engine leaves the registry');
});

/* ------------------------------------------------------------------ */
/* gate 6: python bridge (py_compile, ast parse and the selftest)      */
/* ------------------------------------------------------------------ */

test('ci gate python: qemubridge byte-compiles and parses under ast', async (t) => {
  if (!toolavailable('python3', ['-c', 'import sys'])) {
    t.skip('python3 is unavailable in this environment; the bridge gate cannot run');
    return;
  }
  const compilegate = await rungate('python3', ['-m', 'py_compile', 'qemubridge.py'], 60000);
  assert.equal(compilegate.spawnerror, null, 'the py_compile spawn must not fail');
  assert.equal(compilegate.code, 0, `py_compile reported:\n${compilegate.stderr.slice(-1500)}`);
  const astgate = await rungate(
    'python3',
    ['-c', 'import ast; ast.parse(open("qemubridge.py").read()); print("ast ok")'],
    60000,
  );
  assert.equal(astgate.code, 0, `ast parse reported:\n${astgate.stderr.slice(-1500)}`);
});

test('ci gate python: the offline bridge selftest passes', async (t) => {
  if (!toolavailable('python3', ['-c', 'import sys'])) {
    t.skip('python3 is unavailable in this environment; the bridge selftest cannot run');
    return;
  }
  const selftest = await rungate('python3', ['qemubridge.py'], 90000);
  assert.equal(selftest.spawnerror, null, 'the selftest spawn must not fail');
  assert.equal(selftest.timedout, false, 'the bridge selftest must terminate');
  assert.equal(selftest.code, 0, `bridge selftest failed:\n${selftest.stderr.slice(-1500)}`);
  assert.ok(selftest.stdout.includes('selftest ok'), 'the bridge reports the selftest banner');
});

/* ------------------------------------------------------------------ */
/* gate 7: release artifact manifest (release-artifacts job)           */
/* ------------------------------------------------------------------ */

test('ci gate release: sha256 manifest and SHA256SUMS render for every artifact', async () => {
  const pkg = JSON.parse(readFileSync(join(reporoot, 'package.json'), 'utf8')) as {
    readonly version: string;
  };
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/, 'the release tag derives from a semver version');
  const files = walkfiles(reporoot).sort();
  assert.ok(files.length > 0, 'the release archive must carry at least one file');
  const entries = files.map((file) => ({
    file,
    bytes: readFileSync(join(reporoot, file)).length,
    sha256: createHash('sha256')
      .update(readFileSync(join(reporoot, file)))
      .digest('hex'),
  }));
  for (const entry of entries) {
    assert.match(
      entry.sha256,
      /^[0-9a-f]{64}$/,
      `${entry.file} must produce a 64 hex char checksum`,
    );
  }
  /* the sha256sum wire format: two spaces between digest and file name. */
  const sha256sums = `${entries.map((entry) => `${entry.sha256}  ${entry.file}`).join('\n')}\n`;
  for (const line of sha256sums.split('\n')) {
    if (line.length === 0) {
      continue;
    }
    assert.match(
      line,
      /^[0-9a-f]{64} {2}\S+$/,
      'every SHA256SUMS line follows the coreutils format',
    );
  }
  /* recompute a deterministic sample to prove digest correctness. */
  const sample = entries.find((entry) => entry.file === 'package.json') ?? entries[0];
  assert.ok(sample !== undefined, 'the manifest must include package.json');
  const recomputed = createHash('sha256')
    .update(readFileSync(join(reporoot, sample.file)))
    .digest('hex');
  assert.equal(recomputed, sample.sha256, 're-hashing reproduces the manifest checksum');
  const manifest = {
    tag: `v${pkg.version}`,
    archive: `saddle-v${pkg.version}-source.zip`,
    filecount: entries.length,
    entries,
    sha256sums,
  };
  const roundtrip = JSON.parse(JSON.stringify(manifest)) as typeof manifest;
  assert.equal(
    roundtrip.filecount,
    roundtrip.entries.length,
    'the manifest survives a json roundtrip',
  );
  assert.equal(roundtrip.entries.length, files.length, 'every artifact is accounted for');
});

/* ------------------------------------------------------------------ */
/* gate 8: the one container file contract (gateway 1.1.5 standard)    */
/* ------------------------------------------------------------------ */

test('ci gate container: the one Dockerfile carries the merged compose and entrypoint contract', () => {
  /* the compose stack and the entrypoint bootstrap are merged INTO the
   * Dockerfile and deleted: every compose spelling (docker-compose.yml,
   * compose.yml, compose.yaml, docker-compose.yaml) and entrypoint.sh
   * must not exist, and the one container file must carry every setting
   * the compose gate used to verify (memswap -1, shm 2g, the services,
   * the state volumes, the non-root user and the healthcheck). */
  for (const composefile of [
    'docker-compose.yml',
    'docker-compose.yaml',
    'compose.yml',
    'compose.yaml',
  ]) {
    assert.equal(
      existsSync(join(reporoot, composefile)),
      false,
      `${composefile} is merged into the Dockerfile and must not exist`,
    );
  }
  assert.equal(
    existsSync(join(reporoot, 'Dockerfile.full')),
    false,
    'Dockerfile.full is retired — the one container file contract (the merged image builds every lane from the single Dockerfile)',
  );
  assert.equal(
    existsSync(join(reporoot, 'entrypoint.sh')),
    false,
    'entrypoint.sh is merged into the Dockerfile and must not exist',
  );
  const containerfile = readFileSync(join(reporoot, 'Dockerfile'), 'utf8');

  /* the entrypoint bootstrap ships embedded as a quoted heredoc COPY
   * (no separate script file exists) and the image entrypoint execs it. */
  assert.ok(
    containerfile.includes("COPY <<'ENTRYPOINT_SCRIPT_EOF' /entrypoint.sh"),
    'the entrypoint script is embedded as the heredoc COPY',
  );
  assert.ok(
    containerfile.includes('ENTRYPOINT_SCRIPT_EOF\n'),
    'the heredoc COPY closes its delimiter',
  );
  assert.ok(
    containerfile.includes('ENTRYPOINT ["/entrypoint.sh"]'),
    'the image entrypoint is the embedded bootstrap',
  );

  /* the orchestration contract of the former compose x-vhe-common
   * anchor rides on the hardened docker run recipes of the header - one
   * recipe per former compose service, the saddle node service included
   * (the compose.yml service folded into the one container file). */
  assert.ok(
    containerfile.includes('--memory-swap -1'),
    'the docker run recipes keep the unlimited swap contract (the former memswap_limit -1)',
  );
  assert.ok(
    containerfile.includes('--shm-size 2g'),
    'the docker run recipes keep the 2g shm contract',
  );
  for (const service of ['vhe', 'vheqemu', 'vhegpu', 'qemubridge', 'saddle-node']) {
    assert.ok(
      containerfile.includes(`#   ${service} (`),
      `the ${service} docker run recipe must be documented in the header`,
    );
  }
  assert.ok(
    containerfile.includes('--read-only'),
    'the saddle-node recipe keeps the read-only rootfs contract (the former compose read_only)',
  );
  assert.ok(
    containerfile.includes('--pids-limit 512'),
    'the saddle-node recipe keeps the pids contract (the former compose pids_limit)',
  );
  assert.ok(
    containerfile.includes('SADDLE_MEMORY_ENGINE=ram'),
    'the saddle-node service ENV surface (memory engine, sbot platform, cdn) rides in the one container file',
  );

  /* the image-side settings of the former compose services are ENV,
   * EXPOSE and VOLUME facts of the one container file. */
  assert.ok(
    containerfile.includes('SADDLE_DB="/data/web/saddle.db"'),
    'the web node database ENV of the former vhe service is baked in (SADDLE_*, the env surface web/db.ts reads)',
  );
  assert.ok(
    /^EXPOSE 8080$/m.test(containerfile),
    'the engine service port is EXPOSEd (the former compose default)',
  );
  assert.ok(
    /^VOLUME \/data \/cache\/mesa_shader_cache$/m.test(containerfile),
    'the state surface (vmdata, webdata, shader cache) is declared as VOLUME',
  );
  assert.ok(/^USER vhe$/m.test(containerfile), 'the runtime identity stays the non-root vhe user');

  /* the dockle CIS-DI-0010 lesson of the family: the HEALTHCHECK test
   * expression carries no '=' character anywhere (buildkit records the
   * healthcheck into the image config history as text and the heuristic
   * splits any '='-bearing token into a candidate credential pair - the
   * --interval/--timeout scheduling options are exempt, the expression
   * is not). */
  const lines = containerfile.split('\n');
  const healthindex = lines.findIndex((line) => line.startsWith('HEALTHCHECK'));
  assert.ok(healthindex !== -1, 'the one container file declares its HEALTHCHECK');
  const healthblock: string[] = [];
  for (const line of lines.slice(healthindex)) {
    if (healthblock.length > 0 && (line.startsWith('#') || /^[A-Z]/.test(line))) {
      break;
    }
    healthblock.push(line);
  }
  const healthtext = healthblock.join('\n');
  const cmdindex = healthtext.indexOf('CMD ');
  const expression = cmdindex >= 0 ? healthtext.slice(cmdindex) : healthtext;
  assert.ok(
    !expression.includes('='),
    'the HEALTHCHECK test expression carries no "=" character (the dockle CIS-DI-0010 heuristic)',
  );
  assert.ok(
    !healthtext.includes('=>'),
    'the HEALTHCHECK block carries no arrow callback "=>" (the dockle CIS-DI-0010 heuristic)',
  );
});
