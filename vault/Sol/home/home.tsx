/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// The staging home of the vault (the NeoSkills bar, wave C1): the pagehead
// hero — text only, the ONE chrome mark stays in the title bar — then an
// asymmetric stage: one dominant vault-door object under its yellow light
// pool on the left, a support rail of numbered job runs on the right. No
// uniform card grid. One orchestrated entrance (the staggered reveal), then
// stillness. The copy stays third-person lowercase — the family grammar.
import { Entry } from "./entry";
import { Tabs } from "./tabs";
import type { HomeProps } from "./types";

export * from "./entry";
export * from "./tabs";

const JOBS = [
  {
    title: "every site database",
    text: "vault keeps the databases of the whole family: one deployable clone of storage where every site state lives.",
  },
  {
    title: "the data backups",
    text: "backups ride the same house tree — the network stores its recoverable copies here, beside the state they protect.",
  },
  {
    title: "one house tree",
    text: "one folder per application, no src/: the loose logics, the docs, the tests and the Sol theme under the same roof.",
  },
] as const;

/**
 * The drawn vault door — the dominant object of the home stage, line-art in
 * the house neutrals with the dial (ring, spokes, hub, notch) in the one
 * accent yellow. An illustration of the safe, not the brand mark: the mark
 * stays in the title bar alone.
 */
function VtDoor() {
  return (
    <svg
      className="vt-door"
      viewBox="0 0 320 356"
      role="img"
      aria-label="the vault door of the family safe"
      focusable="false"
    >
      {/* the frame and the slab */}
      <rect
        x="10"
        y="10"
        width="300"
        height="336"
        rx="18"
        fill="none"
        stroke="currentColor"
        strokeOpacity=".35"
        strokeWidth="2"
      />
      <rect
        x="34"
        y="30"
        width="252"
        height="296"
        rx="12"
        fill="currentColor"
        fillOpacity=".04"
        stroke="currentColor"
        strokeOpacity=".3"
        strokeWidth="1.5"
      />
      <ellipse cx="160" cy="330" rx="96" ry="7" fill="currentColor" fillOpacity=".06" />

      {/* the hinge barrels on the frame edge */}
      <g fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeOpacity=".4" strokeWidth="1.5">
        <rect x="2" y="86" width="24" height="36" rx="7" />
        <rect x="2" y="234" width="24" height="36" rx="7" />
      </g>

      {/* the bolt ring, its tick dial and the eight bolts */}
      <g fill="none" stroke="currentColor">
        <circle cx="160" cy="178" r="92" strokeOpacity=".45" strokeWidth="1.5" />
        <circle cx="160" cy="178" r="70" strokeOpacity=".2" strokeWidth="1.5" />
        <circle cx="160" cy="178" r="66" strokeOpacity=".28" strokeWidth="8" strokeDasharray="1.5 33" />
      </g>
      <g fill="currentColor" fillOpacity=".07" stroke="currentColor" strokeOpacity=".45" strokeWidth="1.5">
        <circle cx="252" cy="178" r="7" />
        <circle cx="225" cy="115" r="7" />
        <circle cx="160" cy="88" r="7" />
        <circle cx="95" cy="115" r="7" />
        <circle cx="68" cy="178" r="7" />
        <circle cx="95" cy="241" r="7" />
        <circle cx="160" cy="268" r="7" />
        <circle cx="225" cy="241" r="7" />
      </g>

      {/* the dial: ring, three spokes, hub and notch in the accent yellow */}
      <g fill="none" stroke="#eab308" strokeLinecap="round">
        <circle cx="160" cy="178" r="46" strokeWidth="4.5" strokeOpacity=".95" />
        <path d="M160 178 V138 M160 178 L198.6 198 M160 178 L129.4 198" strokeWidth="4.5" />
        <circle cx="160" cy="178" r="15" strokeWidth="3" strokeOpacity=".75" />
        <circle cx="160" cy="178" r="3.5" fill="#eab308" stroke="none" />
        <circle cx="160" cy="132" r="3" fill="#eab308" stroke="none" />
      </g>

      {/* the corner rivets of the slab */}
      <g fill="currentColor" fillOpacity=".25">
        <circle cx="54" cy="50" r="2.5" />
        <circle cx="266" cy="50" r="2.5" />
        <circle cx="54" cy="306" r="2.5" />
        <circle cx="266" cy="306" r="2.5" />
      </g>
    </svg>
  );
}

export function Home(props: HomeProps) {
  return (
    <main className="page vt-room grain">
      <section className="page-container vt-hero halftone">
        <header className="pagehead">
          <p className="pagehead__eyebrow reveal in">vault · the family vault</p>
          <h1 className="pagehead__title reveal in">the family keeps its state here.</h1>
          <p className="pagehead__lede reveal in">
            vault is the deployable clone of storage of the devthink os: it keeps every site database and receives the
            data backups. this sol theme is the staging surface — the application tree lands here.
          </p>
          <div className="pagehead__actions reveal in">
            <span className="badge">
              <span className="dot" aria-hidden="true" />
              storage staged
            </span>
            <span className="badge">site databases</span>
            <span className="badge">backups</span>
          </div>
        </header>
        <Entry note={props.input} />
        <Tabs />
      </section>

      <section className="page-container vt-floor" id="surface" aria-labelledby="surface-title">
        <div className="section-head">
          <p className="pagehead__eyebrow">the safe</p>
          <h2 id="surface-title" className="pagehead__title pagehead__title--sub">
            three jobs, one roof
          </h2>
        </div>
        <div className="vt-stage">
          <figure className="vt-doorfig reveal in">
            <VtDoor />
            <figcaption className="vt-cap">the vault door — one dial, three spokes, sealed</figcaption>
          </figure>
          <div className="vt-railcol reveal in">
            <ol className="vt-jobs">
              {JOBS.map((job, index) => (
                <li key={job.title} className="vt-run reveal in">
                  <span className="vt-run__num">0{index + 1}</span>
                  <div className="vt-run__body">
                    <h3 className="vt-run__title">{job.title}</h3>
                    <p className="vt-run__text">{job.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="vt-footnote">
              the house tree keeps every state recoverable — nothing executes inside the vault.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
