/**
 * edit.tsx — the EDITOR anchor of the theme (the video editing tab): the
 * DAW-grade timeline the devthink.toml promises ("player, editor and
 * studio"). Every number on screen is an exact tick from timeticks and every
 * edit folds through the real algebra of timelineedit — overwrite/insert
 * placement of the stock slates, split at the playhead, lift and extract,
 * edge trims limited by the master's handles, slide with neighbour
 * collision, duplicate — with the refusals surfaced as honest notes (the
 * algebra never throws; the surface never lies). The view layer (px mapping,
 * ruler steps, edit points, quantized playback) rides the pure
 * timelineview.ts; the material is the stock slate bin the surface ships in
 * code — no upload, no network, nothing stored.
 *
 * Interaction map: ruler drag scrubs the playhead (magnet when snap is on);
 * clip body drag slides; clip edge drags trim; toolbar plays/pauses
 * (frame-quantized rAF), steps frames, walks the edit points; S splits,
 * Delete lifts the selection; Home/End walk to the sequence bounds; the bin
 * places on the targeted lane (v1 the picture, a1 the sound — one algebra,
 * one refusal vocabulary). Compact spacing, 44px targets, mono
 * tabular-nums on every number, the rose accent only where it means
 * something (selection ring, playhead, handles). The anchor renders BARE:
 * the one Shell chrome lives in Sol/Sol.tsx.
 *
 * The anchor carries the page mount: it is consumed only by Sol/Sol.tsx
 * (the route /edit).
 */

