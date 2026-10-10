/**
 * sessionpanel.tsx — the right session panel (~320px), a floating acrylic
 * sheet (the start-menu recipe) that the caller mounts on open and unmounts
 * once the 200ms Windows slide-cum-fade exit settles: the active model, the
 * live turn count, the local persistence readout, the active tool flags, the
 * explicit gateway opt-in block and quick links into the existing theme
 * pages. The gateway block is the opt-in contract of the chat (shared with
 * the settings page through os/gatewaybase.ts): the natural state is
 * disconnected, the endpoint is never inferred or pre-filled, registering
 * persists the preference and probes the endpoint for real, and
 * disconnecting confirms inline — no window.confirm. While mounted the
 * closed state is inert and visually hidden (data-open), so the exit
 * transition runs both ways.
 */

import { PanelRightClose } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Link } from "wouter";
import { GATEWAY_REQUIRED_COPY, type GatewayRegistration, gatewayStatusLabel } from "../os/gatewaybase.ts";
import { CHAT_NAV } from "./sidebar.tsx";
import { CHAT_TOOLS, type ToolId } from "./state.ts";

/**
 * SessionPanel — the inspector of the current conversation.
 *
 * @param open whether the panel is visible (drives the slide-cum-fade).
 * @param onClose collapses the panel.
 * @param model the gateway model id.
 * @param turnCount turns in the active conversation.
 * @param sessionCount conversations persisted on this device.
 * @param tools the tool flags currently on.
 * @param gateway the shared opt-in machine (base, status, register/disconnect).
 */
export function SessionPanel({
  open,
  onClose,
  model,
  turnCount,
  sessionCount,
  tools,
  gateway,
}: {
  open: boolean;
  onClose: () => void;
  model: string;
  turnCount: number;
  sessionCount: number;
  tools: ToolId[];
  gateway: GatewayRegistration;
}) {
  const toolLabel =
    tools.length > 0
      ? CHAT_TOOLS.filter((t) => tools.includes(t.id))
          .map((t) => t.label)
          .join(" · ")
      : "none";
  const testing = gateway.status === "connecting";
  /* local draft so the field only commits validated values on submit; it
   * starts empty — the endpoint is never pre-filled by default */
  const [endpointDraft, setEndpointDraft] = useState(gateway.base);
  useEffect(() => {
    setEndpointDraft(gateway.base);
  }, [gateway.base]);
  const [confirmArmed, setConfirmArmed] = useState(false);

  const submitRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (testing) return;
    void gateway.register(endpointDraft);
  };

  return (
    <aside className="dtc-session" data-open={open ? "true" : "false"} aria-hidden={!open} aria-label="Session panel">
      <div className="dtc-session__head">
        <h2>Session</h2>
        <button
          type="button"
          className="dtc-tb-btn"
          onClick={onClose}
          aria-label="Close session panel"
          title="Close panel"
          tabIndex={open ? 0 : -1}
        >
          <PanelRightClose size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      <section className="dtc-session__sec">
        <p className="dtc-session__label">Context</p>
        <div className="dtc-modelcard">
          <strong>{model}</strong>
          <small>
            {gateway.base ? "registered gateway · openai contract" : "gateway not registered · openai contract"}
          </small>
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

      <section className="dtc-session__sec dtc-gw" aria-label="Gateway registration">
        <p className="dtc-session__label">Gateway</p>
        <p className="dtc-gw__pill" data-state={gateway.status} role="status">
          {gatewayStatusLabel(gateway.status)}
        </p>

        {gateway.base ? <p className="dtc-gw__endpoint">{gateway.base}</p> : null}

        {gateway.status === "disconnected" || testing ? (
          <>
            {gateway.status === "disconnected" ? <p className="dtc-gw__hint">{GATEWAY_REQUIRED_COPY}</p> : null}
            <form className="dtc-gw__form" onSubmit={submitRegister}>
              <input
                type="url"
                className="dtc-gw__input"
                value={endpointDraft}
                onChange={(event) => {
                  setEndpointDraft(event.target.value);
                  if (gateway.formError) gateway.clearFormError();
                }}
                placeholder="https://gateway.example.com"
                aria-label="Gateway endpoint base url"
                spellCheck={false}
                autoComplete="off"
                disabled={testing}
                tabIndex={open ? 0 : -1}
              />
              <button
                type="submit"
                className="dtc-gw__btn"
                disabled={testing || !endpointDraft.trim()}
                tabIndex={open ? 0 : -1}
              >
                {testing ? (
                  <>
                    <i className="dtc-gw__spinner" aria-hidden="true" />
                    Testing…
                  </>
                ) : (
                  "Register gateway"
                )}
              </button>
            </form>
            {gateway.formError ? (
              <p className="dtc-gw__formerror" role="alert">
                {gateway.formError}
              </p>
            ) : null}
            {testing ? <p className="dtc-gw__hint">Registering and probing the endpoint…</p> : null}
          </>
        ) : null}

        {gateway.status === "error" ? (
          <p className="dtc-gw__error" role="alert">
            {gateway.probeError ?? "The registered gateway did not answer."}
          </p>
        ) : null}

        {(gateway.status === "connected" || gateway.status === "error") && confirmArmed ? (
          <fieldset className="dtc-gw__confirm" aria-label="Confirm disconnect">
            <p>Disconnect this gateway? The assistant stops answering until you register one again.</p>
            <div className="dtc-gw__actions">
              <button
                type="button"
                className="dtc-gw__btn dtc-gw__btn--danger"
                onClick={() => {
                  setConfirmArmed(false);
                  void gateway.disconnect();
                }}
                tabIndex={open ? 0 : -1}
              >
                Disconnect
              </button>
              <button
                type="button"
                className="dtc-gw__btn"
                onClick={() => setConfirmArmed(false)}
                tabIndex={open ? 0 : -1}
              >
                Keep
              </button>
            </div>
          </fieldset>
        ) : null}

        {gateway.status === "connected" && !confirmArmed ? (
          <div className="dtc-gw__actions">
            <button
              type="button"
              className="dtc-gw__btn"
              onClick={() => setConfirmArmed(true)}
              tabIndex={open ? 0 : -1}
            >
              Disconnect
            </button>
          </div>
        ) : null}

        {gateway.status === "error" && !confirmArmed ? (
          <div className="dtc-gw__actions">
            <button
              type="button"
              className="dtc-gw__btn"
              onClick={() => void gateway.retryProbe()}
              tabIndex={open ? 0 : -1}
            >
              Test again
            </button>
            <button
              type="button"
              className="dtc-gw__btn"
              onClick={() => setConfirmArmed(true)}
              tabIndex={open ? 0 : -1}
            >
              Disconnect
            </button>
          </div>
        ) : null}
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
