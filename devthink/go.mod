// The devthink go module marker (the goget wave): the single
// rich distribution the registry lanes ship (npmjs, the github npm
// registry, maven, nuget, gradle) rides the go get rung as the
// github.com/wenathlan/devthink/devthink/v2 module — the module
// path answers the github.com/wenathlan/devthink monorepo with the
// per-application subdirectory and the major version suffix the go
// semver law demands at the v2 line, and the version answers the
// per-application tag (devthink/vX.Y.Z on the release commit) the
// publish lane syncs — the go module registry carries no version
// literal the rung ladder would have to stamp, the same way the gradle
// marker reads the envelope package.json at build time.
module github.com/wenathlan/devthink/devthink/v2

go 1.27
