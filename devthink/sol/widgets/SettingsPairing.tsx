/** Style: DevThink Orbital Signal Room — local pairing is a compact connection beacon that expands only when the user needs it. The C1 card chrome rides the beacon: 8px corners, var(--dt-edge) hairline, tabular numerals and the lowercase mono eyebrow header; the fields reuse the shared dtc-gw input ring. Every string the beacon renders rides the ui store (the uicopy accessor of uistore.ts — the db rows over the same-origin lane, the build seed answering offline); the zoom ladder and the cli command stay data. */
import {
  LinkRegular as Link2,
  ShieldRegular as ShieldCheck,
  PlugDisconnectedRegular as Unplug,
} from "@fluentui/react-icons";
import { type CSSProperties, type FormEvent, useEffect, useState } from "react";
import { uicopy, useUicopy } from "../../uistore.ts";

/** fills the {slot} holes of one ui copy row (an unknown slot stays loud). */
function uifill(key: string, slots: Record<string, string>): string {
  return uicopy(key).replace(/\{(\w+)\}/g, (hole, name: string) => slots[name] ?? hole);
}

const cardStyle: CSSProperties = {
  borderRadius: 8,
  borderColor: "var(--dt-edge)",
  padding: 16,
  fontVariantNumeric: "tabular-nums" };
const eyebrowStyle: CSSProperties = { fontSize: 10, letterSpacing: ".08em" };
const fieldClass = "dtc-gw__input";

type PairingPanelProps = {
  gatewayUrl: string;
  pairingId: string;
  code: string;
  userId?: string | undefined;
  deviceId?: string | undefined;
  expiresAt?: number | undefined;
  paired: boolean;
  preferences: { theme: "dark" | "light"; railMode: "always" | "auto" | "off"; interfaceZoom: string };
  onPreferenceChange: (key: "theme" | "railMode" | "interfaceZoom", value: string) => void;
  onIdentityChange: (userId: string) => void;
  onGatewayChange: (value: string) => void;
  onPairingIdChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onRevoke: () => void;
};

export function PairingPanel({
  gatewayUrl,
  pairingId,
  code,
  userId,
  deviceId,
  expiresAt,
  paired,
  preferences,
  onPreferenceChange,
  onIdentityChange,
  onGatewayChange,
  onPairingIdChange,
  onCodeChange,
  onSubmit,
  onRevoke }: PairingPanelProps) {
  useUicopy();
  const invitationDetected = Boolean(gatewayUrl && pairingId && code);
  const [requestedUserId, setRequestedUserId] = useState(userId || "");
  useEffect(() => setRequestedUserId(userId || ""), [userId]);
  return (
    <aside className={`pairing-dock ${paired ? "pairing-dock--paired" : ""}`} aria-label={uicopy("panel.pairing.aria")}>
      <details className="pairing-dock__surface" style={cardStyle} open={invitationDetected || paired}>
        <summary className="pairing-dock__heading">
          <span>{paired ? <ShieldCheck fontSize={14} /> : <Link2 fontSize={14} />}</span>
          <strong style={eyebrowStyle}>
            {paired ? uicopy("panel.pairing.head.active") : uicopy("panel.pairing.head.idle")}
          </strong>
          <i>{paired ? uicopy("panel.pairing.state.connected") : uicopy("panel.pairing.state.open")}</i>
        </summary>
        {paired ? (
          <div className="pairing-dock__active">
            <span>
              {uifill("panel.pairing.user", { id: userId?.slice(0, 16) || uicopy("panel.pairing.user.none") })}
            </span>
            <small>
              {uifill("panel.pairing.device", { id: deviceId?.slice(0, 16) || uicopy("panel.pairing.device.none") })}
            </small>
            <small>
              {expiresAt
                ? uifill("panel.pairing.expires", { time: new Date(expiresAt).toLocaleTimeString() })
                : uicopy("panel.pairing.expires.short")}
            </small>
            <button type="button" onClick={onRevoke}>
              <Unplug fontSize={13} />
              {uicopy("panel.pairing.revoke")}
            </button>
            <label>
              {uicopy("panel.pairing.publicid")}
              <input
                className={fieldClass}
                value={requestedUserId}
                onChange={(event) => setRequestedUserId(event.target.value.toLowerCase())}
                minLength={10}
                maxLength={15}
                pattern="[a-z][a-z0-9]{9,14}"
                autoComplete="username"
              />
            </label>
            <button type="button" onClick={() => onIdentityChange(requestedUserId)}>
              {uicopy("panel.pairing.publicid.save")}
            </button>
            <div className="pairing-dock__preferences">
              <label>
                {uicopy("panel.pairing.theme")}
                <select value={preferences.theme} onChange={(event) => onPreferenceChange("theme", event.target.value)}>
                  <option value="dark">{uicopy("panel.pairing.theme.dark")}</option>
                  <option value="light">{uicopy("panel.pairing.theme.light")}</option>
                </select>
              </label>
              <label>
                {uicopy("panel.pairing.rail")}
                <select
                  value={preferences.railMode}
                  onChange={(event) => onPreferenceChange("railMode", event.target.value)}
                >
                  <option value="always">{uicopy("panel.pairing.rail.always")}</option>
                  <option value="auto">{uicopy("panel.pairing.rail.auto")}</option>
                  <option value="off">{uicopy("panel.pairing.rail.off")}</option>
                </select>
              </label>
              <label>
                {uicopy("panel.pairing.zoom")}
                <select
                  value={preferences.interfaceZoom}
                  onChange={(event) => onPreferenceChange("interfaceZoom", event.target.value)}
                >
                  <option value="90">90%</option>
                  <option value="100">100%</option>
                  <option value="110">110%</option>
                  <option value="120">120%</option>
                </select>
              </label>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            {invitationDetected ? (
              <small>{uicopy("panel.pairing.invite.loaded")}</small>
            ) : (
              <small>
                {uicopy("panel.pairing.invite.hint").split("{command}").map((part, index, all) => (
                  <span key={index}>
                    {part}
                    {index < all.length - 1 ? <code>devthink pair create</code> : null}
                  </span>
                ))}
              </small>
            )}
            <button type="submit">
              {invitationDetected ? uicopy("panel.pairing.connect.retry") : uicopy("panel.pairing.connect.start")}
            </button>
            <details className="pairing-dock__advanced">
              <summary>{uicopy("panel.pairing.advanced")}</summary>
              <div>
                <label>
                  {uicopy("panel.pairing.gateway")}
                  <input
                    className={fieldClass}
                    value={gatewayUrl}
                    onChange={(event) => onGatewayChange(event.target.value)}
                    placeholder={uicopy("panel.pairing.gateway.ph")}
                    autoComplete="off"
                  />
                </label>
                <label>
                  {uicopy("panel.pairing.pairingid")}
                  <input
                    className={fieldClass}
                    value={pairingId}
                    onChange={(event) => onPairingIdChange(event.target.value)}
                    placeholder={uicopy("panel.pairing.pairingid.ph")}
                    autoComplete="off"
                  />
                </label>
                <label>
                  {uicopy("panel.pairing.code")}
                  <input
                    className={fieldClass}
                    value={code}
                    onChange={(event) => onCodeChange(event.target.value.toUpperCase())}
                    placeholder={uicopy("panel.pairing.code.ph")}
                    maxLength={8}
                    autoComplete="one-time-code"
                  />
                </label>
              </div>
            </details>
          </form>
        )}
      </details>
    </aside>
  );
}
