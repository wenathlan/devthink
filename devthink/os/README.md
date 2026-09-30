# os/ — DevThink OS (Next.js 16, rota única "/")

Implementação REAL do OS (porta do branch sites-design para Next.js App Router).
Zero iframe: componentes React nativos, tema sol do engine canônico, chat Aura
chamando o gateway `@devthink/ai` e a barra de URL SEMPRE limpa.

## O que tem aqui

| Caminho | Papel |
|---|---|
| `page.tsx` | rota única — renderiza `<DevThinkOS/>` (shell client-side inteiro) |
| `layout.tsx` | importa `globals.css` + `engine.css`; metadata devthink.pro |
| `components/engine/` | engine: `engine.css` (tema sol + liquid glass), `clean-url.ts` (barra limpa), `apps.ts` (catálogo 5 apps + personas), `gateway.ts`, `os-types.ts`, `os-events.ts`, `use-stored-state.ts`, `reveal.ts` |
| `components/shell/` | `devthink-os.tsx` (raiz), `gateway-home.tsx` (launcher), `command-menu.tsx` (⌘K) |
| `components/apps/` | `devthink-app` (abas Projects/History/Docs/Explore/Settings/Aura), `argan-app`, `debonair-app`, `cadria-app`, `stealthhead-app` |
| `components/shared/` | `aura-chat` (chat real + internal cognition), `app-header`, `glass-card`, `modal`, `page-section`, `status-dot`, `url-cleaner-demo` |

## Instalação num app Next 16

1. Copie `components/` para `src/components/` e `page.tsx` para `src/app/page.tsx`.
2. Importe `engine.css` no layout (depois do `globals.css`) — o body NÃO deve ter
   `bg-background`/`text-foreground` (a utilidade Tailwind mataria o tema sol).
3. Chat: o gateway responde em `POST /v1/chat/completions`
   (`{model:"devthink", messages:[…]}` → OpenAI-compatible; `reasoning_content`
   alimenta a Internal Cognition da Aura).

## Módulo clean-URL (regra do dono)

Navegação interna = estado React + `history.replaceState(null, "", "/")`.
A barra nunca mostra `/settings`, `/projects`, `#hash`, `?utm_*`, `index.html`
nem `//` — tudo é limpo na hora (`hashchange`/`popstate` vigiados). Demo viva
em Settings → "Clean URLs — módulo da barra limpa".

## Domínios (deploy Vercel/Netlify)

| App | Domínio |
|---|---|
| gateway/OS | devthink.pro |
| argan | argan.devthink.pro |
| debonair | debonair.devthink.pro |
| cadria | cadria.devthink.pro |
| stealthhead | stealthhead.devthink.pro |

Sites estáticos prontos para publicar em `*/site/` (ver DEPLOY.md na raiz) —
o OS Next.js é a camada viva por cima (vercel.json de cada app já cobre a
rota estática; pro OS usar o template Next da própria raiz do monorepo).
