/**
 * spectrum.tsx — the live scope of the studio (Sol layer): a canvas fed by
 * the real analyser tap of the transport's master bus (audioengine.ts) —
 * the doctrine is explicit: waveforms and scopes are controls and feedback,
 * never decoration, so the scope draws only what the bus carries. The
 * reduced-motion law freezes the scope to one settled frame instead of
 * running the requestAnimationFrame loop.
 */

import { useEffect, useRef } from "react";
import { reduceMotionApplied } from "../../motionpref.ts";
import type { TakeEngine } from "./audioengine.ts";

/** the fft bins the scope draws (half of the 512 tap, log-ladder feel kept simple) */
const BINS = 96;

type SpectrumProps = {
  /** the transport the scope taps (null draws the settled empty frame). */
  engine: TakeEngine | null;
  /** whether the transport is running (the loop rides the playing state). */
  live: boolean;
};

/**
 * Spectrum — the master bus scope.
 *
 * @param props the engine and the live flag.
 * @returns the canvas element.
 */
export function Spectrum({ engine, live }: SpectrumProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reduced = reduceMotionApplied() || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const spectrum = new Uint8Array(BINS * 2);

    /** one settled frame: the empty law the scope sleeps on. */
    const drawIdle = (): void => {
      const width = canvas.width;
      const height = canvas.height;
      context.clearRect(0, 0, width, height);
      context.strokeStyle = "var(--line-strong)";
      context.beginPath();
      context.moveTo(0, height - 1);
      context.lineTo(width, height - 1);
      context.stroke();
    };

    const draw = (): void => {
      const analyser = engine?.analyserOf("master");
      if (!analyser) {
        drawIdle();
        return;
      }
      analyser.getByteFrequencyData(spectrum);
      const width = canvas.width;
      const height = canvas.height;
      context.clearRect(0, 0, width, height);
      const styles = getComputedStyle(canvas);
      const ink = styles.getPropertyValue("--accent").trim() || "#d9962e";
      const line = styles.getPropertyValue("--line").trim() || "rgb(255 255 255 / 10%)";
      const barWidth = width / BINS;
      for (let bin = 0; bin < BINS; bin++) {
        const value = spectrum[bin] / 255;
        const barHeight = Math.max(1, value * (height - 4));
        context.fillStyle = value > 0.02 ? ink : line;
        context.fillRect(bin * barWidth + 1, height - barHeight, Math.max(1, barWidth - 2), barHeight);
      }
    };

    if (!live || reduced) {
      draw();
      return () => window.cancelAnimationFrame(frameRef.current);
    }
    const ride = (): void => {
      draw();
      frameRef.current = window.requestAnimationFrame(ride);
    };
    frameRef.current = window.requestAnimationFrame(ride);
    return () => window.cancelAnimationFrame(frameRef.current);
  }, [engine, live]);

  return (
    <canvas
      ref={canvasRef}
      className="scope"
      width={640}
      height={88}
      role="img"
      aria-label={live ? "Live spectrum of the master bus" : "Spectrum idle — the transport is stopped"}
    />
  );
}

export default Spectrum;
