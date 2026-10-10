/**
 * auth page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 *
 * AUTH HANDOVER — the entry pass is retired (defect map §5). Entering
 * DevThink never lands on a login screen: the intro hands the surface
 * straight to the OS desktop (/panel) and the panel resolves the local
 * identity silently through browserIdentity() on mount. The display name
 * that used to be asked here is edited in Settings → local account
 * (settings/identity.tsx) — a settings page, never an entry gate.
 *
 * The /auth route survives ONLY as a manual compat surface so no link of
 * the family sites, the docs or a stale bookmark ever 404s: this anchor
 * walks the visitor through the pure guards of authgate.ts in one silent
 * hop — afterAuthTarget resolves the destination (default /panel, a safe
 * same-origin ?next= honored, escape tricks fall back) and handoverPath
 * passes the optional pairing invitation fields (?gateway&pair&code)
 * through untouched so the panel consumes the invitation exactly as it
 * always did. No form, no framer-motion, no injected stylesheet, no card.
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { handoverPath } from "./authgate.ts";

export * from "./authgate.ts";

/** The auth compat handover served at /auth: resolves the guarded target
 * once on mount and replaces the route — the paint between the two is one
 * empty frame, never a login screen. */
export default function Auth() {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate(handoverPath(window.location.search), { replace: true });
  }, [navigate]);

  return null;
}
