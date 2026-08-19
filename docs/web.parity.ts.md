# Web and CLI parity

The web workbench provides a browser surface for local CLI records. It uses a temporary pairing session for gateway calls and never receives provider credentials.

| Web page | Gateway operation | CLI equivalent | Local-only boundary |
|---|---|---|---|
| `/providers` | `GET /providers`, `PATCH /providers/active` | `providers`, `config activeProvider <id>`, `auth login` | Credential entry stays CLI-only. |
| `/projects` | `GET /workspaces` | `projects`, `sessions list` | Projects are local workspaces until a separate sync service is configured. |
| `/usage` | `GET /usage` | `usage` | Shows local record counts, not provider billing. |
| `/routes` | `GET /health` and route index | `routes`, `gateway status` | Shows public browser and paired gateway paths only. |
| Workspace chat | `POST /sessions`, `POST /chat` | `chat`, `interactive` | Requires a current local pairing token. |

QR and WebAuthn may be added as user-interface and pairing enhancements. They do not imply a hosted account or cross-device data service without a separate authenticated API.
