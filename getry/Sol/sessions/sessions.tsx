/**
 * sessions page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { MessagesSquare, RefreshCw } from "lucide-react";
/**
 * Sessions.tsx — the sessions page of the getry Sol theme: the session
 * registry as one editorial ledger — the session contexts as the dominant
 * table column, the rotation summary and the masked provider keys as the
 * meta rail — and the recent chat log below. rows arrive over HTTPS from
 * the self-hosted database and fall back to the in-memory seeds of the
 * static build.
 */
import { useEffect, useState } from "react";
import { type ApiKeyRow, type ChatMessageRow, listkeys, listmessages, maskkey, rotationsummary } from "../../db";
import { observeReveals } from "../../reveal";
import { freshestfirst, listsessions, rotationindex, type SessionContextRow } from "../../sessions";
import { toast } from "../toast/Toast";

/** the rungs of the rotation ladder the dots walk (one per rotation step). */
const ROTDOTS = [0, 1, 2, 3, 4, 5] as const;

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
      <section className="pagehead halftone">
        <p className="eyebrow">getry · sessions</p>
        <h1>sessions, keys and the chat log</h1>
        <p>
          One row per session and provider carries the rotation index, the thinking budget and the context window math.
          The key pools rotate in round robin; the meta model rotates every six messages.
        </p>
      </section>

      <section className="section" aria-label="session registry">
        <div className="ledger">
          <div className="ledger__main">
            <p className="railmeta__head reveal">session contexts — one row per session and provider</p>
            <div className="tablewrap reveal">
              <table className="table ladder">
                <thead>
                  <tr>
                    <th>session</th>
                    <th>model</th>
                    <th>messages</th>
                    <th>rotation</th>
                    <th>thinking</th>
                    <th>last message</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} data-idle={session.messageCount === 0 ? "true" : undefined}>
                      <td className="ledgename">
                        <strong>{session.sessionId}</strong>
                        <small>{session.provider}</small>
                      </td>
                      <td>{session.modelVariant ?? session.model ?? "—"}</td>
                      <td>{session.messageCount}</td>
                      <td className="cellrot">
                        <span className="ladderdots" aria-hidden="true">
                          {ROTDOTS.map((dot) => (
                            <i key={`rot-${dot}`} data-on={dot < rotationindex(session) ? "true" : undefined} />
                          ))}
                        </span>{" "}
                        <span className="mono">#{rotationindex(session)}</span>
                      </td>
                      <td className="cellthink">
                        <span className="ladderdots" aria-hidden="true">
                          <i data-on={session.thinkingEnabled ? "true" : undefined} />
                        </span>{" "}
                        {session.thinkingEnabled ? (session.thinkingLevel ?? "default") : "off"}
                      </td>
                      <td className="cellstamp">{shortstamp(session.lastMessageAt)}</td>
                    </tr>
                  ))}
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="tableempty">
                        loading the session store…
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="ledger__rail">
            <div className="railmeta reveal">
              <p className="railmeta__head">rotation</p>
              <div className="railmeta__row">
                <span>active keys</span>
                <strong>{summary.active}</strong>
              </div>
              <div className="railmeta__row">
                <span>in rotation</span>
                <strong>{summary.rotating}</strong>
              </div>
              <div className="railmeta__row">
                <span>erroring</span>
                <strong>{summary.erroring}</strong>
              </div>
              <div className="railmeta__row">
                <span>meta model turns</span>
                <strong>every 6</strong>
              </div>
              <p className="railmeta__foot">
                The real keys live in the environment of the self-hosted deploy — this surface only ever renders the
                masked answers.
              </p>
            </div>
            <div className="railmeta reveal">
              <p className="railmeta__head">provider keys</p>
              {keys.map((key) => (
                <article key={key.id} className="edgerow">
                  <span className="edgerow__mask">{maskkey(key.key)}</span>
                  <span className="edgerow__state ladderdots" aria-hidden="true">
                    <i data-on={key.rateLimitHit || key.status !== "active" ? undefined : "true"} />
                  </span>
                  <span className="edgerow__meta">
                    {key.provider} · {key.label ?? "unlabeled"} · {key.useCount} uses · rotated {key.rotationCount}×
                  </span>
                </article>
              ))}
            </div>
          </aside>
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
                  <td colSpan={7} className="tableempty">
                    loading the chat log…
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="actions reveal" style={{ marginTop: 22 }}>
          <button
            type="button"
            className="btn secondary"
            onClick={() =>
              toast("the seeds refresh from the site DB on every load — nothing persists on your machine", "info")
            }
          >
            <RefreshCw size={14} />
            how the rows arrive
          </button>
        </div>
      </section>
    </>
  );
}
