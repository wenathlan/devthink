/**
 * generate page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Generate — the generation loop closed (the pipeline waves PV4.004 and
// PV4.005): the prompt meets the composer over the profile (the references
// the session holds fold into the miner's own profile builder — the genre
// matrix's matcher over the document name, the same grouping law the miner
// lane rides), the seeded plan answers with the fresh-take salt law, and
// the render runs on the server through the typed client lane: the plan
// posts to the gateway queue, the poll reads the walk (queued → rendering
// → done), the wav lands in the blob store and the track row lands with
// the pointers. The take then plays through the shared bar (the blob lane
// the ingested references ride — one grammar), publishes to the vitrine
// (the streaming shelf the home grid reads) and downloads as wav (the
// blob bytes through the exporter's own save-dialog law). The vocal lane
// rides the "with voice" key — opt-in, never blocking: the seeded voice
// sings the melody over the instrumental plan at the pattern level. The
// local planTake lane stays as the honest fallback when no references of
// the genre answer the fold (the studio's own grammar, the notice says
// which lane answered). Same prompt and salt, same take, every time.
import { PauseRegular, PlayFilled } from "@fluentui/react-icons";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { planTake, type TakePlan, TOTAL_BARS } from "../../arranger.ts";
import { RENDER_TAIL_S } from "../../audioengine.ts";
import { formatClock } from "../../dawview.ts";
import {
  composeTake,
  fetchTakeWav,
  type GenerateReference,
  generateorigin,
  ownerid,
  pollRenderJob,
  publishTrack,
  queueRender,
} from "../../generateclient.ts";
import { GENRES, type GenreStyle, matchGenre } from "../../genrematrix.ts";
import { listingests } from "../../ingeststore.ts";
import { PROMPT_MAX_LENGTH } from "../../katexis.ts";
import { label, labelfill } from "../../labels.ts";
import { NOTE_NAMES } from "../../patternenums.ts";
import {
  busFeature,
  busPause,
  busPlay,
  busSubscribe,
  type PlayerSnapshot,
  type ReferenceTake,
  saveReferenceTake,
} from "../../playerbus.ts";
import { RENDER_SAMPLE_RATE, schedulePattern } from "../../renderworker.ts";
import { scheduleTake } from "../../takeevents.ts";
import { downloadFile } from "../../takeexporter.ts";
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

/** the poll window of the render walk (ms) and the honest cap on the loop */
const POLL_WAIT_MS = 700;
const POLL_LIMIT = 60;

/** One row of the render lane — a take walking the pipeline: composed
 * (the plan with its audit), rendering (the phase and the fraction the
 * meter reads), done (the wav pointer, the seconds, the bytes, the
 * publish state) or failed (the honest error). */
interface RenderLaneRow {
  /** the queued job id (the take identity the walk rides). */
  jobId: string;
  /** the track row the walk stamped (the publish key; null until done). */
  trackId: string | null;
  /** the display name (the prompt's first words). */
  name: string;
  /** the genre line (the plan's mood label). */
  genre: string;
  /** the key line (the plan's root and scale). */
  keyLabel: string;
  /** the tempo. */
  bpm: number;
  /** the bar count. */
  bars: number;
  /** the fresh-take salt ("" answers the canonical take). */
  salt: string;
  /** the voice verdict (the plan carries the sung notes). */
  voice: boolean;
  /** the cosine of the plan against the profile centroid. */
  similarity: number;
  /** the count of the references that fed the profile. */
  referenceCount: number;
  /** the walk state the row renders. */
  state: "composing" | "queued" | "rendering" | "composed" | "done" | "failed";
  /** the last completed phase the meter reads. */
  phase: string;
  /** the completed share of the walk (0..1). */
  fraction: number;
  /** the honest failure line. */
  error: string;
  /** the landed wav blob id (the play and the download lanes). */
  wavPointer: string | null;
  /** the rendered duration in seconds. */
  seconds: number;
  /** the wav byte count. */
  bytes: number;
  /** true once the owner published the row onto the vitrine. */
  published: boolean;
}

/** One awaited beat of the poll walk. */
const delay = (ms: number): Promise<void> => new Promise((resolve) => window.setTimeout(resolve, ms));

/** The key line of a pattern plan (the root and the scale, the studio's
 * own grammar). */
function keyLineOf(root: number, scale: string): string {
  return `${(NOTE_NAMES[root] ?? "c").toUpperCase()} ${scale}`;
}

