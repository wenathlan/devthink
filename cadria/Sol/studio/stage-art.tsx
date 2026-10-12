/**
 * stage-art.tsx — the artwork well of the stage pane: injects the render
 * layer's deterministic SVG and, when motion is available and the OS allows
 * it, runs the rAF beat loop — the nearest pulse keyframe at/before the loop
 * phase (wrap-aware) drives renderKeyframePerturbation, so the frame breathes
 * on the descriptor's own beat grid (loopMs = 60000/bpm from synthmotion).
 * Reduced motion answers one static frame — no loop, no beat.
 * The serialized svg is the engine's own deterministic serializer output
 * (internal IR, hex-guarded colors, no user input, no network).
 */

import { useEffect, useState } from "react";
import { type RenderFrame, renderKeyframePerturbation, renderSvg } from "../../imagerender.ts";
import type { MotionSpec } from "../../synthmotion.ts";

/** the beat envelope quantization — 16 steps per loop keeps the pulse smooth
 * without re-serializing the whole svg every frame. */
const BEAT_STEPS = 16;

/** rescales the generated svg to its well and hides it from the a11y tree (the wrapper carries the label). */
function fitArtSvg(svg: string): string {
  return svg.replace("<svg ", '<svg aria-hidden="true" style="width:100%;height:auto;display:block" ');
}

type StageArtProps = {
  frame: RenderFrame | null;
  motion: MotionSpec | null;
  /** the accessible name of the artwork well */
  caption: string;
};

/** The artwork well: static svg or the rAF beat pulse. */
export function StageArt({ frame, motion, caption }: StageArtProps) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    if (!frame) {
      setSvg(null);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pulses = (motion?.keyframes ?? []).filter((keyframe) => keyframe.kind === "pulse");
    // static frame: reduced motion, no motion spec, or no pulse keyframes at all
    if (reduced || !motion || pulses.length === 0) {
      setSvg(fitArtSvg(renderSvg(frame)));
      return;
    }
    const loopMs = motion.loopMs > 0 ? motion.loopMs : 500;
    let raf = 0;
    let lastStep = -1;
    const tick = (now: number): void => {
      const t = now % loopMs;
      // nearest pulse at/before the loop phase, wrapping to the last pulse
      let active = pulses[pulses.length - 1];
      for (const keyframe of pulses) {
        if (keyframe.tMs <= t) active = keyframe;
      }
      const since = t >= active.tMs ? t - active.tMs : t + loopMs - active.tMs;
      const envelope = active.strength * Math.max(0, 1 - since / loopMs);
      const step = Math.round(envelope * BEAT_STEPS);
      if (step !== lastStep) {
        lastStep = step;
        setSvg(
          fitArtSvg(
            renderSvg({
              ...frame,
              commands: renderKeyframePerturbation(
                frame.commands,
                { kind: "pulse", strength: step / BEAT_STEPS, targets: active.targets },
                motion.pulseScale,
              ),
            }),
          ),
        );
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [frame, motion]);

  return (
    <div
      role="img"
      aria-label={caption}
      style={{
        width: "100%",
        maxWidth: 560,
        aspectRatio: "1 / 1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
        background: "var(--surface-1)",
      }}
    >
      {svg ? (
        // biome-ignore lint/security/noDangerouslySetInnerHtml: the svg is the engine's own deterministic serializer output (internal IR, hex-guarded colors, no user input, no network) — the documented injection point of the render layer
        <div style={{ width: "100%", lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <p className="mono-label" style={{ margin: 0, padding: 20, textAlign: "center" }}>
          the frame lands here — analyze a source, then generate
        </p>
      )}
    </div>
  );
}

export default StageArt;
