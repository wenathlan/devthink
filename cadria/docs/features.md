# cadria features

## Dependencies

- synchronized dependency union — the eleven family apps share one dependency tree: identical `dependencies`, `devDependencies` and `peerDependencies` (same keys, same versions, nothing removed, highest semver wins on conflicts) and one `engines` catalog with node as maestro and the V 0.5.2 seat as catalog annotation (@family wave/depssync).
