// # mixer.graph — the mixing graph model of debonair (root layer): channels,
// sends, mute/solo and the master bus, resolved as a pure tree. Given a graph
// state, the model answers the effective gain of every channel and of every
// routing path to the master — zero synthesis, zero render, zero audio
// context: the katexis engine stays deferred and this file only owns the
// STATE. The rules the model bakes in are the classic desk ones: solo wins
// over mute, gains chain additively in dB and a send must never close a
// cycle. Pure and multi-mode — the same call runs in the browser (the studio
// mixer reads the effective gains) and in node (the unit tests).

import type { MixerStripRow } from "./katexis.ts";

/** The machine readable failure codes of the mixing graph model. */
export type MixerGraphErrorCode = "missing-master" | "duplicate-channel" | "unknown-channel" | "unknown-send" | "bad-gain" | "cycle";

/** The typed mixing graph failure, traceable to the channel and the code. */
export class MixerGraphError extends Error {
  /** Machine readable failure code. */
  readonly code: MixerGraphErrorCode;
  /** The channel the failure belongs to (when known). */
  readonly channelid: string | null;

  constructor(code: MixerGraphErrorCode, channelid: string | null, message?: string) {
    super(message ?? `mixer graph ${code}${channelid === null ? "" : ` for ${channelid}`}`);
    this.name = "MixerGraphError";
    this.code = code;
    this.channelid = channelid;
  }
}

/** One send of a channel: a routed copy of the signal with its own gain. */
export interface MixerSend {
  /** The id of the channel (usually the master) the signal rides to. */
  targetid: string;
  /** The send gain in dB (negative values bleed quieter into the bus). */
  gaindb: number;
}

/** One channel strip of the mixing graph. */
export interface MixerChannel {
  /** The strip id (the seed rows answer by name). */
  id: string;
  /** The strip display name. */
  name: string;
  /** The fader gain in dB. */
  gaindb: number;
  /** Whether the strip is muted (solo overrides it). */
  mute: boolean;
  /** Whether the strip is soloed (a solo mutes every unsoloed strip). */
  solo: boolean;
  /** The sends the strip routes copies of its signal through. */
  sends: readonly MixerSend[];
}

/** The whole mixing graph: the strips plus the master bus they ride to. */
export interface MixerGraph {
  /** Every strip of the desk, master included. */
  channels: readonly MixerChannel[];
  /** The id of the master channel. */
  masterid: string;
}

/** One resolved routing path from a channel to the master. */
export interface ResolvedPath {
  /** The channel the signal leaves. */
  channelid: string;
  /** The hops the signal takes, channel ids in order, master last. */
  hops: readonly string[];
  /** The chained gain of the path in dB (sends and faders summed). */
  gaindb: number;
  /** The chained gain of the path as a linear amplitude. */
  linear: number;
}

/** Converts a dB gain to a linear amplitude (negative infinity stays silent). */
export function dbToLinear(db: number): number {
  return db === Number.NEGATIVE_INFINITY ? 0 : 10 ** (db / 20);
}

/** Converts a linear amplitude to a dB gain (zero goes to negative infinity). */
export function linearToDb(linear: number): number {
  if (linear <= 0) return Number.NEGATIVE_INFINITY;
  return 20 * Math.log10(linear);
}

/**
 * Builds a mixing graph from the site mixer strips (the seed rows the studio
 * page already serves): every row becomes a channel and the master row
 * becomes the master bus. The sends stay empty — the desk routes each strip
 * straight to the master until a caller wires more.
 *
 * @param strips the mixer strip rows (seed or DB served).
 * @returns the mixing graph.
 */
export function graphFromStrips(strips: readonly MixerStripRow[]): MixerGraph {
  if (!Array.isArray(strips) || strips.length === 0) {
    throw new MixerGraphError("missing-master", null, "mixer graph needs at least one strip with a master row");
  }
  const masterrow = strips.find((strip) => strip.master);
  if (!masterrow) throw new MixerGraphError("missing-master", null, "mixer graph needs one strip flagged as master");
  const channels = strips.map((strip) => ({
    id: strip.name,
    name: strip.name,
    gaindb: strip.faderDb,
    mute: false,
    solo: false,
    sends: [],
  }));
  const graph: MixerGraph = { channels, masterid: masterrow.name };
  assertGraph(graph);
  return graph;
}

/**
 * Returns a copy of the graph with one channel patched (fader, mute, solo or
 * sends) — the input graph is never mutated.
 *
 * @param graph the graph to patch.
 * @param channelid the channel to patch.
 * @param patch the fields to override.
 * @returns the patched graph.
 */
export function patchChannel(graph: MixerGraph, channelid: string, patch: Partial<Pick<MixerChannel, "gaindb" | "mute" | "solo" | "sends">>): MixerGraph {
  findchannel(graph, channelid);
  return { ...graph, channels: graph.channels.map((channel) => (channel.id === channelid ? { ...channel, ...patch } : channel)) };
}

/**
 * Validates the graph shape: one master, unique ids, finite gains and sends
 * that land on known channels. Throws on the first problem — the cycle check
 * included.
 *
 * @param graph the graph to validate.
 */
