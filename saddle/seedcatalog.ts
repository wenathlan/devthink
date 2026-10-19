/** Style: Saddle catalog seeds — the reviewed offline answer of the catalog
 * until the database endpoint is paired. The rows describe the prepared media
 * areas the pages render: no image file ships in the repository, the picture
 * content arrives from the database over HTTPS. The agent session seed
 * mirrors the documented example log of docs/logs/examplesession.json
 * verbatim, so the agent browser page renders the repository's own example
 * instead of inventing one. */
import type { AgentSession, MediaSlot } from "./catalog";

export const seedMediaSlots: MediaSlot[] = [
  {
    id: "media.home.hero",
    label: "memory bridge",
    ratio: "16 / 10",
    caption: "Abstract bridge of storage tiles and remote compute nodes.",
  },
  {
    id: "media.runtime.map",
    label: "remote runtime map",
    ratio: "4 / 3",
    caption: "Illustrated map of repositories connected to remote runners.",
  },
  {
    id: "media.agentbrowser.trace",
    label: "browser trace",
    ratio: "3 / 2",
    caption: "Cursor trace and evidence from a browser session.",
  },
];

/** the reviewed agent session seed: the documented example session of
 * docs/logs/examplesession.json (id, browser, seed, events and the captcha
 * verdict), mirrored verbatim — the offline answer of the sessions catalog. */
export const seedAgentSessions: AgentSession[] = [
  {
    version: 1,
    session: {
      id: "examplesession-0001",
      browser: "brave",
      seed: "examplesession-seed-0001",
    },
    events: [
      { t: 140, type: "move", x: 120, y: 90 },
      { t: 300, type: "move", x: 180, y: 140 },
      { t: 480, type: "click", x: 180, y: 140 },
      { t: 680, type: "type", key: "k" },
      { t: 900, type: "move", x: 240, y: 200 },
      { t: 1140, type: "click", x: 240, y: 200 },
      { t: 1400, type: "scroll", dy: 320 },
    ],
    captcha: {
      kind: "hcaptcha",
      passed: true,
    },
  },
];
