/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// The staging home of the vault (wave 4b · vaultface): the SaaS product
// face — the direct-value hero (one title, one description, the seal
// console, the drawn door with its 16s dial over the lazy three.js halo),
// then the LIVE product proof: the bucket plans table, the object browser
// (skeleton boot, bucket chips, path filter, honest empty state) and the
// database console (census, lanes, sweep plan, the storage contract) —
// every number from the real rehearsal engines, every word from the ui
// store (uistore.ts — uicopy/useUicopy, zero literals), every notice a
// sonner-style toast. Below: the seal · store · attest steps and the jobs
// rail, the family row of the spec §12 accents and the footer meta-quad
// flush to the window floor. One orchestrated entrance, then stillness.
// The copy stays third-person lowercase — the family grammar.
import { useCallback, useMemo, useState } from "react";
import { familyrow } from "../../family";
import { familyurl } from "../../familyurl";
import type { HomeProps } from "../../hometypes.ts";
import { labelfill } from "../../labels";
import { lfsPointerFrom, storageModeFor } from "../../storage";
import { uicopy, uicopyfill, useUicopy } from "../../uistore.ts";
import {
  Dbconsole,
  Entry,
  HomeEntrygate as EntryGate,
  Halo,
  Objectbrowse,
  Planstable,
  Reveal,
  Signupgate,
  Tabs,
  toast,
} from "../wingets";

export * from "../wingets";

/** the deposit verdict one artifact line earns under the real contract —
 * the shape both the readout and the toast answer. */
type SealVerdict =
  | { kind: "pointer"; oid: string; size: number }
  | { kind: "deposit"; mode: string; path: string; mime: string; size: number; digest: string }
  | { kind: "refused" };

/**
 * Parses a deposit line of the shape `path · mime · size` under the real
 * rules of storageRecordValid (path absolute, mime typed, size ≥ 0).
 */
function parseDepositLine(line: string): { path: string; mime: string; size: number } | undefined {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  if (tokens.length !== 3) return undefined;
  const [path, mime, sizeText] = tokens;
  const size = Number(sizeText.replaceAll("_", ""));
  if (!path.startsWith("/") || !mime.includes("/") || !Number.isFinite(size) || size < 0) return undefined;
  return { path, mime, size };
}

/**
 * The verdict of one draft line: answers only from the real storage
 * contract — a pasted git-lfs pointer is parsed by lfsPointerFrom, a
 * deposit line is routed by storageModeFor, anything else stays refused.
 */
function sealverdict(line: string): SealVerdict {
  const pointer = lfsPointerFrom(line);
  if (pointer) {
    return { kind: "pointer", oid: pointer.oid.slice(0, 12), size: Number(pointer.size) };
  }
  const deposit = parseDepositLine(line);
  if (!deposit) return { kind: "refused" };
  const mode = storageModeFor(deposit.size, deposit.mime);
  const digest = mode === "lfs" ? "sha-256 (64 hex)" : "sha-1 (40 hex)";
  return { kind: "deposit", mode, digest, ...deposit };
}

/** The seal readout: the verdict rendered in the readout voice. */
function sealReadout(verdict: SealVerdict): string {
  if (verdict.kind === "pointer") {
    return labelfill("home.readout.pointer", {
      oid: verdict.oid,
      size: verdict.size.toLocaleString("en-US"),
    });
  }
  if (verdict.kind === "refused") return uicopy("home.readout.hint");
  const why = verdict.mode === "lfs" ? uicopy("home.readout.whyLfs") : uicopy("home.readout.whyBlob");
  return labelfill("home.readout.sealed", {
    mode: verdict.mode,
    path: verdict.path,
    mime: verdict.mime,
    size: verdict.size.toLocaleString("en-US"),
    why,
    digest: verdict.digest,
  });
}

