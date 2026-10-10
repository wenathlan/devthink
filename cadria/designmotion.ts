// # designmotion — the ts mirror of the sol.css motion tokens
// the css side owns the truth (Sol/sol.css, tokens section); this module is
// its typed echo for the tsx side, so components never re-invent a duration,
// an easing or a spring. one design, two runtimes: the same numbers appear in
// both places, documented against each other. pure constants — no dom, no css
// injection, no side effects. the bezier sampling delegates to easecurves.ts
// (bezierprogress), so the solver stays single-sourced. no token duplication
// of colors/surfaces here: colors live only in css custom properties.

import { bezierprogress } from "./easecurves";

/** micro-interaction duration in ms (css --dur-1): hover, press, color, glyph */
export const DURATION_MICRO = 150;

/** windows/panels duration in ms (css --dur-2): window open, toast, dialog */
export const DURATION_WINDOW = 250;

/** spring-entrance duration in ms (css --dur-3) when not running real physics */
export const DURATION_SPRING = 300;

/** editorial entrance duration in ms (css --dur-enter): hero, page reveal */
export const DURATION_ENTER = 640;

/** the stagger step in ms between entrance siblings (css nth-child delays) */
export const STAGGER = 70;

/** micro easing (css --ease-out): the dominant out curve — never linear */
export const EASE_MICRO: readonly [number, number, number, number] = [0.22, 1, 0.36, 1];

/** windows/panels easing (css --ease-window): the fluent emphatic curve */
export const EASE_WINDOW: readonly [number, number, number, number] = [0.85, 0.14, 0.14, 0.85];

/** exit easing (css --ease-exit): the fluent accelerate-out */
export const EASE_EXIT: readonly [number, number, number, number] = [0.7, 0, 1, 0.5];

/** splash/back-out easing (css --ease-spring): the overshoot entrance */
export const EASE_SPRING: readonly [number, number, number, number] = [0.34, 1.56, 0.64, 1];

/** the intro slide-out curve (winintro data-leaving) */
export const EASE_LEAVE: readonly [number, number, number, number] = [0.76, 0, 0.24, 1];

/** spring physics for the motion library of the tsx wave (css has no spring) */
export const SPRING_STIFFNESS = 300;
export const SPRING_DAMPING = 25;
export const SPRING_MASS = 1;

/** scale floors — entrances never start from 0 */
export const SCALE_FLOOR = 0.96;
export const SCALE_MENU = 0.97;
export const SCALE_TOOLTIP = 0.98;

/** press micro-feedback: the shared :active scale for buttons and keys */
export const PRESS_SCALE = 0.97;

/** the caption-button hover of the window chrome (fluent red), rgb 0-255 */
export const CLOSE_RED: readonly [number, number, number] = [232, 17, 35];

/** the css cubic-bezier() string of a handle tuple, for inline styles */
export function easeCss(ease: readonly number[]): string {
  return `cubic-bezier(${ease.join(", ")})`;
}

/**
 * the progress (0–1) a handle tuple plays at time fraction t — the runtime
 * sampling of the css easings above; delegates to the easecurves solver.
 */
export function evaluateEase(ease: readonly number[], t: number): number {
  if (ease.length !== 4) return t;
  return bezierprogress(ease[0], ease[1], ease[2], ease[3], t);
}

/** the resolved entrance motion of a window/panel: duration + easing pair */
export const WINDOW_MOTION = { duration: DURATION_WINDOW, ease: EASE_WINDOW } as const;

/** the resolved micro motion of a control: duration + easing pair */
export const MICRO_MOTION = { duration: DURATION_MICRO, ease: EASE_MICRO } as const;

/** the resolved spring motion of an entrance: duration + easing pair */
export const SPRING_MOTION = { duration: DURATION_SPRING, ease: EASE_SPRING } as const;
