# Design Spec — Windows 11 × Trylle (binding tokens)

> Sources: `allan/docs/.devthink/web/index.html` (850 lines, the SaaS landing ruler),
> `digest-wave.md` A.2-A.4 (windows identity + trylle pass), `contexto1.md` (the
> millimetric windows contract), `ofical1.md` design foundation. Two faces: the OS
> face (windows grammar over trylle ladder) and the landing face (index.html grammar).
> This file is the replication contract — no source file needs to be opened.

## 1. OS face — Windows grammar (the chrome)

```text
taskbar        48px, acrylic rgb(32 32 32 / 75%) dark | rgb(243,243,243 / 85%) light
               backdrop-filter: saturate(3) blur(20px)  (+ -webkit- prefix, mandatory)
               hairline bottom rgb(0 0 0 / 55%); flat: zero gradient/pill/white border
pins           38×38, radius 4, margin 0 3px, no labels (name in tooltip only)
               hover bg rgb(255 255 255 / 10%) 0.2s ease; press scale(.7) 100ms ease-in-out
               entry dtPopIntro 800ms ease-in-out: scale(0)→1.125(40%)→0.725(70%)→1
indicator      ::after 3px r4 centered below: 0 closed → 6px #858585 open → 12px accent active
               transition 0.2s ease-in-out
tooltip        acrylic rgb(43,43,43,.88) + grain + flyout shadow, r4, 12px sans,
               fade+slide 0.2s, delay 300ms, keyboard-focus reachable, aria-hidden tip
start menu     640px centered above the bar (left:50%; margin-left:-320px; ≤700px adaptive)
               acrylic rgba(36,36,36,.8) + grain, r8, focused-window shadow + inner Fluent light
               entry dtStartIn 200ms slide-up 100px; exit cubic-bezier(.79,.14,.15,.86)
               search 40px (well white 5%, bottom hairline, 2px accent underline on focus)
               grid margins 32px, tiles 96×84; footer menubar 64px rgba(0,0,0,.15)
windows        motion 250ms cubic-bezier(.85,.14,.14,.85), scale .95→1 (never scale(0))
               minimize flies to its taskbar origin; inactive grayscale(80%) entire window
               titlebar 28-30px, caption ~36-45px, close hover rgb(232,17,35) /
               active rgb(139,10,20); maximized radius 0; 8 resize handles 8px outside;
               minimum 320×320; snap flyout 260×130 grid 3×2 + aero snap ghost
desktop        cells 74×84, label 12px with multi-layer text-shadow; marquee rubber-band
               selection, ctrl+click, win11 context menus, positions persisted,
               double-click opens (the windows law)
mica           --win-mica: #202020 radial-gradient(#1a1f35 25%, #202020 100%) fixed
               light: #f3f3f3 radial-gradient(#eff4f9 75%, #f3f3f3 100%)
grain          SVG feTurbulence fractalNoise baseFrequency .9, 2 octaves, stitchTiles,
               desaturated, tile 140×140, opacity .05 (dark) — zero image files
shadows        window: 0 32px 64px rgba(0,0,0,.24) + 0 0 8px rgba(0,0,0,.2)
               flyout: 0 4px 8px rgba(0,0,0,.14) + 0 0 2px rgba(0,0,0,.12)
               control: 0 1px 1px rgba(0,0,0,.25)
motion         entry cubic-bezier(.1,.9,.2,1) 250ms decelerate
               exit cubic-bezier(.7,0,1,.5) 100ms accelerate
               default cubic-bezier(.8,0,.2,1)
accent         #4cc2ff (dark) / #0067c0 (light); accent ink #000/#fff
               app identity color lives on the mark/tiles/active indicator/content CTAs only
scrollbar      hidden until surface hover, lane 10px, thumb 4px→6px under pointer
controls       inputs 40-44px: flat well + bottom hairline + 2px accent underline on focus
               toggle ON: accent track + contrast knob; buttons r4 wash hover (no lift);
               tabs 4px track with filled segment; toasts acrylic + grain + r8 + flyout shadow
guards         prefers-reduced-motion: popintro/press/transitions off, global .01ms !important
               prefers-reduced-transparency: solid floors #202020 bar / #2b2b2b tooltip /
               #2c2c2c panel and toast, blur zero
```

## 2. OS face — Trylle ladder (the surfaces under the chrome)

```text
canvas         #0a0a0b | deep #060607 | ink #fafafa
surfaces 1-8   #171717 #1e1e1e #252525 #2c2c2c #333333 #3a3a3a #414141 #484848
               light: #f4f4f5 #fafafa #fcfcfc #ffffff …
windows zinc   --sol-surface-1..8 = #242424 #2b2b2b #2c2c2c #323232 #373737 #3d3d3d
               #434343 #494949; bg #202020 / bg-2 #2b2b2b / canvas-deep #191919
               text #fff, muted #c3c3c3, faint #999999 (light #1a1a1a/#3c3c3c/#555)
hairlines      color-mix(in oklab, var(--sol-ink) 5%, transparent); strong 10%
               (light 8%/16%)
radius         --sol-radius .625rem (10px); sm/lg/xl calc(±2/4px); 2xl 16px; 3xl 24px
type           h1 clamp(2.25rem,5vw,3.75rem); h2 clamp(1.65rem,3vw,2rem);
               h3 clamp(1.3rem,2vw,1.5rem); display tracking -0.02em; label tracking .14em
motion         micro 150ms; ease-out cubic-bezier(0.22,1,0.36,1); focus ring #dfe5ee 2px
linear shadow  ring 0 0 0 1px + doubling layers 0 1px 1px -.5px → 0 96px 96px -48px;
               level 3+ adds inset 0 1px 0; windows floats stay flat
```