/** Raises the toast voice of one verdict (the store keeps the sentence). */
function sealToast(verdict: SealVerdict): void {
  if (verdict.kind === "pointer") {
    toast(
      uicopy("face.toast.sealedTitle"),
      uicopyfill("face.toast.sealedBody", {
        path: `sha256:${verdict.oid}…`,
        channel: "lfs",
        digest: "sha-256",
      }),
      "ok",
    );
    return;
  }
  if (verdict.kind === "refused") {
    toast(uicopy("face.toast.refusedTitle"), uicopy("face.toast.refusedBody"), "err");
    return;
  }
  toast(
    uicopy("face.toast.sealedTitle"),
    uicopyfill("face.toast.sealedBody", {
      path: verdict.path,
      channel: verdict.mode,
      digest: verdict.digest,
    }),
    "ok",
  );
}

/** Sets (or replaces) the mime token of a deposit draft line. */
function draftWithKind(line: string, kind: string): string {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  return [tokens[0] ?? "/", kind, tokens[2] ?? ""].join(" ").trim();
}

/** The mime token currently carried by the draft line, if any. */
function activeKind(line: string): string | undefined {
  return line.trim().split(/\s+/).filter(Boolean)[1];
}

/** The mime families a deposit line can carry — the real families of
 * storageModeFor (the blob families first, the lfs masters after). */
const KINDS = ["text/", "application/", "image/", "video/", "audio/", "model/"] as const;

/**
 * The prompt-giga deposit field: a giant mono input for the artifact line,
 * the embedded seal key (which answers a toast and walks to the console),
 * the real kind chips and the live seal readout.
 */
function DepositField({ onSeal }: { onSeal: () => void }) {
  const [draft, setDraft] = useState("");
  const verdict = useMemo(() => sealverdict(draft), [draft]);
  const readout = sealReadout(verdict);
  const current = activeKind(draft);
  return (
    <form
      className="vt-deposit vt-rise"
      aria-label={uicopy("home.deposit.aria")}
      onSubmit={(event) => {
        event.preventDefault();
        sealToast(verdict);
        onSeal();
      }}
    >
      <p className="vt-deposit__label">{uicopy("home.deposit.label")}</p>
      <div className="vt-deposit__field">
        <input
          className="vt-deposit__input"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={uicopy("home.deposit.placeholder")}
          aria-label={uicopy("home.deposit.inputAria")}
          spellCheck={false}
          autoComplete="off"
        />
        <button className="vt-deposit__key" type="submit">
          {uicopy("home.deposit.seal")}
        </button>
      </div>
      <fieldset className="vt-chips">
        <legend className="vt-chips__legend">{uicopy("home.deposit.kinds")}</legend>
        {KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            className="vt-chip"
            aria-pressed={current === kind}
            onClick={() => setDraft(draftWithKind(draft, kind))}
          >
            {kind}
          </button>
        ))}
      </fieldset>
      <p className="vt-deposit__readout" aria-live="polite">
        {readout}
      </p>
    </form>
  );
}

/**
 * The drawn vault door — the dominant object of the home stage, line-art in
 * the house neutrals with the dial (ring, spokes, hub, notch) in the one
 * accent ice. An illustration of the safe, not the brand mark: the mark
 * stays in the title bar alone. The dial group carries the 16s rotation —
 * slow and heavy, a vault door being dialed open. The three.js halo rides
 * behind the figure (lazy, motion-gated, disposed on unmount).
 */
