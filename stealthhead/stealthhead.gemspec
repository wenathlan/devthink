Gem::Specification.new do |spec|
  spec.name = "stealthhead"
  spec.version = ENV.fetch("STEALTHHEAD_VERSION", "2.0.94")
  spec.authors = ["wenathlan"]
  spec.email = ["support@users.noreply.github.com"]
  spec.summary = "The stealthhead documentation and tests envelope (the FPS game platform)."
  spec.description = "Distributes the stealthhead documentation set and the tests directory as one Ruby gem. stealthhead is the FPS game platform — only game logics (match, ranking, weapons, world); the versawase and audio engines ride the published library."
  spec.homepage = "https://github.com/wenathlan/devthink"
  spec.license = "GPL-3.0-only"
  spec.required_ruby_version = ">= 3.1"
  spec.files = Dir["README.md", "docs/**/*", "tests/**/*"]
  spec.metadata["source_code_uri"] = "https://github.com/wenathlan/devthink"
  spec.metadata["homepage_uri"] = spec.homepage
end
