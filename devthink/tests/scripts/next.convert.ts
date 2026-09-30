// next.convert.ts — the automatic Next conversion of the family (no app duplicates
// a folder to get a Next version): every site follows the house pattern (no src)
// and this generator publishes in the release assets the complete site archive
// (tar.xz at the maximum xz level with a Brotli quality 11 overlay) + the Next
// standard archive (web surface moved into src/, Next scaffold around it) + the
// Next personalized archive (no src, the app/ bridge at the root next to the house
// tree). The archives exist only in the release assets; the repository carries
// only the original folder of each application. Apps born Next (getry) ship as a
// single archive with the lockfile, ready to download, push to the DB and compile.
// Usage: node devthink/tests/scripts/next.convert.ts <version>   (at the monorepo root)
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { brotliCompressSync, constants as zlibconstants } from 'node:zlib';
import path from 'node:path';

const ROOT = process.cwd();
const version: string = process.argv[2] || process.env.VERSION || '';
if (!/^\d+\.\d+\.\d+$/.test(version)) { console.error('usage: node devthink/tests/scripts/next.convert.ts <version>'); process.exit(1); }

// limite de raiz: todo caminho resolvido precisa ficar dentro do monorepo
const DENTRO = (alvo: string): string => {
  const r = path.resolve(alvo);
  if (r !== ROOT && !r.startsWith(ROOT + path.sep)) throw new Error('path outside the monorepo root: ' + r);
  return r;
};

// sites in the house pattern (no src): they get the complete archive + Next standard + Next personalized
const CONVERT = ['devthink', 'vault', 'forge', 'foundry'];
// apps born Next (src/): the single archive already is the Next version, with lockfile
const ASIS = ['getry'];

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

const scaffold = (appdir: string, staging: string, theme: string, comsrc: boolean) => {
  const de = DENTRO(staging);
  const pastaapp = comsrc ? DENTRO(path.join(de, 'src', 'app')) : DENTRO(path.join(de, 'app'));
  const espec = theme === '.' ? (comsrc ? '../../App' : '../App') : (comsrc ? `../../${theme}/App` : `../${theme}/App`);
  writeFileSync(path.join(de, 'package.json'), JSON.stringify({
    name: `@wenathlan/${appdir}.next`, private: true, version,
    scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
    dependencies: { next: '^16.0.0', react: '^19.2.0', 'react-dom': '^19.2.0' },
    devDependencies: { typescript: '^5.9.0', '@types/node': '^26.0.0', '@types/react': '^19.2.0', '@types/react-dom': '^19.2.0' },
  }, null, 2));
  // no public, no dist: the build lands at the root (Next only creates what the project uses)
  writeFileSync(path.join(de, 'next.config.ts'), "import type { NextConfig } from 'next';\n\n// personalizações da casa: sem pasta public, sem pasta dist, build na raiz\nconst config: NextConfig = {};\n\nexport default config;\n");
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
  writeFileSync(path.join(de, '.gitignore'), 'node_modules/\n.next/\nout/\n.dev.vars\n');
  mkdirSync(pastaapp, { recursive: true });
  writeFileSync(path.join(pastaapp, 'layout.tsx'), `import type { ReactNode } from 'react';\n\nexport const metadata = { title: '${appdir}', description: '${appdir} — DevThink family' };\n\nexport default function RootLayout({ children }: { children: ReactNode }) {\n  return (\n    <html lang="pt-BR">\n      <body>{children}</body>\n    </html>\n  );\n}\n`);
  const bridge = `import dynamic from 'next/dynamic';\n\n// the app global anchor (router) lives ${theme === '.' ? 'at the root' : `in the theme folder ${theme}`}; Next only mounts it\nconst App = dynamic(() => import('${espec}'), { ssr: false });\n\nexport default function Page() {\n  return <App />;\n}\n`;
  writeFileSync(path.join(pastaapp, 'page.tsx'), bridge);
  writeFileSync(path.join(de, 'README.md'), `# ${appdir} — Next version\n\nAutomatic conversion of the house pattern (no src) into the format the deploy platforms expect: the whole web surface moves into src/ (the theme folder ${theme === '.' ? 'at the root' : theme} with its pages and components stays untouched) and the Next scaffold (App Router) mounts the app global anchor — no public folder, no dist folder, the build lands at the root. The complete site archive, in the house pattern, travels along in the release assets as ${appdir}.${version}.tar.xz.\n`);
};

const out = DENTRO(path.join(ROOT, 'release'));
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const workroot = DENTRO(path.join(ROOT, '.nextzips'));
mkdirSync(workroot, { recursive: true });

for (const app of [...CONVERT, ...ASIS]) {
  const appdir = DENTRO(path.join(ROOT, app));
  if (!existsSync(appdir)) { console.error('missing app: ' + app); process.exit(1); }
  const work = DENTRO(path.join(workroot, app));
  rmSync(work, { recursive: true, force: true });

  // 1. the complete site in the house pattern
  const raw = DENTRO(path.join(work, 'site'));
  copytree(appdir, raw, !CONVERT.includes(app));
  packxz(raw, DENTRO(path.join(out, CONVERT.includes(app) ? `${app}.${version}.tar.xz` : `${app}.next.${version}.tar.xz`)));

  if (CONVERT.includes(app)) {
    // 2. the Next standard: the web surface moves into src/, the scaffold mounts the anchor
    const staging = DENTRO(path.join(work, 'next'));
    const stagingSrc = DENTRO(path.join(staging, 'src'));
    copytree(appdir, stagingSrc, false);
    scaffold(app, staging, themefolder(stagingSrc), true);
    packxz(staging, DENTRO(path.join(out, `${app}.next.${version}.tar.xz`)));

    // 3. the Next personalized: no src, app/ sits at the root next to the house tree
    const personal = DENTRO(path.join(work, 'personalized'));
    copytree(appdir, personal, false);
    scaffold(app, personal, themefolder(personal), false);
    packxz(personal, DENTRO(path.join(out, `${app}.next.personalized.${version}.tar.xz`)));
    console.log(`${app}: site + next + next.personalized (theme: ${themefolder(stagingSrc) || 'none'})`);
  } else {
    // 4. the personalized variant of the app born Next: the src content moves up to the root
    const personal = DENTRO(path.join(work, 'personalized'));
    const personalSrc = DENTRO(path.join(personal, 'src'));
    copytree(appdir, personalSrc, true);
    // the move uses a staging folder: the src content rises to the root without colliding with its own origin
    const stage = DENTRO(path.join(work, 'mover'));
    renameSync(personalSrc, stage);
    for (const child of readdirSync(stage)) renameSync(DENTRO(path.join(stage, child)), DENTRO(path.join(personal, child)));
    rmSync(stage, { recursive: true, force: true });
    packxz(personal, DENTRO(path.join(out, `${app}.next.personalized.${version}.tar.xz`)));
    console.log(`${app}: next (born Next, with lockfile) + next.personalized`);
  }
}

// the Brotli overlay rides on top of every compressed archive
for (const file of readdirSync(out)) if (file.endsWith('.tar.xz')) overlay(DENTRO(path.join(out, file)));

rmSync(workroot, { recursive: true, force: true });
console.log('conversion complete: ' + readdirSync(out).join(', '));
