#!/usr/bin/env node
/* repo.case harvest. extracts every dependency key from every manifest blob of every commit of a git repository. plain cjs on node, zero external dependencies. the owner asked for the script: it walks the whole commit graph, filters manifest paths, reads the blobs (lazy fetch included for partial clones) and records package names, kinds, specs, origins and engines. */

'use strict';

const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 2) {
    const key = String(argv[i]).replace(/^--/, '');
    out[key] = argv[i + 1];
  }
  return out;
}

const opts = parseArgs(process.argv);
const repo = opts.repo;
const outFile = opts.out;
const label = opts.label || path.basename(repo || 'repo');
const absorbFiles = (opts.absorb || '').split(',').filter(Boolean);
const blobWorkers = Number(opts.workers || 8);
const chunkSize = Number(opts.chunk || 150);

if (!repo || !outFile) {
  console.error('usage: node repocase.harvest.cjs --repo <git path> --out <json> [--label allen|devthink] [--absorb union.json,...] [--workers 8] [--chunk 150]');
  process.exit(1);
}

function gitSync(params, timeout) {
  const r = spawnSync('git', ['-C', repo].concat(params), { maxBuffer: 1024 * 1024 * 1024, encoding: 'utf8', timeout: timeout || 120000 });
  if (r.status !== 0) throw new Error('git ' + params.join(' ') + ' failed: ' + (r.stderr || '').slice(0, 400));
  return r.stdout;
}

function gitAsync(params, timeout) {
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['-C', repo].concat(params), { maxBuffer: 1024 * 1024 * 1024 });
    let out = [];
    let err = '';
    let timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error('timeout')); }, timeout || 600000);
    child.stdout.on('data', (d) => out.push(d));
    child.stderr.on('data', (d) => { err += d.toString(); });
    child.on('error', (e) => { clearTimeout(timer); reject(e); });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) reject(new Error('git ' + params.join(' ') + ' failed: ' + err.slice(0, 400)));
      else resolve(Buffer.concat(out));
    });
  });
}

/* streams git ls-tree output line by line, zero full buffering. */
const { Readable } = require('node:stream');
const readline = require('node:readline');
function gitStreamLines(params, onLine, timeout) {
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['-C', repo].concat(params));
    let err = '';
    let finished = false;
    const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error('git stream timeout')); }, timeout || 300000);
    const rl = readline.createInterface({ input: child.stdout });
    rl.on('line', (line) => { onLine(line); });
    child.stderr.on('data', (d) => { err += d.toString(); });
    child.on('error', (e) => { clearTimeout(timer); reject(e); });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0 && !finished) reject(new Error('git ' + params.join(' ') + ' failed: ' + err.slice(0, 300)));
      else resolve();
    });
    rl.on('close', () => { finished = true; });
  });
}

/* manifest path patterns. basename based, any depth. */
const MANIFESTS = [
  { re: /(^|\/)package\.json$/, type: 'npm' },
  { re: /(^|\/)requirements[^/]*\.txt$/, type: 'python' },
  { re: /(^|\/)pyproject\.toml$/, type: 'python' },
  { re: /(^|\/)Pipfile$/, type: 'python' },
  { re: /(^|\/)setup\.py$/, type: 'python' },
  { re: /(^|\/)Cargo\.toml$/, type: 'cargo' },
  { re: /(^|\/)go\.mod$/, type: 'go' },
  { re: /(^|\/)Gemfile$/, type: 'gem' },
  { re: /(^|\/)composer\.json$/, type: 'composer' },
  { re: /(^|\/)deno\.jsonc?$/, type: 'deno' },
  { re: /(^|\/)pnpm-workspace\.ya?ml$/, type: 'pnpmws' },
  { re: /(^|\/)package\.10[^/]*\.json$/, type: 'catalog' },
  { re: /(^|\/)package-10[^/]*\.json$/, type: 'catalog' }
];

function manifestType(p) {
  for (const m of MANIFESTS) if (m.re.test(p)) return m.type;
  return null;
}

/* harvest state */
const packages = Object.create(null);
const engines = Object.create(null);
const repoHints = Object.create(null);
let commitsTotal = 0;
let treesScanned = 0;
let blobsSeen = 0;
const parseErrors = [];

