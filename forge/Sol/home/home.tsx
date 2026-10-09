/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// Home — the LANDING (campaign v3 · r3-forge): the home IS both the landing
// and the platform entry (the small app doctrine). One ember light over the
// warm charcoal stage: the hero lockup owns the drawn mark (the title-bar
// mark rests — data-landing), the display headline and ONE phrase, then the
// prompt-giga run field — a giant mono input with the embedded run key and
// the REAL runtime targets (the runner modes of runner.ts) as chips. Below:
// the capability ledger in hairline rows (target mono + status live-dot +
// meta tabular) with the ONE raised featured row (center-pop), the 01–03
// run flow beside the honest-state rail at 1.6fr/1fr and the footer
// meta-quad. No run stats are invented — the staging floor reports
// capabilities, not runs. Styling lives in Sol/sol.css (campaign v3 ·
// r3-forge section).
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { type FormEvent, useState } from "react";
import { modes } from "../../runner.ts";
import { BrandMark } from "../shell/BrandMark";
import { Entry } from "./entry";
import type { HomeProps } from "./types";

export * from "./entry";
export * from "./tabs";

/** the honest flow of a run, end to end — the floor's own doctrine */
const FLOW_STEPS = [
  {
    no: "01",
    title: "Mount",
    text: "The sandbox runner surface mounts on the saddle engine and registers the runners of the floor.",
  },
  {
    no: "02",
    title: "Run",
    text: "The build executes in the sandbox and its log records beside the runner that produced it.",
  },
  {
    no: "03",
    title: "Report",
    text: "The outcome travels over https — success, failure and the log reference — back to the family.",
  },
] as const;

/** the capability ledger: what the floor serves — no run stats are invented */
const CAPABILITIES = [
  {
    no: "01",
    target: "register runners",
    text: "The sandbox runner surface registers the runners that execute builds and records the inventory of the floor.",
    status: "ready",
    meta: "inventory",
  },
  {
    no: "02",
    target: "record run logs",
    text: "Every run keeps its log beside the runner that produced it, so an outcome always carries its evidence.",
    status: "ready",
    meta: "evidence",
  },
  {
    no: "03",
    target: "report outcomes",
    text: "Results travel over https: the runner reports success, failure and the log reference back to the family.",
    status: "ready",
    meta: "https",
  },
] as const;