## 3. Landing face — index.html grammar (marketing surfaces)

```text
page           body #DCE2EE; main #F2F5FC rounded-[30px]/sm:[34px] border-white
               shadow-[0_25px_80px_-15px_rgba(15,23,42,0.25)]
rails          left rail fixed (6 circular w-10 buttons, active gradient indigo→sky
               scale-105); quick dock fixed right-4 bottom-8 (3 icon-frame-3d w-9);
               toast fixed bottom-8 centered rounded-full bg-slate-950 2200ms auto-dismiss
sections       open with window chrome: colored strip h-1.5/h-2 + SaddleTabBridge
               (SVG path M0 0 H76 V60 C36 60 40 0 0 0 Z, concave tab effect)
hero           H1 44→sm:7xl→lg:84px with inline switch (w-24 h-12 thumb radial, 300ms);
               gaussian shader radial blur 56px saturate 165% shaderPulse 9s;
               ScoopedCards float 6s/6.6s +1.2s delay
fan deck       5 slots dock-style: rotate ±5.5°/step, translateY 18px/step,
               center scale 1.08 / 1−0.05·|offset|, zIndex 30−5·|offset|,
               fanSwap 0.42s cubic-bezier(0.16,1,0.3,1), auto-rotate 4500ms
scooped clip   r=32 rf=20 ri=26; notch TR 68(wide 108)×60, BR 68×64 concave bites
tactile 3d     btn: gradient 180deg #243047→#090D16, 0 14px 28px -8px rgba(9,13,22,.55),
               inset 0 1.5px 2px rgba(255,255,255,.42) / inset 0 -3px 6px rgba(0,0,0,.65),
               hover translateY(-2px) scale(1.02) cubic-bezier(0.16,1,0.3,1) 0.25s
               icon-frame-3d: bg white .92, border slate .85, soft shadow + inset,
               hover translateY(-1.5px)
fonts          Urbanist 400/600/800; thin -0.005em lh1.45, medium -0.018em lh1.25,
               bold -0.035em lh1.02; base ls -0.015em
signature      cubic-bezier(0.16,1,0.3,1); UI 0.22-0.3s; images 0.5-0.7s scale-105
scroll         rails hide scrollbar; mask-fade-x 52px edges
a11y           focus-visible 2px rgba(99,102,241,.65) offset 2; tap-highlight transparent
app logos      SVG tile 120 rx28 white→#E2E8F2 gradient, orb radial r30 + glint r5;
               saddle emerald→sky; cadria violet→cyan; debonair rose→orange;
               getry violet→cyan + 4-point star; vault amber + losango; doo violet+orange
favicon        7 SVG frames rasterized 64px, swap each 700ms
```

## 4. Design foundation gates (every surface)

- OKLCH tokens, 3 tiers; 1 signal accent per page (90/10); 1 gradient per page;
  hue-gap >20°; AA 4.5:1; status = dot never fill.
- Radius ladder: chips pill → cards 12-16 → medium 20-32 → hero 36-64 → panels 96-320
  (inner ≤ outer).
- Motion ladder: micro ≤200ms; entries 400-800ms stagger 60-90ms; loops 8-30s;
  M3 base cubic-bezier(0.2,0,0,1); never linear in micro, never ease-in in entry;
  animate the function, transform/opacity only; never `transition: all`.
- Touch: lift −4px, press scale .94-.98, squish :active, wobble ±6°, riseIn 24→0px
  0.6s stagger .05/.18/.31/.44; floors modal .96 / menu .97 / tooltip .98.
- Scale floors never scale(0); 8 states per control (hover/focus/active/disabled/
  loading/error/empty/success); touch ≥44px, primary buttons 56px.
- Anti-vibe P0: no boxception, no hero centered + 3 identical cards, no glass+neon,
  no purple→blue crutch, no Inter/Roboto identity, no emoji icons, no animate-ping
  orbes, no background-clip:text headlines, no unlock/elevate/revolutionize copy.
- z-bands 0/10/20/50; z-index ladder dropdown 50 / sticky 100 / modal 200 / toast 300
  / tooltip 400.
- Light family signature: paper #F4F3ED ±3, near-black ink, lime #C8F542 (90/10).
- Brand canonical: violet for the mark, cyan for the AI (Doo); indigo and blue are
  banned as defaults (the landing gradient indigo→sky is the index.html exception).

## 5. Per-app identity accents (mark/tile/indicator only)

```text
devthink  #F59E0B amber (rust ladder #78350F→#B45309→#F59E0B)
argan     #34d8a8 jade        cadria    #e858c7 magenta     debonair #d9962e brass
stealthhead #e8563f coral     forge     #d6f74b lime        foundry  #1e6ff2 blue-signal
vault     #7dd8ff ice         getry     #8b5cf6 violet      saddle   #D4FF80 tan-green
cobaia    monetization surface (no OS chrome)
sol curated #0B0806 / #F59E0B / #FFFBEB
```

## 6. Icon law (Fluent)

- Package `@fluentui/react-icons`, always. lucide-react is removed from every
  package.json of the family.
- Map (108 verified): Search→SearchRegular, Trash2→DeleteRegular, X→DismissRegular,
  Play→PlayFilled (primary action), Stop→StopRegular, Settings→SettingsRegular,
  ChevronDown→ChevronDownRegular, ArrowRight→ArrowRightRegular, and so on.
- Props: `fontSize` for size; `strokeWidth` does not exist — delete it;
  `LucideIcon` type → `FluentIcon`.
- Animated grammar: dtPopIntro entry, press scale(.7), Fluent curves; one signature
  animation per app; icons carry gradient inside the stroke.
- HD icons: disk-shaped pertinent Fluent icons for the drives surface (HD = DB law).
