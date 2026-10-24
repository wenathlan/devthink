/**
 * timeline.tsx — the arrangement editor of the studio (Sol layer): the
 * playlist grows hands. The ruler reads formatClock (dawview.ts), the clips
 * draw from plan.clips with px = seconds × pxPerSecond — the editor never
 * answers a percent — and the pointer edits ride the timelinemodel algebra:
 * drag moves through moveClip + the snap grid, the edge handles trim through
 * trimClip, the split key cuts at the playhead through splitClip. Every
 * landing is validated with validatePlacement before it commits; a refused
 * edit keeps the arrangement and names the refusal. The keyboard edits too:
 * arrows walk the selected clip one snap step, Delete and D delete and
 * duplicate. Zero audio math here — the page owns the plan and the engine.
 */

import { CopyRegular, CutRegular, DeleteRegular } from "@fluentui/react-icons";
import { type KeyboardEvent, type PointerEvent, useCallback, useMemo, useRef, useState } from "react";
import { beatSecondsOf, ROLE_NAMES, type TakePlan } from "../../arranger.ts";
import { formatClock } from "../../dawview.ts";
import { label, labelfill } from "../../labels.ts";
import {
  moveClip,
  snapToGrid,
  splitClip,
  type TimelineClip,
  type TimelineGrid,
  TimelineModelError,
  trimClip,
  validatePlacement,
} from "../../timelinemodel.ts";

/** the seconds→pixels law of the editor (the lanes scroll, nothing squeezes) */
const PX_PER_SECOND = 56;
/** the smallest lane the editor draws (the arrangement always outgrows it) */
const MIN_LANE_PX = 720;

/** the drag the pointer is carrying (move or one of the two trim edges). */
type DragKind = "move" | "trim-start" | "trim-end";

type DragState = {
  kind: DragKind;
  originX: number;
  clip: TimelineClip;
};

/** the ghost the drag previews (the last placement the model accepted). */
type Ghost = {
  id: string;
  start: number;
  duration: number;
};

type TimelineProps = {
  /** the plan the arrangement answers to (clock, grid, duration). */
  plan: TakePlan;
  /** the clips on the desk (the live arrangement). */
  clips: readonly TimelineClip[];
  /** the playhead in seconds. */
  playhead: number;
  /** the selected clip id. */
  selectedId: string;
  /** the select hand-off. */
  onSelect: (id: string) => void;
  /** the edit hand-off (a whole, validated arrangement). */
  onEdit: (clips: readonly TimelineClip[]) => void;
  /** the seek hand-off (the ruler rides the transport). */
  onSeek: (seconds: number) => void;
  /** the refusal line (the page renders it). */
  onNotice: (message: string) => void;
};

/**
 * Timeline — the seconds-based arrangement editor.
 *
 * @param props the plan, the clips, the playhead and the edit hand-offs.
 * @returns the timeline editor element.
 */
