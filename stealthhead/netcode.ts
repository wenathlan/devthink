/**
 * netcode.ts — the deterministic network layer of stealthhead (root layer).
 *
 * snapshot deltas, client entity interpolation, input reconciliation and
 * lag compensation by buffer rewind, plus the arrival jitter the playout
 * delay absorbs. the design is absorbed from the official catalog through
 * the LOGICS-6 wave plan (the total-tick discipline of filmcraft time,
 * rebuilt as native typescript): every function is pure over plain
 * structs, the same command list always replays the same world, and the
 * client prediction runs the exact same movement math as the server.
 * non-goals: no sockets, no wire serialization, no encryption, no
 * bandwidth shaping — the transport stays outside this file.
 */

/** one entity state the snapshots carry (positions in world units). */
export type EntityState = {
  /** the entity identity. */
  id: string;
  /** the simulation tick the state was produced at. */
  tick: number;
  px: number;
  py: number;
  pz: number;
  /** the facing angle in radians on the x/z plane. */
  yaw: number;
};

/** one full world snapshot: every entity at one tick. */
export type Snapshot = { tick: number; time: number; entities: EntityState[] };

/** one delta snapshot: only what moved, spawned or despawned. */
export type SnapshotDelta = {
  /** the tick the delta is computed against. */
  base: number;
  tick: number;
  time: number;
  /** entities whose position or yaw changed, including new spawns. */
  changed: EntityState[];
  /** ids the base still carries and the next snapshot dropped. */
  removed: string[];
};

/** one client input command (the deterministic twin of the server sim). */
export type InputCmd = { seq: number; forward: number; side: number; yaw: number; dt: number };

/** the outcome of a reconciliation pass. */
export type Reconciliation = { state: EntityState; replayed: InputCmd[]; error: number };

/** one packet arrival the jitter buffer orders. */
export type JitterPacket = { tick: number; arrivedat: number };

/** the playout buffer: orders arrivals and delays them by the jitter. */
export type JitterBuffer = { packets: JitterPacket[]; capacity: number; delay: number };

/** the rewind history the server keeps for lag compensation. */
export type RewindBuffer = { frames: Snapshot[]; capacity: number };

/** the ground speed the prediction and the server both simulate, u/s. */
export const CMDSPEED = 6;

/** the default interpolation delay the client renders behind, ms. */
export const DEFAULTINTERPDELAY = 100;

/** the position error that triggers a reconcile, world units. */
export const RECONCILETHRESHOLD = 0.1;

/** how many rewind frames the lag-compensation history keeps. */
export const REWINDCAP = 32;

/** wraps an angle into [0, 2π). */
export function wrapangle(a: number): number {
  const turn = Math.PI * 2;
  return ((a % turn) + turn) % turn;
}

/** the shortest-arc yaw interpolation (never spins the long way). */
export function yawlerp(a: number, b: number, t: number): number {
  const turn = Math.PI * 2;
  let d = wrapangle(b - a);
  if (d > Math.PI) d -= turn;
  return wrapangle(a + d * t);
}

/** whether two states actually moved (identity and tick excluded). */
function moved(a: EntityState, b: EntityState): boolean {
  return a.px !== b.px || a.py !== b.py || a.pz !== b.pz || a.yaw !== b.yaw;
}

/**
 * diffs a full snapshot against its base: only movers and spawns enter
 * the changed list, despawns enter removed.
 *
 * @param base the previous full snapshot.
 * @param next the new full snapshot.
 * @returns the delta.
 */
export function makedelta(base: Snapshot, next: Snapshot): SnapshotDelta {
  const baseids = new Map(base.entities.map((entity) => [entity.id, entity]));
  const nextids = new Map(next.entities.map((entity) => [entity.id, entity]));
  const changed = next.entities.filter((entity) => {
    const before = baseids.get(entity.id);
    return !before || moved(before, entity);
  });
  const removed = base.entities.filter((entity) => !nextids.has(entity.id)).map((entity) => entity.id);
  return { base: base.tick, tick: next.tick, time: next.time, changed, removed };
}

