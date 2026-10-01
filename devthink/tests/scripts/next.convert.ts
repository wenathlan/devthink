// next.convert.ts — the automatic Next conversion of the family (no app duplicates
// a folder to get a Next version): every site follows the house pattern (no src)
// and this generator publishes in the release assets the complete site archive
// (tar.xz at the maximum xz level with a Brotli quality 11 overlay) plus the FOUR
// Next shapes the owner doctrine fixes: the next normal (the standard template
// with no folder blocking), the next zai (the standard template the Z.AI platform
// accepts, riding the gateway skill and the prisma kit), the next fifty (the same
// standard shape with the forbidden folders blocked and the deploy at the root)
// and the next personalized (no src, the app/ bridge at the root next to the house
// tree). Every shape carries the platform file set at its root (.npmrc, .nvmrc,
// biome, tsconfig, vercel, netlify, wrangler, the dev vars example, the manifest).
// The archives exist only in the release assets; the repository carries only the
// original folder of each application — the tree itself never carries a src/ or
// a Next scaffold for any app, the gateway included.
// Usage: node devthink/tests/scripts/next.convert.ts [version]   (at the monorepo root)
// The version is optional: every application answers its own package.json
// version when the argument is absent (the Family Release lane calls it
// without one), and the explicit argument pins one version for all assets.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { brotliCompressSync, constants as zlibconstants } from 'node:zlib';
import path from 'node:path';

const ROOT = process.cwd();
const version: string = process.argv[2] || process.env.VERSION || '';
if (process.argv[2] && !/^\d+\.\d+\.\d+$/.test(version)) { console.error('usage: node devthink/tests/scripts/next.convert.ts [version]'); process.exit(1); }

// limite de raiz: todo caminho resolvido precisa ficar dentro do monorepo
const DENTRO = (alvo: string): string => {
  const r = path.resolve(alvo);
  if (r !== ROOT && !r.startsWith(ROOT + path.sep)) throw new Error('path outside the monorepo root: ' + r);
  return r;
};

// the version of each asset answers the application own package.json (the
// per-application release lines), falling back to the explicit argument
const versionof = (app: string): string => {
  try {
    const answered = String(JSON.parse(readFileSync(path.join(DENTRO(path.join(ROOT, app)), 'package.json'), 'utf8')).version);
    if (/^\d+\.\d+\.\d+$/.test(answered)) return answered;
  } catch { /* the fallback below answers */ }
  if (!version) throw new Error('no version for ' + app + ': pass one as the argument');
  return version;
};

// sites in the house pattern (no src): they get the complete archive + the four next shapes
const CONVERT = ['devthink', 'vault', 'forge', 'foundry', 'argan', 'cadria', 'debonair', 'saddle', 'stealhead', 'getry'];

const SKIP = new Set(['node_modules', '.git', 'dist', 'release', '.next', 'build', 'docs', 'tests', '.github', 'coverage']);

const copytree = (from: string, to: string, comlock: boolean) => cpSync(DENTRO(from), DENTRO(to), { recursive: true, filter: (src: string) => {
  const base = path.basename(src);
  if (SKIP.has(base)) return false;
  if (!comlock && ['bun.lock', 'bun.lockb', 'package-lock.json', 'pnpm-lock.yaml', 'dev.log', 'server.log'].includes(base)) return false;
  return true;
} });

const themefolder = (root: string): string => {
  const base = path.join(DENTRO(root), 'App.tsx');
  if (existsSync(base)) return '.';
  return readdirSync(DENTRO(root)).filter((n: string) => {
    if (!/^[A-Za-z0-9.]+$/.test(n)) return false;
    const p = path.join(DENTRO(root), n);
    return statSync(p).isDirectory() && existsSync(path.join(p, 'App.tsx'));
  })[0] || '';
};

const packxz = (dir: string, outxz: string) => {
  const de = DENTRO(dir);
  const para = DENTRO(outxz);
  const rel = path.relative(de, para).split(path.sep).join('/');
  // the maximum xz level rides inside the tar: level 9 with --extreme
  execFileSync('tar', ['-cJf', rel, '.'], { cwd: de, stdio: 'pipe', env: { ...process.env, XZ_OPT: '-9e -T0' } });
  if (!existsSync(para)) throw new Error('the archive was not generated: ' + para);
  const head = readFileSync(para).subarray(0, 6).toString('latin1');
  if (!head.startsWith('\u00FD7zXZ\u0000')) throw new Error('the archive is not a valid xz: ' + para);
};

