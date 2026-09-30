// scaffold.templates.ts — gera os clones deployáveis e o template Next
// personalizado no padrão da árvore oficial (uma pasta só por app, sem src):
//   vault              clone de só armazenamento: guarda os DBs da rede
//   forge              clone de só execução: roda binários com a engine Saddle
//   foundry            clone completo: roda, é sandbox e guarda
//   next.personalizado a variante Next que tenta a raiz seca (sem src)
// Uso: node devthink/tests/scripts/scaffold.templates.ts   (na raiz do monorepo)
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DENTRO = (alvo: string): string => {
  const r = path.resolve(alvo);
  if (r !== ROOT && !r.startsWith(ROOT + path.sep)) throw new Error('caminho fora da raiz do monorepo: ' + r);
  return r;
};
const w = (file: string, content: string) => {
  const alvo = DENTRO(file);
  mkdirSync(path.dirname(alvo), { recursive: true });
  writeFileSync(alvo, content.trimStart() + (content.endsWith('\n') ? '' : '\n'));
};

const quad = (dir: string, name: string, papel: string) => {
  w(path.join(dir, name + '.tsx'), `// ${name} — sub-âncora da página: importa os componentes dela e monta o desenho (${papel})\nimport { homebox } from './${name}.styles';\nimport type { ${name}props } from './${name}.types';\n\nexport function ${name}(props: ${name}props) {\n  return (\n    <main style={homebox}>\n      <h1>${name}</h1>\n      <p>{props.entrada}</p>\n    </main>\n  );\n}\n`);
  w(path.join(dir, name + '.styles.ts'), `// estilos da página ${name} — o único CSS do tema vive em ../index.css\nexport const homebox: Record<string, string> = {\n  display: 'grid',\n  gap: '16px',\n  padding: '44px',\n};\n`);
  w(path.join(dir, name + '.types.ts'), `// tipos da página ${name}\nexport interface ${name}props {\n  entrada: string;\n}\n`);
  w(path.join(dir, name + '.test.tsx'), `// teste da página ${name}\nimport { describe, expect, it } from 'vitest';\nimport { ${name} } from './${name}';\n\ndescribe('${name}', () => {\n  it('renderiza a entrada', () => {\n    expect(typeof ${name}).toBe('function');\n  });\n});\n`);
};

