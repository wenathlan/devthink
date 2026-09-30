'use strict';
// next.convert.mjs — a conversão Next automática da família (nenhum app duplica
// pasta para ter versão Next): cada site segue o padrão da casa (sem src) e este
// gerador publica nos assets da release o zip completo do site + o zip Next
// (superfície web movida para src/, scaffold Next gerado em volta). Os zips
// existem só nos assets do release; o repositório carrega apenas a pasta
// original de cada aplicativo.
// Uso: node scripts/next.convert.mjs <versão>   (na raiz do monorepo)
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const version = process.argv[2] || process.env.VERSION || '';
if (!/^\d+\.\d+\.\d+/.test(version)) { console.error('uso: node scripts/next.convert.mjs <versão>'); process.exit(1); }

// sites no padrão da casa (sem src): recebem zip completo + zip Next convertido
const CONVERT = ['devthink', 'db.site', 'sandbox.site', 'dbsandbox.site', 'next.personalizado'];
// apps que já nascem Next (src/): o zip completo já é a versão Next
const ASIS = ['getry'];

const SKIP = new Set(['node_modules', '.git', 'dist', 'release', '.next', 'build', 'docs', 'tests', '.github', 'coverage']);
const SKIP_FILES = new Set(['bun.lock', 'bun.lockb', 'package-lock.json', 'pnpm-lock.yaml', 'dev.log', 'server.log']);

const copytree = (from, to) => cpSync(from, to, { recursive: true, filter: (src) => {
  const base = path.basename(src);
  if (SKIP.has(base) || SKIP_FILES.has(base)) return false;
  return true;
} });

const themefolder = (root) => {
  if (existsSync(path.join(root, 'App.tsx'))) return '.';
  return readdirSync(root).filter((n) => {
    const p = path.join(root, n);
    return statSync(p).isDirectory() && existsSync(path.join(p, 'App.tsx'));
  })[0] || '';
};

const zipit = (dir, outzip) => {
  const rel = path.relative(path.resolve(dir), path.resolve(outzip)).split(path.sep).join('/');
  try { execSync(`zip -qr "${rel}" .`, { cwd: dir, stdio: 'pipe' }); }
  catch { execSync(`tar -a -cf "${rel}" .`, { cwd: dir, stdio: 'pipe' }); }
  if (!existsSync(outzip)) throw new Error('o zip não foi gerado: ' + outzip);
};

const scaffold = (appdir, staging, theme) => {
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

const out = path.join(process.cwd(), 'release');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
mkdirSync('.nextzips', { recursive: true });

for (const app of [...CONVERT, ...ASIS]) {
  if (!existsSync(app)) { console.error('app ausente: ' + app); process.exit(1); }
  const raw = path.join('.nextzips', `${app}.web`);
  rmSync(raw, { recursive: true, force: true });
  copytree(app, raw);
  if (CONVERT.includes(app)) {
    zipit(raw, path.join(out, `${app}.web.${version}.zip`));
    const staging = path.join('.nextzips', `${app}.next`);
    rmSync(staging, { recursive: true, force: true });
    copytree(app, path.join(staging, 'src'));
    scaffold(app, staging, themefolder(path.join(staging, 'src')));
    zipit(staging, path.join(out, `${app}.next.${version}.zip`));
    console.log(`${app}: ${app}.web.${version}.zip + ${app}.next.${version}.zip (tema: ${themefolder(path.join(staging, 'src')) || 'nenhum'})`);
  } else {
    zipit(raw, path.join(out, `${app}.next.${version}.zip`));
    console.log(`${app}: ${app}.next.${version}.zip (já nasce Next, zip único)`);
  }
}
rmSync('.nextzips', { recursive: true, force: true });
console.log('conversão completa: ' + readdirSync(out).join(', '));
