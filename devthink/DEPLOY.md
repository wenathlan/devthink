# DEPLOY — devthink.pro family (Vercel / Netlify)

> Branch `sites-design` — trabalho paralelo de design. O engine de código
> (`devthink/*.ts`) permanece com o outro agente; nada da main foi tocado.

## 1. O que é isto

Cinco sites estáticos **zero-build** (HTML/CSS/JS puro) feitos com o
**DevThink Design Engine** (`/engine`: tema sol + liquid glass + timing master
+ escada de radius) e o **módulo clean-URL** (`engine/clean-url.js`) que mantém
a barra de endereço limpa: sem `#/rotas`, sem `index.html`, sem barras
duplicadas e sem trackers de campanha (`utm_*`, `gclid`, `fbclid`…).

| Domínio | Pasta (publish root) | App |
|---|---|---|
| **devthink.pro** | `devthink/site/` | Plataforma — abas: Projects, History, Docs, Explore, Settings |
| **argan.devthink.pro** | `argan/site/` | Biblioteca DNS/gateway (zones, dnssec, gateway) |
| **debonair.devthink.pro** | `debonair/site/` | DAW de áudio (studio, generate, library) |
| **cadria.devthink.pro** | `cadria/site/` | Vídeo/imagem/3D studio (player, studio, gallery) |
| **stealthhead.devthink.pro** | `stealthhead/site/` | Plataforma FPS (match, ranking, arsenal) |

Cada pasta tem `vercel.json` + `netlify.toml` prontos (cleanUrls, trailingSlash
false, headers de segurança, redirects 301/200).

## 2. Deploy na Vercel (5 projetos)

```bash
npm i -g vercel
cd devthink/site   && vercel --prod --name devthink        # depois: domínio devthink.pro
cd argan/site      && vercel --prod --name devthink-argan  # domínio argan.devthink.pro
cd debonair/site   && vercel --prod --name devthink-debonair
cd cadria/site     && vercel --prod --name devthink-cadria
cd stealthhead/site&& vercel --prod --name devthink-stealthhead
```

Domínios no dashboard de cada projeto → *Settings → Domains*:
- projeto `devthink`: `devthink.pro` + `www.devthink.pro`
- demais: o subdomínio correspondente

## 3. Deploy na Netlify (alternativa)

```bash
npm i -g netlify-cli
cd <app>/site && netlify deploy --prod --dir .
```
Custom domain por site: *Site configuration → Domain management*.

## 4. DNS (zona devthink.pro — via argan, o modelo pendurado)

| Registro | Tipo | Valor (Vercel) | Valor (Netlify) |
|---|---|---|---|
| `@` | A | `76.76.21.21` | `75.2.60.5` |
| `www` | CNAME | `cname.vercel-dns.com` | `<site>.netlify.app` |
| `argan` | CNAME | `cname.vercel-dns.com` | `<site>.netlify.app` |
| `debonair` | CNAME | `cname.vercel-dns.com` | `<site>.netlify.app` |
| `cadria` | CNAME | `cname.vercel-dns.com` | `<site>.netlify.app` |
| `stealthhead` | CNAME | `cname.vercel-dns.com` | `<site>.netlify.app` |

O apex já tem SPF/DKIM/DMARC na zona (corpus onda 6b) — não remover.

## 5. Clean URLs — como funciona

`engine/clean-url.js` (vendored em cada site em `/assets/js/`):
1. `#/rota` → `history.replaceState` para path real (`/#/settings` → `/settings`)
2. `index.html`, `//`, `?` vazio → removidos da barra
3. `utm_*`/`gclid`/`fbclid`/… → strip automático
4. Cliques internos → `pushState` com URL já limpa
5. `<link rel=canonical>` e `og:url` sincronizados

Server-side: `cleanUrls: true` (Vercel) serve `/settings` direto de
`settings/index.html`; Netlify usa os rewrites 200 do `netlify.toml`.
O `404.html` é automático nas duas plataformas.

## 6. Regras de design aplicadas (docs/regras.md)

- Tema sol curated: `#0B0806` / `#F59E0B` / `#FFFBEB` (SPEC 29)
- Liquid glass: blur 35px + saturate 140% + inset highlight (onda5)
- Escada de radius 10/14/20/28/pill e sombras 5 níveis (SPEC 17)
- Timing master 120–250ms easeOutQuart; `prefers-reduced-motion` respeitado
- Estados 5+8, foco visível 3px, touch targets ≥44px, ban list anti-vibe-code
- Light theme via `[data-theme="light"]` (2 tokens, SPEC 18)

## 7. Preview local (sandbox)

Portas 3001–3005 (devthink, argan, debonair, cadria, stealthhead) — o painel em
`my-project` embute os cinco via `?XTransformPort=`.
