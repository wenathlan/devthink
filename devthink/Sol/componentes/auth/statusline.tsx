/**
 * statusline.tsx — the network corner of the auth sequence: the live
 * connection glyph in the bottom left, in the Windows position on both
 * faces (the lock and the sign-in). The glyph answers the real connection
 * state, live; the reader gets the state twice (the glyph for the eye,
 * the sr-only text for the reader). Loose component of the auth page,
 * riding the dtw-login kit of sol.css.
 */
import { Wifi3Regular } from "@fluentui/react-icons";
import { useEffect, useState } from "react";

/** StatusLine — the network corner. Self-contained: the online state and
 * its listeners die with the mount. */
export function StatusLine() {
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  // the network corner answers the real connection state, live
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  return (
    <span
      className="dtw-login__net"
      role="status"
      data-offline={online ? "false" : "true"}
      title={online ? "Connected" : "Offline"}
    >
      <Wifi3Regular fontSize={18} aria-hidden="true" />
      <span className="sr-only">{online ? "Network connected" : "Network offline"}</span>
    </span>
  );
}
