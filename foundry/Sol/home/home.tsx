/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// The landing of the foundry application (campaign v3 · R3): the herd floor
// as a Suno-grade SaaS surface with an industrial-store console heart. ONE
// amber furnace light (color-mix 14%) over the deep bronze dark, with the
// .halftone dissolve and the ≤5% grain riding the theme utilities. The mark
// owns the zone once — the shell rests its title-bar mark behind the
// data-landing flag — and carries the conveyor tick: a 2.4s transform-only
// belt beside the lockup. The forge console is the prompt-giga field: a
// giant mono input drafting the herd name, the three real clone formats as
// chips (.tzst, .tar.gz, .tar.xz) and the embedded forge key — the readout
// stays a DRAFT, this staging surface stores nothing. Below: the herd shelf
// presents the format capabilities honestly (no herd data lives locally, so
// no sizes are invented), the tzst row leads raised with the center-pop;
// the 01–03 capability steps (run · store · clone) and the footer meta-quad
// close the page flush to the window floor. Styled entirely by Sol/sol.css.
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { BrandMark } from "../shell/BrandMark";
import { Entry } from "./entry";
import { Tabs } from "./tabs";
import type { HomeProps } from "./types";

export * from "./entry";
export * from "./tabs";

/** one clone format of the herd shelf — the real archives the family
 * clones and ships (the release archives travel as tar.xz) */
const FORMATS = [
  {
    id: "tzst",
    ext: ".tzst",
    herd: "the quick herd",
    line: "tar over zstd — the herd that clones fast",
    state: "lead herd",
  },
  {
    id: "targz",
    ext: ".tar.gz",
    herd: "the pack herd",
    line: "tar over gzip — the herd that opens anywhere",
    state: "kept",
  },
  {
    id: "tarxz",
    ext: ".tar.xz",
    herd: "the release herd",
    line: "tar over xz — the family releases travel as tar.xz",
    state: "kept",
  },
] as const;

/** the id of one shelf format */
type FormatId = (typeof FORMATS)[number]["id"];

/** the capability steps of the floor: run · store · clone */
const STEPS = [
  { n: "01", title: "run", text: "the forge pours the images and the sandboxes rise working." },
  { n: "02", title: "store", text: "the vault shelf keeps every record the floor makes." },
  { n: "03", title: "clone", text: "the working set travels as .tzst, .tar.gz and .tar.xz clones." },
] as const;

/** the honesty line under the shelf: the staging surface stores nothing */
const SHELF_NOTE = "no herd is stored on this staging surface yet — the shelf lists the clone formats, not herds.";

/** the beat of the forge key: the stamp readout holds for two seconds */
const STAMP_MS = 2000;

