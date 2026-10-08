/**
 * aura.chat.tsx — the heart of the os (the Aura pattern):
 * - dual vision: empty = intro + suggestions; with messages = list + composer
 * - bubbles per role + collapsible "Internal Cognition" (reasoning_content)
 * - useStoredState (localStorage + type-guard) per view, capped
 * - states: loading (pulsing orb), error (toast + retry), empty (chips)
 * - composer with 32px min-height, autoscroll, restored focus
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { BrainCircuit, RefreshCw, Send, Trash2 } from "lucide-react";
import { useStoredState, arrayOf, type Validator } from "./use.stored.state";
import { gatewayChat } from "../../osgateway";
import { pushOSEvent } from "./os.events";
import type { Persona } from "./apps";

/** minimal class joiner (clsx-shaped, no external dependency). */
function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  thought?: string | undefined;
  at: number;
};

export const isChatMessage: Validator<ChatMessage> = (v): v is ChatMessage => {
  if (typeof v !== "object" || v === null) return false;
  const m = v as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string" &&
    (m.thought === undefined || typeof m.thought === "string") &&
    typeof m.at === "number"
  );
};

const isMessageList = arrayOf(isChatMessage);
const STORE_CAP = 40;
const HISTORY_CAP = 12;

function fmtTime(at: number): string {
  try {
    return new Date(at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function AuraChat({
  persona,
  storageKey,
  appLabel,
  className,
}: {
  persona: Persona;
  storageKey: string;
  appLabel: string;
  className?: string;
}) {
  const [messages, setMessages] = useStoredState<ChatMessage[]>(storageKey, [], isMessageList);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCognition, setShowCognition] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const lastPrompt = useRef<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  // autoscroll (Aura pattern)
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // textarea auto-grow (composer 32px → 120px)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(120, Math.max(32, el.scrollHeight))}px`;
  }, []);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || busy) return;

      setError(null);
      setBusy(true);
      lastPrompt.current = clean;

      const userMsg: ChatMessage = {
        id: `m-${Date.now()}-u`,
        role: "user",
        content: clean,
        at: Date.now(),
      };
      const base = messagesRef.current;
      const history = [...base, userMsg];
      setMessages([...history].slice(-STORE_CAP));

      try {
        const apiMessages = [
          { role: "system" as const, content: persona.system },
          ...history.slice(-HISTORY_CAP).map((m) => ({ role: m.role, content: m.content })),
        ];
        const reply = await gatewayChat(apiMessages);
        const assistantMsg: ChatMessage = {
          id: `m-${Date.now()}-a`,
          role: "assistant",
          content: reply.content,
          thought: reply.reasoning,
          at: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg].slice(-STORE_CAP));
        pushOSEvent({
          title: `Chat with Aura — ${appLabel}`,
          note: clean.length > 90 ? `${clean.slice(0, 90)}…` : clean,
          kind: "chat",
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown failure";
        setError(msg);
        toast.error("Aura did not respond", { description: msg });
      } finally {
        setBusy(false);
        // focus restored after the answer (Aura pattern)
        window.requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [appLabel, busy, persona.system, setMessages]
  );

  const suggestions = useMemo(() => persona.suggestions, [persona]);

  const empty = messages.length === 0;

  return (
    <section className={cx("glass chat", className)} aria-label={`Chat ${persona.name} — ${appLabel}`}>
      <div className="chat-head">
        <span className="chat-orb" aria-hidden="true" />
        <div className="who">
          <b>{persona.name}</b>
          <span>{persona.role}</span>
        </div>
        <div className="row" style={{ marginLeft: "auto", gap: 6 }}>
          <button
            type="button"
            className="icon-btn"
            aria-pressed={showCognition}
            onClick={() => setShowCognition((v) => !v)}
            title={showCognition ? "Hide internal cognition" : "Show internal cognition"}
            aria-label={showCognition ? "Hide internal cognition" : "Show internal cognition"}
          >
            <BrainCircuit size={18} strokeWidth={1.8} />
          </button>
          {messages.length > 0 ? (
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                setMessages([]);
                toast("Conversation cleared", { description: `The ${appLabel} chat history was deleted from this device.` });
              }}
              aria-label="Clear conversation"
              title="Clear conversation"
            >
              <Trash2 size={18} strokeWidth={1.8} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="chat-scroll" ref={scrollRef}>
        {empty ? (
          <div className="chat-empty">
            <span className="chat-orb" aria-hidden="true" />
            <p className="strong" style={{ marginBottom: 6 }}>{persona.intro}</p>
            <p className="tiny faint" style={{ marginBottom: 16 }}>
              POST /v1/chat/completions · model <code>devthink</code> · local persistence
            </p>
            <ul className="chips" aria-label="Prompt suggestions">
              {suggestions.map((s) => (
                <li key={s}>
                  <button type="button" className="chip" onClick={() => void send(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={cx("msg", m.role === "user" ? "user" : "assistant")}>
              <div className="bubble">
                {m.content}
                {m.role === "assistant" && m.thought && showCognition ? (
                  <details className="cognition">
                    <summary>
                      <BrainCircuit size={13} strokeWidth={1.8} aria-hidden="true" />
                      internal cognition
                    </summary>
                    <pre className="cog-body">{m.thought}</pre>
                  </details>
                ) : null}
                <div className="bubble-meta">
                  {fmtTime(m.at)} · {m.role === "assistant" ? persona.name.toUpperCase() : "YOU"}
                </div>
              </div>
            </div>
          ))
        )}

        {busy ? (
          <div className="typing" role="status" aria-live="polite">
            <span className="chat-orb" style={{ width: 26, height: 26 }} aria-hidden="true" />
            <span>processing in the gateway</span>
            <span className="dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>
        ) : null}

        {error && !busy ? (
          <div className="row between glass card" style={{ padding: 14, marginBottom: 14, borderColor: "color-mix(in srgb, var(--sol-error) 50%, transparent)" }}>
            <span className="badge error">error · {error}</span>
            <button
              type="button"
              className="btn small secondary"
              onClick={() => {
                if (lastPrompt.current) void send(lastPrompt.current);
              }}
            >
              <RefreshCw size={15} strokeWidth={1.8} /> Retry
            </button>
          </div>
        ) : null}
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          const text = draft;
          setDraft("");
          void send(text);
        }}
      >
        <label htmlFor={`${storageKey}-input`} className="screen-reader" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Message for {persona.name}
        </label>
        <textarea
          id={`${storageKey}-input`}
          ref={inputRef}
          value={draft}
          rows={1}
          placeholder={`Talk to ${persona.name}…`}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              const text = draft;
              setDraft("");
              void send(text);
            }
          }}
          aria-describedby={`${storageKey}-hint`}
        />
        <span id={`${storageKey}-hint`} className="screen-reader" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Enter sends, Shift+Enter adds a line break
        </span>
        <button type="submit" className="send" disabled={busy || !draft.trim()} aria-label="Send message">
          <Send size={18} strokeWidth={1.8} />
        </button>
      </form>
      <div className="chat-foot">
        <span className="mono">glm-5.3</span>
        <span>·</span>
        <span>Enter sends · Shift+Enter adds a line break</span>
        <span>·</span>
        <span>local history ({messages.length})</span>
      </div>
    </section>
  );
}