function normSpec(v) {
  if (v == null) return '';
  const s = String(v).trim();
  return s.length > 60 ? s.slice(0, 60) : s;
}

function addPackage(name, kind, spec, origin, samplePath) {
  name = String(name).trim();
  if (!name || name.length > 200) return;
  let e = packages[name];
  if (!e) {
    e = packages[name] = { kinds: Object.create(null), specs: [], origins: [], paths: [], ecosystems: Object.create(null) };
  }
  e.kinds[kind] = true;
  if (spec && e.specs.length < 8 && !e.specs.includes(spec)) e.specs.push(spec);
  if (!e.origins.includes(origin)) e.origins.push(origin);
  if (samplePath && e.paths.length < 4 && !e.paths.includes(samplePath)) e.paths.push(samplePath);
}

function addEngine(name, spec, origin, samplePath) {
  name = String(name).trim();
  if (!name) return;
  let e = engines[name];
  if (!e) e = engines[name] = { specs: [], origins: [], paths: [] };
  const s = normSpec(spec);
  if (s && e.specs.length < 8 && !e.specs.includes(s)) e.specs.push(s);
  if (!e.origins.includes(origin)) e.origins.push(origin);
  if (samplePath && e.paths.length < 3 && !e.paths.includes(samplePath)) e.paths.push(samplePath);
}

function addRepoHint(name, url) {
  if (!name || !url) return;
  const u = String(url).trim();
  if (!/^https?:\/\//.test(u) && !/^git@/.test(u)) return;
  if (!repoHints[name] || repoHints[name].length < 300) {
    repoHints[name] = (repoHints[name] ? repoHints[name] + '\n' : '') + u;
  }
}

/* ============================= parsers ============================= */

function tryJson(text) {
  try { return JSON.parse(text); } catch (e) { return undefined; }
}

const NPM_KIND_EXACT = new Set(['overrides', 'resolutions', 'trustedDependencies', 'untrustedDependencies', 'savedDependencies', 'peerDependenciesMeta', 'pnpm', 'volta', 'catalog']);

function parseNpmManifest(text, origin, samplePath, isComposer) {
  const json = tryJson(text);
  if (!json || typeof json !== 'object') { parseErrors.push(samplePath); return; }
  if (isComposer) {
    for (const kind of ['require', 'require-dev']) {
      const obj = json[kind];
      if (obj && typeof obj === 'object') {
        for (const [name, spec] of Object.entries(obj)) {
          if (name === 'php' || name === 'hhvm' || /^php-\d/.test(name) || /^(ext|lib)-/.test(name)) addEngine(name, spec, origin, samplePath);
          else addPackage(name, 'composer.' + kind, normSpec(spec), origin, samplePath);
        }
      }
    }
    return;
  }
  for (const [key, value] of Object.entries(json)) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      /* scalar fields that are engines */
      if (key === 'packageManager' && typeof value === 'string') {
        const m = /^([^@]+)@(.+)$/.exec(value);
        if (m) addEngine(m[1], m[2], origin, samplePath);
      }
      continue;
    }
    if (/dependencies$/i.test(key) || NPM_KIND_EXACT.has(key)) {
      if (key === 'volta') {
        for (const [eng, spec] of Object.entries(value)) addEngine(eng, normSpec(spec), origin, samplePath);
        continue;
      }
      if (key === 'pnpm') {
        for (const [sub, subObj] of Object.entries(value)) {
          if (subObj && typeof subObj === 'object' && !Array.isArray(subObj)) {
            for (const [name, spec] of Object.entries(subObj)) addPackage(name, 'pnpm.' + sub, normSpec(spec), origin, samplePath);
          }
        }
        continue;
      }
      for (const [name, spec] of Object.entries(value)) {
        addPackage(name, key, normSpec(spec), origin, samplePath);
      }
    } else if (key === 'engines') {
      for (const [eng, spec] of Object.entries(value)) addEngine(eng, normSpec(spec), origin, samplePath);
    } else if (key === 'enginesMeta' || key === 'cpu' || key === 'os' || key === 'libc') {
      /* platform meta, keys are not packages */
    }
  }
}

