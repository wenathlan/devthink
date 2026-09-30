// next.convert.ts — a conversão Next automática da família (nenhum app duplica
// pasta para ter versão Next): cada site segue o padrão da casa (sem src) e este
// gerador publica nos assets da release o zip completo do site + o zip Next
// (superfície web movida para src/, scaffold Next gerado em volta). Os zips
// existem só nos assets do release; o repositório carrega apenas a pasta
// original de cada aplicativo. Os apps que já nascem Next (getry) saem como um
// único zip, com o lockfile, prontos para baixar, fazer o push no DB e compilar.
// Uso: node devthink/tests/scripts/next.convert.ts <versão>   (na raiz do monorepo)
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ROOT = process.cwd();
const version: string = process.argv[2] || process.env.VERSION || '';
if (!/^\d+\.\d+\.\d+$/.test(version)) { console.error('uso: node devthink/tests/scripts/next.convert.ts <versão>'); process.exit(1); }

// limite de raiz: todo caminho resolvido precisa ficar dentro do monorepo
const DENTRO = (alvo: string): string => {
  const r = path.resolve(alvo);
  if (r !== ROOT && !r.startsWith(ROOT + path.sep)) throw new Error('caminho fora da raiz do monorepo: ' + r);
  return r;
};

// sites no padrão da casa (sem src): recebem zip completo + zip Next convertido
const CONVERT = ['devthink', 'vault', 'forge', 'foundry', 'next.personalizado'];
// apps que já nascem Next (src/): o zip único já é a versão Next, com lockfile
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

const zipit = (dir: string, outzip: string) => {
  const de = DENTRO(dir);
  const para = DENTRO(outzip);
  const rel = path.relative(de, para).split(path.sep).join('/');
  try { execFileSync('zip', ['-qr', rel, '.'], { cwd: de, stdio: 'pipe' }); }
  catch {
    if (process.platform === 'win32') {
      // o bsdtar do Windows cria zip de verdade (formato pelo sufixo .zip), com barras normais
      execFileSync('C:\\Windows\\System32\\tar.exe', ['-a', '-cf', para, '.'], { cwd: de, stdio: 'pipe' });
    } else {
      execFileSync('tar', ['-a', '-cf', rel, '.'], { cwd: de, stdio: 'pipe' });
    }
  }
  // valida o zip de verdade: a assinatura End-of-Central-Directory precisa existir
  if (!existsSync(para)) throw new Error('o zip não foi gerado: ' + para);
  const fim = readFileSync(para).subarray(-22).toString('latin1');
  if (!fim.startsWith('PK\u0005\u0006')) throw new Error('o arquivo não é um zip válido: ' + para);
};