export function Home(props: HomeProps) {
  // the forge console state: the draft herd name, the picked clone format
  // and the transient stamp beat of the key (visual only — nothing leaves
  // this staging surface)
  const [draft, setDraft] = useState("");
  const [format, setFormat] = useState<FormatId>("tzst");
  const [stamped, setStamped] = useState(false);
  const stampTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (stampTimer.current !== null) window.clearTimeout(stampTimer.current);
    },
    [],
  );

  const active = FORMATS.find((f) => f.id === format) ?? FORMATS[0];
  const herdName = draft.trim() === "" ? "unnamed herd" : draft.trim();
  const readout = `${stamped ? "draft stamped" : "herd draft"} · ${herdName}${active.ext}`;

  /** the forge key: flashes the stamp readout for a beat, then reverts */
  function stamp() {
    setStamped(true);
    if (stampTimer.current !== null) window.clearTimeout(stampTimer.current);
    stampTimer.current = window.setTimeout(() => setStamped(false), STAMP_MS);
  }

  return (
    <main className="page fd-page">
      {/* the hero stage: the one amber furnace light of the landing */}
      <section className="fdx-stage halftone grain" aria-label="foundry — the foundry of clone herds">
        <span className="fdx-light" aria-hidden="true" />
        <div className="fdx-lockup fdx-in">
          <span className="fdx-mark">
            <BrandMark size={56} />
          </span>
          <span className="fdx-belt" aria-hidden="true">
            <i />
          </span>
        </div>
        <p className="fdx-eyebrow fdx-in" style={{ "--fdx-d": 1 } as CSSProperties}>
          foundry · runs and stores
        </p>
        <h1 className="fdx-title fdx-in" style={{ "--fdx-d": 2 } as CSSProperties}>
          One floor. Every herd.
        </h1>
        <p className="fdx-lede fdx-in" style={{ "--fdx-d": 3 } as CSSProperties}>
          the foundry of clone herds — the working set of the family runs here and stays stored as .tzst, .tar.gz and
          .tar.xz clones.
        </p>
      </section>

      {/* the industrial-store heart: the forge console and the herd shelf */}
      <section id="surface" aria-label="the forge console and the herd shelf">
        <div className="fdx-forge fdx-in" style={{ "--fdx-d": 4 } as CSSProperties}>
          <p className="fdx-forgehead">the forge · name a herd, pick the clone format</p>
          <div className="fdx-field">
            <span className="fdx-sigil" aria-hidden="true">
              ›
            </span>
            <input
              className="fdx-input"
              type="text"
              value={draft}
              maxLength={48}
              placeholder="forge a clone — name the herd"
              aria-label="name the herd to clone"
              onChange={(event) => setDraft(event.target.value)}
            />
            <button type="button" className="fdx-key" onClick={stamp}>
              forge
            </button>
          </div>
          <div className="fdx-console">
            <fieldset className="fdx-chips">
              <legend className="fdx-chipslegend">clone format</legend>
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="fdx-chip"
                  aria-pressed={f.id === format}
                  onClick={() => setFormat(f.id)}
                >
                  {f.ext}
                </button>
              ))}
            </fieldset>
            <p className={stamped ? "fdx-readout is-stamped" : "fdx-readout"} role="status">
              {readout}
            </p>
          </div>
        </div>

        <div className="fdx-shelf">
          <p className="fdx-shelfhead">the herd shelf · the clone formats the store keeps</p>
          <ul className="fdx-rows">
            {FORMATS.map((f, index) => (
              <li
                key={f.id}
                className={index === 0 ? "fdx-row is-lead" : "fdx-row"}
                style={{ "--fdx-d": index } as CSSProperties}
              >
                <span className="fdx-name">{f.herd}</span>
                <span className="fdx-format">{f.ext}</span>
                <span className="fdx-trait">{f.line}</span>
                <span className="fdx-state">
                  <i className="fdx-dot" aria-hidden="true" />
                  {f.state}
                </span>
              </li>
            ))}
          </ul>
          <p className="fdx-note">{SHELF_NOTE}</p>
        </div>

        <div className="fdx-steps">
          {STEPS.map((step, index) => (
            <div key={step.n} className="fdx-step" style={{ "--fdx-d": index } as CSSProperties}>
              <p className="fdx-stepn">{step.n}</p>
              <h2 className="fdx-steptitle">{step.title}</h2>
              <p className="fdx-steptext">{step.text}</p>
            </div>
          ))}
        </div>

        <Entry note={props.input} />
      </section>

      {/* the footer meta-quad, flush to the window floor */}
      <footer className="fdx-quad">
        <div className="fdx-quads">
          <div className="fdx-cell">
            <p className="fdx-quadh">foundry</p>
            <p className="fdx-quadt">the family foundry — runs the floor and stores the herds.</p>
          </div>
          <div className="fdx-cell">
            <p className="fdx-quadh">the store</p>
            <p className="fdx-quadt">clone archives kept as .tzst · .tar.gz · .tar.xz.</p>
          </div>
          <div className="fdx-cell">
            <p className="fdx-quadh">the floor</p>
            <p className="fdx-quadt">sandboxes rise · images pour · records stay kept.</p>
          </div>
          <div className="fdx-cell">
            <p className="fdx-quadh">the family</p>
            <p className="fdx-quadt">nine deploy units share the engine — foundry keeps their working set.</p>
          </div>
        </div>
        <Tabs />
      </footer>
    </main>
  );
}

export default Home;
