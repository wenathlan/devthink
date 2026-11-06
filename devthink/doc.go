// Package devthink carries the go module identity of the devthink envelope —
// the merged AI development workbench: the provider-owned gateway
// engine, the browser extension (the agent surface), the Antigravity
// engine and the workbench CLI — one product, one binary, one metadata.
//
// The goget wave seats the go module rung beside the maven, nuget,
// rubygems and gradle rungs: the module resolves at
// github.com/wenathlan/devthink/devthink/v2 through the
// proxy.golang.org chain, and the version answers the per-application
// tag (devthink/vX.Y.Z on the release commit) the publish lane syncs —
// the package carries no version constant the metadata lockstep would
// have to stamp, the same way the gradle marker reads the envelope
// package.json at build time.
package devthink

// ModulePath is the go module path the go get consumer resolves.
const ModulePath = "github.com/wenathlan/devthink/devthink/v2"

// Family is the distribution family every envelope of the monorepo answers.
const Family = "wenathlan"

// Description is the envelope summary the registry metadata carries.
const Description = "The DevThink single distribution: the library core, the cli, the headless entry and the mcp server the go get rung seats beside the registry lanes."
