// Home — page sub-anchor: same name as the folder, imports the sibling components.
// The staging home of the forge runner surface: one hero, one live entry strip
// and the three jobs of the application, styled entirely by Sol/sol.css.
import { Entry } from "./entry";
import { Tabs } from "./tabs";
import type { HomeProps } from "./types";

const JOBS = [
  {
    title: "Register runners",
    text: "The sandbox runner surface registers the runners that execute builds and records the inventory of the floor.",
  },
  {
    title: "Record run logs",
    text: "Every run keeps its log beside the runner that produced it, so an outcome always carries its evidence.",
  },
  {
    title: "Report outcomes",
    text: "Results travel over https: the runner reports success, failure and the log reference back to the family.",
  },
] as const;

export function Home(props: HomeProps) {
  return (
    <main className="page">
      <section className="shell hero-section">
        <p className="eyebrow reveal in">forge · the devthink os</p>
        <h1 className="wordmark reveal in">Builds that run themselves.</h1>
        <p className="hero-lede reveal in">
          forge is the CI and build application of the DevThink OS: a sandbox runner surface that registers runners,
          records run logs and reports outcomes over https. This Sol theme is the staging web surface — the
          application tree lands here.
        </p>
        <div className="badge-row reveal in">
          <span className="badge">
            <span className="dot" aria-hidden="true" />
            runner surface staged
          </span>
          <span className="badge">https outcomes</span>
          <span className="badge">run logs</span>
        </div>
        <Entry note={props.input} />
        <Tabs />
      </section>

      <section className="shell section" id="surface" aria-labelledby="surface-title">
        <div className="section-head">
          <p className="eyebrow reveal in">the runner floor</p>
          <h2 id="surface-title" className="reveal in">
            Three jobs, one floor
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
