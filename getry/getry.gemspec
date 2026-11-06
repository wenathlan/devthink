Gem::Specification.new do |spec|
  spec.name = "getry"
  spec.version = ENV.fetch("GETRY_VERSION", "2.0.164")
  spec.authors = ["wenathlan"]
  spec.email = ["support@users.noreply.github.com"]
  spec.summary = "The getry documentation and tests envelope (the AI gateway — five provider gateways serving 35 OpenAI-compatible routes)."
  spec.description = "Distributes the getry documentation set and the tests directory as one Ruby gem. getry is the AI gateway — five provider gateways serving 35 OpenAI-compatible routes."
  spec.homepage = "https://github.com/wenathlan/devthink"
  spec.license = "GPL-3.0-only"
  spec.required_ruby_version = ">= 3.1"
  spec.files = Dir["README.md", "docs/**/*", "tests/**/*"]
  spec.metadata["source_code_uri"] = "https://github.com/wenathlan/devthink"
  spec.metadata["homepage_uri"] = spec.homepage
end