function parseRequirements(text, origin, samplePath) {
  for (let raw of text.split(/\r?\n/)) {
    let line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('-')) continue;
    const hashIdx = line.indexOf(' #');
    if (hashIdx >= 0) line = line.slice(0, hashIdx).trim();
    line = line.split(';')[0].trim();
    line = line.replace(/\[[^\]]*\]/g, '');
    if (!line || line.startsWith('http') || line.startsWith('.') || line.includes('://')) continue;
    const m = /^([A-Za-z0-9][A-Za-z0-9._-]*)\s*(.*)$/.exec(line);
    if (!m) continue;
    const spec = m[2].replace(/\s+/g, ' ').trim();
    addPackage(m[1], 'python.requirements', spec, origin, samplePath);
  }
}

/* minimal toml walk. enough for dependency tables and arrays. */
function parseToml(text) {
  const sections = [];
  let current = { header: '', pairs: [], arrays: [] };
  sections.push(current);
  const lines = text.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    const header = /^\[\[?([^\]]+)\]\]?$/.exec(trimmed);
    if (header) {
      current = { header: header[1].trim(), pairs: [], arrays: [] };
      sections.push(current);
      i += 1;
      continue;
    }
    const arr = /^([A-Za-z0-9_.-]+)\s*=\s*\[/.exec(trimmed);
    if (arr) {
      /* accumulate until brackets balance */
      let buf = trimmed;
      let depth = (trimmed.match(/\[/g) || []).length - (trimmed.match(/\]/g) || []).length;
      let j = i;
      while (depth > 0 && j + 1 < lines.length) {
        j += 1;
        buf += ' ' + lines[j].trim();
        depth += (lines[j].match(/\[/g) || []).length - (lines[j].match(/\]/g) || []).length;
      }
      current.arrays.push({ key: arr[1], value: buf });
      i = j + 1;
      continue;
    }
    const pair = /^["']?([A-Za-z0-9_.-]+)["']?\s*=\s*(.+)$/.exec(trimmed);
    if (pair) current.pairs.push({ key: pair[1], value: pair[2].trim() });
    i += 1;
  }
  return sections;
}

function tomlStringValues(buf) {
  const out = [];
  const re = /"([^"]*)"/g;
  let m;
  while ((m = re.exec(buf))) out.push(m[1]);
  return out;
}

function parsePyproject(text, origin, samplePath) {
  const sections = parseToml(text);
  for (const sec of sections) {
    const h = sec.header;
    if (h === 'project' || h === 'build-system' || h === 'dependency-groups' || h === 'tool.pdm' || h === 'tool.pdm.dev-dependencies') {
      for (const arr of sec.arrays) {
        if (/^dependencies$/.test(arr.key) || /dependencies/.test(arr.key) || arr.key === 'requires') {
          const kind = h === 'build-system' ? 'python.build-system' : (h === 'project' ? 'python.dependencies' : 'python.' + h + '.' + arr.key);
          for (const v of tomlStringValues(arr.value)) {
            const m = /^([A-Za-z0-9][A-Za-z0-9._-]*)\s*(.*)$/.exec(v);
            if (m) addPackage(m[1], kind, m[2].trim(), origin, samplePath);
          }
        }
      }
      /* optional-dependencies inline table: dev = [ ... ] pairs */
      for (const p of sec.pairs) {
        if (p.key === 'optional-dependencies' || p.key === 'dev-dependencies' || /dependencies/.test(p.key)) {
          const inner = parseToml(p.value.replace(/^\{/, '').replace(/\}$/, ''));
          for (const isec of inner) {
            for (const arr of isec.arrays) {
              for (const v of tomlStringValues(arr.value)) {
                const m = /^([A-Za-z0-9][A-Za-z0-9._-]*)\s*(.*)$/.exec(v);
                if (m) addPackage(m[1], 'python.optional.' + p.key, m[2].trim(), origin, samplePath);
              }
            }
          }
        }
        if (p.key === 'requires-python') addEngine('python', p.value.replace(/"/g, ''), origin, samplePath);
      }
      continue;
    }
    const isDepTable = /(^|\.)dependencies$/.test(h) || h === 'packages' || h === 'dev-packages' || /^tool\.poetry(\.|$)/.test(h) && /dependencies/.test(h) || /^tool\.pdm\.dev-dependencies/.test(h);
    if (isDepTable) {
      for (const p of sec.pairs) {
        if (p.key === 'python') {
          const vm = /version\s*=\s*"([^"]+)"/.exec(p.value) || /^"([^"]+)"/.exec(p.value);
          addEngine('python', vm ? vm[1] : p.value, origin, samplePath);
          continue;
        }
        let spec = '';
        const sm = /^"([^"]+)"/.exec(p.value);
        if (sm) spec = sm[1];
        else {
          const vm = /version\s*=\s*"([^"]+)"/.exec(p.value);
          if (vm) spec = vm[1];
        }
        const kind = h.startsWith('tool.poetry') ? 'python.poetry' : (h === 'packages' || h === 'dev-packages' ? 'python.pipfile' : 'python.' + h.replace(/\./g, '.'));
        addPackage(p.key, kind === 'python.poetry' && /dev/.test(h) ? 'python.poetry.dev' : kind, spec, origin, samplePath);
      }
    }
  }
}

