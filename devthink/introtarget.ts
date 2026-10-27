/**
 * introtarget.ts — the build-target resolver of the intro (root layer).
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
export type IntroTarget = "web" | "desktop" | "installer" | "android" | "extension";

/** The sessionStorage flag the intro page raises once its opening played this
 * session: re-navigations to "/" skip the replay, and the panel boot reads it
 * to never stack a second session-opening animation on top of the intro. */
export const INTRO_SEEN_KEY = "dt.intro.seen";

/** The literal targets the resolver accepts (compared normalized). */
const TARGETS: readonly IntroTarget[] = ["web", "desktop", "installer", "android", "extension"];

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

/**
 * The panel gate verdict: the entry chain the owner pinned — intro →
 * onboarding → auth → panel, the panel LAST. The web target (the public
 * saas face) only opens the desktop with a live answer of one of the two
 * honest doors: a family session (the real path — the server account the
 * restore rotates) or the declared offline unlock of this browser session
 * (the local accountgate fallback). The owned targets (desktop, installer,
 * android, extension) open straight — the boot IS their intro and no gate
 * ever blocks the system face.
 *
 * @param target the resolved build target.
 * @param session the family session state (null when absent).
 * @param localunlocked the offline unlock marker of this browser session.
 * @returns "open" when the desktop answers, "locked" when the chain walks
 * back to the auth face.
 */
export function panelgateverdict(target: IntroTarget, session: unknown, localunlocked: boolean): "open" | "locked" {
  if (target !== "web") return "open";
  return session !== null && session !== undefined ? "open" : localunlocked ? "open" : "locked";
}
