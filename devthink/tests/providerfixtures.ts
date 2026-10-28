/** The recorded provider wire fixtures of the gateway family as one dense typescript module: the streams, the completions, the model lists and the tags answer of the four provider shapes (anthropic, gemini, ollama and the openai compatible surface), each export holding the exact original file text of its tests root source. The localhost gateway fixture server serves them over plain http so the adapter suite and the container smoke run the full request cycle offline — no external network, no provider endpoint, no key — and the gateway tests parse the same bodies the stub transports answer. */

/** the anthropic message stream (sse events of the content block delta family) — the exact text of the former tests/anthropic-stream.txt. */
export const anthropicstream = `event: message_start
data: {"type":"message_start","message":{"id":"msg-fixture-1","role":"assistant"}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"the messages "}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"content blocks stream"}}

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":12}}

event: message_stop
data: {"type":"message_stop"}

`;

/** the anthropic completion answer (the stop reason and the usage record) — the exact text of the former tests/anthropic-completion.json. */
export const anthropiccompletion = `{
  "id": "msg-fixture-1",
  "type": "message",
  "role": "assistant",
  "model": "fixture-claude-shape",
  "content": [
    {
      "type": "text",
      "text": "{\\"goal\\":\\"summarize the page\\",\\"steps\\":[{\\"kind\\":\\"extract\\",\\"target\\":\\"article\\",\\"summary\\":\\"read the article\\"}],\\"openquestions\\":[\\"which sections matter\\"]}"
    }
  ],
  "stop_reason": "end_turn",
  "usage": { "input_tokens": 47, "output_tokens": 18 }
}
`;

/** the anthropic model list (the fixture claude shapes with their context windows) — the exact text of the former tests/anthropic-models.json. */
export const anthropicmodels = `{
  "data": [
    {
      "type": "model",
      "id": "fixture-claude-shape",
      "display_name": "Fixture Claude Shape",
      "created_at": "2026-01-01T00:00:00Z"
    },
    {
      "type": "model",
      "id": "fixture-claude-wide",
      "display_name": "Fixture Claude Wide",
      "context_window": 200000,
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
`;

/** the gemini generatecontent stream (the sse quoted-json chunks of the streamed answer) — the exact text of the former tests/gemini-stream.txt. */
export const geministream = `data: {"candidates":[{"content":{"parts":[{"text":"gemini "}],"role":"model"},"index":0}]}

data: {"candidates":[{"content":{"parts":[{"text":"candidate parts "}],"role":"model"},"index":0}]}

data: {"candidates":[{"content":{"parts":[{"text":"stream"}],"role":"model"},"index":0}],"finishReason":"STOP"}

`;

/** the gemini completion answer (the candidates with the finish reason) — the exact text of the former tests/gemini-completion.json. */
export const geminicompletion = `{
  "candidates": [
    {
      "content": {
        "parts": [{ "text": "{\\"goal\\":\\"answer the question\\",\\"steps\\":[],\\"openquestions\\":[]}" }],
        "role": "model"
      },
      "finishReason": "STOP",
      "index": 0
    }
  ],
  "usageMetadata": { "promptTokenCount": 29, "candidatesTokenCount": 11, "totalTokenCount": 40 }
}
`;

/** the gemini model list (the fixture gemini shapes) — the exact text of the former tests/gemini-models.json. */
export const geminimodels = `{
  "models": [
    {
      "name": "models/fixture-gemini-shape",
      "displayName": "Fixture Gemini Shape",
      "inputTokenLimit": 32768,
      "outputTokenLimit": 8192,
      "supportedGenerationMethods": ["generateContent", "countTokens"]
    },
    {
      "name": "models/fixture-gemini-vision",
      "displayName": "Fixture Gemini Vision",
      "inputTokenLimit": 65536,
      "supportedGenerationMethods": ["generateContent"]
    }
  ]
}
`;

/** the ollama chat stream (the ndjson lines of the streamed answer) — the exact text of the former tests/ollama-stream.txt. */
export const ollamastream = `{"model":"fixture-local:7b","created_at":"2026-01-01T00:00:00Z","message":{"role":"assistant","content":"the local "},"done":false}
{"model":"fixture-local:7b","created_at":"2026-01-01T00:00:00Z","message":{"role":"assistant","content":"runtime streams "},"done":false}
{"model":"fixture-local:7b","created_at":"2026-01-01T00:00:00Z","message":{"role":"assistant","content":"line by line"},"done":true}
`;

