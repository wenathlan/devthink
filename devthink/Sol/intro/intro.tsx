/**
 * intro page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. The intro runs at "/" on the first paint of every cold load and
 * hands the surface to the next page of the flow.
 */

/** Style: DevThink ONE intro — the owner doctrine: ONE interface serves every
 * build target; what changes per target is the TYPE OF INTRO and the
 * hand-over sequence. The build declares its target through
 * VITE_DT_TARGET (resolved by the root module introtarget.ts): every target
 * plays its one variant and goes DIRETO to the OS desktop at /panel — the
 * panel resolves the local identity silently, no login screen ever stands
 * in the chain (the retired /auth surface is a compat handover only). Each
 * variant keeps the motion budget of the spec (≤800ms end to end, one
 * orchestrated pass, one click or key to skip). The bell is opt-in only
 * (localStorage dt.intro.sound === "on"; default mute, autoplay-safe) and
 * the sessionStorage flag dt.intro.seen avoids a replay on client-side
 * re-navigation — a cold load always plays. */
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { INTRO_SEEN_KEY, type IntroTarget, resolveintrotarget } from "../../introtarget";
import { AndroidIntro } from "./androidintro.tsx";
import { playIntroChime } from "./chime.ts";
import { InstallerIntro } from "./installerintro.tsx";
import { WebIntro } from "./webintro.tsx";

export * from "./androidintro.tsx";
export * from "./chime.ts";
export * from "./installerintro.tsx";
export * from "./webintro.tsx";

/**
 * Reads the seen flag of this browser session.
 *
 * @returns true when the intro already played this session.
 */
export function introSeen(): boolean {
  try {
    return window.sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Raises the seen flag so a client-side re-navigation of "/" never replays
 * the opening (a cold load starts with a fresh sessionStorage and always
 * plays). Storage failures keep the intro playing on every visit.
 */
export function markIntroSeen(): void {
  try {
    window.sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    /* storage unavailable: the intro simply plays on every visit */
  }
}

/**
 * The route the intro hands over to, per build target: every target lands
 * on the OS desktop (the creation panel) — the owner doctrine is an OS
 * entry, never a landing page and never the login screen (the pairing
 * panel stays reachable from settings).
 *
 * @param target the resolved build target.
 * @returns the route of the next page in the entry flow.
 */
export function introHandover(target: IntroTarget): string {
  void target;
  return "/panel";
}

/** The intro page: resolves the target, guards the replay flag and mounts
 * the one variant the build target declared. */
export default function Intro() {
  const target = resolveintrotarget(import.meta.env.VITE_DT_TARGET as string | undefined);
  const [, navigate] = useLocation();
  const [replay] = useState(() => introSeen());

  useEffect(() => {
    if (replay) {
      navigate(introHandover(target));
      return;
    }
    markIntroSeen();
  }, [replay, navigate, target]);

  const done = useCallback(() => {
    playIntroChime();
    navigate(introHandover(target));
  }, [navigate, target]);

  if (replay) return null;
  if (target === "web") return <WebIntro onDone={done} />;
  if (target === "android") return <AndroidIntro onDone={done} />;
  return <InstallerIntro onDone={done} />;
}
