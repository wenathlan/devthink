/**
 * chatstate.ts — the conversation store library of the getry package (the
 * transfer seat of the devthink chat grammar): the types, validators and
 * store laws every chat consumer of the family rides — the devthink os chat
 * window, the getry sol studio and any client that speaks the published
 * specifier ("@wenathlan/getry/chatstate"). the devthink app owns no
 * conversation logic of its own anymore: this seat is the one owner.
 *
 * the grammar (ported from the devthink chatstate and adapted to the getry
 * lane clients):
 *   - the turn: role · content · thought (the reasoning_content the gateway
 *     streams before the answer) · the backend that served it · the honest
 *     stopped/edited marks · the multimodal images
 *   - the conversation: the turns plus the route lane (v1..v5), the model
 *     mask, the thinking rung, the temperature, the session id of the
 *     rotation contract
 *   - the cascading edit law: every branch edit appends a checkpoint to the
 *     ladder and the newest edit prevails — the original turns stay intact,
 *     the branch carries the lineage
 *   - the birth identity: every conversation is born with its space, its
 *     sandbox and its own session identity provisioned automatically, so
 *     the deep links always bind real ids (never a display-time guess)
 *   - the visitor tags: free labels, capped, the sidebar chips read and
 *     write them
 */

import type { ChatUsage } from "./chatclient";

/* ===== section 1: the turn grammar ===================================== */

/** the role of one turn of the conversation. */
export type TurnRole = "user" | "assistant";

/** one conversation turn — the row every renderer and every persistence
 * lane maps. */
export type ChatStoreTurn = {
  id: string;
  role: TurnRole;
  content: string;
  /** the reasoning_content of the gateway, rendered as the cognition
   * drawer — the gateway emission order guarantees it arrives before the
   * content. */
  thought?: string | undefined;
  /** the images of a user turn (data urls, the composer cap applies). */
  images?: string[] | undefined;
  /** model reported by the gateway (assistant turns only). */
  model?: string | undefined;
  /** the live backend that served this devthink meta-model turn. */
  backend?: string | undefined;
  /** true when the visitor stopped the generation — the partial answer
   * stayed on the floor and the meta line says so honestly. */
  stopped?: boolean | undefined;
  /** true when this user turn was born from the checkpoint edit law (the
   * branch carried the edit forward) — the meta line carries the honest
   * · edited mark. */
  edited?: boolean | undefined;
  at: number;
};

/** the type guard of one turn (the stored-state validator lane). */
export function isChatStoreTurn(value: unknown): value is ChatStoreTurn {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    (row.role === "user" || row.role === "assistant") &&
    typeof row.content === "string" &&
    (row.thought === undefined || typeof row.thought === "string") &&
    (row.model === undefined || typeof row.model === "string") &&
    (row.backend === undefined || typeof row.backend === "string") &&
    (row.stopped === undefined || typeof row.stopped === "boolean") &&
    (row.edited === undefined || typeof row.edited === "boolean") &&
    (row.images === undefined || (Array.isArray(row.images) && row.images.every((img) => typeof img === "string"))) &&
    typeof row.at === "number"
  );
}

/* ===== section 2: the checkpoint ladder (the cascading edit law) ======= */

/** one checkpoint of the cascading edit law — every edit appends here, the
 * branch carries the whole ladder and the newest edit prevails at merge. */
export type ChatCheckpoint = {
  at: number;
  /** the turn the edit landed on. */
  turnId: string;
  /** the edit ordinal — 1 for the first edit of the lineage. */
  edit: number;
};

/* ===== section 3: the birth identity =================================== */

/** the birth identity of a conversation — the sandbox law of the family:
 * every conversation is born with its space, its sandbox and its own
 * session identity provisioned automatically, so the saddle lane and the
 * deep links always have real ids to bind (never a display-time guess).
 * branches inherit the same birth: the identity belongs to the lineage. */
export type ChatBirth = {
  /** the workspace the conversation lives in. */
  spaceId: string;
  /** the sandbox the conversation was born with. */
  sandboxId: string;
  /** the conversation identity itself. */
  sessionId: string;
};

/* ===== section 4: the conversation ===================================== */

/** one conversation of the store — the turns plus the lane state and the
 * lineage laws. */
