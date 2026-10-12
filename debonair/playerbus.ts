// # playerbus — the shared playback host of debonair (root layer): ONE
// take engine for the whole app, so the suno-style player bar on the shell
// and the song cards on the landing drive the same real transport the studio
// page rides. The bus owns the shelf (the session takes plus the demo plan),
// the current take, the playhead clock and the typed failure notice; pages
// subscribe for snapshots and every control goes through here, so two
// surfaces can never fight over two engines. The studio hushes the bus on
// mount (one audible transport at a time) — the bus never reaches back into
// the studio. Zero storage writes: the shelf rides the session scope.

import { planTake, type TakePlan } from "./arranger.ts";
import { TakeEngine, TransportError } from "./Sol/studio/audioengine.ts";
import { findTakeRecord, loadTakeRecords, sessionStorageOrMemory } from "./takestore.ts";

/** The demo take the bus always carries (the studio's own demo seed). */
const DEMO_PROMPT = "midnight studio take, warm sub bass, dusty keys, brass light";
const DEMO_SEED = "debonair-demo";

/** One immutable view of the bus state a subscriber receives. */
export interface PlayerSnapshot {
  /** The shelf the bus cycles through (demo first, session takes after). */
  takes: readonly TakePlan[];
  /** The index of the current take inside the shelf. */
  index: number;
  /** Whether the transport is running. */
  playing: boolean;
  /** The playhead position in seconds. */
  position: number;
  /** The duration of the current take in seconds. */
  duration: number;
  /** The typed transport failure (empty while healthy). */
  notice: string;
}

/** The subscriber callback shape. */
type Listener = (snapshot: PlayerSnapshot) => void;

/** The single bus instance (module scope — the app has one audio transport). */
let engine: TakeEngine | null = null;
let engineFailed = false;

let takes: TakePlan[] = [];
let index = 0;
let playing = false;
let position = 0;
let notice = "";
let frame = 0;
let loadedId = "";
const listeners = new Set<Listener>();

/**
 * Builds the current immutable snapshot.
 *
 * @returns the snapshot of the bus state.
 */
function snapshot(): PlayerSnapshot {
  const current = takes[index];
  return {
    takes,
    index,
    playing,
    position,
    duration: current?.durationSeconds ?? 0,
    notice,
  };
}

/**
 * Emits the snapshot to every subscriber.
 *
 * @returns nothing.
 */
function emit(): void {
  const view = snapshot();
  for (const listener of listeners) listener(view);
}

/**
 * Starts the playhead clock (a rAF loop while the transport runs).
 *
 * @returns nothing.
 */
function ride(): void {
  if (!playing || !engine) return;
  position = engine.position();
  const current = takes[index];
  if (current && position >= current.durationSeconds - 0.01 && !engine.loop) {
    playing = false;
    position = current.durationSeconds;
    engine.stop();
    emit();
    return;
  }
  emit();
  frame = window.requestAnimationFrame(ride);
}

/**
 * Loads the shelf (demo plan first, session takes after) and arms the engine
 * on the first take. Idempotent: the shelf refreshes on every call so a
 * fresh composition lands without a reload.
 *
 * @returns nothing.
 */
function arm(): void {
  try {
    const store = sessionStorageOrMemory();
    const demo = planTake({ prompt: DEMO_PROMPT, seed: DEMO_SEED });
    const stored = loadTakeRecords(store).map((record) => record.plan);
    takes = [demo, ...stored.filter((take) => take.id !== demo.id)];
  } catch {
    if (takes.length === 0) takes = [planTake({ prompt: DEMO_PROMPT, seed: DEMO_SEED })];
  }
  if (index >= takes.length) index = 0;
  if (engineFailed || !engine) return;
  const current = takes[index];
  if (!current) return;
  engine
    .load(current)
    .then(() => {
      notice = "";
      emit();
    })
    .catch((error: unknown) => {
      notice = error instanceof Error ? error.message : "the transport refused this take";
      emit();
    });
}

/**
 * Makes sure the engine exists (built once, on the first gesture-bound call).
 *
 * @returns the engine, or null when the browser refused the audio context.
 */
