# Deprecation policy

This document defines the deprecation policy of the protocolv2 api freeze and the sunset process every deprecated field follows until 2.0.0. The window opened with the 1.1.91 release and closed at 2.0.0: inside the window a deprecated field stayed accepted, warned exactly once per session and carried its sunset release here; at the sunset release the field removed and a client that still sends it answers the strict refusal. The 2.0.0 sunset executed the policy in full — both fields the window carried removed at their sunset, the strict refusal applies to clients still sending them, and the window record (1.1.91 to 2.0.0) stands below as history.

## The sunset process

One field joins the deprecation registry in `apifreeze.ts` only through a release that names the deprecation, its notice and its sunset release in the changelog. The registry entry carries the surface, the field name, the plain language notice and the sunset release — 2.0.0 for every entry of this window, because the deprecation window spans the release candidates until 2.0.0. `docs/deprecation.md` renders the registry verbatim, the freeze artifact hashes it, and the `warnonce` rule logs one warning per session per field: the first sighting of a deprecated field in one session answers its notice and every later sighting of the same field stays silent, exactly the one warning per session the window promises. The umd shim of the uppercase `Devthink` global set the precedent in the 1.1.66 family; the freeze generalizes the rule to every deprecated field.

At the sunset release the field removes from the registry and from the code, the removal names its changelog entry, and a client that still sends the field answers the strict schema refusal — unknown fields refuse before dispatch for every protocol major the line accepts. The registry now stays empty until a future release opens a new window the same way this one opened: a changelog entry that names the deprecations, their notices and their sunset releases.

## The deprecated fields of the window

The registry is empty: the 2.0.0 sunset removed every entry the window carried. The table records what the window carried and where each field went.

| Surface | Field | Sunset release | Where the field went |
| --- | --- | --- | --- |
| umd | `Devthink` | 2.0.0 | The uppercase global shim left the umd envelope: the build emits the lowercase `devthink` global only, and a script tag that still reads the uppercase global meets an undefined reference instead of the shim. |
| mcp | `protocolversion` | 2.0.0 | The client capability set declares the numeric `protocolmajor`: the full version string the version one clients exchanged parses nowhere, a client that declares major one refuses below the supported floor, and a frame that still carries the string meets the strict unknown field refusal of the schema layer. |

## The window and the migration path

The window opened at 1.1.91 and closed at 2.0.0, and the record stays as history. Inside the window a version one client stayed a first class consumer: the negotiation answered major one with the deprecation notice riding the agreement, unknown fields tolerated on the version one line while strict mode refused them for protocol version two, and every deprecated field warned once per session. Nothing a version one client sent silently broke inside the window — the freeze promised additive changes only, so the removal happened exactly at the sunset release the registry named.

At the sunset the window closed: the negotiation refuses a version one declaration below the supported floor with the conversion path inside the refusal, the strict unknown field refusal answers every major the line accepts, and a client that still sends a deprecated field answers the strict refusal. The migration path carries version one assets forward: the migrateplan command converts version one plans into protocolv2 plans, the automa, selenium, ui vision and tabular importers cover the automation assets authored outside devthink — every importer converts first and never executes anything outside the normal consent gates — and `docs/migrationguide.md` records the upgrade steps. See `docs/13.evolutionroadmap.md` for the 1.1.92 section and the 2.0.0 items that carry the migration tools.
