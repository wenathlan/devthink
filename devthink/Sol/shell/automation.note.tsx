/**
 * automation.note.tsx — the one shared automation footnote of the native
 * pages: the calculator, the image studio, the video studio, the music
 * studio and the runner page all render this single loose component, so the
 * opt-in notice stays one line in one place instead of five copies.
 */

/** Style: DevThink Terminal Atelier — one honest line under the native
 * surfaces: every native app rides with automation and MCP ready, and the
 * opt-in lives in settings, off by default. */
import { PlugZap } from "lucide-react";

export function AutomationNote() {
  return (
    <p className="control-note automation-note">
      <PlugZap size={15} style={{ color: "var(--dt-orange)", flexShrink: 0 }} />
      automation &amp; MCP ready: opt in from settings — off by default, requests go only to non-local http/https hosts
    </p>
  );
}
