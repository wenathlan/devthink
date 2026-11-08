/**
 * StudioConsole.tsx — the composite winget of the studio remount (the
 * detailed engine wave): the whole DAW console the retired page carried,
 * rebuilt as ONE mount so the page anchor stays the thin face the
 * construction law pins on it. The console wires the existing wingets —
 * the stage stepper, the arrangement timeline, the piano roll, the channel
 * rack, the mixer strips and the master scope — onto the REAL engine
 * seats, never a rewritten one:
 *
 * - the take rides the playerbus shelf (the demo take of the seed plus the
 *   session takes — the same grammar the shell transport serves), and the
 *   take picker drives busSelect so the desk and the player bar read the
 *   same shelf;
 * - the desk itself owns the real TakeEngine (audio.ts): it schedules the
 *   take on the WebAudio clock, the faders ride its live buses, the VU
 *   meters read its analyser taps and the scope reads its master tap —
 *   the engine the 1.108 green tests pin, mounted as is;
 * - the floor protocol keeps ONE audible transport at a time (the bus's
 *   own documented studio law): the desk hushes the bus before it plays,
 *   and when the player bar starts the shared bus the desk parks — the
 *   pause and the seek reach the bus through busPause and busSeek
 *   whenever the bus holds the floor, so both surfaces agree on one
 *   transport;
 * - the VU meters read live dBFS levels while the desk plays and the
 *   resting percents the seed protects while it rests.
 *
 * Zero hardcoded rows: every number is the engine's own (the plan's bpm,
 * key, chords, grid, strips, the clock, the schedule), every word rides
 * the label store, the design rides the Sol classes the wingets already
 * carry.
 */

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link } from "wouter";
import {
  rebaseSchedule,
  type ArrangerRole,
  beatSecondsOf,
  RACK_LANES,
  type TakePlan,
  validatePlan,
} from "../../arrangement.ts";
import { TakeEngine } from "../../audio.ts";
import { formatClock, formatGain } from "../../dawview.ts";
import { label, labelfill } from "../../labels.ts";
import { effectiveGainDb, graphFromStrips, type MixerGraph, patchChannel } from "../../mixergraph.ts";
import { reduceMotionApplied } from "../../motionpref.ts";
import { type EditableNote, notesToSchedule, scheduleToNotes } from "../../pianoroll.ts";
import {
  busHush,
  busPause,
  busPlay,
  busSeek,
  busSelect,
  busSubscribe,
  isReconTake,
  isReferenceTake,
  type PlayerSnapshot,
} from "../../playerbus.ts";
import { seedMixerStrips } from "../../seed.ts";
import type { StageId } from "../../stages.ts";
import { downloadFile, EXPORT_LABELS, type ExportKind, exportTake, positionAt, saveTakePlan } from "../../take.ts";
import type { TimelineClip } from "../../timelinemodel.ts";
import { Fader } from "./StudioFader.tsx";
import { PianoRoll } from "./StudioPianoroll.tsx";
import { Spectrum } from "./StudioSpectrum.tsx";
import { StageStepper } from "./StudioStagestepper.tsx";
import { Timeline } from "./StudioTimeline.tsx";
import { VuMeter } from "./StudioVumeter.tsx";

/** The step numbers the channel rack draws (1-based, like the desk). */
const STEP_NOS: readonly number[] = Array.from({ length: 16 }, (_, step) => step + 1);

/** The props of the console mount. */
type ConsoleProps = {
  /** The face the route answers while the bus arms (the first paint before
   * the shelf lands its first snapshot — the arming beat). */
  face: ReactNode;
};

/**
 * StudioConsole — the DAW console over the real engine seats.
 *
 * @param props the arming face of the route.
 * @returns the console element, or the arming face before the bus answers.
 */
