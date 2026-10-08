/**
 * intro.target.ts — the build-target resolver of the intro (root layer).
 *
 * The owner doctrine: ONE interface serves every build target (web, desktop
 * binary, ISO, APK, extension) — what changes per target is the TYPE OF
 * INTRO and the hand-over sequence between the apps. The build declares its
 * target through the VITE_DT_TARGET environment variable (vite exposes every
 * VITE_-prefixed process variable on import.meta.env) and the intro page
 * resolves it through this pure function, so the choice stays testable in
 * node without any browser or bundler around.
 */

/** The build targets the intro choreography knows. */
export type IntroTarget = "web" | "installer" | "android" | "extension";

/** The sessionStorage flag the intro page raises once its opening played this
 * session: re-navigations to "/" skip the replay, and the panel boot reads it
 * to never stack a second session-opening animation on top of the intro. */
export const INTRO_SEEN_KEY = "dt.intro.seen";

/** The literal targets the resolver accepts (compared normalized). */
const TARGETS: readonly IntroTarget[] = ["web", "installer", "android", "extension"];

/**
 * Resolves the intro target of a build.
 *
 * @param target the raw VITE_DT_TARGET value (undefined on a plain dev boot).
 * @returns the declared target; any unknown, empty or missing value answers
 * "web" — the SaaS intro is the safe default of the public site.
 */
export function resolveintrotarget(target?: string): IntroTarget {
  const normalized = target?.trim().toLowerCase();
  return TARGETS.includes(normalized as IntroTarget) ? (normalized as IntroTarget) : "web";
}
