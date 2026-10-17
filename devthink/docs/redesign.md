# Redesign checklist

The from zero rebuild of the devthink theme. The contract lives here; every
wave lands as one commit and the verify gates stay green between waves.

## The folder contract

- one folder = one app = one page; the anchor file carries the folder name
  (chat/chat.tsx, video/video.tsx) and Sol.tsx pulls the anchor
- components live beside the anchor, separated, at least twenty when the app
  carries real content; logic lives at the root as grouped ts modules
- labels: short, objective, no hyphens, no dots, icons over text

## Direct apps (they present themselves in the panel)

chat, settings, video, image, calculator, games, console, docs, usage,
history, projects, providers, routes, gateway, about, terms, policy

## Indirect apps (own folder, never a panel icon)

intro, onboarding, auth, explore, panel (the desktop), shell (the chrome)

## Dead and gone

launcher, admin, ControlShell, automationnote, the retired intro variants

## Waves

- [x] A security: the safe gateway guard + the sol sweep (3b1ac634)
- [x] B intro: the saas face + the owned boot (4dc4b881)
- [ ] C foundations: the double click, the tooltip 1000ms, the start 40px,
      the dskMenuIn dedup, appregistry to the root, the dead code out,
      launcher and admin out
- [ ] D chat: the subapp rebuild; the deep chat route belongs to it
- [ ] E settings, calculator, about
- [ ] F video (the studio), image, games on real catalog data
- [ ] G explore: the netflix feed by category, no os chrome
- [ ] H the os views, the gatewayview anchor, the sol routes remap
- [ ] I auth and onboarding polish, the full verify, the changelog

## The bar

- real data only: the catalog, the preferences, the sessions; no fake
  projects, no demo rows where a real source exists
- the windows canon: the reform tokens, the clone punch list from temp, the
  index.html face for the saas landing
- every wave: tsc clean, biome clean, the touched suites green, sweep green
