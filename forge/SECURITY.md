# Security Policy — Forge (the execution clone)

## Supported release line

Security fixes target the maintained `2.x` family line and later maintained releases.

| Version | Supported |
| --- | --- |
| 2.0.x (the family ladder) | Yes |

## Scope

Forge is the deployable execution clone of the DevThink family: the pure binary runner surface in a sandbox with saddle — a leaf deploy unit the family never imports; it consumes the saddle engine and the vault storage as libraries. The Runner and sandbox surfaces read only the configuration and the data the operator supplies; nothing rides upstream without an operator-requested integration.

## Secrets and credentials

The public repository must not include provider keys, session cookies, database files, captured authorization headers or `.env` payloads. The runner executes only the binaries the operator stages; sandbox and registry credentials stay operator supplied and never committed. The CI secret-scan gate (TruffleHog with `--results=verified` over the full git history) and the Trivy filesystem scan (vuln, secret, misconfig) run on every push and pull request.

Private disclosure: do not publish exploit details in a public issue before maintainers have had a reasonable opportunity to investigate and coordinate a fix. Remove sensitive data from logs and send a minimal report through the repository's private security reporting channel at https://github.com/wenathlan/devthink/security/advisories/new. Revoke any credential that may have appeared in a local file or public commit before reporting. Security advisories and published fixes are tracked at https://github.com/wenathlan/devthink/security/advisories.

Security testing must be authorized by the owner of the target system. Development and CI scanning of artifacts is allowed within the project's own build and test environments. Unauthorized penetration testing, fuzzing, active scanning or credential probing of third-party systems is not allowed.

## Supply chain

- Security advisories for the npm package line are published at https://github.com/wenathlan/devthink/security/advisories.
- The version tag is the supply-chain contract for every GitHub Actions reference (the family standard: digests and checksums are computed on the GitHub runners at run time — release `SHA256SUMS` assets, GitHub-computed release-asset digests consumed as build args — never written into workflow files or the Dockerfile).
- The project records accepted risks, dependency advisories and remediation status in the security documentation and workflow reports.
