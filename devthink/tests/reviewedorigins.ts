/**
 * reviewedorigins.ts — the reviewed provider endpoint catalog of the
 * merged server and provider lineages as one dense typescript module: the
 * documented official endpoints the provider adapters and the antigravity
 * surface name as data rows of their default catalogs. Every endpoint stays
 * user configurable, none is a call target the code hardcodes, and the
 * catalog is the merge contract of the 2.0.0 grand merge (maene: the
 * provider default table; gateway: the cloud docs row). The sweep gate reads
 * this data module so the reviewed origins never ride as code literals.
 *
 * Provenance: migrated from devthink/artifacts/reviewedorigins.json when the
 * flat folder law dissolved the artifacts folder of the application first
 * layer — the rows stay data rows, only the carrier changed (json file →
 * typed module, the same doctrine the permbaseline module carries).
 */

/** The reviewed provider endpoint catalog: the documented official origins
 * the provider adapters and the antigravity surface name, one row per
 * endpoint, sorted alphabetically as the catalog records them. */
export interface reviewedoriginscatalog {
  origins: string[];
}

/** The reviewed origins of the merged lineages — the merge contract of the
 * 2.0.0 grand merge, pinned as data rows the sweep allowlist reads. */
export const reviewedorigins: reviewedoriginscatalog = {
  "origins": [
    "accounts.google.com",
    "antigravity-auto-updater-974169037036.us-central1.run.app",
    "antigravity-ide-auto-updater-974169037036.us-central1.run.app",
    "antigravity.google",
    "antigravity.google.com",
    "api.babel.town",
    "api.github.com",
    "api.groq.com",
    "api.kilo.ai",
    "api.mistral.ai",
    "api.openai.com",
    "api.x.ai",
    "api.xiaomimimo.com",
    "api.z.ai",
    "auth.devthink.pro",
    "auth.docker.io",
    "autoupdater.antigravity.google.com",
    "biomejs.dev",
    "bitbucket.org",
    "clients2.google.com",
    "cloud.google.com",
    "cloudflare-dns.com",
    "cloudcode-pa.googleapis.com",
    "crates.io",
    "dashscope-intl.aliyuncs.com",
    "developer.chrome.com",
    "developers.google.com",
    "devthink.pro",
    "gcr.io",
    "generativelanguage.googleapis.com",
    "git-lfs.github.com",
    "gitlab.com",
    "glm.babel.town",
    "hub.docker.com",
    "images.unsplash.com",
    "integrate.api.nvidia.com",
    "internal-api.z.ai",
    "jsr.io",
    "myaccount.google.com",
    "nodejs.org",
    "oauth2.googleapis.com",
    "opencode.ai",
    "openidconnect.googleapis.com",
    "openrouter.ai",
    "packagist.org",
    "pkg.go.dev",
    "pypi.org",
    "repo.packagist.org",
    "rubygems.org",
    "storage.googleapis.com",
    "translate.googleapis.com",
    "wenathlan.github.io",
    "www.googleapis.com",
    "www.sitemaps.org",
    "x"
  ]
};
