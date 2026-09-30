# forge

deployable clone of execution only (the sandbox): runs any binary with the Saddle engine and stores nothing.

House tree: one folder per app, no src/ — the app root carries only the loose .ts logics, docs/ and tests/, and the theme folder (Sol/) carries the whole design: App.tsx (the router), index.html, index.css, the shared shell, one folder per page with loose TSX components, and the platform deploy copies. The complete site archive and the Next conversions (done by the workflow, no folder duplication) travel as tar.xz assets in the release.
