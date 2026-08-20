# DevThink Web

**DevThink Web** é o workbench browser-like da plataforma DevThink. É uma interface estática deliberadamente separada da persistência de providers: credenciais e endpoints pertencem ao `~/.config/devthink/devthink.json` e ao gateway local embutido, nunca ao bundle do navegador.

## Topologia

O workspace é a própria pasta `web/`; não existe `src/` nem `client/src/`.

```text
web/
├── App.tsx
├── control.shell.tsx
├── gateway.ts
├── identity.ts
├── index.html
├── index.css
├── home/
├── providers/
├── projects/
├── routes/
├── usage/
└── notfound/
```

## Executar localmente

```bash
pnpm install
pnpm check
pnpm dev
```

Cada domínio de página contém sua âncora de rota, componentes visuais e lógica TypeScript local. `App.tsx` é a única entrada, responsável pela montagem React e pelo roteador universal. O workbench inclui tabs de navegador, seleção de provider, sessões, command palette, pareamento local e layouts responsivos. Mensagens ficam locais até que o navegador esteja pareado ao gateway DevThink.

## Fronteira do gateway

O cliente web usa o gateway loopback de `devthink serve` para `/health`, `/providers`, `/models`, `/sessions`, `/workspaces`, `/usage`, `/pairings/consume`, `/chat` e eventos SSE. A interface recebe somente eventos normalizados e estado redigido. Ela não recebe chaves de API, refresh tokens, cookies de navegador, senhas, dados de CAPTCHA ou segredos de provider.

## Design system

A direção visual está em [`../docs/ideas.md`](../docs/ideas.md) e a implantação está documentada em [`../docs/deployment.ts.md`](../docs/deployment.ts.md). O workbench une a linguagem de tabs de um browser a superfícies de carvão, laranja de assinatura e azul de conexão. A marca é a composição ANSI canônica de [`../docs/logo.md`](../docs/logo.md), renderizada em forma compacta pela interface.