function parseCargo(text, origin, samplePath) {
  const sections = parseToml(text);
  for (const sec of sections) {
    const h = sec.header;
    if (/^(workspace\.)?(dev-|build-)?dependencies$/.test(h) || /^target\..*\.dependencies$/.test(h) || /(^|\.)dependencies$/.test(h)) {
      for (const p of sec.pairs) {
        let spec = '';
        const sm = /^"([^"]+)"/.exec(p.value);
        if (sm) spec = sm[1];
        else {
          const vm = /version\s*=\s*"([^"]*)"/.exec(p.value);
          if (vm) spec = vm[1];
        }
        const kind = /dev-dependencies/.test(h) ? 'cargo.dev-dependencies' : (/build-dependencies/.test(h) ? 'cargo.build-dependencies' : (/workspace/.test(h) ? 'cargo.workspace.dependencies' : 'cargo.dependencies'));
        addPackage(p.key, kind, spec, origin, samplePath);
      }
    }
    if (h === 'package' || h === 'workspace') {
      for (const p of sec.pairs) {
        if (p.key === 'rust-version' || p.key === 'edition') addEngine('rust-' + p.key, p.value.replace(/"/g, ''), origin, samplePath);
      }
    }
  }
}

function parseGoMod(text, origin, samplePath) {
  const lines = text.split(/\r?\n/);
  let inBlock = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('//')) continue;
    if (inBlock) {
      if (line.startsWith(')')) { inBlock = false; continue; }
      const m = /^(\S+)\s+(\S+)/.exec(line);
      if (m) addPackage(m[1], /\/\/\s*indirect/.test(raw) ? 'go.require.indirect' : 'go.require', m[2], origin, samplePath);
      continue;
    }
    if (line === 'require (') { inBlock = true; continue; }
    const req = /^require\s+(\S+)\s+(\S+)/.exec(line);
    if (req) { addPackage(req[1], 'go.require', req[2], origin, samplePath); continue; }
    const go = /^go\s+(\S+)/.exec(line);
    if (go) { addEngine('go', go[1], origin, samplePath); continue; }
    const tool = /^toolchain\s+(\S+)/.exec(line);
    if (tool) { addEngine('go-toolchain', tool[1], origin, samplePath); continue; }
  }
}

function parseGemfile(text, origin, samplePath) {
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const m = /^gem\s+['"]([^'"]+)['"]/.exec(line);
    if (m) { addPackage(m[1], 'gem', '', origin, samplePath); continue; }
    const r = /^ruby\s+['"]([^'"]+)['"]/.exec(line);
    if (r) addEngine('ruby', r[1], origin, samplePath);
  }
}

function stripJsonC(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:"'\\])\/\/[^\n\r]*/g, '$1')
    .replace(/,(\s*[}\]])/g, '$1');
}

