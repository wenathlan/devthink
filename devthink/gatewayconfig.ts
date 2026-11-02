/**
 * gatewayconfig.ts — the gateway definition of the devthink app (root layer).
 *
 * The embedded gateway serves the OpenAI-compatible contract the chat speaks:
 * `/v1/chat/completions` + `/v1/models` (and the legacy `/api/v1/*` prefix the
 * server always carried). The v1 row rides the z.ai SDK transport — keyless,
 * the SDK authenticates itself — exactly the family doctrine: the chat talks to
 * the gateway, the gateway talks to the model, and no side-service ever ships.
 */

import type { gatewaydefinition } from "./types.ts";

export const config: gatewaydefinition = {
  name: "devthink gateway",
  description: "the embedded gateway of the devthink app — v1 zai sdk keyless",
  versions: {
    v1: {
      id: "v1",
      name: "zai sdk",
      providername: "zai",
      note: "passthrough retransmit via z ai web dev sdk — no token chat id required",
      transport: { type: "zai-sdk" },
      upstreams: [],
      auth: { mode: "keylesssdk" },
      defaultmodel: "devthink",
      models: [
        { id: "devthink", context: 200000, maxoutput: 32768, reasoning: true },
        { id: "glm-5.3", context: 200000, maxoutput: 32768, reasoning: true, family: "glm" },
        { id: "glm-5.3-flash", context: 128000, maxoutput: 16384, reasoning: true, family: "glm", free: true },
        { id: "glm-5.3-fast", context: 128000, maxoutput: 16384, reasoning: true, family: "glm" },
        { id: "glm-5.3-air", context: 128000, maxoutput: 16384, reasoning: true, family: "glm", free: true },
        { id: "glm-5.2", context: 200000, maxoutput: 32768, reasoning: true, family: "glm" },
        { id: "glm-5.1", context: 128000, maxoutput: 32768, reasoning: true, family: "glm" },
        { id: "glm-5", context: 128000, maxoutput: 32768, reasoning: true, family: "glm" },
        { id: "glm-5v", context: 128000, maxoutput: 16384, reasoning: false, vision: true, family: "glm" },
        { id: "glm-5-turbo", context: 128000, maxoutput: 16384, reasoning: false, family: "glm", free: true },
        { id: "glm-4-plus", context: 128000, maxoutput: 16384, reasoning: false, family: "glm" },
        { id: "glm-4-flash", context: 128000, maxoutput: 8192, reasoning: false, family: "glm", free: true },
      ],
      defaults: {
        primary: "devthink",
        maxtokens: 8192,
        temperature: [0, 2, 0.7],
      },
      thinking: {
        defaultlevel: "high",
        param: "thinking",
        twocalls: { threshold: 98304, freshresponseguarantee: true },
      },
      metamodel: {
        id: "devthink",
        contextoverride: 200000,
        maxoutput: 32768,
        maskupstreammodel: true,
        alwaysdisplay: true,
        listedcreated: 1700000000,
        pattern: "fusion meta model over the zai sdk transport",
      },
      context: {
        restoresessionhistory: false,
        truncate: true,
        historylimit: 40,
        truncatemargin: 4096,
      },
    },
  },
};

export default config;
