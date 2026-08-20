/** Style: DevThink Unified Terminal Workspace — the sparse command-first entry matches the interactive CLI shell. */
import { Play } from "lucide-react";
import { useState } from "react";

type EntryScreenProps = {
  invitationDetected: boolean;
  onCreate: (label: string, mode: "local" | "temporary") => void;
};

export function EntryScreen({ invitationDetected, onCreate }: EntryScreenProps) {
  const [label, setLabel] = useState("");
  return (
    <main className="terminal-entry">
      <div className="terminal-entry__topline"><span>devthink / local workspace</span><span>{invitationDetected ? "pairing invitation ready" : "no provider credential stored here"}</span></div>
      <form className="terminal-entry__center" onSubmit={(event) => { event.preventDefault(); onCreate(label, "local"); }}>
        <div className="terminal-entry__wordmark" aria-label="DevThink">DEVTHINK</div>
        <p>{invitationDetected ? "continue to consume the one-time local invitation" : "think locally. pair explicitly. keep credentials in the cli."}</p>
        <div className="terminal-entry__command"><span>›_</span><input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="think feature add dark mode…" maxLength={48} autoFocus /><button type="submit"><Play size={13} fill="currentColor" />run</button></div>
        <button type="button" className="terminal-entry__temporary" onClick={() => onCreate("", "temporary")}>open a temporary local workspace</button>
      </form>
      <footer className="terminal-entry__footer"><span>browser identity only</span><span>provider credentials remain in the DevThink CLI</span></footer>
    </main>
  );
}