function parseDeno(text, origin, samplePath) {
  const json = tryJson(stripJsonC(text));
  if (!json || typeof json !== 'object') { parseErrors.push(samplePath); return; }
  const imports = json.imports || {};
  for (const [spec, url] of Object.entries(imports)) {
    const sources = [spec, String(url || '')];
    for (const s of sources) {
      let m = /npm:((?:@[^@/]+\/)?[^@/]+(?:\/[^@]+)?)(?:@[^/]*)?/.exec(s);
      if (m) addPackage(m[1], 'deno.imports', '', origin, samplePath);
      m = /jsr:(?:@[^@/]+\/)?([^@/]+)@?/.exec(s);
      if (m) addPackage('@jsr/' + m[1], 'deno.imports', '', origin, samplePath);
    }
  }
}

function parsePnpmWorkspace(text, origin, samplePath) {
  let inCatalog = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\r$/, '');
    const trimmed = line.trim();
    if (/^catalog(\.[^:]+)?:\s*$/.test(trimmed) || trimmed === 'catalog:') { inCatalog = true; continue; }
    if (trimmed === 'packages:') { inCatalog = false; continue; }
    if (inCatalog) {
      const m = /^([A-Za-z0-9@][A-Za-z0-9@/._-]*)\s*:\s*(.+)$/.exec(trimmed);
      if (m && !trimmed.startsWith('#')) addPackage(m[1], 'pnpm.catalog', normSpec(m[2]), origin, samplePath);
      else if (trimmed && !trimmed.startsWith('  ') === false && trimmed === '') inCatalog = false;
    }
    if (trimmed && !/^ /.test(line) && !/^catalog/.test(trimmed)) inCatalog = false;
  }
}

function parseSetupPy(text, origin, samplePath) {
  const m = /install_requires\s*=\s*\[([\s\S]*?)\]/.exec(text);
  if (m) {
    for (const v of tomlStringValues(m[1])) {
      const pm = /^([A-Za-z0-9][A-Za-z0-9._-]*)\s*(.*)$/.exec(v);
      if (pm) addPackage(pm[1], 'python.setup', pm[2].trim(), origin, samplePath);
    }
  }
}

function parseCatalog(text, origin, samplePath) {
  const json = tryJson(text);
  if (!json || typeof json !== 'object') { parseErrors.push(samplePath); return; }
  const walk = (obj, depth) => {
    if (depth > 2 || !obj || typeof obj !== 'object') return;
    for (const [name, value] of Object.entries(obj)) {
      if (name === 'name' || name === 'version' || name === 'description' || name === 'meta' || name === 'packages' || name === 'repository') {
        if (value && typeof value === 'object' && name !== 'meta') walk(value, depth + 1);
        continue;
      }
      if (typeof value === 'string') {
        if (/^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)/.test(value)) addRepoHint(name, value);
        else if (/^git@/.test(value)) addRepoHint(name, value);
        else if (/^[\^~><= ]*\d/.test(value) || value === '*' || value === 'latest') addPackage(name, 'catalog', value, origin, samplePath);
        else addRepoHint(name, value);
      } else if (value && typeof value === 'object') {
        const repo = value.repository || value.repo || (typeof value.repository === 'object' ? value.repository.url : null);
        if (repo) addRepoHint(name, String(repo));
        if (value.version) addPackage(name, 'catalog', String(value.version), origin, samplePath);
        else walk(value, depth + 1);
      }
    }
  };
  walk(json, 0);
}

function parseBlob(type, text, origin, samplePath) {
  switch (type) {
    case 'npm': return parseNpmManifest(text, origin, samplePath, false);
    case 'composer': return parseNpmManifest(text, origin, samplePath, true);
    case 'python': {
      if (/requirements.*\.txt$/.test(samplePath)) return parseRequirements(text, origin, samplePath);
      if (/Pipfile$/.test(samplePath)) return parsePyproject(text, origin, samplePath);
      if (/setup\.py$/.test(samplePath)) return parseSetupPy(text, origin, samplePath);
      return parsePyproject(text, origin, samplePath);
    }
    case 'cargo': return parseCargo(text, origin, samplePath);
    case 'go': return parseGoMod(text, origin, samplePath);
    case 'gem': return parseGemfile(text, origin, samplePath);
    case 'deno': return parseDeno(text, origin, samplePath);
    case 'pnpmws': return parsePnpmWorkspace(text, origin, samplePath);
    case 'catalog': return parseCatalog(text, origin, samplePath);
  }
}