import {
  ArrowLeftToLine,
  ArrowRightToLine,
  Copy,
  Eraser,
  Magnet,
  Pause,
  Play,
  Scissors,
  SkipBack,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { type PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type EditItem,
  type EditTrack,
  extract,
  insert,
  itemend,
  lift,
  overwrite,
  slide,
  split,
  trim,
} from "../../timelineedit.ts";
import {
  advanceplayhead,
  clipgeometry,
  DEFAULT_ZOOM_INDEX,
  editpoints,
  mediawindow,
  pxtotick,
  refusalnote,
  rulerticks,
  sequenceend,
  snapedit,
  stockbin,
  ticktopx,
  ZOOM_LEVELS,
} from "../../timelineview.ts";
import {
  COMMON_FRAME_RATES,
  type FrameRate,
  formattimecode,
  frameduration,
  framelabel,
  snaptick,
  TICKS_PER_SECOND,
} from "../../timeticks.ts";

/** the master the stock cuts draw from: every clip's trim handles ride its
 * 20-second window (the surface ships the material, honestly labelled). */
const MASTER_TICKS = 20 * TICKS_PER_SECOND;
/** the in-point stride of the bin cuts across the master (2 s apart). */
const SLATE_IN_STRIDE = 2 * TICKS_PER_SECOND;
/** the px the ruler asks for before the magnet answers (→ ticks at 64 px/s). */
const SNAP_PX = 10;

/** the initial sequence: two unlocked tracks (v1 the picture, a1 the sound). */
function freshTracks(): EditTrack[] {
  return [
    { id: 1, locked: false, syncLock: false, items: [] },
    { id: 2, locked: false, syncLock: false, items: [] },
  ];
}

/** the next free id inside a track (the caller-owned id the algebra asks for). */
function nextid(track: EditTrack): number {
  return track.items.reduce((max, it) => Math.max(max, it.id), -1) + 1;
}

/** the clip face label: the master in point, deterministic from the item. */
function cliplabel(item: EditItem, rate: FrameRate): string {
  return `slate · in ${formattimecode(item.sourceIn, rate)}`;
}

/** one drag gesture: origin snapshot + gesture kind + start x. */
type Drag = {
  trackIndex: number;
  itemId: number;
  edge: "in" | "out" | "move";
  startX: number;
  pps: number;
  origin: EditTrack;
};

export default function Edit() {
  const [tracks, setTracks] = useState<readonly EditTrack[]>(freshTracks);
  const [selected, setSelected] = useState<{ trackIndex: number; itemId: number } | null>(null);
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState<FrameRate>(COMMON_FRAME_RATES[1] ?? { num: 24, den: 1 });
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const [snap, setSnap] = useState(true);
  const [mode, setMode] = useState<"overwrite" | "insert">("overwrite");
  const [lane, setLane] = useState<0 | 1>(0);
  const [note, setNote] = useState<string>("the sequence is empty — click a stock slate to lay the first cut.");
  const bin = useMemo(() => stockbin(), []);
  const frame = frameduration(rate);
  const pps = ZOOM_LEVELS[zoomIndex] ?? 64;
  const drag = useRef<Drag | null>(null);

  const v1 = tracks[0];
  const a1 = tracks[1];
  const seqEnd = Math.max(sequenceend(v1), sequenceend(a1));
  const merged = useMemo(
    () => ({ id: 0, locked: false, syncLock: false, items: [...v1.items, ...a1.items] }),
    [v1.items, a1.items],
  );
  const points = useMemo(() => editpoints(merged), [merged]);

  /** replaces one track of the state (the algebra answers fresh tracks). */
  const setTrackAt = useCallback((index: number, next: EditTrack) => {
    setTracks((current) => current.map((track, i) => (i === index ? next : track)));
  }, []);

  /** the snapped playhead tick for a raw tick (the magnet rides the toggle). */
  const scrubTick = useCallback(
    (raw: number): number => {
      const bounded = snaptick(rate, Math.max(0, raw), "nearest");
      if (!snap) return bounded;
      const threshold = Math.round((SNAP_PX / pps) * TICKS_PER_SECOND);
      return snapedit(merged, bounded, threshold) ?? bounded;
    },
    [merged, pps, rate, snap],
  );

  // ---- the transport -----------------------------------------------------------

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number): void => {
      const delta = now - last;
      last = now;
      setPlayhead((current) => {
        const next = advanceplayhead(rate, current, delta, true);
        if (seqEnd > 0 && next >= seqEnd) {
          setPlaying(false);
          return seqEnd;
        }
        return next;
      });
      raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [playing, rate, seqEnd]);

  const stepFrame = useCallback(
    (frames: number) => {
      setPlaying(false);
      setPlayhead((current) => Math.max(0, current + frames * frame));
    },
    [frame],
  );

  const walkPoint = useCallback(
    (direction: 1 | -1) => {
      setPlaying(false);
      setPlayhead((current) => {
        if (direction === 1) {
          const next = points.find((point) => point > current + frame / 2);
          return next ?? current;
        }
        const previous = [...points].reverse().find((point) => point < current - frame / 2);
        return previous ?? 0;
      });
    },
    [frame, points],
  );

  // ---- the edits (every one folds through timelineedit) --------------------------

  const placeSlate = useCallback(
    (slateName: string, slateIndex: number, duration: number) => {
      const track = tracks[lane];
      if (!track) {
        setNote(refusalnote("nothing"));
        return;
      }
      if (track.locked) {
        setNote(refusalnote("locked"));
        return;
      }
      const start = scrubTick(playhead);
      const item: EditItem = {
        id: nextid(track),
        start,
        duration,
        sourceIn: slateIndex * SLATE_IN_STRIDE,
        speed: 1,
      };
      const out = mode === "insert" ? insert(track, item) : overwrite(track, item);
      if (!out.ok) {
        setNote(refusalnote(out.error));
        return;
      }
      setTrackAt(lane, out.value);
      setSelected({ trackIndex: lane, itemId: item.id });
      setNote(
        `${slateName} → ${lane === 0 ? "v1" : "a1"} (${mode}) · src in ${formattimecode(item.sourceIn, rate)} · at ${formattimecode(start, rate)}`,
      );
    },
    [lane, mode, playhead, rate, scrubTick, setTrackAt, tracks],
  );

  const splitAtPlayhead = useCallback(() => {
    const index = selected?.trackIndex ?? 0;
    const track = tracks[index];
    if (!track) {
      setNote(refusalnote("nothing"));
      return;
    }
    if (track.locked) {
      setNote(refusalnote("locked"));
      return;
    }
    const out = split(track, playhead, { minDuration: frame });
    if (!out.ok) {
      setNote(refusalnote(out.error));
      return;
    }
    setTrackAt(index, out.value.track);
    setSelected({ trackIndex: index, itemId: out.value.rightId });
    setNote(`split · right piece ${out.value.rightId} · ${formattimecode(playhead, rate)}`);
  }, [frame, playhead, rate, selected, setTrackAt, tracks]);

  const rangeOp = useCallback(
    (op: "lift" | "extract") => {
      if (!selected) {
        setNote("select a clip first — the range ops ride the selection.");
        return;
      }
      const track = tracks[selected.trackIndex];
      const item = track?.items.find((it) => it.id === selected.itemId);
      if (!track || !item) {
        setNote(refusalnote("no-item"));
        return;
      }
      const out =
        op === "lift"
          ? lift(track, { start: item.start, duration: item.duration })
          : extract(track, { start: item.start, duration: item.duration });
      if (!out.ok) {
        setNote(refusalnote(out.error));
        return;
      }
      setTrackAt(selected.trackIndex, out.value);
      setSelected(null);
      setNote(op === "lift" ? "lifted — the gap stays." : "extracted — the gap closed (ripple).");
    },
    [selected, setTrackAt, tracks],
  );

  const duplicateSelected = useCallback(() => {
    if (!selected) {
      setNote("select a clip first — duplicate rides the selection.");
      return;
    }
    const track = tracks[selected.trackIndex];
    const item = track?.items.find((it) => it.id === selected.itemId);
    if (!track || !item) {
      setNote(refusalnote("no-item"));
      return;
    }
    const copy: EditItem = { ...item, id: nextid(track), start: itemend(item) };
    const out = overwrite(track, copy);
    if (!out.ok) {
      setNote(refusalnote(out.error));
      return;
    }
    setTrackAt(selected.trackIndex, out.value);
    setSelected({ trackIndex: selected.trackIndex, itemId: copy.id });
    setNote(`duplicated · ${formattimecode(copy.start, rate)}`);
  }, [rate, selected, setTrackAt, tracks]);

  // ---- the drag gestures (trim in/out, slide) ------------------------------------

  const onDragDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>, trackIndex: number, item: EditItem, edge: Drag["edge"]) => {
      const track = tracks[trackIndex];
      if (!track || track.locked) {
        setNote(refusalnote("locked"));
        return;
      }
      setSelected({ trackIndex, itemId: item.id });
      drag.current = { trackIndex, itemId: item.id, edge, startX: event.clientX, pps, origin: track };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [pps, tracks],
  );

  const onDragMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const gesture = drag.current;
      if (!gesture) return;
      const raw = pxtotick(event.clientX - gesture.startX, gesture.pps);
      const delta = Math.round(raw / frame) * frame;
      if (delta === 0) return;
      if (gesture.edge === "move") {
        const out = slide(gesture.origin, gesture.itemId, delta);
        if (out.ok) {
          setTrackAt(gesture.trackIndex, out.value);
          setNote(`slid ${delta > 0 ? "+" : ""}${(delta / TICKS_PER_SECOND).toFixed(2)} s`);
        }
        return;
      }
      const out = trim(gesture.origin, gesture.itemId, gesture.edge, delta, {
        mediaStart: 0,
        mediaDuration: MASTER_TICKS,
      });
      if (out.ok) {
        setTrackAt(gesture.trackIndex, out.value);
        setNote(`trim ${gesture.edge} ${delta > 0 ? "+" : ""}${(delta / TICKS_PER_SECOND).toFixed(2)} s`);
      } else {
        setNote(refusalnote(out.error));
      }
    },
    [frame, setTrackAt],
  );

  const onDragUp = useCallback(() => {
    drag.current = null;
  }, []);

  // ---- the keyboard layer -----------------------------------------------------------

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT"))
        return;
      if (event.key === " ") {
        event.preventDefault();
        setPlaying((current) => !current);
        return;
      }
      if (event.key === "s" || event.key === "S") {
        event.preventDefault();
        splitAtPlayhead();
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        rangeOp("lift");
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (event.shiftKey) walkPoint(-1);
        else stepFrame(-1);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (event.shiftKey) walkPoint(1);
        else stepFrame(1);
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        setPlaying(false);
        setPlayhead(0);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        setPlaying(false);
        setPlayhead(seqEnd);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rangeOp, seqEnd, splitAtPlayhead, stepFrame, walkPoint]);

  // ---- the geometry ------------------------------------------------------------------

  const contentPx = Math.max(720, ticktopx(seqEnd + 4 * TICKS_PER_SECOND, pps));
  const ruler = useMemo(() => rulerticks(0, pxtotick(contentPx, pps), rate, pps), [contentPx, pps, rate]);
  const selectedTrack = selected ? tracks[selected.trackIndex] : null;
  const selectedItem = selectedTrack?.items.find((it) => it.id === selected?.itemId) ?? null;
  const playheadPx = ticktopx(playhead, pps);

  return (
    <>
      <header className="reveal" style={{ maxWidth: "68ch", marginBottom: 22 }}>
        <p className="eyebrow" style={{ margin: "0 0 8px" }}>
          cadria · editor
        </p>
        <h1 className="page-title" style={{ fontSize: "clamp(1.9rem, 4vw, 2.75rem)", margin: "0 0 10px" }}>
          the timeline
        </h1>
        <p className="lede-tight" style={{ margin: 0, lineHeight: 1.6 }}>
          clips, trims and the playhead on exact ticks — every edit folds through the versawase edit algebra, every
          number is frame-exact SMPTE. the material is the stock slate the surface ships; nothing is uploaded, nothing
          is stored.
        </p>
      </header>

      <section className="tl-workbench reveal" aria-label="the edit timeline">
        {/* TOOLBAR — transport, tools, zoom, snap, rate; every number mono tnum */}
        <div className="tl-toolbar" role="toolbar" aria-label="edit transport and tools">
          <button
            type="button"
            className="tkey"
            aria-pressed={playing}
            aria-label={playing ? "pause" : "play"}
            title={playing ? "pause (space)" : "play (space)"}
            onClick={() => setPlaying((current) => !current)}
          >
            {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="tkey"
            aria-label="to start"
            title="to the sequence start (home)"
            onClick={() => {
              setPlaying(false);
              setPlayhead(0);
            }}
          >
            <SkipBack size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="tkey"
            aria-label="previous edit point"
            title="previous edit point (shift+←)"
            onClick={() => walkPoint(-1)}
          >
            <ArrowLeftToLine size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="tkey"
            aria-label="next edit point"
            title="next edit point (shift+→)"
            onClick={() => walkPoint(1)}
          >
            <ArrowRightToLine size={15} aria-hidden="true" />
          </button>
          <span className="tl-kv" style={{ marginLeft: 6 }}>
            <strong className="is-signal" style={{ fontSize: 13 }}>
              {formattimecode(playhead, rate)}
            </strong>
          </span>

          <span
            aria-hidden="true"
            style={{ width: 1, alignSelf: "stretch", background: "var(--line)", margin: "0 6px" }}
          />
          <button
            type="button"
            className="tkey"
            aria-label="split at the playhead"
            title="split at the playhead (s)"
            onClick={splitAtPlayhead}
          >
            <Scissors size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="tkey"
            aria-label="lift the selection"
            title="lift the selection — the gap stays (delete)"
            onClick={() => rangeOp("lift")}
          >
            <Eraser size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="tkey"
            aria-label="extract the selection"
            title="extract the selection — the gap closes (ripple)"
            onClick={() => rangeOp("extract")}
          >
            <span className="mono-label" style={{ fontSize: 10 }}>
              x
            </span>
          </button>
          <button
            type="button"
            className="tkey"
            aria-label="duplicate the selection"
            title="duplicate the selection after itself"
            onClick={duplicateSelected}
          >
            <Copy size={14} aria-hidden="true" />
          </button>

          <span
            aria-hidden="true"
            style={{ width: 1, alignSelf: "stretch", background: "var(--line)", margin: "0 6px" }}
          />
          <button
            type="button"
            className="tkey"
            aria-pressed={mode === "insert"}
            aria-label="place mode: insert pushes the rest right"
            title="place mode: insert pushes the rest right"
            onClick={() => setMode("insert")}
          >
            <span className="mono-label" style={{ fontSize: 10 }}>
              ins
            </span>
          </button>
          <button
            type="button"
            className="tkey"
            aria-pressed={mode === "overwrite"}
            aria-label="place mode: overwrite covers the span"
            title="place mode: overwrite covers the span"
            onClick={() => setMode("overwrite")}
          >
            <span className="mono-label" style={{ fontSize: 10 }}>
              ovr
            </span>
          </button>

          <span
            aria-hidden="true"
            style={{ width: 1, alignSelf: "stretch", background: "var(--line)", margin: "0 6px" }}
          />
          <button
            type="button"
            className="tkey"
            aria-pressed={lane === 0}
            aria-label="target lane v1 — the picture lane"
            title="target lane v1 — the picture lane"
            onClick={() => setLane(0)}
          >
            <span className="mono-label" style={{ fontSize: 10 }}>
              v1
            </span>
          </button>
          <button
            type="button"
            className="tkey"
            aria-pressed={lane === 1}
            aria-label="target lane a1 — the sound lane"
            title="target lane a1 — the sound lane (the same algebra, the same refusals)"
            onClick={() => setLane(1)}
          >
            <span className="mono-label" style={{ fontSize: 10 }}>
              a1
            </span>
          </button>

          <span style={{ flex: 1 }} />
          <button
            type="button"
            className="tkey"
            aria-pressed={snap}
            aria-label="snap the playhead to edit points"
            title="snap the playhead to the edit points"
            onClick={() => setSnap((current) => !current)}
          >
            <Magnet size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="tkey"
            aria-label="zoom out"
            title="zoom out"
            onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
          >
            <ZoomOut size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="tkey"
            aria-label="zoom in"
            title="zoom in"
            onClick={() => setZoomIndex((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1))}
          >
            <ZoomIn size={15} aria-hidden="true" />
          </button>
          <span className="tl-kv">{pps} px/s</span>
          <label className="tl-kv" htmlFor="tl-rate">
            rate
          </label>
          <select
            id="tl-rate"
            className="input"
            style={{ width: 104, minHeight: 36, padding: "4px 8px" }}
            value={`${rate.num}/${rate.den}`}
            onChange={(event) => {
              const [num, den] = event.target.value.split("/").map(Number);
              setRate({ num, den });
            }}
          >
            {COMMON_FRAME_RATES.map((option) => (
              <option key={`${option.num}/${option.den}`} value={`${option.num}/${option.den}`}>
                {framelabel(option)} fps
              </option>
            ))}
          </select>
        </div>

        {/* THE TIMELINE — the ruler + the two lanes + the playhead, one x-scroll.
            the scrub is a native range laid invisible over the ruler: the thumb
            drag IS the playhead scrub, the keyboard steps a frame natively, and
            the change folds through the snap magnet of timelineview. */}
        <div className="tl-scroll">
          <div className="tl-canvas" style={{ width: contentPx }}>
            <div className="tl-ruler">
              {ruler.map((entry) => (
                <span
                  key={entry.tick}
                  className="tl-rtick"
                  data-major={entry.major}
                  style={{ left: ticktopx(entry.tick, pps) }}
                />
              ))}
              {ruler
                .filter((entry) => entry.major)
                .map((entry) => (
                  <span key={`label-${entry.tick}`} className="tl-rlabel" style={{ left: ticktopx(entry.tick, pps) }}>
                    {entry.label}
                  </span>
                ))}
              <input
                className="tl-scrub"
                type="range"
                min={0}
                max={Math.max(1, seqEnd)}
                step={frame}
                value={playhead}
                aria-label="the playhead — drag to scrub"
                onChange={(event) => {
                  const raw = Number(event.target.value);
                  const threshold = Math.round((SNAP_PX / pps) * TICKS_PER_SECOND);
                  setPlayhead(snap ? (snapedit(merged, raw, threshold) ?? raw) : raw);
                }}
              />
            </div>

            {tracks.map((track, trackIndex) => (
              <div key={track.id} className="tl-track" data-locked={track.locked}>
                <div className="tl-thead">
                  <span>{trackIndex === 0 ? "v1" : "a1"}</span>
                  <button
                    type="button"
                    className="tl-lock"
                    aria-pressed={track.locked}
                    aria-label={
                      track.locked
                        ? `unlock lane ${trackIndex === 0 ? "v1" : "a1"}`
                        : `lock lane ${trackIndex === 0 ? "v1" : "a1"}`
                    }
                    title={track.locked ? "unlock the lane" : "lock the lane — every edit refuses"}
                    onClick={() => {
                      setTrackAt(trackIndex, { ...track, locked: !track.locked });
                      setNote(
                        track.locked ? "lane unlocked." : "lane locked — every edit refuses until you unlock it.",
                      );
                    }}
                  >
                    <span className="tl-lockdot" data-on={track.locked} />
                  </button>
                </div>
                {track.items.length === 0 && (
                  <p
                    className="mono-label"
                    style={{ position: "absolute", left: 84, top: "50%", transform: "translateY(-50%)", margin: 0 }}
                  >
                    {trackIndex === 0
                      ? "no picture yet — place a stock slate from the bin"
                      : "no sound yet — the sound lane rides the same algebra"}
                  </p>
                )}
                {track.items.map((item) => {
                  const box = clipgeometry(item, pps);
                  const mediaWin = mediawindow(item, MASTER_TICKS);
                  const isSelected = selected?.trackIndex === trackIndex && selected.itemId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="tl-clip"
                      data-selected={isSelected}
                      style={{ left: box.left, width: box.width }}
                      onPointerDown={(event) => onDragDown(event, trackIndex, item, "move")}
                      onPointerMove={onDragMove}
                      onPointerUp={onDragUp}
                    >
                      <span
                        aria-hidden="true"
                        className="tl-clip__face"
                        style={{
                          left: `${mediaWin.from * 100}%`,
                          width: `${Math.max(0, (mediaWin.to - mediaWin.from) * 100)}%`,
                        }}
                      />
                      <span className="tl-clip__name">{cliplabel(item, rate)}</span>
                      <span className="tl-clip__meta">
                        {(item.duration / TICKS_PER_SECOND).toFixed(2)}s
                        {item.speed !== 1 ? ` · ${item.speed.toFixed(2)}×` : ""}
                      </span>
                      <span
                        aria-hidden="true"
                        className="tl-handle"
                        data-edge="in"
                        onPointerDown={(event) => {
                          event.stopPropagation();
                          onDragDown(event, trackIndex, item, "in");
                        }}
                      />
                      <span
                        aria-hidden="true"
                        className="tl-handle"
                        data-edge="out"
                        onPointerDown={(event) => {
                          event.stopPropagation();
                          onDragDown(event, trackIndex, item, "out");
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ))}

            <div aria-hidden="true" className="tl-playhead" style={{ left: playheadPx }} />
          </div>
        </div>

        {/* READOUT — the sequence's own ledger, mono tabular-nums */}
        <div className="tl-readout">
          <span className="tl-kv">
            sequence <strong>{formattimecode(seqEnd, rate)}</strong>
          </span>
          <span className="tl-kv">
            clips <strong>{v1.items.length + a1.items.length}</strong>
          </span>
          <span className="tl-kv">
            edit points <strong>{points.length}</strong>
          </span>
          {selectedItem ? (
            <span className="tl-kv">
              clip <strong>{selectedItem.id}</strong> · in <strong>{formattimecode(selectedItem.start, rate)}</strong> ·
              out <strong>{formattimecode(itemend(selectedItem), rate)}</strong> · src{" "}
              <strong>{formattimecode(selectedItem.sourceIn, rate)}</strong> ·{" "}
              <strong>{selectedItem.speed.toFixed(2)}×</strong>
            </span>
          ) : (
            <span className="tl-kv">no selection</span>
          )}
          <span className="tl-kv" role="status" aria-live="polite" style={{ marginLeft: "auto" }}>
            {note}
          </span>
        </div>

        {/* THE BIN — the honest material: the stock slate cuts, in-code */}
        <fieldset className="tl-bin" aria-label="the stock slate bin">
          <span className="mono-label" style={{ margin: "0 6px 0 0", alignSelf: "center" }}>
            stock slate · 20 s master
          </span>
          {bin.map((slate, index) => (
            <button
              key={slate.id}
              type="button"
              className="chip"
              title={`${slate.detail} — ${mode} on ${lane === 0 ? "v1" : "a1"} at the playhead`}
              onClick={() => placeSlate(slate.name, index, slate.duration)}
            >
              {slate.name} · {(slate.duration / TICKS_PER_SECOND).toFixed(0)}s
            </button>
          ))}
        </fieldset>
      </section>

      {/* the keyboard map, quiet and honest */}
      <p className="mono-label" style={{ margin: "14px 4px 0", maxWidth: "72ch", lineHeight: 1.7 }}>
        keys — space play/pause · s split at the playhead · delete lift the selection · ←/→ step a frame · shift+←/→
        walk the edit points · home start · end sequence end · drag the ruler to scrub · drag a clip body to slide ·
        drag a clip edge to trim (limited by the master's handles) — the bin places on the targeted lane (v1/a1)
      </p>
    </>
  );
}
