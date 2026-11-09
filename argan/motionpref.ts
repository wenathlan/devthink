// the argan unit of the family.
// # motionpref — the argan door to the owner logic in debonair/motionpref.ts per the dedup law.
// The interface never touches the visitor machine: the choice rides the
// session scope (tab memory, the same contract as the theme) and the
// document carries it as data-motion="reduced" — the one attribute the
// stylesheet guards answer to (the session hard stop of sol/sol.css). The
// media query stays the boss: the switch only ever adds the document flag
// on top of `prefers-reduced-motion`, never against it. The behavior lives
// in the owner once; this door only builds the argan instance through the
// factory, so the tab memory stays isolated per app while the document
// contract stays the family's. The surface keeps its former shape (no
// toggle: the settings page drives set directly).
import { createMotionPref } from "@wenathlan/debonair/motionpref";

export type { MotionRoot, MotionStorage } from "@wenathlan/debonair/motionpref";

/** The session key the preference rides (tab memory, nothing persists). */
export const MOTION_PREF_KEY = "argan.motion.reduced";

// the argan instance of the family seam — the one per-app choice (the key).
const motionPref = createMotionPref(MOTION_PREF_KEY);

export const memoryMotionStorage = motionPref.memoryMotionStorage;
export const sessionStorageOrMemoryMotion = motionPref.sessionStorageOrMemoryMotion;
export const reduceMotionApplied = motionPref.reduceMotionApplied;
export const reduceMotionStored = motionPref.reduceMotionStored;
export const setReduceMotion = motionPref.setReduceMotion;
