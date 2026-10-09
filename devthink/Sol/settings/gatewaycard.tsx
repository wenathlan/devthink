/**
 * gatewaycard.tsx — the Settings side of the chat gateway opt-in contract.
 * One contract, two surfaces: this card and the chat session panel render
 * the same machine from os/gatewaybase.ts — same preference key
 * (chat.gatewaybase), same strict validator, same real reachability probe.
 * The natural state is disconnected: the endpoint is never inferred or
 * pre-filled, registering persists the opt-in and probes it, disconnecting
 * confirms inline (no window.confirm).
 */

/** Style: DevThink Terminal Atelier — the C1 settings rhythm makes this the
 * DOMINANT card of its band (flex 3:1 over the support card beside it): 8px
 * corners, var(--dt-edge) hairline, tabular numerals and the lowercase mono
 * eyebrow; the field reuses the shared dtc-gw input ring of the one gateway
 * contract (the chat session panel and this card are the same machine). */
import { Plug } from "lucide-react";
import { type CSSProperties, type FormEvent, useEffect, useState } from "react";
import { GATEWAY_REQUIRED_COPY, gatewayStatusLabel, useGatewayRegistration } from "../os/gatewaybase";

const cardStyle: CSSProperties = {
  flex: "3 1 400px",
  minWidth: 0,
  borderRadius: 8,
  borderColor: "var(--dt-edge)",
  padding: 20,
  fontVariantNumeric: "tabular-nums",
};
const eyebrowStyle: CSSProperties = {
  color: "var(--dt-muted)",
  fontSize: 10,
  letterSpacing: ".08em",
  textTransform: "none",
};

/**
 * GatewayCard — the settings-grid card of the chat gateway. Drop it into
 * either settings view (paired or browser-local): the machine is
 * self-contained and persists through the browser preference store.
 */
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
    <section className="settings-gw" style={cardStyle} aria-label="Chat gateway registration">
      <Plug size={18} aria-hidden="true" />
      <span style={eyebrowStyle}>chat gateway · opt-in</span>
      <p className="dtc-gw__pill" data-state={gateway.status} role="status">
        {gatewayStatusLabel(gateway.status)}
      </p>
      {gateway.base ? <p className="settings-gw__value">{gateway.base}</p> : null}

      {gateway.status === "disconnected" || testing ? (
        <form className="settings-gw__form" onSubmit={submitRegister}>
          {gateway.status === "disconnected" ? <small>{GATEWAY_REQUIRED_COPY}</small> : null}
          <input
            className="dtc-gw__input"
            type="url"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              if (gateway.formError) gateway.clearFormError();
            }}
            placeholder="https://gateway.example.com"
            aria-label="Gateway endpoint base url"
            spellCheck={false}
            autoComplete="off"
            disabled={testing}
          />
          <button type="submit" disabled={testing || !draft.trim()}>
            {testing ? (
              <>
                <i className="dtc-gw__spinner" aria-hidden="true" />
                testing…
              </>
            ) : (
              "register gateway"
            )}
          </button>
          {gateway.formError ? (
            <small className="settings-gw__error" role="alert">
              {gateway.formError}
            </small>
          ) : null}
        </form>
      ) : null}

      {gateway.status === "error" ? (
        <small className="settings-gw__error" role="alert">
          {gateway.probeError ?? "The registered gateway did not answer."}
        </small>
      ) : null}

      {(gateway.status === "connected" || gateway.status === "error") && armed ? (
        <fieldset className="settings-gw__confirm" aria-label="Confirm disconnect">
          <p>Disconnect this gateway? The assistant stops answering until you register one again.</p>
          <div className="settings-gw__actions">
            <button
              type="button"
              data-danger="true"
              onClick={() => {
                setArmed(false);
                void gateway.disconnect();
              }}
            >
              disconnect
            </button>
            <button type="button" onClick={() => setArmed(false)}>
              keep
            </button>
          </div>
        </fieldset>
      ) : null}

      {gateway.status === "connected" && !armed ? (
        <div className="settings-gw__actions">
          <button type="button" onClick={() => setArmed(true)}>
            disconnect
          </button>
        </div>
      ) : null}

      {gateway.status === "error" && !armed ? (
        <div className="settings-gw__actions">
          <button type="button" onClick={() => void gateway.retryProbe()}>
            test again
          </button>
          <button type="button" onClick={() => setArmed(true)}>
            disconnect
          </button>
        </div>
      ) : null}

      {!gateway.base && !testing ? <small>POST /v1/chat/completions once a gateway is registered.</small> : null}
    </section>
  );
}