export function StudioConsole({ face }: ConsoleProps) {
  const engineRef = useRef<TakeEngine | null>(null);
  /** The take id the desk engine last loaded (the edit reloads keep the ride). */
  const loadedIdRef = useRef<string | null>(null);
  const [view, setView] = useState<PlayerSnapshot | null>(null);
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

  /** The plan takes on the bus shelf (the demo take of the seed plus the
   * session takes — the references ride the bar's own lane, the desk edits
   * plans). Derived, never hardcoded: the shelf the bus armed answers. */
  const plans = useMemo(
    () => (view?.takes ?? []).filter((take): take is TakePlan => !isReferenceTake(take) && !isReconTake(take)),
    [view?.takes],
  );
  /** The bus's current take (whatever lane it rides). */
  const current = view ? view.takes[view.index] : undefined;
  /** The desk's plan: the bus's current take when it is a plan, the first
   * plan of the shelf otherwise (the demo take the bus always carries). */
  const plan = useMemo(() => {
    if (current && !isReferenceTake(current) && !isReconTake(current)) return current;
    return plans[0] ?? null;
  }, [current, plans]);
  /** The desk's arrangement: null rides the plan's own seeded clips. */
  const effectivePlan = useMemo(
    () => (plan && arrangement ? { ...plan, clips: [...arrangement] } : plan),
    [plan, arrangement],
  );
  /** The schedule the desk plays: the roll owns it when edited, the
   * arrangement re-slice answers otherwise (the identity feeds through). */
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

  // The engine lives once per mount and is disposed with the page; the
  // shared bar transport hushes first — one audible transport at a time
  // (the bus's own documented studio law)
  useEffect(() => {
    busHush();
    engineRef.current = new TakeEngine();
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  // The bus subscription: the shelf, the shared clock and the floor
  // protocol. When the player bar starts the shared bus while the desk
  // runs, the desk parks — the bar owns the floor, the meters rest, and
  // the pause and the seek reach the bus through its own controls.
  useEffect(
    () =>
      busSubscribe((next) => {
        setView(next);
        if (!next.playing) return;
        const engine = engineRef.current;
        if (engine?.isPlaying) {
          engine.stop();
          setPlaying(false);
        }
      }),
    [],
  );

  // A take change opens the desk fresh; a desk edit keeps the transport
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

  // The playhead + the VU taps ride the clock while the desk runs
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

  /** The resting percent one strip's meter carries while the desk rests
   * (the seed's own protected rows — never an invented number). */
  const restPercent = useCallback(
    (name: string): number => seedMixerStrips.find((strip) => strip.name.toLowerCase() === name)?.meterPercent ?? 0,
    [],
  );

  /** Whether any transport holds the floor (the desk or the shared bus). */
  const floorPlaying = playing || Boolean(view?.playing);

  /** The desk play: the shared bus hushes first (one audible transport),
   * then the real engine schedules the take from the playhead. A desk the
   * engine cannot serve falls back onto the shared bus lane. */
  const play = useCallback((): void => {
    const engine = engineRef.current;
    if (!engine || !plan || !schedule) {
      busPlay(view?.position ?? 0);
      return;
    }
    busHush();
    try {
      engine.loop = loop;
      engine.play(position >= plan.durationSeconds - 0.01 ? 0 : position);
      setPlaying(true);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : label("studio.notice.transportStart"));
    }
  }, [loop, plan, position, schedule, view?.position]);

  /** The pause: whichever transport holds the floor answers — the shared
   * bus through its own control, the desk through its engine. */
  const pause = useCallback((): void => {
    if (view?.playing) {
      busPause();
      return;
    }
    const engine = engineRef.current;
    if (!engine) return;
    engine.stop();
    setPlaying(false);
  }, [view?.playing]);

  /** The stop: the floor silences and the playhead freezes where it sits. */
  const stop = useCallback((): void => {
    if (view?.playing) {
      busPause();
      return;
    }
    const engine = engineRef.current;
    if (!engine) return;
    engine.stop();
    setPlaying(false);
  }, [view?.playing]);

  const togglePlay = useCallback((): void => {
    if (floorPlaying) pause();
    else play();
  }, [floorPlaying, pause, play]);

  const toggleLoop = useCallback((): void => {
    setLoop((held) => {
      const next = !held;
      if (engineRef.current) engineRef.current.loop = next;
      return next;
    });
  }, []);

  /** The seek: the shared bus answers through busSeek whenever it holds
   * the floor or mirrors the desk's clock (the bar's lane agrees), and
   * the desk engine restarts at the target when it holds the floor. */
  const seek = useCallback(
    (seconds: number): void => {
      if (!plan) return;
      const clamped = Math.min(Math.max(0, seconds), plan.durationSeconds);
      setPosition(clamped);
      const onBus = Boolean(current && current.id === plan.id);
      if (view?.playing && onBus) {
        busSeek(clamped);
        return;
      }
      const engine = engineRef.current;
      if (engine?.isPlaying) {
        engine.stop();
        engine.play(clamped);
      }
      if (onBus) busSeek(clamped);
    },
    [current, plan, view?.playing],
  );

  /** The take picker: the desk stops, the shared shelf selects (the bus
   * owns the take list — the player bar follows the same selection). */
  const pickTake = useCallback((id: string): void => {
    const engine = engineRef.current;
    if (engine?.isPlaying) {
      engine.stop();
      setPlaying(false);
    }
    busSelect(id);
  }, []);

  const patchDesk = useCallback((role: string, patch: { gaindb?: number; mute?: boolean; solo?: boolean }): void => {
    setGraph((held) => (held ? patchChannel(held, role, patch) : held));
  }, []);

  /** The fader hand-off: the desk's graph and the live bus both answer. */
  const setFader = useCallback(
    (role: string, db: number): void => {
      patchDesk(role, { gaindb: db });
      if (role === "master") engineRef.current?.setMasterGain(db);
      else engineRef.current?.setRoleGain(role as ArrangerRole, db);
    },
    [patchDesk],
  );

  /** The arrangement edit hand-off: the clips land, the transport re-rides
   * and the shelf carries the edited arrangement (same id, newest state). */
  const handleArrangementEdit = useCallback(
    (clips: readonly TimelineClip[]) => {
      if (!plan) return;
      setArrangement(clips);
      setSelectedClipId((held) => (clips.some((clip) => clip.id === held) ? held : ""));
      try {
        const nextPlan = { ...plan, clips: [...clips] };
        saveTakePlan(nextPlan);
      } catch {
        setNotice(label("studio.notice.shelfRefused"));
      }
    },
    [plan],
  );

  /** The roll edit hand-off: the notes own the schedule from here. */
  const handleRollEdit = useCallback((notes: readonly EditableNote[]) => setEdits(notes), []);

  /** The desk reset: the seeded arrangement and the seeded schedule return. */
  const resetDesk = useCallback(() => {
    setArrangement(null);
    setEdits(null);
    setSelectedClipId("");
    setNotice(label("studio.notice.deskReset"));
  }, []);

  /** One export action: a real render, real bytes, an honest notice. */
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

  /** Hands a stage key to the page: the bar remembers and the section
   * scrolls into view (the reduce law picks the instant jump). */
  const selectStage = useCallback((id: StageId): void => {
    setActiveStage(id);
    const section = stageRefs.current.get(id);
    if (!section) return;
    const instant = reduceMotionApplied() || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    section.scrollIntoView({ behavior: instant ? "auto" : "smooth", block: "start" });
  }, []);

  /** Registers one stage section on its ref map slot. */
  const stageRef =
    (id: StageId) =>
    (element: HTMLElement | null): void => {
      stageRefs.current.set(id, element);
    };

  // The arming beat: before the bus lands its first snapshot the route
  // answers the face it wore (the honest first paint, never a fake console)
  if (!view || plans.length === 0) return <>{face}</>;

  return (
    <>
      {notice || view.notice ? (
        <p className="badge warning" role="status">
          {notice || view.notice}
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

          {/* TRANSPORT — real keys over the WebAudio clock; the pause and
              the seek reach the shared bus whenever it holds the floor */}
          <section className="transport rack-panel" aria-label={label("studio.transport.aria")}>
            <div className="group">
              <button
                className="tkey"
                type="button"
                aria-label={label("studio.transport.playAria")}
                aria-pressed={floorPlaying}
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
                {floorPlaying ? label("studio.transport.pause") : label("studio.transport.play")}
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
                <span className="val">
                  {labelfill("studio.transport.targetValue", { lufs: String(plan.lufsTarget) })}
                </span>
              </div>
            </div>
          </section>

          {/* ARRANGEMENT EDITOR — the timeline grows hands: drag moves, the
              edges trim, split cuts at the playhead, and the re-slice answers
              with the schedule the transport plays (arrangement.ts) */}
          {effectivePlan ? (
            <Timeline
              plan={effectivePlan}
              clips={effectivePlan.clips}
              playhead={position}
              selectedId={selectedClipId}
              onSelect={setSelectedClipId}
              onEdit={handleArrangementEdit}
              onSeek={seek}
              onNotice={setNotice}
            />
          ) : null}

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
                      const running = playing && rackPosition.step === step;
                      return (
                        <span
                          key={`step-${no}`}
                          className={velocity > 0 ? "step on" : "step"}
                          data-beat={step % 4 === 0 ? "true" : undefined}
                          data-current={running ? "true" : undefined}
                          style={velocity > 0 ? { opacity: (0.42 + velocity * 0.58).toFixed(2) } : undefined}
                          title={
                            velocity > 0
                              ? labelfill("studio.rack.stepVel", { vel: (velocity * 100).toFixed(0) })
                              : undefined
                          }
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
              <button className="tkey" type="button" aria-label={label("studio.export.resetAria")} onClick={resetDesk}>
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

      {/* STAGE TAKES — the shelf the bus carries (the picker the desk reads,
          the same shelf the player bar serves) */}
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
              onChange={(event) => pickTake(event.currentTarget.value)}
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
                      <VuMeter
                        name={channel.id}
                        level={levels[channel.id as ArrangerRole]}
                        live={playing}
                        rest={restPercent(channel.id)}
                      />
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
                  <h3>{master.name}</h3>
                  <div className="strip-keys">
                    <span className="db glue">{label("studio.mixer.bus")}</span>
                  </div>
                  <div className="strip-stage">
                    <Fader name="master" value={master.gaindb} master onChange={(db) => setFader("master", db)} />
                    <VuMeter
                      name="master"
                      level={loudest(levels)}
                      live={playing}
                      rest={restPercent("master")}
                    />
                  </div>
                  <p className="db">{formatGain(effectiveGainDb(graph, master.id))} dB</p>
                </div>
              );
            })()}
          </section>
        </section>
      ) : null}
    </>
  );
}

/** The loudest role level (the master meter's honest stand-in while playing). */
function loudest(levels: Record<ArrangerRole, number>): number {
  return Math.max(levels.drums, levels.bass, levels.keys, levels.lead);
}

export default StudioConsole;
