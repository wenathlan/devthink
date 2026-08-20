/** Design: DevThink v1.1.15 — canonical ANSI identity as background, one centered wordmark and one paired local intention. */
import { ArrowUp } from "lucide-react";
import { useState } from "react";

type EntryScreenProps = {
  invitationDetected: boolean;
  paired: boolean;
  userId?: string;
  onCreate: (label: string) => void;
};

/** Canonical ANSI mark transcribed from the DevThink terminal identity. */
const canonicalMark = String.raw`
                                                    +
                                                    +
                                                   -+
                                                   ++
                                                   ++
                                                  +++
                                                ++++ -
                                              +++++++++
                                          +-+++++++++++++--
                                        --++++++-++++++++++++
                                     +++++++-+   +++  +--++++++-
                                  -+++++++-+     +++     -+-+++++++
                               ++++++++++       -+++        --++++++++
                            ++++++++-+          ++++           --+++++++-
                         ++++++++++             ++++              --+++++++-
                      ---++++++-               -++++                 -++++++--+
                   ++++++++--                  +++++                    ++++++++--
                +--+++++--                     +++++                       +++++++---
              ++++++++-                        +++++                          +-+++++++
             -+++++--                         -++++-                            --++++++
             -+++++-                          +++++-                             +++++++
             -++++++                         -+++++-                             +++++++
             -++++++                         ++++++-                             +++++++
             -++++++                         +++++++-                            +++++++
             -++++++                         ++++++++-                           +++++++
             -++++++                        -++++++++++-+                        +++++++
             -++++++                        -+++++++++++++-                      +++++++
             -++++++                        -+++++++++++++++++                   +++++++
             -++++++                       -++++++++++++++++++++                 +++++++
             -++++++                       -++++++++++++++++++++++               +++++++
             -++++++                      -+++++++++++++++++++++++++-            +++++++
             -++++++                    +++++++++++++++++-+--++++++++--          +++++++
             -++++++                 +++++++++++++++           -+++++++++        +++++++
             -++++++              +++++++++++-++                  --++++++-+      +-++++
             -++++++           ++++++++++-+-                         +--++++--      --++
             -++++++       +--++++++++++                                ---++++-+     +-
             -++++++    ++-++++++++                                        ++++++++
             -++++++ -+++++-+--                                                +-++-+
             -+++++++++++++                                                      -++++++
             -++++++++                                                          +-+++-+++-
           -+++++++++++                                                       ++++++++- +---+
        --++-+  -++++++-++                                                 ---++++++++     +-++
     ++++          +-+++++++                                             -++++++-+             ++
  -++                 ++++++++--                                     ++++++++-+-                  +
                        +-++++++-+                                 --++++++++
                           ++-+++++++                           ++++++++-+
                              +-++++++++                     --++++++++
                                 ++++++++++               +--++++++-
                                    --+++++++-         ++++++++++
                                       -+++++++-++++--++++++++
                                          +-++++++++++++++-
                                             --++++++++-
                                                +-++-`;

export function EntryScreen({ invitationDetected, paired, userId, onCreate }: EntryScreenProps) {
  const [label, setLabel] = useState("");
  const canOpen = Boolean(label.trim());

  return (
    <main className="terminal-entry-screen">
      <div className="terminal-entry-screen__grain" aria-hidden="true" />
      <header className="entry-nav">
        <div className="entry-nav__state"><i aria-hidden="true" />{paired ? `paired as ${userId || "local user"}` : "pair local CLI to sync"}</div>
      </header>

      <div className="entry-ansi" aria-hidden="true"><pre>{canonicalMark}</pre></div>

      <form className="entry-hero" onSubmit={(event) => { event.preventDefault(); if (canOpen) onCreate(label.trim()); }}>
        <p className="entry-hero__eyebrow">a local place to think through the work</p>
        <h1>DEVTHINK</h1>
        <p className="entry-hero__copy">Begin with one intention. Pair the local CLI to use the same person, sessions, tabs and preferences in this browser.</p>
        {invitationDetected && <p className="entry-hero__invitation">A one-time local pairing invitation is ready for this browser.</p>}
        <label className="entry-command">
          <span className="entry-command__prompt" aria-hidden="true">›_</span>
          <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Ask anything…" maxLength={160} autoFocus aria-label="Primeiro comando DevThink" />
          <kbd>enter</kbd>
          <button type="submit" disabled={!canOpen}><span>open workspace</span><ArrowUp size={14} /></button>
        </label>
        <div className="entry-suggestions" aria-label="Sugestões locais"><button type="button" onClick={() => setLabel("Map the local workspace")}>map the workspace</button><button type="button" onClick={() => setLabel("Review provider readiness")}>review providers</button><button type="button" onClick={() => setLabel("Continue the active session")}>continue session</button></div>
        <button type="button" className="entry-hero__quiet" onClick={() => onCreate("")}>open an unpaired local preview <span aria-hidden="true">→</span></button>
      </form>

      <footer className="entry-footer"><span>provider credentials never enter the browser</span><span>{paired ? "shared local identity" : "pairing required for shared state"} · tab to navigate · ⌘K commands</span></footer>
    </main>
  );
}
