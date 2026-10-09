/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// The staging home of the vault (campaign v3 · r3-vault): a Suno-grade
// landing with a vault-console heart — ONE gold lamplight over the deep
// obsidian base, the drawn vault door turning its dial once every 16s
// (slow and heavy, transform only), and a prompt-giga deposit field whose
// seal key answers from the REAL storage contract of the house
// (storageModeFor, the sha-256/sha-1 digest disciplines, the 1,000,000-byte
// threshold — nothing invented). Below: the vault ledger as hairline rows
// with ONE raised featured row, honest to the staging surface — no artifact
// rows are served yet, so the ledger presents the storage contract itself —
// then the seal · store · attest steps and the footer meta-quad. One
// orchestrated entrance, then stillness. The copy stays third-person
// lowercase — the family grammar.
import { useCallback, useState } from "react";
import { lfsPointerFrom, storageModeFor } from "../../storage";
import { Entry } from "./entry";
import { Tabs } from "./tabs";
import type { HomeProps } from "./types";

export * from "./entry";
export * from "./tabs";

/** the capability ledger of the staging vault — every row comes from the
 * real storage contract (storage.ts): the lfs/blob channels of
 * storageModeFor with the 1,000,000-byte threshold, the three-line pointer
 * document of lfsPointerText, the five checks of storageRecordValid. */
const CHANNELS = [
  {
    name: "lfs masters",
    note: "binary masters and any row over the threshold ride the lfs objects — sha-256 sealed, 64-bit pointers.",
    kind: "lfs",
    size: "> 1,000,000 b",
    state: "sealed",
    featured: true,
  },
  {
    name: "in-db blobs",
    note: "small text-like rows ride the git objects inside the self-hosted database — sha-1 oid.",
    kind: "blob",
    size: "≤ 1,000,000 b",
    state: "sealed",
    featured: false,
  },
  {
    name: "lfs pointers",
    note: "version · oid sha-256 · size — the three-line pointer, cataloged beside the bytes.",
    kind: "catalog",
    size: "3 lines",
    state: "guarded",
    featured: false,
  },
  {
    name: "storage records",
    note: "id · path · mime · size · digest — five checks before a record is served over https.",
    kind: "serve",
    size: "5 checks",
    state: "served",
    featured: false,
  },
] as const;

/** the three jobs of the safe (the family copy, unchanged) */
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

/** the seal · store · attest flow of the deposit console */
const STEPS = [
  {
    num: "01",
    title: "seal",
    text: "every artifact is named, measured and digested before the door closes.",
  },
  {
    num: "02",
    title: "store",
    text: "the row rides its channel — lfs for the masters, the in-db git objects for the small.",
  },
  {
    num: "03",
    title: "attest",
    text: "the record answers for itself over https: path, mime, size and digest.",
  },
] as const;

/** the artifact kinds a deposit line can carry — the real mime families of
 * storageModeFor (the blob families first, the lfs masters after). */
const KINDS = ["text/", "application/", "image/", "video/", "audio/", "model/"] as const;

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
 * The seal readout: answers only from the real storage contract — a pasted
 * git-lfs pointer is parsed by lfsPointerFrom, a deposit line is routed by
 * storageModeFor, anything else stays an honest hint.
 */
