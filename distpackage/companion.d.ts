/** The companion module of the 1.1.98 consolidation: the native host runtime interned in this one typescript module, so the companion family carries one source file the plain node recipe of the build compiles, stamps and ships beside the dist targets — never a binary blob, never a hand maintained runtime file. */
/** The host manifest template the build stamps and emits as dist/nativehost.template.json: the chromium native messaging host manifest of the optional companion process, with the placeholders the installer fills (the host name, the companion path and the generated extension id) and the version placeholder the build stamps. */
export declare const nativehosttemplatejson = "{\n  \"name\": \"__native_host_name__\",\n  \"description\": \"The devthink companion process: an optional native host that speaks length prefixed json over stdio and never runs until the user installs it.\",\n  \"path\": \"__companion_path__\",\n  \"type\": \"stdio\",\n  \"allowed_origins\": [\n    \"chrome-extension://__generated_extension_id__/\"\n  ],\n  \"devthinkBanner\": \"devthink __devthink_version__ native host manifest template \u2014 GPL-3.0-only \u2014 the chromium host manifest of the optional companion process\"\n}\n";
/** The native frame shape the companion speaks: every frame carries its kind and correlation id with an optional body. */
interface nativeframe {
    kind: string;
    correlationid: string;
    body?: Record<string, unknown>;
}
/** The build stamp of the companion: the build recipe replaces the source marker with the package version, so the handshake reports the version of the build that shipped. */
export declare const companionbuild = "source";
/** The native bridge protocol major version this companion speaks: the handshake reports it and the upgrade path keeps compatibility for exactly one major version. */
export declare const companionprotocol = 1;
/** The native surfaces this companion exposes behind consent: the os dialog surface of the sensitive call class and the notification surface of the interaction call class. */
export declare const companionsurfaces: readonly string[];
/** Encodes one native message as the length prefixed json the chromium native messaging protocol carries: the four byte little endian length rides ahead of the utf8 payload. */
export declare function encodenativemessage(frame: nativeframe): Buffer;
export {};
//# sourceMappingURL=companion.d.ts.map