/**
 * generate page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Generate — the composer, wired to the katexis engine for real (campaign
// 5-b): the prompt lands in arranger.planTake — genre matrix match, seeded
// bpm, key, chord timeline, rhythmgrammar grid, timelinemodel clips, mixer
// desk — and the take lands in the session shelf (takestore) the studio and
// the library read. Same prompt and seed, same take, every time. The genre
// lane carries the engine's own fifteen-entry matrix with its real bpm
// ranges, pattern families and loudness targets; nothing here is simulated.
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { planTake, type TakePlan, TOTAL_BARS } from "../../arranger.ts";
import { formatClock } from "../../dawview.ts";
import { GENRES, type GenreStyle, matchGenre } from "../../genrematrix.ts";
import { PROMPT_MAX_LENGTH } from "../../katexis.ts";
import { scheduleTake } from "../../takeevents.ts";
import {
  loadTakeRecords,
  saveTakePlan,
  sessionStorageOrMemory,
  TAKE_SELECT_KEY,
  type TakeRecord,
} from "../../takestore.ts";
import { type NavLink, Shell } from "../shell/Shell.tsx";
import { useToast } from "../toast/Toast.tsx";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Studio", href: "/studio" },
  { label: "Library", href: "/library" },
  { label: "Settings", href: "/settings" },
];

/** the session key of the hero draft (the landing hands its prompt over) */
export const PROMPT_DRAFT_KEY = "debonair.draft";

/** the draft payload the landing hands to the composer */
export type PromptDraft = { text: string; genre?: string };

/** the id of the "let the prompt decide" chip */
const AUTO_GENRE = "auto";

