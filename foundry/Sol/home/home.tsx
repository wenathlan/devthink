/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// The staging home of the foundry pipeline riding the application window:
// one pagehead hero (the wave D1 grammar — 10px mono eyebrow, 28–32px
// title, 13px lede, the status chips as the actions), the live entry strip,
// the jump links and the three jobs of the application on 8px radii cards,
// styled entirely by Sol/sol.css.
import { Entry } from "./entry";
import { Tabs } from "./tabs";
import type { HomeProps } from "./types";

export * from "./entry";
export * from "./tabs";

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
    <main className="page fd-page">
      <header className="pagehead">
        <p className="pagehead__eyebrow reveal in">foundry · the devthink os</p>
        <h1 className="pagehead__title reveal in">Sandboxes and images, one pipeline.</h1>
        <p className="pagehead__lede reveal in">
          foundry is the pipeline application of the devthink os — the e2b and docker clone interface driving sandboxes
          and images while the engine lives in saddle. this staging web surface is where the application tree lands.
        </p>
        <div className="pagehead__actions reveal in">
          <span className="fd-chip">
            <span className="fd-chip__dot" aria-hidden="true" />
            pipeline staged
          </span>
          <span className="fd-chip">sandboxes</span>
          <span className="fd-chip">images</span>
        </div>
        <Entry note={props.input} />
        <Tabs />
      </header>

      <section className="fd-section" id="surface" aria-labelledby="surface-title">
        <div className="fd-sechead">
          <p className="pagehead__eyebrow reveal in">the pipeline floor</p>
          <h2 id="surface-title" className="fd-sectitle reveal in">
            Three jobs, one flow
          </h2>
        </div>
        <div className="fd-grid">
          {JOBS.map((job) => (
            <article key={job.title} className="fd-card reveal in">
              <h3 className="fd-card__title">{job.title}</h3>
              <p className="fd-card__text">{job.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
