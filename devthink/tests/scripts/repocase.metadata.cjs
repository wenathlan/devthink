#!/usr/bin/env node
/* repo.case metadata. merges the harvest files of both repositories and pulls the package descriptions from the public registries: npmjs latest manifest, pypi json, crates.io api, rubygems api, packagist api. falls back to repository hints harvested from the catalogs. plain cjs on node, zero external dependencies, resumable through the cache file. */

'use strict';

const fs = require('node:fs');

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 2) {
    const key = String(argv[i]).replace(/^--/, '');
    out[key] = argv[i + 1];
  }
  return out;
}

const opts = parseArgs(process.argv);
const depsFiles = (opts.deps || '').split(',').filter(Boolean);
const outFile = opts.out;
const cacheFile = opts.cache || outFile + '.cache';
const concurrency = Number(opts.concurrency || 24);

if (!depsFiles.length || !outFile) {
  console.error('usage: node repocase.metadata.cjs --deps a.json,b.json --out meta.json [--cache file] [--concurrency 24]');
  process.exit(1);
}

/* ---------------- merge harvests ---------------- */
const merged = Object.create(null);
const engines = Object.create(null);
const repoHints = Object.create(null);
const sourcesMeta = [];
for (const f of depsFiles) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  sourcesMeta.push({ label: j.label, commits: j.commits, manifestBlobs: j.manifestBlobs, blobsParsed: j.blobsParsed, uniquePackages: j.uniquePackages });
  for (const [name, info] of Object.entries(j.packages || {})) {
    let e = merged[name];
    if (!e) e = merged[name] = { kinds: [], specs: [], origins: [], paths: [], ecosystem: info.ecosystem || 'npm' };
    for (const k of info.kinds || []) if (!e.kinds.includes(k)) e.kinds.push(k);
    for (const s of info.specs || []) if (e.specs.length < 8 && !e.specs.includes(s)) e.specs.push(s);
    for (const o of info.origins || []) if (!e.origins.includes(o)) e.origins.push(o);
    for (const p of info.paths || []) if (e.paths.length < 4 && !e.paths.includes(p)) e.paths.push(p);
    if ((info.ecosystem || 'npm') !== 'npm' && e.ecosystem === 'npm') e.ecosystem = info.ecosystem;
  }
  for (const [name, info] of Object.entries(j.engines || {})) {
    let e = engines[name];
    if (!e) e = engines[name] = { specs: [], origins: [] };
    for (const s of info.specs || []) if (e.specs.length < 8 && !e.specs.includes(s)) e.specs.push(s);
    for (const o of info.origins || []) if (!e.origins.includes(o)) e.origins.push(o);
  }
  for (const [name, hints] of Object.entries(j.repoHints || {})) {
    if (!repoHints[name]) repoHints[name] = hints;
  }
}
const names = Object.keys(merged).sort();
console.log('merged packages: ' + names.length);

