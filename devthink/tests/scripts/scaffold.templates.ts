// scaffold.templates.ts — generates the deployable clones (vault, forge, foundry)
// on the official house tree: one folder per app, no src/. The app root carries
// the loose .ts logics, the theme root files (App.tsx the global anchor,
// index.html, the platform deploy copies, the manifest and the drizzle schema)
// and the theme stylesheet lives inside the theme as Sol/sol.css, docs/ and
// tests/ exist beside it, and the Sol/ folder carries the component folders:
// one folder per page with loose TSX components beside the shared shell and
// toast folders. The anchor architecture rides the tree: App.tsx imports only
// the theme anchor (Sol/Sol.tsx, the file named after the theme folder) and
// the stylesheet, the theme anchor consumes the page anchors and every page
// folder fronts its loose components with its own anchor
// (Sol/<folder>/<folder>.tsx — the former main component lives in the anchor
// itself and the public components ride its star exports).
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
  w(path.join(root, 'README.md'), `# ${nome}\n\n${papel}.\n\nHouse tree: one folder per app, no src/ — the app root carries the loose .ts logics and the theme root files (App.tsx the router, index.html, the platform deploy copies, the manifest and the schema), the theme stylesheet lives inside the theme as Sol/sol.css, docs/ and tests/ exist beside it, and the Sol/ folder carries the component folders: one folder per page with loose TSX components beside the shared shell. The complete site archive and the Next conversions (done by the workflow, no folder duplication) travel as tar.xz assets in the release.\n`);
  w(path.join(root, 'App.tsx'), `/**\n * App — the global anchor (layer 1 of the anchor architecture) and the only\n * TSX outside the theme. The root manages the themes as single files: it\n * imports only the theme anchor (Sol/Sol.tsx — the file named after the theme\n * folder, beside Sol/sol.css) and the theme stylesheet and renders the theme.\n * Every page and component lives behind the anchor chain (App → Sol → the\n * page anchors → the loose components); nothing is imported directly.\n */\nimport Sol from './Sol/Sol';\nimport './Sol/sol.css';\n\nexport default function App() {\n  return <Sol />;\n}\n`);
  w(path.join(root, 'index.html'), `<!doctype html>\n<!-- web entry of the theme -->\n<html lang="pt-BR">\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <meta name="theme-color" content="#0f172a" />\n    <meta name="description" content="${papel}" />\n    <link rel="icon" href="./favicon.svg" />\n    <link rel="stylesheet" href="./Sol/sol.css" />\n    <link rel="manifest" href="./manifest.webmanifest" />\n    <title>${nome}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="./App.tsx"></script>\n  </body>\n</html>\n`);
  w(path.join(tema, 'sol.css'), `/* the only stylesheet of the theme — it lives inside the theme folder (Sol/sol.css) */\n:root {\n  color-scheme: dark light;\n  font-family: system-ui, sans-serif;\n}\n\nbody {\n  margin: 0;\n}\n`);
  w(path.join(root, 'vite.config.ts'), `// the vite build answers straight at the application root: the entry html and the hashed bundles live beside the engine logic, with no dist, no public and no assets folder\nimport react from '@vitejs/plugin-react';\nimport path from 'node:path';\nimport { defineConfig } from 'vite';\n\nexport default defineConfig({\n  base: '/',\n  plugins: [react()],\n  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'Sol') } },\n  root: import.meta.dirname,\n  build: { outDir: path.resolve(import.meta.dirname, '.'), emptyOutDir: false, assetsDir: '' },\n  server: { fs: { allow: [import.meta.dirname] }, host: true, allowedHosts: true },\n});\n`);
  w(path.join(root, 'tsconfig.json'), `{\n  "include": ["*.ts", "*.tsx", "Sol/**/*.ts", "Sol/**/*.tsx"],\n  "exclude": ["node_modules", "dist", "**/*.test.ts"],\n  "compilerOptions": {\n    "noEmit": true,\n    "module": "ESNext",\n    "strict": true,\n    "lib": ["esnext", "dom", "dom.iterable"],\n    "jsx": "react-jsx",\n    "esModuleInterop": true,\n    "skipLibCheck": true,\n    "allowImportingTsExtensions": true,\n    "moduleResolution": "bundler",\n    "types": ["vite/client", "node"],\n    "baseUrl": ".",\n    "paths": { "@/*": ["Sol/*", "./*"] }\n  }\n}\n`);
  w(path.join(root, 'package.json'), JSON.stringify({ name: `@wenathlan/${nome}`, private: true, type: 'module', version: '2.0.42', scripts: { dev: 'vite --host', build: 'vite build', start: 'vite preview --host', preview: 'vite preview --host', check: 'tsc --noEmit' }, dependencies: { 'lucide-react': '^1.49.0', react: '^19.3.0', 'react-dom': '^19.3.0', wouter: '^3.13.0' }, devDependencies: { '@types/react': '^19.3.0', '@types/react-dom': '^19.3.0', '@vitejs/plugin-react': '^6.1.1', typescript: '^7.0.2', vite: '^8.3.2' }, packageManager: 'pnpm@12.3.4' }, null, 2));
  w(path.join(root, 'pnpm-workspace.yaml'), `# the pnpm settings live here since pnpm 12 (the package.json pnpm field is no longer read): the build scripts the dependency tree may run, every other script stays ignored\nonlyBuiltDependencies:\n  - '@prisma/engines'\n  - '@tailwindcss/oxide'\n  - better-sqlite3\n  - cpu-features\n  - esbuild\n  - prisma\n  - protobufjs\n  - ssh2\n  - workerd\n`);
  w(path.join(root, 'devthink.toml'), `# application identity on the platform\napp = "${nome}"\nrole = "${papel}"\ntheme = "Sol"\npages = ["home", "notfound"]\n`);
  w(path.join(root, 'wrangler.toml'), `# Cloudflare/Workers config (deploy, bindings, domain routes)\nname = "${nome}"\nmain = "index.html"\ncompatibility_date = "2026-09-29"\n\n[assets]\ndirectory = "."\n`);
  w(path.join(root, '.dev.vars.example'), `# local wrangler dev secrets (never committed; copy to .dev.vars)\nDEVTHINK_DB_URL=placeholder\nDEVTHINK_RUNNER_TOKEN=placeholder\n`);
  w(path.join(root, '.gitignore'), `node_modules/\ndist/\n.dev.vars\n`);
  w(path.join(root, 'vercel.json'), `{\n  "cleanUrls": true,\n  "outputDirectory": "."\n}\n`);
  w(path.join(root, 'netlify.toml'), `# the build answers straight at the application root: no dist, no public\n[build]\n  publish = "."\n`);
  w(path.join(root, 'manifest.json'), `{\n  "name": "${nome}",\n  "short_name": "${nome}",\n  "description": "${papel}",\n  "start_url": "/",\n  "id": "/",\n  "display": "standalone",\n  "background_color": "#0f172a",\n  "theme_color": "#0f172a",\n  "scope": "/",\n  "lang": "pt-BR",\n  "icons": [\n    { "src": "/icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any" },\n    { "src": "/icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any maskable" }\n  ]\n}\n`);
  w(path.join(root, 'manifest.webmanifest'), `{\n  "name": "${nome}",\n  "short_name": "${nome}",\n  "description": "${papel}",\n  "start_url": "/",\n  "id": "/",\n  "display": "standalone",\n  "background_color": "#0f172a",\n  "theme_color": "#0f172a",\n  "scope": "/",\n  "lang": "pt-BR",\n  "icons": [\n    { "src": "/icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any" },\n    { "src": "/icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any maskable" }\n  ]\n}\n`);
  w(path.join(root, 'keywords.txt'), `${nome}, ${papel.toLowerCase()}, workbench, ai, llm, gateway, tema sol\n`);
  w(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<!-- the universal deployable template: the loc values stay relative so no domain is hardcoded here -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n<url>\n<loc>/</loc>\n<lastmod>2026-10-01</lastmod>\n<changefreq>weekly</changefreq>\n<priority>1.0</priority>\n</url>\n\n</urlset>\n`);
  w(path.join(root, 'robots.txt'), `# the universal deployable template: no domain lives here — the canonical domain binds at the platform only\nUser-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /node_modules/\nDisallow: /*.js.map$\nDisallow: /*.css.map$\n\nSitemap: /sitemap.xml\n`);
  w(path.join(root, 'icon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#g)"/></svg>\n`);
  w(path.join(root, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#7c3aed"/></svg>\n`);
  w(path.join(root, 'schema.prisma'), `// the schema of the application database (the db.ts logic reads it)\n`);
  w(path.join(root, 'drizzle.config.ts'), `// the drizzle kit config of the application database\nexport default {};\n`);
  w(path.join(tema, 'Sol.tsx'), `/**\n * Sol theme anchor — layer 2 of the anchor architecture.\n * The file carrying the theme folder's own name (Sol/Sol.tsx, beside\n * Sol/sol.css) is the path manager of the pages: it imports one anchor per\n * page folder (\`folder/folder.tsx\`, each beside the loose components its\n * folder keeps) and mounts the page surface of the theme. App.tsx consumes\n * only this file and the theme stylesheet; no page component is ever\n * imported outside this layer. When a theme folder changes its name (Moon,\n * Aqua), this file follows the new name and App.tsx keeps importing the\n * anchor by the folder path.\n */\nimport HomeAnchor from './home/home';\n\n/** Mounts the theme surface through the page anchors. */\nexport default function Sol() {\n  return <HomeAnchor />;\n}\n`);
  w(path.join(tema, 'shell', 'Shell.tsx'), `// shared shell component of the theme: frame, dock and toasts wrap every page\nimport type { ReactNode } from 'react';\n\nexport function Shell({ children }: { children: ReactNode }) {\n  return <div className="shell">{children}</div>;\n}\n`);
  w(path.join(tema, 'home', 'home.tsx'), `/**\n * home page anchor — layer 3 of the anchor architecture.\n * The file carrying the folder's own name is the path manager of the page:\n * it imports the loose components beside it, mounts the page and re-exports\n * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes\n * this file. This anchor carries the former main component of the folder,\n * which now lives here as the page mount itself.\n */\nimport { Entry } from './entry';\nimport { Tabs } from './tabs';\nimport type { HomeProps } from './types';\n\nexport * from './entry';\nexport * from './tabs';\n\nexport function Home(props: HomeProps) {\n  return (\n    <main className="page">\n      <h1>Home</h1>\n      <p>{props.input}</p>\n      <Entry />\n      <Tabs />\n    </main>\n  );\n}\n\nexport default Home;\n`);
  w(path.join(tema, 'home', 'entry.tsx'), `// entry component of the home page — loose TSX in the page folder\nexport function Entry() {\n  return <section className="entry">entry</section>;\n}\n`);
  w(path.join(tema, 'home', 'tabs.tsx'), `// tabs component of the home page — loose TSX in the page folder\nexport function Tabs() {\n  return <nav className="tabs">tabs</nav>;\n}\n`);
  w(path.join(tema, 'home', 'types.ts'), `// types of the home page\nexport interface HomeProps {\n  input: string;\n}\n`);
  w(path.join(tema, 'notfound', 'notfound.tsx'), `/**\n * notfound page anchor — layer 3 of the anchor architecture.\n * The file carrying the folder's own name is the path manager of the page:\n * it imports the loose components beside it, mounts the page and re-exports\n * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes\n * this file. This anchor carries the former main component of the folder,\n * which now lives here as the page mount itself.\n */\n\nexport function NotFound() {\n  return <main className="page"><h1>404</h1></main>;\n}\n\nexport default NotFound;\n`);
  const corpo: Record<string, string> = {
    'api.ts': `// api — correlated logic of the site HTTP surface\nexport const routes = {\n  health: '/api/health',\n} as const;\n`,
    'db.ts': `// db — correlated logic of storage (Drizzle ORM + better-sqlite3; the schema lives at the application root)\nexport const tables = ['keys', 'payloads'] as const;\n`,
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
