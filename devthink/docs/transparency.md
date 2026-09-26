# Transparency page

The transparency page (`transparencypage.html`, rendered from the `transparencypage` surface template of the one web design file `web/index.html` and served by `transparencypage.ts`) is the single surface that answers every question a user can ask about what the extension holds, what it asked for and what it did. The 1.1.95 security hardening release completes it: the page now lists every permission with its consuming surface, every stored data kind with its location and its purge and export links, and the audit trail integrity result, beside the grants, the consent sessions, the senders, the permdiffs and the safedefaults it already carried. The page runs entirely offline: no external request ever leaves it, and the copy stays plain language reviewed for a non technical reader.

## Sections

- **active grants**: every granted origin with its scope, its boundary and its grant date, with a revoke action beside every row.
- **consent session history**: every consent window ever granted with its origin, its state, its boundary, its start time and its expiry — the active consent sessions answer at a glance with the time they expire.
- **permissions and consuming surfaces**: every manifest permission (required, optional or optional host) with the surface the frozen capability manifest coverage names as its consumer and the message and action kind counts that consume it, so the page answers which surface consumes every permission the manifest requests.
- **stored data kinds**: every inventory entry with its data class, its record count, its byte size and its local storage key — with a purge action per kind that asks for the typed confirmation phrase and one export action that returns all stored data in a single archive.
- **audit trail integrity**: the loghash chain verification result of every stored run log — the chained entry count, the seal hash with its time when the log sealed, or the broken link index with its reason when tamper evidence exists.
- **allowed external senders**: every connectallow entry with its display name, its sender id, its origin and its add date, with a remove action and an add form; the list ships empty by default.
- **permission diffs**: the permdiff of every installed update with its from and to versions, its added and removed permissions and its computed time; the audit trail records the permission set hash of every release beside the diff.
- **safedefaults applications**: every origin that received the safe defaults profile on first sight with its first seen date and the read only, sensitive denied posture.
- **the vault**: the secretvault labels with their scope, provenance and dates — the value never displays and never exports; the vault manages entries with add, label and delete only.
- **the ratelimit, phishguard and redact controls**: the deferred commands waiting for a bucket reset, the phish verdicts with their distances and thresholds and the redactshot regions with their geometry — the transparency page is also the surface that manages these consent scoped controls.

## The transparency export

The export action returns the whole transparency report (grants, consent sessions, permissions, data kinds, integrity results, senders, permdiffs, safedefaults and vault labels) through the masking and redaction pass of the 1.1.95 hardening: the shape masking covers every typed field of the report while the redact regions of the origin mark the capture derived entries, so an export the page issues leaves the device with the same masking and redaction the captures carry. The export carries the permdiff history that serves the incident reviews until the 2.0 security guide lands.

## Offline posture

The page issues no external request: every section renders from the background's one memory read per view, the only actions it offers talk to the background through the reviewed runtime messages, and the strict content security policy (`script-src 'self'; object-src 'self'; frame-ancestors 'self'`) pins its scripts to the package. The options page embeds the transparency page as its own frame — the only framing the policy allows.

The copy of every section stays plain language: each row reads as one sentence a non technical reviewer can parse, every refusal explains its reason, and no field name appears without its plain meaning.
