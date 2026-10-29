/**
 * gatewaycard.tsx — the settings side of the chat gateway opt-in contract.
 * One contract, two surfaces: this card and the chat session panel render
 * the same machine from gatewaybase.ts — same preference key
 * (chat.gatewaybase), same strict validator, same real reachability probe.
 * The natural state is disconnected: the endpoint is never inferred or
 * pre-filled, registering persists the opt-in and probes it, disconnecting
 * confirms inline (no window.confirm). Loose component of the settings
 * page, riding the dtw kit.
 */

import {PlugConnectedRegular} from "@fluentui/react-icons";
import { type FormEvent, useEffect, useState } from "react";
import { GATEWAY_REQUIRED_COPY, gatewayStatusLabel, useGatewayRegistration } from "../../gateway.ts";

/** GatewayCard — the settings section of the chat gateway. */
export function GatewayCard() {
  const gateway = useGatewayRegistration();
  const [draft, setDraft] = useState("");
  const [armed, setArmed] = useState(false);
  const testing = gateway.status === "connecting";

  /* the field mirrors the registration: cleared on disconnect, showing the
   * tested endpoint while connecting — never pre-filled by default */
  useEffect(() => {
    setDraft(gateway.base);
  }, [gateway.base]);

  const submitRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (testing) return;
    void gateway.register(draft);
  };

  return (
    <section className="dtw-card" aria-label="Chat service connection">
      <h2 className="dtw-cardtitle">
        <PlugConnectedRegular fontSize={15} aria-hidden="true" />
        Chat service
        <span className="dtw-settings__pill" data-state={gateway.status} role="status">
          {gatewayStatusLabel(gateway.status)}
        </span>
      </h2>
      {gateway.base ? <p className="dtw-settings__base">{gateway.base}</p> : null}

      {gateway.status === "disconnected" || testing ? (
        <form className="dtw-settings__form" onSubmit={submitRegister}>
          {gateway.status === "disconnected" ? <small>{GATEWAY_REQUIRED_COPY}</small> : null}
          <input
            className="dtc-gw__input"
            type="url"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              if (gateway.formError) gateway.clearFormError();
            }}
            placeholder="https://chat.example.com"
            aria-label="Service address"
            spellCheck={false}
            autoComplete="off"
            disabled={testing}
          />
          <button type="submit" className="dtw-btn dtw-btn--primary" disabled={testing || !draft.trim()}>
            {testing ? "Testing" : "Connect service"}
          </button>
          {gateway.formError ? (
            <small className="dtw-settings__error" role="alert">
              {gateway.formError}
            </small>
          ) : null}
        </form>
      ) : null}

      {gateway.status === "error" ? (
        <small className="dtw-settings__error" role="alert">
          {gateway.probeError ?? "The connected service did not answer."}
        </small>
      ) : null}

      {(gateway.status === "connected" || gateway.status === "error") && armed ? (
        <fieldset className="dtw-settings__confirm" aria-label="Confirm disconnect">
          <p>Disconnect this service? The assistant stops answering until you connect one again.</p>
          <div className="dtw-settings__actions">
            <button
              type="button"
              className="dtw-btn dtw-btn--danger"
              onClick={() => {
                setArmed(false);
                void gateway.disconnect();
              }}
            >
              Disconnect
            </button>
            <button type="button" className="dtw-btn" onClick={() => setArmed(false)}>
              Keep
            </button>
          </div>
        </fieldset>
      ) : null}

      {gateway.status === "connected" && !armed ? (
        <div className="dtw-settings__actions">
          <button type="button" className="dtw-btn" onClick={() => setArmed(true)}>
            Disconnect
          </button>
        </div>
      ) : null}

      {gateway.status === "error" && !armed ? (
        <div className="dtw-settings__actions">
          <button type="button" className="dtw-btn" onClick={() => void gateway.retryProbe()}>
            Test again
          </button>
          <button type="button" className="dtw-btn" onClick={() => setArmed(true)}>
            Disconnect
          </button>
        </div>
      ) : null}

      {!gateway.base && !testing ? <small>The assistant answers through this service once it is connected.</small> : null}
    </section>
  );
}
