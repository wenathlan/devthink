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
import { type ArrangerRole, beatSecondsOf, planTake, RACK_LANES, type TakePlan, validatePlan } from "../../arranger.ts";
import { clipStyle, formatClock, formatGain, playheadPercent } from "../../dawview.ts";
import { effectiveGainDb, graphFromStrips, type MixerGraph, patchChannel } from "../../mixergraph.ts";
import { reduceMotionApplied } from "../../motionpref.ts";
import { busHush } from "../../playerbus.ts";
import type { StageId } from "../../stages.ts";
import { positionAt, scheduleTake } from "../../takeevents.ts";
import { findTakeRecord, loadTakeRecords, sessionStorageOrMemory, TAKE_SELECT_KEY } from "../../takestore.ts";
import { type NavLink, Shell } from "../shell/Shell.tsx";
import { TakeEngine } from "./audioengine.ts";
import { Fader } from "./Fader.tsx";
import { StageStepper } from "./StageStepper.tsx";
import { VuMeter } from "./VuMeter.tsx";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Generate", href: "/generate" },
  { label: "Library", href: "/library" },
  { label: "Settings", href: "/settings" },
];

/** the demo take: a real engine plan over a fixed prompt and seed */
const DEMO_PROMPT = "midnight studio take, warm sub bass, dusty keys, brass light";
const DEMO_SEED = "debonair-demo";

/** the mixer roles in desk order (master last, drawn separately) */
const DESK_ROLES: readonly ArrangerRole[] = ["drums", "bass", "keys", "lead"];

/** the ruler numbers the playlist draws (one per bar of the arrangement) */
const RULER_BARS: readonly number[] = Array.from({ length: 16 }, (_, bar) => bar + 1);

/** the step numbers the channel rack draws (1-based, like the desk) */
const STEP_NOS: readonly number[] = Array.from({ length: 16 }, (_, step) => step + 1);