const scaffold = (appdir: string, staging: string, theme: string) => {
  writeFileSync(path.join(staging, 'package.json'), JSON.stringify({
    name: `@wenathlan/${appdir}.next`, private: true, version,
    scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
    dependencies: { next: '^16.0.0', react: '^19.2.0', 'react-dom': '^19.2.0' },
    devDependencies: { typescript: '^5.9.0', '@types/node': '^26.0.0', '@types/react': '^19.2.0', '@types/react-dom': '^19.2.0' },
  }, null, 2));
  // sem public, sem dist: o build sai na raiz (o Next só cria o que o projeto usa)
  writeFileSync(path.join(staging, 'next.config.ts'), "import type { NextConfig } from 'next';\n\n// personalizações da casa: sem pasta public, sem pasta dist, build na raiz\nconst config: NextConfig = {};\n\nexport default config;\n");
  writeFileSync(path.join(staging, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'es2022', lib: ['dom', 'dom.iterable', 'esnext'], allowJs: true, skipLibCheck: true,
      strict: true, noEmit: true, esModuleInterop: true, module: 'esnext', moduleResolution: 'bundler',
      resolveJsonModule: true, isolatedModules: true, jsx: 'preserve', incremental: true,
      plugins: [{ name: 'next' }], paths: { '@/*': ['./src/*'] },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  }, null, 2));
  writeFileSync(path.join(staging, 'next-env.d.ts'), '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n');
  writeFileSync(path.join(staging, '.gitignore'), 'node_modules/\n.next/\nout/\n.dev.vars\n');
  mkdirSync(path.join(staging, 'src', 'app'), { recursive: true });
  writeFileSync(path.join(staging, 'src', 'app', 'layout.tsx'), `import type { ReactNode } from 'react';\n\nexport const metadata = { title: '${appdir}', description: '${appdir} — família DevThink' };\n\nexport default function RootLayout({ children }: { children: ReactNode }) {\n  return (\n    <html lang="pt-BR">\n      <body>{children}</body>\n    </html>\n  );\n}\n`);
  const bridge = theme === '.'
    ? `import dynamic from 'next/dynamic';\n\n// a âncora global do app (router) vive na raiz; o Next só monta\nconst App = dynamic(() => import('../App'), { ssr: false });\n\nexport default function Page() {\n  return <App />;\n}\n`
    : theme
      ? `import dynamic from 'next/dynamic';\n\n// a âncora global do app (router) vive na pasta do tema; o Next só monta\nconst App = dynamic(() => import('../../${theme}/App'), { ssr: false });\n\nexport default function Page() {\n  return <App />;\n}\n`
      : `export default function Page() {\n  return <main>aplicativo ${appdir}</main>;\n}\n`;
  writeFileSync(path.join(staging, 'src', 'app', 'page.tsx'), bridge);
  writeFileSync(path.join(staging, 'README.md'), `# ${appdir} — versão Next\n\nConversão automática do padrão da casa (sem src) para o formato que as plataformas de deploy exigem: a superfície web inteira entra em src/ (a pasta do tema ${theme === '.' ? 'na raiz' : theme} com as páginas e os componentes continua igual) e o scaffold Next (App Router) monta a âncora global do app, sem pasta public e sem pasta dist, com o build na raiz. O zip completo do site, no padrão da casa, viaja junto nos assets da release como ${appdir}.web.${version}.zip.\n`);
};

const out = DENTRO(path.join(ROOT, 'release'));
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
mkdirSync(DENTRO(path.join(ROOT, '.nextzips')), { recursive: true });

for (const app of [...CONVERT, ...ASIS]) {
  const appdir = DENTRO(path.join(ROOT, app));
  if (!existsSync(appdir)) { console.error('app ausente: ' + app); process.exit(1); }
  const raw = path.join(DENTRO(path.join(ROOT, '.nextzips')), `${app}.web`);
  rmSync(raw, { recursive: true, force: true });
  // o app que já nasce Next sai com o lockfile, pronto para baixar, push no DB e compilar
  copytree(appdir, raw, !CONVERT.includes(app));
  if (CONVERT.includes(app)) {
    zipit(raw, path.join(out, `${app}.web.${version}.zip`));
    const staging = path.join(DENTRO(path.join(ROOT, '.nextzips')), `${app}.next`);
    rmSync(staging, { recursive: true, force: true });
    copytree(appdir, path.join(staging, 'src'), false);
    scaffold(app, staging, themefolder(path.join(staging, 'src')));
    zipit(staging, path.join(out, `${app}.next.${version}.zip`));
    console.log(`${app}: ${app}.web.${version}.zip + ${app}.next.${version}.zip (tema: ${themefolder(path.join(staging, 'src')) || 'nenhum'})`);
  } else {
    zipit(raw, path.join(out, `${app}.next.${version}.zip`));
    console.log(`${app}: ${app}.next.${version}.zip (já nasce Next, zip único com lockfile)`);
  }
}
rmSync(DENTRO(path.join(ROOT, '.nextzips')), { recursive: true, force: true });
console.log('conversão completa: ' + readdirSync(out).join(', '));
