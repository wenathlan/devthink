export type ModeDefinition = {
  id: string;
  label: string;
  purpose: string;
  memory: boolean;
};

export const MODES: ModeDefinition[] = [
  ["chat", "Chat", "Conversational interaction", true],
  ["code", "Code", "Code generation and editing", true],
  ["review", "Review", "Code review and analysis", true],
  ["debug", "Debug", "Debugging assistance", true],
  ["test", "Test", "Test generation and execution", true],
  ["doc", "Doc", "Documentation generation", true],
  ["refactor", "Refactor", "Refactoring suggestions", true],
  ["explain", "Explain", "Code explanation", true],
  ["search", "Search", "Codebase search", true],
  ["plan", "Plan", "Project planning", true],
  ["execute", "Execute", "Command execution assistance", true],
  ["analyze", "Analyze", "Data and code analysis", true],
  ["translate", "Translate", "Language and format translation", true],
  ["generate", "Generate", "Content generation", true],
  ["optimize", "Optimize", "Performance optimization", true],
  ["security", "Security", "Security analysis", true],
  ["deploy", "Deploy", "Deployment assistance", true],
  ["monitor", "Monitor", "Monitoring and health", true],
  ["config", "Config", "Configuration management", true],
  ["session", "Session", "Session and context management", true],
].map(([id, label, purpose, memory]) => ({ id, label, purpose, memory })) as ModeDefinition[];

export function listModes(): ModeDefinition[] {
  return MODES.map((mode) => ({ ...mode }));
}

export function resolveMode(id: string): ModeDefinition {
  const mode = MODES.find((item) => item.id === id.toLowerCase());
  if (!mode) throw new Error(`Unknown mode: ${id}. Use devthink modes.`);
  return mode;
}

export function modePrompt(mode: ModeDefinition): string {
  return `You are DevThink in ${mode.label} mode. Focus on ${mode.purpose.toLowerCase()}. Prefer precise, actionable answers. Do not claim to have executed an action unless the user explicitly enabled and requested it.`;
}
