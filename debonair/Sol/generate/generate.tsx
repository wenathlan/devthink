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
import { label, labelfill } from "../../labels.ts";
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

/** the session key of the hero draft (the landing hands its prompt over) */
export const PROMPT_DRAFT_KEY = "debonair.draft";

/** the draft payload the landing hands to the composer */
export type PromptDraft = { text: string; genre?: string };

/** the id of the "let the prompt decide" chip */
const AUTO_GENRE = "auto";

/** the fixed cell run the ready lanes draw (presentation, not a timer) */
const CELL_RUN: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Generate() {
  // the footer links read the label store at render time (the manifest
  // answers english, the store answers the translated rows the seed protected)
  const FOOTER_LINKS: readonly NavLink[] = [
    { label: label("nav.studio"), href: "/studio" },
    { label: label("nav.library"), href: "/library" },
    { label: label("nav.settings"), href: "/settings" },
  ];

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
      toast.show(label("generate.toast.needPrompt"), "error");
      return;
    }
    const plan: TakePlan = planTake({ prompt: text, seed: seed.trim() || "debonair", genreId: pinnedGenre });
    setRecords(saveTakePlan(plan, sessionStorageOrMemory()));
    toast.show(
      labelfill("generate.toast.composed", {
        name: plan.name,
        genre: plan.genreLabel,
        bpm: String(plan.bpm),
        key: plan.keyLabel,
      }),
      "success",
    );
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
      cta={{ label: label("generate.cta"), href: "/studio" }}
      footerLinks={FOOTER_LINKS}
      domain="devthink.pro"
    >
      <p className="eyebrow reveal">{label("generate.eyebrow")}</p>
      <h1 className="reveal page-title">{label("generate.title")}</h1>
      <p className="reveal lede" style={{ maxWidth: 640 }}>
        {label("generate.ledeLead")}
        <code>studio</code>
        {label("generate.ledeTail")}
      </p>

      {/* the composer stage */}
      <section className="gen-stage halftone reveal" aria-labelledby="form-h">
        <h2 id="form-h" className="card-h">
          {label("generate.compose.title")}
        </h2>
        <form onSubmit={compose} noValidate>
          <div className="field">
            <label htmlFor="prompt">{label("generate.prompt.label")}</label>
            <textarea
              id="prompt"
              className="input"
              rows={3}
              maxLength={PROMPT_MAX_LENGTH}
              placeholder={label("generate.prompt.placeholder")}
              aria-describedby="prompt-hint"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
            <p id="prompt-hint" className="gen-hint">
              {labelfill("generate.prompt.hint", { max: String(PROMPT_MAX_LENGTH) })}
              <strong className="ink-strong">
                {labelfill("generate.prompt.readout", {
                  label: readoutGenre.label,
                  min: String(readoutGenre.bpmin),
                  max: String(readoutGenre.bpmax),
                  pattern: readoutGenre.pattern,
                  scales: readoutGenre.scales.join(" / "),
                  lufs: String(readoutGenre.lufs),
                })}
              </strong>
            </p>
          </div>
          <div className="field">
            <label htmlFor="seed">{label("generate.seed.label")}</label>
            <input
              id="seed"
              className="input"
              type="text"
              value={seed}
              placeholder={label("generate.seed.placeholder")}
              aria-describedby="seed-hint"
              onChange={(event) => setSeed(event.target.value)}
            />
            <p id="seed-hint" className="gen-hint">
              {label("generate.seed.hint")}
            </p>
          </div>
          <fieldset className="cell-field">
            <legend className="field-label">{labelfill("generate.genre.legend", { count: String(GENRES.length) })}</legend>
            <div className="cell-lane">
              <button
                type="button"
                className="cell"
                aria-pressed={genreChoice === AUTO_GENRE}
                onClick={() => setGenreChoice(AUTO_GENRE)}
              >
                {label("generate.genre.auto")}
              </button>
              {GENRES.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  className="cell"
                  aria-pressed={genreChoice === genre.id}
                  onClick={() => setGenreChoice(genre.id)}
                  title={labelfill("generate.genre.chipTitle", {
                    min: String(genre.bpmin),
                    max: String(genre.bpmax),
                    pattern: genre.pattern,
                    lufs: String(genre.lufs),
                  })}
                >
                  {genre.label}
                </button>
              ))}
            </div>
          </fieldset>
          <button className="btn gen-cta" type="submit">
            {label("generate.compose.submit")}
          </button>
        </form>
      </section>

      {/* the session shelf: the takes this browser session composed */}
      <section aria-labelledby="shelf-h">
        <h2 id="shelf-h" className="eyebrow" style={{ marginBottom: 14 }}>
          {labelfill("generate.shelf.title", { count: String(records.length), s: records.length === 1 ? "" : "s" })}
        </h2>
        {records.length === 0 ? (
          <div className="glass card">
            <p className="flush p-sm">{label("generate.shelf.empty")}</p>
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
                      <span className="badge success">{label("generate.shelf.ready")}</span>
                    </div>
                    <div className="cellrun" data-state="ready" aria-hidden="true">
                      {CELL_RUN.map((no) => (
                        <span key={`cell-${no}`} />
                      ))}
                    </div>
                    <p className="lane-meta">
                      {labelfill("generate.row.meta", {
                        key: plan.keyLabel,
                        bpm: String(plan.bpm),
                        bars: String(plan.bars),
                        total: String(TOTAL_BARS),
                        clock: formatClock(plan.durationSeconds),
                        events: String(schedule.events.length),
                        seed: plan.seed,
                      })}
                    </p>
                    <div className="lane-actions">
                      <button className="btn small secondary" type="button" onClick={() => openInStudio(plan)}>
                        {label("generate.row.open")}
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
        <h2 className="card-h">{label("generate.explain.title")}</h2>
        <p className="flush">
          {label("generate.explain.lead")}
          <code>genrematrix</code>
          {label("generate.explain.mid1")}
          <code>harmonyengine</code>
          {label("generate.explain.mid2")}
          <code>rhythmgrammar</code>
          {label("generate.explain.mid3")}
          <code>timelinemodel</code>
          {label("generate.explain.mid4")}
          <code>mixergraph</code>
          {label("generate.explain.mid5")}
        </p>
      </section>
    </Shell>
  );
}
