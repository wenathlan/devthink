// the cadria onboarding of the theme.
/**
 * onboarding.tsx — the first-run frames of the APPLICATION (FAM-APPS-A):
 * four frames presented like a windows 11 first-run dialog over the mica
 * backdrop — welcome (what the app honestly is), hear (pick or record a real
 * slice and let the genuine wave-1 chain read it, decoded in the browser,
 * nothing uploaded), see (the genuine wave-2 render of what was heard — the
 * visitor's own audio, or a built-in fixture when nothing was picked) and
 * enter (the hand-over cta into the studio). step dots, not capsule shapes, a mono
 * progress label, next/back, skip to studio. frames remount on step change so
 * the 250ms entry plays each time; the reduced-motion stop — the os media
 * query beside the settings session override — holds the demo beat. no
 * account, no network write, no visitor storage.
 */

import { ArrowLeft, ArrowRight, FolderOpen, Mic, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { type AnalysisReport, analyzePcm, reportDigest } from "../../audiopipeline.ts";
import { renderCommands, renderSvg, renderThumbnailSignature } from "../../imagerender.ts";
import { compositionBlocks, rhythmScatter } from "../../synthcomposition.ts";
import { synthPalette } from "../../synthpalette.ts";
import { synthTexture } from "../../synthtexture.ts";
import { type DemoFixtureId, demoFixtures } from "../intro/fixtures.ts";
import { CadriaMark } from "../shell/Shell.tsx";

/** the canvas the see frame renders at (px; the render layer clamps and centers it). */
const SEE_CANVAS = 520;

/** the reading beat before the compute lands (skipped under reduced motion). */
const READING_MS = 420;

/** quiet secondary text: the page ink, softened (theme-proof). */
const MUTED = "color-mix(in srgb, currentColor 64%, transparent)";

/** the hairline the page draws beside the contract's own. */
const HAIR = "1px solid color-mix(in srgb, currentColor 18%, transparent)";

/** the honest statement of the opening frame. */
const WHAT_IT_IS =
  "cadria is the video and image home of the wenathlan family — the studio listens to audio and renders the artwork it implies, the player shows the frames, the gallery keeps them. not an operating system: one honest application window.";

/** the honest statement of the closing frame. */
const WHAT_ENTER =
  "the studio is the workspace: drop audio, watch the chain answer, keep the renders. everything runs client-side and session-only — nothing is written to this machine.";

/** the four frames of the first run, in order. */
const STEPS = ["welcome", "hear", "see", "enter"] as const;

/** the reduce check the demo beat consults: the settings session override beside the os media query. */
function motionHeld(): boolean {
  return (
    document.documentElement.dataset.reduceMotion === "true" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** rescales the engine svg to its panel and hides it from the a11y tree (the wrapper carries the label). */
function fitArtSvg(svg: string): string {
  return svg.replace("<svg ", '<svg aria-hidden="true" style="width:100%;height:auto;display:block" ');
}

/** decodes any browser-supported audio container to mono pcm via the web audio decoder. */
async function decodeToMonoPcm(blob: Blob): Promise<{ samples: Float32Array; sampleRate: number }> {
  const buffer = await blob.arrayBuffer();
  const context = new AudioContext();
  try {
    const audio = await context.decodeAudioData(buffer);
    const samples = new Float32Array(audio.length);
    for (let channel = 0; channel < audio.numberOfChannels; channel += 1) {
      const data = audio.getChannelData(channel);
      for (let i = 0; i < samples.length; i += 1) samples[i] += data[i] / audio.numberOfChannels;
    }
    return { samples, sampleRate: audio.sampleRate };
  } finally {
    void context.close();
  }
}

/**
 * The onboarding page: four first-run frames that hand the surface to the
 * studio of the window.
 *
 * @returns the onboarding element.
 */
export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;

  // the hear frame: a real slice, decoded and analyzed in session, nothing stored
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [hearStatus, setHearStatus] = useState<"idle" | "reading" | "ready" | "error">("idle");
  const [hearMessage, setHearMessage] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);

  /** runs the real decode + wave-1 chain over one audio blob; errors surface honest. */
  const analyzeBlob = useCallback(async (blob: Blob, label: string) => {
    setHearStatus("reading");
    setHearMessage(null);
    try {
      const slice = await decodeToMonoPcm(blob);
      const next = analyzePcm(slice.samples, slice.sampleRate, 1);
      setReport(next);
      setHearStatus("ready");
      setHearMessage(`read ${label} — the chain heard it.`);
    } catch (error) {
      setReport(null);
      setHearMessage(error instanceof Error ? error.message : "the chain refused this slice — try a longer clip.");
      setHearStatus("error");
    }
  }, []);

  /** records a short slice through the microphone and feeds the same chain. */
  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setHearStatus("error");
      setHearMessage("this browser offers no microphone api — pick a file instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      });
      recorder.addEventListener("stop", () => {
        for (const track of stream.getTracks()) track.stop();
        setRecording(false);
        void analyzeBlob(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }), "the recording");
      });
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setHearStatus("reading");
      setHearMessage("recording — play or speak, then stop.");
    } catch {
      setHearStatus("error");
      setHearMessage("the microphone is off limits — pick a file instead.");
    }
  }, [analyzeBlob]);

  const stopRecording = useCallback((): void => {
    recorderRef.current?.stop();
    recorderRef.current = null;
  }, []);

  // the see frame: the genuine wave-2 render over the heard report or a built-in fixture
  const [seePick, setSeePick] = useState<"yours" | DemoFixtureId | null>(null);
  const [seeStatus, setSeeStatus] = useState<"idle" | "reading" | "ready" | "error">("idle");
  const [seeMessage, setSeeMessage] = useState<string | null>(null);
  const [see, setSee] = useState<{ svg: string; digest: string; signature: string; source: string } | null>(null);

  useEffect(() => {
    if (step !== 2) return;
    let live = true;
    const pick = seePick ?? (report ? "yours" : "pulse");
    setSeeStatus("reading");
    setSeeMessage(null);
    const compute = (): void => {
      try {
        let active: AnalysisReport;
        if (pick === "yours") {
          if (!report) throw new Error("nothing heard yet — give the hear frame a slice first.");
          active = report;
        } else {
          const fixture = demoFixtures().find((entry) => entry.id === pick);
          if (!fixture) throw new Error(`no such fixture: ${pick}`);
          active = analyzePcm(fixture.samples, fixture.sampleRate, 1);
        }
        const descriptor = active.descriptor;
        const frame = renderCommands({
          seed: descriptor.seed,
          palette: synthPalette(descriptor),
          blocks: rhythmScatter(descriptor, compositionBlocks(descriptor)),
          texture: synthTexture(descriptor),
          canvas: { width: SEE_CANVAS, height: SEE_CANVAS },
        });
        if (!live) return;
        setSee({
          svg: fitArtSvg(renderSvg(frame)),
          digest: reportDigest(active),
          signature: renderThumbnailSignature(frame.commands),
          source: pick === "yours" ? "your audio" : pick,
        });
        setSeeStatus("ready");
      } catch (error) {
        if (!live) return;
        setSee(null);
        setSeeMessage(error instanceof Error ? error.message : "the engine refused this slice.");
        setSeeStatus("error");
      }
    };
    const timer = window.setTimeout(compute, motionHeld() ? 0 : READING_MS);
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [step, seePick, report]);

  const seeActive = seePick ?? (report ? "yours" : "pulse");

  return (
    <main className="winonboard">
      <section className="winonboard__card" aria-label="cadria first run">
        <header className="winonboard__head">
          <CadriaMark size={18} hidden />
          <span className="winonboard__title">first run</span>
          <button
            type="button"
            className="mono-label"
            style={{ marginLeft: "auto", background: "none", border: 0, cursor: "pointer", padding: "8px 10px" }}
            onClick={() => navigate("/studio")}
          >
            skip to studio
          </button>
        </header>

        <div className="winonboard__body">
          {step === 0 && (
            <article className="winonboard__step" key="welcome">
              <p className="winonboard__eyebrow">01 — {STEPS[0]}</p>
              <h2 className="winonboard__lead">one window, video and image</h2>
              <p className="winonboard__lede">{WHAT_IT_IS}</p>
            </article>
          )}
          {step === 1 && (
            <article className="winonboard__step" key="hear">
              <p className="winonboard__eyebrow">02 — {STEPS[1]}</p>
              <h2 className="winonboard__lead">give it something to hear</h2>
              <p className="winonboard__lede">
                pick an audio file or record a slice — the genuine wave-1 chain reads it right here: spectrum, rhythm,
                tonality, timbre, structure. nothing is uploaded, nothing is stored.
              </p>
              <div className="row row--wrap" style={{ gap: 10 }}>
                <label className="winonboard__act" style={{ cursor: "pointer" }}>
                  <FolderOpen size={14} aria-hidden="true" />
                  pick audio
                  <input
                    type="file"
                    accept="audio/*,.wav,.mp3,.ogg,.flac,.m4a,.webm"
                    style={{ display: "none" }}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void analyzeBlob(file, file.name);
                      event.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="winonboard__act"
                  aria-pressed={recording}
                  onClick={() => (recording ? stopRecording() : void startRecording())}
                >
                  {recording ? <Square size={14} aria-hidden="true" /> : <Mic size={14} aria-hidden="true" />}
                  {recording ? "stop recording" : "record a slice"}
                </button>
              </div>
              <p role="status" aria-live="polite" className="mono-label" style={{ margin: 0 }}>
                {hearStatus === "reading" ? "listening…" : (hearMessage ?? "no slice yet — pick or record.")}
              </p>
              {hearStatus === "error" && (
                <p role="alert" style={{ margin: 0, color: "var(--err)", fontSize: 13 }}>
                  {hearMessage}
                </p>
              )}
              {hearStatus === "ready" && report && (
                <p className="mono-label" style={{ margin: 0, lineHeight: 1.7, overflowWrap: "anywhere" }}>
                  {reportDigest(report)}
                </p>
              )}
            </article>
          )}
          {step === 2 && (
            <article className="winonboard__step" key="see">
              <p className="winonboard__eyebrow">03 — {STEPS[2]}</p>
              <h2 className="winonboard__lead">the picture of what it heard</h2>
              <p className="winonboard__lede">
                the genuine wave-2 render layer draws the frame the descriptor describes — palette from key, composition
                from sections, texture from timbre, motion from bpm. same audio, same image, always.
              </p>
              <fieldset
                aria-label="what the frame renders from"
                style={{ border: 0, margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}
              >
                {(report
                  ? (["yours", "glass", "static", "pulse"] as const)
                  : (["glass", "static", "pulse"] as const)
                ).map((id) => (
                  <button
                    key={id}
                    type="button"
                    className="chip"
                    aria-pressed={seeActive === id}
                    disabled={seeStatus === "reading"}
                    style={seeActive === id ? { borderColor: "var(--rose-500)", color: "var(--rose-500)" } : undefined}
                    onClick={() => setSeePick(id)}
                  >
                    {id === "yours" ? "your audio" : id}
                  </button>
                ))}
              </fieldset>
              <div
                role="img"
                aria-label={see ? `rendered artwork from ${see.source}` : "the rendered frame lands here"}
                style={{
                  display: "grid",
                  placeItems: "center",
                  aspectRatio: "1 / 1",
                  maxWidth: 320,
                  border: HAIR,
                  borderRadius: "var(--radius-lg)",
                  background: "color-mix(in srgb, currentColor 4%, transparent)",
                  overflow: "hidden",
                  padding: 10,
                }}
              >
                {see ? (
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: the svg is the engine's own deterministic serializer output (internal IR, hex-guarded colors, no user input, no network) — the documented injection point, as on the intro demo
                  <div style={{ width: "100%", lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: see.svg }} />
                ) : (
                  <p className="mono-label" style={{ margin: 0, color: MUTED }}>
                    the frame lands here
                  </p>
                )}
              </div>
              {seeStatus !== "error" && (
                <p
                  role="status"
                  aria-live="polite"
                  className="mono-label"
                  style={{ margin: 0, overflowWrap: "anywhere" }}
                >
                  {seeStatus === "reading"
                    ? "reading · rendering…"
                    : see
                      ? `${see.digest} · sig ${see.signature}`
                      : "pick what the frame renders from."}
                </p>
              )}
              {seeStatus === "error" && (
                <p role="alert" style={{ margin: 0, color: "var(--err)", fontSize: 13 }}>
                  {seeMessage}
                </p>
              )}
            </article>
          )}
          {step === 3 && (
            <article className="winonboard__step" key="enter">
              <p className="winonboard__eyebrow">04 — {STEPS[3]}</p>
              <h2 className="winonboard__lead">ready to enter</h2>
              <p className="winonboard__lede">{WHAT_ENTER}</p>
            </article>
          )}
        </div>

        <footer className="winonboard__foot">
          <div className="row" aria-hidden="true" style={{ gap: 8 }}>
            {STEPS.map((label, index) => (
              <span
                key={label}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: index === step ? "var(--accent)" : "var(--line-strong)",
                }}
              />
            ))}
          </div>
          <p className="mono-label" style={{ margin: "0 14px" }}>
            step {step + 1} / {STEPS.length} · {STEPS[step]}
          </p>
          <div className="winonboard__actions" style={{ marginLeft: "auto" }}>
            {step > 0 && (
              <button
                type="button"
                className="winonboard__act"
                onClick={() => setStep((value) => Math.max(0, value - 1))}
              >
                <ArrowLeft size={14} aria-hidden="true" />
                back
              </button>
            )}
            {last ? (
              <button
                type="button"
                className="winonboard__act winonboard__act--primary"
                onClick={() => navigate("/studio")}
              >
                open the studio
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                className="winonboard__act winonboard__act--primary"
                onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}
              >
                continue
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </footer>
      </section>
    </main>
  );
}
