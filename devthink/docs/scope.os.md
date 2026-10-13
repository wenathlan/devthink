# the devthink os scope

what the os is, in one sentence: devthink is the os and the superplataforma
that absorbs devthinkos, cli-desktop, SoFlowX, akash, the extension, the
gateway and maene, embeds the owni, imports the seven family engines from
the published libraries and orchestrates everything through the node
maestro with the python lane beside it.

this doc draws the surgical line: what belongs to the os, what never
belongs to it, and the name mapping the owner's notes use against the real
files. the line is law — everything inside belongs, everything outside is
imported or left to its own app.

## what belongs to the os

| belong | detail |
| --- | --- |
| the superplataforma | the os engloba tudo: a plataforma que os demais apps usam e a superfície onde tudo aparece. |
| the window manager | taskbar 48, pins 38x38, start 640, windowframes with drag, snap, alt-tab, menus — the shell chrome owns the windows. |
| the orchestration | the maestro (devthink.ts) commands the 15 engines of the manifest; the graphrunner walks every flow stage by stage. |
| the 35 native pages | the 26 page folders of the sol tree plus the 9 family views of the os registry, one design, responsivity only. |
| the devthink browser | the browser surface of the os with its own chrome, consent gates and the policy module answering every ask. |
| the news page | notícias as a native page of the os, live feed, both presentations. |
| the absorptions | devthinkos, cli-desktop, SoFlowX, akash, the extension, the gateway and maene fused inside, no duplicate left. |
| the owni embedded | the owni rides the os: page.ts, background.ts, providers.ts and policy.ts at the root with the providers surface of the sol tree. |
| the family imports | versawaze, kathesis, saddle, getry, argan, vault and cobaia enter only as the published library packages, never a sibling path. |
| the node maestro | node.js is the orchestrator behind everything, exactly as the engines and library rule states. |
| the python lane | pythonscripts.ts spawns python3 for the maestro inside the sandbox cwd with timeout, capture and exit codes. |

## what never belongs to the os

| not belong | why |
| --- | --- |
| the game logic of the stealthhead | match, ranking, arsenal and world rules live in the stealthhead app; the os imports nothing of the kind. |
| the full daw of the debonair | tracks, mixing and synthesis belong to the debonair; the os imports the kathesis engine only. |
| the full editor of the cadria | the timeline, the studio and the render pipeline belong to the cadria; the os imports the versawaze engine only. |
| the virtualization engine of the saddle | sandboxes, images and runners belong to the saddle; the os imports the library, it never runs vms itself. |
| the dns zones of the argan | zones, records, dnssec and handshake belong to the argan; the os imports the engine only. |
| the buckets of the vault | storage buckets and accounts belong to the vault; the os imports the storage engine only. |
| the monetization rules of the cobaia | plans, prices and billing rules belong to the cobaia; the os imports the engine only. |

the law under the table: the os imports these engines via the published
library, configures baseURL, models and keys, and never reimplements one
line of their domain. the import rides the package, never a folder between
sibling apps; a sibling path is a violation the library-import audit hunts.

## the name mapping

the owner's notes point dotted names; the tree answers flat names. the
mapping is frozen — do not rename, a rename collides with the 3.0 baseline
and the collision is forbidden.

| pointed | real | law |
| --- | --- | --- |
| stream.parse.ts | streaming.ts | do not rename |
| retry.backoff.ts | retrybackoff.ts | do not rename |
| conversation.compact.ts | conversationcompact.ts | do not rename |
| calculator.logic.ts | calculator.ts | do not rename |
| mcp.registry.ts | mcpregistry.ts | do not rename |

the same law covers every root module: one flat name, one responsibility,
the manifest in the package.json as the single truth of what exists.

## the evidence in the repo

the claims above are checked against the tree on 2026-10-13:

- the owni is embedded: page.ts, background.ts, providers.ts and policy.ts
  at the app root, with the providers surface living at
  Sol/providers/providers.tsx.
- the os registry holds the 42 ids: Sol/os/apps.ts carries 42 id entries —
  the apps and their sections — as the single source the shell reads.
- the zoomlock is installed: App.tsx imports installzoomlock from
  zoomlock.ts and calls it before the first render when a window exists.
- the manifest of the 15 engines lives in the package.json under the
  devthink key, with the maestro note and one entry per engine.
- the python lane lives in pythonscripts.ts with its test at
  tests/pythonscripts.test.ts answering green without a real interpreter.

## the line in practice

a session asks one question before touching a file: does this work belong
to the os surface or to an engine domain? the os surface work lands here
(shell, pages, browser, news, orchestration); the engine domain work lands
in its app and enters the os through the published package. when the doubt
survives, the manifest decides: the engines list names what the os imports,
everything else on those domains belongs to the family app.
