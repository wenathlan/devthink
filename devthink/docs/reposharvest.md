# the repos harvest — the full link extraction of the campaign

the owner ordered the extraction before any redesign wave: every link of every
file of the repository, every link of every blob of every commit of the
history, merged with the allan corpus of the previous session, deduplicated
with one normalization law, and bound into this document so the engines can
be cloned within time. this is that document.

## the method

. the tree: every text file of every app folder (devthink, argan, cadria,
  cobaia, debonair, forge, foundry, getry, saddle, stealthhead, vault) walked
  with the same link grammar.
. the history: every blob of every commit of the full history (864 commits,
  12,678 text blobs read through the cat-file batch) walked with the same
  grammar.
. the allan corpus: the 16,511 links the previous session harvested from the
  allan repository before its ordered deletion, preserved at 2.0.99 and
  re-merged here so nothing of that harvest is ever lost.
. the pool: 148,190 raw matches from the three sources.

## the dedup law (the normalization)

. the host lowers (www stripped, case folded).
. the owner and the repository lower (github and gitlab are case insensitive
  on access; `0xProject/0x-mesh` and `0xproject/0x-mesh` are one repo).
. the `.git` suffix and the trailing slash strip.
. the deeper paths collapse to the owner/repo root (tree, blob, issues,
  releases and tags all answer to the repo they belong to).
. the fixtures never ride the corpus (example.com, the .test hosts, the
  loopback addresses, the template placeholders).
. the result: one repo, one line, one truth.

## the totals

| metric | count |
| --- | --- |
| raw matches across the three sources | 148,190 |
| unique real links after normalization and fixture filtering | 24,350 |
| unique github repositories (owner/repo pairs) | 16,918 |
| unique gitlab repositories (owner/repo pairs) | 29 |
| links already carried by the allan corpus (2.0.99) | 16,244 |
| genuinely new repositories found in the devthink history and tree | 674 |

the corpus files:
. `corpusgithublinks.txt` — the 16,918 github repositories, one per line,
  normalized, sorted. the clone catalogue of the campaign.
. `corpusalllinks.txt` — the 24,350 unique real links of every kind (docs,
  registries, references, assets, specifications), the long tail behind the
  repositories.

## the link patterns (the grammar the owner asked extracted)

the github forms found across the pool:

| form | occurrences | meaning |
| --- | --- | --- |
| `github.com/owner/repo/...` | 67,282 | the canonical repo form, the root of the corpus |
| `api.github.com/owner/repo/...` | 765 | the rest api form, the metadata lane |
| `maven.pkg.github.com/owner/repo/...` | 426 | the package registry lane (maven artifacts) |
| `npm.pkg.github.com` | 357 | the package registry lane (npm artifacts) |
| `github.com` (bare) | 38 | the host-only mentions |
| `docs.github.com/...` | 45 | the documentation lane |
| `gist.github.com/...` | 24 | the gist lane |
| `rubygems.pkg.github.com/...` | 97 | the package registry lane (ruby artifacts) |
| `nuget.pkg.github.com/...` | 80 | the package registry lane (nuget artifacts) |

the other github properties:

| form | occurrences | meaning |
| --- | --- | --- |
| `wenathlan.github.io/devthink` | 241 | the pages deployment of this very family |
| `iakadion.github.io/iukka` | 7 | the owner's secondary pages identity |
| `raw.githubusercontent.com/...` | 138 | the raw content lane, the asset pulls |
| `gist.githubusercontent.com` | 8 | the raw gist lane |

the gitlab forms:

| form | occurrences | meaning |
| --- | --- | --- |
| `gitlab.com/qemu-project/qemu` | 7 | the only gitlab heavyweight, the virtualization source |
| `gitlab.freedesktop.org/mesa/mesa` | 10 | the freedesktop lane, the graphics stack |
| `gitlab.com/api/v4/projects` | 6 | the rest api form |
| `gitlab.nic.cz/knot-dns` | 1 | the dns lane (knot, the argan domain) |
| `gitlab.mrs.ai`, `gitlab.me` | 2 | the self hosted lanes |

the pattern verdict: github carries 99.5 percent of the repository truth of
this campaign, gitlab carries exactly one heavyweight (qemu, the
virtualization source the saddle domain studies), and the registries
(maven, npm, rubygems, nuget, raw) carry the artifact lanes the release
pipeline already rides.

## the engine mapping (the 15 engines and their clone candidates)

the keyword census over the 16,918 repositories (a repo may serve several
domains; the counts are the scale of each field, the named candidates are
the verified strongest):

