# Saddle

**Storage-backed jobs, ninety sandbox modalities and portable runners for Node.js.**
**Binary computing engine, agent browser, sandbox plane and packager.**

> **Core idea:** storage is the durable side of the working set; the runner is replaceable; the artifact is the boundary. **Storage == Compute** means that the same bytes can be retained or processed according to an explicit usage flag.

Saddle is a **TypeScript-first ESM engine** compiled to JavaScript, declarations and source maps for jobs that move data between storage, a bounded working set, a caller-injected runner and durable artifacts. It is also a virtual machine published as a package: the caller can run it on GitHub Actions, Forgejo, Gitea, GitLab, Codeberg, Docker or another third-party compute surface. The engine does not require the operator's local machine, does not embed credentials and does not choose a mandatory cloud provider.

| Surface | Files |
| --- | --- |
| `server.ts`, `sandbox.ts` | the zero-dependency self-hosted API of the 2.0.182 grand-merge envelope (`node server.ts`; the api answers its version at `/api/v1/health`) and the browser-pure engine port |

The consolidated documentation of the whole operation lives in [`devthink/docs`](../devthink/docs) — the law, the operation state, the apps dossier, the security census and the checklist. This README is the envelope surface the release lane stamps; the five documents carry the whole corpus.
