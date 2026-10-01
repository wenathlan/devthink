// the argan unit of the family.
// # reveal — riseIn on scroll: an IntersectionObserver adds "in" at 12% visibility
import { useEffect } from "react";
import { useLocation } from "wouter";

let observer: IntersectionObserver | null = null;
let watching = false;

function revealObserver(): IntersectionObserver {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in");
          observer?.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );
  }
  return observer;
}

function scanReveals(rootNode: ParentNode = document): void {
  rootNode.querySelectorAll(".reveal:not(.in)").forEach((element) => {
    revealObserver().observe(element);
  });
}

/** Watches the DOM so reveal elements mounted by async data land in the observer too. */
function watchMutations(): void {
  if (watching || typeof MutationObserver === "undefined") return;
  watching = true;
  new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.classList.contains("reveal")) revealObserver().observe(node);
        scanReveals(node);
      });
    }
  }).observe(document.body, { childList: true, subtree: true });
}

/** Starts the reveal runtime once at the app anchor. */
export function initReveal(): void {
  scanReveals();
  watchMutations();
}

/** Re-scans after every route change: the effect runs once the page sub-anchor has rendered. */
export function useReveal(): void {
  const [location] = useLocation();
  // biome-ignore lint/correctness/useExhaustiveDependencies: the location change is the rescan trigger
  useEffect(() => {
    scanReveals();
  }, [location]);
}