| engine | domain | keyword matches | the strongest clone candidates |
| --- | --- | --- | --- |
| versawaze | video and 3d | 352 | olive-editor/olive, openshot/openshot-qt, openshot/libopenshot, mltframework/mlt, mltframework/shotcut, natrongithub/natron, glaxnimate/glaxnimate, ffmpeg/ffmpeg, ffmpegwasm/ffmpeg.wasm, gpac/mp4box.js, mpv-player/mpv, academysoftwarefoundation/opentimelineio, blender/blender |
| kathesis | audio | 338 | eshaz/wasm-audio-decoders, eshaz/codec-parser, descriptinc/descript-audio-codec, audiojs/audio, chrisguttandin/standardized-audio-context, danigb/soundfont-player, facebookresearch/audiocraft, electronoora/webaudio-mod-player, entrepeneur4lyf/web-audio-mastering, naomiaro/webaudio-peaks, audiocogs/aac.js, audiocogs/flac.js, audiocogs/mp3.js |
| saddle | sandbox and virtualization | 233 | qemu-project/qemu (gitlab), firecracker-microvm/firecracker, google/gvisor, gvisor/gvisor, google/nsjail, bytecodealliance/wasmtime, agent-infra/sandbox, agent-sandbox/agent-sandbox, vercel-labs/agent-browser (the rust automation cli) |
| getry | gateway and inference | 1,461 | berriai/litellm, the provider sdks (openai, anthropic, gemini, ollama, llama) and the model route corpus of the tests |
| argan | dns | 1,416 | coredns/coredns, chjj/unbound, handshake-org/hsd, handshake-org/hnsd, handshake-org/urkel, the knot lane on gitlab.nic.cz, the pkarr and gns families |
| vault | storage | 582 | minio/minio, ceph/ceph, deuxfleurs-org/garage, garage-hq/garage, seaweedfs, the s3 compatible corpus already structured in the saddle research |
| cobaia | monetization | 45 | stripe/stripe-node, alexvangelov/billing-js, the billing and quota families |
| the root engines | gateway, graphs, streaming, retry, compaction, mcp, calculator, maestro | the platform corpus | executeautomation/mcp-playwright, the mcp registry corpus, the streaming parser references of the tests |

the structured research of the previous session already carries the metadata
(stars, language, license) of the strongest 60 to 666 candidates of the
automation, scraping, storage and artifact domains in
`saddle/docs/repo-analysis-1.8.21.json`, `saddle/docs/repo-selected-1.8.21.json`
and `saddle/docs/repo-candidates-1.8.21.jsonl`.

## the rust law (the conversion doctrine)

the owner does not bind the campaign to any technology: the competitor code
that matters is written in rust (the video editors, the audio editors, the
agent browser) and it converts to typescript for the fifteen engines of the
manifest, because the engines of the manifest are typescript libraries. the
conversion rides the ports, not the copies: the algorithm is studied, the
math is rebuilt, the typescript engine answers under the devthink name with
the devthink architecture. nothing is vendored, everything is implemented.

the two engines with no source folder in the tree today are the first
beneficiaries of this law:
. versawaze (the video and 3d engine of cadria) rebuilds from the olive,
  openshot, mlt, natron and ffmpeg.wasm studies — the timeline model, the
  clip graph, the render pipeline, the codec lanes.
. kathesis (the audio engine of debonair) rebuilds from the wasm audio
  decoders, the descript codec, the webaudio families and the audiocogs
  codecs — the synthesis graph, the effect chain, the decode and the peaks.

## the chat design references (the next wave)

the owner named the design example the chat app copies: the windows eleven
design of the repositories, the t3code family, synara and execute. the
corpus carries them all:

. the t3code family (14 variants): jerkytreats/t3code, pingdotgg/t3code,
  konan69/t3code, aaditagrawal/t3code, jsvandijk/t3code-mobile,
  eclipticaxis/t3code-zh-cn, noisemaker111/t3code-canvas,
  zortos293/t3code-copilot, yappologistic/t3code,
  machirajusaisandeep/t3code-custom, jerkytreats/t3code-omarchy and the
  rest.
. synara: emanuele-web04/synara.
. execute: executeautomation/mcp-playwright.

the standard they set (with the windows eleven grammar of
`designspecwin11.md` and the cloudflare, openai and web awards discipline
the owner pinned) is the standard of the aura chat surface and, through it,
of every family app: one design track, clean, minimal, premium,
professional.

## the clone order (the priority of the campaign)

1. the chat design family (t3code, synara, execute) — the redesign wave of
   the aura chat surface rides first.
2. the versawaze set (ffmpeg.wasm, mp4box.js, opentimelineio, olive, mlt,
   openshot, natron, glaxnimate) — the video engine rebuild.
3. the kathesis set (wasm-audio-decoders, descript-audio-codec, codec-parser,
   the webaudio families, the audiocogs codecs) — the audio engine rebuild.
4. the sandbox set (qemu, firecracker, gvisor, nsjail, wasmtime,
   agent-sandbox) — the saddle modalities.
5. the dns set (coredns, unbound, the handshake family, knot) — the argan
   lanes.
6. the storage set (minio, garage, seaweedfs, ceph) — the vault lanes.
7. the inference set (litellm and the provider corpus) — the getry routes.

every clone lands outside the tree as reference material, studied and
deleted after the wave, exactly as the allan corpus was. the tree stays
clean, the engines stay devthink.

## to visit

. `devthink/docs/corpusgithublinks.txt` — the 16,918 repositories.
. `devthink/docs/corpusalllinks.txt` — the 24,350 links.
. `devthink/docs/planningoperation900.md` — the 950 steps that consume this
  catalogue, phase five carrying the engine waves.
. `devthink/docs/designspecwin11.md` — the windows grammar the redesign
  answers to.
. `saddle/docs/reposelected1821.json` — the structured metadata of the
  strongest automation and storage candidates.
