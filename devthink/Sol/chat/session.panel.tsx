/**
 * session.panel.tsx — the right session panel (~320px), collapsible with a
 * spring transform (cubic-bezier(.2,1.2,.4,1)): the active model, the live
 * turn count, the local persistence readout, the active tool flags, the
 * configured gateway endpoint and quick links into the existing theme
 * pages. Stays mounted so the open/close transition runs both ways; closed
 * state is inert and visually hidden.
 */
import { Link } from "wouter";
import { PanelRightClose } from "lucide-react";
import { useEffect, useState } from "react";
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
 * @param gatewaybase the configured gateway base (empty = same origin).
 * @param onGatewaybase commits a normalized endpoint value.
 */
export function SessionPanel({
  open,
  onClose,
  model,
  turnCount,
  sessionCount,
  tools,
  gatewaybase,
  onGatewaybase,
}: {
  open: boolean;
  onClose: () => void;
  model: string;
  turnCount: number;
  sessionCount: number;
  tools: ToolId[];
  gatewaybase: string;
  onGatewaybase: (value: string) => void;
}) {
  const toolLabel = tools.length > 0 ? CHAT_TOOLS.filter((t) => tools.includes(t.id)).map((t) => t.label).join(" · ") : "none";
  /* local draft so the field only commits normalized values on submit */
  const [endpointDraft, setEndpointDraft] = useState(gatewaybase);
  useEffect(() => {
    setEndpointDraft(gatewaybase);
  }, [gatewaybase]);

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
        <p className="dtc-session__label">Gateway endpoint</p>
        <form
          className="dtc-endpoint"
          onSubmit={(event) => {
            event.preventDefault();
            onGatewaybase(endpointDraft);
          }}
        >
          <input
            type="url"
            value={endpointDraft}
            onChange={(event) => setEndpointDraft(event.target.value)}
            placeholder="same origin (default)"
            aria-label="Gateway endpoint base url"
            spellCheck={false}
            tabIndex={open ? 0 : -1}
          />
          <button type="submit" className="dtc-tb-btn" aria-label="Save gateway endpoint" title="Save endpoint" tabIndex={open ? 0 : -1}>
            Save
          </button>
        </form>
        <p className="dtc-session__hint">
          {gatewaybase === "" ? "talking to the same origin" : gatewaybase}
        </p>
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
