# DevThink Doctrine — the binding rules of the house

> Consolidated from the owner corpus: `session7-so-user.txt` (6,057 lines), the seven
> `oficial-rascunho-parte-01..07.md` (8.94M lines, structural analysis), `digest-wave.md`
> (216 lines, the wave dossier), `contexto1.md` and `ofical1.md`. English body, one rule
> per line, binding order: SKILL.md > tree > rules > voice > logs; the more specific
> rule wins; ties break to the newest CHANGELOG entry; when the tree diverges from this
> document the tree wins and the document bumps.

## 1. Where the work lives

- The monorepo `wenathlan/devthink` cloned at the workspace root is the only work tree.
  The Next.js scaffold that once lived there is deleted; nothing is developed outside
  the repository.
- The allan corpus is cloned beside it as reference material (`allan/`, git-excluded),
  never inside the devthink tree. Competitor clones for study land in `allan/docs/temp/`.
- Reading order is fixed: wormhole drops first, then the allan corpus, then the devthink
  tree. Devthink is never read before allan.
- Every document produced by the operation lands in `devthink/docs/` and is committed.
  No loose files.

## 2. Structure law (tree)

- One app per folder; `sol/` is the theme, `docs/` and `tests/` are the only siblings.
- Page = folder = app = anchor: the anchor carries the folder name, lowercase; zero
  nested page folders; `Sol.tsx` imports every anchor; `app.tsx` routes.
- Pure logic lives at the app root as flat `.ts` files (window.ts, chatstate.ts,
  gatewayclient.ts); up to ~300 related logics per file, one responsibility per file,
  lowercase dot-separated names (`stream.parse.ts`, `retry.backoff.ts`).
- Banned folders inside apps: `ui, assets, public, dist, build, deploy, src, prisma`.
  Builds stay at the root; prisma schema stays declarative; no `.sql` in the repo.
- Nothing hardcoded except Doo and the DevThink name. Labels, spawns, app rows,
  provider tables and window texts come from the database or a root catalog consumed
  by the theme binding — never from the component.

## 3. Design law (Windows 11 × trylle)

- The reference index is `allan/docs/.devthink/web/index.html` (the SaaS landing) for
  the marketing face, and the Windows identity pass inside `sol.css` for the OS face.
  Trylle.com is the ruler over both.
- Fluent Icons (`@fluentui/react-icons`) always; lucide-react is banned. `fontSize`
  carries the size (strokeWidth does not exist); Filled variant rides primary actions.
  23 animated icons with one signature per app; icons animate via dtPopIntro/press.
- Windows grammar is millimetric: taskbar 48px acrylic, pins 38×38 r4 without names,
  press scale(.7) 100ms, window motion 250ms cubic-bezier(.85,.14,.14,.85), close red
  rgb(232,17,35), inactive window grayscale(80%), maximized radius 0, snap flyout,
  start 640px r8, tooltip delay 300ms, desktop cells 74×84, double-click opens.
- Trylle layer on top: canvas #0a0a0b, eight surface steps, hairlines color-mix,
  radius .625rem, micro 150ms cubic-bezier(.22,1,.36,1), focus ring #dfe5ee.
- Gates (inviolable): zero `transition:all`; zero pure #000/#FFF fills; zero 999px
  pills, glow, dots; motion only on transform/opacity; 8 states per control; targets
  ≥44px; `prefers-reduced-motion` hard-stop; `prefers-reduced-transparency` solid
  floors; biome+tsc zero.
- Reproved on sight: amateur blue/orange, dots, pill everything, italic, fake data,
  dead CSS layers winning the cascade (delete, never overlay).
- Family identity: one accent per app on the mark/tiles/active indicator only;
  chrome accents stay Windows. Signatures: argan jade #34d8a8, cadria #e858c7,
  debonair brass #d9962e, getry violet #8b5cf6, stealthhead #e8563f, forge #d6f74b,
  foundry #1e6ff2, vault #7dd8ff, devthink amber #F59E0B, saddle #D4FF80.

## 4. Interaction law

- Mouse, keyboard and touch behave exactly like Windows: hover states, focus rings,
  keyboard navigation, drag, snap, alt-tab, context menus, marquee selection.
- Every component carries two logics: the animation and the micro-interaction that
  makes it work. Proof of render before anything is declared done.
- Apps of the family open INSIDE DevThink windows (embedded contract: no own chrome,
  no taskbar, no first-run replay inside the frame); deep links keep their full page.
