# Chat × Gateway Spec — the contract that makes the chat work

> The binding formulation after the corpus read: the chat speaks to the getry gateway
> over HTTPS and to nothing else. The mini-service pattern for chat was destroyed
> once (commit 877de9a1, reset away) and never returns. The SDK z.ai lives inside
> the gateway, never in the client.

## 1. The contract (OpenAI-compatible)

```
base      registered in settings (opt-in): {origin} saved as chat.gatewaybase
probe     GET {base}/v1/models            → 200 with models list = connected
send      POST {base}/v1/chat/completions
body      { model: "devthink", messages: [{role, content}, ...], stream: true }
headers   x-session-id: <session id>            (rotation + context window live on it)
          x-thinking-level: none|minimal|low|medium|high|xhigh|max   (default high)
          x-model / x-tools optional
response  SSE stream; choices[0].delta.content; reasoning deltas arrive BEFORE content;
          the model answers masked as "devthink"; exactly one [DONE]
fallback  v2 babel paused → 503 falls back to v1; pool: 3 failures / 5s / 60s ceiling;
          Retry-After wins; 11 error codes
rotation  key rotates every request (22 nvidia keys on v3); model rotates every 6
          messages per sessionid (the meta-model devthink = minimax-m3 + glm-5.2 +
          kimi-k2.6 + step-3.7-flash + glm-5.1 fusion)
thinking  budgets in chars: none 0 / minimal 1400 / low 5500 / medium 17000 /
          high 68000 / xhigh 68000 / max 68000; default high
```

## 2. Streaming rules (the gateway parsersteps)

- Frames split on double newline — never emit a partial frame.
- Heartbeat lines starting with `:` or ping events are discarded.
- keepalive only when the stream is idle > 1s (200ms cadence).
- reasoning_content re-emitted before content on every turn.
- One [DONE] terminator; then savemsg persists the turn.

## 3. Client implementation (devthink side)

```
chatbody.tsx      the anchor (embedded contract: works as window body and full page)
chatstate.ts      runTurn: builds the message list, calls the gateway, persists
osgateway.ts      gatewayChat: fetch POST /v1/chat/completions, SSE reader
gatewaybase.ts    opt-in registration: validate origin, probe /v1/models (6s timeout),
                  4 states disconnected/connecting/connected/error; never prefilled;
                  send without registration = honest error + retry, zero fetch
conversationcompact.ts   compaction request rides the gateway (summarizer = model call)
chat persistence  localStorage: 60 sessions / 40 turns; deep-link handoff adopts the id
cognition drawer  renders reasoning_content live (the thinking pill maps to the header)
```

## 4. Editing = cascading checkpoint workflow (the owner law R00170)

- Editing a message opens a variant workflow that inherits the last context without
  interrupting the running one.
- When the first flow finishes it hands a checkpoint forward; a third adjustment
  workflow can open inside the second; edits 3, 4, 5… chain the same way.
- The resume base is the checklist before every task plus the vectorized context.
- Merge: the final state carries every checkpoint plus the newest edit — the newest
  edit prevails; no checkpoint detail may be forgotten (they all serve the same task).
- Pure client logic: `cloneSessionForEdit` snapshots the conversation, the original
  stays intact, the branch carries the edit. Never a service.

## 5. Sandbox birth (the conversation carries a sandbox)

```
create    POST /api/v1/sandboxes { model, vcpus, ramgb, gpu, mig, quotamb }
          → sandbox created→running (sqlite + TTL reaper)
exec      POST /api/v1/sandboxes/:id/exec { command } → { output, exitCode }
files     VFS per sandbox, persisted, quota enforced
profiles  lite 2vCPU/0vGPU/2GB · balanced 4/0.5/8 · max 8/1/16
identity  userId↔sandboxId 1:1; SpaceId/SandboxId/SessionId/MessageId ride the
          conversation from birth; ~50GB quota
engine    saddle (sedo folder): browser-pure vcpu/vmem/vgpu/mesa/VFS in sandbox.ts,
          node:http server in webserver.ts
```

## 6. Atomic Chat grammar (the chat look)

- Bubbles rounded-2xl with corner cuts (bot tl-md, user tr-md on indigo in the
  landing face; theme ladder surfaces in the OS face).
- Chat box rounded-[32px], pills 28px, SaddleTabBridge chrome, frosted halo only
  behind the outer ring, animated gradient border (blue→violet→pink→orange stroke
  6.5, 9s animateTransform), squish 18↔14 (220/380ms easeOutQuart), white pulse on
  send 650ms.
- z-order ladder: rightTab z0 → border z1 → body z2 → SVG gradient z3 → buttons z10 →
  content z20.
- Constants: BOX_CORNER_RADIUS 24, SADDLE_CONCAVE_RADIUS 14, TAB_HEIGHT 40,
  OVERLAP_OFFSET 1.5, ACTIVE_TAB_RADIUS 18, INACTIVE_TAB_RADIUS 14.
- Competitors to match: Atomic Chat, T3, Pi.

## 7. What still had to be built (this operation)

1. A standing gateway answering `/v1` — the devthink server (hono) gains the `/v1/*`
   passthrough so the OS dev sandbox serves the same contract the deployed copies of
   the family serve in production (`engine.ts` zaisdkcall already exists for `/api/*`).
2. Registration: the opt-in surface already exists; the dev default rides the proxy.
3. Streaming: the client SSE reader + the parsersteps above.
4. `x-session-id` + `x-thinking-level` headers wired from the session and the pill.
5. conversationcompact wired into runTurn.
6. cloneSessionForEdit re-implemented as pure logic with the cascade merge.
7. Sandbox birth on conversation create (saddle contract above).
