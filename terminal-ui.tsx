/** Design: DevThink v1.1.10 — Ink renders the same landing-to-browser-workspace progression as the React workbench. */
import { Box, Text, render, useApp, useInput, useWindowSize } from "ink";
import { useState } from "react";
import type { DevThinkConfig } from "./config.ts";
import type { ChatEvent } from "./stream.ts";
import type { Session } from "./session.ts";

const categories = ["features", "bugs", "refactor", "snippets", "tasks", "notes", "all", "settings"] as const;
const categoryGlyphs: Record<(typeof categories)[number], string> = { features: "ϟ", bugs: "⊗", refactor: "◌", snippets: "◫", tasks: "☑", notes: "□", all: "◉", settings: "⚙" };
const entryArt = ["                 +++++", "          +++++++++++++++", "      ++++++     ++++++", "    +++++         +++++", "   +++++           +++++", "    +++++         +++++", "      ++++++   ++++++", "          +++++++++++++", "                 +++++"];

type Runtime = { config: DevThinkConfig };
type Execute = (prompt: string, current: Session | undefined, onEvent: (event: ChatEvent) => void) => Promise<Session | undefined>;
type Entry = { role: "user" | "devthink" | "error"; title: string; body: string };

function clip(value: string, width: number): string {
  return value.length > width ? `${value.slice(0, Math.max(0, width - 1))}…` : value;
}

function TerminalEntry({ draft, provider, width }: { draft: string; provider: string; width: number }) {
  return <Box flexDirection="column" width="100%" height="100%" minHeight={20} paddingX={2} paddingY={1} justifyContent="space-between">
    <Box justifyContent="space-between"><Text color="#807970">✦ DEVTHINK</Text><Text color="#8ab4f8">LOCAL-FIRST WORKBENCH</Text></Box>
    <Box flexDirection="column" alignItems="center">
      <Box flexDirection="column" alignItems="center">{entryArt.map((line, index) => <Text key={`${line}-${index}`} color="#382c23">{line}</Text>)}</Box>
      <Box marginTop={-1}><Text color="#ff5f00" bold>DEVTHINK</Text></Box>
      <Box marginTop={1}><Text color="#746f66">begin with one intention</Text></Box>
      <Box marginTop={2}><Text color="#282724">┌{"─".repeat(Math.max(16, width - 2))}┐</Text></Box>
      <Text color="#e8e1d7">│ <Text color="#ff5f00">›_ </Text><Text color={draft ? "#e8e1d7" : "#746f66"}>{clip(draft || "Ask anything…", Math.max(12, width - 22))}</Text><Text color="#8ab4f8"> {provider}</Text><Text color="#ff5f00"> [open]</Text> │</Text>
      <Text color="#282724">└{"─".repeat(Math.max(16, width - 2))}┘</Text>
    </Box>
    <Text color="#746f66">enter opens a local workspace · esc exits</Text>
  </Box>;
}

