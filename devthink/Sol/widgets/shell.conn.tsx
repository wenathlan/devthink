/**
 * conn.tsx — the connection dot of the family (the universal set): the
 * composed status that pairs the dot with the state word, the connecting
 * state riding the ping loop and the error carrying the honest tone. the
 * label rides the prop, never a hardcoded string.
 */

import { Dot } from "./shell.dot.tsx";

export type ConnState = "connected" | "connecting" | "error" | "offline";

export type ConnProps = {
  /** the state of the connection */
  state: ConnState;
  /** the visible state label from the label store */
  text?: string;
  /** the accessible verdict of the state */
  title?: string;
};

const toneOf: Record<ConnState, "ok" | "warn" | "err" | "neutral"> = {
  connected: "ok",
  connecting: "warn",
  error: "err",
  offline: "neutral",
};

/**
 * The connection status.
 *
 * @param props the state, the label and the title.
 * @returns the connection element.
 */
export function Conn({ state, text, title }: ConnProps) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }} title={title}>
      <Dot tone={toneOf[state]} ping={state === "connecting"} pulse={state === "error"} />
      {text ? (
        <span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--ink-2)" }}>{text}</span>
      ) : null}
    </span>
  );
}

export default Conn;