/* ---------------- link normalization ---------------- */
function normalizeRepo(u) {
  if (!u || typeof u !== 'string') return null;
  let s = u.trim();
  s = s.replace(/^git\+https:\/\//, 'https://').replace(/^git\+ssh:\/\/git@/, 'https://').replace(/^git:\/\//, 'https://');
  s = s.replace(/^ssh:\/\/git@/, 'https://').replace(/^git@([^:]+):([^#]+)/, 'https://$1/$2');
  s = s.replace(/^github:/, 'https://github.com/').replace(/^bitbucket:/, 'https://bitbucket.org/').replace(/^gitlab:/, 'https://gitlab.com/');
  s = s.replace(/\.git(#.*)?$/, '').replace(/[?#].*$/, '');
  s = s.replace(/\/+$/, '');
  if (/^https:\/\/(github\.com|gitlab\.com|bitbucket\.org|codeberg\.org|sr\.ht|gitee\.com|sourceforge\.net|git\.sr\.ht)\/[\w.\-~]+\/[\w.\-~]+$/.test(s)) return s;
  if (/^https:\/\/(github\.com|gitlab\.com|bitbucket\.org|codeberg\.org)\/[\w.\-~]+\/[\w.\-~]+\//.test(s)) {
    const m = s.match(/^https:\/\/[^\/]+\/[^\/]+\/[^\/]+/);
    return m ? m[0] : null;
  }
  return null;
}

function validRepoLink(u) {
  return typeof u === 'string' && /^https:\/\/[\w.\-]+\/[\w.\-~]+\/[\w.\-~]+/.test(u);
}

function registryLink(name, eco) {
  switch (eco) {
    case 'python': return 'https://pypi.org/project/' + encodeURIComponent(name) + '/';
    case 'cargo': return 'https://crates.io/crates/' + encodeURIComponent(name);
    case 'gem': return 'https://rubygems.org/gems/' + encodeURIComponent(name);
    case 'composer': return 'https://packagist.org/packages/' + encodeURIComponent(name);
    case 'go': return 'https://pkg.go.dev/' + name;
    default:
      if (name.startsWith('@jsr/')) return 'https://jsr.io/' + name.slice(5);
      return 'https://www.npmjs.com/package/' + encodeURIComponent(name);
  }
}

function cleanUse(s) {
  if (!s || typeof s !== 'string') return null;
  let t = s.replace(/\s+/g, ' ').trim();
  if (t.length > 220) t = t.slice(0, 217).trim() + '...';
  return t || null;
}

/* ---------------- cache ---------------- */
let cache = {};
if (fs.existsSync(cacheFile)) {
  try { cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8')); } catch (e) { cache = {}; }
}
let cacheDirty = 0;
function saveCache() {
  fs.writeFileSync(cacheFile, JSON.stringify(cache));
  cacheDirty = 0;
}

/* ---------------- fetchers ---------------- */
class HttpError extends Error {
  constructor(status, url) {
    super('http ' + status + ' ' + url);
    this.status = status;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function jsonGet(url, extraHeaders) {
  const headers = { 'accept': 'application/json', 'user-agent': 'repocase-harvest (dependency catalog build)' };
  if (extraHeaders) Object.assign(headers, extraHeaders);
  for (let attempt = 0; attempt < 6; attempt += 1) {
    let res;
    try {
      res = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
    } catch (e) {
      if (attempt === 5) throw e;
      await sleep(1200 * (attempt + 1));
      continue;
    }
    if (res.ok) return res.json();
    if (res.status === 404 || res.status === 410) throw new HttpError(res.status, url);
    if (res.status === 429 || res.status >= 500) {
      const delay = Math.min(45000, 2500 * Math.pow(2, attempt)) + Math.floor(Math.random() * 1500);
      await sleep(delay);
      continue;
    }
    throw new HttpError(res.status, url);
  }
  throw new HttpError(0, url);
}

async function fetchNpm(name) {
  const enc = name.startsWith('@jsr/') ? null : encodeURIComponent(name);
  const j = await jsonGet('https://registry.npmjs.org/' + enc + '/latest');
  const repoRaw = typeof j.repository === 'string' ? j.repository : (j.repository && j.repository.url) || null;
  return {
    eco: 'npm',
    use: cleanUse(j.description),
    keywords: Array.isArray(j.keywords) ? j.keywords.slice(0, 8) : [],
    license: j.license || null,
    repo: normalizeRepo(repoRaw) || normalizeRepo(j.homepage),
    homepage: typeof j.homepage === 'string' && /^https?:\/\//.test(j.homepage) ? j.homepage : null,
    source: 'npmjs'
  };
}

function pypiNorm(name) {
  return name.toLowerCase().replace(/[-_.]+/g, '-');
}

async function fetchPypi(name) {
  try {
    const j = await jsonGet('https://pypi.org/pypi/' + encodeURIComponent(name) + '/json');
    return pypiFrom(j, name);
  } catch (e) {
    const n = pypiNorm(name);
    if (n !== name) {
      const j = await jsonGet('https://pypi.org/pypi/' + encodeURIComponent(n) + '/json');
      return pypiFrom(j, name);
    }
    throw e;
  }
}

function pypiFrom(j) {
  const info = j.info || {};
  const urls = info.project_urls || {};
  const repo = normalizeRepo(urls.Source) || normalizeRepo(urls.Repository) || normalizeRepo(urls['Source Code']) || normalizeRepo(urls.GitHub) || normalizeRepo(urls.source) || normalizeRepo(info.home_page);
  return {
    eco: 'python',
    use: cleanUse(info.summary || (info.description || '').split('\n')[0] || null),
    keywords: typeof info.keywords === 'string' && info.keywords ? info.keywords.split(/[,;]\s*/).slice(0, 8) : [],
    license: (info.license || '').toString().slice(0, 40) || null,
    repo: repo,
    homepage: /^https?:\/\//.test(info.home_page || '') ? info.home_page : (urls.Homepage || null),
    source: 'pypi'
  };
}

async function fetchCargo(name) {
  const j = await jsonGet('https://crates.io/api/v1/crates/' + encodeURIComponent(name));
  const c = j.crate || {};
  return {
    eco: 'cargo',
    use: cleanUse(c.description),
    keywords: (j.categories || []).map((x) => x.id || x).slice(0, 6),
    license: c.license || null,
    repo: normalizeRepo(c.repository) || normalizeRepo(c.homepage),
    homepage: /^https?:\/\//.test(c.homepage || '') ? c.homepage : null,
    source: 'crates.io'
  };
}

async function fetchGem(name) {
  const j = await jsonGet('https://rubygems.org/api/v1/gems/' + encodeURIComponent(name) + '.json');
  return {
    eco: 'gem',
    use: cleanUse(j.description || (j.info || '').split('\n')[0] || null),
    keywords: [],
    license: j.license || null,
    repo: normalizeRepo(j.source_code_uri) || normalizeRepo(j.homepage_uri),
    homepage: /^https?:\/\//.test(j.homepage_uri || '') ? j.homepage_uri : null,
    source: 'rubygems'
  };
}

async function fetchComposer(name) {
  const j = await jsonGet('https://repo.packagist.org/p/' + encodeURIComponent(name) + '.json');
  const pkgs = (j.packages || {})[name] || {};
  const versions = Object.keys(pkgs).filter((v) => /^[0-9]/.test(v)).sort(cmpVer);
  const latest = pkgs[versions[versions.length - 1]] || {};
  return {
    eco: 'composer',
    use: cleanUse(latest.description),
    keywords: [],
    license: latest.license || null,
    repo: normalizeRepo(latest.source && latest.source.url),
    homepage: /^https?:\/\//.test(latest.homepage || '') ? latest.homepage : null,
    source: 'packagist'
  };
}

function cmpVer(a, b) {
  const pa = a.split(/[.-]/).map(Number);
  const pb = b.split(/[.-]/).map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
}

async function fetchOne(name, eco) {
  switch (eco) {
    case 'python': return fetchPypi(name);
    case 'cargo': return fetchCargo(name);
    case 'gem': return fetchGem(name);
    case 'composer': return fetchComposer(name);
    case 'go': return { eco: 'go', use: null, keywords: [], license: null, repo: null, homepage: null, source: 'none' };
    case 'deno': {
      if (name.startsWith('@jsr/')) return { eco: 'deno', use: null, keywords: [], license: null, repo: null, homepage: null, source: 'none' };
      try { return await fetchNpm(name); } catch (e) { return { eco: 'deno', use: null, keywords: [], license: null, repo: null, homepage: null, source: 'none' }; }
    }
    default: return fetchNpm(name);
  }
}

async function main() {
  /* repair pass: drop cache entries whose repository field was truncated by the old normalizer */
  let repaired = 0;
  for (const [name, entry] of Object.entries(cache)) {
    if (entry && entry.repo !== null && entry.repo !== undefined && !validRepoLink(entry.repo)) {
      delete cache[name];
      repaired += 1;
    } else if (entry && typeof entry.repo === 'string' && entry.repo.length < 12) {
      delete cache[name];
      repaired += 1;
    }
  }
  if (repaired) {
    console.log('cache repair: dropped ' + repaired + ' poisoned entries for refetch');
    saveCache();
  }
  let done = 0;
  const failures = [];
  const queue = names.slice();
  const ecoSlow = new Set(['cargo', 'composer', 'gem']);
  const inflight = [];
  let idx = 0;

  async function worker() {
    while (idx < queue.length) {
      const name = queue[idx];
      idx += 1;
      const info = merged[name];
      const eco = info.ecosystem || 'npm';
      if (!cache[name]) {
        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            const r = await fetchOne(name, eco);
            if (r) { cache[name] = r; break; }
          } catch (e) {
            if (attempt === 2 || (e.status === 404) || (e.status === 410)) failures.push(name);
            else await sleep(1500);
          }
        }
        cacheDirty += 1;
        await sleep(ecoSlow.has(eco) ? 200 : 60);
      }
      done += 1;
      if (done % 500 === 0) {
        console.log('metadata: ' + done + '/' + queue.length + ' (failures ' + failures.length + ')');
        if (cacheDirty > 400) saveCache();
      }
    }
  }
  for (let i = 0; i < concurrency; i += 1) inflight.push(worker());
  await Promise.all(inflight);
  saveCache();

  /* build the final meta map with link and use resolution */
  const meta = {};
  for (const name of names) {
    const info = merged[name];
    const eco = info.ecosystem || 'npm';
    const c = cache[name] || {};
    const hintRepo = normalizeRepo((repoHints[name] || '').split('\n')[0]);
    const link = c.repo || hintRepo || c.homepage || registryLink(name, eco);
    meta[name] = {
      ecosystem: c.eco || eco,
      kinds: info.kinds,
      origins: info.origins,
      link,
      use: c.use || null,
      keywords: c.keywords || [],
      license: c.license || null,
      source: c.source || 'registry',
      repo: c.repo || hintRepo || null
    };
  }
  const out = {
    generatedAt: new Date().toISOString(),
    sources: sourcesMeta,
    uniquePackages: names.length,
    failures: failures.length,
    packages: meta,
    engines
  };
  fs.writeFileSync(outFile, JSON.stringify(out));
  console.log('wrote ' + outFile + ': ' + names.length + ' packages, ' + failures.length + ' registry failures, ' + Object.values(meta).filter((m) => m.use).length + ' with descriptions');
}

main().catch((e) => { console.error(e); process.exit(1); });
