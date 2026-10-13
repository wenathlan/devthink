// # versawaseanimate — the animation sampler of the versawase engine: it turns
// the declarative Scene3d contract (versawase.ts) into per-node transform
// snapshots over time. Library-grade and pure: no consumer data, no DOM, no
// GL — the pages, stealthhead and external packages bring their own scene
// rows and ride the same sampler. Sampling composes on top of the engine
// primitives (trackValueAt for one track, sceneDuration for the wrap span)
// instead of duplicating their math.

import {
  type AnimationTrack,
  type Scene3d,
  type SceneNode,
  sceneDuration,
  trackValueAt,
} from "./versawase.ts";

/** The sampled local state of one node at a point in time. */
export interface NodeSnapshot {
  id: string;
  position: Axis3;
  rotation: Axis3;
  scale: Axis3;
  opacity: number;
  /** morph weight (0..1) when a morph track targets the node */
  morph: number;
}

/** Named-axis vector for transform snapshots (mesh math rides visualizemesh's tuple Vec3). */
export interface Axis3 {
  x: number;
  y: number;
  z: number;
}

const ZERO: Axis3 = { x: 0, y: 0, z: 0 };
const ONE: Axis3 = { x: 1, y: 1, z: 1 };

/** Collects the animation tracks that target one node id. */
export function tracksByTarget(scene: Scene3d, nodeId: string): readonly AnimationTrack[] {
  return scene.tracks.filter((track) => track.target === nodeId);
}

/** Wraps seconds into the authored span when the scene loops, so long plays ride the same keys. */
export function wrapSeconds(seconds: number, span: number): number {
  if (span <= 0) return Math.max(0, seconds);
  if (seconds <= span) return Math.max(0, seconds);
  return seconds % span;
}

/** Samples every channel of one node's tracks into a local snapshot (defaults included). */
export function sampleNode(scene: Scene3d, node: SceneNode, seconds: number): NodeSnapshot {
  const snapshot: NodeSnapshot = {
    id: node.id,
    position: { ...ZERO },
    rotation: { ...ZERO },
    scale: { ...ONE },
    opacity: 1,
    morph: 0,
  };
  for (const track of tracksByTarget(scene, node.id)) {
    const value = trackValueAt(track, seconds);
    switch (track.channel) {
      case "position":
        snapshot.position = axisValue(snapshot.position, track, value);
        break;
      case "rotation":
        snapshot.rotation = axisValue(snapshot.rotation, track, value);
        break;
      case "scale":
        snapshot.scale = axisValue(snapshot.scale, track, value);
        break;
      case "opacity":
        snapshot.opacity = value;
        break;
      case "morph":
        snapshot.morph = value;
        break;
    }
  }
  return snapshot;
}

/** Samples the whole scene at one instant: every node id maps to its local snapshot. */
export function sampleSceneAt(scene: Scene3d, seconds: number): Map<string, NodeSnapshot> {
  const time = wrapSeconds(seconds, sceneDuration(scene));
  const snapshots = new Map<string, NodeSnapshot>();
  for (const node of scene.nodes) {
    snapshots.set(node.id, sampleNode(scene, node, time));
  }
  return snapshots;
}

/**
 * Accumulates the world transform of one node over its parent chain:
 * positions add, scales multiply, rotations add (euler degrees, local order).
 * Cycles in the parent graph are cut at the first revisit.
 */
export function worldTransform(
  scene: Scene3d,
  nodeId: string,
  seconds: number,
): { position: Axis3; rotation: Axis3; scale: Axis3 } {
  const time = wrapSeconds(seconds, sceneDuration(scene));
  const byId = new Map(scene.nodes.map((node) => [node.id, node]));
  const chain: SceneNode[] = [];
  const seen = new Set<string>();
  let cursor: SceneNode | undefined = byId.get(nodeId);
  while (cursor && !seen.has(cursor.id)) {
    seen.add(cursor.id);
    chain.unshift(cursor);
    cursor = cursor.parent ? byId.get(cursor.parent) : undefined;
  }
  const world = { position: { ...ZERO }, rotation: { ...ZERO }, scale: { ...ONE } };
  for (const node of chain) {
    const local = sampleNode(scene, node, time);
    world.position = addVec(world.position, local.position);
    world.rotation = addVec(world.rotation, local.rotation);
    world.scale = mulVec(world.scale, local.scale);
  }
  return world;
}

/** Folds one track value into one axis slot of a vector (x/y/z encoded in the track id suffix). */
function axisValue(base: Axis3, track: AnimationTrack, value: number): Axis3 {
  const axis = axisOf(track.id);
  return { ...base, [axis]: value } as Axis3;
}

/** Reads the axis a track drives from its id suffix (-x, -y, -z); unknown ids ride x. */
function axisOf(trackId: string): keyof Axis3 {
  const suffix = trackId.slice(-2).toLowerCase();
  if (suffix === "-y") return "y";
  if (suffix === "-z") return "z";
  return "x";
}

function addVec(a: Axis3, b: Axis3): Axis3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function mulVec(a: Axis3, b: Axis3): Axis3 {
  return { x: a.x * b.x, y: a.y * b.y, z: a.z * b.z };
}
