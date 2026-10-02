// Home — page sub-anchor: same name as the folder, imports the sibling components.
// The staging home of the foundry pipeline: one hero, one live entry strip
// and the three jobs of the application, styled entirely by Sol/sol.css.
import { Entry } from "./entry";
import { Tabs } from "./tabs";
import type { HomeProps } from "./types";

const JOBS = [
  {
    title: "Drive sandboxes",
    text: "The pipeline interface drives the sandboxes: e2b-style environments come up, run and tear down through the engine that lives in saddle.",
  },
  {
    title: "Shape images",
    text: "Container images are the raw material of the floor — the pipeline builds, tags and keeps them ready for the runners.",
  },
  {
    title: "Own the records",
    text: "foundry owns the surface records of the pipeline: every sandbox and image answers here while the engine stays in saddle.",
  },
] as const;

export function Home(props: HomeProps) {
  return (
    <main className="page">
      <section className="shell hero-section">
        <p className="eyebrow reveal in">foundry · the devthink os</p>
        <h1 className="wordmark reveal in">Sandboxes and images, one pipeline.</h1>
        <p className="hero-lede reveal in">
          foundry is the pipeline application of the DevThink OS — the e2b and docker clone interface driving
          sandboxes and images while the engine lives in saddle. This Sol theme is the staging web surface — the
          application tree lands here.
        </p>
        <div className="badge-row reveal in">
          <span className="badge">
            <span className="dot" aria-hidden="true" />
            pipeline staged
          </span>
          <span className="badge">sandboxes</span>
          <span className="badge">images</span>
        </div>
        <Entry note={props.input} />
        <Tabs />
      </section>

      <section className="shell section" id="surface" aria-labelledby="surface-title">
        <div className="section-head">
          <p className="eyebrow reveal in">the pipeline floor</p>
          <h2 id="surface-title" className="reveal in">
            Three jobs, one flow
          </h2>
        </div>
        <div className="grid cols-3">
          {JOBS.map((job) => (
            <article key={job.title} className="glass glass-hover card reveal in">
              <div className="card-row">
                <h3 className="card-title">{job.title}</h3>
              </div>
              <p className="card-text">{job.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
