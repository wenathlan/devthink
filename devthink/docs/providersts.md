# providers TypeScript conversion

This collection replaces CJS, Go, JavaScript, module-script, Python and shell provider material with typed protocol adapters. Provider endpoints are selected from user configuration and official defaults; credentials are read at runtime from `auth.json` or user-controlled environment variables.

```ts
/** Enumerates the public provider wire formats normalized by DevThink. */
export type providerProtocol = "openai" | "anthropic" | "google";

/** Describes one provider endpoint without carrying a credential value. */
export type providerEndpoint = {
  id: string;
  protocol: providerProtocol;
  baseUrl: string;
};

/** Adds bounded exponential retry timing for transient provider failures. */
export function retryDelay(attempt: number, baseMs = 250, maximumMs = 4_000): number {
  return Math.min(maximumMs, baseMs * 2 ** Math.max(0, attempt));
}

/** Removes an accidental bearer value from an error message before display. */
export function redactProviderError(message: string): string {
  return message.replace(/bearer\s+[^\s]+/gi, "bearer [redacted]").slice(0, 500);
}
```

The implementation targets are `providers.ts` and `stream.ts`. CAPTCHA solving, cookie collection, fingerprint generation and hidden-browser flows are excluded.
