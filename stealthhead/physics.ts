/**
 * physics.ts — the deterministic physics kernel of stealthhead (root layer).
 *
 * fixed-step integration, aabb and sphere collision queries, one simple
 * swept-box test, friction and restitution, and gravity/drag projectiles.
 * the design is absorbed from the official catalog through the LOGICS-6
 * wave plan (the exact-tick discipline of filmcraft time and the pure
 * simulation pattern of effectcraft sim2, rebuilt as native typescript).
 * every call is a pure function over plain structs with no hidden state,
 * so identical inputs always replay identical outputs — the property the
 * netcode reconciliation (netcode.ts) and the record/playback tooling
 * rely on.
 * non-goals: no rendering, no networking i/o, no audio, no dom, no
 * storage, no constraint solver, no continuous collision beyond the one
 * swept slab test per step.
 */

/** the minimal 3d vector the kernel moves everything with. */
export type Vec3 = { x: number; y: number; z: number };

/** one axis-aligned box given by its corner extents. */
export type Aabb = { min: Vec3; max: Vec3 };

/** one spherical volume. */
export type Sphere = { center: Vec3; radius: number };

/** one dynamic body the integrator moves and the bounds bounce. */
export type Body = {
  /** stable identity the match logic keys on. */
  id: string;
  position: Vec3;
  velocity: Vec3;
  /** inverse mass: 0 pins the body to the world. */
  invmass: number;
  /** velocity kept on impact, 0..1. */
  restitution: number;
  /** horizontal damping per second while grounded. */
  friction: number;
};

/** one ballistic projectile with gravity and linear drag. */
export type Projectile = { id: string; position: Vec3; velocity: Vec3; gravity: number; drag: number };

/** the fixed arena: bounds, gravity, dynamic bodies and projectiles. */
export type PhysWorld = { min: Vec3; max: Vec3; gravity: Vec3; bodies: Body[]; projectiles: Projectile[] };

/** the outcome of one projectile step: motion, or a world or body hit. */
export type ProjectileStep = {
  projectile: Projectile;
  hit: null | { kind: "world" | "body"; id: string | null; at: Vec3 };
};

/** the fixed-step accumulator state the match loop carries across frames. */
export type Accumulator = { steps: number; remainder: number };

/** the arena gravity, in units per squared second (about 2g — arcade feel). */
export const DEFAULTGRAVITY: Vec3 = { x: 0, y: -19.6, z: 0 };

/** builds a vector (the only constructor the kernel needs). */
export function vec3(x: number, y: number, z: number): Vec3 {
  return { x, y, z };
}

/** componentwise sum. */
export function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

/** uniform scale. */
export function scale(a: Vec3, s: number): Vec3 {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}

/** the dot product. */
export function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/** the euclidean length. */
export function length(a: Vec3): number {
  return Math.sqrt(dot(a, a));
}

/** the unit vector (zero stays zero — no NaN leaves the kernel). */
export function normalize(a: Vec3): Vec3 {
  const l = length(a);
  return l === 0 ? { x: 0, y: 0, z: 0 } : scale(a, 1 / l);
}

