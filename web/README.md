# DevThink Web

**DevThink Web** é o workbench browser-like da plataforma DevThink. É uma interface estática deliberadamente separada da persistência de providers: credenciais e endpoints pertencem ao `~/.config/devthink/devthink.json` e ao gateway local embutido, nunca ao bundle do navegador.

## Topologia

O workspace é a própria pasta `web/`; não existe `src/` nem `client/src/`.

```text
web/
├── App.tsx
├── control.shell.tsx
├── gateway.ts
├── index.html
├── index.css
├── home/
├── providers/
├── projects/
├── routes/
├── settings/
├── usage/
└── notfound/
```

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