function TerminalWorkspace({ runtime, execute, version }: { runtime: Runtime; execute: Execute; version: string }) {
  const { exit } = useApp();
  const { columns } = useWindowSize();
  const [entered, setEntered] = useState(false);
  const [active, setActive] = useState<(typeof categories)[number]>("all");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [session, setSession] = useState<Session>();
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const provider = runtime.config.activeProvider || runtime.config.provider || "local";
  const model = runtime.config.activeModel || runtime.config.model || "not configured";
  const compact = columns < 100;
  const tabLine = compact ? categories.map((category) => categoryGlyphs[category]).join(" ") : categories.map((category) => `${category === active ? "[" : ""}${categoryGlyphs[category]} ${category}${category === active ? "]" : ""}`).join("  ");
  const terminalWidth = Math.max(38, columns - (compact ? 2 : 6));

  async function submit() {
    const prompt = draft.trim();
    if (!prompt || pending) return;
    if (prompt === "/exit" || prompt === "/quit") return exit();
    if (!entered) {
      setEntries([{ role: "user", title: "first intention", body: prompt }, { role: "devthink", title: "local workspace ready", body: "The first command opened a local DevThink session. Configure a provider whenever the work needs a model." }]);
      setDraft("");
      setEntered(true);
      return;
    }
    if (prompt === "/clear") { setEntries([]); setDraft(""); return; }
    if (prompt === "/new") { setSession(undefined); setEntries([]); setDraft(""); return; }
    if (prompt === "/help") {
      setEntries((current) => [...current, { role: "devthink", title: "command reference", body: "/new  /clear  /models  /modes  /sessions  /exit" }]);
      setDraft("");
      return;
    }
    setEntries((current) => [...current, { role: "user", title: active, body: prompt }, { role: "devthink", title: "connecting", body: "waiting for local gateway events…" }]);
    setDraft("");
    setPending(true);
    let partial = "";
    try {
      const next = await execute(prompt, session, (event) => {
        if (event.type === "text" || event.type === "reasoning") partial += event.text;
        setEntries((current) => current.map((entry, index) => index === current.length - 1 ? { ...entry, title: event.type === "start" ? "streaming" : "devthink", body: partial || "connecting to local provider…" } : entry));
      });
      setSession(next);
      setEntries((current) => current.map((entry, index) => index === current.length - 1 ? { ...entry, title: "devthink", body: partial || next?.messages.at(-1)?.content || "the provider returned no text." } : entry));
    } catch (error) {
      setEntries((current) => current.map((entry, index) => index === current.length - 1 ? { role: "error", title: "gateway error", body: error instanceof Error ? error.message : "request could not be completed" } : entry));
    } finally { setPending(false); }
  }

  useInput((input, key) => {
    if (key.escape || (key.ctrl && input === "c")) return exit();
    if (key.return) return void submit();
    if (key.backspace || key.delete) return setDraft((current) => current.slice(0, -1));
    if (entered && (key.leftArrow || key.tab)) return setActive((current) => categories[(categories.indexOf(current) + categories.length - 1) % categories.length]);
    if (entered && key.rightArrow) return setActive((current) => categories[(categories.indexOf(current) + 1) % categories.length]);
    if (!key.ctrl && !key.meta && input) setDraft((current) => current + input);
  });

  if (!entered) return <TerminalEntry draft={draft} provider={provider} width={terminalWidth} />;

  return <Box flexDirection="column" width="100%" height="100%" minHeight={20} paddingX={compact ? 1 : 3} paddingY={1}>
    <Box justifyContent="space-between"><Text color="#a19a91">✦ DEVTHINK <Text color="#746f66">/ local session</Text></Text><Text color="#8ab4f8">◉ {provider.toUpperCase()}</Text></Box>
    <Text color="#282724">{"─".repeat(terminalWidth)}</Text>
    <Text color="#746f66">{clip(tabLine, terminalWidth)}</Text>
    <Box marginTop={1}><Text color="#e8e1d7">{categoryGlyphs[active]} {active.toUpperCase()} <Text color="#746f66">· {entries.length} entries · {clip(model, 22)}</Text></Text></Box>
    <Box flexDirection="column" flexGrow={1} justifyContent={entries.length ? "flex-start" : "center"} alignItems={entries.length ? "flex-start" : "center"}>
      {entries.length ? entries.map((entry, index) => <Box key={`${entry.title}-${index}`} flexDirection="column" marginBottom={1} paddingLeft={1}><Box><Text color={entry.role === "user" ? "#ff5f00" : entry.role === "error" ? "#ff6b6b" : "#8ab4f8"}>▎ {entry.title.toUpperCase()}</Text></Box><Box><Text color="#e8e1d7">{clip(entry.body, terminalWidth - 6)}</Text></Box></Box>) : <Box flexDirection="column" alignItems="center"><Box><Text color="#4b4842">Nothing is active yet.</Text></Box><Box><Text color="#625c54">Describe the next feature, bug or piece of work below.</Text></Box><Box marginTop={2}><Text color="#ff5f00" bold>DEVTHINK</Text></Box></Box>}
    </Box>
    <Text color="#282724">┌{"─".repeat(Math.max(16, terminalWidth - 2))}┐</Text>
    <Text color="#e8e1d7">│ <Text color="#ff5f00">›_ </Text><Text color={draft ? "#e8e1d7" : "#746f66"}>{clip(draft || `Ask DevThink about ${active === "all" ? "the work…" : `${active}…`}`, Math.max(12, terminalWidth - 20))}</Text><Text color="#8ab4f8"> {provider}</Text><Text color="#ff5f00"> [run]</Text> │</Text>
    <Text color="#282724">└{"─".repeat(Math.max(16, terminalWidth - 2))}┘</Text>
    <Text color="#746f66">provider credentials stay in the local cli · v{version} · esc exit</Text>
  </Box>;
}

export async function startTerminalWorkspace(runtime: Runtime, version: string, execute: Execute): Promise<void> {
  const app = render(<TerminalWorkspace runtime={runtime} version={version} execute={execute} />, { exitOnCtrlC: false });
  await app.waitUntilExit();
}
