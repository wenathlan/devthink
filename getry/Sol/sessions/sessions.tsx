/**
 * sessions page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { ArrowSyncRegular, ChatMultipleRegular } from "@fluentui/react-icons";
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
import { label, labelfill } from "../../labels";
import { observeReveals } from "../../reveal";
import { contextshare, freshestfirst, listsessions, rotationindex, type SessionContextRow } from "../../sessions";
import { ShellEmptystate as EmptyState } from "../widgets";
import { toast } from "../toast/Toast.tsx";

/** the rungs of the rotation ladder the dots walk (one per rotation step). */
const ROTDOTS = [0, 1, 2, 3, 4, 5] as const;

/**
 * formats one timestamp the way the theme renders it.
 *
 * @param value the iso timestamp to format.
 * @returns the short label.
 */
function shortstamp(value: string | null | undefined): string {
  if (!value) return label("sessions.stamp.never");
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
  const loaded = sessions.length > 0 || keys.length > 0 || messages.length > 0;

  /** the honest reload action of the empty frames (the store never persists on the visitor). */
  const reload = (): void => {
    toast(label("sessions.toast.reload"), "info");
  };

  return (
    <>
      <section className="pagehead halftone">
        <p className="eyebrow">{label("sessions.eyebrow")}</p>
        <h1>{label("sessions.title")}</h1>
        <p>{label("sessions.lede")}</p>
      </section>

      <section className="section r3-ops" aria-label={label("sessions.registry.aria")}>
        <div className="ledger r3-ledger">
          <div className="ledger__main">
            <p className="railmeta__head reveal">{label("sessions.registry.head")}</p>
            <div className="tablewrap reveal">
              <table className="table ladder">
                <thead>
                  <tr>
                    <th>{label("sessions.table.session")}</th>
                    <th>{label("sessions.table.model")}</th>
                    <th>{label("sessions.table.messages")}</th>
                    <th>{label("sessions.table.context")}</th>
                    <th>{label("sessions.table.rotation")}</th>
                    <th>{label("sessions.table.thinking")}</th>
                    <th>{label("sessions.table.last")}</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} data-idle={session.messageCount === 0 ? "true" : undefined}>
                      <td className="ledgename">
                        <span
                          className="r3-livedot"
                          data-live={session.messageCount > 0 ? "true" : undefined}
                          aria-hidden="true"
                        />
                        <span className="ledgename__stack">
                          <strong>{session.sessionId}</strong>
                          <small>{session.provider}</small>
                        </span>
                      </td>
                      <td>{session.modelVariant ?? session.model ?? "—"}</td>
                      <td>{session.messageCount}</td>
                      <td className="cellmeter">
                        <span className="r3-meter" aria-hidden="true">
                          <i style={{ width: `${contextshare(session)}%` }} />
                        </span>
                        <span className="mono">{contextshare(session)}%</span>
                      </td>
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
                        {session.thinkingEnabled
                          ? (session.thinkingLevel ?? label("sessions.think.default"))
                          : label("sessions.think.off")}
                      </td>
                      <td className="cellstamp">{shortstamp(session.lastMessageAt)}</td>
                    </tr>
                  ))}
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="tableempty">
                        {loaded ? (
                          <EmptyState
                            icon={ChatMultipleRegular}
                            note={label("sessions.empty.sessions")}
                            action={
                              <button type="button" className="btn secondary small" onClick={reload}>
                                {label("sessions.action.store")}
                              </button>
                            }
                          />
                        ) : (
                          <>
                            <span className="skel" style={{ width: "46%" }} aria-hidden="true" />
                            <span className="skel" style={{ width: "72%" }} aria-hidden="true" />
                            <span className="sr-only">{label("sessions.loading.sessions")}</span>
                          </>
                        )}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="ledger__rail">
            <div className="railmeta reveal">
              <p className="railmeta__head">{label("sessions.rail.rotation")}</p>
              <div className="railmeta__row">
                <span>{label("sessions.rail.activeKeys")}</span>
                <strong>{summary.active}</strong>
              </div>
              <div className="railmeta__row">
                <span>{label("sessions.rail.inRotation")}</span>
                <strong>{summary.rotating}</strong>
              </div>
              <div className="railmeta__row">
                <span>{label("sessions.rail.erroring")}</span>
                <strong>{summary.erroring}</strong>
              </div>
              <div className="railmeta__row">
                <span>{label("sessions.rail.metaTurns")}</span>
                <strong>{label("sessions.rail.everySix")}</strong>
              </div>
              <p className="railmeta__foot">{label("sessions.rail.foot")}</p>
            </div>
            <div className="railmeta reveal">
              <p className="railmeta__head">{label("sessions.rail.keys")}</p>
              {keys.length === 0 ? (
                <EmptyState
                  icon={ChatMultipleRegular}
                  note={label("sessions.empty.keys")}
                  action={
                    <button type="button" className="btn secondary small" onClick={reload}>
                      {label("sessions.action.pool")}
                    </button>
                  }
                />
              ) : (
                keys.map((key) => (
                  <article key={key.id} className="edgerow">
                    <span className="edgerow__mask">{maskkey(key.key)}</span>
                    <span className="edgerow__state ladderdots" aria-hidden="true">
                      <i data-on={key.rateLimitHit || key.status !== "active" ? undefined : "true"} />
                    </span>
                    <span className="edgerow__meta">
                      {labelfill("sessions.key.meta", {
                        provider: key.provider,
                        label: key.label ?? label("sessions.key.unlabeled"),
                        uses: String(key.useCount),
                        rotated: String(key.rotationCount),
                      })}
                    </span>
                  </article>
                ))
              )}
            </div>
          </aside>
        </div>
      </section>

      <section className="section r3-log" aria-label={label("sessions.log.aria")}>
        <div className="section-head reveal">
          <h2>
            <ChatMultipleRegular fontSize={17} /> {label("sessions.log.title")}
          </h2>
          <p>{label("sessions.log.lede")}</p>
        </div>
        <div className="tablewrap reveal">
          <table className="table ladder">
            <thead>
              <tr>
                <th>{label("sessions.log.chat")}</th>
                <th>{label("sessions.log.provider")}</th>
                <th>{label("sessions.log.route")}</th>
                <th>{label("sessions.log.role")}</th>
                <th>{label("sessions.log.tokens")}</th>
                <th>{label("sessions.log.durationHead")}</th>
                <th>{label("sessions.log.at")}</th>
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
                  <td>{message.durationMs ? labelfill("sessions.log.duration", { ms: String(message.durationMs) }) : "—"}</td>
                  <td>{shortstamp(message.createdAt)}</td>
                </tr>
              ))}
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="tableempty">
                    {loaded ? (
                      <EmptyState
                        icon={ChatMultipleRegular}
                        note={label("sessions.empty.log")}
                        action={
                          <button type="button" className="btn secondary small" onClick={reload}>
                            {label("sessions.action.log")}
                          </button>
                        }
                      />
                    ) : (
                      <>
                        <span className="skel" style={{ width: "38%" }} aria-hidden="true" />
                        <span className="skel" style={{ width: "64%" }} aria-hidden="true" />
                        <span className="sr-only">{label("sessions.loading.log")}</span>
                      </>
                    )}
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
            onClick={() => toast(label("sessions.toast.refresh"), "info")}
          >
            <ArrowSyncRegular fontSize={14} />
            {label("sessions.action.how")}
          </button>
        </div>
      </section>
    </>
  );
}
