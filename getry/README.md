# getry — the AI gateway clone of the wenathlan family

getry is the reusable AI gateway of the [DevThink](https://github.com/wenathlan/devthink)
family: five provider gateways behind one OpenAI-compatible surface, a registerable
thinking ladder, a session store and key rotation — described by `schema.prisma`
and served as one static Sol console. The package is built to be cloned or
installed anywhere: npm, Maven, NuGet, RubyGems, PyPI, crates.io, Homebrew,
Gradle and Go module envelopes all ship beside the source.

## Provider versions

| version | provider | state | notes |
| --- | --- | --- | --- |
| `v1` | zai (GLM, keyless via `z-ai-web-dev-sdk`) | live | 11 GLM models, chat + the seven media lanes |
| `v2` | babel town | paused | every route answers 503 with a `fallbackroute` to the `v1` equivalent |
| `v3` | nvidia nim | live | 16 chat models plus the `devthink` meta mask, 22-key round robin, rotates every 6 messages |
| `v4` | opencode zen + kilo | live | 24 free-tag models, anonymous, two upstreams with mutual fallback |
| `v5` | openrouter | live (BYOK) | 19 `:free` models behind a registered `OPENROUTER_API_KEY`, rotates every message |

## Route surface

Each version registers the same fourteen route kinds at `/vN/*` and `/api/vN/*`
(descriptors on GET, handlers on POST) — 70 registered route lanes:

**The seven chat core kinds** (serving on every version):

- `chat/completions` — OpenAI chat shape, SSE streaming, reasoning deltas
- `completions` — legacy text completions
- `responses` — the responses shape
- `messages` — the messages shape
- `models` — the version catalog (with the media discovery metadata on v1)
- `keys` — gateway key introspection (not an OpenAI-compatible kind)
- `embeddings` — **disabled in every shipped config** (each POST answers
  "`<provider>` has no embeddings endpoint")

**The seven media lanes** (the honest absence law: only the zai sdk transport of
v1 serves them — every other version answers the paused-shaped 503 with the
`/v1/*` fallback):

- `images/generations` — cogview-4 / cogview-4-plus text-to-image
- `images/edits` — the cogview image edit lane
- `images/understanding` — the vision lane (openai `image_url` parts, anthropic
  image blocks and gemini `inline_data` parts normalized)
- `audio/speech` — glm-tts text-to-speech (openai voice aliases resolved)
- `audio/transcriptions` — glm-asr speech-to-text (`file_base64`, `file` data
  url or remote url, or multipart form-data)
- `audio/understanding` — the asr+chat chain (glm-asr transcribes the audio,
  glm chat answers the prompt over the transcript; openai chat.completion
  shape with the transcript at the top level)
- `videos/generations` — cogvideox async lane (POST creates the task answering
  202, `GET ?id=<task_id>` polls until SUCCESS or FAIL)

The numbers are pinned by `test/gatewayversions.test.ts` (5 providers × 14
kinds = 70 lanes). The store behind the routes (`schema.prisma`):
`ChatMessage`, `NvidiaKey`, `TownKey`, `ApiKey`, `SessionContext`,
`OnboardingState`.

## The thinking ladder

`thinking.ts` seeds seven rungs — `none 0`, `minimal 1,400`, `low 5,500`,
`medium 17,000`, `high 68,000` (default), `xhigh 68,000`, `max 68,000` tokens —
and the ladder is registerable at runtime (`registerthinkinglevels()`); no
ceiling is fixed in the engine. The two-calls pattern (reasoning pass, then
answer pass) engages past the 98,304-token threshold.

## The Sol console

`sol/` is the static React console (Vite + wouter + Tailwind 4, the interface
18 design pass): intro, onboarding, home (endpoint route visualizer over the
live version rows), chat, sessions, the thinking ladder and versions views.
Build with `bun run build`, serve with any static host — `netlify.toml`,
`vercel.json`, `wrangler.toml`, `nginx.conf`, `_headers` and `_redirects` are
all shipped.

## Quick start

```bash
bun install          # install (lockfile is frozen: bun install --frozen-lockfile in CI)
bun run db:generate  # prisma generate --schema schema.prisma
bun run dev          # vite console
bun run check        # tsc --noEmit
bun run test         # vitest run
```

The Hono server (`server.ts`) serves the API and the built console with an SPA
fallback, binding to a drawn port (30000-59999) unless configured.

## Packaging envelopes

`package.json` (npm) · `pom.xml` (Maven) · `build.gradle.kts` (Gradle) ·
`getry.csproj` (NuGet) · `getry.gemspec` (RubyGems) · `pyproject.toml` (PyPI) ·
`Cargo.toml` (crates.io) · `homebrew.rb` (Homebrew tap) · `go.mod` (Go module) ·
`Dockerfile` (container). Each envelope carries the same documentation set and
test directory.

## License

GPL-3.0-only — see the family root.
