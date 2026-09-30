# DevThink Web

**DevThink Web** é o workbench browser-like da plataforma DevThink. É uma interface estática deliberadamente separada da persistência de providers: credenciais e endpoints pertencem ao `~/.config/devthink/devthink.json` e ao gateway local embutido, nunca ao bundle do navegador.

## Topologia

O workspace é a própria pasta `web/`; não existe `src/` nem `client/src/`.

```text
web/
├── App.tsx
├── capacitor.config.ts
├── control.shell.tsx
├── gateway.ts
├── index.html
├── index.css
├── schema.prisma
├── console/
├── gatewayview/
├── home/
├── os/
├── providers/
├── projects/
├── routes/
├── settings/
├── usage/
└── notfound/
```

## OS view (dissolved devthink/os)

The former Next.js DevThink OS (`devthink/os`, single route "/") is absorbed as the page folder `os/` and served at the `/os` route of this workbench. The folder owns its components (dotted names: `Os.tsx` anchor, `gateway.home`, `command.menu`, `app.header`, `aura.chat`, one `<app>.view` per family app) and its folder logics (`clean.url.ts`, `use.stored.state.ts`, `os.events.ts`, `os.types.ts`, `apps.ts`, `os.gateway.ts`, `reveal.ts`). The Next.js `page.tsx`/`layout.tsx` pair is not carried over: this is a Vite+wouter SPA, so the anchor is routed from `App.tsx`, the metadata lives in `index.html` and the engine stylesheet was merged into the "OS view" section of `index.css` with the `--sol-*` tokens remapped onto the `--dt-*` workbench tokens (the Sol design prevails).

Still-true rules of the os surface:

- Zero iframe: native React components only, one client-side shell, single view state `{ app, page }` persisted via `useStoredState` (localStorage + type-guard; storage is optional).
- Clean URLs (owner rule): internal navigation is React state + `history.replaceState(null, "", "/")`. The bar never shows `/settings`, `/projects`, `#hash`, `?utm_*`, `index.html` or `//` — cleaned live on `hashchange`/`popstate`. Live demo in Settings → "Clean URLs".
- Aura chat: the gateway answers `POST /v1/chat/completions` (`{model:"devthink", messages:[…]}`, OpenAI-compatible); `reasoning_content` feeds the collapsible Internal Cognition. One persona per app.
- Family domains: gateway/OS devthink.pro, argan argan.devthink.pro, debonair debonair.devthink.pro, cadria cadria.devthink.pro, stealthhead stealthhead.devthink.pro.

## Executar localmente

```bash
pnpm install
pnpm check
pnpm dev
```

Cada domínio de página contém sua âncora de rota, componentes visuais e lógica TypeScript local. `App.tsx` é a única entrada, responsável pela montagem React e pelo roteador universal. O workbench inclui tabs de navegador, seleção de provider, sessões, command palette, pareamento local, Settings e layouts responsivos. Mensagens ficam locais até que o navegador esteja pareado ao gateway DevThink.

## Fronteira do gateway

O cliente web usa o gateway loopback de `devthink serve` para `/health`, `/identity`, `/settings`, `/providers`, `/models`, `/sessions`, `/workspaces`, `/usage`, `/preferences`, `/pairings/consume`, `/pairings/revoke`, `/chat` e eventos SSE. Settings é equivalente a `devthink config settings`, `devthink config set` e `devthink identity --id`: ele lê e altera a mesma identidade pública e as mesmas preferências pertencentes ao banco local da CLI.

O banco `devthink.db` continua pertencendo à CLI e a um único ID público local. A interface pareada é apenas um cliente temporário dessa mesma base através do gateway autenticado; não há cópia estática do banco, senha de banco no navegador, chave de API, refresh token, cookie de navegador, dado de CAPTCHA ou segredo de provider no bundle.

## Design system

A direção visual está em [`../docs/ideas.md`](../docs/ideas.md), a implantação em [`../docs/deployment.ts.md`](../docs/deployment.ts.md) e a paridade entre CLI, Ink, gateway e web em [`../docs/v1.1.15.capability.matrix.md`](../docs/v1.1.15.capability.matrix.md). O workbench une a linguagem de tabs de um browser a superfícies de carvão, laranja de assinatura e azul de conexão. A marca é a composição ANSI canônica de [`../docs/logo.md`](../docs/logo.md), renderizada em forma compacta pela interface.
