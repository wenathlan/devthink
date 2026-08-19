# Security Policy

## Supported release line

Security fixes target the maintained `1.1.x` line and later maintained releases.

## Supported authentication

DevThink supports API keys, bearer credentials, and provider-specific documented HTTP authentication supplied by the operator through environment variables or local configuration. Credentials remain local and are redacted from status output, session exports, and error messages.

The public repository must not include `auth.json`, local SQLite records, pairing records, Git-history archives, provider keys, browser cookies or captured authorization headers.

## Explicitly unsupported behavior

DevThink does not capture browser cookies, replay third-party web sessions, solve or bypass CAPTCHA, forge device or browser fingerprints, intercept private web traffic, or rely on undocumented endpoints. If a provider requires an interactive login or presents an anti-bot challenge, the supported path is to use that provider’s official API, OAuth flow, or an explicit user-managed base URL.

## Reporting a vulnerability

Do not open a public issue containing credentials, session cookies, private URLs, or exploit details. Remove sensitive data from logs and send a minimal report through the repository’s private security reporting channel. Revoke any credential that may have appeared in a local file or public commit before reporting.

## Static web boundary

GitHub Pages hosts only the static workbench. It does not embed provider credentials or host a shared user database; a browser communicates with a separately running local loopback gateway through explicit short-lived pairing.
