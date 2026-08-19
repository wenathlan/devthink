# DevThink mobile shells

This folder contains the Capacitor source boundary for Android and iOS. The workbench remains the single static UI source under `web/`; Bun builds it before Capacitor synchronizes the generated browser files into native shells.

Android releases can produce APK and AAB artifacts in GitHub Actions. Device-installable iOS IPA artifacts require caller-owned Apple signing credentials; without them, the workflow can produce only an explicitly labeled simulator build. Provider credentials remain in the local DevThink CLI and are not compiled into either mobile shell.
