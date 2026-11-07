/**
 * onboardingstate.ts — the door-shim of the copy law: the visitor seen-flags
 * accessor the vault owns (the ONE writer of the entry-flow contract —
 * intro → onboarding → the platform) answers here under the app's own module
 * path, re-exported whole from the published owner
 * ("@wenathlan/vault/onboardingstate"), while the app-specific extras stay
 * local. the mechanism — the host validation of the platform base (https
 * only, public hosts only), the seen-wins stage merge, the platform reads
 * over GET /api/v1/onboarding and writes over POST /api/v1/onboarding, the
 * localStorage mirror (the owner's "vault.onboarding.seen" key — the
 * consolidation retires the former app-local "cadria.onboarding.seen" cache
 * seat; the db stays the source of truth, a stale cache key only costs one
 * re-read) and the module memory — is never duplicated inside the app. the
 * entry gate the cadria navigation declares (entrytarget) stays app data.
 */

import type { VisitorOnboarding } from "@wenathlan/vault/onboardingstate";

export {
  hostallowed,
  markOnboardingStage,
  mergeStage,
  onboardingbase,
  readOnboardingState,
  resetOnboardingMemory,
} from "@wenathlan/vault/onboardingstate";
export type { OnboardingStage, VisitorOnboarding } from "@wenathlan/vault/onboardingstate";

/**
 * Answers the route the entry gate hands over to for the visitor flags —
 * the reform law of the navigation: the intro comes first, the onboarding
 * comes second, the home only mounts when both are seen. Pure: the gate
 * component and the tests share this decision, the flags are never read
 * anywhere else.
 *
 * @param flags the visitor onboarding flags.
 * @returns the route the visitor belongs at right now.
 */
export function entrytarget(flags: VisitorOnboarding): string {
  if (!flags.introseen) return "/intro";
  if (!flags.onboardingseen) return "/onboarding";
  return "/";
}
