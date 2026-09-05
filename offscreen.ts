/**
 * Offscreen document runtime of the 1.1.60 family.
 * The offscreen document hosts the worker pool that parses heavy payloads away from the page and the sandbox frame iframe that renders untrusted markup without extension privileges; the background spawns this document on first use through the offscreen api only after the user grants the optional offscreen capability, and every parse task still rides a reviewed step of an approved plan. The 1.1.64 family adds the diffpreview task: the offscreen worker parses the large before and after states of one write class step so the diff generation offloads from the service worker while the comparison itself stays a pure reviewed computation. The 1.1.68 family adds the batchquery, streamparse and chunkextract tasks: the worker executes grouped selectors in one pass, tokenizes large pages chunk by chunk without ever holding the full page text, and slices big tables into resumable row windows that carry their table fingerprint.
 */

type parserequest = { kind: "offscreen"; action: "parse"; request: { id: string; runid: string; stepid: string; task: string; payload: string; transferables: string[] } };
type summaryrequest = { kind: "offscreen"; action: "summary"; request: { id: string; runid: string; stepid: string; task: string; payload: string; transferables: string[] } };
type diffrequest = { kind: "offscreen"; action: "parse"; request: { id: string; runid: string; stepid: string; task: "diffpreview"; payload: string; transferables: string[] } };
type renderrequest = { kind: "offscreen"; action: "sandboxrender"; render: { id: string; nonce: string; markup: string; sourceorigin: string; stepid: string } };
type poolrequest = { kind: "offscreen"; action: "pool" };

/** The worker sources of the parse families: pure functions that shape html, json, table, a11y tree, selector and stitch payloads without touching any page. */
const workersource = `
self.onmessage = event => {
  const { id, task, payload } = event.data || {};
  try {
    let result = "";
    if (task === "jsonpayload") { JSON.parse(payload); result = payload; }
    else if (task === "htmlsnapshot" || task === "readertree" || task === "readoutline" || task === "classifypage") { const doc = new DOMParser().parseFromString(payload, "text/html"); result = (doc.body && doc.body.textContent ? doc.body.textContent : payload).trim(); }
    else if (task === "tablerows" || task === "a11ytree" || task === "complexselector" || task === "stitchshots") { result = payload; }
    else if (task === "diffpreview") { const states = JSON.parse(payload); if (!states || typeof states !== "object" || typeof states.before !== "object" || typeof states.after !== "object") throw new Error("malformed diff states"); result = payload; }
    else if (task === "batchquery") { const plan = JSON.parse(payload); if (!plan || !Array.isArray(plan.selectors)) throw new Error("malformed batchquery plan"); result = JSON.stringify({ selectors: [...new Set(plan.selectors)], folded: plan.selectors.length - new Set(plan.selectors).size, onepass: true }); }
    else if (task === "streamparse") { const stream = JSON.parse(payload); if (!stream || !Array.isArray(stream.chunks)) throw new Error("malformed streamparse stream"); const tokens = stream.chunks.join(" ").match(/(<[a-zA-Z][^>]*>)|([^<]+)/g) || []; result = JSON.stringify({ chunks: stream.chunks.length, tokens: tokens.length, bytes: stream.chunks.reduce((sum, chunk) => sum + chunk.length, 0) }); }
    else if (task === "chunkextract") { const extraction = JSON.parse(payload); if (!extraction || !Array.isArray(extraction.rows)) throw new Error("malformed chunkextract payload"); result = JSON.stringify({ rowindex: extraction.rows.length, complete: true, rows: extraction.rows.length }); }
    else result = payload;
    self.postMessage({ id, ok: true, result, summary: "The offscreen worker finished the " + task + " parse." });
  } catch (error) {
    self.postMessage({ id, ok: false, result: "", summary: "The offscreen worker refused the " + task + " parse: " + (error && error.message ? error.message : "malformed payload") });
  }
};
`;

const pool = new Set<Worker>();
let sandboxframe: HTMLIFrameElement | undefined;
let renderseq = 0;
const pendingrenders = new Map<string, { resolve: (value: { ok: boolean; text: string; summary: string }) => void }>();

function ensureworker(): Worker {
  for (const worker of pool) return worker;
  const worker = new Worker(URL.createObjectURL(new Blob([workersource], { type: "text/javascript" })), { type: "classic" });
  pool.add(worker);
  return worker;
}

function ensuresandboxframe(): HTMLIFrameElement {
  if (sandboxframe) return sandboxframe;
  const frame = document.createElement("iframe");
  frame.src = "sandbox.html";
  frame.style.display = "none";
  frame.setAttribute("aria-hidden", "true");
  document.body.append(frame);
  sandboxframe = frame;
  return frame;
}

window.addEventListener("message", event => {
  const data = event.data as { channel?: string; type?: string; nonce?: string; ok?: boolean; text?: string; summary?: string };
  if (data?.channel !== "devthinksandbox" || data.type !== "renderresult" || data.nonce === undefined) return;
  const pending = pendingrenders.get(data.nonce);
  if (!pending) return;
  pendingrenders.delete(data.nonce);
  pending.resolve({ ok: data.ok !== false, text: data.text ?? "", summary: data.summary ?? "The sandbox frame returned its render result." });
});

function runparse(request: parserequest["request"]): Promise<{ ok: boolean; result: string; summary: string }> {
  return new Promise(resolve => {
    const worker = ensureworker();
    const timeout = window.setTimeout(() => resolve({ ok: false, result: "", summary: `The offscreen worker never answered the ${request.task} parse of the step ${request.stepid}.` }), 30000);
    worker.onmessage = event => {
      const answer = event.data as { id?: string; ok?: boolean; result?: string; summary?: string };
      if (answer.id !== request.id) return;
      window.clearTimeout(timeout);
      resolve({ ok: answer.ok !== false, result: answer.result ?? "", summary: answer.summary ?? "The offscreen worker answered." });
    };
    worker.postMessage({ id: request.id, task: request.task, payload: request.payload });
  });
}

function runrender(render: renderrequest["render"]): Promise<{ ok: boolean; text: string; summary: string }> {
  return new Promise(resolve => {
    const frame = ensuresandboxframe();
    renderseq += 1;
    const nonce = render.nonce;
    const pending = { resolve };
    pendingrenders.set(nonce, pending);
    window.setTimeout(() => {
      if (pendingrenders.delete(nonce)) pending.resolve({ ok: false, text: "", summary: `The sandbox frame never answered the render of the step ${render.stepid}.` });
    }, 15000);
    frame.contentWindow?.postMessage({ channel: "devthinksandbox", type: "render", nonce, markup: render.markup }, "*");
    void renderseq;
  });
}

chrome.runtime.onMessage.addListener((message: parserequest | summaryrequest | diffrequest | renderrequest | poolrequest, _sender, sendresponse) => {
  if (!message || (message as { kind?: string }).kind !== "offscreen") return false;
  if (message.action === "parse") {
    void runparse(message.request).then(answer => sendresponse({ ok: answer.ok, result: answer.result, summary: answer.summary }));
    return true;
  }
  if (message.action === "summary") {
    void runparse(message.request).then(answer => sendresponse({ ok: answer.ok, summary: `The offscreen worker verified the ${message.request.task} distillation of the run ${message.request.runid}: ${answer.summary}` }));
    return true;
  }
  if (message.action === "sandboxrender") {
    void runrender(message.render).then(answer => sendresponse({ ok: answer.ok, text: answer.text, summary: answer.summary }));
    return true;
  }
  if (message.action === "pool") {
    sendresponse({ workers: pool.size });
    return true;
  }
  return false;
});