/**
 * rebuilds the full snapshot from a base plus a delta (the client side).
 *
 * @param base the full snapshot the delta keys on.
 * @param delta the delta to apply.
 * @returns the reconstructed snapshot.
 */
export function applydelta(base: Snapshot, delta: SnapshotDelta): Snapshot {
  const byid = new Map(base.entities.map((entity) => [entity.id, entity]));
  for (const id of delta.removed) byid.delete(id);
  for (const entity of delta.changed) byid.set(entity.id, entity);
  return { tick: delta.tick, time: delta.time, entities: [...byid.values()] };
}

/** the newest snapshot of a stream (highest tick wins). */
export function latestsnapshot(snapshots: Snapshot[]): Snapshot | null {
  return snapshots.reduce<Snapshot | null>(
    (best, snapshot) => (best === null || snapshot.tick > best.tick ? snapshot : best),
    null,
  );
}

/**
 * the snapshot pair bracketing a render time (no extrapolation — times
 * outside the buffer range return null).
 *
 * @param snapshots the ordered snapshot stream.
 * @param time the render time in ms.
 * @returns the bracketing pair or null.
 */
export function bracketpair(snapshots: Snapshot[], time: number): [Snapshot, Snapshot] | null {
  for (let i = snapshots.length - 1; i > 0; i--) {
    if (snapshots[i - 1].time <= time && time <= snapshots[i].time) return [snapshots[i - 1], snapshots[i]];
  }
  return null;
}

/** interpolates one entity between two states by fraction t. */
export function lerpentity(a: EntityState, b: EntityState, t: number): EntityState {
  return {
    id: b.id,
    tick: b.tick,
    px: a.px + (b.px - a.px) * t,
    py: a.py + (b.py - a.py) * t,
    pz: a.pz + (b.pz - a.pz) * t,
    yaw: yawlerp(a.yaw, b.yaw, t),
  };
}

/**
 * the client render state at a time: pairs of entities interpolate,
 * entities that only exist in the newer snapshot spawn as-is, entities
 * only in the older one are gone.
 *
 * @param snapshots the ordered snapshot stream.
 * @param time the render time in ms.
 * @returns the interpolated entity states.
 */
export function interpolateat(snapshots: Snapshot[], time: number): EntityState[] {
  const pair = bracketpair(snapshots, time);
  if (!pair) return [];
  const [older, newer] = pair;
  const span = newer.time - older.time;
  const t = span === 0 ? 1 : Math.min(1, Math.max(0, (time - older.time) / span));
  const olderids = new Map(older.entities.map((entity) => [entity.id, entity]));
  return newer.entities.map((entity) => {
    const before = olderids.get(entity.id);
    return before ? lerpentity(before, entity, t) : entity;
  });
}

/**
 * the shared movement simulation: both the client prediction and the
 * server run this exact function, so replays never diverge. forward and
 * side are unit inputs; side is 90° clockwise of forward on the x/z plane.
 *
 * @param entity the predicted entity.
 * @param cmd the input command.
 * @returns the advanced entity.
 */
export function simulatecmd(entity: EntityState, cmd: InputCmd): EntityState {
  const dx = (Math.cos(cmd.yaw) * cmd.forward + Math.sin(cmd.yaw) * cmd.side) * CMDSPEED * cmd.dt;
  const dz = (Math.sin(cmd.yaw) * cmd.forward - Math.cos(cmd.yaw) * cmd.side) * CMDSPEED * cmd.dt;
  return { ...entity, tick: entity.tick + 1, px: entity.px + dx, pz: entity.pz + dz, yaw: cmd.yaw };
}

/** replays a command list over a state (the reconcile correction path). */
export function replaycmds(entity: EntityState, cmds: InputCmd[]): EntityState {
  return cmds.reduce((state, cmd) => simulatecmd(state, cmd), entity);
}

