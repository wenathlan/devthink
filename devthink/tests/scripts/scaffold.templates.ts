// scaffold.templates.ts — generates the deployable clones (vault, forge, foundry)
// on the official house tree: one folder per app, no src/. The app root carries
// only the loose .ts logics, docs/ and tests/, and the theme folder (Sol/) carries
// the whole design: App.tsx (the router), index.html, index.css, the shared shell,
// one folder per page with loose TSX components, and the platform deploy copies.
// There is no per-page .styles.ts/.types.ts/.test.tsx quadruple and no
// next.personalizado folder — the Next variants exist only as release assets,
// built by next.convert.ts.
// Usage: node devthink/tests/scripts/scaffold.templates.ts   (at the monorepo root)
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DENTRO = (alvo: string): string => {
  const r = path.resolve(alvo);
  if (r !== ROOT && !r.startsWith(ROOT + path.sep)) throw new Error('path outside the monorepo root: ' + r);
  return r;
};
const w = (file: string, content: string) => {
  const alvo = DENTRO(file);
  mkdirSync(path.dirname(alvo), { recursive: true });
  writeFileSync(alvo, content.trimStart() + (content.endsWith('\n') ? '' : '\n'));
};

const casa = (nome: string, papel: string, logicas: string[]) => {
  const root = DENTRO(path.join(ROOT, nome));
  // the folder is fully regenerated: stale files from an older shape never survive
  rmSync(root, { recursive: true, force: true });
  const tema = path.join(root, 'Sol');
  w(path.join(root, 'README.md'), `# ${nome}\n\n${papel}.\n\nHouse tree: one folder per app, no src/ — the app root carries only the loose .ts logics, docs/ and tests/, and the theme folder (Sol/) carries the whole design: App.tsx (the router), index.html, index.css, the shared shell, one folder per page with loose TSX components, and the platform deploy copies. The complete site archive and the Next conversions (done by the workflow, no folder duplication) travel as tar.xz assets in the release.\n`);
  w(path.join(tema, 'App.tsx'), `// global anchor — ROUTER: imports the sub-anchors of every page and mounts the state router (inside the first theme)\nimport { Home } from './home/Home';\n\nexport default function App() {\n  return <Home />;\n}\n`);
  w(path.join(tema, 'index.html'), `<!doctype html>\n<!-- web entry of the theme -->\n<html lang="pt-BR">\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <link rel="icon" href="./favicon.svg" />\n    <link rel="stylesheet" href="./index.css" />\n    <title>${nome}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="./App.tsx"></script>\n  </body>\n</html>\n`);
  w(path.join(tema, 'index.css'), `/* the only CSS of the theme — the name is personalizable (index.css, sol.css or the theme name) */\n:root {\n  color-scheme: dark light;\n  font-family: system-ui, sans-serif;\n}\n\nbody {\n  margin: 0;\n}\n`);
  w(path.join(tema, 'Shell.tsx'), `// shared shell component loose at the theme root: frame, dock and toasts wrap every page\nimport type { ReactNode } from 'react';\n\nexport function Shell({ children }: { children: ReactNode }) {\n  return <div className="shell">{children}</div>;\n}\n`);
  w(path.join(tema, 'package.json'), JSON.stringify({ name: `@wenathlan/${nome}.sol`, private: true, version: '2.0.42' }, null, 2));
  w(path.join(tema, 'devthink.toml'), `# application identity on the platform\napp = "${nome}"\nrole = "${papel}"\ntheme = "Sol"\npages = ["home", "notfound"]\n`);
  w(path.join(tema, 'wrangler.toml'), `# Cloudflare/Workers config (deploy, bindings, domain routes)\nname = "${nome}"\nmain = "index.html"\ncompatibility_date = "2026-09-01"\n\n[assets]\ndirectory = "."\n`);
  w(path.join(tema, '.dev.vars.example'), `# local wrangler dev secrets (never committed; copy to .dev.vars)\nDEVTHINK_DB_URL=placeholder\nDEVTHINK_RUNNER_TOKEN=placeholder\n`);
  w(path.join(tema, '.gitignore'), `node_modules/\ndist/\n.dev.vars\n`);
  w(path.join(tema, 'vercel.json'), `{\n  "cleanUrls": true\n}\n`);
  w(path.join(tema, 'netlify.toml'), `[build]\n  publish = "."\n`);
  w(path.join(tema, 'manifest.json'), `{\n  "name": "${nome}",\n  "short_name": "${nome}",\n  "start_url": ".",\n  "display": "standalone"\n}\n`);
  w(path.join(tema, 'robots.txt'), `User-agent: *\nAllow: /\n`);
  w(path.join(tema, 'icon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#g)"/></svg>\n`);
  w(path.join(tema, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#7c3aed"/></svg>\n`);
  w(path.join(tema, 'home', 'Home.tsx'), `// Home — page sub-anchor: same name as the folder, imports the sibling components\nimport { Entry } from './entry';\nimport { Tabs } from './tabs';\nimport type { HomeProps } from './types';\n\nexport function Home(props: HomeProps) {\n  return (\n    <main className="page">\n      <h1>Home</h1>\n      <p>{props.input}</p>\n      <Entry />\n      <Tabs />\n    </main>\n  );\n}\n`);
  w(path.join(tema, 'home', 'entry.tsx'), `// entry component of the home page — loose TSX in the page folder\nexport function Entry() {\n  return <section className="entry">entry</section>;\n}\n`);
  w(path.join(tema, 'home', 'tabs.tsx'), `// tabs component of the home page — loose TSX in the page folder\nexport function Tabs() {\n  return <nav className="tabs">tabs</nav>;\n}\n`);
  w(path.join(tema, 'home', 'types.ts'), `// types of the home page\nexport interface HomeProps {\n  input: string;\n}\n`);
  w(path.join(tema, 'notfound', 'NotFound.tsx'), `// NotFound — the 404 page sub-anchor\nexport function NotFound() {\n  return <main className="page"><h1>404</h1></main>;\n}\n`);
  const corpo: Record<string, string> = {
    'api.ts': `// api — correlated logic of the site HTTP surface\nexport const routes = {\n  health: '/api/health',\n} as const;\n`,
    'db.ts': `// db — correlated logic of storage (Drizzle ORM + better-sqlite3; the schema lives in the theme)\nexport const tables = ['keys', 'payloads'] as const;\n`,
    'runner.ts': `// runner — correlated logic of execution (the Saddle engine runs the binary and returns the result)\nexport const modes = ['full-virtual', 'runner', 'node-packages', 'docker', 'ghcr'] as const;\n`,
    'utils.ts': `// utils — correlated logic of shared helpers\nexport const splitwords = (text: string): string[] => text.split(/\\s+/).filter(Boolean);\n`,
  };
  for (const logica of logicas) w(path.join(root, logica), corpo[logica] ?? `// ${logica}\nexport {};\n`);
  w(path.join(root, 'docs', '.gitkeep'), '');
  w(path.join(root, 'tests', '.gitkeep'), '');
  console.log('generated: ' + nome);
};

casa('vault', 'deployable clone of storage only (the network DB): keeps every site database and receives the data backups', ['api.ts', 'db.ts', 'utils.ts']);
casa('forge', 'deployable clone of execution only (the sandbox): runs any binary with the Saddle engine and stores nothing', ['api.ts', 'runner.ts', 'utils.ts']);
casa('foundry', 'complete deployable clone (sandbox + DB): runs, is the sandbox and keeps the network databases', ['api.ts', 'db.ts', 'runner.ts', 'utils.ts']);
