// # Generate — sub-anchor of the generate page: the text-to-music demo. The prompt
// flows through the katexis helpers (seed, name, duration) and the queue renders
// staged transitions in memory — no audio leaves the browser, nothing is stored.
import { useEffect, useState, type FormEvent } from "react";
import { Shell, type NavLink } from "../shell/Shell";
import { listGenres } from "../../catalog.ts";
import { deriveSeed, estimateDuration, trackNameFromPrompt, PROMPT_MAX_LENGTH } from "../../katexis.ts";
import type { GenreConfig } from "../../katexis.ts";
import { useToast } from "../toast/Toast";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Studio", href: "/studio" },
  { label: "Library", href: "/library" },
  { label: "Settings", href: "/settings" },
];

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
      <p className="eyebrow reveal">generate · text-to-music</p>
      <h1 className="reveal page-title">Generate</h1>
      <p className="reveal lede" style={{ maxWidth: 620 }}>
        Text-to-music, the debonair way: parse the prompt, map the mood, choose key and BPM, plan the structure (F-DBN-023..025). This page runs the flow with a <strong className="ink-strong">simulated render</strong> — the queue lives in memory, no audio leaves your browser.
      </p>

      <div className="grid cols-2" style={{ alignItems: "start" }}>
        <section className="glass card reveal" aria-labelledby="form-h">
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
              <p id="prompt-hint" style={{ fontSize: "0.78rem", margin: "6px 0 0" }}>
                One line is enough — genre, mood, key or a scene. 280 characters max.
              </p>
            </div>
            <div className="field">
              <label htmlFor="genre">Genre</label>
              <select id="genre" className="input" value={genreId} onChange={(event) => setGenreId(event.target.value)}>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.label}
                  </option>
                ))}
              </select>
              <p style={{ fontSize: "0.78rem", margin: "6px 0 0" }}>
                15 genres from <code>GENRE_CONFIG</code> — each with its own BPM range, scales and drum style.
              </p>
            </div>
            <button className="btn" type="submit">
              Queue render
            </button>
          </form>
        </section>

        <section aria-labelledby="queue-h">
          <h2 id="queue-h" className="eyebrow" style={{ marginBottom: 14 }}>
            render queue
          </h2>
          <div>
            {jobs.length === 0 ? (
              <div className="glass card">
                <p className="flush p-sm">Nothing queued yet. Your renders will appear here with seed, duration and status — queued, rendering, ready.</p>
              </div>
            ) : (
              jobs.map((job) => (
                <article key={job.id} className={`glass card job${job.stage === "rendering" ? " is-rendering" : ""}`}>
                  <div className="job-head">
                    <div>
                      <span className="job-name">{job.name}</span> <span className="badge">{job.genreLabel}</span>
                    </div>
                    <span className={`badge${job.stage === "ready" ? " success" : job.stage === "rendering" ? " warning" : " info"}`}>
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
                  {job.stage !== "ready" ? (
                    <div className="progress" aria-hidden="true">
                      <i />
                    </div>
                  ) : null}
                  {job.stage === "ready" ? (
                    <p className="job-meta">
                      seed {job.seed} · {job.duration} · 48 kHz WAV
                    </p>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="glass card reveal mt-18" style={{ maxWidth: 640 }}>
        <h2 className="card-h">Demo scope</h2>
        <p className="flush">
          The queue is a client-side demo: jobs are stored in memory and status transitions are timers. The real pipeline — plan inspection, quality checks, LUFS mastering and WAV export — ships with the <code>katexis</code> engine.
        </p>
      </section>
    </Shell>
  );
}
