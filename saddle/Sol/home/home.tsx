/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// Signal & Ledger: home as the operational manifesto, with an asymmetric hero and a boot diagram.
import { ArrowDownRight, ArrowUpRight, Cable, Command, ExternalLink, Layers3, MoveRight, Package, RadioTower } from "lucide-react";
import { Link } from "wouter";
import MetricStrip from "./MetricStrip";
import RuntimeDiagram from "./RuntimeDiagram";
import { SaddleMark, SectionRail, SiteHeader } from "@/shell/Shell";
import { assetpath } from "../../paths";

export * from "./MetricStrip";
export * from "./RuntimeDiagram";

const heroImage = assetpath("assets/saddle-hero-bridge.webp");
const runtimeImage = assetpath("assets/saddle-runtime-map.webp");

const surfaces = [
  { index: "01", icon: Cable, title: "Agent Browser", body: "Capture and replay of human movement in reproducible sessions.", href: "/agent-browser" },
  { index: "02", icon: Layers3, title: "Computational memory", body: "Repos and buckets enter the process without pretending latency does not exist.", href: "/compute" },
  { index: "03", icon: Package, title: "Package surfaces", body: "The same machine can appear as a CLI, library, extension or app.", href: "/integrations" },
];

export default function Home() {
  return (
    <div className="site-frame home-page">
      <SiteHeader />
      <main>
        <section className="hero container">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow"><span className="status-dot" /> Virtual machine / published as package</p>
            <h1 className="hero-title">Storage<br /><em>turned into</em><br />memory.</h1>
            <p className="hero-lead">Saddle turns distributed storage bytes into a publishable execution layer. The machine is not on your desk. It is in the chain.</p>
            <div className="hero-actions-row">
              <Link href="/architecture" className="button button-primary">Trace the system <ArrowUpRight size={16} /></Link>
              <a href="#thesis" className="text-link">Read the thesis <ArrowDownRight size={16} /></a>
            </div>
            <div className="hero-aside-note">
              <span className="mono-label">OPERATOR MODEL</span>
              <span>Own the accounts.<br />Publish the repo.<br />Keep the breadboard.</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-visual-meta">
              <span>FIG. 01 / MEMORY BRIDGE</span>
              <span className="mono-label">SADDLE_01</span>
            </div>
            <div className="hero-image-frame">
              <img src={heroImage} alt="Abstract bridge of storage tiles and remote compute nodes" />
              <div className="hero-image-caption"><span>REMOTE STORAGE</span><span>VIRTUAL PROCESS</span></div>
            </div>
            <div className="hero-orbit-label"><RadioTower size={15} /> third-party hosts / no local machine</div>
          </div>
        </section>

        <section className="metric-section container">
          <MetricStrip metrics={[
            { value: "01", label: "core thesis", detail: "storage == compute" },
            { value: "70+", label: "storage backends", detail: "rclone-compatible" },
            { value: "∞", label: "package surfaces", detail: "one engine / many shells" },
          ]} />
        </section>

        <section id="thesis" className="thesis-section container section-with-rail">
          <SectionRail number="01" label="the thesis" />
          <div className="thesis-content">
            <p className="eyebrow">CORE PRINCIPLE / 01</p>
            <h2 className="section-title">The bytes are already there. <span>The flag is the machine.</span></h2>
            <div className="thesis-grid">
              <p>RAM and disk are the same construct at the byte level. What changes is the usage flag: <b>keep</b> or <b>process</b>. Saddle makes that distinction explicit, then routes work to a runner that belongs to someone else.</p>
              <div className="evidence-card">
                <div className="evidence-card-head"><Command size={16} /><span>INODE / DENTRY / FILE_OPS</span><span className="card-index">[01]</span></div>
                <div className="evidence-equation"><span>storage</span><b>=</b><span>compute memory</span></div>
                <div className="evidence-card-foot"><span>difference</span><b>usage flag</b></div>
              </div>
            </div>
          </div>
        </section>

        <section className="runtime-section">
          <div className="container section-with-rail">
            <SectionRail number="02" label="the chain" />
            <div className="runtime-content">
              <div className="section-heading-row">
                <div><p className="eyebrow">REPO → RUNNER → SURFACE</p><h2 className="section-title">A repo can behave like a CPU.</h2></div>
                <Link href="/architecture" className="small-arrow-link">Open architecture <MoveRight size={15} /></Link>
              </div>
              <div className="runtime-layout">
                <RuntimeDiagram />
                <div className="runtime-art-frame"><img src={runtimeImage} alt="Illustrated map of repositories connected to remote runners" /><span>FIG. 02 / REMOTE RUNTIME MAP</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="surfaces-section container section-with-rail">
          <SectionRail number="03" label="the surfaces" />
          <div className="surfaces-content">
            <div className="section-heading-row"><div><p className="eyebrow">ONE ENGINE / MANY SHELLS</p><h2 className="section-title">Use the same machine<br />where your work already lives.</h2></div><span className="mono-label">AVAILABLE / 04</span></div>
            <div className="surface-list">
              {surfaces.map((surface) => { const Icon = surface.icon; return <Link className="surface-row" href={surface.href} key={surface.title}><span className="surface-number">{surface.index}</span><Icon size={21} strokeWidth={1.5} /><div className="surface-copy"><h3>{surface.title}</h3><p>{surface.body}</p></div><ArrowUpRight className="surface-arrow" size={18} /></Link>; })}
            </div>
          </div>
        </section>

        <section className="closing-section container">
          <div className="closing-mark"><SaddleMark className="h-14 w-14" /></div>
          <div><p className="eyebrow">NEXT MOVE / 00</p><h2 className="closing-title">Map the bytes.<br /><span>Fire the work.</span></h2></div>
          <Link href="/docs" className="button button-dark">Read the working notes <ExternalLink size={16} /></Link>
        </section>
      </main>
      <footer className="site-footer container"><span>© 2026 Saddle / distributed by design</span><span className="mono-label">storage == compute</span></footer>
    </div>
  );
}