export function assertGraph(graph: MixerGraph): void {
  findchannel(graph, graph.masterid);
  const seen = new Set<string>();
  for (const channel of graph.channels) {
    if (seen.has(channel.id)) throw new MixerGraphError("duplicate-channel", channel.id, `mixer graph carries duplicate channel ${channel.id}`);
    seen.add(channel.id);
    if (!Number.isFinite(channel.gaindb)) throw new MixerGraphError("bad-gain", channel.id, `mixer graph gain must be finite, got ${channel.gaindb}`);
    for (const send of channel.sends) {
      if (!Number.isFinite(send.gaindb)) throw new MixerGraphError("bad-gain", channel.id, `mixer graph send gain must be finite, got ${send.gaindb}`);
      if (!seen.has(send.targetid) && !graph.channels.some((row) => row.id === send.targetid)) {
        throw new MixerGraphError("unknown-send", channel.id, `mixer graph send targets unknown channel ${send.targetid}`);
      }
    }
  }
  assertAcyclic(graph);
}

/**
 * Walks the sends of the graph and rejects a cycle (a send loop would feed a
 * channel from itself).
 *
 * @param graph the graph to walk.
 */
export function assertAcyclic(graph: MixerGraph): void {
  const state = new Map<string, "visiting" | "done">();
  const visit = (channelid: string, trail: readonly string[]): void => {
    const mark = state.get(channelid);
    if (mark === "visiting") {
      throw new MixerGraphError("cycle", channelid, `mixer graph send cycle: ${[...trail, channelid].join(" -> ")}`);
    }
    if (mark === "done") return;
    state.set(channelid, "visiting");
    const channel = findchannel(graph, channelid);
    for (const send of channel.sends) visit(send.targetid, [...trail, channelid]);
    state.set(channelid, "done");
  };
  for (const channel of graph.channels) visit(channel.id, []);
}

/**
 * Resolves the effective gain of one channel: the fader plus the master gain,
 * silenced to negative infinity when the desk mutes it. Solo wins over mute:
 * a soloed strip stays audible even muted, and while any strip is soloed the
 * unsoloed ones fall silent.
 *
 * @param graph the graph state.
 * @param channelid the channel to resolve.
 * @returns the effective gain in dB (negative infinity when silent).
 */
export function effectiveGainDb(graph: MixerGraph, channelid: string): number {
  const channel = findchannel(graph, channelid);
  const master = findchannel(graph, graph.masterid);
  const anysolo = graph.channels.some((row) => row.solo);
  const audible = anysolo ? channel.solo : !channel.mute;
  if (!audible) return Number.NEGATIVE_INFINITY;
  if (channel.id === graph.masterid) return channel.gaindb;
  return channel.gaindb + master.gaindb;
}

/**
 * Resolves the effective gain of every channel in one pass.
 *
 * @param graph the graph state.
 * @returns the channel id to effective dB map (master included).
 */
export function effectiveGains(graph: MixerGraph): Record<string, number> {
  const map: Record<string, number> = {};
  for (const channel of graph.channels) map[channel.id] = effectiveGainDb(graph, channel.id);
  return map;
}

/**
 * Resolves every routing path a signal takes from a channel to the master:
 * the direct fader path when the strip sends nowhere, one path per send chain
 * otherwise. The gains chain additively in dB and convert to a linear
 * amplitude per path — the tree the studio meters read.
 *
 * @param graph the graph state (must be acyclic — assertGraph first).
 * @param channelid the channel to trace.
 * @returns the paths, direct first.
 */
export function resolvePaths(graph: MixerGraph, channelid: string): ResolvedPath[] {
  const channel = findchannel(graph, channelid);
  if (channelid === graph.masterid) {
    return [{ channelid, hops: [channel.id], gaindb: channel.gaindb, linear: dbToLinear(channel.gaindb) }];
  }
  const master = findchannel(graph, graph.masterid);
  const paths: ResolvedPath[] = [];
  const walk = (currentid: string, hops: readonly string[], gaindb: number): void => {
    const current = findchannel(graph, currentid);
    if (current.id === graph.masterid) {
      // the master fader is the last gain of every path that lands on it
      paths.push({ channelid, hops: [...hops, current.id], gaindb: gaindb + current.gaindb, linear: dbToLinear(gaindb + current.gaindb) });
      return;
    }
    for (const send of current.sends) {
      walk(send.targetid, [...hops, current.id], gaindb + send.gaindb);
    }
  };
  // the direct desk path: every strip rides the master implicitly
  paths.push({ channelid, hops: [channel.id, master.id], gaindb: channel.gaindb + master.gaindb, linear: dbToLinear(channel.gaindb + master.gaindb) });
  for (const send of channel.sends) {
    walk(send.targetid, [channel.id], channel.gaindb + send.gaindb);
  }
  return paths;
}

/** finds one channel or throws the unknown-channel failure. */
function findchannel(graph: MixerGraph, channelid: string): MixerChannel {
  const channel = graph.channels.find((row) => row.id === channelid);
  if (!channel) throw new MixerGraphError("unknown-channel", channelid, `mixer graph carries no channel ${channelid}`);
  return channel;
}
