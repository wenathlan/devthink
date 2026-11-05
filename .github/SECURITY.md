# Security policy — the devthink family

The house answers security reports through the GitHub security advisories
channel of this repository (the private disclosure route):

- Report a vulnerability: https://github.com/wenathlan/devthink/security/advisories/new
- Track published advisories: https://github.com/wenathlan/devthink/security/advisories

## Scope

The policy covers the eleven applications of the family and the umbrella
repository — argan, cadria, cobaia, debonair, devthink, forge, foundry,
getry, saddle, stealthhead and vault — including their engines, the
release workflows, the container images and the published packages of the
@wenathlan scope on npmjs and GitHub Packages.

## Reporting

Report privately through the advisories channel above. The house answers
reports within 72 hours and credits researchers in the release notes of the
rung that ships the fix. Do not open public issues for vulnerabilities.

## Testing authorization

Probing the family sites (https://wenathlan.github.io/devthink/) is
authorized for research reported through the private channel, within the
scope above and without service disruption.

## The per-app policies

Each application of the family carries its own SECURITY.md beside its
sources — the same policy adapted to the surfaces each engine owns. The
code scanning battery (CodeQL, OSV, Trivy, Scorecard, TruffleHog) runs on
every push to main and on the weekly crons through
.github/workflows/security.yml.

## Versions

The policy covers the maintained 2.x line (currently 2.0.162).
