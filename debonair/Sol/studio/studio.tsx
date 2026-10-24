/**
 * studio page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Studio — the DAW (campaign 5-b), re-dressed on the suno canvas (2-b):
// the page rides STAGES now — the stepper on top (prompt → lyrics → style →
// generate → takes → mix, the owner's order) scrolls the page to its section
// while the FL-grade console underneath stays exactly the engine it was: the
// transport keys drive the WebAudio clock of audioengine.ts, the playlist
// draws the timelinemodel clips, the channel rack renders the rhythmgrammar
// grid and the mixer strips ride mixergraph onto the live buses. Every number
// is the engine's: bpm, key, chords, pattern family, LUFS target.
import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { rebaseSchedule } from "../../arrangement.ts";
import { type ArrangerRole, beatSecondsOf, planTake, RACK_LANES, type TakePlan, validatePlan } from "../../arranger.ts";
import { TakeEngine } from "../../audioengine.ts";
import { formatClock, formatGain } from "../../dawview.ts";
import { effectiveGainDb, graphFromStrips, type MixerGraph, patchChannel } from "../../mixergraph.ts";
import { reduceMotionApplied } from "../../motionpref.ts";
import { type EditableNote, notesToSchedule, scheduleToNotes } from "../../pianoroll.ts";
import { busHush } from "../../playerbus.ts";
import type { StageId } from "../../stages.ts";
import { positionAt } from "../../takeevents.ts";
import { downloadFile, EXPORT_LABELS, type ExportKind, exportTake } from "../../takeexporter.ts";
import {
  findTakeRecord,
  loadTakeRecords,
  saveTakePlan,
  sessionStorageOrMemory,
  TAKE_SELECT_KEY,
} from "../../takestore.ts";
import type { TimelineClip } from "../../timelinemodel.ts";
import { label, labelfill } from "../../labels.ts";
import { type NavLink, Shell } from "../shell/Shell.tsx";
import { Fader } from "../widgets";
import { PianoRoll } from "../widgets";
import { StageStepper } from "../widgets";
import { Spectrum } from "../widgets";
import { Timeline } from "../widgets";
import { VuMeter } from "../widgets";

/** the demo take: a real engine plan over a fixed prompt and seed */
const DEMO_PROMPT = "midnight studio take, warm sub bass, dusty keys, brass light";
const DEMO_SEED = "debonair-demo";

/** the step numbers the channel rack draws (1-based, like the desk) */
const STEP_NOS: readonly number[] = Array.from({ length: 16 }, (_, step) => step + 1);