function VtDoor() {
  return (
    <svg className="vt-door" viewBox="0 0 320 356" role="img" aria-label={uicopy("home.door.aria")} focusable="false">
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

      {/* the dial: ring, three spokes, hub and notch in the accent ice —
          the group turns one slow revolution every 16s (reduced motion: still) */}
      <g className="vt-door-dial" fill="none" stroke="#a3d7e6" strokeLinecap="round">
        <circle cx="160" cy="178" r="46" strokeWidth="4.5" strokeOpacity=".95" />
        <path d="M160 178 V138 M160 178 L198.6 198 M160 178 L129.4 198" strokeWidth="4.5" />
        <circle cx="160" cy="178" r="15" strokeWidth="3" strokeOpacity=".75" />
        <circle cx="160" cy="178" r="3.5" fill="#a3d7e6" stroke="none" />
        <circle cx="160" cy="132" r="3" fill="#a3d7e6" stroke="none" />
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

/** the family row of the landing footer: the nine siblings, spec §12 dots */
function FamilyRow() {
  return (
    <nav className="vt-familyrow" aria-label={uicopy("home.family.aria")}>
      <p className="vt-familyrow__head">{uicopy("home.family.head")}</p>
      <div className="vt-familyrow__links">
        {familyrow().map((member) => (
          <a
            key={member.slug}
            className="vt-familyrow__link"
            href={familyurl(member.slug)}
            target="_blank"
            rel="noreferrer"
            data-tip={uicopyfill("home.family.tip", { slug: member.slug })}
            aria-label={member.slug}
          >
            <span className="vt-familyrow__dot" style={{ background: member.accent }} aria-hidden="true" />
            {member.slug}
          </a>
        ))}
      </div>
    </nav>
  );
}

/** the three jobs of the safe (the family copy fills at render through
 * the store — the live rows re-render the rail when they land) */
function jobs(): { title: string; text: string }[] {
  return [
    { title: uicopy("home.jobs.db.title"), text: uicopy("home.jobs.db.text") },
    { title: uicopy("home.jobs.backups.title"), text: uicopy("home.jobs.backups.text") },
    { title: uicopy("home.jobs.tree.title"), text: uicopy("home.jobs.tree.text") },
  ];
}

/** the seal · store · attest flow of the safe (the ordinals ride the
 * presentation; the copy fills at render through the store) */
function steps(): { num: string; title: string; text: string }[] {
  return [
    { num: "01", title: uicopy("home.steps.seal.title"), text: uicopy("home.steps.seal.text") },
    { num: "02", title: uicopy("home.steps.store.title"), text: uicopy("home.steps.store.text") },
    { num: "03", title: uicopy("home.steps.attest.title"), text: uicopy("home.steps.attest.text") },
  ];
}

/** The home surface the gate reveals: the SaaS product face of the vault. */
export function HomeSurface(props: HomeProps) {
  // the store mount: the live rows land once and the face re-renders
  useUicopy();

  /** the seal key: the verdict already answered the toast — the walk goes
   * to the console the deposit would ride */
  const sealToConsole = useCallback(() => {
    const zone = document.getElementById("console");
    if (!zone) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    zone.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, []);

  return (
    <main className="page vt-room grain">
      {/* the hero — one ice lamplight, the direct-value display line, the
          deposit field, the door with its 16s dial over the lazy halo */}
      <section className="vt-hero halftone" aria-labelledby="vt-hero-title">
        <Halo />
        <div className="vt-hero__grid">
          <div className="vt-hero__copy">
            <p className="vt-eyebrow vt-rise">{uicopy("face.hero.eyebrow")}</p>
            <h1 className="vt-display vt-rise" id="vt-hero-title">
              {uicopy("face.hero.title")}
            </h1>
            <p className="vt-lede vt-rise">{uicopy("face.hero.lede")}</p>
            <DepositField onSeal={sealToConsole} />
            <div className="vt-hero__anchors vt-rise">
              <Tabs />
            </div>
          </div>
          <figure className="vt-doorfig vt-rise">
            <VtDoor />
            <figcaption className="vt-cap">{uicopy("home.door.caption")}</figcaption>
            <dl className="vt-doorfacts">
              <div className="vt-doorfact">
                <dt>{uicopy("home.facts.channels")}</dt>
                <dd>2 — lfs + blob</dd>
              </div>
              <div className="vt-doorfact">
                <dt>{uicopy("home.facts.digests")}</dt>
                <dd>sha-256 · sha-1</dd>
              </div>
              <div className="vt-doorfact">
                <dt>{uicopy("home.facts.sizes")}</dt>
                <dd>64-bit pointers</dd>
              </div>
            </dl>
          </figure>
        </div>
        <div className="vt-hero__foot vt-rise">
          <Entry note={props.input} />
        </div>
      </section>

      {/* the product, live — the plans table, the object browser and the
          database console (the gsap reveal rides the zone) */}
      <section className="vt-zone vt-zone--face" id="console" aria-labelledby="face-title">
        <header className="vt-zonehead">
          <p className="vt-eyebrow">{uicopy("face.zone.eyebrow")}</p>
          <h2 className="vt-zonetitle" id="face-title">
            {uicopy("face.zone.title")}
          </h2>
          <p className="vt-zonelede">{uicopy("face.zone.lede")}</p>
        </header>
        <Reveal>
          <div className="vc-facegrid">
            <div className="vc-cell" data-reveal="true">
              <Planstable />
            </div>
            <div className="vc-cell" data-reveal="true">
              <Dbconsole />
            </div>
            <div className="vc-cell vc-cell--wide" data-reveal="true">
              <Objectbrowse />
            </div>
            <div className="vc-cell vc-cell--wide" data-reveal="true">
              <Signupgate />
            </div>
          </div>
        </Reveal>
      </section>

      {/* the safe rhythm — the seal · store · attest steps and the jobs rail */}
      <section className="vt-zone" id="surface" aria-labelledby="surface-title">
        <header className="vt-zonehead">
          <p className="vt-eyebrow">{uicopy("home.ledger.eyebrow")}</p>
          <h2 className="vt-zonetitle" id="surface-title">
            {uicopy("home.ledger.title")}
          </h2>
          <p className="vt-zonelede">{uicopy("home.ledger.lede")}</p>
        </header>
        <div className="vt-console">
          <div className="vt-console__main">
            <ol className="vt-steps">
              {steps().map((step) => (
                <li key={step.num} className="vt-step">
                  <span className="vt-step__num">{step.num}</span>
                  <h3 className="vt-step__title">{step.title}</h3>
                  <p className="vt-step__text">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <aside className="vt-console__rail">
            <p className="vt-eyebrow">{uicopy("home.jobs.eyebrow")}</p>
            <ol className="vt-jobs">
              {jobs().map((job, index) => (
                <li key={job.title} className="vt-run">
                  <span className="vt-run__num">0{index + 1}</span>
                  <div className="vt-run__body">
                    <h3 className="vt-run__title">{job.title}</h3>
                    <p className="vt-run__text">{job.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="vt-footnote">{uicopy("home.jobs.footnote")}</p>
          </aside>
        </div>
      </section>

      {/* FAMILY ROW — the nine siblings, one §12 dot each (the same table the
          rail foot and the tests read — zero drift) */}
      <FamilyRow />

      {/* the footer meta-quad, flush to the window floor */}
      <footer className="vt-quad">
        <div className="vt-quad__grid">
          <div className="vt-quad__col">
            <p className="vt-quad__head">{uicopy("home.quad.store")}</p>
            <p className="vt-quad__text">{uicopy("home.quad.storeText")}</p>
          </div>
          <div className="vt-quad__col">
            <p className="vt-quad__head">{uicopy("home.quad.guard")}</p>
            <p className="vt-quad__text">{uicopy("home.quad.guardText")}</p>
          </div>
          <div className="vt-quad__col">
            <p className="vt-quad__head">{uicopy("home.quad.recover")}</p>
            <p className="vt-quad__text">{uicopy("home.quad.recoverText")}</p>
          </div>
          <div className="vt-quad__col">
            <p className="vt-quad__head">{uicopy("home.quad.family")}</p>
            <a className="vt-quad__link" href="https://github.com/wenathlan/devthink" target="_blank" rel="noreferrer">
              {uicopy("home.quad.familyLink")}
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

/**
 * The home page anchor: the entry gate rides the surface — the flow law
 * (intro → onboarding → the platform) is consulted before the home shows.
 *
 * @param props the optional note handed to the boot readout.
 * @returns the gated home element.
 */
export function Home(props: HomeProps) {
  return (
    <EntryGate>
      <HomeSurface {...props} />
    </EntryGate>
  );
}

export default Home;
