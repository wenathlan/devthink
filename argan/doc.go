// Package argan carries the go module identity of the argan envelope —
// the DNS and gateway library of the wenathlan family: zones,
// records, dnssec and handshake.
//
// The goget wave seats the go module rung beside the maven, nuget,
// rubygems and gradle rungs: the module resolves at
// github.com/wenathlan/devthink/argan/v2 through the
// proxy.golang.org chain, and the version answers the per-application
// tag (argan/vX.Y.Z on the release commit) the publish lane syncs —
// the package carries no version constant the metadata lockstep would
// have to stamp, the same way the gradle marker reads the envelope
// package.json at build time.
package argan

// ModulePath is the go module path the go get consumer resolves.
const ModulePath = "github.com/wenathlan/devthink/argan/v2"

// Family is the distribution family every envelope of the monorepo answers.
const Family = "wenathlan"

// Description is the envelope summary the registry metadata carries.
const Description = "The argan documentation, site and tests envelope (the DNS and gateway library)."
