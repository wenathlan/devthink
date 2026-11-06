// The saddle gradle distribution module (the gradleseat wave): the
// engine envelope the maven lane ships as the com.wenathlan
// artifact rides the gradle rung under the com.wenathlan coordinates —
// the maven-publish plugin renders the module metadata
// (saddle-<version>.module) beside the pom and the jar, and the one real
// jar of the family compiles the Saddle.java adapter the maven envelope
// compiles (the io.wenathlan.saddle class assembles the engine CLI
// argument vectors; the release 17 compile target mirrors the maven
// compiler release the pom pins). The releaseVersion property answers
// the lane override the way the pom revision property does, and the
// default reads the envelope package.json the metadata lockstep stamps —
// the module file carries no version literal the rung ladder would have
// to carry too.
plugins {
    `java`
    `maven-publish`
}

group = "com.wenathlan"

val envelopeVersion = file("package.json").readText()
    .let { Regex("\"version\"\\s*:\\s*\"([^\"]+)\"").find(it)?.groupValues?.get(1) }
    ?: error("the saddle envelope package.json carries no version")
version = (findProperty("releaseVersion") as String?) ?: envelopeVersion

sourceSets.main {
    java.srcDir(layout.projectDirectory)
    java.include("Saddle.java")
}

tasks.compileJava {
    options.release.set(17)
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
            pom {
                name.set("Saddle")
                description.set("Binary computing engine that turns distributed storage into a publishable working set, carrying the merged virtual-hardware engine CLI adapter (the Saddle.java process surface).")
                url.set("https://github.com/wenathlan/saddle")
                licenses {
                    license {
                        name.set("GNU General Public License v3.0 only")
                        url.set("https://www.gnu.org/licenses/gpl-3.0.html")
                    }
                }
                scm {
                    url.set("https://github.com/wenathlan/saddle")
                    connection.set("scm:git:https://github.com/wenathlan/saddle.git")
                    developerConnection.set("scm:git:ssh://github.com/wenathlan/saddle.git")
                }
            }
        }
    }
}
