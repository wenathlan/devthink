/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// The staging home of the vault: one hero, one live entry strip and the three
// jobs of the application, styled entirely by Sol/sol.css.
import { Entry } from "./entry";
import { Tabs } from "./tabs";
import type { HomeProps } from "./types";

export * from "./entry";
export * from "./tabs";

const JOBS = [
  {
    title: "Every site database",
    text: "vault keeps the databases of the whole family: one deployable clone of storage where every site state lives.",
  },
  {
    title: "The data backups",
    text: "Backups ride the same house tree — the network stores its recoverable copies here, beside the state they protect.",
  },
  {
    title: "One house tree",
    text: "One folder per application, no src/: the loose logics, the docs, the tests and the Sol theme under the same roof.",
  },
] as const;

export function Home(props: HomeProps) {
  return (
    <main className="page">
      <section className="shell hero-section">
        <p className="eyebrow reveal in">vault · the devthink os</p>
        <h1 className="wordmark reveal in">The family keeps its state here.</h1>
        <p className="hero-lede reveal in">
          vault is the deployable clone of storage of the DevThink OS: it keeps every site database and receives the
          data backups. This Sol theme is the staging web surface — the application tree lands here.
        </p>
        <div className="badge-row reveal in">
          <span className="badge">
            <span className="dot" aria-hidden="true" />
            storage staged
          </span>
          <span className="badge">site databases</span>
          <span className="badge">backups</span>
        </div>
        <Entry note={props.input} />
        <Tabs />
      </section>

      <section className="shell section" id="surface" aria-labelledby="surface-title">
        <div className="section-head">
          <p className="eyebrow reveal in">the safe</p>
          <h2 id="surface-title" className="reveal in">
            Three jobs, one roof
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
