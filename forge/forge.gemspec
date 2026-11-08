Gem::Specification.new do |spec|
  spec.name = "forge"
  spec.version = ENV.fetch("FORGE_VERSION", "2.0.169")
  spec.authors = ["wenathlan"]
  spec.email = ["support@users.noreply.github.com"]
  spec.summary = "The forge documentation and tests envelope (the sandbox runner surface — the runners on the saddle engine boundary)."
  spec.description = "Distributes the forge documentation set and the tests directory as one Ruby gem. forge is the sandbox runner surface — the runners on the saddle engine boundary."
  spec.homepage = "https://github.com/wenathlan/devthink"
  spec.license = "GPL-3.0-only"
  spec.required_ruby_version = ">= 3.1"
  spec.files = Dir["README.md", "docs/**/*", "test/**/*"]
  spec.metadata["source_code_uri"] = "https://github.com/wenathlan/devthink"
  spec.metadata["homepage_uri"] = spec.homepage
end