/** the 3d position error between the predicted and the server state. */
export function positionerror(local: EntityState, server: EntityState): number {
  const dx = local.px - server.px;
  const dy = local.py - server.py;
  const dz = local.pz - server.pz;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** whether the drift passed the reconcile threshold. */
export function needsreconcile(local: EntityState, server: EntityState, threshold: number): boolean {
  return positionerror(local, server) > threshold;
}

/**
 * the reconciliation pass: below threshold the prediction stands; above
 * it the server state wins and the unacknowledged commands replay.
 *
 * @param local the predicted entity.
 * @param server the authoritative entity.
 * @param pending the unacknowledged commands, in order.
 * @param threshold the drift threshold.
 * @returns the reconciled state plus what was replayed.
 */
export function reconcile(
  local: EntityState,
  server: EntityState,
  pending: InputCmd[],
  threshold: number,
): Reconciliation {
  const error = positionerror(local, server);
  if (error <= threshold) return { state: local, replayed: [], error };
  return { state: replaycmds(server, pending), replayed: pending, error };
}

/**
 * pushes a snapshot into the rewind history: ordered ascending by tick,
 * capped to the newest frames.
 *
 * @param buffer the current history.
 * @param snapshot the frame to keep.
 * @returns the new history.
 */
export function pushrewind(buffer: RewindBuffer, snapshot: Snapshot): RewindBuffer {
  const frames = [...buffer.frames.filter((frame) => frame.tick !== snapshot.tick), snapshot].sort(
    (a, b) => a.tick - b.tick,
  );
  return { capacity: buffer.capacity, frames: frames.slice(Math.max(0, frames.length - buffer.capacity)) };
}

/** the newest frame at or before the tick (the lag-comp rewind target). */
export function rewindattick(buffer: RewindBuffer, tick: number): Snapshot | null {
  let best: Snapshot | null = null;
  for (const frame of buffer.frames) if (frame.tick <= tick && (!best || frame.tick > best.tick)) best = frame;
  return best;
}

/** the lag-compensated position of one entity at one historical tick. */
export function entityattick(buffer: RewindBuffer, tick: number, id: string): EntityState | null {
  const frame = rewindattick(buffer, tick);
  return frame ? (frame.entities.find((entity) => entity.id === id) ?? null) : null;
}

/**
 * the arrival jitter: the mean absolute drift of consecutive inter-
 * arrival gaps (the RFC 3550 flavor, simplified). zero below two gaps.
 *
 * @param arrivals the arrival times in ms, ordered.
 * @returns the jitter in ms.
 */
export function jitterof(arrivals: number[]): number {
  const gaps: number[] = [];
  for (let i = 1; i < arrivals.length; i++) gaps.push(arrivals[i] - arrivals[i - 1]);
  let sum = 0;
  for (let i = 1; i < gaps.length; i++) sum += Math.abs(gaps[i] - gaps[i - 1]);
  return gaps.length < 2 ? 0 : sum / (gaps.length - 1);
}

/** builds an empty playout buffer. */
export function makejitterbuffer(capacity: number, delay: number): JitterBuffer {
  return { packets: [], capacity, delay };
}

/**
 * inserts a packet ordered by tick, drops duplicate ticks and caps the
 * buffer to the newest packets.
 *
 * @param buffer the playout buffer.
 * @param packet the arrival.
 * @returns the new buffer.
 */
export function pushpacket(buffer: JitterBuffer, packet: JitterPacket): JitterBuffer {
  const packets = [...buffer.packets.filter((kept) => kept.tick !== packet.tick), packet].sort(
    (a, b) => a.tick - b.tick,
  );
  return { ...buffer, packets: packets.slice(Math.max(0, packets.length - buffer.capacity)) };
}

/** the packets whose playout delay has elapsed by now, in tick order. */
export function duepackets(buffer: JitterBuffer, now: number): JitterPacket[] {
  return buffer.packets.filter((packet) => packet.arrivedat + buffer.delay <= now);
}
