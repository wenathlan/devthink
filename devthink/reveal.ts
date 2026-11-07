/**
 * reveal.ts — the scroll reveal owner of the family: the riseIn pass that
 * adds "in" at 12% visibility, the mutation watch that catches the
 * async-mounted elements, the wouter-location rescan the sol shells ride,
 * and the page-mount observe pass the getry and stealthhead sol pages call
 * once after mount — the single canonical implementation the family apps
 * import per the dedup law (the app reveal.ts files are thin doors onto
 * this seat).
 *
 * client-safe by construction: the only imports are react and wouter — no
 * node builtins, no storage, no network — so every static bundle of every
 * app can carry the door without dragging a server edge into the graph.
 */

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

/* ===== the page-mount observe pass (ported from the getry/stealthhead
 * reveal seats per the dedup law — the two copies were behavior-identical,
 * so the port rides verbatim; it keeps its own observer cache behind the
 * feature check so the initReveal machinery above stays untouched) ===== */

/** the single observer reused by every page mount. */
let pageObserver: IntersectionObserver | null = null;

/**
 * ensures the shared observer exists (the constructor stays behind a
 * feature check so ancient hosts simply skip the reveal pass).
 *
 * @returns the observer, or null when the host lacks the api.
 */
function ensureobserver(): IntersectionObserver | null {
  if (pageObserver) return pageObserver;
  if (typeof IntersectionObserver === "undefined") return null;
  pageObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          pageObserver?.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 },
  );
  return pageObserver;
}

/**
 * observes every `.reveal` element under the given root (defaults to the
 * whole document). call once after a page mounts.
 *
 * @param root the element to scan for reveal targets.
 */
export function observeReveals(root: ParentNode = document): void {
  const io = ensureobserver();
  const targets = root.querySelectorAll(".reveal");
  if (!io) {
    /* no observer support: show everything immediately, no animation. */
    targets.forEach((target) => {
      target.classList.add("in");
    });
    return;
  }
  targets.forEach((target) => {
    if (!target.classList.contains("in")) io.observe(target);
  });
}
