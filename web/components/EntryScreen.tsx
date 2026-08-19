/** Style: DevThink Terminal Atelier — asymmetric first-visit entry that makes local ownership explicit before the workbench opens. */
import { ArrowRight, Command, Link2, ShieldCheck } from "lucide-react";
import { useState } from "react";

type EntryScreenProps = {
  invitationDetected: boolean;
  onCreate: (label: string, mode: "local" | "temporary") => void;
};

export function EntryScreen({ invitationDetected, onCreate }: EntryScreenProps) {
  const [label, setLabel] = useState("");
  return (
    <main className="entry-screen">
      <section className="entry-screen__signal" aria-hidden="true"><span /><span /><span /></section>
      <section className="entry-screen__panel">
        <div className="entry-screen__masthead"><Command size={18} /><span>devthink local entry</span></div>
        <p className="entry-screen__eyebrow">browser workspace · private by default</p>
        <h1>Open a workspace that stays in your hands.</h1>
        <p className="entry-screen__copy">Create a browser-local profile to organize this workbench. Provider credentials remain in the local DevThink CLI and are never requested here.</p>
        {invitationDetected && <div className="entry-screen__invite"><Link2 size={15} /><span>A one-time CLI invitation was detected. The workspace will pair automatically after entry.</span></div>}
        <label className="entry-screen__label">workspace name<input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="e.g. my local desk" maxLength={48} autoFocus /></label>
        <div className="entry-screen__actions">
          <button type="button" className="entry-screen__primary" onClick={() => onCreate(label, "local")}><span>create local profile</span><ArrowRight size={16} /></button>
          <button type="button" className="entry-screen__quiet" onClick={() => onCreate("", "temporary")}>continue temporarily</button>
        </div>
        <footer><ShieldCheck size={14} /><span>Stored only in this browser. No password, provider token or database secret is collected.</span></footer>
      </section>
      <aside className="entry-screen__ledger" aria-label="Entry flow">
        <span>01 · local profile</span><strong>browser identity</strong>
        <span>02 · cli invitation</span><strong>{invitationDetected ? "ready to consume" : "optional"}</strong>
        <span>03 · provider access</span><strong>kept in cli</strong>
      </aside>
    </main>
  );
}
