/**
 * lockface.tsx — the lock face of the auth sequence, the first face the
 * os answers with. The Windows 11 lock law rides first: the wallpaper
 * paints the place and NOTHING else rides the face — the clock on the
 * LEFT side (the owner's law: the clock stays on the left side), a big
 * time over the date in one left-aligned, vertically centered column,
 * and the unlock hint breathing at the bottom center where the system
 * keeps it. The whole face is the gesture surface of the windows family:
 * a pointer swipe up, a wheel up, a click or the enter/space/arrow keys
 * lift the lock. Loose component of the auth page, riding the dtw-login
 * kit of sol.css.
 */
import { ChevronUpRegular } from "@fluentui/react-icons";
import { useEffect, useRef, useState } from "react";
import { copy } from "../../copy.ts";

export interface LockFaceProps {
  /** the unlock: the stage machine of the anchor lifts the lock into the
   * sign-in face. */
  onUnlock: () => void;
}

/** LockFace — the clock face of the lock sequence. Self-contained: the
 * clock ticks here (one tick per second keeps the minute edge honest) and
 * the gesture bookkeeping dies with the mount; the anchor owns nothing of
 * the presentation. */
export function LockFace({ onUnlock }: LockFaceProps) {
  const [now, setNow] = useState(() => new Date());
  const dragstart = useRef<{ y: number } | null>(null);

  /** the lock clock ticks once a minute is enough, but one tick per second
   * keeps the minute edge honest; the interval dies with the mount */
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  /** the unlock gesture family: the swipe up needs the pointer trail, the
   * click and the wheel answer directly, the keys lift the lock for the
   * keyboard traveler */
  const onlockpointerdown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragstart.current = { y: event.clientY };
  };
  const onlockpointermove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragstart.current) return;
    if (dragstart.current.y - event.clientY > 56) {
      dragstart.current = null;
      onUnlock();
    }
  };
  const onlockpointerup = () => {
    dragstart.current = null;
  };
  const onlockkeydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " " || event.key === "ArrowUp") {
      event.preventDefault();
      onUnlock();
    }
  };

  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div
      className="dtw-login__clock"
      role="button"
      tabIndex={0}
      aria-label="Unlock"
      onPointerDown={onlockpointerdown}
      onPointerMove={onlockpointermove}
      onPointerUp={onlockpointerup}
      onPointerCancel={onlockpointerup}
      onClick={onUnlock}
      onKeyDown={onlockkeydown}
      onWheel={onUnlock}
    >
      <div className="dtw-login__clockcol">
        <span className="dtw-login__time">{time}</span>
        <span className="dtw-login__date">{date}</span>
      </div>
      <span className="dtw-login__hint">
        <ChevronUpRegular fontSize={18} aria-hidden="true" />
        {copy("auth.lock.hint")}
      </span>
    </div>
  );
}
