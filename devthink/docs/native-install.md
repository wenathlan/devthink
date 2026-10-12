# Native host bridge install walkthrough

This walkthrough installs the optional native messaging transport of the 1.1.85 family end to end. Nothing native runs until you install it: the transport ships deny by default, every path stays your choice, and the uninstall removes everything the install wrote.

## 1. Build the companion with plain node

```bash
node companion/build.mjs
```

The recipe reads `companion/main.mjs`, stamps the package version over the source build marker and writes `dist/companion.js` with the host manifest template beside it — no native compiler, no bundler binary and no network step. The companion ships as source plus this build command, never as a binary blob.

## 2. Record the install consent in the options page

Open the extension options, find the **Native host bridge** section, type the native host name (for example `com.your-domain.devthink`) and the user profile directory the installer writes into (for example `/home/you/.config/chromium-profile`), and grant the install consent. The gate explains the scope before any write: the companion process the manifest launches, the profile directory the manifest writes into and the extension origins the manifest allows. The extension itself never writes your profile — the reviewed cli installer performs the manifest write.

## 3. Write the host manifest with the reviewed installer

```bash
node dist/cli.js native install \
  --profile /home/you/.config/chromium-profile \
  --host com.your-domain.devthink \
  --extension-id <your-extension-id> \
  --companion /home/you/devthink/dist/companion.js \
  --consent true
```

The installer fills the generated extension id placeholder of the template, writes `/home/you/.config/chromium-profile/NativeMessagingHosts/com.your-domain.devthink.json` and refuses a system wide install without the explicit `--systemwide true` flag (a system install needs the deliberate flag and never both targets at once).

## 4. Attach the native port

Back in the options page, grant the transport consent (the first host attach is its own consent boundary), grant the call classes you want (read, interaction and sensitive stay separate grants) and the surfaces you want (the os dialog and notification surfaces each carry their own consent stamp — a desktop surface never opens from a class grant alone), then press **Attach native port**. The handshake frame rides the native port, the diagnostics line reports the companion build, the protocol version and the wsbridge port, and the **Diagnostics** button prints the full report.

## 5. Stop and uninstall

- The **Kill switch** button and the **Escape hatch** button stop every native call in one press — the port detaches, the wsbridge session closes and no frame crosses until the release.
- `node dist/cli.js native uninstall --profile /home/you/.config/chromium-profile --host com.your-domain.devthink` removes the host manifest and its preferences, and the extension returns to its deny by default posture.

The full protocol, the token model and the degradation posture live in docs/17.nativebridge.md.
