# DEPLOY — devthink.pro family (Vercel / Netlify)

> Branch `sites-design` — parallel design work. The code engine
> (`devthink/*.ts`) stays with the other agent; nothing on main was touched.

## 1. What this is

Five **zero-build** static sites (pure HTML/CSS/JS) made with the
**DevThink Design Engine** (`/engine`: sol theme + liquid glass + timing master
+ radius ladder) and the **clean-URL module** (`engine/clean-url.js`) that keeps
the address bar clean: no `#/routes`, no `index.html`, no duplicated
slashes and no campaign trackers (`utm_*`, `gclid`, `fbclid`…).

| Domain | Folder (publish root) | App |
|---|---|---|
| **devthink.pro** | `devthink/site/` | Platform — tabs: Projects, History, Docs, Explore, Settings |
| **argan.devthink.pro** | `argan/site/` | DNS/gateway library (zones, dnssec, gateway) |
| **debonair.devthink.pro** | `debonair/site/` | Audio DAW (studio, generate, library) |
| **cadria.devthink.pro** | `cadria/site/` | Video/image/3D studio (player, studio, gallery) |
| **stealthhead.devthink.pro** | `stealthhead/site/` | FPS platform (match, ranking, arsenal) |

Each folder carries a ready `vercel.json` + `netlify.toml` (cleanUrls,
trailingSlash false, security headers, 301/200 redirects).

## 2. Deploy on Vercel (5 projects)

```bash
npm i -g vercel
cd devthink/site   && vercel --prod --name devthink        # afterwards: devthink.pro domain
cd argan/site      && vercel --prod --name devthink-argan  # argan.devthink.pro domain
cd debonair/site   && vercel --prod --name devthink-debonair
cd cadria/site     && vercel --prod --name devthink-cadria
cd stealthhead/site&& vercel --prod --name devthink-stealthhead
```

Domains in the dashboard of each project → *Settings → Domains*:
- project `devthink`: `devthink.pro` + `www.devthink.pro`
- the rest: the corresponding subdomain

## 3. Deploy on Netlify (alternative)

```bash
npm i -g netlify-cli
cd <app>/site && netlify deploy --prod --dir .
```

Custom domain per site: *Site configuration → Domain management*.

## 4. DNS (devthink.pro zone — via argan, the hanging model)

| Record | Type | Value (Vercel) | Value (Netlify) |
|---|---|---|---|
| `@` | A | `76.76.21.21` | `75.2.60.5` |
| `www` | CNAME | `cname.vercel-dns.com` | `<site>.netlify.app` |
| `argan` | CNAME | `cname.vercel-dns.com` | `<site>.netlify.app` |
| `debonair` | CNAME | `cname.vercel-dns.com` | `<site>.netlify.app` |
| `cadria` | CNAME | `cname.vercel-dns.com` | `<site>.netlify.app` |
| `stealthhead` | CNAME | `cname.vercel-dns.com` | `<site>.netlify.app` |

The apex already carries SPF/DKIM/DMARC in the zone (corpus wave 6b) — do not remove.

## 5. Clean URLs — how it works

`engine/clean-url.js` (vendored in each site at `/assets/js/`):
1. `#/route` → `history.replaceState` to the real path (`/#/settings` → `/settings`)
2. `index.html`, `//`, empty `?` → removed from the bar
3. `utm_*`/`gclid`/`fbclid`/… → automatic strip
4. Internal clicks → `pushState` with the URL already clean
5. `<link rel=canonical>` and `og:url` synchronized

Server-side: `cleanUrls: true` (Vercel) serves `/settings` straight from
`settings/index.html`; Netlify uses the 200 rewrites of the `netlify.toml`.
The `404.html` is automatic on both platforms.

## 6. Design rules applied (docs/regras.md)

- Curated sol theme: `#0B0806` / `#F59E0B` / `#FFFBEB` (SPEC 29)
- Liquid glass: blur 35px + saturate 140% + inset highlight (wave 5)
- Radius ladder 10/14/20/28/pill and 5-level shadows (SPEC 17)
- Timing master 120–250ms easeOutQuart; `prefers-reduced-motion` respected
- 5+8 states, 3px visible focus, touch targets ≥44px, anti-vibe-code ban list
- Light theme via `[data-theme="light"]` (2 tokens, SPEC 18)

## 7. Local preview (sandbox)

Ports 3001–3005 (devthink, argan, debonair, cadria, stealthhead) — the panel in
`my-project` embeds the five via `?XTransformPort=`.

## 8. Universal interface and the family pages (wave 2.0.47)

The theme folder is `Sol/` in every app — the old `site/` no longer exists
and its content was absorbed without loss. The theme is the single web, os,
TV, phone, desktop, binary and extension interface: only the ratio varies
(horizontal on tablet/notebook/pc, vertical on the phone), DPI and
responsiveness; the per-target conversion is the work of the workflows (Next in
its four shapes, Tauri, Capacitor, Ionic, Ink for the terminal), never a second
interface.

The GitHub Pages of the repository is one single site that serves every theme
under `/<app>/` (`pages.yml` workflow, matrix of the ten applications; getry
enters through the `PAGES_EXPORT=1` gate of the next.config). Every family
release cuts a `<app>-v<version>` tag with the `tar.xz -9e` source and the four
Next shapes (`tar.xz` + Brotli 11) in the release itself (`familyrelease.yml`);
devthink keeps the `v<version>` line. Zip only where the platform demands it
(vsix, xpi, extension, safari, maven declarations).

Zero touch on the person's machine: the interface writes nothing in the
browser (no IndexedDB/localForage/localStorage on the sites), uses no GPU, CPU,
camera or geolocation and compiles nothing locally — the site is a sandbox as
soon as the person enters with an id and the heavy work runs on our domains
over HTTPS (stealthhead ships pre-compiled). Data lives in the self-hosted DB
of each site (the virtual db: mirrors the repository per theme, git LFS as the
object store, git objects/blobs, Drizzle, Prisma, better-sqlite3/libsql, mysql2,
no Supabase) and reaches the interface over HTTPS — no data hardcoded in the
component; engines are importable libraries (npm/maven with a Spring Boot
module).
