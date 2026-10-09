# DESIGN CAMPAIGN V2 — the NeoSkills bar (anti-vibe-code, 100 points)

This wave applies the design doctrine from the owner's NeoSkills design skill
(autoclaw-design-capability DESIGN.md/OUTPUT_RULES.md) + the reference
aesthetics of the Neo IMGs (Modulify warm-gradient hero with halftone dot
edges; poster-grade type specimens) to EVERY application.

## The doctrine (hard rules from the design skill)

FORBIDDEN (AI-slop signals — a reviewer must not find any of these):
- purple-blue gradients, rainbow/holo gradients, neon glow on dark
- heavy shadows on everything; flat solid backgrounds with zero atmosphere
- Space Grotesk / Inter / Roboto as the identity display face
- all-caps titles with extreme letter-spacing (0.2em) on long strings
- uniform card grids (icon+title+text repeated); left-accent-border cards
- scroll fade-in on every block; hover bounce cubic-bezier(0.68,-0.55,0.265,1.55)
- parallax; scattered purposeless micro-interactions
- emoji as core visuals; fake data ("10,000+ users"); fake quotes

REQUIRED (the brutal difference):
- ONE orchestrated entrance per view (staggered reveal + animation-delay),
  then stillness; purposeful motion only
- ATMOSPHERE everywhere: a named light source (radial gradient), a halftone
  dot pattern at the edges, film grain overlay, layered transparency —
  never a naked flat color
- DISTINCTIVE type: display face = "Bricolage Grotesque" (Google Fonts,
  variable 400..800) + mono face = "JetBrains Mono" (400/600) — loaded via
  <link> with preconnect and system fallbacks (never FOUT-blocked)
- ASYMMETRIC composition: varied card sizes, density changes, one hero
  object per view, editorial spacing — break the box grid
- BRAND color with a source: each app rides its own accent (identity table
  in design-campaign.md) over the dark graphite base; dominant color +
  ONE sharp accent
- ANIMATED ICONS: every drawn mark carries one signature motion (transform/
  opacity/filter only, prefers-reduced-motion guarded)
- LOGO DISCIPLINE: ONE mark per visual zone. The window title bar carries
  the app mark + name + role line — exactly once. Page heroes, rails and
  panels must NOT repeat the mark inside the same zone.

## CSS atmosphere recipes (copy-adapt, do not invent new spellings)

```css
/* the named light source */
background:
  radial-gradient(1200px 700px at 72% -12%, <accent>14, transparent 62%),
  radial-gradient(900px 620px at 8% 108%, <accent-2>0f, transparent 58%),
  <base>;
/* the halftone edge (Modulify-style dot dissolve) */
.halftone::after {
  background-image: radial-gradient(<accent>26 1px, transparent 1.4px);
  background-size: 11px 11px;
  mask-image: radial-gradient(560px 380px at 100% 0%, #000 0%, transparent 72%);
}
/* the film grain (one data-uri, reused everywhere) */
.grain::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E");
}
```

## Font loading (every app index.html touched by this wave)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=JetBrains+Mono:wght@400;600&display=swap">
```
CSS: `--font-display: "Bricolage Grotesque", <previous sans stack>;`
`--font-mono: "JetBrains Mono", <previous mono stack>;` — heroes/titles ride
display; eyebrows/labels keep mono but WITHOUT all-caps + 0.2em tracking
(lowercase, 0.08em max).

## CI survival rules (the ladder must stay green)

1. NO duplicate tracked files above 512 bytes — every new file must be
   content-unique (the flat-structure gate md5s everything).
2. No file nests past four directories.
3. biome 2.5.15 clean on every touched TS/TSX; keep each app's tests green.
4. No edits outside your ownership; no git commits (orchestrator commits).
5. Never reformat gate sources or tests/*.mjs.
6. File naming: plain lowercase single-word names.
7. Append work record to /home/z/my-project/worklog.md (one heredoc block).

## Reference images on disk (view with the Read tool)

- /tmp/neoimg/a (107).png — Modulify: warm gradient hero, halftone edges
- /tmp/neoimg/w49.jpg — poster: giant display type, color specimen chips
- /tmp/neoimg/w5.jpg, /tmp/neoimg/framer (7).png — further samples

## Ownership map (wave C1)

- C1-01 devthink type+atmosphere: devthink/index.html + devthink/Sol/sol.css
- C1-02 devthink explore+intro cinematic: devthink/Sol/explore/** + Sol/intro/**
- C1-03 devthink pages A: Sol/{about,auth,calculator,console,docs}/**
- C1-04 devthink pages B: Sol/{chat,games,gatewayview,history,image,musicstudio}/**
- C1-05 devthink pages C: Sol/{projects,providers,routes,settings,terms,usage,policy,notfound}/**
- C1-06 icon motion: devthink/Sol/shell/{appicons,apptile}.tsx
- C1-07 mark dedup audit: devthink/Sol/panel/** + Sol/os/** (TSX only)
- C1-08..C1-16 one per family app (argan cadria debonair forge foundry getry saddle stealhead vault):
  whole app folder — index.html fonts, sol.css atmosphere (append-only),
  mark animation, logo dedup, page-body asymmetric redesign
- C1-17 sumo reference: fetch sumo.app into iakadion/allan docs/temp/competitors/sumo
  (the ONLY agent allowed to commit — to the allan repo, never devthink)
