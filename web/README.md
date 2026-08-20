# DevThink Web

**DevThink Web** é o workbench browser-like da plataforma DevThink. É uma interface estática deliberadamente separada da persistência de providers: credenciais e endpoints pertencem ao `~/.config/devthink/devthink.json` e ao gateway local embutido, nunca ao bundle do navegador.

## Topologia

O workspace é a própria pasta `web/`; não existe `src/` nem `client/src/`.

```text
web/
├── App.tsx
├── main.tsx
├── index.html
├── index.css
├── app/
├── home/
├── providers/
├── projects/
├── routes/
├── usage/
├── settings/
├── notfound/
├── primitives/
├── hooks/
├── lib/
└── public/
```

## Executar localmente

```bash
pnpm install
pnpm check
pnpm dev
```

Cada domínio de página contém sua âncora de rota, componentes visuais e lógica TypeScript local. `App.tsx` é o roteador universal; `primitives/` concentra apenas blocos de interface reutilizáveis. O workbench inclui tabs de navegador, seleção de provider, canvas orientado a eventos, command palette, inspector de endpoint e layouts responsivos. Mensagens encenadas ficam locais até que um cliente SSE seja conectado ao gateway DevThink.

## Fronteira do gateway

O cliente web usa o gateway loopback de `devthink serve` para `/health`, `/providers`, `/models`, `/sessions`, `/workspaces`, `/usage`, `/pairings/consume`, `/chat` e eventos SSE. A interface recebe somente eventos normalizados e estado redigido. Ela não recebe chaves de API, refresh tokens, cookies de navegador, senhas, dados de CAPTCHA ou segredos de provider.

## Design system

A direção visual está em [`ideas.md`](./ideas.md). O workbench une a linguagem de tabs de um browser a materiais de grafite, cobre e verde-mar. A marca é a composição ANSI canônica de [`../docs/logo.md`](../docs/logo.md), renderizada em forma compacta pela interface.
