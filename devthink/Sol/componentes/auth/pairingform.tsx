/**
 * pairingform.tsx — the cli sync-up disclosure of the sign-in face: the
 * gateway endpoint, the pair id and the 8-char access code of the
 * invitation, exactly the contract the settings panel speaks. The fields
 * are controlled by the anchor (the invitation params arrive as link
 * query params and consume themselves there); this component owns only
 * the rendering. Loose component of the auth page, riding the dtw-login
 * kit of sol.css.
 */
import { ArrowRightRegular } from "@fluentui/react-icons";
import type { PairingReadiness } from "../../../authgate.ts";

export interface PairingFormProps {
  /** the gateway endpoint of the visitor's local cli. */
  gateway: string;
  /** the pair id of the invitation. */
  pairingId: string;
  /** the 8-char access code (uppercased by the field itself). */
  code: string;
  /** the honest readiness verdict of the three fields. */
  readiness: PairingReadiness;
  /** the consume is running: the submit freezes while it lasts. */
  busy: boolean;
  onGatewayChange: (value: string) => void;
  onPairingIdChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  /** the sync up: consumes the invitation through the anchor's contract. */
  onConsume: () => void;
}

/** PairingForm — the cli pairing rows inside the sign-in options
 * disclosure: three wells in the same windows grammar the password well
 * speaks, the arrow submit riding the last one. */
export function PairingForm({
  gateway,
  pairingId,
  code,
  readiness,
  busy,
  onGatewayChange,
  onPairingIdChange,
  onCodeChange,
  onConsume,
}: PairingFormProps) {
  return (
    <form
      className="dtw-login__pairing"
      onSubmit={(event) => {
        event.preventDefault();
        onConsume();
      }}
    >
      <div className="dtw-login__row">
        <input
          value={gateway}
          onChange={(event) => onGatewayChange(event.target.value)}
          placeholder="http://127.0.0.1:8787"
          autoComplete="off"
          aria-label="Gateway endpoint"
          spellCheck={false}
        />
      </div>
      <div className="dtw-login__row">
        <input
          value={pairingId}
          onChange={(event) => onPairingIdChange(event.target.value)}
          placeholder="pair id"
          autoComplete="off"
          aria-label="Pairing id"
          spellCheck={false}
        />
      </div>
      <div className="dtw-login__row">
        <input
          value={code}
          onChange={(event) => onCodeChange(event.target.value.toUpperCase())}
          placeholder="8-char code"
          maxLength={8}
          autoComplete="one-time-code"
          aria-label="Access code"
        />
        <button type="submit" className="dtw-login__submit" disabled={busy} aria-label="Sync up with the cli">
          <ArrowRightRegular fontSize={16} aria-hidden="true" />
        </button>
      </div>
      <small className="dtw-login__hinttext">
        {readiness.ready
          ? "All fields present, the invitation can also arrive as a link"
          : `Still needed: ${readiness.missing.join(", ")}`}
      </small>
    </form>
  );
}