export default function Studio() {
  const engineRef = useRef<TakeEngine | null>(null);
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
  const stageRefs = useRef(new Map<StageId, HTMLElement | null>());

  const plan = useMemo(() => plans.find((take) => take.id === selectedId) ?? plans[0] ?? null, [plans, selectedId]);
  const schedule = useMemo(() => (plan ? scheduleTake(plan) : null), [plan]);
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

  // a take change loads the transport and the desk: the desk opens first —
  // it is the plan's own state, never gated on the audio context (the
  // autoplay policy holds `resume()` until the visitor interacts) — and the
  // engine faders ride the new plan's own strips right after
  useEffect(() => {
    if (!plan) return;
    try {
      setGraph(graphFromStrips(plan.strips));
    } catch {
      setGraph(null);
    }
    const engine = engineRef.current;
    if (!engine) return;
    let live = true;
    engine
      .load(plan)
      .then(() => {
        if (!live) return;
        for (const strip of plan.strips) {
          if (strip.master) engine.setMasterGain(strip.faderDb);
          else engine.setRoleGain(strip.name as ArrangerRole, strip.faderDb);
        }
        setPosition(0);
        setPlaying(false);
      })
      .catch((error: unknown) => {
        if (live) setNotice(error instanceof Error ? error.message : "the transport refused this take");
      });
    return () => {
      live = false;
    };
  }, [plan]);

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
      setNotice(error instanceof Error ? error.message : "the transport refused to start");
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
      cta={{ label: "Generate a track", href: "/generate" }}
      footerLinks={FOOTER_LINKS}
      domain="devthink.pro"
    >
      <p className="eyebrow reveal">debonair · studio</p>
      <h1 className="reveal page-title">Studio</h1>
      <p className="reveal lede" style={{ maxWidth: 640 }}>
        The console, live: the <code>katexis</code> engine schedules the take on the WebAudio clock — transport,
        playlist, channel rack and mixer all read and drive the same plan. Play it.
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
          aria-label="Stage prompt"
        >
          <p className="stage-eyebrow">stage · prompt</p>
          <blockquote className="stage-quote">
            {plan.prompt}
            <footer>
              seed <code>{plan.seed}</code> · take <code>{plan.id.slice(0, 6)}</code>
            </footer>
          </blockquote>
          <p className="stage-hint">
            New material? <Link href="/generate">Compose a fresh prompt</Link> and come back — same prompt and seed
            always rebuild this exact take.
          </p>
        </section>
      ) : null}

      {/* STAGE LYRICS — the chord sheet the harmony engine wrote, one row a bar */}
      {plan ? (
        <section
          className="stage-section reveal"
          data-stage="lyrics"
          ref={stageRef("lyrics")}
          aria-label="Stage lyrics"
        >
          <p className="stage-eyebrow">stage · lyrics</p>
          <p className="stage-hint">
            The lead sheet of the take — <strong className="ink-strong">{plan.keyLabel}</strong>, one chord a bar over{" "}
            {plan.bars} bars.
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
        <section className="stage-section reveal" data-stage="style" ref={stageRef("style")} aria-label="Stage style">
          <p className="stage-eyebrow">stage · style</p>
          <dl className="spec-ledger stage-spec">
            <div className="spec-row">
              <dt>genre</dt>
              <dd>{plan.genreLabel}</dd>
            </div>
            <div className="spec-row">
              <dt>tempo</dt>
              <dd>
                {plan.bpm} bpm · swing {Math.round((plan.swing - 0.5) * 200)}%
              </dd>
            </div>
            <div className="spec-row">
              <dt>key</dt>
              <dd>{plan.keyLabel}</dd>
            </div>
            <div className="spec-row">
              <dt>drums</dt>
              <dd>{plan.pattern}</dd>
            </div>
            <div className="spec-row">
              <dt>loudness law</dt>
              <dd>
                {plan.lufsTarget} LUFS · {plan.mastering.truePeakDbtp} dBTP
              </dd>
            </div>
            <div className="spec-row">
              <dt>render</dt>
              <dd>{plan.mastering.sampleRateHz / 1000} kHz WAV</dd>
            </div>
          </dl>
          {problems.length > 0 ? <p className="badge warning">{`Plan problems: ${problems.join("; ")}`}</p> : null}
        </section>
      ) : null}

      {/* STAGE GENERATE — the rendered arrangement: transport, playlist, rack */}
      {plan ? (
        <section
          className="stage-section reveal"
          data-stage="generate"
          ref={stageRef("generate")}
          aria-label="Stage generate"
        >
          <p className="stage-eyebrow">stage · generate</p>

          {/* TRANSPORT — real keys over the WebAudio clock */}
          <section className="transport rack-panel" aria-label="Transport bar">
            <div className="group">
              <button className="tkey" type="button" aria-label="Play" aria-pressed={playing} onClick={togglePlay}>
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
                {playing ? "Pause" : "Play"}
              </button>
              <button className="tkey" type="button" aria-label="Stop" onClick={stop}>
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
                Stop
              </button>
              <button
                className="tkey tkey--loop"
                type="button"
                aria-label="Loop the take"
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
                Loop
              </button>
            </div>
            <div className="readouts">
              <div className="readout">
                <span className="lbl">Position</span>
                <span className="val">{formatClock(position)}</span>
              </div>
              <div className="readout">
                <span className="lbl">Bar</span>
                <span className="val">
                  {rackPosition.bar + 1}.{rackPosition.step + 1}
                </span>
              </div>
              <div className="readout">
                <span className="lbl">BPM</span>
                <span className="val">{plan.bpm}</span>
              </div>
              <div className="readout">
                <span className="lbl">Key</span>
                <span className="val">{plan.keyLabel}</span>
              </div>
              <div className="readout">
                <span className="lbl">Target</span>
                <span className="val">{plan.lufsTarget} LUFS</span>
              </div>
            </div>
          </section>

          {/* the playlist rides the full stage now (the mixer moved to the mix stage) */}
          {graph ? (
            <section className="daw rack-panel" aria-label="Arrangement playlist">
              <div className="tl-scroll">
                <div className="tl-inner">
                  <div className="tl-ruler">
                    <span aria-hidden="true" />
                    <div className="lane">
                      {/* the scrub: a native range over the ruler — the click and
                        the keyboard (arrows, page, home/end) both seek the
                        WebAudio clock; focus paints the lane underline */}
                      <input
                        className="tl-scrub"
                        type="range"
                        min={0}
                        max={plan.durationSeconds}
                        step={0.1}
                        value={Math.min(position, plan.durationSeconds)}
                        onChange={(event) => seek(Number(event.currentTarget.value))}
                        aria-label="Seek the take"
                      />
                      {RULER_BARS.map((no) => (
                        <span key={`ruler-${no}`} aria-hidden="true">
                          {no}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="tl-canvas">
                    {DESK_ROLES.map((role) => (
                      <div key={role} className="tl-row">
                        <div className="tl-label">
                          <b>{role}</b>
                          <small>{plan.strips.find((strip) => strip.name === role)?.faderDb.toFixed(1)} dB</small>
                        </div>
                        <div className="tl-lane">
                          {plan.clips
                            .filter((clip) => clip.track === role)
                            .map((clip) => {
                              const geo = clipStyle(clip.start, clip.duration, plan.durationSeconds);
                              const chord =
                                plan.chords[Math.min(plan.bars - 1, Math.floor(clip.start / plan.barSeconds))];
                              return (
                                <span
                                  key={clip.id}
                                  className="clip c1"
                                  style={{ left: `${geo.left}%`, width: `${geo.width}%` }}
                                  title={`${clip.label}${chord ? ` · ${chord.symbol}` : ""}`}
                                >
                                  {clip.label}
                                </span>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                    <div
                      className="playhead"
                      style={{ left: `${playheadPercent(position, plan.durationSeconds)}%` }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {/* CHANNEL RACK — the real grid: velocities, fills, the running step */}
          <section className="rack rack-panel" aria-label="Channel rack">
            <header className="rack-head">
              <h2 className="rack-title">channel rack</h2>
              <span className="rack-meta">
                {plan.pattern} · swing {Math.round((plan.swing - 0.5) * 200)}% · {plan.bpm} bpm · beat{" "}
                {beatSecondsOf(plan).toFixed(3)} s
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
                          title={velocity > 0 ? `vel ${(velocity * 100).toFixed(0)}%` : undefined}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* the plan ledger — the engine's own numbers, no invented specs */}
          {schedule ? (
            <section className="rack-panel scope-note" aria-label="Take ledger">
              <h2 className="card-h">Take ledger</h2>
              <p className="flush">
                <strong className="ink-strong">{plan.name}</strong> — {plan.genreLabel} · {plan.keyLabel} · {plan.bpm}{" "}
                bpm · {plan.bars} bars · {formatClock(plan.durationSeconds)} · {schedule.events.length} scheduled events
                ({schedule.perRole.drums} drums, {schedule.perRole.bass} bass, {schedule.perRole.keys} keys,{" "}
                {schedule.perRole.lead} lead) · seed <code>{plan.seed}</code> · target {plan.lufsTarget} LUFS /{" "}
                {plan.mastering.truePeakDbtp} dBTP true peak. Chords:{" "}
                {plan.chords
                  .slice(0, 8)
                  .map((chord) => chord.symbol)
                  .join(" · ")}
                {plan.bars > 8 ? " …" : ""}.{" "}
                {problems.length === 0 ? "Plan validated." : `Plan problems: ${problems.join("; ")}`}
              </p>
              <p className="flush p-sm">
                Same prompt and seed always rebuild this exact take. Edit the desk live — the faders, mutes and solos
                ride <code>mixergraph</code> onto the audio buses while it plays. Loop is{" "}
                {loop ? "on — the take wraps at the top" : "off — the transport stops at the end"}. Master fader{" "}
                {formatGain(graph?.channels.find((channel) => channel.id === graph.masterid)?.gaindb ?? -2)} dB.
              </p>
              <p className="flush p-sm">
                New material? <Link href="/generate">Compose a take</Link> or browse the shelf in the{" "}
                <Link href="/library">library</Link>.
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
          aria-label="Stage takes"
        >
          <p className="stage-eyebrow">stage · takes</p>
          <p className="stage-hint">
            {plans.length} take{plans.length === 1 ? "" : "s"} on the shelf — the desk, the bar and the library all read
            the same render.
          </p>
          <label className="field takepick">
            <span className="field-label">Take</span>
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
        <section className="stage-section reveal" data-stage="mix" ref={stageRef("mix")} aria-label="Stage mix">
          <p className="stage-eyebrow">stage · mix</p>
          <section className="mixer" aria-label="Mixer">
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
                        aria-label={`${channel.id} mute`}
                        onClick={() => patchDesk(channel.id, { mute: !channel.mute })}
                      >
                        M
                      </button>
                      <button
                        type="button"
                        className={`strip-key strip-key--solo${channel.solo ? " is-on" : ""}`}
                        aria-pressed={channel.solo}
                        aria-label={`${channel.id} solo`}
                        onClick={() => patchDesk(channel.id, { solo: !channel.solo })}
                      >
                        S
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
                    <span className="db glue">bus</span>
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
