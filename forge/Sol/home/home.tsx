/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// The staging home of the forge runner surface: one pagehead hero (eyebrow,
// title, lede, actions), the live entry strip of the runner and the three
// jobs of the application, styled entirely by Sol/sol.css.
import { Entry } from "./entry";
import type { HomeProps } from "./types";

export * from "./entry";
export * from "./tabs";

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
    <main className="shell">
      <header className="pagehead">
        <p className="pagehead__eyebrow reveal in">forge · the devthink os</p>
        <h1 className="pagehead__title reveal in">Builds that run themselves.</h1>
        <p className="pagehead__lede reveal in">
          forge is the CI and build application of the DevThink OS — a sandbox runner surface that registers runners,
          records run logs and reports outcomes over https. This Sol theme is the staging web surface; the application
          tree lands here.
        </p>
        <div className="pagehead__actions reveal in">
          <a className="btn" href="#surface">
            see the runner floor
          </a>
          <a className="btn secondary" href="https://github.com/wenathlan/devthink" target="_blank" rel="noreferrer">
            the family
          </a>
        </div>
        <div className="badge-row reveal in">
          <span className="badge">
            <span className="dot" aria-hidden="true" />
            runner surface staged
          </span>
          <span className="badge">https outcomes</span>
          <span className="badge">run logs</span>
        </div>
        <Entry note={props.input} />
      </header>

      <section className="section" id="surface" aria-labelledby="surface-title">
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

export default Home;
