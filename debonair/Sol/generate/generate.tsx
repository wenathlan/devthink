/**
 * generate page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Generate — sub-anchor of the generate page: the text-to-music demo. The prompt
// flows through the katexis helpers (seed, name, duration) and the queue renders
// staged transitions in memory — no audio leaves the browser, nothing is stored.
// The Sumo read (wave C1): the composer is one stage panel, the genres are a
// lane of saturated violet loop cells (varied spans, five saturation steps),
// the actions are transport-style 44px round-cornered buttons and every queued
// job renders as a track lane whose loop-cell run lights cell by cell.
import { type FormEvent, useEffect, useState } from "react";
import { listGenres } from "../../catalog.ts";
import type { GenreConfig } from "../../katexis.ts";
import { deriveSeed, estimateDuration, PROMPT_MAX_LENGTH, trackNameFromPrompt } from "../../katexis.ts";
import { type NavLink, Shell } from "../shell/Shell";
import { useToast } from "../toast/Toast";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Studio", href: "/studio" },
  { label: "Library", href: "/library" },
  { label: "Settings", href: "/settings" },
];

/** cells of one loop-cell run (the render lane) — a fixed, deterministic set */
const CELLRUN: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8];

type Stage = "queued" | "rendering" | "ready";

type QueueJob = {
  id: number;
  name: string;
  genreLabel: string;
  seed: number;
  duration: string;
  stage: Stage;
};

const RENDERING_MS = 1300;
const READY_MS = 4600;

export default function Generate() {
  const toast = useToast();
  const [genres, setGenres] = useState<readonly GenreConfig[]>([]);
  const [prompt, setPrompt] = useState("");
  const [genreId, setGenreId] = useState("techno");
  const [jobs, setJobs] = useState<readonly QueueJob[]>([]);
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    let live = true;
    listGenres().then((rows) => {
      if (live) setGenres(rows);
    });
    return () => {
      live = false;
    };
  }, []);

  const queueRender = (event: FormEvent): void => {
    event.preventDefault();
    const text = prompt.trim();
    if (!text) {
      toast.show("Describe the track first — even three words help", "error");
      return;
    }

    const genre = genres.find((item) => item.id === genreId);
    const job: QueueJob = {
      id: nextId,
      name: trackNameFromPrompt(text),
      genreLabel: genre?.label ?? "Techno",
      seed: deriveSeed(),
      duration: estimateDuration(),
      stage: "queued",
    };
    setNextId((current) => current + 1);
    setJobs((current) => [job, ...current]);
    toast.show(`Render queued — seed ${job.seed}`, "success");

    window.setTimeout(() => {
      setJobs((current) => current.map((item) => (item.id === job.id ? { ...item, stage: "rendering" } : item)));
    }, RENDERING_MS);

    window.setTimeout(() => {
      setJobs((current) => current.map((item) => (item.id === job.id ? { ...item, stage: "ready" } : item)));
      toast.show(`${job.name} is ready — 48 kHz WAV sent to Library`, "success");
    }, READY_MS);
  };

  return (
    <Shell
      name="debonair"
      contained
      cta={{ label: "Open studio", href: "/studio" }}
      footerLinks={FOOTER_LINKS}
      domain="devthink.pro"
    >
      <p className="eyebrow reveal">debonair · generate</p>
      <h1 className="reveal page-title">Generate</h1>
      <p className="reveal lede" style={{ maxWidth: 620 }}>
        Text-to-music, the debonair way: parse the prompt, map the mood, choose key and BPM, plan the structure
        (F-DBN-023..025). This page runs the flow with a <strong className="ink-strong">simulated render</strong> — the
        queue lives in memory, no audio leaves your browser.
      </p>

      {/* the composer stage: one lane, loop cells for the genres, a transport-style
          action — the mark stays in the title bar, the eyebrow names the app */}
      <section className="gen-stage halftone reveal" aria-labelledby="form-h">
        <h2 id="form-h" className="card-h">
          New render
        </h2>
        <form onSubmit={queueRender} noValidate>
          <div className="field">
            <label htmlFor="prompt">Prompt</label>
            <textarea
              id="prompt"
              className="input"
              rows={3}
              maxLength={PROMPT_MAX_LENGTH}
              placeholder="e.g. Late-night trap, C minor, 140 BPM, dark 808s and airy pads"
              aria-describedby="prompt-hint"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
            <p id="prompt-hint" className="gen-hint">
              One line is enough — genre, mood, key or a scene. 280 characters max.
            </p>
          </div>
          <fieldset className="cell-field">
            <legend className="field-label">Genre</legend>
            <div className="cell-lane">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  className="cell"
                  aria-pressed={genre.id === genreId}
                  onClick={() => setGenreId(genre.id)}
                >
                  {genre.label}
                </button>
              ))}
            </div>
            <p className="gen-hint">
              15 genres from <code>GENRE_CONFIG</code> — each with its own BPM range, scales and drum style.
            </p>
          </fieldset>
          <button className="btn gen-cta" type="submit">
            Queue render
          </button>
        </form>
      </section>

      {/* the render queue: editorial track lanes with loop-cell runs */}
      <section aria-labelledby="queue-h">
        <h2 id="queue-h" className="eyebrow" style={{ marginBottom: 14 }}>
          render queue
        </h2>
        {jobs.length === 0 ? (
          <div className="glass card">
            <p className="flush p-sm">
              Nothing queued yet. Your renders will appear here with seed, duration and status — queued, rendering,
              ready.
            </p>
          </div>
        ) : (
          <div className="lane-list">
            {jobs.map((job) => (
              <article key={job.id} className={`lane-row${job.stage === "rendering" ? " is-rendering" : ""}`}>
                <span className="lane-no" aria-hidden="true">
                  {String(job.id).padStart(2, "0")}
                </span>
                <div className="lane-body">
                  <div className="lane-head">
                    <span className="lane-name">{job.name}</span>
                    <span className="badge">{job.genreLabel}</span>
                    <span
                      className={`badge${job.stage === "ready" ? " success" : job.stage === "rendering" ? " warning" : " info"}`}
                    >
                      {job.stage === "rendering" ? (
                        <>
                          <span className="dot" />
                          {job.stage}
                        </>
                      ) : (
                        job.stage
                      )}
                    </span>
                  </div>
                  <div className="cellrun" data-state={job.stage} aria-hidden="true">
                    {CELLRUN.map((cell) => (
                      <span key={cell} />
                    ))}
                  </div>
                  {job.stage === "ready" ? (
                    <p className="lane-meta">
                      seed {job.seed} · {job.duration} · 48 kHz WAV
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="glass card reveal mt-18" style={{ maxWidth: 640 }}>
        <h2 className="card-h">Demo scope</h2>
        <p className="flush">
          The queue is a client-side demo: jobs are stored in memory and status transitions are timers. The real
          pipeline — plan inspection, quality checks, LUFS mastering and WAV export — ships with the{" "}
          <code>katexis</code> engine.
        </p>
      </section>
    </Shell>
  );
}
