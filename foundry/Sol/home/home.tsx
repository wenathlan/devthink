/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// The staging home of the foundry pipeline riding the application window
// (the NeoSkills pass): one pagehead hero — eyebrow "foundry · the family
// foundry" (the title bar carries the mark, the hero never repeats it) —
// then an asymmetric body: the dominant POUR zone (the live pipeline read
// as a furnace pour: crucible, stream, mold — the halftone/grain atmosphere
// lives here) beside a support rail carrying the three jobs as a numbered
// ledger. The jump chips keep. No uniform card grid; micro-feedback on the
// rows, chips and jump links. Styled entirely by Sol/sol.css.
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
    <main className="page fd-page grain">
      <header className="pagehead">
        <p className="pagehead__eyebrow reveal in">foundry · the family foundry</p>
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
        <Tabs />
      </header>

      <div className="fd-floor">
        <section className="fd-pour halftone grain reveal in" aria-label="the pour — the live pipeline of the foundry">
          <p className="pagehead__eyebrow">the pour · live</p>
          <h2 className="fd-pour__title">Melt, pour, floor.</h2>
          <p className="fd-pour__lede">
            The pipeline reads like a pour: images melt in the crucible, the engine pours them as sandboxes, and every
            record lands on the floor the foundry owns.
          </p>
          <div className="fd-pour__scene" aria-hidden="true">
            <span className="fd-pour__vessel" />
            <span className="fd-pour__stream" />
            <span className="fd-pour__mold">
              <span className="fd-pour__fill" />
            </span>
          </div>
          <div className="fd-pour__stages">
            <span className="fd-stage">melt · build</span>
            <span className="fd-stage">pour · run</span>
            <span className="fd-stage">floor · records</span>
          </div>
          <Entry note={props.input} />
        </section>

        <aside className="fd-rail" aria-label="the three jobs of the foundry">
          <p className="pagehead__eyebrow fd-rail__head">the three jobs</p>
          {JOBS.map((job, index) => (
            <article key={job.title} className={index === 0 ? "fd-job fd-job--lead reveal in" : "fd-job reveal in"}>
              <p className="fd-job__idx" aria-hidden="true">{`0${index + 1}`}</p>
              <h3 className="fd-job__title">{job.title}</h3>
              <p className="fd-job__text">{job.text}</p>
            </article>
          ))}
        </aside>
      </div>
    </main>
  );
}

export default Home;
