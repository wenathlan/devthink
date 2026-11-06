Gem::Specification.new do |spec|
  spec.name = "foundry"
  spec.version = ENV.fetch("FOUNDRY_VERSION", "2.0.166")
  spec.authors = ["wenathlan"]
  spec.email = ["support@users.noreply.github.com"]
  spec.summary = "The foundry documentation and tests envelope (the e2b and docker clone interface — sandboxes and images while the engine lives in saddle)."
  spec.description = "Distributes the foundry documentation set and the tests directory as one Ruby gem. foundry is the e2b and docker clone interface — sandboxes and images while the engine lives in saddle."
  spec.homepage = "https://github.com/wenathlan/devthink"
  spec.license = "GPL-3.0-only"
  spec.required_ruby_version = ">= 3.1"
  spec.files = Dir["README.md", "docs/**/*", "tests/**/*"]
  spec.metadata["source_code_uri"] = "https://github.com/wenathlan/devthink"
  spec.metadata["homepage_uri"] = spec.homepage
end