const casa = (nome: string, papel: string, logicas: string[]) => {
  const root = path.join(ROOT, nome);
  w(path.join(root, 'README.md'), `# ${nome}\n\n${papel}\n\nEstrutura no padrão da árvore oficial: uma pasta só por aplicativo, raiz sem src, lógicas .ts soltas na raiz e a pasta do tema (Web/) com o design inteiro — uma página por pasta, e cada página com o seu quadruple (.tsx, .styles.ts, .types.ts, .test.tsx). O zip completo e a conversão Next (feita pelo workflow, sem duplicar pasta) viajam nos assets do release.\n`);
  w(path.join(root, 'App.tsx'), `// âncora global — ROUTER: importa as sub-âncoras das páginas (fora do tema, ao lado da pasta do tema)\nimport { Home } from './Web/Home/Home';\n\nexport default function App() {\n  return <Home />;\n}\n`);
  w(path.join(root, 'Web', 'index.html'), `<!doctype html>\n<!-- entrada web do tema -->\n<html lang="pt-BR">\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <link rel="icon" href="./favicon.svg" />\n    <link rel="stylesheet" href="./index.css" />\n    <title>${nome}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="../App.tsx"></script>\n  </body>\n</html>\n`);
  w(path.join(root, 'Web', 'index.css'), `/* único CSS do tema — o nome é personalizável (index.css, web.css ou o nome do tema) */\n:root {\n  color-scheme: dark light;\n  font-family: system-ui, sans-serif;\n}\n\nbody {\n  margin: 0;\n}\n`);
  w(path.join(root, 'Web', 'devthink.toml'), `# identidade do aplicativo na plataforma\napp = "${nome}"\npapel = "${papel}"\ntema = "Web"\npaginas = ["Home"]\n`);
  w(path.join(root, 'Web', 'wrangler.toml'), `# config Cloudflare/Workers (deploy, bindings, rotas de domínio)\nname = "${nome}"\nmain = "index.html"\ncompatibility_date = "2026-09-01"\n\n[assets]\ndirectory = "."\n`);
  w(path.join(root, 'Web', '.dev.vars.example'), `# segredos locais do wrangler dev (nunca commitado; copie para .dev.vars)\nDEVTHINK_DB_URL=placeholder\nDEVTHINK_RUNNER_TOKEN=placeholder\n`);
  w(path.join(root, 'Web', '.gitignore'), `node_modules/\ndist/\n.dev.vars\n`);
  w(path.join(root, 'Web', 'vercel.json'), `{\n  "cleanUrls": true\n}\n`);
  w(path.join(root, 'Web', 'netlify.toml'), `[build]\n  publish = "."\n`);
  w(path.join(root, 'Web', 'manifest.json'), `{\n  "name": "${nome}",\n  "short_name": "${nome}",\n  "start_url": ".",\n  "display": "standalone"\n}\n`);
  w(path.join(root, 'Web', 'robots.txt'), `User-agent: *\nAllow: /\n`);
  w(path.join(root, 'Web', 'icon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#g)"/></svg>\n`);
  w(path.join(root, 'Web', 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#7c3aed"/></svg>\n`);
  quad(path.join(root, 'Web', 'Home'), 'Home', papel);
  const corpo: Record<string, string> = {
    'api.ts': `// api — lógica correlata da interface HTTP do site\nexport const rotas = {\n  saude: '/api/health',\n} as const;\n`,
    'db.ts': `// db — lógica correlata do armazenamento (Drizzle ORM + better-sqlite3; o schema vive no tema)\nexport const tabelas = ['chaves', 'payloads'] as const;\n`,
    'runner.ts': `// runner — lógica correlata da execução (a engine Saddle roda o binário e devolve o resultado)\nexport const modalidades = ['completa-virtual', 'runner', 'pacotes-node', 'docker', 'ghcr'] as const;\n`,
    'utils.ts': `// utils — lógica correlata de utilidades compartilhadas\nexport const quebra = (texto: string): string[] => texto.split(/\\s+/).filter(Boolean);\n`,
  };
  for (const logica of logicas) w(path.join(root, logica), corpo[logica] ?? `// ${logica}\nexport {};\n`);
  w(path.join(root, 'docs', '.gitkeep'), '');
  w(path.join(root, 'tests', '.gitkeep'), '');
  console.log('gerado: ' + nome);
};

casa('vault', 'clone deployável de só armazenamento (o DB da rede): guarda os DBs de cada site e recebe os backups dos dados', ['api.ts', 'db.ts', 'utils.ts']);
casa('forge', 'clone deployável de só execução (a sandbox): roda qualquer binário com a engine Saddle e não guarda nada', ['api.ts', 'runner.ts', 'utils.ts']);
casa('foundry', 'clone deployável completo (sandbox + DB): roda, é sandbox e guarda os DBs da rede', ['api.ts', 'db.ts', 'runner.ts', 'utils.ts']);

// next.personalizado: a variante Next que tenta a raiz seca (sem src); sem public/,
// sem dist/ — o build sai na raiz; se o host recusar a raiz personalizada, vale o
// Next padrão (src/), que é a conversão do workflow. O diretório app/ na raiz é o
// que o Next aceita fora de src (a pasta src é opcional na documentação oficial).
const np = path.join(ROOT, 'next.personalizado');
casa('next.personalizado', 'template Next personalizado: a árvore da casa em formato Next tentando a raiz sem src', ['api.ts', 'utils.ts']);
w(path.join(np, 'package.json'), JSON.stringify({
  name: '@wenathlan/next.personalizado', private: true, version: '2.0.41',
  scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
  dependencies: { next: '^16.0.0', react: '^19.2.0', 'react-dom': '^19.2.0' },
}, null, 2));
w(path.join(np, 'next.config.ts'), `import type { NextConfig } from 'next';\n\n// a árvore da casa fica na raiz, sem src, sem public e sem dist: o build sai na raiz.\n// o diretório app/ na raiz é o que o Next aceita fora de src; quando o host recusar a\n// raiz personalizada, vale o Next padrão com src (a conversão do workflow).\nconst config: NextConfig = {\n  distDir: 'build',\n};\n\nexport default config;\n`);
w(path.join(np, 'tsconfig.json'), JSON.stringify({
  compilerOptions: { target: 'es2022', lib: ['dom', 'esnext'], strict: true, noEmit: true, esModuleInterop: true, jsx: 'preserve', module: 'esnext', moduleResolution: 'bundler', incremental: true, plugins: [{ name: 'next' }] },
  include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', 'build/types/**/*.ts'],
  exclude: ['node_modules'],
}, null, 2));
w(path.join(np, 'app', 'layout.tsx'), `import type { ReactNode } from 'react';\n\nexport const metadata = { title: 'next.personalizado' };\n\nexport default function RootLayout({ children }: { children: ReactNode }) {\n  return (\n    <html lang="pt-BR">\n      <body>{children}</body>\n    </html>\n  );\n}\n`);
w(path.join(np, 'app', 'page.tsx'), `import dynamic from 'next/dynamic';\n\n// a âncora global do app vive na raiz (sem src); o Next personalizado monta ela direto da raiz\nconst App = dynamic(() => import('../App'), { ssr: false });\n\nexport default function Page() {\n  return <App />;\n}\n`);
console.log('gerado: next.personalizado');