export default function Studio() {
  // the footer links read the label store at render time (the manifest
  // answers english, the store answers the translated rows the seed protected)
  const FOOTER_LINKS: readonly NavLink[] = [
    { label: label("nav.generate"), href: "/generate" },
    { label: label("nav.library"), href: "/library" },
    { label: label("nav.settings"), href: "/settings" },
  ];

  const engineRef = useRef<TakeEngine | null>(null);
  /** the take id the transport last loaded (the edit reloads keep the ride). */
  const loadedIdRef = useRef<string | null>(null);
  const [plans, setPlans] = useState<readonly TakePlan[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [graph, setGraph] = useState<MixerGraph | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(true);
  const [position, setPosition] = useState(0);
  const [activeStage, setActiveStage] = useState<StageId>("prompt");
  const [levels, setLevels] = useState<Record<ArrangerRole, number>>({
    drums: Number.NEGATIVE_INFINITY,
    bass: Number.NEGATIVE_INFINITY,
    keys: Number.NEGATIVE_INFINITY,
    lead: Number.NEGATIVE_INFINITY,
  });
  const [notice, setNotice] = useState<string>("");
  const [arrangement, setArrangement] = useState<readonly TimelineClip[] | null>(null);
  const [edits, setEdits] = useState<readonly EditableNote[] | null>(null);
  const [selectedClipId, setSelectedClipId] = useState("");
  const [busyExport, setBusyExport] = useState<ExportKind | "">("");
  const stageRefs = useRef(new Map<StageId, HTMLElement | null>());

  const plan = useMemo(() => plans.find((take) => take.id === selectedId) ?? plans[0] ?? null, [plans, selectedId]);
  /** the desk's arrangement: null rides the plan's own seeded clips. */
  const effectivePlan = useMemo(
    () => (plan && arrangement ? { ...plan, clips: [...arrangement] } : plan),
    [plan, arrangement],
  );
  /** the schedule the desk plays: the roll owns it when edited, the
      arrangement re-slice answers otherwise (the identity feeds through). */
  const schedule = useMemo(() => {
    if (!plan || !effectivePlan) return null;
    if (edits) {
      try {
        return notesToSchedule(edits, plan);
      } catch {
        /* a refused roll rebuild answers the re-slice — the desk never lies */
      }
    }
    try {
      return rebaseSchedule(plan, effectivePlan.clips);
    } catch {
      return null;
    }
  }, [plan, effectivePlan, edits]);
  const problems = useMemo(() => (plan ? validatePlan(plan) : []), [plan]);

  // the engine lives once per mount and is disposed with the page; the
  // shared bar transport hushes first — one audible transport at a time
  useEffect(() => {
    busHush();
    engineRef.current = new TakeEngine();
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  // the take shelf: the stored renders plus the demo plan (always present)
  useEffect(() => {
    const store = sessionStorageOrMemory();
    const demo = planTake({ prompt: DEMO_PROMPT, seed: DEMO_SEED });
    const stored = loadTakeRecords(store).map((record) => record.plan);
    const hands = [demo, ...stored.filter((take) => take.id !== demo.id)];
    setPlans(hands);
    const hand = findTakeRecord(store.getItem(TAKE_SELECT_KEY) ?? "", store);
    store.removeItem(TAKE_SELECT_KEY);
    setSelectedId(hand?.plan.id ?? hands[0].id);
  }, []);

  // a take change opens the desk fresh; a desk edit keeps the transport
  // alive and re-rides the faders — the desk plays exactly what it shows
  useEffect(() => {
    if (!plan || !schedule || !effectivePlan) return;
    try {
      setGraph(graphFromStrips(plan.strips));
    } catch {
      setGraph(null);
    }
    const engine = engineRef.current;
    if (!engine) return;
    const isNew = loadedIdRef.current !== plan.id;
    const wasPlaying = engine.isPlaying;
    const at = engine.position();
    let live = true;
    engine
      .load(effectivePlan, schedule)
      .then(() => {
        if (!live) return;
        for (const strip of plan.strips) {
          if (strip.master) engine.setMasterGain(strip.faderDb);
          else engine.setRoleGain(strip.name as ArrangerRole, strip.faderDb);
        }
        if (isNew) {
          loadedIdRef.current = plan.id;
          setPosition(0);
          setPlaying(false);
          setArrangement(null);
          setEdits(null);
          setSelectedClipId("");
        } else if (wasPlaying) {
          engine.play(at);
          setPlaying(true);
        }
      })
      .catch((error: unknown) => {
        if (live) setNotice(error instanceof Error ? error.message : label("studio.notice.transportTake"));
      });
    return () => {
      live = false;
    };
  }, [plan, effectivePlan, schedule]);

  // the playhead + the VU taps ride the clock while the transport runs
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const ride = (): void => {
      const engine = engineRef.current;
      if (engine) {
        setPosition(engine.position());
        setLevels(engine.levels());
      }
      frame = window.requestAnimationFrame(ride);
    };
    frame = window.requestAnimationFrame(ride);
    return () => window.cancelAnimationFrame(frame);
  }, [playing]);

  const play = useCallback((): void => {
    const engine = engineRef.current;
    if (!engine || !plan) return;
    try {
      engine.play(position >= plan.durationSeconds - 0.01 ? 0 : position);
      engine.loop = loop;
      setPlaying(true);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : label("studio.notice.transportStart"));
    }
  }, [loop, plan, position]);

  const stop = useCallback((): void => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.stop();
    setPlaying(false);
  }, []);

  const toggleLoop = useCallback((): void => {
    setLoop((current) => {
      const next = !current;
      if (engineRef.current) engineRef.current.loop = next;
      return next;
    });
  }, []);

  const togglePlay = useCallback((): void => {
    if (playing) stop();
    else play();
  }, [play, playing, stop]);

  const seek = useCallback(
    (seconds: number): void => {
      if (!plan) return;
      const clamped = Math.min(Math.max(0, seconds), plan.durationSeconds);
      setPosition(clamped);
      if (engineRef.current?.isPlaying) {
        engineRef.current.stop();
        engineRef.current.play(clamped);
      }
    },
    [plan],
  );

  const patchDesk = useCallback((role: string, patch: { gaindb?: number; mute?: boolean; solo?: boolean }): void => {
    setGraph((current) => (current ? patchChannel(current, role, patch) : current));
  }, []);

  const setFader = useCallback(
    (role: string, db: number): void => {
      patchDesk(role, { gaindb: db });
      if (role === "master") engineRef.current?.setMasterGain(db);
      else engineRef.current?.setRoleGain(role as ArrangerRole, db);
    },
    [patchDesk],
  );

  /** the arrangement edit hand-off: the clips land, the transport re-rides
      and the shelf carries the edited arrangement (same id, newest state). */
  const handleArrangementEdit = useCallback(
    (clips: readonly TimelineClip[]) => {
      if (!plan) return;
      setArrangement(clips);
      setSelectedClipId((current) => (clips.some((clip) => clip.id === current) ? current : ""));
      try {
        const nextPlan = { ...plan, clips: [...clips] };
        saveTakePlan(nextPlan);
        setPlans((current) => current.map((take) => (take.id === nextPlan.id ? nextPlan : take)));
      } catch {
        setNotice(label("studio.notice.shelfRefused"));
      }
    },
    [plan],
  );

  /** the roll edit hand-off: the notes own the schedule from here. */
  const handleRollEdit = useCallback((notes: readonly EditableNote[]) => setEdits(notes), []);

  /** the desk reset: the seeded arrangement and the seeded schedule return. */
  const resetDesk = useCallback(() => {
    setArrangement(null);
    setEdits(null);
    setSelectedClipId("");
    setNotice(label("studio.notice.deskReset"));
  }, []);

  /** one export action: a real render, real bytes, an honest notice. */
  const runExport = useCallback(
    async (kind: ExportKind) => {
      if (!plan || !schedule) return;
      setBusyExport(kind);
      try {
        const files = await exportTake(kind, plan, schedule);
        for (const file of files) downloadFile(file);
        setNotice(labelfill("studio.notice.exported", { files: files.map((file) => file.name).join(", ") }));
      } catch (error) {
        setNotice(error instanceof Error ? error.message : label("studio.notice.exportRefused"));
      } finally {
        setBusyExport("");
      }
    },
    [plan, schedule],
  );

  const rackPosition = plan ? positionAt(plan, position) : { bar: 0, step: -1 };

  /** hands a stage key to the page: the bar remembers and the section
   * scrolls into view (the reduce law picks the instant jump) */
  const selectStage = useCallback((id: StageId): void => {
    setActiveStage(id);
    const section = stageRefs.current.get(id);
    if (!section) return;
    const instant = reduceMotionApplied() || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    section.scrollIntoView({ behavior: instant ? "auto" : "smooth", block: "start" });
  }, []);

  /** registers one stage section on its ref map slot. */
  const stageRef =
    (id: StageId) =>
    (element: HTMLElement | null): void => {
      stageRefs.current.set(id, element);
    };

  return (
    <Shell
      name="debonair"
      contained
      cta={{ label: label("studio.cta"), href: "/generate" }}
      footerLinks={FOOTER_LINKS}
      domain="devthink.pro"
    >
      <p className="eyebrow reveal">{label("studio.eyebrow")}</p>
      <h1 className="reveal page-title">{label("studio.title")}</h1>
      <p className="reveal lede" style={{ maxWidth: 640 }}>
        {label("studio.ledeLead")}
        <code>katexis</code>
        {label("studio.ledeTail")}
      </p>

      {notice ? (
        <p className="badge warning" role="status">
          {notice}
        </p>
      ) : null}

      {/* STAGE BAR — the page rides in stages: prompt → lyrics → style →
          generate → takes → mix (the owner's order); a key scrolls the
          section into view and wears the windows indicator law */}
      <StageStepper active={activeStage} onSelect={selectStage} />

      {/* STAGE PROMPT — the line the take answers to (the engine's own record) */}
      {plan ? (
        <section
          className="stage-section rack-panel reveal"
          data-stage="prompt"
          ref={stageRef("prompt")}
          aria-label={labelfill("studio.stage.aria", { stage: "Prompt" })}
        >
          <p className="stage-eyebrow">{labelfill("studio.stage.eyebrow", { stage: "prompt" })}</p>
          <blockquote className="stage-quote">
            {plan.prompt}
            <footer>
              {label("studio.prompt.seedLead")}
              <code>{plan.seed}</code>
              {label("studio.prompt.takeLead")}
              <code>{plan.id.slice(0, 6)}</code>
            </footer>
          </blockquote>
          <p className="stage-hint">
            {label("studio.prompt.hintLead")}
            <Link href="/generate">{label("studio.prompt.hintLink")}</Link>
            {label("studio.prompt.hintTail")}
          </p>
        </section>
      ) : null}

      {/* STAGE LYRICS — the chord sheet the harmony engine wrote, one row a bar */}
      {plan ? (
        <section
          className="stage-section reveal"
          data-stage="lyrics"
          ref={stageRef("lyrics")}
          aria-label={labelfill("studio.stage.aria", { stage: "Lyrics" })}
        >
          <p className="stage-eyebrow">{labelfill("studio.stage.eyebrow", { stage: "lyrics" })}</p>
          <p className="stage-hint">
            {label("studio.lyrics.hintLead")}
            <strong className="ink-strong">{plan.keyLabel}</strong>
            {labelfill("studio.lyrics.hintTail", { bars: String(plan.bars) })}
          </p>
          <ol className="lyric-sheet">
            {plan.chords.map((event) => (
              <li key={`chord-${event.bar}`} className="lyric-row">
                <span className="lyric-bar">{event.bar + 1}</span>
                <span className="lyric-symbol">{event.symbol}</span>
                <span
                  className="lyric-tension"
                  style={{ "--t": event.tension.toFixed(2) } as CSSProperties}
                  aria-hidden="true"
                />
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* STAGE STYLE — the genre, the pattern and the loudness law of the take */}
      {plan ? (
        <section
          className="stage-section reveal"
          data-stage="style"
          ref={stageRef("style")}
          aria-label={labelfill("studio.stage.aria", { stage: "Style" })}
        >
          <p className="stage-eyebrow">{labelfill("studio.stage.eyebrow", { stage: "style" })}</p>
          <dl className="spec-ledger stage-spec">
            <div className="spec-row">
              <dt>{label("studio.style.genre")}</dt>
              <dd>{plan.genreLabel}</dd>
            </div>
            <div className="spec-row">
              <dt>{label("studio.style.tempo")}</dt>
              <dd>
                {labelfill("studio.style.tempoValue", {
                  bpm: String(plan.bpm),
                  swing: String(Math.round((plan.swing - 0.5) * 200)),
                })}
              </dd>
            </div>
            <div className="spec-row">
              <dt>{label("studio.style.key")}</dt>
              <dd>{plan.keyLabel}</dd>
            </div>
            <div className="spec-row">
              <dt>{label("studio.style.drums")}</dt>
              <dd>{plan.pattern}</dd>
            </div>
            <div className="spec-row">
              <dt>{label("studio.style.loudness")}</dt>
              <dd>
                {labelfill("studio.style.loudnessValue", {
                  lufs: String(plan.lufsTarget),
                  dbtp: String(plan.mastering.truePeakDbtp),
                })}
              </dd>
            </div>
            <div className="spec-row">
              <dt>{label("studio.style.render")}</dt>
              <dd>{labelfill("studio.style.renderValue", { khz: String(plan.mastering.sampleRateHz / 1000) })}</dd>
            </div>
          </dl>
          {problems.length > 0 ? (
            <p className="badge warning">{labelfill("studio.planProblems", { list: problems.join("; ") })}</p>
          ) : null}
        </section>
      ) : null}

      {/* STAGE GENERATE — the rendered arrangement: transport, playlist, rack */}
      {plan ? (
        <section
          className="stage-section reveal"
          data-stage="generate"
          ref={stageRef("generate")}
          aria-label={labelfill("studio.stage.aria", { stage: "Generate" })}
        >
          <p className="stage-eyebrow">{labelfill("studio.stage.eyebrow", { stage: "generate" })}</p>

          {/* TRANSPORT — real keys over the WebAudio clock */}
          <section className="transport rack-panel" aria-label={label("studio.transport.aria")}>
            <div className="group">
              <button
                className="tkey"
                type="button"
                aria-label={label("studio.transport.playAria")}
                aria-pressed={playing}
                onClick={togglePlay}
              >
                <svg
                  className="svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
                {playing ? label("studio.transport.pause") : label("studio.transport.play")}
              </button>
              <button className="tkey" type="button" aria-label={label("studio.transport.stopAria")} onClick={stop}>
                <svg
                  className="svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="5" y="5" width="14" height="14" rx="2" />
                </svg>
                {label("studio.transport.stop")}
              </button>
              <button
                className="tkey tkey--loop"
                type="button"
                aria-label={label("studio.transport.loopAria")}
                aria-pressed={loop}
                onClick={toggleLoop}
              >
                <svg
                  className="svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M17 2l4 4-4 4" />
                  <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                  <path d="M7 22l-4-4 4-4" />
                  <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                </svg>
                {label("studio.transport.loop")}
              </button>
            </div>
            <div className="readouts">
              <div className="readout">
                <span className="lbl">{label("studio.transport.position")}</span>
                <span className="val">{formatClock(position)}</span>
              </div>
              <div className="readout">
                <span className="lbl">{label("studio.transport.bar")}</span>
                <span className="val">
                  {rackPosition.bar + 1}.{rackPosition.step + 1}
                </span>
              </div>
              <div className="readout">
                <span className="lbl">{label("studio.transport.bpm")}</span>
                <span className="val">{plan.bpm}</span>
              </div>
              <div className="readout">
                <span className="lbl">{label("studio.transport.key")}</span>
                <span className="val">{plan.keyLabel}</span>
              </div>
              <div className="readout">
                <span className="lbl">{label("studio.transport.target")}</span>
                <span className="val">{labelfill("studio.transport.targetValue", { lufs: String(plan.lufsTarget) })}</span>
              </div>
            </div>
          </section>

          {/* ARRANGEMENT EDITOR — the timeline grows hands: drag moves, the
              edges trim, split cuts at the playhead, and the re-slice answers
              with the schedule the transport plays (arrangement.ts) */}
          <Timeline
            plan={plan}
            clips={effectivePlan.clips}
            playhead={position}
            selectedId={selectedClipId}
            onSelect={setSelectedClipId}
            onEdit={handleArrangementEdit}
            onSeek={seek}
            onNotice={setNotice}
          />

          {/* SPECTRUM — the master bus, live: the scope is feedback, never decor */}
          <section className="rack-panel scope-panel" aria-label={label("studio.scope.aria")}>
            <Spectrum engine={engineRef.current} live={playing} />
          </section>

          {/* CHANNEL RACK — the real grid: velocities, fills, the running step */}
          <section className="rack rack-panel" aria-label={label("studio.rack.aria")}>
            <header className="rack-head">
              <h2 className="rack-title">{label("studio.rack.title")}</h2>
              <span className="rack-meta">
                {labelfill("studio.rack.meta", {
                  pattern: plan.pattern,
                  swing: String(Math.round((plan.swing - 0.5) * 200)),
                  bpm: String(plan.bpm),
                  beat: beatSecondsOf(plan).toFixed(3),
                })}
              </span>
            </header>
            <div>
              {RACK_LANES.map((lane) => (
                <div key={lane} className="rack-row">
                  <span className="rack-name">{lane}</span>
                  <div className="rack-cells" aria-hidden="true">
                    {STEP_NOS.map((no) => {
                      const step = no - 1;
                      const velocity = plan.grid.lanes[lane][step];
                      const current = playing && rackPosition.step === step;
                      return (
                        <span
                          key={`step-${no}`}
                          className={velocity > 0 ? "step on" : "step"}
                          data-beat={step % 4 === 0 ? "true" : undefined}
                          data-current={current ? "true" : undefined}
                          style={velocity > 0 ? { opacity: (0.42 + velocity * 0.58).toFixed(2) } : undefined}
                          title={velocity > 0 ? labelfill("studio.rack.stepVel", { vel: (velocity * 100).toFixed(0) }) : undefined}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PIANO ROLL — the notes the desk edits: one bar, real buttons,
              every hand riding the pianoroll engine (nothing the schedule
              does not play) */}
          {schedule ? (
            <PianoRoll
              plan={plan}
              schedule={schedule}
              notes={edits ?? scheduleToNotes(schedule, plan)}
              onChange={handleRollEdit}
              onNotice={setNotice}
            />
          ) : null}

          {/* EXPORT BAR — real bounces: the wavs, the midi and the stems */}
          <section className="rack-panel exp" aria-label={label("studio.export.aria")}>
            <h2 className="card-h">{label("studio.export.title")}</h2>
            <p className="flush p-sm">{label("studio.export.body")}</p>
            <div className="exp-keys">
              {(Object.keys(EXPORT_LABELS) as ExportKind[]).map((kind) => (
                <button
                  key={kind}
                  className="tkey"
                  type="button"
                  aria-label={labelfill("studio.export.keyAria", { label: EXPORT_LABELS[kind] })}
                  disabled={busyExport !== ""}
                  onClick={() => void runExport(kind)}
                >
                  {busyExport === kind ? label("studio.export.rendering") : EXPORT_LABELS[kind]}
                </button>
              ))}
              <button
                className="tkey"
                type="button"
                aria-label={label("studio.export.resetAria")}
                onClick={resetDesk}
              >
                {label("studio.export.reset")}
              </button>
            </div>
            {edits ? <p className="flush p-sm">{label("studio.export.rollNote")}</p> : null}
          </section>

          {/* the plan ledger — the engine's own numbers, no invented specs */}
          {schedule ? (
            <section className="rack-panel scope-note" aria-label={label("studio.ledger.aria")}>
              <h2 className="card-h">{label("studio.ledger.title")}</h2>
              <p className="flush">
                <strong className="ink-strong">{plan.name}</strong>
                {labelfill("studio.ledger.bodyLead", {
                  genre: plan.genreLabel,
                  key: plan.keyLabel,
                  bpm: String(plan.bpm),
                  bars: String(plan.bars),
                  clock: formatClock(plan.durationSeconds),
                  events: String(schedule.events.length),
                  drums: String(schedule.perRole.drums),
                  bass: String(schedule.perRole.bass),
                  keys: String(schedule.perRole.keys),
                  lead: String(schedule.perRole.lead),
                })}
                <code>{plan.seed}</code>
                {labelfill("studio.ledger.bodyTail", {
                  lufs: String(plan.lufsTarget),
                  dbtp: String(plan.mastering.truePeakDbtp),
                  chords: plan.chords
                    .slice(0, 8)
                    .map((chord) => chord.symbol)
                    .join(" · "),
                  more: plan.bars > 8 ? label("studio.ledger.more") : "",
                  verdict:
                    problems.length === 0
                      ? label("studio.ledger.valid")
                      : labelfill("studio.planProblems", { list: problems.join("; ") }),
                })}
              </p>
              <p className="flush p-sm">
                {label("studio.ledger.loopLead")}
                <code>mixergraph</code>
                {label("studio.ledger.loopTail")}
                {loop ? label("studio.ledger.loopOn") : label("studio.ledger.loopOff")}
                {labelfill("studio.ledger.masterTail", {
                  gain: formatGain(graph?.channels.find((channel) => channel.id === graph.masterid)?.gaindb ?? -2),
                })}
              </p>
              <p className="flush p-sm">
                {label("studio.ledger.newLead")}
                <Link href="/generate">{label("studio.ledger.composeLink")}</Link>
                {label("studio.ledger.browseMid")}
                <Link href="/library">{label("studio.ledger.libraryLink")}</Link>
                {label("studio.ledger.newTail")}
              </p>
            </section>
          ) : null}
        </section>
      ) : null}

      {/* STAGE TAKES — the shelf this session rendered (the picker the desk reads) */}
      {plan ? (
        <section
          className="stage-section rack-panel reveal"
          data-stage="takes"
          ref={stageRef("takes")}
          aria-label={labelfill("studio.stage.aria", { stage: "Takes" })}
        >
          <p className="stage-eyebrow">{labelfill("studio.stage.eyebrow", { stage: "takes" })}</p>
          <p className="stage-hint">
            {labelfill("studio.takes.count", {
              count: String(plans.length),
              s: plans.length === 1 ? "" : "s",
            })}
          </p>
          <label className="field takepick">
            <span className="field-label">{label("studio.takes.field")}</span>
            <select
              className="input"
              value={plan.id}
              onChange={(event) => {
                stop();
                setSelectedId(event.target.value);
              }}
            >
              {plans.map((take) => (
                <option key={take.id} value={take.id}>
                  {take.name} · {take.genreLabel}
                </option>
              ))}
            </select>
          </label>
        </section>
      ) : null}

      {/* STAGE MIX — the desk: faders, mute/solo keys, live meters, the master bus */}
      {plan && graph ? (
        <section
          className="stage-section reveal"
          data-stage="mix"
          ref={stageRef("mix")}
          aria-label={labelfill("studio.stage.aria", { stage: "Mix" })}
        >
          <p className="stage-eyebrow">{labelfill("studio.stage.eyebrow", { stage: "mix" })}</p>
          <section className="mixer" aria-label={label("studio.mixer.aria")}>
            {graph.channels
              .filter((channel) => channel.id !== graph.masterid)
              .map((channel) => {
                const effective = effectiveGainDb(graph, channel.id);
                return (
                  <div key={channel.id} className="strip">
                    <h3>{channel.id}</h3>
                    <div className="strip-keys">
                      <button
                        type="button"
                        className={`strip-key${channel.mute ? " is-on" : ""}`}
                        aria-pressed={channel.mute}
                        aria-label={labelfill("studio.mixer.muteAria", { id: channel.id })}
                        onClick={() => patchDesk(channel.id, { mute: !channel.mute })}
                      >
                        {label("studio.mixer.muteKey")}
                      </button>
                      <button
                        type="button"
                        className={`strip-key strip-key--solo${channel.solo ? " is-on" : ""}`}
                        aria-pressed={channel.solo}
                        aria-label={labelfill("studio.mixer.soloAria", { id: channel.id })}
                        onClick={() => patchDesk(channel.id, { solo: !channel.solo })}
                      >
                        {label("studio.mixer.soloKey")}
                      </button>
                    </div>
                    <div className="strip-stage">
                      <Fader name={channel.id} value={channel.gaindb} onChange={(db) => setFader(channel.id, db)} />
                      <VuMeter name={channel.id} level={levels[channel.id as ArrangerRole]} live={playing} />
                    </div>
                    <p className="db">{formatGain(effective)} dB</p>
                  </div>
                );
              })}
            {(() => {
              const master = graph.channels.find((channel) => channel.id === graph.masterid);
              if (!master) return null;
              return (
                <div className="strip master">
                  <h3>master</h3>
                  <div className="strip-keys">
                    <span className="db glue">{label("studio.mixer.bus")}</span>
                  </div>
                  <div className="strip-stage">
                    <Fader name="master" value={master.gaindb} master onChange={(db) => setFader("master", db)} />
                    <VuMeter name="master" level={loudest(levels)} live={playing} />
                  </div>
                  <p className="db">{formatGain(effectiveGainDb(graph, master.id))} dB</p>
                </div>
              );
            })()}
          </section>
        </section>
      ) : null}
    </Shell>
  );
}

/** The loudest role level (the master meter's honest stand-in while playing). */
function loudest(levels: Record<ArrangerRole, number>): number {
  return Math.max(levels.drums, levels.bass, levels.keys, levels.lead);
}
