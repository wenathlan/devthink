/** Style: DevThink Terminal Atelier — the conversation canvas uses editorial spacing, concrete streaming state and warm technical contrast. */
import { ArrowUp, AtSign, Command, Paperclip, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FormEvent } from "react";
import type { DevThinkMessage, DevThinkProvider } from "./devthink-types";

type ChatCanvasProps = {
  provider: DevThinkProvider;
  routeLabel: string;
  messages: DevThinkMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: (event: FormEvent) => void;
  onCommand: () => void;
};

export function ChatCanvas({ provider, routeLabel, messages, draft, onDraftChange, onSend, onCommand }: ChatCanvasProps) {
  return (
    <main className="chat-canvas">
      <div className="chat-canvas__atmosphere" aria-hidden="true" />
      <div className="chat-canvas__topline">
        <div className="breadcrumb"><span>workspace</span><i>/</i><strong>{routeLabel}</strong></div>
        <div className="stream-state"><span className="stream-state__pulse" /><span>stream protocol ready</span></div>
      </div>
      <section className="chat-canvas__thread" aria-label="Conversa ativa">
        <div className="conversation-intro">
          <div className="conversation-intro__copy">
            <p className="eyebrow">Active route</p>
            <h1>Build with the route in view.</h1>
            <p>DevThink keeps provider identity, normalized stream events and local session context inside one deliberate workspace.</p>
          </div>
          <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" alt="Abstract circuit board for the DevThink workbench" />
        </div>
        <div className="event-strip">
          <div><span>provider</span><strong>{provider.label}</strong></div>
          <div><span>model</span><strong>{provider.model}</strong></div>
          <div><span>protocol</span><strong>{provider.protocol}</strong></div>
          <div><span>route</span><strong>local · healthy</strong></div>
        </div>
        <div className="message-stack">
          {messages.map((message) => (
            <article key={message.id} className={`message-card message-card--${message.role}`}>
              <div className="message-card__rail" />
              <div className="message-card__header">
                <div><span className="message-card__role">{message.role === "assistant" ? "devthink" : message.role}</span><h2>{message.title}</h2></div>
                <time>{message.time}</time>
              </div>
              <p>{message.body}</p>
              {message.role === "assistant" && <div className="message-card__stream"><span className="stream-cursor" /> normalized response available</div>}
            </article>
          ))}
        </div>
      </section>
      <form className="composer" onSubmit={onSend}>
        <div className="composer__meta"><span><span className="composer__live-dot" /> session ready</span><span>⌘ Enter to send</span></div>
        <div className="composer__row">
          <button type="button" className="composer__tool" onClick={() => onCommand()} aria-label="Abrir command palette"><Command size={17} /></button>
          <textarea value={draft} onChange={(event) => onDraftChange(event.target.value)} placeholder="Ask DevThink to map a route, inspect a stream or plan a change…" rows={1} />
          <button type="button" className="composer__tool" aria-label="Anexar arquivo" title="Anexos serão enviados pelo Gateway local"><Paperclip size={17} /></button>
          <Button type="submit" className="composer__send" disabled={!draft.trim()} aria-label="Enviar mensagem"><ArrowUp size={18} strokeWidth={2.1} /></Button>
        </div>
        <div className="composer__footer"><span><AtSign size={13} /> use @file for scoped context</span><span><Square size={10} fill="currentColor" /> provider events remain local</span></div>
      </form>
    </main>
  );
}
