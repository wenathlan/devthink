/** Style: DevThink Orbital Signal Room — a local-first entry console framed by original aperture geometry and command states. */
import { ArrowRight, Command, Link2, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { DevThinkLogo } from "./DevThinkLogo";
import { OrbitAperture } from "./OrbitAperture";

type EntryScreenProps = {
  invitationDetected: boolean;
  onCreate: (label: string, mode: "local" | "temporary") => void;
};

export function EntryScreen({ invitationDetected, onCreate }: EntryScreenProps) {
  const [label, setLabel] = useState("");
  return (
    <main className="entry-screen">
      <OrbitAperture />
      <section className="entry-screen__signal" aria-hidden="true"><span /><span /><span /></section>
      <header className="entry-screen__header"><DevThinkLogo /><span>local workspace protocol</span></header>
      <section className="entry-screen__panel">
        <div className="entry-screen__masthead"><Sparkles size={15} /><span>signal 01 · local entry</span></div>
        <p className="entry-screen__eyebrow">browser workspace / private by default</p>
        <h1>Route your thinking.<br />Keep the keys local.</h1>
        <p className="entry-screen__copy">Open a browser-local control surface for DevThink. Provider credentials remain in the local CLI; the workbench only receives the scope you explicitly pair.</p>
        {invitationDetected && <div className="entry-screen__invite"><Link2 size={15} /><span>A one-time CLI invitation was detected. The workspace will pair automatically after entry.</span></div>}
        <label className="entry-screen__label"><span><Command size={12} />workspace name</span><input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="e.g. my local desk" maxLength={48} autoFocus /></label>
        <div className="entry-screen__actions">
          <button type="button" className="entry-screen__primary" onClick={() => onCreate(label, "local")}><span>open local workspace</span><ArrowRight size={16} /></button>
          <button type="button" className="entry-screen__quiet" onClick={() => onCreate("", "temporary")}>continue temporarily</button>
        </div>
        <footer><ShieldCheck size={14} /><span>Stored only in this browser. No password, provider token or database secret is collected.</span></footer>
      </section>
      <aside className="entry-screen__ledger" aria-label="Entry flow">
        <p>workspace protocol</p>
        <span>01 / local profile</span><strong>browser identity</strong>
        <span>02 / cli invitation</span><strong>{invitationDetected ? "ready to consume" : "optional"}</strong>
        <span>03 / provider access</span><strong>kept in cli</strong>
      </aside>
    </main>
  );
}
