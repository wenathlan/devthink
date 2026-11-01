/**
 * desktoplock.tsx — the lock face of the DESKTOP surface: the Windows 11
 * lock state riding ON the running desktop (the boot never blocks the
 * entry — the desktop opens, and Win+L / Ctrl+Alt+L or a restored session
 * posture lifts this face over it). The doctrine mica recipe paints the
 * backdrop (--win-mica, the fixed radial-gradient, light and dark on the
 * theme ladder) under a blur veil, and the EXISTING auth faces ride
 * unchanged: the big time/date + gesture family of the lock (LockFace of
 * Sol/wingets/AuthLockface.tsx — the left-aligned clock column, the swipe/
 * click/wheel/keys unlock) and the power corner (PowerMenu of
 * Sol/wingets/AuthPowermenu.tsx). The unlock hands back to the running
 * desktop through the caller (the posture of desktopstate.ts flips to
 * "unlocked" and the overlay drops). Reduced transparency calms the veil;
 * reduced motion drops the entrance animation.
 */
import { osText } from "../../oslabels.ts";
import { LockFace } from "./AuthLockface.tsx";
import { PowerMenu } from "./AuthPowermenu.tsx";

/** DesktopLock — the lock overlay of the desktop surface. Stateless: the
 * posture lives in desktopstate.ts (the workspace owns the state), this
 * face only renders it and answers the unlock gesture. */
export function DesktopLock({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="dt-desklock" role="dialog" aria-modal="true" aria-label={osText("desktop.lock.aria")}>
      <LockFace onUnlock={onUnlock} />
      <PowerMenu />
    </div>
  );
}
