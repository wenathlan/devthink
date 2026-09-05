# Models 2026

## Antigravity quota (default)

- antigravity-gemini-3-pro (low/high thinking)
- antigravity-gemini-3.1-pro (low/high)
- antigravity-gemini-3-flash (minimal/low/medium/high)
- antigravity-claude-sonnet-4-6
- antigravity-claude-opus-4-6-thinking (low/max budget 8192/32768)

## Gemini CLI quota (separate, used when cli_first:true or fallback)

- gemini-2.5-flash
- gemini-2.5-pro
- gemini-3-flash-preview
- gemini-3-pro-preview
- gemini-3.1-pro-preview
- gemini-3.1-pro-preview-customtools

Routing: antigravity-first default exhausts Antigravity quota across ALL accounts before Gemini CLI. cli_first reverses.

Name transform: antigravity-gemini-3-flash -> gemini-3-flash-preview for CLI API.
