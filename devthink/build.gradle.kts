// The devthink gradle distribution module (the gradleseat wave): the
// single rich distribution the maven lane ships as the
// com.wenathlan artifact rides the gradle rung under the
// com.wenathlan coordinates — the maven-publish plugin renders the module
// metadata (devthink-<version>.module) beside the pom and the jar, the
// jar embeds every consumption mode the node build stages (the library
// core, the cli, the headless entry and the mcp server) and the
// publication attaches the extension and declarations classifier zips
// the build helper attaches for the maven consumer — the same GitHub
// Packages registry, never colliding with the com.wenathlan
// versions the maven lane owns. The releaseVersion property answers the
// lane override the way the pom revision property does, and the default
// reads the envelope package.json the metadata lockstep stamps — the
// module file carries no version literal the rung ladder would have to
// carry too.
plugins {
    `java`
    `maven-publish`
}

group = "com.wenathlan"

val envelopeVersion = file("package.json").readText()
    .let { Regex("\"version\"\\s*:\\s*\"([^\"]+)\"").find(it)?.groupValues?.get(1) }
    ?: error("the devthink envelope package.json carries no version")
version = (findProperty("releaseVersion") as String?) ?: envelopeVersion

tasks.jar {
    from(layout.projectDirectory.dir("build")) {
        include("index.js")
        include("index.cjs")
        include("devthink.umd.js")
        include("checksums.txt")
        include("cli.js")
        include("headless.js")
        include("mcp.js")
        include("server.js")
        include("http.js")
    }
}

publishing {
    repositories {
        maven {
            name = "GitHubPackages"
            url = uri("https://maven.pkg.github.com/wenathlan/devthink")
            credentials {
                username = System.getenv("GITHUB_ACTOR") ?: ""
                password = System.getenv("GITHUB_TOKEN") ?: ""
            }
        }
    }
    publications {
        create<MavenPublication>("maven") {
            from(components["java"])
            artifact(layout.buildDirectory.file("devthink${version}.zip").get()) {
                classifier = "extension"
                extension = "zip"
            }
            artifact(layout.buildDirectory.file("devthink-declarations-${version}.zip").get()) {
                classifier = "declarations"
                extension = "zip"
            }
            pom {
                name.set("DevThink single distribution")
                description.set("The single DevThink gradle distribution: every consumption mode — the library core, the cli, the headless entry and the mcp server — embedded as jar resources in the one com.wenathlan.devthink artifact, with the extension zip and the declarations zip attached as classifier artifacts beside it.")
                url.set("https://github.com/wenathlan/devthink")
                licenses {
                    license {
                        name.set("GPL-3.0-only")
                        url.set("https://www.gnu.org/licenses/gpl-3.0.html")
                    }
                }
                scm {
                    url.set("https://github.com/wenathlan/devthink")
                    connection.set("scm:git:https://github.com/wenathlan/devthink.git")
                }
            }
        }
    }
}
