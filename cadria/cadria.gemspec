Gem::Specification.new do |spec|
  spec.name = "cadria"
  spec.version = ENV.fetch("CADRIA_VERSION", "2.0.65")
  spec.authors = ["wenathlan"]
  spec.email = ["support@users.noreply.github.com"]
  spec.summary = "The cadria documentation, site and tests envelope (the versawase engine home)."
  spec.description = "Distributes the cadria documentation set, the zero-build site and the tests directory as one Ruby gem. cadria is the video and image player, editor and studio; it houses the versawase engine at the folder root."
  spec.homepage = "https://github.com/wenathlan/devthink"
  spec.license = "GPL-3.0-only"
  spec.required_ruby_version = ">= 3.1"
  spec.files = Dir["README.md", "docs/**/*", "site/**/*", "tests/**/*"]
  spec.metadata["source_code_uri"] = "https://github.com/wenathlan/devthink"
  spec.metadata["homepage_uri"] = spec.homepage
end
