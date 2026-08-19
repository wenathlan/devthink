/** Style: DevThink Terminal Atelier — restrained local-control dock with automatic CLI invitations and manual setup behind an advanced disclosure. */
import { Link2, ShieldCheck, Unplug } from "lucide-react";
import { type FormEvent } from "react";

type PairingPanelProps = {
  gatewayUrl: string;
  pairingId: string;
  code: string;
  userId?: string;
  expiresAt?: number;
  paired: boolean;
  onGatewayChange: (value: string) => void;
  onPairingIdChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onRevoke: () => void;
};

export function PairingPanel({ gatewayUrl, pairingId, code, userId, expiresAt, paired, onGatewayChange, onPairingIdChange, onCodeChange, onSubmit, onRevoke }: PairingPanelProps) {
  const invitationDetected = Boolean(gatewayUrl && pairingId && code);
  return (
    <aside className={`pairing-dock ${paired ? "pairing-dock--paired" : ""}`} aria-label="Local DevThink pairing">
      <div className="pairing-dock__heading"><span>{paired ? <ShieldCheck size={14} /> : <Link2 size={14} />}</span><strong>{paired ? "local link active" : "pair local cli"}</strong></div>
      {paired ? (
        <div className="pairing-dock__active">
          <span>user {userId?.slice(0, 16) || "connected"}</span>
          <small>{expiresAt ? `expires ${new Date(expiresAt).toLocaleTimeString()}` : "short session"}</small>
          <button type="button" onClick={onRevoke}><Unplug size={13} />revoke</button>
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
    </aside>
  );
}
