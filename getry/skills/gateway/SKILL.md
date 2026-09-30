---
name: gateway
description: Publish the Getry gateway and the family deployable clones in any sandbox, starting from the release asset archive
---

# Gateway skill

This skill publishes the gateway application (Getry) and serves the three deployable clones the same way (vault, forge, foundry). The flow is deterministic: the same steps, in the same order, on every publication.

## Models

| Model | Where it runs | How it is born |
| --- | --- | --- |
| Getry (standard) | inside the Z.AI sandbox | the release asset archive, already in Next shape with src |
| Getry Next bypass | outside Z.AI (Vercel, Netlify, GitHub Pages, Caddy or any host) | the workflow Next conversion over the single Getry folder — no sandbox SDK, no captcha, no session, no chat ID, no dist folder, no public folder and none of the folders the platform usually creates; it is not a new application and does not duplicate a folder |

## The four steps

1. Download the asset archive — the release carries every shape of each site: the complete archive in the house shape, the Next standard and the Next personalized, each packed as tar.xz at the maximum xz level with the Brotli overlay riding on top. For the Z.AI sandbox use the Next standard archive of the gateway; for the other platforms the same archive works, because the conversion already puts the project in src.
2. Extract the archive at the sandbox root — nothing may stay nested: the package.json must sit at the root.
3. Push to the DB — with the Prisma schema in hand, run the migration (for example, `bunx prisma db push`) and confirm the tables; the builds and the data of the person stay recorded in this DB, and the backups rise to the DB sites and to the DB+sandbox site.
4. Build the Next — install the dependencies locked in the lockfile and run the build; the publish button of the platform finishes with the name the person chooses.

## Flow rules

- Nothing is hardcoded: no host, no credential, no key in the code; every configuration comes from environment variables (the .dev.vars file in wrangler dev, and the host variables in the deploy).
- The src folder is the only accepted exception to the root without src, and it exists because Next demands it; the house tree (correlated logic, the theme folder with a single CSS, the pages with the file quadruple) keeps holding inside it.
- The personalized variant inverts the exception: the app/ directory sits at the root and the src folder does not exist.
- Each sandbox publishes its own way, and the communication between the sites uses mime-types and HTTPS.
