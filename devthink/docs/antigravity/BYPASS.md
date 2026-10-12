# Gemini CLI Bypass - Secret

## The Secret: Same Identification JSON as Gemini CLI

To bypass project ID requirement and PIK check, use same identification as Gemini CLI:

```json
{
  "client_id": "681255809395-oo8f…b135j.apps.googleusercontent.com",
  "client_secret": "GOCSPX-4uHgMPm…lXFsxl",
  "scopes": [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ]
}
```

### Headers - Must Match Gemini CLI Exactly

```
User-Agent: GeminiCLI/0.35.3/gemini-3-pro-preview (linux; x64; GitHub) google-api-nodejs-client/9.15.1
X-Goog-Api-Client: gl-node/22.19.0 gccl/0.9.2 gl-node/22.19.0
Client-Metadata: ideType=IDE_UNSPECIFIED,platform=PLATFORM_UNSPECIFIED,pluginType=GEMINI
Content-Type: application/json
Accept: application/json
```

### Why it bypasses?

- `IDE_UNSPECIFIED` + `PLATFORM_UNSPECIFIED` + `PLUGIN_TYPE=GEMINI` -> official CLI branch on backend
- Removing `X-Goog-User-Project` for CLI models avoids 404 cascade (#233)
- Using prod endpoint only (not sandbox) for gemini-cli models
- FNV-1a deterministic session_id avoids device hopping detection

### Endpoints

- https://cloudcode-pa.googleapis.com/v1internal:loadCodeAssist
- https://daily-cloudcode-pa.googleapis.com/v1internal:loadCodeAssist (real quota)
- https://cloudcode-pa.googleapis.com/v1internal:generateContent
- https://cloudcode-pa.googleapis.com/v1internal:streamGenerateContent
- https://cloudcode-pa.googleapis.com/v1internal:retrieveUserQuotaSummary
- Fallback project: rising-fact-p41fc

### Comparison with 9router/n9router/omniroute

| Feature | This plugin | 9router | n9router | omniroute |
|---------|-------------|---------|----------|-----------|
| Bypass method | Gemini CLI headers | MITM proxy | MITM+Token Rotate | Gateway |
| Client ID | Gemini CLI official | Custom | Antigravity | Various |
| User-Agent | GeminiCLI/0.35.3 | Varies | Antigravity | Varies |
| Zero deps | Yes node:* | No | No | No |
| Multi-account | Yes rotation | Yes | Yes RR/sticky | Yes |
| OpenCode native | Yes | Via endpoint | Via DNS | Via endpoint |

### Anti-ban features (from fares fork)

- Electron browser-style User-Agents randomized OS/version
- Expanded platform pool (Windows/macOS/Linux) coherent UA metadata
- Request micro-jitter 0-80ms
- Velocity tracking
- FNV-1a sessionId deterministic
- Soft quota 90% protection

