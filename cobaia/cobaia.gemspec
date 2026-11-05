Gem::Specification.new do |spec|
  spec.name = "cobaia"
  spec.version = ENV.fetch("COBAIA_VERSION", "2.0.162")
  spec.authors = ["wenathlan"]
  spec.email = ["support@users.noreply.github.com"]
  spec.summary = "The cobaia documentation and tests envelope (the monetization surface — the plans, the support rails and the honest advertisement slots)."
  spec.description = "Distributes the cobaia documentation set and the tests directory as one Ruby gem. cobaia is the monetization surface — the plans, the support rails and the honest advertisement slots."
  spec.homepage = "https://github.com/wenathlan/devthink"
  spec.license = "GPL-3.0-only"
  spec.required_ruby_version = ">= 3.1"
  spec.files = Dir["README.md", "docs/**/*", "tests/**/*"]
  spec.metadata["source_code_uri"] = "https://github.com/wenathlan/devthink"
  spec.metadata["homepage_uri"] = spec.homepage
end