export type ChatStoreConversation = {
  id: string;
  title: string;
  /** the route lane of the gateway (v1..v5). */
  version: string;
  /** the model mask (the devthink meta-model or a raw backend id). */
  modelId: string;
  /** the thinking rung of the seven-level ladder. */
  thinkingLevel: string;
  temperature: number;
  /** the gateway session id of the rotation contract. */
  sessionId: string;
  messages: ChatStoreTurn[];
  /** last activity timestamp — drives the Today / Previous 7 days groups. */
  at: number;
  /** the cascading checkpoint ladder (the edit law). */
  checkpoints?: ChatCheckpoint[] | undefined;
  /** the session this branch was born from — the original stays intact. */
  editOf?: string | undefined;
  /** the birth identity (space, sandbox, session) — minted at creation,
   * inherited by every branch of the lineage. */
  birth?: ChatBirth | undefined;
  /** the visitor tags of the conversation — free labels, capped. */
  tags?: string[] | undefined;
};

/** the cap of the visitor tags (the sidebar chips lane). */
export const CHATTAGCAP = 8;

/** the type guard of one conversation (the stored-state validator lane). */
export function isChatStoreConversation(value: unknown): value is ChatStoreConversation {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.title === "string" &&
    typeof row.version === "string" &&
    typeof row.modelId === "string" &&
    typeof row.thinkingLevel === "string" &&
    typeof row.temperature === "number" &&
    typeof row.sessionId === "string" &&
    Array.isArray(row.messages) &&
    row.messages.every(isChatStoreTurn) &&
    typeof row.at === "number"
  );
}

/* ===== section 5: the store laws ======================================= */

/** the tag law: appends one tag under the cap, deduped, lowercase-trimmed. */
export function appendtag(conversation: ChatStoreConversation, tag: string): ChatStoreConversation {
  const clean = tag.trim().toLowerCase();
  if (clean === "") return conversation;
  const next = conversation.tags ?? [];
  if (next.includes(clean) || next.length >= CHATTAGCAP) return conversation;
  return { ...conversation, tags: [...next, clean] };
}

/** the tag law: removes one tag. */
export function removetag(conversation: ChatStoreConversation, tag: string): ChatStoreConversation {
  const next = (conversation.tags ?? []).filter((row) => row !== tag);
  return { ...conversation, tags: next.length > 0 ? next : undefined };
}

/** the checkpoint law: appends one edit checkpoint to the ladder — every
 * edit lands here, the newest prevails, the original turns stay intact. */
export function appendcheckpoint(conversation: ChatStoreConversation, turnId: string): ChatStoreConversation {
  const ladder = conversation.checkpoints ?? [];
  const checkpoint: ChatCheckpoint = { at: Date.now(), turnId, edit: ladder.length + 1 };
  return { ...conversation, checkpoints: [...ladder, checkpoint] };
}

/** the branch law: derives one branch conversation from a parent — the
 * branch inherits the birth identity, the lane state and the checkpoint
 * ladder (the edit ordinal rides the lineage), and the original stays
 * intact (editOf pins the origin). */
export function branchof(parent: ChatStoreConversation, branchId: string, messages: ChatStoreTurn[]): ChatStoreConversation {
  return {
    ...parent,
    id: branchId,
    messages: messages.map((turn) => (turn.role === "user" ? { ...turn, edited: true } : turn)),
    editOf: parent.id,
    at: Date.now(),
  };
}

/** the usage adapter: maps one gateway usage row onto the turn meta (the
 * honest token line). */
export function usageof(usage: ChatUsage | undefined): { total?: number; completion?: number } {
  return { total: usage?.totalTokens, completion: usage?.completionTokens };
}

/** the title law: derives the conversation title from the first user
 * message (one line, the 42-char budget). */
export function titleof(firstPrompt: string, budget = 42): string {
  const flat = firstPrompt.replace(/\s+/g, " ").trim();
  if (flat === "") return "new conversation";
  return flat.length > budget ? `${flat.slice(0, budget).trimEnd()}…` : flat;
}

/** the grouping law: buckets the conversations by the activity window —
 * Today · Previous 7 days · Older (the sidebar groups). */
export function groupbyactivity(conversations: Array<{ at: number }>): { today: number; week: number; older: number } {
  const now = Date.now();
  const day = 86_400_000;
  let today = 0;
  let week = 0;
  let older = 0;
  for (const conversation of conversations) {
    const age = now - conversation.at;
    if (age < day) today += 1;
    else if (age < day * 7) week += 1;
    else older += 1;
  }
  return { today, week, older };
}
