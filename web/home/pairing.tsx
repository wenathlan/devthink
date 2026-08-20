/** Style: DevThink Orbital Signal Room — local pairing is a compact connection beacon that expands only when the user needs it. */
import { Link2, ShieldCheck, Unplug } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

type PairingPanelProps = {
  gatewayUrl: string;
  pairingId: string;
  code: string;
  userId?: string;
  deviceId?: string;
  expiresAt?: number;
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

export function PairingPanel({ gatewayUrl, pairingId, code, userId, deviceId, expiresAt, paired, preferences, onPreferenceChange, onIdentityChange, onGatewayChange, onPairingIdChange, onCodeChange, onSubmit, onRevoke }: PairingPanelProps) {
  const invitationDetected = Boolean(gatewayUrl && pairingId && code);
  const [requestedUserId, setRequestedUserId] = useState(userId || "");
  useEffect(() => setRequestedUserId(userId || ""), [userId]);
  return (
    <aside className={`pairing-dock ${paired ? "pairing-dock--paired" : ""}`} aria-label="Local DevThink pairing">
      <details className="pairing-dock__surface" open={invitationDetected || paired}>
        <summary className="pairing-dock__heading"><span>{paired ? <ShieldCheck size={14} /> : <Link2 size={14} />}</span><strong>{paired ? "local link active" : "pair local cli"}</strong><i>{paired ? "connected" : "open"}</i></summary>
      {paired ? (
        <div className="pairing-dock__active">
          <span>user {userId?.slice(0, 16) || "connected"}</span>
          <small>device {deviceId?.slice(0, 16) || "local"}</small>
          <small>{expiresAt ? `expires ${new Date(expiresAt).toLocaleTimeString()}` : "short session"}</small>
          <button type="button" onClick={onRevoke}><Unplug size={13} />revoke</button>
          <label>public id<input value={requestedUserId} onChange={(event) => setRequestedUserId(event.target.value.toLowerCase())} minLength={10} maxLength={15} pattern="[a-z][a-z0-9]{9,14}" autoComplete="username" /></label>
          <button type="button" onClick={() => onIdentityChange(requestedUserId)}>save public id</button>
          <div className="pairing-dock__preferences">
            <label>theme<select value={preferences.theme} onChange={(event) => onPreferenceChange("theme", event.target.value)}><option value="dark">dark</option><option value="light">light</option></select></label>
            <label>rail<select value={preferences.railMode} onChange={(event) => onPreferenceChange("railMode", event.target.value)}><option value="always">always</option><option value="auto">auto</option><option value="off">off</option></select></label>
            <label>zoom<select value={preferences.interfaceZoom} onChange={(event) => onPreferenceChange("interfaceZoom", event.target.value)}><option value="90">90%</option><option value="100">100%</option><option value="110">110%</option><option value="120">120%</option></select></label>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          {invitationDetected ? <small>CLI invitation loaded. The connection is attempted automatically and can be retried here.</small> : <small>Create an invitation with <code>devthink pair create</code>, then open its generated link.</small>}
          <button type="submit">{invitationDetected ? "retry local connection" : "connect local workspace"}</button>
          <details className="pairing-dock__advanced"><summary>manual setup</summary><div>
            <label>gateway<input value={gatewayUrl} onChange={(event) => onGatewayChange(event.target.value)} placeholder="http://127.0.0.1:port" autoComplete="off" /></label>
            <label>pairing id<input value={pairingId} onChange={(event) => onPairingIdChange(event.target.value)} placeholder="pair_…" autoComplete="off" /></label>
            <label>one-time code<input value={code} onChange={(event) => onCodeChange(event.target.value.toUpperCase())} placeholder="ABCDEFGH" maxLength={8} autoComplete="one-time-code" /></label>
          </div></details>
        </form>
      )}
      </details>
    </aside>
  );
}