/** the fixed cell run the ready lanes draw (presentation, not a timer) */
const CELL_RUN: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Generate() {
  const toast = useToast();
  const [, navigate] = useLocation();
  const [prompt, setPrompt] = useState("");
  const [seed, setSeed] = useState("");
  const [genreChoice, setGenreChoice] = useState<string>(AUTO_GENRE);
  const [records, setRecords] = useState<readonly TakeRecord[]>([]);

  // the shelf opens with what this session already rendered
  useEffect(() => {
    setRecords(loadTakeRecords(sessionStorageOrMemory()));
  }, []);

  // the landing hands its draft over: the prompt and the mood chip land in
  // the composer once, then the session note is spent
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(PROMPT_DRAFT_KEY);
      window.sessionStorage.removeItem(PROMPT_DRAFT_KEY);
      if (!raw) return;
      const hand = JSON.parse(raw) as PromptDraft;
      if (hand.text) setPrompt(hand.text);
      if (hand.genre && GENRES.some((genre) => genre.id === hand.genre)) setGenreChoice(hand.genre);
    } catch {
      /* no draft or unparsable: the composer starts clean */
    }
  }, []);

  /** the genre the composer pins: the chip, or the prompt's own match */
  const pinnedGenre = useMemo<string | undefined>(
    () => (genreChoice === AUTO_GENRE ? undefined : genreChoice),
    [genreChoice],
  );

  /** the resolved genre for the readout (what the next render would use) */
  const readoutGenre: GenreStyle = useMemo(() => {
    const text = prompt.trim();
    if (pinnedGenre) return GENRES.find((genre) => genre.id === pinnedGenre) ?? GENRES[0];
    return matchGenre(text) ?? GENRES[0];
  }, [pinnedGenre, prompt]);

  /** composes the take: the real engine plan, saved to the session shelf */
  const compose = (event: FormEvent): void => {
    event.preventDefault();
    const text = prompt.trim();
    if (!text) {
      toast.show("Describe the track first — even three words help", "error");
      return;
    }
    const plan: TakePlan = planTake({ prompt: text, seed: seed.trim() || "debonair", genreId: pinnedGenre });
    setRecords(saveTakePlan(plan, sessionStorageOrMemory()));
    toast.show(`${plan.name} composed — ${plan.genreLabel} · ${plan.bpm} bpm · ${plan.keyLabel}`, "success");
  };

  /** hands a take to the studio through the session note */
  const openInStudio = (plan: TakePlan): void => {
    try {
      sessionStorageOrMemory().setItem(TAKE_SELECT_KEY, plan.id);
    } catch {
      /* the studio simply opens on its default take */
    }
    navigate("/studio");
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
      <p className="reveal lede" style={{ maxWidth: 640 }}>
        Text-to-music on the <code>katexis</code> engine: the prompt maps to a genre of the matrix, the seed locks the
        take, and the arrangement — key, chords, drum grid, clips, desk — is composed right here in your browser. Same
        prompt and seed always return the same take.
      </p>

      {/* the composer stage */}
      <section className="gen-stage halftone reveal" aria-labelledby="form-h">
        <h2 id="form-h" className="card-h">
          Compose a take
        </h2>
        <form onSubmit={compose} noValidate>
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
              One line is enough — genre, mood, key or a scene. {PROMPT_MAX_LENGTH} characters max. Working readout:{" "}
              <strong className="ink-strong">
                {readoutGenre.label} · {readoutGenre.bpmin}–{readoutGenre.bpmax} bpm · {readoutGenre.pattern} drums ·{" "}
                {readoutGenre.scales.join(" / ")} · {readoutGenre.lufs} LUFS target
              </strong>
            </p>
          </div>
          <div className="field">
            <label htmlFor="seed">Seed</label>
            <input
              id="seed"
              className="input"
              type="text"
              value={seed}
              placeholder="debonair"
              aria-describedby="seed-hint"
              onChange={(event) => setSeed(event.target.value)}
            />
            <p id="seed-hint" className="gen-hint">
              The deterministic lock — change it for a different take of the same prompt.
            </p>
          </div>
          <fieldset className="cell-field">
            <legend className="field-label">Genre — the engine matrix, all {GENRES.length}</legend>
            <div className="cell-lane">
              <button
                type="button"
                className="cell"
                aria-pressed={genreChoice === AUTO_GENRE}
                onClick={() => setGenreChoice(AUTO_GENRE)}
              >
                match from prompt
              </button>
              {GENRES.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  className="cell"
                  aria-pressed={genreChoice === genre.id}
                  onClick={() => setGenreChoice(genre.id)}
                  title={`${genre.bpmin}–${genre.bpmax} bpm · ${genre.pattern} · ${genre.lufs} LUFS`}
                >
                  {genre.label}
                </button>
              ))}
            </div>
          </fieldset>
          <button className="btn gen-cta" type="submit">
            Compose with katexis
          </button>
        </form>
      </section>

      {/* the session shelf: the takes this browser session composed */}
      <section aria-labelledby="shelf-h">
        <h2 id="shelf-h" className="eyebrow" style={{ marginBottom: 14 }}>
          session shelf — {records.length} take{records.length === 1 ? "" : "s"}
        </h2>
        {records.length === 0 ? (
          <div className="glass card">
            <p className="flush p-sm">
              Nothing composed yet. Describe a track above — the arrangement plan (key, chords, drum grid, clips, desk)
              appears here with its seed and lands in the studio and the library.
            </p>
          </div>
        ) : (
          <div className="lane-list">
            {records.map((record) => {
              const plan = record.plan;
              const schedule = scheduleTake(plan);
              return (
                <article key={plan.id} className="lane-row">
                  <span className="lane-no" aria-hidden="true">
                    {plan.id.slice(0, 6)}
                  </span>
                  <div className="lane-body">
                    <div className="lane-head">
                      <span className="lane-name">{plan.name}</span>
                      <span className="badge">{plan.genreLabel}</span>
                      <span className="badge success">ready</span>
                    </div>
                    <div className="cellrun" data-state="ready" aria-hidden="true">
                      {CELL_RUN.map((no) => (
                        <span key={`cell-${no}`} />
                      ))}
                    </div>
                    <p className="lane-meta">
                      {plan.keyLabel} · {plan.bpm} bpm · {plan.bars} bars ({TOTAL_BARS}) ·{" "}
                      {formatClock(plan.durationSeconds)} · {schedule.events.length} events · seed {plan.seed}
                    </p>
                    <div className="lane-actions">
                      <button className="btn small secondary" type="button" onClick={() => openInStudio(plan)}>
                        Open in studio
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="glass card reveal mt-18" style={{ maxWidth: 660 }}>
        <h2 className="card-h">What the engine just did</h2>
        <p className="flush">
          The prompt scored every genre of <code>genrematrix</code>, the seed fed the engine's mulberry rng, and{" "}
          <code>harmonyengine</code> wrote the chord timeline over the picked key. <code>rhythmgrammar</code> laid the
          drum grid with accents, swing and fills, <code>timelinemodel</code> placed the section clips and{" "}
          <code>mixergraph</code> opened the desk. The studio schedules the same plan on the WebAudio clock — nothing
          was simulated, and nothing leaves this tab: the shelf rides the session storage only.
        </p>
      </section>
    </Shell>
  );
}
