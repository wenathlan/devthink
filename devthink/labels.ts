/**
 * labels.ts — the copy law of the os app: every interface string lives in
 * the label store, the widgets read through this typed accessor, and a
 * hardcoded string inside a widget is a defect. the manifest below is the
 * english source of truth the seed ingests into the labels store of the
 * database; the runtime translation replaces the overrides at boot and the
 * seed never overwrites a translated row.
 */

import { readAllLabels, saveLabel, type BrowserLabel } from "./db.ts";

/** the label revision of the manifest: bump on every copy wave so the seed
 * refreshes the store rows of the changed strings. */
export const LABEL_REVISION = 1;

/** the english manifest: the page.widget.key path answers the surface text. */
export const labelManifest = {
  // the chat composer
  "chat.composer.placeholder": "Message Sol",
  "chat.composer.send": "Send message",
  "chat.composer.sending": "Sending",
  "chat.composer.stop": "Stop generating",
  "chat.composer.models": "Models",
  "chat.composer.pickModel": "Pick the model",
  "chat.composer.effort": "Reasoning effort",
  "chat.composer.reasoning": "Reasoning",
  "chat.composer.tools": "Tools",
  "chat.composer.toolModes": "Tool modes",
  "chat.composer.moreTools": "More tools",
  "chat.composer.sandboxLane": "Open the saddle sandbox lane",
  // the chat timeline
  "chat.body.assistantReply": "Assistant reply",
  "chat.body.yourMessage": "Your message",
  "chat.body.thinking": "Thinking",
  "chat.body.showFull": "Show full message",
  "chat.body.showLess": "Show less of the message",
  "chat.body.recentConversations": "Recent conversations",
  "chat.body.badResponse": "Bad response",
  "chat.body.goodResponse": "Good response",
  // the chat turn actions
  "chat.turn.copy": "Copy message",
  "chat.turn.copied": "Copied",
  "chat.turn.copyFailed": "Copy failed — retry",
  "chat.turn.edit": "Edit message",
  "chat.turn.editing": "Editing message",
  "chat.turn.cancelEdit": "Cancel edit",
  "chat.turn.saveEdit": "Save edit and branch",
  "chat.turn.saveEditHint": "Saving opens the checkpoint branch",
  "chat.turn.delete": "Delete message",
  "chat.turn.readAloud": "Read message aloud",
  "chat.turn.stopReading": "Stop reading aloud",
  "chat.turn.regenerate": "Regenerate response",
  // the composer keys
  "chat.composer.keyEnter": "Enter",
  "chat.composer.keyEscape": "Escape",
} as const;

export type LabelKey = keyof typeof labelManifest & string;

/** the translation overrides the runtime loads from the store at boot: the
 * key answers the translated text when the person changed the language. */
const overrides = new Map<string, string>();

/** the typed accessor of the copy: the only door a widget uses. */
export function label(key: LabelKey): string {
  return overrides.get(key) ?? labelManifest[key];
}

/** the seed ingests the manifest into the labels store, idempotent, and the
 * translated rows stay protected from the overwrite. */
export async function seedLabels(): Promise<{ seeded: number; protected: number }> {
  const stored = await readAllLabels();
  const rows = new Map<string, BrowserLabel>(stored.map((row) => [row.id, row]));
  let seeded = 0;
  let saved = 0;
  for (const [id, text] of Object.entries(labelManifest)) {
    const row = rows.get(id);
    overrides.set(id, row && row.translated ? row.text : text);
    if (!row || (!row.translated && row.text !== text)) {
      await saveLabel(id, text, LABEL_REVISION, row?.translated ?? false);
      seeded += 1;
    }
    saved += 1;
  }
  return { seeded, protected: saved - seeded };
}
