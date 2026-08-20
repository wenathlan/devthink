/** Design: DevThink v1.1.10 — an original Rare UI, OpenCode and browser-inspired local command landing. */
import { ArrowUp, Sparkles } from "lucide-react";
import { useState } from "react";

type EntryScreenProps = {
  invitationDetected: boolean;
  onCreate: (label: string, mode: "local" | "temporary") => void;
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

export function EntryScreen({ invitationDetected, onCreate }: EntryScreenProps) {
  const [label, setLabel] = useState("");
  const canOpen = Boolean(label.trim());

  return (
    <main className="terminal-entry-screen">
      <div className="terminal-entry-screen__grain" aria-hidden="true" />
      <header className="entry-nav">
        <div className="entry-nav__brand"><span aria-hidden="true">✦</span>DEVTHINK</div>
        <div className="entry-nav__state"><i aria-hidden="true" />local-first workbench</div>
      </header>

      <div className="entry-ansi" aria-hidden="true"><pre>{canonicalMark}</pre></div>

      <form className="entry-hero" onSubmit={(event) => { event.preventDefault(); if (canOpen) onCreate(label.trim(), "local"); }}>
        <p className="entry-hero__eyebrow"><Sparkles size={13} /> a local place to think through the work</p>
        <h1>DEVTHINK</h1>
        <p className="entry-hero__copy">Begin with one intention. DevThink turns it into a local workspace with tabs, context and a command rail.</p>
        {invitationDetected && <p className="entry-hero__invitation">A one-time local pairing invitation is ready for this browser.</p>}
        <label className="entry-command">
          <span className="entry-command__prompt" aria-hidden="true">›_</span>
          <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Ask anything…" maxLength={160} autoFocus aria-label="Primeiro comando DevThink" />
          <kbd>enter</kbd>
          <button type="submit" disabled={!canOpen}><span>open workspace</span><ArrowUp size={14} /></button>
        </label>
        <button type="button" className="entry-hero__quiet" onClick={() => onCreate("", "temporary")}>continue without a first prompt <span aria-hidden="true">→</span></button>
      </form>

      <footer className="entry-footer"><span>provider credentials never enter the browser</span><span>local identity · tab to navigate · ⌘K commands</span></footer>
    </main>
  );
}