/** the ollama chat completion answer (the message and the done record) — the exact text of the former tests/ollama-completion.json. */
export const ollamacompletion = `{
  "model": "fixture-local:7b",
  "created_at": "2026-01-01T00:00:00Z",
  "message": {
    "role": "assistant",
    "content": "{\\"goal\\":\\"run locally\\",\\"steps\\":[{\\"kind\\":\\"extract\\",\\"target\\":\\"main\\",\\"summary\\":\\"read the main region\\"}],\\"openquestions\\":[]}"
  },
  "done": true,
  "prompt_eval_count": 40,
  "eval_count": 17
}
`;

/** the ollama tags answer (the local model list with sizes and digests) — the exact text of the former tests/ollama-tags.json. */
export const ollamatags = `{
  "models": [
    {
      "name": "fixture-local:7b",
      "model": "fixture-local:7b",
      "modified_at": "2026-01-01T00:00:00Z",
      "size": 4100000000,
      "digest": "fixture-digest-1",
      "details": {
        "format": "gguf",
        "family": "llama",
        "families": ["llama"],
        "parameter_size": "7B",
        "quantization_level": "Q4_0"
      }
    },
    {
      "name": "fixture-embed:latest",
      "model": "fixture-embed:latest",
      "modified_at": "2026-01-01T00:00:00Z",
      "size": 700000000,
      "digest": "fixture-digest-2",
      "details": {
        "format": "gguf",
        "family": "nomic-bert",
        "families": ["nomic-bert"],
        "parameter_size": "137M",
        "quantization_level": "F16"
      }
    }
  ]
}
`;

/** the openai compatible chat stream (the sse chunks of the streamed answer) — the exact text of the former tests/openaicompat-stream.txt. */
export const openaicompatstream = `data: {"id":"chatcmpl-fixture-1","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":"{\\"goal\\":"}}]}

data: {"id":"chatcmpl-fixture-1","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"\\"streamed answer\\","}}]}

data: {"id":"chatcmpl-fixture-1","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"\\"steps\\":[]}"}}]}

data: [DONE]

`;

/** the openai compatible chat completion answer (the choices with the message and the usage) — the exact text of the former tests/openaicompat-completion.json. */
export const openaicompatcompletion = `{
  "id": "chatcmpl-fixture-1",
  "object": "chat.completion",
  "created": 1800000000,
  "model": "fixture-model-a",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "{\\"goal\\":\\"open the docs page\\",\\"steps\\":[{\\"kind\\":\\"navigate\\",\\"target\\":\\"https://docs.example/guide\\",\\"summary\\":\\"open the guide\\"}],\\"openquestions\\":[]}"
      }
    }
  ],
  "usage": { "prompt_tokens": 34, "completion_tokens": 21, "total_tokens": 55 }
}
`;

/** the openai compatible model list (the fixture model shapes) — the exact text of the former tests/openaicompat-models.json. */
export const openaicompatmodels = `{
  "object": "list",
  "data": [
    {
      "id": "fixture-model-a",
      "object": "model",
      "owned_by": "fixture",
      "context_length": 8192,
      "modalities": ["text"]
    },
    { "id": "fixture-model-b", "object": "model", "owned_by": "fixture" }
  ]
}
`;

/** Every provider wire fixture keyed by its original file name, so the fixture server and the adapter suite answer by name wherever a lane walks the set. */
export const providerfixtures = {
  "anthropic-stream.txt": anthropicstream,
  "anthropic-completion.json": anthropiccompletion,
  "anthropic-models.json": anthropicmodels,
  "gemini-stream.txt": geministream,
  "gemini-completion.json": geminicompletion,
  "gemini-models.json": geminimodels,
  "ollama-stream.txt": ollamastream,
  "ollama-completion.json": ollamacompletion,
  "ollama-tags.json": ollamatags,
  "openaicompat-stream.txt": openaicompatstream,
  "openaicompat-completion.json": openaicompatcompletion,
  "openaicompat-models.json": openaicompatmodels,
} as const;
