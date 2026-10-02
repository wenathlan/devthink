/**
 * architecture page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// Signal & Ledger: layered architecture, with the chain as the main narrative.
import { ArrowUpRight, Cpu, Database, GitBranch, Globe2, ShieldCheck } from "lucide-react";
import { PageShell } from "@/shell/Shell";
import { assetpath } from "../../paths";

const runtimeImage = assetpath("assets/saddle-runtime-map.webp");

export default function Architecture() {
  return (
    <PageShell section="01 / 06" label="Architecture" title="The machine is the chain." intro="Saddle treats repo, CI, pages and buckets as parts of one publishable machine — with every boundary exposed." image={runtimeImage} imageAlt="Visual map of a distributed execution chain">
      <section className="content-section split-content"><div><p className="eyebrow">THE OPERATING MODEL</p><h2 className="section-title">Everything is a file until the flag says otherwise.</h2></div><div className="prose-copy"><p>A repo holds persistent state. A runner takes the processor role. Pages exposes the result as a bus and CDN. The architecture does not try to erase the boundaries between these places; it turns the boundaries into an operational API.</p><p>The result is a VM that can be published as a package, triggered by a workflow and rehydrated from artifacts.</p></div></section>
      <section className="content-section"><div className="content-section-heading"><p className="eyebrow">LAYER MAP / 04 LAYERS</p><span className="mono-label">PATH /repo → /runner → /pages</span></div><div className="layer-stack">
        {[{icon: GitBranch, name:"Repository", sub:"persistent state", body:"docs/results/ and versioned artifacts that survive the execution cycle."},{icon: Cpu, name:"CI runner", sub:"virtual processor", body:"workflow_dispatch and repository_dispatch turn the forge into a function."},{icon: Database, name:"Memory bridge", sub:"storage as working set", body:"Buckets mount as VHD/FUSE or sync into tmpfs; VRAM stays VRAM."},{icon: Globe2, name:"Pages / CDN", sub:"shared surface", body:"The static surface observes, triggers and delivers results without living on the local machine."}].map((layer,index)=>{const Icon=layer.icon;return <div className="layer-row" key={layer.name}><span className="layer-index">0{index+1}</span><Icon size={20} strokeWidth={1.5}/><div className="layer-name"><strong>{layer.name}</strong><span>{layer.sub}</span></div><p>{layer.body}</p><ArrowUpRight size={16}/></div>})}
      </div></section>
      <section className="content-section"><div className="content-section-heading"><p className="eyebrow">PROVIDER CHAIN / FIRST FREE RUNNER WINS</p><span className="mono-label">fallback / explicit</span></div><div className="provider-grid">{["oracle-cloud","github-actions","huggingface","gitlab-ci","kaggle"].map((name,index)=><div className={`provider-cell ${index===0?"is-active":""}`} key={name}><span className="provider-index">0{index+1}</span><strong>{name}</strong><small>{index===0?"preferred":"fallback"}</small></div>)}</div></section>
      <section className="content-section architecture-note"><ShieldCheck size={21}/><div><p className="eyebrow">PHYSICAL LIMIT / DO NOT HIDE</p><p>Remote storage is not VRAM. The bridge is valid as VHD, cache or working set; physical bandwidth still governs the system.</p></div></section>
    </PageShell>
  );
}