const overlay = (archive: string) => {
  const para = DENTRO(archive);
  // the Brotli overlay rides on top of the compressed archive, quality 11 (the maximum)
  writeFileSync(para + '.br', brotliCompressSync(readFileSync(para), { params: { [zlibconstants.BROTLI_PARAM_QUALITY]: 11 } }));
};

const platformset = (de: string, appdir: string) => {
  // the platform file set every next template carries at its root: the registry
  // and engine envelopes (npm, node), the house tooling (biome) and the deploy
  // platform copies (vercel, netlify, cloudflare/wrangler, the dev vars example)
  const sourcenpmrc = path.join(DENTRO(path.join(ROOT, appdir)), '.npmrc');
  if (existsSync(sourcenpmrc)) writeFileSync(path.join(de, '.npmrc'), readFileSync(sourcenpmrc));
  else writeFileSync(path.join(de, '.npmrc'), '# the family registry surface\n@wenathlan:registry=https://npm.pkg.github.com\n');
  const sourcenvmrc = path.join(DENTRO(path.join(ROOT, appdir)), '.nvmrc');
  if (existsSync(sourcenvmrc)) writeFileSync(path.join(de, '.nvmrc'), readFileSync(sourcenvmrc));
  else writeFileSync(path.join(de, '.nvmrc'), '26.10.0\n');
  writeFileSync(path.join(de, 'biome.json'), JSON.stringify({
    $schema: 'https://biomejs.dev/schemas/2.5.15/schema.json',
    linter: { enabled: true, rules: { recommended: true } },
    organizeImports: { enabled: true },
  }, null, 2));
  writeFileSync(path.join(de, 'vercel.json'), '{\n  "cleanUrls": true\n}\n');
  writeFileSync(path.join(de, 'netlify.toml'), '[build]\n  command = "npm run build"\n  publish = "."\n');
  writeFileSync(path.join(de, 'wrangler.toml'), `# Cloudflare/Workers config (deploy, bindings, domain routes)\nname = "${appdir}"\ncompatibility_date = "2026-09-01"\n\n[assets]\ndirectory = "."\n`);
  writeFileSync(path.join(de, '.dev.vars.example'), '# local wrangler dev secrets (never committed; copy to .dev.vars)\nDEVTHINK_DB_URL=placeholder\nDEVTHINK_RUNNER_TOKEN=placeholder\n');
  writeFileSync(path.join(de, 'manifest.json'), `{\n  "name": "${appdir}",\n  "short_name": "${appdir}",\n  "start_url": ".",\n  "display": "standalone"\n}\n`);
  writeFileSync(path.join(de, 'robots.txt'), 'User-agent: *\nAllow: /\n');
};

