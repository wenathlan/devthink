import type { ChatEvent } from "./stream.ts";

export const colors = {
  background: "\u001b[38;5;236m",
  panel: "\u001b[38;5;238m",
  text: "\u001b[38;5;252m",
  muted: "\u001b[38;5;245m",
  cyan: "\u001b[38;5;116m",
  blue: "\u001b[38;5;110m",
  green: "\u001b[38;5;151m",
  red: "\u001b[38;5;167m",
  yellow: "\u001b[38;5;222m",
  reset: "\u001b[0m",
  bold: "\u001b[1m",
};

const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧"];

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

function pad(value: string, width: number): string {
  return value.length >= width ? value.slice(0, width) : value + " ".repeat(width - value.length);
}

export function banner(version: string): string {
  const mark = canonicalMark.split("\n").map((line) => color(colors.yellow, line)).join("\n");
  const title = color(colors.yellow + colors.bold, "DEVTHINK");
  return [mark, `${title} ${color(colors.muted, `v${version}`)}`, color(colors.muted, "Embedded gateway · terminal workbench · user-owned configuration")].join("\n");
}

export function box(title: string, content: string, width = 76): string {
  const innerWidth = Math.max(20, width - 4);
  const top = `╭─ ${color(colors.cyan, title)} ${"─".repeat(Math.max(0, innerWidth - title.length - 3))}╮`;
  const body = content.split("\n").map((line) => `│ ${pad(line, innerWidth)} │`);
  return [top, ...body, `╰${"─".repeat(width - 2)}╯`].join("\n");
}

export function statusBar(provider: string, model: string, mode: string): string {
  return color(colors.muted, `[${provider || "not configured"}] [${model || "not configured"}] [${mode}]`);
}

export function spinnerFrame(index: number, message: string): string {
  return `${color(colors.cyan, frames[index % frames.length])} ${message}`;
}

export function formatEvent(event: ChatEvent): string {
  if (event.type === "text") return event.text;
  if (event.type === "reasoning") return color(colors.muted, event.text);
  if (event.type === "error") return color(colors.red, event.message);
  if (event.type === "finish") return "";
  if (event.type === "start") return color(colors.muted, `Connected to ${event.provider} / ${event.model}`);
  return color(colors.blue, `${event.name}: ${JSON.stringify(event.input)}`);
}

export function suggestions(input: string, values: string[], limit = 8): string[] {
  const query = input.trim().toLowerCase();
  if (!query) return values.slice(0, limit);
  return values.filter((value) => value.toLowerCase().includes(query)).slice(0, limit);
}

export function formatConfig(config: Record<string, unknown>): string {
  return Object.entries(config).map(([key, value]) => `${color(colors.muted, pad(key, 20))} ${String(value)}`).join("\n");
}
