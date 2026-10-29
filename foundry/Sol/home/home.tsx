/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself. Since the reform the mount
 * consults the entry gate (entrygate.tsx beside this anchor) before rendering
 * the landing: the first-run flow (intro, onboarding) decides, the landing
 * renders only behind a finished flow.
 */

// The landing of the foundry application (campaign v3 · R3, restated on the
// trylle foundation wearing the windows hands): the herd floor as a Suno-grade
// SaaS surface with an industrial-store console heart. ONE azul furnace light
// (the foundry identity #1e6ff2 at the 90/10 discipline) over the trylle deep
// canvas, with the .halftone dissolve and the ≤5% grain riding the theme
// utilities. The mark owns the zone once — the shell rests its title-bar mark
// behind the data-landing flag — and carries the conveyor tick: a 2.4s
// transform-only belt beside the lockup. The forge console is the prompt-giga
// field: a giant mono input drafting the herd name, the three real clone
// formats as chips (.tzst, .tar.gz, .tar.xz) and the embedded forge key — the
// readout stays a DRAFT, this staging surface stores nothing. Below: the herd
// shelf presents the format capabilities honestly (no herd data lives locally,
// so no sizes are invented), the tzst row leads raised with the center-pop;
// the 01–03 capability steps (run · store · clone) and the footer meta-quad
// close the page flush to the window floor. Styled entirely by Sol/sol.css.
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { familyrow } from "../../family";
import { familyurl } from "../../familyurl";
import type { HomeProps } from "../../hometypes.ts";
import { labelfill, label } from "../../labels";
import { BrandMark } from "../wingets";
import { Entry } from "../wingets";
import { EntryGate } from "../wingets";
import { Tabs } from "../wingets";

export * from "../wingets";
export * from "../wingets";

/** one clone format of the herd shelf — the real archives the family
 * clones and ships (the release archives travel as tar.xz). the ext is the
 * format identity the engine speaks (data); the prose rides the label store. */
const FORMATS = [
  {
    id: "tzst",
    ext: ".tzst",
    herd: label("home.format.tzstHerd"),
    line: label("home.format.tzstLine"),
    state: label("home.format.tzstState"),
  },
  {
    id: "targz",
    ext: ".tar.gz",
    herd: label("home.format.targzHerd"),
    line: label("home.format.targzLine"),
    state: label("home.format.stateKept"),
  },
  {
    id: "tarxz",
    ext: ".tar.xz",
    herd: label("home.format.tarxzHerd"),
    line: label("home.format.tarxzLine"),
    state: label("home.format.stateKept"),
  },
] as const;

/** the id of one shelf format */
type FormatId = (typeof FORMATS)[number]["id"];

/** the capability steps of the floor: run · store · clone */
const STEPS = [
  { n: "01", title: label("home.step.runTitle"), text: label("home.step.runText") },
  { n: "02", title: label("home.step.storeTitle"), text: label("home.step.storeText") },
  { n: "03", title: label("home.step.cloneTitle"), text: label("home.step.cloneText") },
] as const;

/** the family row of the landing footer: the nine siblings, spec §12 dots */
function FamilyRow() {
  return (
    <nav className="fd-familyrow" aria-label={label("home.family.aria")}>
      <p className="fd-familyrow__head">{label("home.family.head")}</p>
      <div className="fd-familyrow__links">
        {familyrow().map((member) => (
          <a
            key={member.slug}
            className="fd-familyrow__link"
            href={familyurl(member.slug)}
            target="_blank"
            rel="noreferrer"
            data-tip={labelfill("home.family.openAria", { slug: member.slug })}
            aria-label={labelfill("home.family.openAria", { slug: member.slug })}
          >
            <span className="fd-familyrow__dot" style={{ background: member.accent }} aria-hidden="true" />
            {member.slug}
          </a>
        ))}
      </div>
    </nav>
  );
}

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
  const herdName = draft.trim() === "" ? label("home.forge.unnamed") : draft.trim();
  const readout = labelfill("home.forge.readout", {
    state: stamped ? label("home.forge.readoutStamped") : label("home.forge.readoutDraft"),
    name: herdName,
    ext: active.ext,
  });

  /** the forge key: flashes the stamp readout for a beat, then reverts */
  function stamp() {
    setStamped(true);
    if (stampTimer.current !== null) window.clearTimeout(stampTimer.current);
    stampTimer.current = window.setTimeout(() => setStamped(false), STAMP_MS);
  }

  return (
    <EntryGate>
      <main className="page fd-page">
        {/* the hero stage: the one azul furnace light of the landing */}
        <section className="fdx-stage halftone grain" aria-label={label("home.hero.aria")}>
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
            {label("home.hero.eyebrow")}
          </p>
          <h1 className="fdx-title fdx-in" style={{ "--fdx-d": 2 } as CSSProperties}>
            {label("home.hero.title")}
          </h1>
          <p className="fdx-lede fdx-in" style={{ "--fdx-d": 3 } as CSSProperties}>
            {label("home.hero.lede")}
          </p>
        </section>

        {/* the industrial-store heart: the forge console and the herd shelf */}
        <section id="surface" aria-label={label("home.forge.aria")}>
          <div className="fdx-forge fdx-in" style={{ "--fdx-d": 4 } as CSSProperties}>
            <p className="fdx-forgehead">{label("home.forge.head")}</p>
            <div className="fdx-field">
              <span className="fdx-sigil" aria-hidden="true">
                ›
              </span>
              <input
                className="fdx-input"
                type="text"
                value={draft}
                maxLength={48}
                placeholder={label("home.forge.placeholder")}
                aria-label={label("home.forge.inputAria")}
                onChange={(event) => setDraft(event.target.value)}
              />
              <button type="button" className="fdx-key" onClick={stamp}>
                {label("home.forge.key")}
              </button>
            </div>
            <div className="fdx-console">
              <fieldset className="fdx-chips">
                <legend className="fdx-chipslegend">{label("home.forge.legend")}</legend>
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
            <p className="fdx-shelfhead">{label("home.shelf.head")}</p>
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
            <p className="fdx-note">{label("home.shelf.note")}</p>
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

        {/* FAMILY ROW — the nine siblings, one §12 dot each (the same table
          the rail foot and the tests read — zero drift) */}
        <FamilyRow />

        {/* the footer meta-quad, flush to the window floor */}
        <footer className="fdx-quad">
          <div className="fdx-quads">
            <div className="fdx-cell">
              <p className="fdx-quadh">{label("home.quad.foundryHead")}</p>
              <p className="fdx-quadt">{label("home.quad.foundryText")}</p>
            </div>
            <div className="fdx-cell">
              <p className="fdx-quadh">{label("home.quad.storeHead")}</p>
              <p className="fdx-quadt">{label("home.quad.storeText")}</p>
            </div>
            <div className="fdx-cell">
              <p className="fdx-quadh">{label("home.quad.floorHead")}</p>
              <p className="fdx-quadt">{label("home.quad.floorText")}</p>
            </div>
            <div className="fdx-cell">
              <p className="fdx-quadh">{label("home.quad.familyHead")}</p>
              <p className="fdx-quadt">{label("home.quad.familyText")}</p>
            </div>
          </div>
          <Tabs />
        </footer>
      </main>
    </EntryGate>
  );
}

export default Home;
