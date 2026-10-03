/**
 * gateway.probe.mjs — manual chat round trip against a deployed DevThink
 * gateway (the ZAI sandbox deploy of the getry template). This probe is
 * NOT wired into the deterministic gates: it needs the live network and
 * the deployed host is a runtime setting, never a tracked constant of a
 * gate. Run it by hand with the base URL as the first argument:
 *
 *   node tests/gateway.probe.mjs https://<deployed-gateway-host>
 *
 * The probe exercises the exact surface the Sol chat client consumes:
 * GET /v1/models (the picker) and POST /v1/chat/completions with the
 * model "devthink" (content + reasoning_content on the answer turn).
 */

const base = (process.argv[2] ?? '').replace(/\/+$/, '');

if (!/^https?:\/\//.test(base)) {
  console.error('usage: node tests/gateway.probe.mjs https://<deployed-gateway-host>');
  process.exit(1);
}

/* GET /v1/models — the chat picker surface. */
const models = await fetch(`${base}/v1/models`);
if (!models.ok) {
  console.error(`models probe failed: ${models.status}`);
  process.exit(1);
}
const modellist = await models.json();
const ids = (modellist.data ?? []).map((m) => m.id);
console.log(`models: ${ids.join(', ') || '(none)'}`);

/* POST /v1/chat/completions — one round trip on the chat surface. */
const chat = await fetch(`${base}/v1/chat/completions`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    model: 'devthink',
    messages: [{ role: 'user', content: 'Reply with exactly: gateway ok' }],
    max_tokens: 20,
  }),
});
if (!chat.ok) {
  console.error(`chat probe failed: ${chat.status}`);
  process.exit(1);
}
const answer = await chat.json();
const turn = answer.choices?.[0]?.message;
console.log(`chat: ${JSON.stringify(turn?.content ?? '')}`);
console.log(`reasoning present: ${Boolean(turn?.reasoning_content)}`);
console.log(`usage: ${JSON.stringify(answer.usage ?? {})}`);

if (turn?.content !== 'gateway ok') {
  console.error('the gateway answered, but the round trip content drifted');
  process.exit(1);
}
console.log('gateway probe: ok');
