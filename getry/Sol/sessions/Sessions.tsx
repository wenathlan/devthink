/**
 * Sessions.tsx — the sessions page of the getry Sol theme: the session
 * store of the gateway (the per-session rotation state of the devthink
 * meta-model), the registered provider keys with their rotation counters
 * and the recent chat log. rows arrive over HTTPS from the self-hosted
 * database and fall back to the in-memory seeds of the static build.
 */
import { useEffect, useState } from "react";
import { KeyRound, MessagesSquare, RefreshCw } from "lucide-react";
import { observeReveals } from "../../reveal";
import { toast } from "../toast/Toast";
import { listkeys, listmessages, maskkey, rotationsummary, type ApiKeyRow, type ChatMessageRow } from "../../db";
import { freshestfirst, listsessions, rotationindex, type SessionContextRow } from "../../sessions";

/**
 * formats one timestamp the way the theme renders it.
 *
 * @param value the iso timestamp to format.
 * @returns the short label.
 */
function shortstamp(value: string | null | undefined): string {
  if (!value) return "never";
  return value.slice(0, 16).replace("T", " ");
}

/**
 * the sessions page.
 *
 * @returns the sessions element.
 */
export default function Sessions() {
  const [sessions, setSessions] = useState<SessionContextRow[]>([]);
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);

  useEffect(() => {
    observeReveals();
    let live = true;
    void listsessions().then((rows) => {
      if (live) setSessions(freshestfirst(rows));
    });
    void listkeys().then((rows) => {
      if (live) setKeys(rows);
    });
    void listmessages().then((rows) => {
      if (live) setMessages(rows.slice(-6));
    });
    return () => {
      live = false;
    };
  }, []);

  const summary = rotationsummary(keys);

  return (
    <>
      <section className="pagehead">
        <p className="eyebrow">the session store</p>
        <h1>sessions, keys and the chat log</h1>
        <p>
          One row per session and provider carries the rotation index, the thinking budget and the context window math.
          The key pools rotate in round robin; the meta model rotates every six messages.
        </p>
      </section>

      <section className="section" aria-label="session contexts">
        <div className="tablewrap reveal">
          <table className="table ladder">
            <thead>
              <tr>
                <th>session</th>
                <th>provider</th>
                <th>model</th>
                <th>messages</th>
                <th>rotation</th>
                <th>thinking</th>
                <th>last message</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.sessionId}</td>
                  <td>{session.provider}</td>
                  <td>{session.modelVariant ?? session.model ?? "—"}</td>
                  <td>{session.messageCount}</td>
                  <td>#{rotationindex(session)}</td>
                  <td>{session.thinkingEnabled ? (session.thinkingLevel ?? "default") : "off"}</td>
                  <td>{shortstamp(session.lastMessageAt)}</td>
                </tr>
              ))}
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={7}>loading the session store…</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-label="provider keys">
        <div className="section-head reveal">
          <h2>
            <KeyRound size={17} /> provider keys
          </h2>
          <p>
            {summary.active} active, {summary.rotating} in rotation, {summary.erroring} with errors. The real keys live
            in the environment of the self-hosted deploy — this surface only ever renders the masked answers.
          </p>
        </div>
        <div className="keycards">
          {keys.map((key) => (
            <article key={key.id} className="glass card keycard reveal">
              <div className="keyhead">
                <span className="keymask mono">{maskkey(key.key)}</span>
                {key.rateLimitHit ? <span className="badge warning">rate limited</span> : <span className="badge success">{key.status}</span>}
              </div>
              <p className="keymeta">
                <strong>{key.provider}</strong> · {key.label ?? "unlabeled"} · {key.useCount} uses · rotated{" "}
                {key.rotationCount}×
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-label="recent chat log">
        <div className="section-head reveal">
          <h2>
            <MessagesSquare size={17} /> recent chat log
          </h2>
          <p>
            Every gateway request and response lands in the ChatMessage kind with its route, tokens and round-trip
            duration — the slice the gateway lanes consume.
          </p>
        </div>
        <div className="tablewrap reveal">
          <table className="table ladder">
            <thead>
              <tr>
                <th>chat</th>
                <th>provider</th>
                <th>route</th>
                <th>role</th>
                <th>tokens</th>
                <th>duration</th>
                <th>at</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id}>
                  <td>{message.chatId}</td>
                  <td>{message.provider}</td>
                  <td>{message.route}</td>
                  <td>{message.role}</td>
                  <td>{message.totalTokens ?? "—"}</td>
                  <td>{message.durationMs ? `${message.durationMs}ms` : "—"}</td>
                  <td>{shortstamp(message.createdAt)}</td>
                </tr>
              ))}
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={7}>loading the chat log…</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="actions reveal" style={{ marginTop: 22 }}>
          <button
            type="button"
            className="btn secondary"
            onClick={() => toast("the seeds refresh from the site DB on every load — nothing persists on your machine", "info")}
          >
            <RefreshCw size={14} />
            how the rows arrive
          </button>
        </div>
      </section>
    </>
  );
}
