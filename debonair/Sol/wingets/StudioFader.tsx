/**
 * Fader.tsx — the vertical channel fader of the studio mixer (Sol layer):
 * a real pointer-draggable, keyboard-walkable slider over the −60..+6 dB
 * travel (dawview.ts owns the math). The cap rides the brass accent, the
 * fill reads the level under it, double-click resets the unity 0 dB point.
 * No input[type=range] rotation trick — the geometry is honest.
 */
import { type KeyboardEvent, type PointerEvent, useCallback, useRef } from "react";
import { clampFader, FADER_MAX_DB, FADER_MIN_DB, faderToUnit, unitToFader } from "../../dawview.ts";
import { labelfill } from "../../labels.ts";

/** The keyboard walk per press (fine and coarse, in dB). */
const STEP_FINE = 0.5;
const STEP_COARSE = 3;

type FaderProps = {
  /** The strip the fader belongs to (aria + the reset label). */
  name: string;
  /** The current fader value in dB. */
  value: number;
  /** The change callback (already clamped, 0.5 dB steps from the keyboard). */
  onChange: (db: number) => void;
  /** Marks the master strip's fader. */
  master?: boolean;
};

/**
 * The vertical fader of one strip.
 *
 * @param props the strip name, the dB value and the change callback.
 * @returns the fader element.
 */
export function Fader({ name, value, onChange, master }: FaderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const unit = faderToUnit(value);

  /** Maps a pointer position onto the travel and commits it. */
  const commitPointer = useCallback(
    (clientY: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const travel = rect.height - 26; // the cap's own height rides inside the travel
      const offset = Math.min(Math.max(clientY - rect.top - 13, 0), Math.max(travel, 1));
      onChange(unitToFader(1 - offset / Math.max(travel, 1)));
    },
    [onChange],
  );

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    event.currentTarget.setPointerCapture(event.pointerId);
    commitPointer(event.clientY);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    if (event.buttons === 0) return;
    commitPointer(event.clientY);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const jumps: Record<string, number> = {
      ArrowUp: STEP_FINE,
      ArrowRight: STEP_FINE,
      ArrowDown: -STEP_FINE,
      ArrowLeft: -STEP_FINE,
      PageUp: STEP_COARSE,
      PageDown: -STEP_COARSE,
    };
    if (event.key === "Home") {
      onChange(FADER_MAX_DB);
      event.preventDefault();
      return;
    }
    if (event.key === "End") {
      onChange(FADER_MIN_DB);
      event.preventDefault();
      return;
    }
    const step = jumps[event.key];
    if (step === undefined) return;
    onChange(clampFader(value + step));
    event.preventDefault();
  };

  return (
    <div
      ref={trackRef}
      className={master ? "vfader vfader--master" : "vfader"}
      role="slider"
      tabIndex={0}
      aria-label={labelfill("studio.fader.aria", { name })}
      aria-valuemin={FADER_MIN_DB}
      aria-valuemax={FADER_MAX_DB}
      aria-valuenow={Number(value.toFixed(1))}
      aria-valuetext={labelfill("studio.fader.valueText", { value: value.toFixed(1) })}
      aria-orientation="vertical"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onDoubleClick={() => onChange(0)}
      onKeyDown={onKeyDown}
    >
      <span className="vfader__rail" aria-hidden="true" />
      <span className="vfader__fill" style={{ height: `${unit * 100}%` }} aria-hidden="true" />
      <span
        className="vfader__cap"
        style={{ bottom: `calc(${(unit * 100).toFixed(2)}% - ${(unit * 26).toFixed(2)}px)` }}
        aria-hidden="true"
      >
        <i />
      </span>
    </div>
  );
}

export default Fader;
