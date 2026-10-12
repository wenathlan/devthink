/**
 * aurachat.tsx — the heart of the os (the Aura pattern):
 * - dual vision: empty = intro + suggestions; with messages = list + composer
 * - bubbles per role + collapsible "Internal Cognition" (reasoning_content)
 * - useStoredState (localStorage + type-guard) per view, capped
 * - states: loading (pulsing orb), error (toast + retry), empty (chips)
 * - composer with 32px min-height, autoscroll, restored focus
 *
 * C2-02 pass: the surface keeps its behavior and gains the campaign
 * micro-feedback — the host app's identity accent (apps.ts via appMeta)
 * tints the orb, the bubbles, the composer focus ring and the send key;
 * no second chrome, no new motion.
 */

import { BrainCircuit, RefreshCw, Send, Trash2 } from "lucide-react";
import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { gatewayChat } from "../../osgateway";
import { appMeta, type Persona } from "./apps.ts";
import { pushOSEvent } from "./osevents.ts";
import { arrayOf, useStoredState, type Validator } from "./usestoredstate.ts";

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

/** the host app's identity accent, resolved from the catalog (fallback: the os ember). */
function hostAccent(appLabel: string): string {
  return appMeta(appLabel)?.accent ?? "var(--dt-orange)";
}

/**
 * the aura orb, copy-adapted to the host accent: the sol.css recipe
 * (highlight → primary → ember → depth) with the family accent
 * substituted at every stop, so argan's aura burns jade, cadria's rose.
 */
function orbStyle(accent: string): CSSProperties {
  return {
    background: `radial-gradient(circle at 32% 30%, color-mix(in srgb, ${accent} 24%, #fffbeb) 0 12%, ${accent} 45%, color-mix(in srgb, ${accent} 72%, #1c0d02) 78%, color-mix(in srgb, ${accent} 38%, #17191f) 100%)`,
    boxShadow: `0 0 22px color-mix(in srgb, ${accent} 55%, transparent)`,
  };
}

/** the bubble tint per role: the accent rides the surface, the ink stays readable. */
function bubbleStyle(role: "user" | "assistant", accent: string): CSSProperties {
  return role === "user"
    ? {
        background: `color-mix(in srgb, ${accent} 20%, var(--sol-bg-2))`,
        borderColor: `color-mix(in srgb, ${accent} 34%, transparent)`,
      }
    : {
        background: `color-mix(in srgb, ${accent} 9%, var(--sol-bg-2))`,
        borderColor: `color-mix(in srgb, ${accent} 16%, transparent)`,
      };
}

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
  const [focused, setFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const lastPrompt = useRef<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const accent = useMemo(() => hostAccent(appLabel), [appLabel]);

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
    [appLabel, busy, persona.system, setMessages],
  );

  const suggestions = useMemo(() => persona.suggestions, [persona]);

  const empty = messages.length === 0;

  return (
    <section
      className={cx("glass chat", className)}
      style={{ "--app-accent": accent } as CSSProperties}
      aria-label={`Chat ${persona.name} — ${appLabel}`}
    >
      <div className="chat-head">
        <span className="chat-orb" style={orbStyle(accent)} aria-hidden="true" />
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
                toast("Conversation cleared", {
                  description: `The ${appLabel} chat history was deleted from this device.`,
                });
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
            <span className="chat-orb" style={orbStyle(accent)} aria-hidden="true" />
            <p className="strong" style={{ marginBottom: 6 }}>
              {persona.intro}
            </p>
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
              <div className="bubble" style={bubbleStyle(m.role, accent)}>
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
            <span className="chat-orb" style={{ ...orbStyle(accent), width: 26, height: 26 }} aria-hidden="true" />
            <span>processing in the gateway</span>
            <span className="dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>
        ) : null}

        {error && !busy ? (
          <div
            className="row between glass card"
            style={{
              padding: 14,
              marginBottom: 14,
              borderColor: "color-mix(in srgb, var(--sol-error) 50%, transparent)",
            }}
          >
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
        style={{
          borderColor: focused ? `color-mix(in srgb, ${accent} 48%, transparent)` : undefined,
          transition: "border-color 150ms ease",
        }}
        onSubmit={(e) => {
          e.preventDefault();
          const text = draft;
          setDraft("");
          void send(text);
        }}
      >
        <label
          htmlFor={`${storageKey}-input`}
          className="screen-reader"
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
        >
          Message for {persona.name}
        </label>
        <textarea
          id={`${storageKey}-input`}
          ref={inputRef}
          value={draft}
          rows={1}
          placeholder={`Talk to ${persona.name}…`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
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
        <span
          id={`${storageKey}-hint`}
          className="screen-reader"
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
        >
          Enter sends, Shift+Enter adds a line break
        </span>
        <button
          type="submit"
          className="send"
          style={{ background: accent, color: "var(--sol-primary-ink)" }}
          disabled={busy || !draft.trim()}
          aria-label="Send message"
        >
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
