/**
 * gatewaycard.tsx — the Settings side of the chat gateway opt-in contract.
 * One contract, two surfaces: this card and the chat session panel render
 * the same machine from os/gatewaybase.ts — same preference key
 * (chat.gatewaybase), same strict validator, same real reachability probe.
 * The natural state is disconnected: the endpoint is never inferred or
 * pre-filled, registering persists the opt-in and probes it, disconnecting
 * confirms inline (no window.confirm).
 */

/** Style: DevThink Terminal Atelier — campaign v3 r2-c: the gateway section
 * of the settings deck. The card box is gone: the section rides the flat
 * .r2c-sec grammar (mono index 03 + lowercase eyebrow + display title,
 * hairline above, air between groups), the field reuses the shared dtc-gw
 * input ring of the one gateway contract (the chat session panel and this
 * card are the same machine), the confirm step is a hairline-left warning
 * — no nested boxes — and every action carries the .press voice. */
import { type FormEvent, useEffect, useState } from "react";
import { GATEWAY_REQUIRED_COPY, gatewayStatusLabel, useGatewayRegistration } from "../os/gatewaybase.ts";

/**
 * GatewayCard — the settings section of the chat gateway. Drop it into
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
    <section id="gateway" className="settings-gw r2c-sec r2c-gw" aria-label="Chat gateway registration">
      <header className="r2c-sec__head">
        <span className="r2c-sec__index" aria-hidden="true">
          03
        </span>
        <div style={{ minWidth: 0 }}>
          <p className="r2c-sec__eyebrow">chat gateway · opt-in</p>
          <h2 className="r2c-sec__title">Chat gateway.</h2>
        </div>
        <p className="dtc-gw__pill" data-state={gateway.status} role="status" style={{ margin: "0 0 0 auto" }}>
          {gatewayStatusLabel(gateway.status)}
        </p>
      </header>
      {gateway.base ? <p className="r2c-gw__value">{gateway.base}</p> : null}

      {gateway.status === "disconnected" || testing ? (
        <form className="r2c-gw__form" onSubmit={submitRegister}>
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
          <button type="submit" className="r2c-btn r2c-btn--primary press" disabled={testing || !draft.trim()}>
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
            <small className="r2c-gw__error" role="alert">
              {gateway.formError}
            </small>
          ) : null}
        </form>
      ) : null}

      {gateway.status === "error" ? (
        <small className="r2c-gw__error" role="alert">
          {gateway.probeError ?? "The registered gateway did not answer."}
        </small>
      ) : null}

      {(gateway.status === "connected" || gateway.status === "error") && armed ? (
        <fieldset className="r2c-gw__confirm" aria-label="Confirm disconnect">
          <p>Disconnect this gateway? The assistant stops answering until you register one again.</p>
          <div className="r2c-gw__actions">
            <button
              type="button"
              className="r2c-btn r2c-btn--danger press"
              data-danger="true"
              onClick={() => {
                setArmed(false);
                void gateway.disconnect();
              }}
            >
              disconnect
            </button>
            <button type="button" className="r2c-btn press" onClick={() => setArmed(false)}>
              keep
            </button>
          </div>
        </fieldset>
      ) : null}

      {gateway.status === "connected" && !armed ? (
        <div className="r2c-gw__actions">
          <button type="button" className="r2c-btn press" onClick={() => setArmed(true)}>
            disconnect
          </button>
        </div>
      ) : null}

      {gateway.status === "error" && !armed ? (
        <div className="r2c-gw__actions">
          <button type="button" className="r2c-btn press" onClick={() => void gateway.retryProbe()}>
            test again
          </button>
          <button type="button" className="r2c-btn press" onClick={() => setArmed(true)}>
            disconnect
          </button>
        </div>
      ) : null}

      {!gateway.base && !testing ? <small>POST /v1/chat/completions once a gateway is registered.</small> : null}
    </section>
  );
}
