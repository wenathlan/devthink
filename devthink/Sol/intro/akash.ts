/**
 * akash.ts — the motion kit of the piso Akash, the intro floor every build
 * target shares. The floor is one deterministic pass: the mark lands on ONE
 * real spring (stiffness 300, damping 15 — solved into Web Animations API
 * keyframes, no library, no stylesheet dependency), the wordmark rises on
 * backOut, and the stage leaves on the 0.8s slide-up. The sheet curve carries
 * every tile expansion (the web zoom, the android open). No loading dots
 * anywhere: the floor never loops, never shimmers, never scatters fades.
 */

/** the sheet curve of every tile expansion (the drawer curve) */
export const AKASH_SHEET = "cubic-bezier(0.32, 0.72, 0, 1)";

/** the backOut curve of the rising wordmark (one mild overshoot, never a bounce) */
export const AKASH_BACKOUT = "cubic-bezier(0.34, 1.56, 0.64, 1)";

/** the 0.8s slide-up exit curve of the floor */
export const AKASH_EXIT = "cubic-bezier(0.76, 0, 0.24, 1)";

/** the micro curve of quiet state changes (the doctrine micro) */
export const AKASH_MICRO = "cubic-bezier(0.22, 1, 0.36, 1)";

/** the spring of the mark landing: stiffness 300, damping 15, unit mass */
export const AKASH_SPRING = { stiffness: 300, damping: 15 } as const;

/** the enter pose of the mark: never zero — the floor keeps its scale */
export const AKASH_MARK_FLOOR = 0.9;

/**
 * Answers true when the visitor asked the system to reduce motion. The
 * opening answers by handing the surface over instantly.
 *
 * @returns true when the choreography must be skipped.
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Solves the underdamped spring (unit mass) into WAAPI keyframes of one
 * transform property. The track follows the closed-form step response
 * `to - (to - from) * e^(-ζωt) * (cos(ωd t) + (ζω/ωd) sin(ωd t))` with
 * ω = √k and ζ = c / 2√k — for stiffness 300 and damping 15 that is a real
 * underdamped landing (ζ ≈ 0.43), not a bezier approximation. The frames ride
 * the linear easing because the physics IS the easing.
 *
 * @param from the rest scale the mark springs from (the floor, never zero).
 * @param to the rest scale the mark settles on (1).
 * @param durationMs the sampled window — long enough for the decay to settle.
 * @param stepMs the sampling step of the keyframe track.
 * @returns the linear-easing keyframe track of the spring.
 */
export function akashSpringTrack(from: number, to: number, durationMs = 900, stepMs = 33): Keyframe[] {
  const { stiffness: k, damping: c } = AKASH_SPRING;
  const omega = Math.sqrt(k);
  const zeta = c / (2 * Math.sqrt(k));
  const damped = omega * Math.sqrt(1 - zeta * zeta);
  const steps = Math.max(2, Math.round(durationMs / stepMs));
  const track: Keyframe[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * (durationMs / 1000);
    const decay = Math.exp(-zeta * omega * t);
    const swing = Math.cos(damped * t) + ((zeta * omega) / damped) * Math.sin(damped * t);
    const value = to - (to - from) * decay * swing;
    track.push({ transform: `scale(${value.toFixed(4)})`, offset: i / steps });
  }
  return track;
}

/**
 * One guarded beat of the floor: a single transform/opacity animation with a
 * backwards fill, so a beat that has not started yet holds its from pose.
 *
 * @param el the element the beat animates (null is tolerated).
 * @param frames the keyframes of the beat.
 * @param options the timing of the beat (the delay carries the stagger).
 * @returns the animation, or null when the element is absent.
 */
export function akashBeat(el: Element | null, frames: Keyframe[], options: KeyframeAnimationOptions): Animation | null {
  if (!el) return null;
  return el.animate(frames, { fill: "backwards", ...options });
}
