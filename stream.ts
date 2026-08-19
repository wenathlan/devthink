export type ChatEvent =
  | { type: "start"; provider: string; model: string }
  | { type: "text"; text: string }
  | { type: "reasoning"; text: string }
  | { type: "tool"; name: string; input: unknown }
  | { type: "error"; message: string }
  | { type: "finish"; reason?: string };

export type StreamOptions = {
  provider: string;
  model: string;
  signal?: AbortSignal;
};

function decodeJson(value: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function extractSseFrames(buffer: { value: string }, incoming: string): string[] {
  buffer.value += incoming;
  const frames = buffer.value.split(/\r?\n\r?\n/);
  buffer.value = frames.pop() || "";
  return frames;
}

function extractData(frame: string): string | null {
  const lines = frame.split(/\r?\n/).filter((line) => line.startsWith("data:"));
  if (lines.length === 0) return null;
  const value = lines.map((line) => line.slice(5).trimStart()).join("\n").trim();
  return value && value !== "[DONE]" ? value : null;
}

function textAt(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeOpenAi(frame: Record<string, unknown>): ChatEvent[] {
  const choices = Array.isArray(frame.choices) ? frame.choices : [];
  const choice = choices[0] as Record<string, unknown> | undefined;
  const delta = (choice?.delta || {}) as Record<string, unknown>;
  const events: ChatEvent[] = [];
  const reasoning = textAt(delta.reasoning_content || delta.reasoning);
  const text = textAt(delta.content);
  if (reasoning) events.push({ type: "reasoning", text: reasoning });
  if (text) events.push({ type: "text", text });
  const finish = choice?.finish_reason;
  if (finish) events.push({ type: "finish", reason: textAt(finish) });
  return events;
}

function normalizeAnthropic(frame: Record<string, unknown>): ChatEvent[] {
  const type = textAt(frame.type);
  if (type === "content_block_delta") {
    const delta = (frame.delta || {}) as Record<string, unknown>;
    const text = textAt(delta.text);
    return text ? [{ type: "text", text }] : [];
  }
  if (type === "message_stop") return [{ type: "finish", reason: "stop" }];
  if (type === "error") {
    const error = (frame.error || {}) as Record<string, unknown>;
    return [{ type: "error", message: textAt(error.message) || "Anthropic returned an error." }];
  }
  return [];
}

function normalizeGoogle(frame: Record<string, unknown>): ChatEvent[] {
  const candidates = Array.isArray(frame.candidates) ? frame.candidates : [];
  const content = ((candidates[0] as Record<string, unknown> | undefined)?.content || {}) as Record<string, unknown>;
  const parts = Array.isArray(content.parts) ? content.parts : [];
  const events: ChatEvent[] = [];
  for (const part of parts) {
    const item = part as Record<string, unknown>;
    const text = textAt(item.text);
    if (text) events.push({ type: "text", text });
  }
  const finish = textAt((candidates[0] as Record<string, unknown> | undefined)?.finishReason);
  if (finish) events.push({ type: "finish", reason: finish });
  return events;
}

export function normalizeFrame(provider: string, frame: Record<string, unknown>): ChatEvent[] {
  const lower = provider.toLowerCase();
  if (lower === "anthropic") return normalizeAnthropic(frame);
  if (lower === "google") return normalizeGoogle(frame);
  const data = (frame.data || frame) as Record<string, unknown>;
  if (data !== frame && textAt(data.delta_content)) return [{ type: "text", text: textAt(data.delta_content) }];
  if (data !== frame && textAt(data.reasoning_content)) return [{ type: "reasoning", text: textAt(data.reasoning_content) }];
  if (data.error || frame.error) return [{ type: "error", message: textAt(data.error || frame.error) || "The provider returned an error." }];
  return normalizeOpenAi(frame);
}

export async function* parseEventStream(response: Response, options: StreamOptions): AsyncGenerator<ChatEvent> {
  if (!response.body) throw new Error("The provider returned an empty stream.");
  yield { type: "start", provider: options.provider, model: options.model };
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const buffer = { value: "" };
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const frame of extractSseFrames(buffer, decoder.decode(value, { stream: true }))) {
        const payload = extractData(frame);
        if (!payload) continue;
        const parsed = decodeJson(payload);
        if (!parsed) continue;
        for (const event of normalizeFrame(options.provider, parsed)) yield event;
      }
    }
  } finally {
    reader.releaseLock();
  }
  yield { type: "finish", reason: "stop" };
}

export async function collectEvents(events: AsyncIterable<ChatEvent>): Promise<{ text: string; reasoning: string }> {
  let text = "";
  let reasoning = "";
  for await (const event of events) {
    if (event.type === "text") text += event.text;
    if (event.type === "reasoning") reasoning += event.text;
    if (event.type === "error") throw new Error(event.message);
  }
  return { text, reasoning };
}