export function Timeline({ plan, clips, playhead, selectedId, onSelect, onEdit, onSeek, onNotice }: TimelineProps) {
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const ghostRef = useRef<Ghost | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const grid: TimelineGrid = useMemo(() => ({ stepseconds: beatSecondsOf(plan) }), [plan]);
  const lanePx = Math.max(MIN_LANE_PX, Math.ceil(plan.durationSeconds * PX_PER_SECOND));
  const barTicks = useMemo(
    () =>
      Array.from({ length: plan.bars + 1 }, (_, bar) => ({ bar, seconds: Number((bar * plan.barSeconds).toFixed(6)) })),
    [plan],
  );

  const others = useCallback((id: string) => clips.filter((clip) => clip.id !== id), [clips]);

  /** previews one accepted placement (the ghost is the honest candidate). */
  const preview = useCallback((candidate: TimelineClip) => {
    const next = { id: candidate.id, start: candidate.start, duration: candidate.duration };
    ghostRef.current = next;
    setGhost(next);
  }, []);

  const beginDrag = useCallback(
    (kind: DragKind, clip: TimelineClip) => (event: PointerEvent<HTMLElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = { kind, originX: event.clientX, clip };
      preview(clip);
    },
    [preview],
  );

  const onDragMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      const delta = (event.clientX - drag.originX) / PX_PER_SECOND;
      try {
        if (drag.kind === "move") {
          const moved = moveClip(drag.clip, delta, others(drag.clip.id), { grid });
          if (moved.start + moved.duration > plan.durationSeconds + 1e-6) return;
          preview(moved);
          return;
        }
        if (drag.kind === "trim-start") {
          const target = snapToGrid(Math.max(0, drag.clip.start + delta), grid);
          const trimmed = trimClip(drag.clip, "start", target);
          validatePlacement(trimmed, others(drag.clip.id));
          preview(trimmed);
          return;
        }
        const target = snapToGrid(drag.clip.start + drag.clip.duration + delta, grid);
        const trimmed = trimClip(drag.clip, "end", target);
        validatePlacement(trimmed, others(drag.clip.id));
        preview(trimmed);
      } catch {
        /* the model refused the landing — the last valid ghost stays */
      }
    },
    [grid, others, plan.durationSeconds, preview],
  );

  const endDrag = useCallback(() => {
    const drag = dragRef.current;
    dragRef.current = null;
    const settled = ghostRef.current;
    ghostRef.current = null;
    setGhost(null);
    if (!drag || !settled) return;
    if (Math.abs(settled.start - drag.clip.start) < 1e-9 && Math.abs(settled.duration - drag.clip.duration) < 1e-9)
      return;
    onEdit(
      clips.map((clip) =>
        clip.id === drag.clip.id ? { ...drag.clip, start: settled.start, duration: settled.duration } : clip,
      ),
    );
  }, [clips, onEdit]);

  /** the one edit wrapper: every command answers through the model's own law. */
  const place = useCallback(
    (next: readonly TimelineClip[]): boolean => {
      try {
        for (const clip of next) validatePlacement(clip, next);
        onEdit([...next]);
        return true;
      } catch (error) {
        onNotice(error instanceof TimelineModelError ? error.message : label("studio.timeline.refusedEdit"));
        return false;
      }
    },
    [onEdit, onNotice],
  );

  const selected = clips.find((clip) => clip.id === selectedId) ?? null;

  const split = useCallback(() => {
    if (!selected) return onNotice(label("studio.timeline.selectSplit"));
    if (playhead <= selected.start + 1e-6 || playhead >= selected.start + selected.duration - 1e-6)
      return onNotice(label("studio.timeline.playheadOutside"));
    const rest = clips.filter((clip) => clip.id !== selected.id);
    const [left, right] = splitClip(selected, playhead);
    if (place([...rest, left, right])) onSelect(left.id);
  }, [clips, onNotice, place, playhead, selected, onSelect]);

  const duplicate = useCallback(() => {
    if (!selected) return onNotice(label("studio.timeline.selectDup"));
    let copyIndex = 1;
    let candidate = {
      ...selected,
      id: `${selected.id}-copy${copyIndex}`,
      start: snapToGrid(selected.start + selected.duration, grid),
    };
    while (clips.some((clip) => clip.id === candidate.id)) {
      copyIndex += 1;
      candidate = { ...candidate, id: `${selected.id}-copy${copyIndex}` };
    }
    for (let attempt = 0; attempt < plan.bars * 4; attempt++) {
      if (candidate.start + candidate.duration > plan.durationSeconds + 1e-6) break;
      try {
        validatePlacement(candidate, clips);
        onEdit([...clips, candidate]);
        onSelect(candidate.id);
        return;
      } catch {
        candidate = { ...candidate, start: snapToGrid(candidate.start + grid.stepseconds, grid) };
      }
    }
    onNotice(label("studio.timeline.noRoom"));
  }, [clips, grid, onEdit, onNotice, onSelect, plan.bars, plan.durationSeconds, selected]);

  const remove = useCallback(() => {
    if (!selected) return onNotice(label("studio.timeline.selectDelete"));
    onEdit(clips.filter((clip) => clip.id !== selected.id));
    onSelect("");
  }, [clips, onEdit, onNotice, selected, onSelect]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        remove();
        return;
      }
      if (event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicate();
        return;
      }
      if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && selected) {
        event.preventDefault();
        const dir = event.key === "ArrowLeft" ? -1 : 1;
        try {
          const moved = moveClip(selected, dir * grid.stepseconds, others(selected.id), { grid });
          place(clips.map((clip) => (clip.id === selected.id ? moved : clip)));
        } catch (error) {
          onNotice(error instanceof TimelineModelError ? error.message : label("studio.timeline.refusedMove"));
        }
      }
    },
    [clips, duplicate, grid, onNotice, others, place, remove, selected],
  );

  const ghostFor = (clip: TimelineClip): { start: number; duration: number } =>
    ghost && ghost.id === clip.id ? ghost : { start: clip.start, duration: clip.duration };

  return (
    <section className="rack-panel tled" aria-label={label("studio.timeline.aria")}>
      <header className="rack-head">
        <h2 className="rack-title">{label("studio.timeline.title")}</h2>
        <span className="rack-meta">
          {labelfill("studio.timeline.meta", {
            clock: formatClock(plan.durationSeconds),
            snap: grid.stepseconds.toFixed(3),
          })}
        </span>
        <div className="tled-keys">
          <button
            className="tled-key"
            type="button"
            aria-label={label("studio.timeline.splitAria")}
            onClick={split}
          >
            <CutRegular className="tled-icon" fontSize={14} aria-hidden="true" />
            {label("studio.timeline.split")}
          </button>
          <button
            className="tled-key"
            type="button"
            aria-label={label("studio.timeline.dupAria")}
            onClick={duplicate}
          >
            <CopyRegular className="tled-icon" fontSize={14} aria-hidden="true" />
            {label("studio.timeline.dup")}
          </button>
          <button className="tled-key" type="button" aria-label={label("studio.timeline.deleteAria")} onClick={remove}>
            <DeleteRegular className="tled-icon" fontSize={14} aria-hidden="true" />
            {label("studio.timeline.delete")}
          </button>
        </div>
      </header>
      <div className="tled-scroll">
        <div className="tled-inner" style={{ minWidth: lanePx + 96 }}>
          <div className="tled-rulerrow" aria-hidden="true">
            <div className="tled-spacer" />
            <div className="tled-ruler" style={{ width: lanePx }}>
              {barTicks.map((tick) => (
                <span key={`tick-${tick.bar}`} className="tled-tick" style={{ left: tick.seconds * PX_PER_SECOND }}>
                  {formatClock(tick.seconds)}
                </span>
              ))}
              <input
                className="tled-scrub"
                type="range"
                min={0}
                max={plan.durationSeconds}
                step={0.1}
                value={Math.min(playhead, plan.durationSeconds)}
                onChange={(event) => onSeek(Number(event.currentTarget.value))}
                aria-label={label("studio.timeline.seekAria")}
              />
            </div>
          </div>
          {ROLE_NAMES.map((role) => (
            <div key={role} className="tled-track">
              <div className="tled-trackhead">
                <b>{role}</b>
                <small>{plan.strips.find((strip) => strip.name === role)?.faderDb.toFixed(1)} dB</small>
              </div>
              <div className="tled-lane" style={{ width: lanePx }}>
                {clips
                  .filter((clip) => clip.track === role)
                  .map((clip) => {
                    const geo = ghostFor(clip);
                    const isSelected = clip.id === selectedId;
                    return (
                      <div
                        key={clip.id}
                        className="tled-clip"
                        data-selected={isSelected ? "true" : undefined}
                        style={{
                          left: `${geo.start * PX_PER_SECOND}px`,
                          width: `${Math.max(8, geo.duration * PX_PER_SECOND)}px`,
                        }}
                      >
                        <button
                          className="tled-clipbody"
                          type="button"
                          aria-pressed={isSelected}
                          aria-label={labelfill("studio.timeline.clipAria", {
                            label: clip.label,
                            role,
                            start: formatClock(geo.start),
                            length: formatClock(geo.duration),
                          })}
                          onKeyDown={onKeyDown}
                          onPointerDown={beginDrag("move", clip)}
                          onPointerMove={onDragMove}
                          onPointerUp={endDrag}
                        >
                          {clip.label}
                        </button>
                        <div
                          className="tled-handle"
                          data-edge="start"
                          aria-hidden="true"
                          onPointerDown={beginDrag("trim-start", clip)}
                          onPointerMove={onDragMove}
                          onPointerUp={endDrag}
                        />
                        <div
                          className="tled-handle"
                          data-edge="end"
                          aria-hidden="true"
                          onPointerDown={beginDrag("trim-end", clip)}
                          onPointerMove={onDragMove}
                          onPointerUp={endDrag}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
          <div className="tled-playhead" style={{ left: `calc(var(--tled-label) + ${playhead * PX_PER_SECOND}px)` }} />
        </div>
      </div>
    </section>
  );
}

export default Timeline;