/* ============================= git walk ============================= */

async function main() {
  const commits = gitSync(['rev-list', '--all'], 120000).split('\n').map((s) => s.trim()).filter(Boolean);
  commitsTotal = commits.length;
  console.log('[' + label + '] commits: ' + commitsTotal);

  /* enumerate manifest blobs across every commit tree. streamed tree walk, zero full buffering. */
  const blobMap = new Map(); /* oid -> { type, paths: [] } */
  const seenTrees = new Set();
  let done = 0;
  const treeWorker = async (queue) => {
    for (const c of queue) {
      try {
        const treeOid = gitSync(['rev-parse', c + '^{tree}'], 60000).trim();
        if (seenTrees.has(treeOid)) continue;
        seenTrees.add(treeOid);
        let scanned = false;
        await gitStreamLines(['ls-tree', '-r', '--full-tree', c], (line) => {
          const tab = line.indexOf('\t');
          if (tab < 0) return;
          const meta = line.slice(0, tab).split(/\s+/);
          if (meta.length < 3 || meta[1] !== 'blob') return;
          const p = line.slice(tab + 1).trim();
          const t = manifestType(p);
          if (!t) return;
          const oid = meta[2];
          let entry = blobMap.get(oid);
          if (!entry) { entry = { type: t, paths: [] }; blobMap.set(oid, entry); }
          if (entry.paths.length < 3 && !entry.paths.includes(p)) entry.paths.push(p);
          if (!scanned) { scanned = true; treesScanned += 1; }
        }, 300000);
      } catch (e) {
        /* commit vanished or timeout, skip */
      }
      done += 1;
      if (done % 25 === 0) console.log('[' + label + '] trees walked: ' + done + '/' + commitsTotal + ', manifest blobs so far: ' + blobMap.size);
    }
  };
  const queues = Array.from({ length: 3 }, () => []);
  commits.forEach((c, i) => queues[i % 3].push(c));
  await Promise.all(queues.map(treeWorker));
  console.log('[' + label + '] unique manifest blobs: ' + blobMap.size);

  /* read blobs. parallel cat-file --batch workers handle lazy fetch on partial clones. */
  const oids = Array.from(blobMap.keys());
  const chunks = [];
  for (let i = 0; i < oids.length; i += chunkSize) chunks.push(oids.slice(i, i + chunkSize));

  const fetchChunk = async (chunk, attempt) => {
    try {
      return await new Promise((resolve, reject) => {
        const child = spawn('git', ['-C', repo, 'cat-file', '--batch'], { maxBuffer: 1024 * 1024 * 1024 });
        let bufs = [];
        let err = '';
        const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error('cat-file timeout')); }, 900000);
        child.stdout.on('data', (d) => bufs.push(d));
        child.stderr.on('data', (d) => { err += d.toString(); });
        child.on('error', (e) => { clearTimeout(timer); reject(e); });
        child.on('close', (code) => {
          clearTimeout(timer);
          if (code !== 0 && bufs.length === 0) reject(new Error('cat-file failed: ' + err.slice(0, 300)));
          else resolve(Buffer.concat(bufs));
        });
        child.stdin.write(chunk.join('\n') + '\n');
        child.stdin.end();
      });
    } catch (e) {
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 3000));
        return fetchChunk(chunk, attempt + 1);
      }
      throw e;
    }
  };

  let chunkDone = 0;
  const blobWorker = async (queue) => {
    for (const chunk of queue) {
      let buf;
      try {
        buf = await fetchChunk(chunk, 0);
      } catch (e) {
        console.error('[' + label + '] chunk failed permanently: ' + e.message);
        continue;
      }
      let off = 0;
      const total = buf.length;
      while (off < total) {
        const nl = buf.indexOf(0x0a, off);
        if (nl < 0) break;
        const header = buf.slice(off, nl).toString('utf8');
        const parts = header.split(/\s+/);
        if (parts.length < 3 || parts[1] !== 'blob') { off = nl + 1; continue; }
        const size = parseInt(parts[2], 10);
        if (!Number.isFinite(size)) { off = nl + 1; continue; }
        const body = buf.slice(nl + 1, nl + 1 + size);
        const oid = parts[0];
        const entry = blobMap.get(oid);
        if (entry && size <= 20 * 1024 * 1024) {
          blobsSeen += 1;
          try {
            parseBlob(entry.type, body.toString('utf8'), label, entry.paths[0] || '');
          } catch (e) {
            parseErrors.push(entry.paths[0] || oid);
          }
        }
        off = nl + 1 + size + 1;
      }
      chunkDone += 1;
      console.log('[' + label + '] blob chunk ' + chunkDone + '/' + chunks.length + ' (rss ' + Math.round(process.memoryUsage().rss / 1048576) + ' mb)');
    }
  };
  const blobQueues = Array.from({ length: blobWorkers }, () => []);
  chunks.forEach((ch, i) => blobQueues[i % blobWorkers].push(ch));
  await Promise.all(blobQueues.map(blobWorker));
  console.log('[' + label + '] blobs parsed: ' + blobsSeen);

  /* absorb previous union files */
  for (const f of absorbFiles) {
    if (!f) continue;
    let json;
    try { json = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { console.error('absorb skip: ' + f); continue; }
    const categories = json.categories || {};
    for (const [kind, map] of Object.entries(categories)) {
      if (!map || typeof map !== 'object') continue;
      for (const [name, spec] of Object.entries(map)) {
        if (kind === 'engines' || kind === 'volta') addEngine(name, normSpec(spec), 'union', 'organizado/md/package.json');
        else if (kind === 'pnpm') addPackage(name, 'pnpm.union', normSpec(spec), 'union', 'organizado/md/package.json');
        else addPackage(name, kind === 'dependencies' ? 'dependencies' : kind, normSpec(spec), 'union', 'organizado/md/package.json');
      }
    }
    const pk = json.packages || {};
    for (const [name, info] of Object.entries(pk)) {
      if (info && info.repository) addRepoHint(name, info.repository);
      if (info && Array.isArray(info.origins)) {
        const e = packages[name];
        if (e) for (const o of info.origins) if (!e.origins.includes(o)) e.origins.push(o);
      }
    }
    console.log('[' + label + '] absorbed union: ' + f);
  }

  /* stats */
  const ecosystemOf = (name) => {
    const e = packages[name];
    if (!e) return 'npm';
    if (e.kinds['python.requirements'] || Object.keys(e.kinds).some((k) => k.startsWith('python.'))) return 'python';
    if (Object.keys(e.kinds).some((k) => k.startsWith('cargo.'))) return 'cargo';
    if (Object.keys(e.kinds).some((k) => k.startsWith('go.'))) return 'go';
    if (Object.keys(e.kinds).some((k) => k.startsWith('gem'))) return 'gem';
    if (Object.keys(e.kinds).some((k) => k.startsWith('composer.'))) return 'composer';
    if (Object.keys(e.kinds).some((k) => k.startsWith('deno.'))) return 'deno';
    return 'npm';
  };
  const ecoCounts = {};
  const kindCounts = {};
  for (const [name, e] of Object.entries(packages)) {
    for (const k of Object.keys(e.kinds)) kindCounts[k] = (kindCounts[k] || 0) + 1;
    e.ecosystem = ecosystemOf(name);
    ecoCounts[e.ecosystem] = (ecoCounts[e.ecosystem] || 0) + 1;
    e.kinds = Object.keys(e.kinds);
    delete e.ecosystems;
  }

  const result = {
    label,
    repo,
    generatedAt: new Date().toISOString(),
    commits: commitsTotal,
    treesScanned,
    manifestBlobs: blobMap.size,
    blobsParsed: blobsSeen,
    parseErrors: parseErrors.length,
    uniquePackages: Object.keys(packages).length,
    ecosystemCounts: ecoCounts,
    kindCounts,
    packages,
    engines,
    repoHints
  };
  fs.writeFileSync(outFile, JSON.stringify(result));
  console.log('[' + label + '] wrote ' + outFile + ': ' + result.uniquePackages + ' packages, ' + Object.keys(engines).length + ' engines, ' + Object.keys(repoHints).length + ' repo hints');
}

main().catch((e) => { console.error(e); process.exit(1); });