function sealReadout(line: string): string {
  const pointer = lfsPointerFrom(line);
  if (pointer) {
    return `lfs pointer accepted — oid sha256:${pointer.oid.slice(0, 12)}… · size ${Number(pointer.size).toLocaleString("en-US")} b · rides the lfs channel · digest sha-256 (64 hex)`;
  }
  const deposit = parseDepositLine(line);
  if (!deposit) {
    return "not a deposit yet — name it as: path · mime · size (or paste a git-lfs pointer)";
  }
  const mode = storageModeFor(deposit.size, deposit.mime);
  const digest = mode === "lfs" ? "sha-256 (64 hex)" : "sha-1 (40 hex)";
  const why =
    mode === "lfs" ? "binary master or over the 1,000,000-byte threshold" : "small text-like row under the threshold";
  return `sealed for the ${mode} channel — ${deposit.path} · ${deposit.mime} · ${deposit.size.toLocaleString("en-US")} b · ${why} · digest ${digest}`;
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

/**
 * The prompt-giga deposit field: a giant mono input for the artifact line,
 * the embedded seal key (which walks to the channel ledger), the real kind
 * chips and the live seal readout.
 */
function DepositField({ onSeal }: { onSeal: () => void }) {
  const [draft, setDraft] = useState("");
  const readout = sealReadout(draft);
  const current = activeKind(draft);
  return (
    <form
      className="vt-deposit vt-rise"
      aria-label="deposit an artifact into the vault"
      onSubmit={(event) => {
        event.preventDefault();
        onSeal();
      }}
    >
      <p className="vt-deposit__label">deposit an artifact</p>
      <div className="vt-deposit__field">
        <input
          className="vt-deposit__input"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="/sites/state.db application/x-sqlite3 48211046"
          aria-label="artifact line: path, mime and size"
          spellCheck={false}
          autoComplete="off"
        />
        <button className="vt-deposit__key" type="submit">
          seal
        </button>
      </div>
      <fieldset className="vt-chips">
        <legend className="vt-chips__legend">artifact kinds — the real families of the storage contract</legend>
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
 * accent yellow. An illustration of the safe, not the brand mark: the mark
 * stays in the title bar alone. The dial group carries the 16s rotation —
 * slow and heavy, a vault door being dialed open.
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

      {/* the dial: ring, three spokes, hub and notch in the accent yellow —
          the group turns one slow revolution every 16s (reduced motion: still) */}
      <g className="vt-door-dial" fill="none" stroke="#eab308" strokeLinecap="round">
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
  /** the seal key: the verdict is already live in the readout — the walk
   * goes to the channel ledger the deposit would ride */
  const sealToLedger = useCallback(() => {
    const surface = document.getElementById("surface");
    if (!surface) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    surface.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, []);

  return (
    <main className="page vt-room grain">
      {/* the hero — one gold lamplight, the display line, the deposit field,
          the door with its 16s dial */}
      <section className="vt-hero halftone" aria-labelledby="vt-hero-title">
        <div className="vt-hero__grid">
          <div className="vt-hero__copy">
            <p className="vt-eyebrow vt-rise">vault · the family vault — only stores</p>
            <h1 className="vt-display vt-rise" id="vt-hero-title">
              the family keeps its state here.
            </h1>
            <p className="vt-lede vt-rise">
              one deployable clone of storage keeps every site database and receives every data backup — nothing
              executes inside the safe.
            </p>
            <DepositField onSeal={sealToLedger} />
            <div className="vt-hero__anchors vt-rise">
              <Tabs />
            </div>
          </div>
          <figure className="vt-doorfig vt-rise">
            <VtDoor />
            <figcaption className="vt-cap">the vault door — one dial, eight bolts, sealed</figcaption>
            <dl className="vt-doorfacts">
              <div className="vt-doorfact">
                <dt>channels</dt>
                <dd>2 — lfs + blob</dd>
              </div>
              <div className="vt-doorfact">
                <dt>digests</dt>
                <dd>sha-256 · sha-1</dd>
              </div>
              <div className="vt-doorfact">
                <dt>sizes</dt>
                <dd>64-bit pointers</dd>
              </div>
            </dl>
          </figure>
        </div>
        <div className="vt-hero__foot vt-rise">
          <Entry note={props.input} />
        </div>
      </section>

      {/* the vault console — the capability ledger, the flow, the jobs rail */}
      <section className="vt-zone" id="surface" aria-labelledby="surface-title">
        <header className="vt-zonehead">
          <p className="vt-eyebrow">the vault ledger</p>
          <h2 className="vt-zonetitle" id="surface-title">
            what the safe keeps
          </h2>
          <p className="vt-zonelede">
            no artifact rows are served by the staging surface yet — the ledger presents the storage contract itself,
            channel by channel.
          </p>
        </header>
        <div className="vt-console">
          <div className="vt-console__main">
            <div className="vt-ledgerscroll">
              <table className="vt-ledger">
                <caption className="vt-ledger__caption">
                  the storage channels of the vault — kind, sealed size and status
                </caption>
                <thead>
                  <tr>
                    <th scope="col">channel</th>
                    <th scope="col">kind</th>
                    <th scope="col">sealed</th>
                    <th scope="col">status</th>
                  </tr>
                </thead>
                <tbody>
                  {CHANNELS.map((channel) => (
                    <tr key={channel.name} className={channel.featured ? "is-featured" : undefined}>
                      <td>
                        <span className="vt-row__name">{channel.name}</span>
                        <span className="vt-row__note">{channel.note}</span>
                      </td>
                      <td>
                        <span className="vt-kind">{channel.kind}</span>
                      </td>
                      <td className="vt-size">{channel.size}</td>
                      <td>
                        <span className="vt-state">
                          <i aria-hidden="true" />
                          {channel.state}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ol className="vt-steps">
              {STEPS.map((step) => (
                <li key={step.num} className="vt-step">
                  <span className="vt-step__num">{step.num}</span>
                  <h3 className="vt-step__title">{step.title}</h3>
                  <p className="vt-step__text">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <aside className="vt-console__rail">
            <p className="vt-eyebrow">the three jobs</p>
            <ol className="vt-jobs">
              {JOBS.map((job, index) => (
                <li key={job.title} className="vt-run">
                  <span className="vt-run__num">0{index + 1}</span>
                  <div className="vt-run__body">
                    <h3 className="vt-run__title">{job.title}</h3>
                    <p className="vt-run__text">{job.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="vt-footnote">the house tree keeps every state recoverable — nothing executes inside the vault.</p>
          </aside>
        </div>
      </section>

      {/* the footer meta-quad, flush to the window floor */}
      <footer className="vt-quad" aria-label="vault footer">
        <div className="vt-quad__grid">
          <div className="vt-quad__col">
            <p className="vt-quad__head">store</p>
            <p className="vt-quad__text">two channels, one threshold — lfs for the masters, blobs for the small.</p>
          </div>
          <div className="vt-quad__col">
            <p className="vt-quad__head">guard</p>
            <p className="vt-quad__text">sha-256 and sha-1 digests attest every sealed byte.</p>
          </div>
          <div className="vt-quad__col">
            <p className="vt-quad__head">recover</p>
            <p className="vt-quad__text">backups ride the same house tree, beside the state they protect.</p>
          </div>
          <div className="vt-quad__col">
            <p className="vt-quad__head">family</p>
            <a
              className="vt-quad__link"
              href="https://github.com/wenathlan/devthink"
              target="_blank"
              rel="noreferrer"
            >
              the devthink family
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default Home;
