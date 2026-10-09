/**
 * reveal.ts — reveal on scroll (port of the engine.js pass):
 * IntersectionObserver adds .in to the .reveal elements as they enter
 * the viewport (threshold 0.12). Reduced motion (os setting or system
 * preference) reveals everything immediately.
 */
import { useEffect } from "react";

function motionReduced(): boolean {
  if (typeof window === "undefined") return true;
  if (document.documentElement.dataset.motion === "reduced") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * observes every not-yet-revealed .reveal element in the document.
 *
 * @returns a cleanup fn that disconnects the observer.
 */
export function observeReveals(): () => void {
  if (typeof document === "undefined") return () => {};
  const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.in)"));
  if (els.length === 0) return () => {};

  if (motionReduced() || typeof IntersectionObserver === "undefined") {
    els.forEach((el) => {
      el.classList.add("in");
    });
    return () => {};
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  els.forEach((el) => {
    io.observe(el);
  });
  return () => io.disconnect();
}

/**
 * hook: runs on every view/page change (the caller owns the deps).
 *
 * @param deps the change signals the caller passes in.
 */
export function useReveal(deps: unknown[]): void {
  // biome-ignore lint/correctness/useExhaustiveDependencies: the caller owns the dependency list — this hook intentionally forwards a dynamic deps array so every view/page change re-runs the reveal observer.
  useEffect(() => observeReveals(), deps);
}
