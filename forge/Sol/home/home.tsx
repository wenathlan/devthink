/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// HomeRegular — the LANDING of the forge (campaign 6-b · lime-brasa): the home IS
// the landing AND the platform entry, and the platform is now real (the
// runner floor answers on /runs, /queue and /logs). One brasa light over
// the charcoal stage: the hero lockup owns the drawn mark (the title-bar
// mark rests — data-landing), the display headline and ONE phrase, then
// the prompt-giga run field — a giant mono input with the embedded run key
// and the REAL runtime targets (the runner modes of runner.ts) as chips.
// The run key hands over to the floor (/runs) — a real CTA into the real
// platform, never a fake execution. Below: the capability ledger in
// hairline rows with the ONE raised featured row (center-pop), the 01–03
// run flow beside the honest-state rail at 1.6fr/1fr, the family row of
// the spec §12 accents and the footer meta-quad flush to the window floor.
// No run stats are invented — the floor reports capabilities, not runs.
import { ArrowRightRegular, ArrowUpRightRegular } from "@fluentui/react-icons";
import { type FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { familyrow } from "../../family";
import { familyurl } from "../../familyurl";
import type { HomeProps } from "../../hometypes.ts";
import { modes } from "../../runner.ts";
import { BrandMark } from "../widgets/shell.brandmark.tsx";
import { Entry } from "../widgets/home.entry.tsx";

export * from "../widgets/home.entry.tsx";
export * from "../widgets/home.tabs.tsx";

/** the honest flow of a run, end to end — the floor's own doctrine */
const FLOW_STEPS = [
  {
    no: "01",
    title: "Mount",
    text: "The floor mounts a full-virtual sandbox on the saddle engine and hands the build to a runner.",
  },
  {
    no: "02",
    title: "Run",
    text: "The build executes in the sandbox and its log lines land beside the runner that produced them.",
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
    text: "The runner floor musters the fleet — name, mode, state and the health ladder of every runner.",
    status: "ready",
    meta: "on /runs",
  },
  {
    no: "02",
    target: "queue the work",
    text: "Runs wait in three priority lanes — express cuts ahead, batch rides last, FIFO inside the lane.",
    status: "ready",
    meta: "on /queue",
  },
  {
    no: "03",
    target: "record run logs",
    text: "Every run keeps its line stream beside the runner — replayed from one seed, line-exact.",
    status: "ready",
    meta: "on /logs",
  },
] as const;

/** the family row of the landing footer: the nine siblings, spec §12 dots */
function FamilyRow() {
  return (
    <nav className="fg-familyrow" aria-label="the DevThink family">
      <p className="fg-familyrow__head">the family</p>
      <div className="fg-familyrow__links">
        {familyrow().map((member) => (
          <a
            key={member.slug}
            className="fg-familyrow__link"
            href={familyurl(member.slug)}
            target="_blank"
            rel="noreferrer"
            data-tip={`open ${member.slug} — a family application`}
            aria-label={`open ${member.slug} — a family application`}
          >
            <span className="fg-familyrow__dot" style={{ background: member.accent }} aria-hidden="true" />
            {member.slug}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function HomeRegular(_props: HomeProps) {
  const [, navigate] = useLocation();
  const [target, setTarget] = useState<string>(modes[0]);

  /** the run key: the ONE CTA of the landing — it walks the drafted target
   * down to the real floor (/runs), where the fleet and the queue answer.
   * Nothing pretends to execute on the landing itself. */
  const run = (event: FormEvent): void => {
    event.preventDefault();
    navigate("/runs");
  };

  return (
    <main className="shell fg-home">
      {/* HERO — the landing stage: the ONE brasa light, the halftone dissolve
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
          The runner floor of the DevThink family — runners muster, work queues by priority and every run leaves its log
          behind, on the saddle sandbox engine.
        </p>
        <form className="prompt-giga reveal in" onSubmit={run}>
          <input
            className="pg-input"
            type="text"
            placeholder="npm run build · full-virtual sandbox"
            aria-label="Describe the build to run"
          />
          <button className="pg-key" type="submit">
            step onto the floor
            <ArrowRightRegular fontSize={16} aria-hidden="true" />
          </button>
        </form>
        <p className="pg-hint reveal in">
          enter walks down to the runner floor · the targets ride the runner modes of the saddle engine
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
        <Entry note="forge · the runner floor of the family" />
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
          <article className="ledger-row fg-featured" aria-label="the runner floor — the platform pages answer">
            <span className="ledger-no" aria-hidden="true">
              00
            </span>
            <div className="ledger-main">
              <h3 className="ledger-title">the platform answers</h3>
              <p className="ledger-text">
                The platform answers on three pages of this app: the fleets, the queue and the seeded log replay.
              </p>
            </div>
            <div className="ledger-side">
              <span className="fg-live">
                <i aria-hidden="true" />
                this app
              </span>
              <span className="ledger-badge">runs · queue · logs</span>
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
              This surface rehearses the floor from one seed — the fleets, the queue and the log replay are the real
              engine logic, and no live build is claimed. The family reports its outcomes here.
            </p>
            <a className="fg-side__link" href="https://github.com/wenathlan/devthink" target="_blank" rel="noreferrer">
              the family on github
              <ArrowUpRightRegular fontSize={14} aria-hidden="true" />
            </a>
          </aside>
        </div>
      </section>

      {/* FAMILY ROW — the nine siblings, one §12 dot each (the same table the
          rail foot and the tests read — zero drift) */}
      <FamilyRow />

      {/* FOOTER META-QUAD — floor / engine / family / domain, flush to the
          window floor */}
      <footer className="meta-quad reveal in">
        <div className="quad-col">
          <p className="quad-head">floor</p>
          <a className="quad-link" href="/runs">
            the runner fleets
          </a>
          <a className="quad-link" href="/queue">
            the execution queue
          </a>
          <a className="quad-link" href="/logs">
            the run logs
          </a>
        </div>
        <div className="quad-col">
          <p className="quad-head">engine</p>
          <span className="quad-line">saddle · the sandbox engine</span>
          <span className="quad-line">{modes.join(" · ")}</span>
        </div>
        <div className="quad-col">
          <p className="quad-head">identity</p>
          <span className="quad-line">forge · lime-brasa #a2cb3a</span>
          <span className="quad-line">charcoal × lime — it just runs</span>
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

export default HomeRegular;
