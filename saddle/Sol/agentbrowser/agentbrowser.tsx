/**
 * agentbrowser page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// Signal & Ledger: agent browser as an event trail, evidence and deterministic replay.
import { Activity, Camera, CheckCircle2, MousePointer2, Play, RotateCcw, ScrollText, Terminal } from "lucide-react";
import { PageShell } from "@/shell/Shell";
import { assetpath } from "../../paths";

const browserImage = assetpath("assets/saddle-browser-trace.webp");

export default function AgentBrowser() {
  return (
    <PageShell section="02 / 06" label="Agent Browser" title="Movement becomes evidence." intro="The browser agent captures a session as data: movement, click, scroll, key and the intent to replay everything later." image={browserImage} imageAlt="Cursor trace and evidence from a browser session">
      <section className="content-section split-content"><div><p className="eyebrow">CAPTURE / REPLAY</p><h2 className="section-title">The session is an artifact, not a black box.</h2></div><div className="prose-copy"><p>Brave capture, movement replay and session recording share the same layer. Each event is stored with relative time, CSS px coordinates, target and seed. Replay reruns the sequence at configurable speed.</p><p>For the operator, this means an auditable trail: every click can point to a screenshot, token or evidence video.</p></div></section>
      <section className="content-section browser-grid"><div className="session-console"><div className="console-head"><span><Terminal size={14}/> SESSION / sess_01J9XEXAMPLE</span><span className="console-pass"><CheckCircle2 size={14}/> PASSED</span></div><div className="console-rows">{[{icon:MousePointer2,label:"move",value:"x 312 / y 480",time:"00:00:12.4"},{icon:MousePointer2,label:"click",value:"#checkbox",time:"00:03:40.1"},{icon:ScrollText,label:"scroll",value:"dy -120 / settle",time:"00:05:40.0"},{icon:Activity,label:"metrics",value:"1284 events / 201s",time:"00:06:12.0"}].map((event)=>{const Icon=event.icon;return <div className="console-row" key={event.label}><Icon size={16}/><span className="console-time">{event.time}</span><strong>{event.label}</strong><span>{event.value}</span></div>})}</div><div className="console-footer"><span>seed / session-42</span><span>browser / brave</span></div></div><div className="browser-principles"><div className="principle-card"><Camera size={19}/><div><strong>DOM + vision</strong><span>Hybrid capture is the baseline.</span></div></div><div className="principle-card"><RotateCcw size={19}/><div><strong>Deterministic replay</strong><span>Same events, configurable speed.</span></div></div><div className="principle-card"><Play size={19}/><div><strong>Evidence first</strong><span>Screenshot, token, video.</span></div></div></div></section>
      <section className="content-section"><div className="content-section-heading"><p className="eyebrow">SESSION JSON / V1</p><span className="mono-label">docs/logs/&lt;session&gt;.json</span></div><pre className="code-block"><code>{`{\n  "session": { "id": "sess_...", "status": "passed" },\n  "events": [ "move", "click", "scroll", "key" ],\n  "metrics": { "eventCount": 1284, "durationMs": 201000 }\n}`}</code></pre></section>
    </PageShell>
  );
}