function ensureEngine(): TakeEngine | null {
  if (engineFailed) return null;
  if (!engine) {
    try {
      engine = new TakeEngine();
    } catch (error) {
      engineFailed = true;
      notice = error instanceof Error ? error.message : "the audio context is unavailable";
      return null;
    }
  }
  return engine;
}

/**
 * Plays the current take from the given second (the shelf arms on demand and
 * the engine reloads only when the take actually changed).
 *
 * @param from the playhead second to start at.
 * @returns nothing.
 */
export function busPlay(from = position): void {
  if (takes.length === 0) arm();
  const active = ensureEngine();
  const current = takes[index];
  if (!active || !current) return;
  const start = (): void => {
    if (!engine) return;
    try {
      engine.loop = true;
      engine.play(from);
      playing = true;
      notice = "";
      emit();
      frame = window.requestAnimationFrame(ride);
    } catch (error) {
      notice = error instanceof TransportError ? error.message : "the transport refused to start";
      playing = false;
      emit();
    }
  };
  if (loadedId === current.id) {
    start();
    return;
  }
  active
    .load(current)
    .then(() => {
      loadedId = current.id;
      start();
    })
    .catch((error: unknown) => {
      notice = error instanceof Error ? error.message : "the transport refused this take";
      playing = false;
      emit();
    });
}

/**
 * Pauses the transport (the playhead freezes where it is).
 *
 * @returns nothing.
 */
export function busPause(): void {
  if (!engine) return;
  position = engine.position();
  engine.stop();
  playing = false;
  window.cancelAnimationFrame(frame);
  emit();
}

/**
 * Toggles play/pause on the current take.
 *
 * @returns nothing.
 */
export function busToggle(): void {
  if (playing) busPause();
  else busPlay();
}

/**
 * Selects a take by id (or the next one when the id is unknown) and plays it
 * from the top.
 *
 * @param id the take id to select; omitted selects the next take.
 * @returns nothing.
 */
export function busSelect(id?: string): void {
  if (takes.length === 0) arm();
  if (id) {
    const at = takes.findIndex((take) => take.id === id);
    if (at >= 0) index = at;
  } else {
    index = (index + 1) % Math.max(takes.length, 1);
  }
  position = 0;
  if (playing) busPlay(0);
  else emit();
}

/**
 * Adds a take to the front of the shelf (a fresh composition or a song-card
 * render) and makes it current.
 *
 * @param plan the take to feature.
 * @returns nothing.
 */
export function busFeature(plan: TakePlan): void {
  const at = takes.findIndex((take) => take.id === plan.id);
  if (at >= 0) index = at;
  else {
    takes = [plan, ...takes];
    index = 0;
  }
  position = 0;
  emit();
}

/**
 * Seeks the current take (works while playing and while paused).
 *
 * @param seconds the target playhead second.
 * @returns nothing.
 */
export function busSeek(seconds: number): void {
  const current = takes[index];
  if (!current) return;
  const clamped = Math.min(Math.max(0, seconds), current.durationSeconds);
  position = clamped;
  if (playing && engine) {
    engine.stop();
    engine.play(clamped);
  }
  emit();
}

/**
 * Stops the bus transport without touching the shelf (the studio page calls
 * this on mount so only one transport is ever audible).
 *
 * @returns nothing.
 */
export function busHush(): void {
  if (!engine || !playing) return;
  position = engine.position();
  engine.stop();
  playing = false;
  window.cancelAnimationFrame(frame);
  emit();
}

/**
 * Reads the take a stored id points at (the session note the studio leaves).
 *
 * @param id the take id.
 * @returns the take plan, or undefined when the shelf does not carry it.
 */
export function busTakeById(id: string): TakePlan | undefined {
  if (takes.length === 0) arm();
  return findTakeRecord(id, sessionStorageOrMemory())?.plan ?? takes.find((take) => take.id === id);
}

/**
 * Subscribes one listener to the bus snapshots.
 *
 * @param listener the callback.
 * @returns the unsubscribe function.
 */
export function busSubscribe(listener: Listener): () => void {
  if (takes.length === 0) arm();
  listeners.add(listener);
  listener(snapshot());
  return () => {
    listeners.delete(listener);
  };
}