/** the euclidean distance between two points. */
export function distance(a: Vec3, b: Vec3): number {
  return length({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
}

/** builds a box from two corners, ordered per axis. */
export function aabb(a: Vec3, b: Vec3): Aabb {
  return {
    min: { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), z: Math.min(a.z, b.z) },
    max: { x: Math.max(a.x, b.x), y: Math.max(a.y, b.y), z: Math.max(a.z, b.z) },
  };
}

/** the box midpoint (aim hints, spawns, projectiles). */
export function aabbcenter(box: Aabb): Vec3 {
  return scale(add(box.min, box.max), 0.5);
}

/** the closest point of a box to a point (sphere contact, sweep support). */
export function closestpoint(box: Aabb, point: Vec3): Vec3 {
  return {
    x: Math.min(Math.max(point.x, box.min.x), box.max.x),
    y: Math.min(Math.max(point.y, box.min.y), box.max.y),
    z: Math.min(Math.max(point.z, box.min.z), box.max.z),
  };
}

/** sphere versus box: true when the sphere surface reaches the box. */
export function sphereboxhit(sphere: Sphere, box: Aabb): boolean {
  const near = closestpoint(box, sphere.center);
  const dx = sphere.center.x - near.x;
  const dy = sphere.center.y - near.y;
  const dz = sphere.center.z - near.z;
  return dx * dx + dy * dy + dz * dz <= sphere.radius * sphere.radius;
}

/** sphere versus sphere. */
export function spherespherehit(a: Sphere, b: Sphere): boolean {
  return distance(a.center, b.center) <= a.radius + b.radius;
}

/** box versus box (the broadphase query of the arena). */
export function boxboxhit(a: Aabb, b: Aabb): boolean {
  return (
    a.min.x <= b.max.x &&
    a.max.x >= b.min.x &&
    a.min.y <= b.max.y &&
    a.max.y >= b.min.y &&
    a.min.z <= b.max.z &&
    a.max.z >= b.min.z
  );
}

/**
 * the simple sweep: when does the moving box first touch the wall box.
 * classic slab method over the move delta; returns the entry fraction of
 * the move in [0, 1] or null when the boxes never meet this step.
 *
 * @param mover the box swept forward.
 * @param delta the move this step.
 * @param wall the static box tested against.
 * @returns the entry fraction, or null.
 */
export function sweepbox(mover: Aabb, delta: Vec3, wall: Aabb): number | null {
  let entry = 0;
  let exit = 1;
  const axes: Array<[number, number, number, number]> = [
    [mover.min.x, mover.max.x, wall.min.x, wall.max.x],
    [mover.min.y, mover.max.y, wall.min.y, wall.max.y],
    [mover.min.z, mover.max.z, wall.min.z, wall.max.z],
  ];
  const deltas = [delta.x, delta.y, delta.z];
  for (let i = 0; i < 3; i++) {
    const [lo, hi, wlo, whi] = axes[i];
    const d = deltas[i];
    if (d === 0) {
      if (hi < wlo || lo > whi) return null;
      continue;
    }
    const t0 = (wlo - hi) / d;
    const t1 = (whi - lo) / d;
    entry = Math.max(entry, Math.min(t0, t1));
    exit = Math.min(exit, Math.max(t0, t1));
    if (entry > exit) return null;
  }
  return entry <= 1 ? entry : null;
}

/**
 * advances one body by the fixed step: gravity, grounded friction,
 * integration and a restitution bounce on the arena bounds.
 * pure — returns the moved body, the input is untouched.
 *
 * @param body the body to advance.
 * @param dt the fixed step in seconds.
 * @param gravity the arena gravity.
 * @param bounds the arena extents.
 * @returns the advanced body.
 */
export function stepbody(body: Body, dt: number, gravity: Vec3, bounds: Aabb): Body {
  if (body.invmass === 0) return body;
  let velocity = body.velocity;
  velocity = add(velocity, scale(gravity, dt));
  const damp = Math.max(0, 1 - body.friction * dt);
  velocity = { x: velocity.x * damp, y: velocity.y, z: velocity.z * damp };
  let position = add(body.position, scale(velocity, dt));
  const axes: Array<"x" | "y" | "z"> = ["x", "y", "z"];
  for (const axis of axes) {
    if (position[axis] < bounds.min[axis]) {
      position = { ...position, [axis]: bounds.min[axis] };
      velocity = { ...velocity, [axis]: Math.abs(velocity[axis]) * body.restitution };
    } else if (position[axis] > bounds.max[axis]) {
      position = { ...position, [axis]: bounds.max[axis] };
      velocity = { ...velocity, [axis]: -Math.abs(velocity[axis]) * body.restitution };
    }
  }
  return { ...body, position, velocity };
}

/**
 * linear air drag: velocity decays toward zero by the drag coefficient.
 * shared by projectiles and any body the match flags as airborne.
 *
 * @param velocity the incoming velocity.
 * @param drag the per-second decay coefficient.
 * @param dt the fixed step.
 * @returns the damped velocity.
 */
export function applydrag(velocity: Vec3, drag: number, dt: number): Vec3 {
  return scale(velocity, Math.max(0, 1 - drag * dt));
}

/**
 * advances one projectile: gravity, drag, integration, then the arena
 * bounds and every body box swept from the old position. the first hit
 * wins and the projectile stops there (the caller decides the damage).
 *
 * @param projectile the projectile to advance.
 * @param dt the fixed step.
 * @param world the arena with its bodies.
 * @returns the moved projectile plus the hit, when one happened.
 */
export function stepprojectile(projectile: Projectile, dt: number, world: PhysWorld): ProjectileStep {
  const gravity = vec3(0, projectile.gravity, 0);
  let velocity = add(projectile.velocity, scale(gravity, dt));
  velocity = applydrag(velocity, projectile.drag, dt);
  const position = add(projectile.position, scale(velocity, dt));
  const moved: Projectile = { ...projectile, position, velocity };
  const outside =
    position.x < world.min.x ||
    position.x > world.max.x ||
    position.y < world.min.y ||
    position.y > world.max.y ||
    position.z < world.min.z ||
    position.z > world.max.z;
  if (outside) {
    const at = vec3(
      Math.min(Math.max(position.x, world.min.x), world.max.x),
      Math.min(Math.max(position.y, world.min.y), world.max.y),
      Math.min(Math.max(position.z, world.min.z), world.max.z),
    );
    return { projectile: moved, hit: { kind: "world", id: null, at } };
  }
  for (const body of world.bodies) {
    const t = sweepbox(
      aabb(projectile.position, projectile.position),
      {
        x: position.x - projectile.position.x,
        y: position.y - projectile.position.y,
        z: position.z - projectile.position.z,
      },
      aabb(body.position, body.position),
    );
    if (t !== null) {
      const at = add(projectile.position, scale(velocity, t * dt));
      return { projectile: { ...moved, position: at }, hit: { kind: "body", id: body.id, at } };
    }
  }
  return { projectile: moved, hit: null };
}

/**
 * the fixed-step accumulator: converts a variable frame delta into the
 * whole number of fixed steps to run plus the carried remainder, capped
 * so a stall never spirals into a hundred catch-up steps.
 *
 * @param remainder the carried fraction from the previous frame.
 * @param dt the observed frame delta in seconds.
 * @param fixed the fixed step in seconds.
 * @param maxsteps the catch-up ceiling (default 5).
 * @returns the steps to run and the new remainder.
 */
export function fixedsteps(remainder: number, dt: number, fixed: number, maxsteps = 5): Accumulator {
  const total = remainder + Math.max(0, dt);
  const steps = Math.min(maxsteps, Math.floor(total / fixed));
  return { steps, remainder: total - steps * fixed };
}

/**
 * the empty arena the match bootstraps from.
 *
 * @param min the arena lower corner.
 * @param max the arena upper corner.
 * @param gravity the arena gravity (defaults to the arena constant).
 * @returns an empty world.
 */
export function createworld(min: Vec3, max: Vec3, gravity: Vec3 = DEFAULTGRAVITY): PhysWorld {
  return { min, max, gravity, bodies: [], projectiles: [] };
}
