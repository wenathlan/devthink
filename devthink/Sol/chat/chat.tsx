/**
 * chat page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file; no module outside the folder imports the folder members
 * directly. The page mount is the shell chrome plus the shared conversation
 * body (chatbody.tsx) — the same body the os chat window mounts, so the
 * fullpage surface and the windowed surface stay one app.
 *
 * Chat — the /chat surface of the Sol theme, a Grok/ChatGPT-grade
 * conversation shell in the Windows 11 grammar of the house chrome. The
 * gateway is opt-in (the session panel or settings registers it), the
 * conversations persist through the chatstate store, and the deep
 * /w/…/chat links hand their session to this app through the chatstate
 * handoff slot.
 */

import { ShellChrome } from "../components/shell.shellchrome.tsx";
import ChatBody from "../components/chat.body.tsx";

export * from "../../chatstate.ts";
export * from "../../useismobile.ts";
export * from "../components/chat.composer.tsx";
export * from "../components/chat.markdown.tsx";
export * from "../components/chat.sandboxpane.tsx";
export * from "../components/chat.sessionpanel.tsx";
export * from "../components/chat.sidebar.tsx";
export * from "../components/chat.solboticon.tsx";
export * from "../components/chat.turn.tsx";
export * from "../components/chat.welcome.tsx";

export default function Chat() {
  return (
    <div className="chat-root">
      <ShellChrome />
      <ChatBody />
    </div>
  );
}