const scaffold = (appdir: string, staging: string, theme: string, variant: 'normal' | 'zai' | 'fifty' | 'personalized') => {
  const de = DENTRO(staging);
  const comsrc = variant !== 'personalized';
  const bloqueado = variant === 'fifty' || variant === 'personalized';
  const pastaapp = comsrc ? DENTRO(path.join(de, 'src', 'app')) : DENTRO(path.join(de, 'app'));
  const espec = theme === '.' ? (comsrc ? '../../App' : '../App') : (comsrc ? `../../${theme}/App` : `../${theme}/App`);
  const deps: Record<string, string> = { next: '^16.0.0', react: '^19.2.0', 'react-dom': '^19.2.0' };
  if (variant === 'zai') {
    // the zai shape rides the working gateway stack (the getry reference: the
    // database push and the compiled surface the platform button expects)
    deps.prisma = '^7.10.0';
    deps['@prisma/client'] = '^7.10.0';
    deps['@libsql/client'] = '^0.17.4';
  }
  writeFileSync(path.join(de, 'package.json'), JSON.stringify({
    name: `@wenathlan/${appdir}.next.${variant}`, private: true, version: versionof(appdir),
    scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
    dependencies: deps,
    devDependencies: { typescript: '^5.9.0', '@types/node': '^26.0.0', '@types/react': '^19.2.0', '@types/react-dom': '^19.2.0' },
  }, null, 2));
  if (bloqueado) {
    // the blocked shapes answer the house doctrine: no public folder, no dist
    // folder, the build lands at the root and the deploy reads the root
    writeFileSync(path.join(de, 'next.config.ts'), "import type { NextConfig } from 'next';\n\n// house customizations: no public folder, no dist folder, the build lands at the root\nconst config: NextConfig = {\n  distDir: 'build',\n};\n\nexport default config;\n");
  } else {
    // the unblocked shapes answer the Next defaults: the standard template the
    // platforms accept with no folder blocking at all
    writeFileSync(path.join(de, 'next.config.ts'), "import type { NextConfig } from 'next';\n\n// the standard template: the Next defaults answer every platform with no folder blocking\nconst config: NextConfig = {};\n\nexport default config;\n");
  }
  writeFileSync(path.join(de, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'es2022', lib: ['dom', 'dom.iterable', 'esnext'], allowJs: true, skipLibCheck: true,
      strict: true, noEmit: true, esModuleInterop: true, module: 'esnext', moduleResolution: 'bundler',
      resolveJsonModule: true, isolatedModules: true, jsx: 'preserve', incremental: true,
      plugins: [{ name: 'next' }], paths: { '@/*': ['./src/*'] },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  }, null, 2));
  writeFileSync(path.join(de, 'next-env.d.ts'), '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n');
  writeFileSync(path.join(de, '.gitignore'), 'node_modules/\n.next/\nbuild/\nout/\n.dev.vars\n');
  mkdirSync(pastaapp, { recursive: true });
  writeFileSync(path.join(pastaapp, 'layout.tsx'), `import type { ReactNode } from 'react';\n\nexport const metadata = { title: '${appdir}', description: '${appdir} — DevThink family' };\n\nexport default function RootLayout({ children }: { children: ReactNode }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}\n`);
  const bridge = `import dynamic from 'next/dynamic';\n\n// the app global anchor (router) lives ${theme === '.' ? 'at the root' : `in the theme folder ${theme}`}; Next only mounts it\nconst App = dynamic(() => import('${espec}'), { ssr: false });\n\nexport default function Page() {\n  return <App />;\n}\n`;
  writeFileSync(path.join(pastaapp, 'page.tsx'), bridge);
  const icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#g)"/></svg>\n';
  if (bloqueado) {
    // the blocked shapes keep the icons at the root: no public folder exists
    writeFileSync(path.join(de, 'icon.svg'), icon);
    writeFileSync(path.join(de, 'favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#7c3aed"/></svg>\n');
  } else {
    // the unblocked shapes carry the standard public folder the platforms expect
    mkdirSync(DENTRO(path.join(de, 'public')), { recursive: true });
    writeFileSync(path.join(de, 'public', 'icon.svg'), icon);
    writeFileSync(path.join(de, 'public', 'favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#7c3aed"/></svg>\n');
  }
  if (variant === 'zai') {
    // the zai shape rides the working deploy kit: the gateway skill, the prisma
    // schema and the deploy map (the getry reference the platform already deploys)
    const skilldir = DENTRO(path.join(de, 'skills', 'gateway'));
    mkdirSync(skilldir, { recursive: true });
    writeFileSync(path.join(skilldir, 'SKILL.md'), readFileSync(DENTRO(path.join(ROOT, 'getry', 'docs', 'skills', 'gateway.md'))));
    mkdirSync(DENTRO(path.join(de, 'prisma')), { recursive: true });
    writeFileSync(path.join(de, 'prisma', 'schema.prisma'), 'generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "libsql"\n  url      = env("DEVTHINK_DB_URL")\n}\n');
    writeFileSync(path.join(de, 'DEPLOY.md'), `# ${appdir} — the four next shapes and the deploy flow\n\nThe release assets carry four next archives of this application. Try them in this order: the next personalized first (the house tree one hundred percent personalized, already in the assets), then this next zai (the standard template the platform accepts with the gateway skill and the prisma kit), then the next fifty (the same shape with the forbidden folders blocked and the deploy at the root) and finally the next normal (the plain standard template). The flow inside the platform: download the archive, extract it with the package.json at the root, push the schema with prisma db push, run the build and press the publish button.\n`);
  }
  const shapedesc: Record<string, string> = {
    normal: 'the plain standard template with no folder blocking: the Next defaults answer every platform',
    zai: 'the standard template the Z.AI platform accepts, riding the gateway skill and the prisma kit',
    fifty: 'the standard shape with the forbidden folders blocked (no public, no dist, no assets, no build, no deploy) and the deploy reading the root',
    personalized: 'the house tree one hundred percent personalized: no src, the app/ bridge at the root beside the theme folder',
  };
  writeFileSync(path.join(de, 'README.md'), `# ${appdir} — next ${variant}\n\n${shapedesc[variant]}. The whole web surface ${comsrc ? 'moves into src/' : 'stays at the root'} (the theme folder ${theme === '.' ? 'at the root' : theme} with its pages and components stays untouched) and the Next scaffold (App Router) mounts the app global anchor. The complete site archive, in the house pattern, travels along in the release assets as ${appdir}.${versionof(appdir)}.tar.xz.\n`);
  platformset(de, appdir);
};

const out = DENTRO(path.join(ROOT, 'release'));
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const workroot = DENTRO(path.join(ROOT, '.nextzips'));
mkdirSync(workroot, { recursive: true });

for (const app of CONVERT) {
  const appdir = DENTRO(path.join(ROOT, app));
  if (!existsSync(appdir)) { console.error('missing app: ' + app); process.exit(1); }
  const work = DENTRO(path.join(workroot, app));
  rmSync(work, { recursive: true, force: true });

  // 1. the complete site in the house pattern
  const raw = DENTRO(path.join(work, 'site'));
  copytree(appdir, raw, false);
  packxz(raw, DENTRO(path.join(out, `${app}.${versionof(app)}.tar.xz`)));

  // 2. the next normal: the plain standard template with no folder blocking
  const themeof = (stage: string) => themefolder(DENTRO(path.join(stage, 'src')));
  const normal = DENTRO(path.join(work, 'nextnormal'));
  copytree(appdir, DENTRO(path.join(normal, 'src')), false);
  scaffold(app, normal, themeof(normal), 'normal');
  packxz(normal, DENTRO(path.join(out, `${app}.next.normal.${versionof(app)}.tar.xz`)));

  // 3. the next zai: the standard template the platform accepts + the deploy kit
  const zai = DENTRO(path.join(work, 'nextzai'));
  copytree(appdir, DENTRO(path.join(zai, 'src')), false);
  scaffold(app, zai, themeof(zai), 'zai');
  packxz(zai, DENTRO(path.join(out, `${app}.next.zai.${versionof(app)}.tar.xz`)));

  // 4. the next fifty: the blocked shape with the deploy reading the root
  const fifty = DENTRO(path.join(work, 'nextfifty'));
  copytree(appdir, DENTRO(path.join(fifty, 'src')), false);
  scaffold(app, fifty, themeof(fifty), 'fifty');
  packxz(fifty, DENTRO(path.join(out, `${app}.next.fifty.${versionof(app)}.tar.xz`)));

  // 5. the next personalized: no src, app/ sits at the root next to the house tree
  const personal = DENTRO(path.join(work, 'personalized'));
  copytree(appdir, personal, false);
  scaffold(app, personal, themefolder(personal), 'personalized');
  packxz(personal, DENTRO(path.join(out, `${app}.next.personalized.${versionof(app)}.tar.xz`)));
  console.log(`${app}: site + next.normal + next.zai + next.fifty + next.personalized (theme: ${themeof(normal) || 'none'})`);
}

// the Brotli overlay rides on top of every compressed archive
for (const file of readdirSync(out)) if (file.endsWith('.tar.xz')) overlay(DENTRO(path.join(out, file)));

rmSync(workroot, { recursive: true, force: true });
console.log('conversion complete: ' + readdirSync(out).join(', '));