- The chat follows the Atomic Chat grammar (the owner's rule): bubbles
  rounded-2xl with corner cuts, thinking drawer, tactile send. T3 and Pi are the
  competitors to match.
- Web enters the desktop directly — no lock screen in the web chain; the lock screen
  (landscape + clock + slide up) rides the binary/ISO intro only.

## 5. Architecture law

- DevThink is the only OS. The family apps are apps: intro → onboarding (once, state
  in the DB) → window inside the OS, with a pin in the shell.
- Storage and compute never touch the visitor machine: no GPU, no CPU, no camera,
  no localStorage on public surfaces, no captcha. The only client job is rendering
  the interface. Everything else rides HTTPS domains with mimetypes.
- Each HD is a DB: the drives surface mounts a new empty bank and reopens old ones by
  meta identity; unlimited count, per-account password via accountgate.
- Stack is single: workflows are YML; storage is git objects + libgit2 + Prisma
  schema + Drizzle + MySQL2 + better-sqlite3 (+ libsql/Turso selectable); migrations
  run idempotent at runtime.
- English everywhere (code, copy, commits); runtime translation via Google GTX
  (`client=gtx`, `sl=auto`, batches with markers, WeakMap original preservation,
  observer armed only when a saved choice exists, default `en`).

## 6. Chat law (the gateway contract)

- The chat speaks to the gateway (getry) and to nothing else. No Node side-service
  ever ships in the repo — the mini-services pattern for chat was destroyed once and
  stays destroyed.
- Gateway versions: v1 z.ai (live, keyless, SDK inside the gateway), v2 babel paused
  (503 → fallback), v3 nvidia (22 keys rotating), v4 opencode/kilo free, v5 unified.
  The client contract is OpenAI-compatible: `POST {base}/v1/chat/completions`,
  `GET {base}/v1/models`; the model answers masked as "devthink".
- Streaming follows the gateway parsersteps: SSE frames on double newline, heartbeats
  discarded, reasoning deltas before content, one [DONE], keepalive only when idle.
- Session context rides headers: `x-session-id`, `x-thinking-level` (none/minimal/
  low/medium/high/xhigh/max, default high). The thinking pill maps to the header.
- Editing a message opens a cascading checkpoint workflow: a variant flow inherits
  the last context without interrupting the running one; when flows finish they hand
  checkpoints forward; the final state carries every checkpoint plus the newest edit
  (the newest edit prevails at merge). Implemented as pure client logic
  (cloneSessionForEdit), never as a service.
- A conversation is born with a sandbox: userId↔sandboxId 1:1, ~50GB quota, created
  through the saddle contract (`POST /api/v1/sandboxes`, exec via `:id/exec`).
- Conversation compaction rides the gateway itself (the summarizer is a model call,
  not local code).

## 7. Sandbox law (saddle / sedo)

- Saddle is the sandbox engine, sedo its home folder inside devthink. Twenty
  modalities are canonical (wasm/babel/node runtimes, complete virtualization, the
  runed sandbox that runs any binary including itself, VFS, ~45 CDNs), walking to
  thirty. The person never picks a modality: the platform resolves the junction.
- Hardware profiles: lite 2vCPU/0vGPU/2GB, balanced 4/0.5/8, max 8/1/16; sandbox
  equals account, immutable GHCR image versus UUID instance ("install CD" versus
  "save game").
- Stealhead ships pre-compiled (shaders and assets) so visitor vgpu/vcpu never compile.

## 8. Releases law

- One tag, one release for the family; assets per app inside it. Eighty assets per
  app is the target, three hundred the family floor — the gate: "release notes 300+
  assets, the Brave extension in the assets, family 100% functional".
- Five distribution zips per app: web + next.personalizado + next.zai + next.fifty +
  next.normal (order of use personalized → zai → fifty → normal); never a next folder
  in the repository, only zips in the assets.
- Binaries dmg/exe/deb/rpm/AppImage (mac intel+arm, win64+arm, linux x64+arm),
  extensions, containers, tar.xz -9e + Brotli, SHA256SUMS generated on the runner,
  ISO via xorriso, WASM cores via esbuild+javy.
- Release triggers on package.json, .gitignore or CHANGELOG.md change; actions pinned
  by tag, never SHA; commits always under iakadion.

## 9. Process law

- Waves of hierarchical subagents (0-200; up to 3,000 across 1,000 waves was the
  corpus-scale rule), one category per agent, verification after every wave.
- Checklists of 100+ steps before any action; commit per stage with `step:` footers.
- Reading uses bash sed/grep in segments; sources of code are edited with the editor
  tools; nothing is built locally when the runners can build it.
- Competitor PROJECTS are cloned and studied, their logics rewritten as native TS at
  the app root (never a dependency for the core); published frameworks may be
  dependencies (`@wenathlan/*`).
- Nothing is deleted from the corpus: duplicates keep a suffix; dedupe by hash keeps
  the newest; old infra enters as "(previous plan)".

## 10. Known corrections of this operation

- Commit 835f899 is the base; everything after it in the destroyed line (docs 2.0.99,
  chat-service 2.0.100, start-menu 2.0.101) was reset away. The gateway view folder
  is renamed `Sol/gateway` and answers the route it always served.
- The "7+1 subagent chat" rule came from the sandbox skill, not from the corpus; the
  binding formulation is the cascading checkpoint workflow of section 6.
- "40+ sandbox modalities" is not canonical; 20 walking to 30 is.
- mimetypes.txt (28,583 lines, 5,584 types) was recovered from the allan blobs
  (added 11349cde, removed db641c69) and now lives at `docs/mimetypes.txt`.
- The 16,511 GitHub links of the corpus live at `docs/corpus.github.links.txt` for
  the competitor campaign.
