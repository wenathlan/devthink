/** Style: DevThink Orbital Signal Room — terminal workspace uses canonical ANSI art, orange intent and orb-blue connection states. */
import type { ChatEvent } from "./stream.ts";

export const colors = {
  background: "\u001b[38;5;234m",
  panel: "\u001b[38;5;240m",
  text: "\u001b[38;5;255m",
  muted: "\u001b[38;5;246m",
  cyan: "\u001b[38;5;117m",
  blue: "\u001b[38;5;111m",
  orange: "\u001b[38;5;208m",
  orangeSoft: "\u001b[38;5;215m",
  green: "\u001b[38;5;151m",
  red: "\u001b[38;5;167m",
  yellow: "\u001b[38;5;222m",
  reset: "\u001b[0m",
  bold: "\u001b[1m",
};

const frames = ["◐", "◓", "◑", "◒"];

/** Canonical DevThink ANSI mark transcribed from docs/logo.md. */
const canonicalMark = String.raw`
                                                    +
                                                    +
                                                   -+
                                                   ++
                                                   ++
                                                  +++
                                                  -++
                                                ++++-
                                              +++++++++
                                          +-+++++++++++++--
                                        --++++++-++++++++++++
                                     +++++++-+   +++  +--++++++-
                                  -+++++++-+     +++     -+-+++++++
                               ++++++++++       -+++        --++++++++
                            ++++++++-+          ++++           --+++++++-
                         ++++++++++             ++++              --+++++++-
                      ---++++++-               -++++                 -++++++--+
                   ++++++++--                  +++++                    ++++++++--
                +--+++++--                     +++++                       +++++++---
              ++++++++-                        +++++                          +-+++++++
             -+++++--                         -++++-                            --++++++
             -+++++-                          +++++-                             +++++++
             -++++++                         -+++++-                             +++++++
             -++++++                         ++++++-                             +++++++
             -++++++                         +++++++-                            +++++++
             -++++++                         ++++++++-                           +++++++
             -++++++                        -++++++++++-+                        +++++++
             -++++++                        -+++++++++++++-                      +++++++
             -++++++                        -+++++++++++++++++                   +++++++
             -++++++                       -++++++++++++++++++++                 +++++++
             -++++++                       -++++++++++++++++++++++               +++++++
             -++++++                      -+++++++++++++++++++++++++-            +++++++
             -++++++                    +++++++++++++++++-+--++++++++--          +++++++
             -++++++                 +++++++++++++++           -+++++++++        +++++++
             -++++++              +++++++++++-++                  --++++++-+      +-++++
             -++++++           ++++++++++-+-                         +--++++--      --++
             -++++++       +--++++++++++                                ---++++-+     +-
             -++++++    ++-++++++++                                        ++++++++
             -++++++ -+++++-+--                                                +-++-+
             -+++++++++++++                                                      -++++++
             -++++++++                                                          +-+++-+++-
           -+++++++++++                                                       ++++++++- +---+
        --++-+  -++++++-++                                                 ---++++++++     +-++
     ++++          +-+++++++                                             -++++++-+             ++
  -++                 ++++++++--                                     ++++++++-+-                  +
                        +-++++++-+                                 --++++++++
                           ++-+++++++                           ++++++++-+
                              +-++++++++                     --++++++++
                                 ++++++++++               +--++++++-
                                    --+++++++-         ++++++++++
                                       -+++++++-++++--++++++++
                                          +-++++++++++++++-
                                             --++++++++-
                                                +-++-`;

function color(code: string, value: string): string {
  return `${code}${value}${colors.reset}`;
}

function stripAnsi(value: string): string {
  return value.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, "");
}

function pad(value: string, width: number): string {
  const visible = stripAnsi(value);
  return visible.length >= width ? value.slice(0, Math.max(0, width - Math.max(0, visible.length - width))) : value + " ".repeat(width - visible.length);
}

export function banner(version: string): string {
  const mark = canonicalMark.split("\n").map((line) => color(colors.orange, line)).join("\n");
  const title = color(colors.orange + colors.bold, "DEVTHINK");
  const signal = color(colors.blue, "◆ local workspace");
  return [
    color(colors.muted, "╭────────────────────────────── signal workspace ──────────────────────────────╮"),
    mark,
    `  ${title} ${color(colors.muted, `v${version}`)}  ${signal}`,
    `  ${color(colors.muted, "route the work · keep provider credentials local · ctrl+p commands")}`,
    color(colors.muted, "╰────────────────────────────────────────────────────────────────────────────────╯"),
  ].join("\n");
}

export function box(title: string, content: string, width = 76): string {
  const innerWidth = Math.max(20, width - 4);
  const top = `╭─ ${color(colors.orange, title)} ${color(colors.muted, "─".repeat(Math.max(0, innerWidth - title.length - 3)))}╮`;
  const body = content.split("\n").map((line) => `│ ${color(colors.blue, "▎")} ${pad(line, innerWidth - 2)} │`);
  return [top, ...body, `╰${"─".repeat(width - 2)}╯`].join("\n");
}

export function statusBar(provider: string, model: string, mode: string): string {
  const providerLabel = provider || "not configured";
  const modelLabel = model || "not configured";
  return [
    color(colors.orange, "◆"), color(colors.text, providerLabel),
    color(colors.muted, "/"), color(colors.blue, modelLabel),
    color(colors.muted, "·"), color(colors.cyan, mode),
  ].join(" ");
}

export function spinnerFrame(index: number, message: string): string {
  return `${color(colors.blue, frames[index % frames.length])} ${color(colors.muted, "stream")} ${message}`;
}

export function formatEvent(event: ChatEvent): string {
  if (event.type === "text") return event.text;
  if (event.type === "reasoning") return `${color(colors.blue, "·")} ${color(colors.muted, event.text)}`;
  if (event.type === "error") return color(colors.red, event.message);
  if (event.type === "finish") return "";
  if (event.type === "start") return `${color(colors.blue, "◆")} ${color(colors.text, "connected")} ${color(colors.muted, `${event.provider} / ${event.model}`)}`;
  return `${color(colors.orange, "→")} ${color(colors.blue, event.name)} ${color(colors.muted, JSON.stringify(event.input))}`;
}

export function suggestions(input: string, values: string[], limit = 8): string[] {
  const query = input.trim().toLowerCase();
  if (!query) return values.slice(0, limit);
  return values.filter((value) => value.toLowerCase().includes(query)).slice(0, limit);
}

export function formatConfig(config: Record<string, unknown>): string {
  return Object.entries(config).map(([key, value]) => `${color(colors.muted, pad(key, 20))} ${String(value)}`).join("\n");
}
