/**
 * session.panel.tsx — the right session panel (~320px), collapsible with a
 * spring transform (cubic-bezier(.2,1.2,.4,1)): the active model, the live
 * turn count, the local persistence readout, the active tool flags and
 * quick links into the existing theme pages. Stays mounted so the open/close
 * transition runs both ways; closed state is inert and visually hidden.
 */
import { Link } from "wouter";
import { PanelRightClose } from "lucide-react";
import { CHAT_NAV } from "./sidebar";
import { CHAT_TOOLS, type ToolId } from "./state";

/**
 * SessionPanel — the inspector of the current conversation.
 *
 * @param open whether the panel is expanded (transform-driven).
 * @param onClose collapses the panel.
 * @param model the gateway model id.
 * @param turnCount turns in the active conversation.
 * @param sessionCount conversations persisted on this device.
 * @param tools the tool flags currently on.
 */
export function SessionPanel({
  open,
  onClose,
  model,
  turnCount,
  sessionCount,
  tools,
}: {
  open: boolean;
  onClose: () => void;
  model: string;
  turnCount: number;
  sessionCount: number;
  tools: ToolId[];
}) {
  const toolLabel = tools.length > 0 ? CHAT_TOOLS.filter((t) => tools.includes(t.id)).map((t) => t.label).join(" · ") : "none";

  return (
    <aside
      className="dtc-session"
      data-open={open ? "true" : "false"}
      aria-hidden={!open}
      aria-label="Session panel"
    >
      <div className="dtc-session__head">
        <h2>Session</h2>
        <button type="button" className="dtc-tb-btn" onClick={onClose} aria-label="Close session panel" title="Close panel" tabIndex={open ? 0 : -1}>
          <PanelRightClose size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      <section className="dtc-session__sec">
        <p className="dtc-session__label">Context</p>
        <div className="dtc-modelcard">
          <strong>{model}</strong>
          <small>local gateway · openai contract</small>
        </div>
        <dl className="dtc-readouts">
          <div className="dtc-readout">
            <dt>Turns</dt>
            <dd>{turnCount}</dd>
          </div>
          <div className="dtc-readout">
            <dt>Conversations</dt>
            <dd>{sessionCount}</dd>
          </div>
          <div className="dtc-readout">
            <dt>Persistence</dt>
            <dd>local</dd>
          </div>
          <div className="dtc-readout">
            <dt>Tools</dt>
            <dd>{toolLabel}</dd>
          </div>
        </dl>
      </section>

      <section className="dtc-session__sec">
        <p className="dtc-session__label">Quick links</p>
        <nav className="dtc-session__links" aria-label="Theme pages">
          {CHAT_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="dtc-session__link" tabIndex={open ? 0 : -1}>
                <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </section>

      <p className="dtc-session__foot">POST /v1/chat/completions · history stays in this browser</p>
    </aside>
  );
}
