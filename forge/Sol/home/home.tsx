/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// The staging home of the forge runner surface, wave C1 (the NeoSkills bar):
// one pagehead hero (lowercase mono eyebrow "forge · the family forge" — the
// title bar carries the mark, the hero does not repeat it), the live entry
// strip, and one asymmetric floor below — a single dominant build/run console
// (the forge object, orange halftone dissolve at its edge) beside a support
// rail of the three jobs at varied densities. No uniform card grid; the
// styling lives entirely in Sol/sol.css.
import { Entry } from "./entry";
import type { HomeProps } from "./types";

export * from "./entry";
export * from "./tabs";

const JOBS = [
  {
    num: "01",
    title: "Register runners",
    text: "The sandbox runner surface registers the runners that execute builds and records the inventory of the floor.",
  },
  {
    num: "02",
    title: "Record run logs",
    text: "Every run keeps its log beside the runner that produced it, so an outcome always carries its evidence.",
  },
  {
    num: "03",
    title: "Report outcomes",
    text: "Results travel over https: the runner reports success, failure and the log reference back to the family.",
  },
] as const;

export function Home(props: HomeProps) {
  return (
    <main className="shell grain">
      <header className="pagehead">
        <p className="pagehead__eyebrow reveal in">forge · the family forge</p>
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

      <section className="section forge-floor" id="surface" aria-labelledby="surface-title">
        <div className="section-head">
          <p className="eyebrow reveal in">the runner floor</p>
          <h2 id="surface-title" className="reveal in">
            One floor, three jobs
          </h2>
        </div>
        <div className="forge-floor__grid">
          {/* the dominant forge object: the build/run surface — a staged
             runbook readout of the floor, honestly labeled staging */}
          <article
            className="forge-console halftone reveal in"
            aria-label="the build and run surface of the staging floor"
          >
            <header className="forge-console__head">
              <span className="forge-console__state">
                <i aria-hidden="true" />
                staging
              </span>
              <span>the build/run surface</span>
              <span className="forge-console__meta">runbook 03</span>
            </header>
            <div className="forge-console__body">
              <p>
                <span className="lg-t">00:00.412</span>
                <span className="lg-k">sandbox mounted</span>
                the runner floor of the family is staged
              </p>
              <p>
                <span className="lg-t">00:00.908</span>
                <span className="lg-k">inventory open</span>
                runner registration ready
              </p>
              <p>
                <span className="lg-t">00:01.204</span>
                <span className="lg-k">log buffer open</span>
                run recording ready
              </p>
              <p>
                <span className="lg-t">00:01.677</span>
                <span className="lg-k">channel open</span>
                outcome reporting over https ready
              </p>
            </div>
            <footer className="forge-console__foot">
              <span>register</span>
              <span>record</span>
              <span>report</span>
              <span className="forge-console__pipe">the application tree lands here</span>
            </footer>
          </article>

          {/* the support rail: the three jobs at varied densities — one lead
             panel, two compact rows, one quiet note */}
          <aside className="forge-rail" aria-label="the three jobs of the forge">
            <article className="forge-rail__lead reveal in">
              <p className="forge-rail__num">{JOBS[0].num}</p>
              <h3 className="forge-rail__title">{JOBS[0].title}</h3>
              <p className="forge-rail__text">{JOBS[0].text}</p>
            </article>
            <article className="forge-rail__row reveal in">
              <span className="forge-rail__num">{JOBS[1].num}</span>
              <div>
                <h3 className="forge-rail__title">{JOBS[1].title}</h3>
                <p className="forge-rail__text">{JOBS[1].text}</p>
              </div>
            </article>
            <article className="forge-rail__row reveal in">
              <span className="forge-rail__num">{JOBS[2].num}</span>
              <div>
                <h3 className="forge-rail__title">{JOBS[2].title}</h3>
                <p className="forge-rail__text">{JOBS[2].text}</p>
              </div>
            </article>
            <p className="forge-rail__note reveal in">
              staging web surface — every run of the family reports its outcome back to this floor.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default Home;
