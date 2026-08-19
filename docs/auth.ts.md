# auth TypeScript conversion

This collection replaces legacy CJS, C++, Go, JavaScript, module-script, Python and shell authentication material with the official credential contract implemented by `config.ts`. Browser cookies, browser profiles, CAPTCHA material and automatic session capture are intentionally not represented.

```ts
/** Represents an explicitly user-supplied official provider credential. */
export type providerCredential = {
  kind: "api-key" | "bearer" | "oauth";
  value?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
};

/** Provides inert fixture data for documentation and tests only. */
export function createInertCredential(kind: providerCredential["kind"]): providerCredential {
  if (kind === "oauth") {
    return { kind, accessToken: "example_oauth_access_token_not_a_secret", refreshToken: "example_oauth_refresh_token_not_a_secret", expiresAt: 2_000_000_000_000 };
  }
  return { kind, value: kind === "bearer" ? "example_bearer_token_not_a_secret" : "example_api_key_not_a_secret" };
}

/** Rejects browser-session and anti-bot material from an authentication record. */
export function isOfficialCredentialShape(value: Record<string, unknown>): boolean {
  const forbidden = ["cookie", "cookies", "captcha", "fingerprint", "browserprofile", "sessiontoken", "useragent"];
  return !Object.keys(value).some((key) => forbidden.includes(key.toLowerCase()));
}
```

All examples are synthetic and nonfunctional. Users authenticate with their own official provider credential through `devthink auth login`.