export default function Generate() {
  // the footer links read the label store at render time (the manifest
  // answers english, the store answers the translated rows the seed protected)
  const FOOTER_LINKS: readonly NavLink[] = [
    { label: label("nav.studio"), href: "/studio" },
    { label: label("nav.generate"), href: "/generate" },
    { label: label("nav.settings"), href: "/settings" },
  ];

  const toast = useToast();
  const [, navigate] = useLocation();
  const [prompt, setPrompt] = useState("");
  const [seed, setSeed] = useState("");
  const [genreChoice, setGenreChoice] = useState<string>(AUTO_GENRE);
  const [voice, setVoice] = useState(false);
  const [records, setRecords] = useState<readonly TakeRecord[]>([]);
  const [lane, setLane] = useState<readonly RenderLaneRow[]>([]);
  const [view, setView] = useState<PlayerSnapshot | null>(null);

  // the shelf opens with what this session already rendered
  useEffect(() => {
    setRecords(loadTakeRecords(sessionStorageOrMemory()));
  }, []);

  // the shared bus answers the live transport state: the play keys wear
  // the sounding take on the render rows (the same snapshot the bar reads)
  useEffect(() => busSubscribe(setView), []);
  const soundingId = view?.playing ? (view.takes[view.index]?.id ?? "") : "";

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

  /** patches one render lane row (the walk drives its row through this). */
  const patchrow = (jobId: string, patch: Partial<RenderLaneRow>): void => {
    setLane((rows) => rows.map((row) => (row.jobId === jobId ? { ...row, ...patch } : row)));
  };

  /** the render walk: the poll loop reads the job until it lands (done or
   * failed), the take facts folding onto the row — the wav pointer, the
   * track id and the duration the plan's own laws answer (the bars span
   * plus the release tail, the same numbers the server lands). */
  const walk = async (row: RenderLaneRow, origin: string): Promise<void> => {
    for (let attempt = 0; attempt < POLL_LIMIT; attempt++) {
      await delay(POLL_WAIT_MS);
      const polled = await pollRenderJob(row.jobId, origin);
      if (!polled.ok) {
        patchrow(row.jobId, { state: "failed", error: polled.error.message });
        return;
      }
      const job = polled.data;
      if (job.state === "done") {
        patchrow(row.jobId, {
          state: "done",
          phase: "store",
          fraction: 1,
          wavPointer: job.wavPointer,
          trackId: job.trackPointer,
        });
        toast.show(
          labelfill("generate.toast.rendered", {
            name: row.name,
            clock: formatClock(row.seconds),
            kb: String(Math.round(row.bytes / 1000)),
          }),
          "success",
        );
        return;
      }
      if (job.state === "failed") {
        patchrow(row.jobId, { state: "failed", error: job.error ?? "the walk failed" });
        return;
      }
      patchrow(row.jobId, {
        state: job.state === "rendering" ? "rendering" : "queued",
        phase: job.phase ?? "",
        fraction: job.fraction,
      });
    }
    patchrow(row.jobId, { state: "failed", error: label("generate.lane.timeout") });
  };

  /** composes and renders the take — the pipeline's own walk: the fold
   * (the references of the genre feed the profile), the composer (the
   * seeded plan, the salt law, the opt-in voice), the server render (the
   * queue, the poll, the wav) and the shelf landing (the take plays
   * through the shared bar). */
  const compose = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    const text = prompt.trim();
    if (!text) {
      toast.show(label("generate.toast.needPrompt"), "error");
      return;
    }
    const salt = seed.trim();
    let references: readonly GenerateReference[] = [];
    try {
      references = (await listingests()).map((record) => ({
        id: record.id,
        name: record.doc.name,
        document: record.doc,
      }));
    } catch {
      /* the shelf refusing never blocks the fold — the empty corpus answers honestly */
    }
    const composed = composeTake({ prompt: text, salt, genreId: pinnedGenre, voice, references });
    if (!composed.ok) {
      if (composed.code === "no-references") {
        // the honest fallback: the local planTake lane (the studio's own
        // grammar) — the notice says which lane answered
        const plan: TakePlan = planTake({ prompt: text, seed: salt || "debonair", genreId: pinnedGenre });
        setRecords(saveTakePlan(plan, sessionStorageOrMemory()));
        toast.show(
          labelfill("generate.toast.composed", {
            name: plan.name,
            genre: plan.genreLabel,
            bpm: String(plan.bpm),
            key: plan.keyLabel,
          }),
          "info",
        );
        toast.show(label("generate.toast.noReferences"), "info");
        return;
      }
      toast.show(label("generate.toast.composeRefused"), "error");
      return;
    }
    const { plan, similarity, referenceCount, sung } = composed.composition;
    const span = schedulePattern(plan).duration + RENDER_TAIL_S;
    const bytes = 44 + Math.ceil(span * RENDER_SAMPLE_RATE) * 2;
    const row: RenderLaneRow = {
      jobId: "",
      trackId: null,
      name: plan.mood || plan.prompt || "untitled",
      genre: plan.mood,
      keyLabel: keyLineOf(plan.root, plan.scale),
      bpm: plan.bpm,
      bars: plan.bars,
      salt,
      voice: sung,
      similarity,
      referenceCount,
      state: "composing",
      phase: "",
      fraction: 0,
      error: "",
      wavPointer: null,
      seconds: span,
      bytes,
      published: false,
    };
    const origin = generateorigin();
    if (!origin) {
      setLane((rows) => [{ ...row, state: "composed" }, ...rows]);
      toast.show(label("generate.toast.needsGateway"), "info");
      return;
    }
    const queued = await queueRender({ plan, ownerId: ownerid(), origin });
    if (!queued.ok) {
      setLane((rows) => [{ ...row, state: "failed", error: queued.error.message }, ...rows]);
      toast.show(label("generate.toast.renderRefused"), "error");
      return;
    }
    const riding: RenderLaneRow = { ...row, jobId: queued.data.jobId, state: "queued" };
    setLane((rows) => [riding, ...rows]);
    void walk(riding, origin);
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

  /** the bus take of one landed render row — the rendered wav riding the
   * blob lane the ingested references ride (one grammar, the origin field
   * says the row came from the render lane). */
  const busTakeOf = (row: RenderLaneRow): ReferenceTake | null => {
    if (row.state !== "done" || row.wavPointer === null) return null;
    return {
      kind: "reference",
      id: row.trackId ?? row.jobId,
      name: row.name,
      origin: "render",
      source: {
        blobId: row.wavPointer,
        mime: "audio/wav",
        name: row.name,
        durationSeconds: row.seconds,
      },
    };
  };

  /** presses one landed take through the shared bar */
  const playRow = (row: RenderLaneRow): void => {
    const take = busTakeOf(row);
    if (!take) return;
    saveReferenceTake(take);
    if (soundingId === take.id) busPause();
    else {
      busFeature(take);
      busPlay(0);
    }
  };

  /** publishes one landed take onto the vitrine (the owner's move) */
  const publish = async (row: RenderLaneRow): Promise<void> => {
    const origin = generateorigin();
    if (row.trackId === null || !origin) {
      toast.show(label("generate.toast.publishRefused"), "error");
      return;
    }
    const answer = await publishTrack({ trackId: row.trackId, ownerId: ownerid(), origin });
    if (!answer.ok) {
      toast.show(label("generate.toast.publishRefused"), "error");
      return;
    }
    patchrow(row.jobId, { published: true });
    toast.show(labelfill("generate.toast.published", { name: row.name }), "success");
  };

  /** downloads one landed take as wav — the blob bytes through the
   * exporter's own save-dialog law */
  const download = async (row: RenderLaneRow): Promise<void> => {
    const origin = generateorigin();
    if (row.wavPointer === null || !origin) {
      toast.show(label("generate.toast.downloadRefused"), "error");
      return;
    }
    const answer = await fetchTakeWav({ blobId: row.wavPointer, origin });
    if (!answer.ok) {
      toast.show(label("generate.toast.downloadRefused"), "error");
      return;
    }
    downloadFile({
      name: `${row.name}.wav`,
      blob: new Blob([answer.data.bytes.slice().buffer as ArrayBuffer], { type: "audio/wav" }),
      label: labelfill("generate.toast.downloaded", {
        name: row.name,
        kb: String(Math.round(answer.data.byteCount / 1000)),
      }),
    });
    toast.show(
      labelfill("generate.toast.downloaded", {
        name: row.name,
        kb: String(Math.round(answer.data.byteCount / 1000)),
      }),
      "success",
    );
  };

  /** mints a fresh salt into the seed seat (the fresh-take law) */
  const freshTake = (): void => {
    setSeed(Math.random().toString(36).slice(2, 10));
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
            <legend className="field-label">
              {labelfill("generate.genre.legend", { count: String(GENRES.length) })}
            </legend>
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
          <fieldset className="cell-field">
            <legend className="field-label">{label("generate.voice.key")}</legend>
            <div className="cell-lane">
              <button
                type="button"
                className="btn small secondary"
                title={label("generate.fresh.title")}
                onClick={freshTake}
              >
                {label("generate.fresh.key")}
              </button>
              <button
                type="button"
                className="cell"
                aria-pressed={voice}
                title={label("generate.voice.title")}
                onClick={() => setVoice((on) => !on)}
              >
                {label("generate.voice.key")}
              </button>
            </div>
          </fieldset>
          <button className="btn gen-cta" type="submit">
            {label("generate.compose.submit")}
          </button>
        </form>
      </section>

      {/* the render lane: the takes this session pushed through the
          pipeline — composed, rendering, landed or failed, each row
          carrying its play, publish and download keys */}
      <section aria-labelledby="render-h">
        <h2 id="render-h" className="eyebrow" style={{ marginBottom: 14 }}>
          {labelfill("generate.lane.head", { count: String(lane.length), s: lane.length === 1 ? "" : "s" })}
        </h2>
        {lane.length === 0 ? (
          <div className="glass card">
            <p className="flush p-sm">{label("generate.lane.empty")}</p>
          </div>
        ) : (
          <div className="lane-list">
            {lane.map((row) => {
              const take = busTakeOf(row);
              const live = take !== null && soundingId === take.id;
              return (
                <article key={row.jobId} className="lane-row" data-state={row.state}>
                  <span className="lane-no" aria-hidden="true">
                    {row.jobId ? row.jobId.slice(0, 6) : "——"}
                  </span>
                  <div className="lane-body">
                    <div className="lane-head">
                      <span className="lane-name">{row.name}</span>
                      <span className="badge">{row.genre}</span>
                      {row.published ? (
                        <span className="badge success">{label("generate.render.published")}</span>
                      ) : row.state === "done" ? (
                        <span className="badge success">{label("generate.shelf.ready")}</span>
                      ) : null}
                    </div>
                    <div
                      className="cellrun"
                      data-state={row.state === "done" ? "ready" : row.state === "failed" ? "off" : "riding"}
                      aria-hidden="true"
                    >
                      {CELL_RUN.map((no) => (
                        <span key={`cell-${no}`} />
                      ))}
                    </div>
                    <p className="lane-meta">
                      {labelfill("generate.render.meta", {
                        key: row.keyLabel,
                        bpm: String(row.bpm),
                        bars: String(row.bars),
                        clock: formatClock(row.seconds),
                        kb: String(Math.round(row.bytes / 1000)),
                        salt: row.salt || label("generate.render.canonical"),
                        voice: label(row.voice ? "generate.render.voiced" : "generate.render.instrumental"),
                      })}
                    </p>
                    <p className="lane-meta">
                      {labelfill("generate.render.audit", {
                        count: String(row.referenceCount),
                        sim: row.similarity.toFixed(2),
                      })}
                      {row.state === "rendering"
                        ? ` · ${labelfill("generate.lane.rendering", {
                            phase: row.phase,
                            percent: String(Math.round(row.fraction * 100)),
                          })}`
                        : row.state === "queued"
                          ? ` · ${label("generate.lane.queued")}`
                          : row.state === "composed"
                            ? ` · ${label("generate.lane.composed")}`
                            : row.state === "failed"
                              ? ` · ${labelfill("generate.lane.failed", { error: row.error })}`
                              : ""}
                    </p>
                    {row.state === "done" ? (
                      <div className="lane-actions">
                        <button
                          className="btn small secondary"
                          type="button"
                          onClick={() => playRow(row)}
                          aria-label={labelfill(live ? "generate.render.pauseAria" : "generate.render.playAria", {
                            name: row.name,
                          })}
                        >
                          {live ? (
                            <PauseRegular fontSize={14} aria-hidden="true" />
                          ) : (
                            <PlayFilled fontSize={14} aria-hidden="true" />
                          )}
                        </button>
                        {row.trackId !== null ? (
                          <button
                            className="btn small secondary"
                            type="button"
                            onClick={() => publish(row)}
                            disabled={row.published}
                            aria-label={labelfill("generate.render.publishAria", { name: row.name })}
                          >
                            {label("generate.render.publish")}
                          </button>
                        ) : null}
                        <button
                          className="btn small secondary"
                          type="button"
                          onClick={() => download(row)}
                          aria-label={labelfill("generate.render.downloadAria", { name: row.name })}
                        >
                          {label("generate.render.download")}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* the session shelf: the takes this browser session composed on the
          local lane (the studio's own grammar — the fallback the references
          gate answers) */}
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
