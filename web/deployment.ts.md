# Static deployment contract

`web/` builds a static Vite artifact at `web/dist/public`. GitHub Pages sets `VITE_BASE_PATH` to the repository path. Netlify and Vercel use the default root base path and their included SPA fallback descriptors.

No platform functions, server routes, database credentials or runtime secrets are required by this artifact. The local DevThink CLI remains the optional paired gateway for provider communication.
