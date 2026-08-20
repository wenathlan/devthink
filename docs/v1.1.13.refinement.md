# DevThink v1.1.13 route and identity refinement

## Route diagnosis

The Vite build accepts `VITE_BASE_PATH=./` for a portable relative artifact. In that build, `import.meta.env.BASE_URL` becomes `./`. The current router turns that value into `.`, but Wouter needs an empty base for a relative static artifact. The router therefore must normalize both `/` and `./` to an empty base before matching Home at `/`.

## One person, two surfaces

The CLI owns the stable local person record:

| Field | Owner | Browser visibility | Purpose |
| --- | --- | --- | --- |
| `userId` | Local CLI identity | Read-only after pairing | Stable public identifier for the same local person. |
| `deviceId` | Local CLI identity | Read-only after pairing | Identifies the CLI device that owns the local database. |
| pairing ID and one-time code | Local CLI pairing store | Invitation only | Establishes a short-lived browser session; it is not an account password. |
| browser bearer token | Local CLI pairing store | `sessionStorage` only | Authorizes the temporary browser projection of that local person. |
| provider credentials | Local CLI auth store | Never visible | Remains CLI-only and is never synchronized to a browser. |

The browser must remove its separate generated `u_` profile. After pairing, it reads `GET /identity` from the same local gateway and uses the returned `userId` for the visible person context. All persisted workspace, session, tab, message, preference and provider-selection mutations already travel through the paired gateway and the CLI-owned `devthink.db`.

## Synchronization boundary

CLI and web can act on the same local identity and database when the browser is paired to the user-owned gateway. A static site cannot discover, read or mutate a different computer's local database by itself. Cross-device or always-online synchronization remains an optional future authenticated API service; it is not fabricated by GitHub Pages, browser storage or repository secrets.
