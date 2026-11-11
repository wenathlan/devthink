// The getry gradle distribution module (the gradleseat wave): the
// documentation envelope the maven lane ships as the com.wenathlan
// artifact rides the gradle rung under the com.wenathlan coordinates —
// the maven-publish plugin renders the module metadata
// (getry-<version>.module) beside the pom and the jar, so the gradle
// consumer resolves the same documentation set the maven consumer
// downloads from the same GitHub Packages registry under the one
// com.wenathlan coordinate the owner law stamps for both lanes.
// The releaseVersion property answers the lane override the way the pom
// revision property does, and the default reads the envelope package.json
// the metadata lockstep stamps — the module file carries no version
// literal the rung ladder would have to carry too.
plugins {
    `java`
    `maven-publish`
}

group = "com.wenathlan"

val envelopeVersion = file("package.json").readText()
    .let { Regex("\"version\"\\s*:\\s*\"([^\"]+)\"").find(it)?.groupValues?.get(1) }
    ?: error("the getry envelope package.json carries no version")
version = (findProperty("releaseVersion") as String?) ?: envelopeVersion

tasks.jar {
    from(layout.projectDirectory) {
        include("getry.kts")
        include("README.md")
        include("docs/**")
        include("test/**")
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
            pom {
                name.set("getry single distribution")
                description.set("The single getry gradle distribution: the documentation set and the tests directory embedded as jar resources in the one com.wenathlan.getry artifact. getry is the AI gateway — five provider gateways serving 35 OpenAI-compatible routes.")
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