export function Home(props: HomeProps) {
  const [target, setTarget] = useState<string>(modes[0]);

  /** the run key walks down to the floor: the staging surface presents the
   * ledger — the sandbox engine runs the builds, this surface never fakes
   * an execution */
  const run = (event: FormEvent): void => {
    event.preventDefault();
    document.getElementById("surface")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="shell fg-home">
      {/* HERO — the landing stage: the ONE ember light, the halftone dissolve
          and the film grain over the prompt-first run field. The lockup owns
          the mark on the landing (the title-bar mark rests — data-landing). */}
      <section className="hero-stage halftone grain" aria-labelledby="home-h">
        <div className="forge-light breathe" aria-hidden="true" />
        <div className="hero-lockup reveal in">
          <span className="hero-mark">
            <BrandMark size={44} />
          </span>
          <span className="hero-name">forge</span>
        </div>
        <h1 id="home-h" className="hero-h reveal in">
          Builds that run themselves.
        </h1>
        <p className="hero-lede reveal in">
          The CI and build application of the DevThink OS — runners register, run logs record and outcomes report over
          https, on the saddle sandbox engine.
        </p>
        <form className="prompt-giga reveal in" onSubmit={run}>
          <input
            className="pg-input"
            type="text"
            placeholder="npm run build · full-virtual sandbox"
            aria-label="Describe the build to run"
          />
          <button className="pg-key" type="submit">
            run
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </form>
        <p className="pg-hint reveal in">
          enter walks down to the floor · the targets ride the runner modes of the saddle engine
        </p>
        <fieldset className="pg-chips reveal in" aria-label="Runtime targets">
          {modes.map((mode) => (
            <button
              key={mode}
              type="button"
              className="pg-chip"
              aria-pressed={mode === target}
              onClick={() => setTarget(mode)}
            >
              {mode}
            </button>
          ))}
        </fieldset>
        <Entry note={props.input} />
      </section>

      {/* THE RUN LEDGER — hairline capability rows, the ONE raised featured
          row (center-pop). No run data exists on the staging surface, so the
          ledger presents capabilities — never invented run stats. */}
      <section className="section" id="surface" aria-labelledby="floor-h">
        <div className="section-head">
          <p className="eyebrow reveal in">the runner floor</p>
          <h2 id="floor-h" className="h2-xl reveal in">
            One floor, three jobs
          </h2>
        </div>
        <div className="ledger reveal in">
          <article className="ledger-row fg-featured" aria-label="the staging floor — runner surface staged">
            <span className="ledger-no" aria-hidden="true">
              00
            </span>
            <div className="ledger-main">
              <h3 className="ledger-title">staging floor</h3>
              <p className="ledger-text">The runner surface is staged — the application tree lands here.</p>
            </div>
            <div className="ledger-side">
              <span className="fg-live" data-live="true">
                <i aria-hidden="true" />
                staged
              </span>
              <span className="ledger-badge">saddle engine</span>
            </div>
          </article>
          {CAPABILITIES.map((cap) => (
            <article key={cap.no} className="ledger-row">
              <span className="ledger-no" aria-hidden="true">
                {cap.no}
              </span>
              <div className="ledger-main">
                <h3 className="ledger-title">{cap.target}</h3>
                <p className="ledger-text">{cap.text}</p>
              </div>
              <div className="ledger-side">
                <span className="fg-live">
                  <i aria-hidden="true" />
                  {cap.status}
                </span>
                <span className="ledger-badge">{cap.meta}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* THE RUN, END TO END — the 01–03 flow at 1.6fr beside the honest-state
          rail (air + hairlines, never a nested box) */}
      <section className="section" aria-labelledby="flow-h">
        <div className="section-head">
          <p className="eyebrow reveal in">the run, end to end</p>
          <h2 id="flow-h" className="h2-xl reveal in">
            Mount, run, report
          </h2>
        </div>
        <div className="fg-split">
          <ol className="flow-steps reveal in">
            {FLOW_STEPS.map((step) => (
              <li key={step.no} className="flow-step">
                <span className="flow-no" aria-hidden="true">
                  {step.no}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <aside className="fg-side reveal in" aria-label="the honest state of the floor">
            <p className="fg-side__head">the honest state</p>
            <p className="fg-side__text">
              This staging web surface is the platform entry — every run of the family reports its outcome back to this
              floor, and the application tree lands here.
            </p>
            <a className="fg-side__link" href="https://github.com/wenathlan/devthink" target="_blank" rel="noreferrer">
              the family on github
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </aside>
        </div>
      </section>

      {/* FOOTER META-QUAD — floor / engine / family / domain, flush to the
          window floor */}
      <footer className="meta-quad reveal in">
        <div className="quad-col">
          <p className="quad-head">floor</p>
          <a className="quad-link" href="#surface">
            the runner floor
          </a>
          <a className="quad-link" href="https://github.com/wenathlan/devthink" target="_blank" rel="noreferrer">
            the family on github
          </a>
        </div>
        <div className="quad-col">
          <p className="quad-head">engine</p>
          <span className="quad-line">saddle · the sandbox engine</span>
          <span className="quad-line">{modes.join(" · ")}</span>
        </div>
        <div className="quad-col">
          <p className="quad-head">family</p>
          <span className="quad-line">the DevThink family</span>
          <span className="quad-line">forge runs its builds</span>
        </div>
        <div className="quad-col">
          <p className="quad-head">domain</p>
          <span className="quad-line">forge · the family forge</span>
          <span className="quad-line">runs the deployed builds</span>
        </div>
      </footer>
    </main>
  );
}

export default Home;
