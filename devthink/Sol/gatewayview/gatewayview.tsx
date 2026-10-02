/**
 * gatewayview page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it (the Gateway main component is
 * one of them), mounts the page and re-exports the public component surface.
 * Only the theme anchor (Sol/Sol.tsx) consumes this file; no module outside
 * the folder imports the folder members directly.
 */
import Gateway from "./Gateway";

export * from "./Gateway";

/** Mounts the gateway console page from the folder components. */
export default function GatewayViewAnchor() {
  return <Gateway />;
}
